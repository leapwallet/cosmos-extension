import { ed25519 } from '@noble/curves/ed25519';
import { bech32 } from '@scure/base';

export function validateSuiPrivateKey(privateKey: string) {
  try {
    if (!privateKey.startsWith('suiprivkey1')) {
      return false;
    }

    const decoded = bech32.decode(privateKey as `suiprivkey1${string}`);
    const bytes = bech32.fromWords(decoded.words);

    if (bytes.length !== 33) {
      return false;
    }

    const privateKeyBytes = bytes.slice(1);

    ed25519.getPublicKey(privateKeyBytes);

    return true;
  } catch (e) {
    return false;
  }
}
