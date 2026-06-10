export const PRISMA_ERROR_CODES = {
  /** Unique constraint violation */
  uniqueConstraint: 'P2002',
  /** Foreign key constraint violation */
  foreignKeyViolation: 'P2003',
  /** Required relation not found (connect failed) */
  relationNotFound: 'P2018',
  /** Record not found (update/delete on non-existent row) */
  recordNotFound: 'P2025',
  /** Transaction conflict / write conflict */
  transactionConflict: 'P2034',
} as const;
