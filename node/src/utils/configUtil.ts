/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */

/**
 * Config Utility.
 */
class ConfigUtil {
  /**
   * Gets a required environment variable or returns an error if missing/empty.
   *
   * @param name
   * @returns string
   */
  public getRequiredEnv(name: string): string {
    const value = process.env[name];
    if (value === undefined || value === null || value.trim() === '') {
      throw new Error(`Environment variable ${name} is required but not set`);
    }

    return value;
  }
}

export default new ConfigUtil();
