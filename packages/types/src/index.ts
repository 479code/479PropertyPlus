/**
 * Shared, framework-agnostic types for 479Property+.
 * Business/domain types are added here as feature modules are built.
 */

/** A branded string identifier (e.g. a CUID/UUID primary key). */
export type ID = string;

/** ISO-8601 timestamp string. */
export type ISODateString = string;

/** Standard, envelope-style API response. */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/** Pagination request parameters. */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/** A paginated result set. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

/** Audit fields shared by persisted, tenant-scoped entities. */
export interface AuditFields {
  createdAt: ISODateString;
  updatedAt: ISODateString;
  createdBy?: ID | null;
  updatedBy?: ID | null;
  organizationId: ID;
  deletedAt?: ISODateString | null;
}
