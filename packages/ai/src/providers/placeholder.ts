import { buildRiskReviewPrompt } from "../prompts.js";
import type {
  AIProviderConfig,
  AIReviewProvider,
  AIReviewRequest,
  AIReviewResult,
  AIRiskSignalContext
} from "../types.js";

function signalToFinding(signal: AIRiskSignalContext): AIReviewResult["findings"][number] {
  return {
    severity: signal.tier,
    title: signal.code,
    detail: signal.message,
    resourceAddress: signal.resourceAddress
  };
}

abstract class PlaceholderProvider implements AIReviewProvider {
  abstract readonly name: string;
  protected readonly model: string;

  protected constructor(config: AIProviderConfig = {}, fallbackModel: string) {
    this.model = config.model ?? fallbackModel;
  }

  async reviewPlan(request: AIReviewRequest): Promise<AIReviewResult> {
    return {
      provider: this.name,
      model: this.model,
      intensity: request.intensity,
      summary: `Placeholder ${this.name} review for ${request.risk.tier} risk plan ${request.planRunId}.`,
      findings: request.risk.signals.map((signal) => signalToFinding(signal)),
      prompt: buildRiskReviewPrompt(request),
      generatedAt: new Date().toISOString()
    };
  }
}

export class OpenAIReviewProvider extends PlaceholderProvider {
  readonly name = "openai";

  constructor(config: AIProviderConfig = {}) {
    super(config, "gpt-5-mini");
  }
}

export class AnthropicReviewProvider extends PlaceholderProvider {
  readonly name = "anthropic";

  constructor(config: AIProviderConfig = {}) {
    super(config, "claude-sonnet-placeholder");
  }
}

export class NoopAIProvider implements AIReviewProvider {
  readonly name = "noop";

  async reviewPlan(request: AIReviewRequest): Promise<AIReviewResult> {
    return {
      provider: this.name,
      model: "none",
      intensity: "off",
      summary: `AI review disabled for plan ${request.planRunId}.`,
      findings: [],
      prompt: buildRiskReviewPrompt({ ...request, intensity: "off" }),
      generatedAt: new Date().toISOString()
    };
  }
}
