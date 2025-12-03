import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { StringValue } from 'ms';
import { getRequiredEnv } from '../common/utils/config.utils';
import { TokenPayload } from './types/token-payload.type';

/**
 * Service responsible for generating and verifying JWT tokens.
 *
 * Handles creation of access and refresh tokens, verification of tokens,
 * and determination of secure cookie usage based on TLS configuration.
 */
@Injectable()
export class TokenService {
  /**
   * Constructor for TokenService.
   *
   * @param configService - Provides access to environment variables and configuration.
   * @param jwtService - Service for signing and verifying JWT tokens.
   */
  public constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  /**
   * Generate an access token (JWT) for authentication.
   *
   * @param payload - The payload to include in the token (e.g., user ID).
   * @param expiresIn - Optional token expiration time (string like '1h' or number in seconds). Default is '1h'.
   * @returns A promise that resolves to a signed JWT string valid for 1 hour by default.
   */
  public async generateAuthToken(
    payload: TokenPayload,
    expiresIn: StringValue | number = '1h',
  ): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: getRequiredEnv('NODE_JWT_ACCESS_SECRET'),
      expiresIn,
    });
  }

  /**
   * Generate a refresh token (JWT) for renewing access tokens.
   *
   * @param payload - The payload to include in the token (e.g., user ID).
   * @param expiresIn - Optional token expiration time (string like '30d' or number in seconds). Default is '30d'.
   * @returns A promise that resolves to a signed JWT string valid for 30 days by default.
   */
  public async generateRefreshToken(
    payload: TokenPayload,
    expiresIn: StringValue | number = '30d',
  ): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: getRequiredEnv('NODE_JWT_REFRESH_SECRET'),
      expiresIn,
    });
  }

  /**
   * Verify an access token (JWT) and return its decoded payload.
   *
   * @param authToken - The access token to verify.
   * @returns A promise that resolves to the decoded token payload.
   * @throws Throws an error if the token is invalid or expired.
   */
  public async verifyAuthToken(authToken: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync(authToken, {
      secret: getRequiredEnv('NODE_JWT_ACCESS_SECRET'),
    });
  }

  /**
   * Verify a refresh token (JWT) and return its decoded payload.
   *
   * @param authToken - The refresh token to verify.
   * @returns A promise that resolves to the decoded token payload.
   * @throws Throws an error if the token is invalid or expired.
   */
  public async verifyRefreshToken(authToken: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync(authToken, {
      secret: getRequiredEnv('NODE_JWT_REFRESH_SECRET'),
    });
  }

  /**
   * Check if the application is running with TLS enabled.
   *
   * Determines whether both TLS key and certificate are set in environment variables.
   *
   * @returns True if TLS key and certificate are present, false otherwise.
   */
  public isSecure(): boolean {
    const key = this.configService.get<string>('NODE_TLS_KEY')?.trim();
    const cert = this.configService.get<string>('NODE_TLS_CERT')?.trim();

    return Boolean(key) && Boolean(cert);
  }
}
