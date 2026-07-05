import fastify, {
  type FastifyInstance,
  type FastifyReply,
  type FastifyServerOptions,
  type FastifyRequest
} from "fastify";
import multipart from "@fastify/multipart";
import { Octokit } from "@octokit/rest";
import { OpenAIReviewProvider, type AIReviewProvider } from "@aegisiac/ai";
import {
  InMemoryPlanRunRepository,
  PlanRunService,
  type ApprovalDecision,
  type PlanRunRecord,
  type PlanRunRepository
} from "./service.js";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";

interface BuildAppOptions {
  logger?: FastifyServerOptions["logger"] | undefined;
  repository?: PlanRunRepository | undefined;
  aiProvider?: AIReviewProvider | undefined;
  staticRoot?: string | undefined;
}

interface IdParams {
  id: string;
}

interface ApprovalBody {
  decision?: ApprovalDecision | undefined;
  reviewer?: string | undefined;
  reason?: string | undefined;
}

interface IngestJsonBody {
  plan?: unknown;
  metadata?: Record<string, unknown> | undefined;
  source?: string | undefined;
  [key: string]: unknown;
}

interface DemoGateDecisionBody {
  decision?: "approved" | "rejected" | "pending" | undefined;
  repository?: string | undefined;
  pullRequest?: number | string | undefined;
  sha?: string | undefined;
  reviewer?: string | undefined;
  reason?: string | undefined;
  targetUrl?: string | undefined;
  context?: string | undefined;
}

type MultipartPart =
  | {
      type: "file";
      fieldname: string;
      filename: string;
      mimetype: string;
      file: NodeJS.ReadableStream;
    }
  | {
      type: "field";
      fieldname: string;
      value: unknown;
    };

const staticTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parseJsonObject(value: unknown): Record<string, unknown> {
  if (isRecord(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = JSON.parse(value) as unknown;
    return isRecord(parsed) ? parsed : {};
  }

  return {};
}

function parsePlanValue(value: unknown): unknown {
  if (typeof value === "string") {
    return JSON.parse(value) as unknown;
  }

  return value;
}

async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
  const chunks: Buffer[] = [];

  for await (const chunk of stream as AsyncIterable<Buffer | string>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf8");
}

async function readMultipartIngest(request: FastifyRequest): Promise<{
  plan: unknown;
  metadata: Record<string, unknown>;
}> {
  const fields: Record<string, unknown> = {};
  const files: Array<Record<string, unknown>> = [];
  let planText: string | undefined;

  for await (const part of request.parts() as AsyncIterable<MultipartPart>) {
    if (part.type === "file") {
      const content = await streamToString(part.file);
      files.push({
        fieldname: part.fieldname,
        filename: part.filename,
        mimetype: part.mimetype,
        size: Buffer.byteLength(content)
      });

      if (!planText || part.fieldname === "plan" || part.fieldname === "file") {
        planText = content;
      }
    } else {
      fields[part.fieldname] = part.value;
    }
  }

  const plan = planText ? parsePlanValue(planText) : parsePlanValue(fields.plan);
  if (!plan) {
    throw new Error("Multipart request must include a plan file or plan field.");
  }

  const metadata: Record<string, unknown> = {
    ...fields,
    ...parseJsonObject(fields.metadata),
    files
  };
  delete metadata.plan;

  return { plan, metadata };
}

function readJsonIngest(body: unknown): { plan: unknown; metadata: Record<string, unknown>; source: string } {
  if (!isRecord(body)) {
    return { plan: body, metadata: {}, source: "json" };
  }

  const ingestBody = body as IngestJsonBody;
  const plan = Object.hasOwn(ingestBody, "plan") ? ingestBody.plan : body;
  const metadata = { ...body, ...parseJsonObject(ingestBody.metadata) };
  delete metadata.plan;
  delete metadata.metadata;
  delete metadata.source;
  const source = ingestBody.source ?? "json";

  return { plan, metadata, source };
}

function planRunResponse(record: PlanRunRecord): Record<string, unknown> {
  return {
    id: record.id,
    status: record.status,
    source: record.source,
    planHash: record.planHash,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    metadata: record.metadata,
    terraform: {
      formatVersion: record.parsedPlan.formatVersion,
      terraformVersion: record.parsedPlan.terraformVersion,
      resourceChangeCount: record.parsedPlan.resourceChanges.length
    },
    risk: record.risk,
    aiReview: record.aiReview,
    githubCheck: record.githubCheck,
    approvals: record.approvals
  };
}

function missingPlanRun(reply: FastifyReply): void {
  reply.code(404).send({ error: "plan_run_not_found" });
}

function resolveStaticAsset(staticRoot: string, url: string | undefined): string {
  const cleanPath = decodeURIComponent((url ?? "/").split("?")[0] ?? "/");
  const requested = normalize(join(staticRoot, cleanPath));

  if (!requested.startsWith(staticRoot)) {
    return join(staticRoot, "index.html");
  }

  if (existsSync(requested) && statSync(requested).isFile()) {
    return requested;
  }

  return join(staticRoot, "index.html");
}

function registerStaticFallback(app: FastifyInstance, staticRootInput: string | undefined): void {
  if (!staticRootInput) {
    return;
  }

  const staticRoot = resolve(staticRootInput);
  app.setNotFoundHandler(async (request, reply) => {
    if (request.url.startsWith("/v1/")) {
      return reply.code(404).send({ error: "not_found" });
    }

    const file = resolveStaticAsset(staticRoot, request.url);
    const ext = extname(file);
    const cacheControl = file.includes("/assets/") ? "public, max-age=31536000, immutable" : "no-store";

    return reply
      .header("Cache-Control", cacheControl)
      .type(staticTypes[ext] ?? "application/octet-stream")
      .send(createReadStream(file));
  });
}

function parseRepositoryFullName(value: string): { owner: string; repo: string } {
  const [owner, repo] = value.split("/");
  if (!owner || !repo) {
    throw new Error("Repository must use owner/name format.");
  }

  return { owner, repo };
}

function parsePullRequestNumber(value: number | string): number {
  const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("Pull request number must be a positive integer.");
  }

  return parsed;
}

