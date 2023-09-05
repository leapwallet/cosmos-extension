import { DenomsRecord, getChainInfo, NativeDenom } from '@leapwallet/cosmos-wallet-sdk';

export async function getDenomInfo(
  denom: string,
  chain: string,
  denoms: DenomsRecord,
  testnet?: boolean,
): Promise<NativeDenom | undefined> {
  if (chain === 'noble' && denom === 'uusdc') {
    denom = 'usdc';
  }

  /**
   * NOTE: Luna and Luna Classic has same minimalDenom (uluna)
   *       that's why to differentiate between them we have
   *       used lunc for Luna Classic in the denoms and uluna
   *       for Luna
   */
  if (chain === 'terra-classic' && denom === 'uluna') {
    denom = 'lunc';
  }

  let denomInfo = denoms[denom];

  if (!denomInfo) {
    const chainInfo = await getChainInfo(chain, testnet);
    if (!chainInfo) {
      return undefined;
    }
    const assetInfo = chainInfo?.assets?.find((asset) => asset.denom === denom);
    if (assetInfo) {
      denomInfo = {
        name: assetInfo.name,
        chain: chainInfo.chain_name,
        coinDenom: assetInfo.symbol,
        coinDecimals: assetInfo.decimals,
        coinGeckoId: assetInfo.coingecko_id,
        coinMinimalDenom: assetInfo.denom,
        icon: assetInfo.image ?? assetInfo.logo_URIs.png ?? assetInfo.logo_URIs.svg,
      };
    }
  }

  return denomInfo;
}
