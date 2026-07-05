import fastify, {
  type FastifyInstance,
  type FastifyReply,
  type FastifyServerOptions,
  type FastifyRequest
} from "fastify";
import multipart from "@fastify/multipart";
import { OpenAIReviewProvider, type AIReviewProvider } from "@aegisiac/ai";
import {
  InMemoryPlanRunRepository,
  PlanRunService,
  type ApprovalDecision,
  type PlanRunRecord,
  type PlanRunRepository
} from "./service.js";

interface BuildAppOptions {
  logger?: FastifyServerOptions["logger"] | undefined;
  repository?: PlanRunRepository | undefined;
  aiProvider?: AIReviewProvider | undefined;
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

  return app;
}
