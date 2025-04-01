import { APTOS_COIN, APTOS_FA } from '@aptos-labs/ts-sdk';
import {
  APTOS_CHAINS,
  aptosChainNativeFATokenMapping,
  aptosChainNativeTokenMapping,
  AptosTx,
} from '@leapwallet/cosmos-wallet-sdk';

import { isTerraClassic } from './isTerraClassic';

export function getKeyToUseForDenoms(denom: string, originChainId: string) {
  let skipSanitizedDenom = denom.replace(/(cw20:)/g, '');
  if (denom.startsWith('erc20/0x')) {
    skipSanitizedDenom = denom.replace('erc20', '');
  }

  const _denom = AptosTx.sanitizeTokenDenom(skipSanitizedDenom);

  if (_denom === APTOS_COIN && (APTOS_CHAINS.includes(originChainId) || originChainId.includes('aptos-'))) {
    return aptosChainNativeTokenMapping[originChainId];
  }

  if (_denom === APTOS_FA && (APTOS_CHAINS.includes(originChainId) || originChainId.includes('aptos-'))) {
    return aptosChainNativeFATokenMapping[originChainId];
  }

  if (isTerraClassic(originChainId) && _denom === 'uluna') {
    return 'lunc';
  }

  if (['noble-1', 'grand-1', 'noble'].includes(originChainId) && _denom === 'uusdc') {
    return 'usdc';
  }

  return _denom;
}
