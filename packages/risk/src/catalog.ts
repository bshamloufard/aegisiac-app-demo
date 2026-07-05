import type { CatalogResource, ResourceCatalog } from "./types.js";

const STATEFUL_RESOURCE_TYPES = new Set([
  "aws_db_instance",
  "aws_dynamodb_table",
  "aws_efs_file_system",
  "aws_elasticache_cluster",
  "aws_elasticache_replication_group",
  "aws_rds_cluster",
  "aws_s3_bucket",
  "azurerm_cosmosdb_account",
  "azurerm_key_vault",
  "azurerm_mssql_server",
  "azurerm_postgresql_flexible_server",
  "google_bigquery_dataset",
  "google_compute_disk",
  "google_sql_database_instance",
  "kubernetes_persistent_volume",
  "kubernetes_persistent_volume_claim"
]);

export function isStatefulResourceType(type: string): boolean {
  if (STATEFUL_RESOURCE_TYPES.has(type)) {
    return true;
  }

  return /(?:bucket|database|db_|disk|queue|secret|snapshot|state|table|vault|volume)/i.test(type);
}

export class InMemoryResourceCatalog implements ResourceCatalog {
  private readonly resources = new Map<string, CatalogResource>();

  get(address: string): CatalogResource | undefined {
    return this.resources.get(address);
  }

  upsert(resource: Pick<CatalogResource, "address" | "type" | "provider">): CatalogResource {
    const now = new Date().toISOString();
    const existing = this.resources.get(resource.address);
    const next: CatalogResource = {
      address: resource.address,
      type: resource.type,
      provider: resource.provider,
      stateful: isStatefulResourceType(resource.type),
      firstSeenAt: existing?.firstSeenAt ?? now,
      lastSeenAt: now
    };

    this.resources.set(resource.address, next);
    return next;
  }

  all(): CatalogResource[] {
    return [...this.resources.values()];
  }
}
