import type { ISODateTime, JsonObject, UUID } from "./common";

export type AiProvider = "openai" | "anthropic" | "azure-openai" | "local" | "other";
export type AiReviewStatus = "queued" | "running" | "succeeded" | "failed" | "cancelled";
export type AiFindingSeverity = "info" | "low" | "medium" | "high" | "critical";
export type AiFindingCategory =
  | "cost"
  | "security"
  | "reliability"
  | "compliance"
  | "operational"
  | "drift"
  | "unknown";

export interface AiReviewConfig {
  readonly id: UUID;
  readonly projectId: UUID;
  readonly name: string;
  readonly provider: AiProvider;
  readonly model: string;
  readonly enabled: boolean;
  readonly promptVersion: string;
  readonly settings: JsonObject;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface CreateAiReviewConfigRequest {
  readonly projectId: UUID;
  readonly name: string;
  readonly provider: AiProvider;
  readonly model: string;
  readonly promptVersion?: string;
  readonly settings?: JsonObject;
}

export interface AiReviewResult {
  readonly id: UUID;
  readonly planRunId: UUID;
  readonly configId?: UUID;
  readonly status: AiReviewStatus;
  readonly riskScore?: number;
  readonly summary?: string;
  readonly findings: readonly AiFinding[];
  readonly tokenUsage?: AiTokenUsage;
  readonly createdAt: ISODateTime;
  readonly completedAt?: ISODateTime;
}

export interface AiFinding {
  readonly id: string;
  readonly severity: AiFindingSeverity;
  readonly category: AiFindingCategory;
  readonly title: string;
  readonly description: string;
  readonly resourceAddress?: string;
  readonly evidence?: readonly AiEvidence[];
  readonly recommendation?: string;
}

export interface AiEvidence {
  readonly label: string;
  readonly value: string;
  readonly path?: readonly (string | number)[];
}

export interface AiTokenUsage {
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly totalTokens: number;
  readonly estimatedCostUsd?: number;
}
