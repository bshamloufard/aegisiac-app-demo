import { isStatefulResourceType } from "./catalog.js";
import type {
  GraphEdge,
  ParsedPlan,
  ResourceCatalog,
  RiskAssessment,
  RiskSignal,
  RiskTier,
  TerraformResourceChange
} from "./types.js";

const TIER_WEIGHT: Record<RiskTier, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4
};

function maxTier(tiers: RiskTier[]): RiskTier {
  return tiers.reduce<RiskTier>(
    (current, next) => (TIER_WEIGHT[next] > TIER_WEIGHT[current] ? next : current),
    "low"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function containsPublicCidr(value: unknown): boolean {
  if (typeof value === "string") {
    return value === "0.0.0.0/0" || value === "::/0";
  }

  if (Array.isArray(value)) {
    return value.some((item) => containsPublicCidr(item));
  }

  if (isRecord(value)) {
    return Object.values(value).some((item) => containsPublicCidr(item));
  }

  return false;
}

function containsWildcardPermission(value: unknown): boolean {
  if (typeof value === "string") {
    return value === "*" || value.endsWith(":*");
  }

  if (Array.isArray(value)) {
    return value.some((item) => containsWildcardPermission(item));
  }

  if (isRecord(value)) {
    return Object.values(value).some((item) => containsWildcardPermission(item));
  }

  return false;
}

function isSecurityResource(type: string): boolean {
  return /(?:security_group|firewall|network_security_rule)/i.test(type);
}

function isIamResource(type: string): boolean {
  return /(?:iam|policy|role_assignment)/i.test(type);
}

function hasAction(change: TerraformResourceChange, action: string): boolean {
  return change.change.actions.includes(action);
}

function resourceSignals(change: TerraformResourceChange, catalog?: ResourceCatalog): RiskSignal[] {
  const signals: RiskSignal[] = [];
  const stateful = catalog?.get(change.address)?.stateful ?? isStatefulResourceType(change.type);
  const replacing = hasAction(change, "delete") && hasAction(change, "create");
  const deleting = hasAction(change, "delete");
  const creating = hasAction(change, "create");
  const updating = hasAction(change, "update");

  if (deleting && stateful) {
    signals.push({
      tier: "critical",
      code: "stateful-delete",
      message: "Stateful resource is being deleted.",
      resourceAddress: change.address
    });
  } else if (replacing) {
    signals.push({
      tier: "high",
      code: "resource-replace",
      message: "Resource replacement includes a delete and create action.",
      resourceAddress: change.address
    });
  } else if (deleting) {
    signals.push({
      tier: "high",
      code: "resource-delete",
      message: "Resource is being deleted.",
      resourceAddress: change.address
    });
  }

  if ((creating || updating) && isSecurityResource(change.type) && containsPublicCidr(change.change.after)) {
    signals.push({
      tier: "critical",
      code: "public-network-ingress",
      message: "Network rule exposes traffic to a public CIDR.",
      resourceAddress: change.address
    });
  }

  if ((creating || updating) && isIamResource(change.type) && containsWildcardPermission(change.change.after)) {
    signals.push({
      tier: "high",
      code: "wildcard-permission",
      message: "IAM-style resource contains wildcard permissions.",
      resourceAddress: change.address
    });
  }

  if (/secret|password|token|key/i.test(change.type)) {
    signals.push({
      tier: "medium",
      code: "sensitive-resource",
      message: "Sensitive resource type is included in the plan.",
      resourceAddress: change.address
    });
  }

  return signals;
}

export function assessPlanRisk(
  parsedPlan: ParsedPlan,
  edges: GraphEdge[] = [],
  catalog?: ResourceCatalog
): RiskAssessment {
  for (const change of parsedPlan.resourceChanges) {
    catalog?.upsert({
      address: change.address,
      type: change.type,
      provider: change.provider_name
    });
  }

  const signals = parsedPlan.resourceChanges.flatMap((change) => resourceSignals(change, catalog));
  const deletes = parsedPlan.resourceChanges.filter((change) => hasAction(change, "delete")).length;
  const creates = parsedPlan.resourceChanges.filter((change) => hasAction(change, "create")).length;
  const updates = parsedPlan.resourceChanges.filter((change) => hasAction(change, "update")).length;
  const replaces = parsedPlan.resourceChanges.filter(
    (change) => hasAction(change, "delete") && hasAction(change, "create")
  ).length;

  if (edges.length > 25) {
    signals.push({
      tier: "medium",
      code: "large-dependency-graph",
      message: "Plan has a broad dependency graph."
    });
  }

  if (parsedPlan.resourceChanges.length > 50) {
    signals.push({
      tier: "medium",
      code: "large-change-set",
      message: "Plan contains a large number of resource changes."
    });
  }

  return {
    tier: signals.length > 0 ? maxTier(signals.map((signal) => signal.tier)) : "low",
    signals,
    summary: {
      creates,
      updates,
      deletes,
      replaces,
      totalChanges: parsedPlan.resourceChanges.length
    }
  };
}
