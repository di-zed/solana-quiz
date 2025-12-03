/**
 * Represents the payload embedded in JWT tokens for authentication.
 *
 * This type contains essential user information used to validate
 * and identify the user when verifying access or refresh tokens.
 */
export type TokenPayload = {
  /** Unique identifier of the user associated with the token */
  userId: number;
};