function statusForDecision(decision: NonNullable<DemoGateDecisionBody["decision"]>): "pending" | "success" | "failure" {
  if (decision === "approved") {
    return "success";
  }

  if (decision === "rejected") {
    return "failure";
  }

  return "pending";
}

function descriptionForDecision(
  decision: NonNullable<DemoGateDecisionBody["decision"]>,
  reviewer: string | undefined
): string {
  if (decision === "approved") {
    return `Approved in Isengard${reviewer ? ` by ${reviewer}` : ""}.`.slice(0, 140);
  }

  if (decision === "rejected") {
    return `Changes requested in Isengard${reviewer ? ` by ${reviewer}` : ""}.`.slice(0, 140);
  }

  return "Waiting for Isengard approval before merge.".slice(0, 140);
}

function assertDemoApprovalAuthorized(request: FastifyRequest): void {
  const requiredToken = process.env.ISENGARD_APPROVAL_TOKEN;
  if (!requiredToken) {
    return;
  }

  const authorization = request.headers.authorization;
  const headerToken = request.headers["x-isengard-approval-token"];
  const bearerToken = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : undefined;
  const suppliedToken = Array.isArray(headerToken) ? headerToken[0] : headerToken;

  if (bearerToken !== requiredToken && suppliedToken !== requiredToken) {
    throw new Error("Approval token is missing or invalid.");
  }
}

async function publishDemoGateStatus(body: DemoGateDecisionBody): Promise<Record<string, unknown>> {
  const token = process.env.ISENGARD_GITHUB_TOKEN ?? process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("ISENGARD_GITHUB_TOKEN or GITHUB_TOKEN is required to update GitHub PR status.");
  }

  const repository = body.repository ?? process.env.ISENGARD_DEMO_REPOSITORY ?? "bshamloufard/aegisiac-demo-actions-wall";
  const pullRequest = parsePullRequestNumber(body.pullRequest ?? process.env.ISENGARD_DEMO_PULL_REQUEST ?? "1");
  const context = body.context ?? process.env.ISENGARD_CHECK_CONTEXT ?? "isengard/plan-review";
  const decision = body.decision ?? "pending";
  const { owner, repo } = parseRepositoryFullName(repository);
  const octokit = new Octokit({ auth: token });

  let sha = body.sha;
  if (!sha) {
    const pull = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: pullRequest
    });
    sha = pull.data.head.sha;
  }

  const targetUrl =
    body.targetUrl ??
    process.env.ISENGARD_PUBLIC_URL ??
    "https://isengard-environment-ui-production.up.railway.app/";

  const status = await octokit.rest.repos.createCommitStatus({
    owner,
    repo,
    sha,
    state: statusForDecision(decision),
    target_url: targetUrl,
    description: descriptionForDecision(decision, body.reviewer),
    context
  });

  return {
    repository,
    pullRequest,
    sha,
    context,
    state: status.data.state,
    targetUrl: status.data.target_url,
    description: status.data.description,
    statusUrl: status.data.url
  };
}

