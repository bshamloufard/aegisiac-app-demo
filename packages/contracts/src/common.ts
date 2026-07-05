export type Brand<TValue, TBrand extends string> = TValue & {
  readonly __brand: TBrand;
};

export type UUID = Brand<string, "uuid">;
export type ISODateTime = Brand<string, "isoDateTime">;
export type Sha256 = Brand<string, "sha256">;

export type JsonPrimitive = string | number | boolean | null;
export type JsonObject = { readonly [key: string]: JsonValue };
export type JsonArray = readonly JsonValue[];
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

export type SortDirection = "asc" | "desc";

export interface PageRequest {
  readonly cursor?: string;
  readonly limit?: number;
}

export interface PageInfo {
  readonly nextCursor?: string;
  readonly hasMore: boolean;
}

export interface ApiErrorDetail {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly metadata?: JsonObject;
}

export interface ApiErrorEnvelope {
  readonly ok: false;
  readonly error: ApiErrorDetail;
  readonly requestId: string;
}

export interface ApiSuccessEnvelope<TData> {
  readonly ok: true;
  readonly data: TData;
  readonly requestId: string;
}

export interface ApiPaginatedEnvelope<TItem> {
  readonly ok: true;
  readonly data: readonly TItem[];
  readonly page: PageInfo;
  readonly requestId: string;
}

export type ApiEnvelope<TData> = ApiSuccessEnvelope<TData> | ApiErrorEnvelope;
export type ApiListEnvelope<TItem> = ApiPaginatedEnvelope<TItem> | ApiErrorEnvelope;
