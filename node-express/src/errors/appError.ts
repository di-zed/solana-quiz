/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */

/**
 * Application Error.
 */
export default class AppError extends Error {
  /**
   * Status Code.
   */
  public statusCode: number;

  /**
   * Status.
   */
  public status: string;

  /**
   * Is Operational Error?
   */
  public isOperational: boolean;

  /**
   * App Error Constructor.
   *
   * @param message
   * @param statusCode
   */
  public constructor(message: string, statusCode: number) {
    super(message);

    this.name = 'AppError';

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}