export async function buildApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
  const app = fastify({ logger: options.logger ?? false });
  const repository = options.repository ?? new InMemoryPlanRunRepository();
  const aiProvider = options.aiProvider ?? new OpenAIReviewProvider();
  const service = new PlanRunService(repository, aiProvider);

  await app.register(multipart, {
    limits: {
      fileSize: 25 * 1024 * 1024,
      files: 2,
      parts: 24
    }
  });

  app.get("/v1/health", async () => ({
    status: "ok",
    service: "isengard-api",
    time: new Date().toISOString()
  }));

  app.get("/v1/demo/pr-gate", async () => ({
    repository: process.env.ISENGARD_DEMO_REPOSITORY ?? "bshamloufard/aegisiac-demo-actions-wall",
    pullRequest: parsePullRequestNumber(process.env.ISENGARD_DEMO_PULL_REQUEST ?? "1"),
    context: process.env.ISENGARD_CHECK_CONTEXT ?? "isengard/plan-review",
    approvalTokenRequired: Boolean(process.env.ISENGARD_APPROVAL_TOKEN)
  }));

  app.post<{ Body: DemoGateDecisionBody }>("/v1/demo/pr-gate/decision", async (request, reply) => {
    try {
      assertDemoApprovalAuthorized(request);
      const result = await publishDemoGateStatus(request.body ?? {});
      return reply.code(201).send({ gate: result });
    } catch (error) {
      request.log.warn({ error }, "Demo PR gate update failed");
      return reply.code(400).send({
        error: "github_gate_update_failed",
        message: error instanceof Error ? error.message : "Unable to update GitHub PR gate."
      });
    }
  });

  app.post<{ Body: IngestJsonBody }>("/v1/ingest/plan", async (request, reply) => {
    try {
      const multipartRequest = request.isMultipart();
      const input = multipartRequest
        ? { ...(await readMultipartIngest(request)), source: "multipart" }
        : readJsonIngest(request.body);
      const record = await service.ingestPlan(input);

      return reply.code(202).send({ planRun: planRunResponse(record) });
    } catch (error) {
      request.log.warn({ error }, "Plan ingest failed");
      return reply.code(400).send({
        error: "invalid_plan_ingest",
        message: error instanceof Error ? error.message : "Invalid plan ingest payload."
      });
    }
  });

  app.get<{ Params: IdParams }>("/v1/plan-runs/:id", async (request, reply) => {
    const record = service.getPlanRun(request.params.id);
    if (!record) {
      missingPlanRun(reply);
      return;
    }

    return { planRun: planRunResponse(record) };
  });

  app.get<{ Params: IdParams }>("/v1/plan-runs/:id/graph", async (request, reply) => {
    const record = service.getPlanRun(request.params.id);
    if (!record) {
      missingPlanRun(reply);
      return;
    }

    return { graph: record.graph };
  });

  app.post<{ Params: IdParams; Body: ApprovalBody }>(
    "/v1/plan-runs/:id/approvals",
    async (request, reply) => {
      const decision = request.body?.decision;
      if (decision !== "approved" && decision !== "rejected") {
        return reply.code(400).send({ error: "invalid_approval_decision" });
      }

      const record = service.addApproval(request.params.id, {
        decision,
        reviewer: request.body.reviewer,
        reason: request.body.reason
      });

      if (!record) {
        missingPlanRun(reply);
        return;
      }

      return reply.code(201).send({ approvals: record.approvals });
    }
  );

  app.post<{ Body: unknown; Headers: { "x-github-event"?: string; "x-github-delivery"?: string } }>(
    "/v1/webhooks/github",
    async (request) => ({
      received: true,
      event: request.headers["x-github-event"] ?? "unknown",
      delivery: request.headers["x-github-delivery"] ?? null
    })
  );

  registerStaticFallback(app, options.staticRoot);

  return app;
}
