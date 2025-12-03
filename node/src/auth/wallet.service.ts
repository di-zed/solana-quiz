import { BadRequestException, Injectable } from '@nestjs/common';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import { LoginDto } from './dto/login.dto';

/**
 * Service responsible for verifying Solana wallet signatures.
 *
 * It ensures that a provided signature corresponds to the given wallet address
 * and nonce, using the Ed25519 verification algorithm.
 */
@Injectable()
export class WalletService {
  /**
   * Verify the signature of a wallet login request.
   *
   * @param loginDto - Data Transfer Object containing the wallet address, signature, and nonce
   * @throws BadRequestException if the signature is invalid
   */
  public verify(loginDto: LoginDto): void {
    // Encode the nonce message for verification
    const message = new TextEncoder().encode(`Login nonce: ${loginDto.nonce}`);

    // Decode the base58-encoded signature and public key
    const sigBytes = bs58.decode(loginDto.signature);
    const pubKeyBytes = bs58.decode(loginDto.walletAddress);

    // Verify the signature against the message and public key
    const isValid = nacl.sign.detached.verify(message, sigBytes, pubKeyBytes);

    if (!isValid) {
      throw new BadRequestException('Invalid Signature');
    }
  }
}
