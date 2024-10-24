import { isTerraClassic } from './isTerraClassic';

export function getKeyToUseForDenoms(denom: string, originChainId: string) {
  const _denom = denom.replace(/(cw20:|erc20\/)/g, '');

  if (isTerraClassic(originChainId) && _denom === 'uluna') {
    return 'lunc';
  }

  if (['noble-1', 'grand-1', 'noble'].includes(originChainId) && _denom === 'uusdc') {
    return 'usdc';
  }

  return _denom;
}
