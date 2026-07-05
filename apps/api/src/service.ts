import {
  InMemoryResourceCatalog,
  assessPlanRisk,
  buildPlanGraph,
  canonicalPlanHash,
  normalizePlanInput,
  parseTerraformPlan,
  type ParsedPlan,
  type PlanGraph,
  type ResourceCatalog,
  type RiskAssessment
} from "@aegisiac/risk";
import {
  NoopAIProvider,
  mapRiskToIntensity,
  type AIReviewProvider,
  type AIReviewResult
} from "@aegisiac/ai";
import { randomUUID } from "node:crypto";

export type PlanRunStatus = "received" | "analyzed" | "failed";
export type ApprovalDecision = "approved" | "rejected";

export interface ApprovalRecord {
  id: string;
  decision: ApprovalDecision;
  reviewer?: string | undefined;
  reason?: string | undefined;
  createdAt: string;
}

export interface GithubCheckPlaceholder {
  status: "queued";
  conclusion: null;
  externalId: string;
  summary: string;
}

export interface PlanRunRecord {
  id: string;
  status: PlanRunStatus;
  source: string;
  planHash: string;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
  parsedPlan: ParsedPlan;
  graph: PlanGraph;
  risk: RiskAssessment;
  aiReview: AIReviewResult;
  githubCheck: GithubCheckPlaceholder;
  approvals: ApprovalRecord[];
}

export interface PlanRunRepository {
  create(record: PlanRunRecord): PlanRunRecord;
  get(id: string): PlanRunRecord | undefined;
  addApproval(planRunId: string, approval: ApprovalRecord): PlanRunRecord | undefined;
}

export interface IngestPlanInput {
  plan: unknown;
  source: string;
  metadata?: Record<string, unknown> | undefined;
}

export class InMemoryPlanRunRepository implements PlanRunRepository {
  private readonly records = new Map<string, PlanRunRecord>();

  create(record: PlanRunRecord): PlanRunRecord {
    this.records.set(record.id, record);
    return record;
  }

  get(id: string): PlanRunRecord | undefined {
    return this.records.get(id);
  }

  addApproval(planRunId: string, approval: ApprovalRecord): PlanRunRecord | undefined {
    const record = this.records.get(planRunId);
    if (!record) {
      return undefined;
    }

    const next = {
      ...record,
      updatedAt: approval.createdAt,
      approvals: [...record.approvals, approval]
    };
    this.records.set(planRunId, next);
    return next;
  }
}

export class PlanRunService {
  constructor(
    private readonly repository: PlanRunRepository = new InMemoryPlanRunRepository(),
    private readonly aiProvider: AIReviewProvider = new NoopAIProvider(),
    private readonly catalog: ResourceCatalog = new InMemoryResourceCatalog()
  ) {}

  async ingestPlan(input: IngestPlanInput): Promise<PlanRunRecord> {
    const plan = normalizePlanInput(input.plan);
    const parsedPlan = parseTerraformPlan(plan);
    const planHash = canonicalPlanHash(plan);
    const graph = buildPlanGraph(parsedPlan);
    const risk = assessPlanRisk(parsedPlan, graph.edges, this.catalog);
    const intensity = mapRiskToIntensity(risk);
    const id = randomUUID();
    const now = new Date().toISOString();
    const metadata = input.metadata ?? {};

    const aiReview = await this.aiProvider.reviewPlan({
      planRunId: id,
      planHash,
      parsedPlan,
      graph,
      risk,
      intensity,
      metadata
    });

    return this.repository.create({
      id,
      status: "analyzed",
      source: input.source,
      planHash,
      createdAt: now,
      updatedAt: now,
      metadata,
      parsedPlan,
      graph,
      risk,
      aiReview,
      githubCheck: {
        status: "queued",
        conclusion: null,
        externalId: `check-${id}`,
        summary: `Placeholder GitHub Check queued for ${risk.tier} risk plan.`
      },
      approvals: []
    });
  }

  getPlanRun(id: string): PlanRunRecord | undefined {
    return this.repository.get(id);
  }

  addApproval(planRunId: string, input: Omit<ApprovalRecord, "id" | "createdAt">): PlanRunRecord | undefined {
    return this.repository.addApproval(planRunId, {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...input
    });
  }
}
