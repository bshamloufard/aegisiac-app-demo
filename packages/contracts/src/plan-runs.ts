import type { ISODateTime, JsonObject, Sha256, UUID } from "./common";
import type { TerraformPlanSummary } from "./terraform";

export type VcsProvider = "github" | "gitlab" | "bitbucket" | "azure-devops" | "other";
export type PlanRunSource = "api" | "cli" | "github" | "scheduler";
export type PlanRunStatus =
  | "queued"
  | "planning"
  | "planned"
  | "reviewing"
  | "needs-approval"
  | "approved"
  | "applying"
  | "applied"
  | "failed"
  | "cancelled";

export type PlanArtifactKind = "plan-json" | "plan-binary" | "stdout" | "stderr" | "lockfile";
export type ApprovalStatus = "requested" | "approved" | "rejected" | "expired" | "cancelled";

export interface ProjectDto {
  readonly id: UUID;
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface CreateProjectRequest {
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
}

export interface TerraformWorkspaceDto {
  readonly id: UUID;
  readonly projectId: UUID;
  readonly name: string;
  readonly terraformVersion?: string;
  readonly workingDirectory?: string;
  readonly variables?: JsonObject;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface VcsRepositoryDto {
  readonly id: UUID;
  readonly projectId: UUID;
  readonly provider: VcsProvider;
  readonly url: string;
  readonly defaultBranch: string;
  readonly externalId?: string;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface CreatePlanRunRequest {
  readonly projectId: UUID;
  readonly workspaceId?: UUID;
  readonly repositoryId?: UUID;
  readonly source: PlanRunSource;
  readonly branch?: string;
  readonly commitSha?: string;
  readonly terraformVersion?: string;
  readonly cliArgs?: readonly string[];
  readonly variables?: JsonObject;
}

export interface PlanRunDto {
  readonly id: UUID;
  readonly projectId: UUID;
  readonly workspaceId?: UUID;
  readonly repositoryId?: UUID;
  readonly source: PlanRunSource;
  readonly status: PlanRunStatus;
  readonly branch?: string;
  readonly commitSha?: string;
  readonly terraformVersion?: string;
  readonly cliArgs: readonly string[];
  readonly summary?: TerraformPlanSummary;
  readonly errorMessage?: string;
  readonly createdAt: ISODateTime;
  readonly startedAt?: ISODateTime;
  readonly completedAt?: ISODateTime;
}

export interface UpdatePlanRunRequest {
  readonly status?: PlanRunStatus;
  readonly terraformVersion?: string;
  readonly summary?: TerraformPlanSummary;
  readonly errorMessage?: string;
  readonly startedAt?: ISODateTime;
  readonly completedAt?: ISODateTime;
}

export interface PlanArtifactDto {
  readonly id: UUID;
  readonly planRunId: UUID;
  readonly kind: PlanArtifactKind;
  readonly storageBucket: string;
  readonly storagePath: string;
  readonly sha256?: Sha256;
  readonly byteSize?: number;
  readonly contentType?: string;
  readonly createdAt: ISODateTime;
}

export interface CreatePlanArtifactRequest {
  readonly planRunId: UUID;
  readonly kind: PlanArtifactKind;
  readonly storageBucket: string;
  readonly storagePath: string;
  readonly sha256?: Sha256;
  readonly byteSize?: number;
  readonly contentType?: string;
}

export interface ApplyApprovalDto {
  readonly id: UUID;
  readonly planRunId: UUID;
  readonly status: ApprovalStatus;
  readonly requestedBy: UUID;
  readonly approvedBy?: UUID;
  readonly reason?: string;
  readonly expiresAt?: ISODateTime;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface CreateApplyApprovalRequest {
  readonly reason?: string;
  readonly expiresAt?: ISODateTime;
}

export interface DecideApplyApprovalRequest {
  readonly status: "approved" | "rejected";
  readonly reason?: string;
}
