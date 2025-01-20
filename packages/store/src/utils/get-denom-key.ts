import { APTOS_COIN } from '@aptos-labs/ts-sdk';
import { APTOS_CHAINS, aptosChainNativeTokenMapping, AptosTx } from '@leapwallet/cosmos-wallet-sdk';

export function isTerraClassic(chain: string) {
  return ['Terra Classic', 'columbus-5'].includes(chain.trim());
}

export function getKeyToUseForDenoms(denom: string, originChainId: string) {
  const skipSanitizedDenom = denom.replace(/(cw20:|erc20\/)/g, '');
  const _denom = AptosTx.sanitizeTokenDenom(skipSanitizedDenom);

  if (_denom === APTOS_COIN && (APTOS_CHAINS.includes(originChainId) || originChainId.includes('aptos-'))) {
    return aptosChainNativeTokenMapping[originChainId];
  }

  if (isTerraClassic(originChainId) && _denom === 'uluna') {
    return 'lunc';
  }

  if (['noble-1', 'grand-1', 'noble'].includes(originChainId) && _denom === 'uusdc') {
    return 'usdc';
  }

  return _denom;
}
