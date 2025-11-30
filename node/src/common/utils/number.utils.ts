/**
 * Converts a value to a positive integer (> 0).
 * Returns null if invalid.
 *
 * @param value
 * @returns number | null
 */
export function toPositiveInt(value: any): number | null {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}
