import { createHash } from "node:crypto";

export function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => canonicalize(item));
  }

  if (value === null || typeof value !== "object") {
    return value;
  }

  const input = value as Record<string, unknown>;
  const output: Record<string, unknown> = {};

  for (const key of Object.keys(input).sort()) {
    const item = input[key];
    if (typeof item !== "undefined") {
      output[key] = canonicalize(item);
    }
  }

  return output;
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalize(value)) ?? "null";
}

export function canonicalPlanHash(plan: unknown): string {
  return createHash("sha256").update(canonicalJson(plan)).digest("hex");
}
