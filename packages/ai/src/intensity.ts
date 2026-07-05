import type { AIIntensity, AIRiskAssessmentContext } from "./types.js";

export interface IntensitySettings {
  intensity: AIIntensity;
  maxFindings: number;
  includeGraphContext: boolean;
}

export function mapRiskToIntensity(risk: AIRiskAssessmentContext): AIIntensity {
  switch (risk.tier) {
    case "critical":
    case "high":
      return "high";
    case "medium":
      return "medium";
    case "low":
      return "low";
    default:
      return "medium";
  }
}

export function intensitySettings(intensity: AIIntensity): IntensitySettings {
  switch (intensity) {
    case "off":
      return { intensity, maxFindings: 0, includeGraphContext: false };
    case "low":
      return { intensity, maxFindings: 3, includeGraphContext: false };
    case "medium":
      return { intensity, maxFindings: 6, includeGraphContext: true };
    case "high":
      return { intensity, maxFindings: 10, includeGraphContext: true };
    default:
      return { intensity: "medium", maxFindings: 6, includeGraphContext: true };
  }
}
