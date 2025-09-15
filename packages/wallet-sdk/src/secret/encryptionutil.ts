import { fromBase64, fromHex, fromUtf8, toHex, toUtf8 } from '@cosmjs/encoding';
import { x25519 } from '@noble/curves/ed25519';
import hkdf from 'futoin-hkdf';
import * as miscreant from 'miscreant';
import secureRandom from 'secure-random';

import { Query } from '../proto/secret/grpc_gateway/secret/registration/v1beta1/query.pb';

const cryptoProvider = new miscreant.PolyfillCryptoProvider();

export interface EncryptionUtils {
  getPubkey: () => Promise<Uint8Array>;
  decrypt: (ciphertext: Uint8Array, nonce: Uint8Array) => Promise<Uint8Array>;
  encrypt: (contractCodeHash: string, msg: object) => Promise<Uint8Array>;
  getTxEncryptionKey: (nonce: Uint8Array) => Promise<Uint8Array>;
}

const hkdfSalt: Uint8Array = fromHex('000000000000000000024bead8df69990852c202db0e0097c1a12ea637d7e96d');
const mainnetConsensusIoPubKey = fromBase64('79++5YOHfm0SwhlpUDClv7cuCjq9xBZlWqSjDJWkRG8=');
const mainnetChainIds = new Set(['secret-2', 'secret-3', 'secret-4']);

export class EncryptionUtilsImpl implements EncryptionUtils {
  private readonly seed: Uint8Array;
  private readonly privkey: Uint8Array;
  public readonly pubkey: Uint8Array;
  private consensusIoPubKey: Uint8Array = new Uint8Array(); // cache

  public constructor(private url: string, chainId?: string, seed?: Uint8Array) {
    this.seed = seed ?? EncryptionUtilsImpl.GenerateNewSeed();

    const { privkey, pubkey } = EncryptionUtilsImpl.GenerateNewKeyPairFromSeed(this.seed);
    this.privkey = privkey;
    this.pubkey = pubkey;

    if (chainId && mainnetChainIds.has(chainId)) {
      // Major speedup
      // TODO:- not sure if this is the best approach for detecting mainnet
      this.consensusIoPubKey = mainnetConsensusIoPubKey;
    }
  }

  public static GenerateNewKeyPair(): {
    privkey: Uint8Array;
    pubkey: Uint8Array;
  } {
    return EncryptionUtilsImpl.GenerateNewKeyPairFromSeed(EncryptionUtilsImpl.GenerateNewSeed());
  }

  public static GenerateNewSeed(): Uint8Array {
    return secureRandom(32, { type: 'Uint8Array' });
  }

  public static GenerateNewKeyPairFromSeed(seed: Uint8Array): {
    privkey: Uint8Array;
    pubkey: Uint8Array;
  } {
    const { secretKey: privkey, publicKey: pubkey } = x25519.keygen(seed);
    return { privkey, pubkey };
  }

  private async getConsensusIoPubKey(): Promise<Uint8Array> {
    if (this.consensusIoPubKey.length === 32) {
      return this.consensusIoPubKey;
    }

    const { key } = await Query.TxKey({}, { pathPrefix: this.url });
    this.consensusIoPubKey = extractConsensusIoPubkey(fromBase64(key as unknown as string));

    return this.consensusIoPubKey;
  }

  public async getTxEncryptionKey(nonce: Uint8Array): Promise<Uint8Array> {
    const consensusIoPubKey = await this.getConsensusIoPubKey();

    const txEncryptionIkm = x25519.getSharedSecret(this.privkey, consensusIoPubKey);
    const txEncryptionKey = hkdf(Buffer.from([...txEncryptionIkm, ...nonce]), 32, {
      salt: Buffer.from(hkdfSalt),
      hash: 'SHA-256',
    });
    return txEncryptionKey;
  }

  public async encrypt(contractCodeHash: string, msg: object): Promise<Uint8Array> {
    const nonce = secureRandom(32, { type: 'Uint8Array' });
    const txEncryptionKey = await this.getTxEncryptionKey(nonce);

    const siv = await miscreant.SIV.importKey(txEncryptionKey, 'AES-SIV', cryptoProvider);

    const plaintext = toUtf8(contractCodeHash + JSON.stringify(msg));

    const ciphertext = await siv.seal(plaintext, [new Uint8Array()]);

    // ciphertext = nonce(32) || wallet_pubkey(32) || ciphertext
    return Uint8Array.from([...nonce, ...this.pubkey, ...ciphertext]);
  }

  public async decrypt(ciphertext: Uint8Array, nonce: Uint8Array): Promise<Uint8Array> {
    if (!ciphertext?.length) {
      return new Uint8Array();
    }

    const txEncryptionKey = await this.getTxEncryptionKey(nonce);

    const siv = await miscreant.SIV.importKey(txEncryptionKey, 'AES-SIV', cryptoProvider);

    const plaintext = await siv.open(ciphertext, [new Uint8Array()]);
    return plaintext;
  }

  getPubkey(): Promise<Uint8Array> {
    return Promise.resolve(this.pubkey);
  }
}

// extractPubkey ported from https://github.com/enigmampc/SecretNetwork/blob/8ab20a273570bfb3d55d67e0300ecbdc67e0e739/x/registration/remote_attestation/remote_attestation.go#L25
export function extractConsensusIoPubkey(cert: Uint8Array): Uint8Array {
  const nsCmtOid = new Uint8Array([0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x86, 0xf8, 0x42, 0x01, 0x0d]); // Netscape Comment OID
  const payload = extractAsn1Value(cert, nsCmtOid);

  try {
    // Try SW mode

    const pubkey = fromBase64(fromUtf8(payload));
    if (pubkey.length === 32) {
      return pubkey;
    }
  } catch (e) {
    // Not SW mode
  }

  try {
    // Try HW mode
    // Ported from https://github.com/scrtlabs/SecretNetwork/blob/8ab20a273570bfb3d55d67e0300ecbdc67e0e739/x/registration/remote_attestation/remote_attestation.go#L110

    const quoteHex = fromBase64(
      JSON.parse(fromUtf8(fromBase64(JSON.parse(fromUtf8(payload)).report))).isvEnclaveQuoteBody,
    );

    const reportData = quoteHex.slice(368, 400);
    return reportData;
  } catch (e) {
    throw new Error('Cannot extract tx io pubkey: error parsing certificate - malformed certificate');
  }
}

function extractAsn1Value(cert: Uint8Array, oid: Uint8Array): Uint8Array {
  let offset = toHex(cert).indexOf(toHex(oid)) / 2;
  if (!Number.isInteger(offset)) {
    throw new Error('Error parsing certificate - malformed certificate');
  }
  offset += 12; // 11 + TAG (0x04)

  // we will be accessing offset + 2, so make sure it's not out-of-bounds
  if (offset + 2 >= cert.length) {
    throw new Error('Error parsing certificate - malformed certificate');
  }

  let length = cert[offset];
  if (length > 0x80) {
    length = cert[offset + 1] * 0x100 + cert[offset + 2];
    offset += 2;
  }

  if (offset + length + 1 >= cert.length) {
    throw new Error('Error parsing certificate - malformed certificate');
  }

  // Obtain Netscape Comment
  offset += 1;
  const payload = cert.slice(offset, offset + length);

  return payload;
}
