/**
 * Gets a required environment variable or returns an error if missing/empty.
 *
 * @param name
 * @returns string
 */
export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === null || value.trim() === '') {
    throw new Error(`Environment variable ${name} is required but not set`);
  }

  return value;
}
