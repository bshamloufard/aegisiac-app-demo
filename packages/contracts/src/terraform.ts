import type { JsonObject, JsonValue } from "./common";

export type TerraformFormatVersion = "1.0";
export type TerraformChangeAction = "no-op" | "create" | "read" | "update" | "delete";
export type TerraformResourceMode = "managed" | "data";

export interface TerraformPlanSubset {
  readonly formatVersion: TerraformFormatVersion;
  readonly terraformVersion: string;
  readonly priorState?: TerraformStateSubset;
  readonly plannedValues?: TerraformValuesSubset;
  readonly resourceChanges: readonly TerraformResourceChange[];
  readonly outputChanges?: readonly TerraformOutputChange[];
  readonly variables?: JsonObject;
  readonly checks?: readonly TerraformCheckResult[];
}

export interface TerraformStateSubset {
  readonly formatVersion?: string;
  readonly terraformVersion?: string;
  readonly values?: TerraformValuesSubset;
}

export interface TerraformValuesSubset {
  readonly rootModule?: TerraformModuleSubset;
  readonly outputs?: Readonly<Record<string, TerraformOutputValue>>;
}

export interface TerraformModuleSubset {
  readonly address?: string;
  readonly resources?: readonly TerraformResourceInstance[];
  readonly childModules?: readonly TerraformModuleSubset[];
}

export interface TerraformResourceInstance {
  readonly address: string;
  readonly mode: TerraformResourceMode;
  readonly type: string;
  readonly name: string;
  readonly providerName: string;
  readonly index?: string | number;
  readonly schemaVersion?: number;
  readonly values?: JsonObject;
  readonly sensitiveValues?: JsonObject;
  readonly dependsOn?: readonly string[];
}

export interface TerraformResourceChange {
  readonly address: string;
  readonly moduleAddress?: string;
  readonly mode: TerraformResourceMode;
  readonly type: string;
  readonly name: string;
  readonly providerName: string;
  readonly index?: string | number;
  readonly deposed?: string;
  readonly change: TerraformChange;
}

export interface TerraformChange {
  readonly actions: readonly TerraformChangeAction[];
  readonly before?: JsonValue;
  readonly after?: JsonValue;
  readonly afterUnknown?: JsonValue;
  readonly beforeSensitive?: JsonValue;
  readonly afterSensitive?: JsonValue;
  readonly replacePaths?: readonly TerraformPath[];
}

export type TerraformPath = readonly (string | number)[];

export interface TerraformOutputValue {
  readonly sensitive: boolean;
  readonly type: JsonValue;
  readonly value?: JsonValue;
}

export interface TerraformOutputChange {
  readonly name: string;
  readonly change: TerraformChange;
}

export interface TerraformCheckResult {
  readonly address?: string;
  readonly status: "pass" | "fail" | "error" | "unknown";
  readonly message?: string;
}

export interface TerraformPlanSummary {
  readonly add: number;
  readonly change: number;
  readonly destroy: number;
  readonly read: number;
  readonly noOp: number;
}
