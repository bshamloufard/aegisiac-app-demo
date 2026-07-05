import type { ApiEnvelope, ApiListEnvelope, PageRequest, UUID } from "./common";
import type { AiReviewConfig, AiReviewResult, CreateAiReviewConfigRequest } from "./ai";
import type { GraphDto } from "./graph";
import type {
  ApplyApprovalDto,
  CreateApplyApprovalRequest,
  CreatePlanArtifactRequest,
  CreatePlanRunRequest,
  CreateProjectRequest,
  DecideApplyApprovalRequest,
  PlanArtifactDto,
  PlanRunDto,
  ProjectDto,
  UpdatePlanRunRequest
} from "./plan-runs";
import type { TerraformPlanSubset } from "./terraform";

export interface ListProjectsRequest extends PageRequest {
  readonly search?: string;
}

export interface ListPlanRunsRequest extends PageRequest {
  readonly projectId?: UUID;
  readonly status?: PlanRunDto["status"];
}

export type CreateProjectResponse = ApiEnvelope<ProjectDto>;
export type ListProjectsResponse = ApiListEnvelope<ProjectDto>;
export type GetProjectResponse = ApiEnvelope<ProjectDto>;

export type CreatePlanRunResponse = ApiEnvelope<PlanRunDto>;
export type ListPlanRunsResponse = ApiListEnvelope<PlanRunDto>;
export type GetPlanRunResponse = ApiEnvelope<PlanRunDto>;
export type UpdatePlanRunResponse = ApiEnvelope<PlanRunDto>;

export interface UploadTerraformPlanRequest {
  readonly planRunId: UUID;
  readonly plan: TerraformPlanSubset;
  readonly artifact?: CreatePlanArtifactRequest;
}

export type UploadTerraformPlanResponse = ApiEnvelope<PlanRunDto>;

export type CreatePlanArtifactResponse = ApiEnvelope<PlanArtifactDto>;
export type ListPlanArtifactsResponse = ApiListEnvelope<PlanArtifactDto>;

export type CreateAiReviewConfigResponse = ApiEnvelope<AiReviewConfig>;
export type StartAiReviewRequest = {
  readonly configId?: UUID;
  readonly inlineConfig?: CreateAiReviewConfigRequest;
};
export type StartAiReviewResponse = ApiEnvelope<AiReviewResult>;
export type GetAiReviewResponse = ApiEnvelope<AiReviewResult>;

export type GetGraphResponse = ApiEnvelope<GraphDto>;

export type RequestApplyApprovalResponse = ApiEnvelope<ApplyApprovalDto>;
export type DecideApplyApprovalResponse = ApiEnvelope<ApplyApprovalDto>;

export interface AegisApiContract {
  readonly createProject: {
    readonly request: CreateProjectRequest;
    readonly response: CreateProjectResponse;
  };
  readonly createPlanRun: {
    readonly request: CreatePlanRunRequest;
    readonly response: CreatePlanRunResponse;
  };
  readonly updatePlanRun: {
    readonly request: UpdatePlanRunRequest;
    readonly response: UpdatePlanRunResponse;
  };
  readonly uploadTerraformPlan: {
    readonly request: UploadTerraformPlanRequest;
    readonly response: UploadTerraformPlanResponse;
  };
  readonly requestApplyApproval: {
    readonly request: CreateApplyApprovalRequest;
    readonly response: RequestApplyApprovalResponse;
  };
  readonly decideApplyApproval: {
    readonly request: DecideApplyApprovalRequest;
    readonly response: DecideApplyApprovalResponse;
  };
}
