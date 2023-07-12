/**
 * LeapEnigmaUtils duplicates the public methods that are supported on secretjs's EnigmaUtils class.
 */
import { Leap } from './types';

export class LeapEnigmaUtils {
  constructor(protected readonly chainId: string, protected readonly leap: Leap) {}

  async getPubkey(): Promise<Uint8Array> {
    return this.leap.getEnigmaPubKey(this.chainId);
  }

  async getTxEncryptionKey(nonce: Uint8Array): Promise<Uint8Array> {
    return this.leap.getEnigmaTxEncryptionKey(this.chainId, nonce);
  }

  async encrypt(
    contractCodeHash: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    msg: object,
  ): Promise<Uint8Array> {
    return this.leap.enigmaEncrypt(this.chainId, contractCodeHash, msg);
  }

  async decrypt(ciphertext: Uint8Array, nonce: Uint8Array): Promise<Uint8Array> {
    return this.leap.enigmaDecrypt(this.chainId, ciphertext, nonce);
  }
}
