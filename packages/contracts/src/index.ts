export type UUID = string;

export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type ApiEnvelope<T> = {
  data: T | null;
  error: ApiError | null;
};

export type PlanRunStatus = 'received' | 'parsing' | 'scanning' | 'ai' | 'ready' | 'error';
export type PlanRunSource = 'ci' | 'hcp' | 'agent';
export type RiskTier = 'normal' | 'elevated' | 'high';
export type ApprovalDecision = 'approved' | 'rejected';
export type MembershipRole = 'owner' | 'admin' | 'approver' | 'security_approver' | 'member';
export type AIProviderName = 'openai' | 'anthropic';
export type AIIntensity = 'low' | 'medium' | 'high' | 'max';
export type AIFeature = 'explanation' | 'risk_summary' | 'blast_radius';
export type PolicyEngine = 'checkov' | 'opa' | 'trivy';
export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low';
export type TerraformAction = 'no-op' | 'create' | 'read' | 'update' | 'delete' | 'forget';

export type AIConfig = {
  provider: AIProviderName;
  model: string;
  intensity: AIIntensity;
  maxOutputTokens: number;
  reasoningEffort?: string;
  verbosity?: 'low' | 'medium' | 'high';
};

export type TerraformChange = {
  actions: TerraformAction[];
  before?: unknown;
  after?: unknown;
  after_unknown?: unknown;
  before_sensitive?: unknown;
  after_sensitive?: unknown;
  replace_paths?: Array<Array<string | number>>;
};

export type TerraformResourceChange = {
  address: string;
  previous_address?: string;
  module_address?: string;
  mode: 'managed' | 'data';
  type: string;
  name: string;
  index?: string | number;
  provider_name: string;
  change: TerraformChange;
  action_reason?: string;
};

export type TerraformPlanJson = {
  format_version: string;
  terraform_version?: string;
  resource_changes?: TerraformResourceChange[];
  configuration?: TerraformConfiguration;
  planned_values?: unknown;
  prior_state?: unknown;
  output_changes?: Record<string, unknown>;
  checks?: unknown;
  applyable?: boolean;
  complete?: boolean;
  errored?: boolean;
};

export type TerraformConfiguration = {
  root_module?: TerraformModule;
};

export type TerraformModule = {
  resources?: TerraformConfigResource[];
  child_modules?: TerraformModule[];
  address?: string;
};

export type TerraformConfigResource = {
  address: string;
  depends_on?: string[];
  expressions?: Record<string, { references?: string[] }>;
};

export type ResourceChangeDto = {
  id?: UUID;
  planRunId?: UUID;
  address: string;
  moduleAddress?: string;
  mode: 'managed' | 'data';
  type: string;
  name: string;
  index?: string;
  providerName: string;
  actions: TerraformAction[];
  actionReason?: string;
  isDestructive: boolean;
  isStateful: boolean;
  replacePaths: Array<Array<string | number>>;
  changedAttributes: Record<string, unknown>;
};

export type DependencyEdgeDto = {
  id?: UUID;
  sourceAddress: string;
  targetAddress: string;
  edgeKind: 'reference' | 'depends_on' | 'module';
};

export type GraphNodeDto = {
  id: string;
  label: string;
  resourceType: string;
  moduleAddress?: string;
  actions: TerraformAction[];
  riskTier?: RiskTier;
  isChanged: boolean;
  isDestructive: boolean;
  isStateful: boolean;
};

export type GraphEdgeDto = {
  id: string;
  source: string;
  target: string;
  kind: DependencyEdgeDto['edgeKind'];
};

export type PlanGraphDto = {
  nodes: GraphNodeDto[];
  edges: GraphEdgeDto[];
};

export type CostResultDto = {
  pastMonthly: number | null;
  plannedMonthly: number | null;
  diffMonthly: number | null;
  currency: string;
  breakdown?: Record<string, unknown>;
};

export type PolicyFindingDto = {
  engine: PolicyEngine;
  ruleId: string;
  severity: FindingSeverity;
  resourceAddress?: string;
  message: string;
  guidelineUrl?: string;
};

export type RiskAssessmentDto = {
  tier: RiskTier;
  score: number;
  reasons: string[];
  requiresSecurityApproval: boolean;
};

export type AIOutput = {
  summary: string;
  risks: Array<{
    severity: FindingSeverity | 'info';
    resource?: string;
    why: string;
  }>;
  recommendations: string[];
  markdown: string;
};

export type AIRunDto = {
  provider: AIProviderName;
  model: string;
  effort: string;
  maxOutputTokens: number;
  feature: AIFeature;
  promptTokens?: number;
  outputTokens?: number;
  latencyMs?: number;
  outputMarkdown: string;
  structured?: AIOutput;
  status: 'ready' | 'error';
};

export type PlanRunDto = {
  id: UUID;
  orgId: UUID;
  pullRequestId?: UUID;
  headSha: string;
  planHash: string;
  source: PlanRunSource;
  status: PlanRunStatus;
  storagePath: string;
  formatVersion: string;
  terraformVersion?: string;
  githubCheckRunId?: number;
  createdAt: string;
  resources: ResourceChangeDto[];
  edges: DependencyEdgeDto[];
  cost?: CostResultDto;
  findings: PolicyFindingDto[];
  risk?: RiskAssessmentDto;
  aiRuns: AIRunDto[];
};

export type IngestPlanRequest = {
  repo: string;
  pr: number;
  sha: string;
  workspace?: string;
  source?: PlanRunSource;
};

export type IngestPlanResponse = {
  plan_run_id: UUID;
};

export type ApprovalRequest = {
  decision: ApprovalDecision;
  comment?: string;
};

export type ApprovalResponse = {
  planRunId: UUID;
  planHash: string;
  satisfied: boolean;
  githubCheckConclusion: 'success' | 'neutral' | 'action_required';
};

export type PlanContext = {
  planRun: Pick<PlanRunDto, 'id' | 'planHash' | 'headSha' | 'formatVersion' | 'terraformVersion'>;
  resources: ResourceChangeDto[];
  edges: DependencyEdgeDto[];
  cost?: CostResultDto;
  findings: PolicyFindingDto[];
  risk: RiskAssessmentDto;
};
