export type TerraformAction = "no-op" | "create" | "read" | "update" | "delete" | string;

export type RiskTier = "low" | "medium" | "high" | "critical";

export interface TerraformChange {
  actions: TerraformAction[];
  before?: unknown;
  after?: unknown;
  after_unknown?: unknown;
}

export interface TerraformResourceChange {
  address: string;
  mode?: string | undefined;
  type: string;
  name?: string | undefined;
  provider_name?: string | undefined;
  change: TerraformChange;
}

export interface TerraformPlanConfigurationResource {
  address?: string | undefined;
  mode?: string | undefined;
  type?: string | undefined;
  name?: string | undefined;
  depends_on?: string[] | undefined;
  expressions?: Record<string, { references?: string[] | undefined } | undefined> | undefined;
}

export interface TerraformPlanConfigurationModule {
  resources?: TerraformPlanConfigurationResource[] | undefined;
  module_calls?: Record<string, { module?: TerraformPlanConfigurationModule | undefined } | undefined> | undefined;
  child_modules?: TerraformPlanConfigurationModule[] | undefined;
}

export interface TerraformPlanConfiguration {
  root_module?: TerraformPlanConfigurationModule | undefined;
}

export interface ParsedPlan {
  formatVersion?: string | undefined;
  terraformVersion?: string | undefined;
  resourceChanges: TerraformResourceChange[];
  configuration?: TerraformPlanConfiguration | undefined;
  variables?: Record<string, unknown> | undefined;
}

export interface ResourceNode {
  id: string;
  type: string;
  provider?: string | undefined;
  actions: TerraformAction[];
  riskTier?: RiskTier | undefined;
}

export interface GraphEdge {
  from: string;
  to: string;
  reason: "configuration-reference" | "depends-on";
  attribute?: string | undefined;
}

export interface PlanGraph {
  nodes: ResourceNode[];
  edges: GraphEdge[];
}

export interface RiskSignal {
  tier: RiskTier;
  code: string;
  message: string;
  resourceAddress?: string | undefined;
}

export interface RiskAssessment {
  tier: RiskTier;
  signals: RiskSignal[];
  summary: {
    creates: number;
    updates: number;
    deletes: number;
    replaces: number;
    totalChanges: number;
  };
}

export interface CatalogResource {
  address: string;
  type: string;
  provider?: string | undefined;
  stateful: boolean;
  firstSeenAt: string;
  lastSeenAt: string;
}

export interface ResourceCatalog {
  get(address: string): CatalogResource | undefined;
  upsert(resource: Pick<CatalogResource, "address" | "type" | "provider">): CatalogResource;
  all(): CatalogResource[];
}
