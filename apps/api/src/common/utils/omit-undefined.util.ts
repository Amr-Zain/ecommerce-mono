/**
 * Shallow copy: only entries whose value is not `undefined`.
 * Use for PATCH-style payloads (e.g. Prisma *UpdateInput) so omitted DTO fields are not sent.
 */
export function omitUndefined<T extends object>(source: T): Partial<T> {
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(source)) {
    if (value !== undefined) {
      (result as Record<string, unknown>)[key] = value;
    }
  }
  return result;
}
