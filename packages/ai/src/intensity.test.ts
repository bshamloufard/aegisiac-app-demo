import { describe, expect, it } from "vitest";
import { mapRiskToIntensity } from "./index.js";
import type { AIRiskAssessmentContext } from "./index.js";

function risk(tier: AIRiskAssessmentContext["tier"]): AIRiskAssessmentContext {
  return {
    tier,
    signals: []
  };
}

describe("AI intensity mapping", () => {
  it("maps high-impact risk to high intensity", () => {
    expect(mapRiskToIntensity(risk("critical"))).toBe("high");
    expect(mapRiskToIntensity(risk("high"))).toBe("high");
  });

  it("preserves low and medium review levels", () => {
    expect(mapRiskToIntensity(risk("medium"))).toBe("medium");
    expect(mapRiskToIntensity(risk("low"))).toBe("low");
  });
});
