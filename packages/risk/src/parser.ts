import type {
  ParsedPlan,
  TerraformPlanConfiguration,
  TerraformResourceChange
} from "./types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function readRecord(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? value : undefined;
}

function readResourceChange(value: unknown): TerraformResourceChange | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const address = readString(value.address);
  const type = readString(value.type);
  const change = readRecord(value.change);

  if (!address || !type || !change) {
    return undefined;
  }

  const rawActions = Array.isArray(change.actions) ? change.actions : [];
  const actions = rawActions.filter((action): action is string => typeof action === "string");

  return {
    address,
    mode: readString(value.mode),
    type,
    name: readString(value.name),
    provider_name: readString(value.provider_name),
    change: {
      actions,
      before: change.before,
      after: change.after,
      after_unknown: change.after_unknown
    }
  };
}

export function normalizePlanInput(input: unknown): unknown {
  if (typeof input === "string") {
    return JSON.parse(input) as unknown;
  }

  if (input instanceof Uint8Array) {
    return JSON.parse(Buffer.from(input).toString("utf8")) as unknown;
  }

  return input;
}

export function parseTerraformPlan(input: unknown): ParsedPlan {
  const plan = normalizePlanInput(input);

  if (!isRecord(plan)) {
    throw new Error("Terraform plan must be a JSON object.");
  }

  const rawResourceChanges = Array.isArray(plan.resource_changes) ? plan.resource_changes : [];
  const resourceChanges = rawResourceChanges
    .map((change) => readResourceChange(change))
    .filter((change): change is TerraformResourceChange => Boolean(change));

  return {
    formatVersion: readString(plan.format_version),
    terraformVersion: readString(plan.terraform_version),
    resourceChanges,
    configuration: readRecord(plan.configuration) as TerraformPlanConfiguration | undefined,
    variables: readRecord(plan.variables)
  };
}
