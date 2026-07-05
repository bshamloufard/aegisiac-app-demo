import type { ISODateTime, JsonObject, UUID } from "./common";

export type GraphNodeKind =
  | "project"
  | "workspace"
  | "module"
  | "resource"
  | "data-source"
  | "provider"
  | "output";

export type GraphEdgeKind =
  | "contains"
  | "depends-on"
  | "provides"
  | "reads"
  | "writes"
  | "changes";

export interface GraphDto {
  readonly planRunId: UUID;
  readonly formatVersion: "1.0";
  readonly nodes: readonly GraphNodeDto[];
  readonly edges: readonly GraphEdgeDto[];
  readonly generatedAt: ISODateTime;
}

export interface GraphNodeDto {
  readonly id: string;
  readonly kind: GraphNodeKind;
  readonly label: string;
  readonly address?: string;
  readonly providerName?: string;
  readonly resourceType?: string;
  readonly changeActions?: readonly string[];
  readonly metadata?: JsonObject;
}

export interface GraphEdgeDto {
  readonly id: string;
  readonly kind: GraphEdgeKind;
  readonly source: string;
  readonly target: string;
  readonly metadata?: JsonObject;
}
