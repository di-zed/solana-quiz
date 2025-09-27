/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */

/**
 * Number Utility.
 */
class NumberUtil {
  /**
   * Converts a value to a positive integer (> 0).
   * Returns null if invalid.
   *
   * @param value
   * @returns number | null
   */
  public toPositiveInt(value: any): number | null {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : null;
  }
}

export default new NumberUtil();
