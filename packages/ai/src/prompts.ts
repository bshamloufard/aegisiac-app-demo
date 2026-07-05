import type { AIReviewRequest } from "./types.js";
import { intensitySettings } from "./intensity.js";

function compactJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function buildRiskReviewPrompt(request: AIReviewRequest): string {
  const settings = intensitySettings(request.intensity);
  const graphSection = settings.includeGraphContext
    ? `\nGraph edges:\n${compactJson(request.graph.edges)}\n`
    : "";

  return [
    "You are reviewing an infrastructure-as-code plan for deployment risk.",
    `Plan run: ${request.planRunId}`,
    `Plan hash: ${request.planHash}`,
    `Review intensity: ${request.intensity}`,
    `Return at most ${settings.maxFindings} findings.`,
    `Risk summary:\n${compactJson(request.risk)}`,
    `Resource changes:\n${compactJson(request.parsedPlan.resourceChanges)}`,
    graphSection,
    "Focus on irreversible operations, public exposure, sensitive data, and approval blockers."
  ].join("\n\n");
}

export function buildApprovalPrompt(request: AIReviewRequest): string {
  return [
    "Draft an approval note for a human reviewer.",
    `Plan run: ${request.planRunId}`,
    `Risk tier: ${request.risk.tier}`,
    `Signals: ${request.risk.signals.map((signal) => signal.code).join(", ") || "none"}`
  ].join("\n");
}
