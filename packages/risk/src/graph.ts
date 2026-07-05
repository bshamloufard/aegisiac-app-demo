import type {
  GraphEdge,
  ParsedPlan,
  PlanGraph,
  ResourceNode,
  TerraformPlanConfigurationModule,
  TerraformPlanConfigurationResource,
  TerraformResourceChange
} from "./types.js";

function normalizeReference(reference: string, addresses: Set<string>): string | undefined {
  if (addresses.has(reference)) {
    return reference;
  }

  const matches = [...addresses]
    .filter((address) => reference === address || reference.startsWith(`${address}.`))
    .sort((left, right) => right.length - left.length);

  return matches[0];
}

function collectConfigurationResources(
  module: TerraformPlanConfigurationModule | undefined,
  output: TerraformPlanConfigurationResource[]
): void {
  if (!module) {
    return;
  }

  output.push(...(module.resources ?? []));

  for (const call of Object.values(module.module_calls ?? {})) {
    collectConfigurationResources(call?.module, output);
  }

  for (const child of module.child_modules ?? []) {
    collectConfigurationResources(child, output);
  }
}

function edgeKey(edge: GraphEdge): string {
  return `${edge.from}->${edge.to}:${edge.reason}:${edge.attribute ?? ""}`;
}

export function extractGraphEdges(plan: ParsedPlan | TerraformResourceChange[]): GraphEdge[] {
  const parsedPlan: ParsedPlan = Array.isArray(plan)
    ? { resourceChanges: plan }
    : plan;
  const addresses = new Set(parsedPlan.resourceChanges.map((change) => change.address));
  const configResources: TerraformPlanConfigurationResource[] = [];
  const edgeMap = new Map<string, GraphEdge>();

  collectConfigurationResources(parsedPlan.configuration?.root_module, configResources);

  for (const resource of configResources) {
    if (!resource.address || !addresses.has(resource.address)) {
      continue;
    }

    for (const dependency of resource.depends_on ?? []) {
      const from = normalizeReference(dependency, addresses);
      if (from && from !== resource.address) {
        const edge: GraphEdge = { from, to: resource.address, reason: "depends-on" };
        edgeMap.set(edgeKey(edge), edge);
      }
    }

    for (const [attribute, expression] of Object.entries(resource.expressions ?? {})) {
      for (const reference of expression?.references ?? []) {
        const from = normalizeReference(reference, addresses);
        if (from && from !== resource.address) {
          const edge: GraphEdge = {
            from,
            to: resource.address,
            reason: "configuration-reference",
            attribute
          };
          edgeMap.set(edgeKey(edge), edge);
        }
      }
    }
  }

  return [...edgeMap.values()];
}

export function buildPlanGraph(parsedPlan: ParsedPlan): PlanGraph {
  const edges = extractGraphEdges(parsedPlan);
  const nodes: ResourceNode[] = parsedPlan.resourceChanges.map((change) => ({
    id: change.address,
    type: change.type,
    provider: change.provider_name,
    actions: change.change.actions
  }));

  return { nodes, edges };
}
