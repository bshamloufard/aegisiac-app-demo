export type AIIntensity = "off" | "low" | "medium" | "high";
export type AIReviewSeverity = "low" | "medium" | "high" | "critical";

export interface AIParsedPlanContext {
  resourceChanges: readonly unknown[];
}

export interface AIPlanGraphContext {
  edges: readonly unknown[];
}

export interface AIRiskSignalContext {
  tier: AIReviewSeverity;
  code: string;
  message: string;
  resourceAddress?: string | undefined;
}

export interface AIRiskAssessmentContext {
  tier: AIReviewSeverity;
  signals: readonly AIRiskSignalContext[];
}

export interface AIReviewRequest {
  planRunId: string;
  planHash: string;
  parsedPlan: AIParsedPlanContext;
  graph: AIPlanGraphContext;
  risk: AIRiskAssessmentContext;
  intensity: AIIntensity;
  metadata: Record<string, unknown>;
}

export interface AIReviewResult {
  provider: string;
  model: string;
  intensity: AIIntensity;
  summary: string;
  findings: Array<{
    severity: AIReviewSeverity;
    title: string;
    detail: string;
    resourceAddress?: string | undefined;
  }>;
  prompt: string;
  generatedAt: string;
}

export interface AIProviderConfig {
  apiKey?: string | undefined;
  baseUrl?: string | undefined;
  model?: string | undefined;
}

export interface AIReviewProvider {
  readonly name: string;
  reviewPlan(request: AIReviewRequest): Promise<AIReviewResult>;
}
