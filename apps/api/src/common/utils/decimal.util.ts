/**
 * Shared utility for converting Prisma `Decimal` values to plain `number`.
 *
 * The codebase deliberately keeps repository port interfaces (`common/interfaces/*`)
 * ORM-agnostic — they use `number` for monetary fields. Prisma 7, however, types
 * database `Decimal` columns as `Prisma.Decimal` (a decimal.js instance). This
 * utility centralises the conversion that must happen at the repository boundary,
 * so services, controllers and DTOs never see a `Decimal`.
 *
 * @see {@link persistence-boundary.spec.ts} for the architectural invariant.
 */

/**
 * Loose duck-type for any value that "looks like" a Prisma `Decimal`:
 * `Prisma.Decimal`, `number`, `string`, or any object with a `toString()`.
 * Used to type inputs that flow from Prisma rows into {@link decimalToNumber}.
 */
export type DecimalLike = number | string | { toString(): string };

/**
 * Type guard: true if `value` could represent a Decimal (decimal.js instance,
 * number, numeric string, or any `{ toString(): string }` object).
 */
export function isDecimalLike(value: unknown): value is DecimalLike {
  if (value === null || value === undefined) return false;
  if (typeof value === 'number' || typeof value === 'string') return true;
  if (typeof value === 'object') {
    const stringifier = (value as { toString?: () => string }).toString;
    return typeof stringifier === 'function' && stringifier !== Object.prototype.toString;
  }
  return false;
}

/**
 * Converts a `Decimal`-like value to a plain `number`. Returns `null` for
 * `null`/`undefined` input so nullable DB columns pass through cleanly.
 *
 * Guarantees:
 *  - `null` / `undefined` -> `null`
 *  - `number`            -> the same number
 *  - numeric `string`    -> `Number(value)` (NaN -> 0 fallback)
 *  - `Decimal`-like obj  -> `Number(obj.toString())` (NaN -> 0 fallback)
 *
 * @example
 *   decimalToNumber(product.price)          // Prisma.Decimal -> number
 *   decimalToNumber(record.discountValue)  // Decimal | null -> number | null
 *   decimalToNumber('12.5')                 // 12.5
 */
export function decimalToNumber(value: DecimalLike | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const n = Number(value);
    return Number.isNaN(n) ? 0 : n;
  }
  // Object with toString() (Prisma.Decimal or similar)
  const n = Number(value.toString());
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Same as {@link decimalToNumber} but never returns `null` — falls back to `0`.
 * Use for non-nullable monetary fields known to be required.
 */
export function decimalToNumberOrZero(value: DecimalLike | null | undefined): number {
  return decimalToNumber(value) ?? 0;
}