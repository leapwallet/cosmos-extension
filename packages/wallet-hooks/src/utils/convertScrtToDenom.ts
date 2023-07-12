import { NativeDenom } from '@leapwallet/cosmos-wallet-sdk';

import { SecretToken } from '../types';

export function convertSecretDenom(secretToken: SecretToken, address: string): NativeDenom {
  return {
    chain: secretToken.chain ?? '',
    coinDecimals: secretToken.decimals,
    coinDenom: secretToken.symbol,
    coinGeckoId: secretToken.coingeckoId ?? '',
    coinMinimalDenom: address,
    icon: secretToken.icon,
  };
}
