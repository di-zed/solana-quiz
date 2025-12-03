import { Injectable, UnauthorizedException } from '@nestjs/common';

/**
 * Service to handle generation and validation of nonces.
 *
 * Nonces are used as one-time tokens to verify requests, for example
 * in authentication flows where signature verification is required.
 */
@Injectable()
export class NonceService {
  /**
   * Stores active nonces in memory.
   * Key: nonce string
   * Value: boolean (true if valid)
   */
  private readonly nonces = new Map<string, boolean>();

  /**
   * Generates a new unique nonce and stores it in memory.
   *
   * @returns A string representing the new nonce
   */
  public generate(): string {
    const nonce = Math.floor(Math.random() * 1e9).toString();
    this.nonces.set(nonce, true);

    return nonce;
  }

  /**
   * Validates a given nonce. If the nonce is invalid, throws an UnauthorizedException.
   * After validation, the nonce is removed to prevent reuse.
   *
   * @param nonce - The nonce string to validate
   * @throws UnauthorizedException if the nonce is invalid or already used
   */
  public validate(nonce: string): void {
    if (!this.nonces.has(nonce)) {
      throw new UnauthorizedException('Invalid Nonce');
    }

    this.nonces.delete(nonce);
  }
}
