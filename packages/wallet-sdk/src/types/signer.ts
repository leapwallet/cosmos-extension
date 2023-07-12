import { OfflineSigner } from '@cosmjs/proto-signing';
import { LeapSigner } from '@leapwallet/leap-keychain';

export type Signer = OfflineSigner | LeapSigner;
