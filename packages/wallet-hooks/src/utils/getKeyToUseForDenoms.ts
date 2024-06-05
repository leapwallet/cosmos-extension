import { isTerraClassic } from './isTerraClassic';

export function getKeyToUseForDenoms(denom: string, originChainId: string) {
  const _denom = denom.includes('cw20:') ? denom.replace('cw20:', '') : denom;

  if (isTerraClassic(originChainId) && _denom === 'uluna') {
    return 'lunc';
  }

  if (['noble-1', 'grand-1', 'noble'].includes(originChainId) && _denom === 'uusdc') {
    return 'usdc';
  }

  return _denom;
}
