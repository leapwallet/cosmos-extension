import {
  denoms as DefaultDenoms,
  DenomsRecord,
  getChainInfo,
  getErc20TokenDetails,
  isAptosChain,
  NativeDenom,
  SupportedDenoms,
} from '@leapwallet/cosmos-wallet-sdk';

export type CompassDenomInfoParams =
  | {
      isCompassWallet: true;
      compassEvmToSeiMapping: Record<string, string>;
      compassSeiToEvmMapping: Record<string, string>;
      seiEvmRpcUrl: string;
      seiEvmChainId: string;
      seiCosmosChainId: string;
    }
  | {
      isCompassWallet: false;
    };

export async function getDenomInfo(
  denom: string,
  chain: string,
  denoms: DenomsRecord,
  compassParams: CompassDenomInfoParams,
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

  if (!denomInfo && compassParams.isCompassWallet) {
    // Compass wallet
    let seiAddress;
    let evmAddress;
    if (denom.startsWith('0x')) {
      evmAddress = denom;
      seiAddress = compassParams?.compassEvmToSeiMapping?.[denom];
    } else {
      seiAddress = denom;
      evmAddress = compassParams?.compassSeiToEvmMapping?.[denom];
    }

    if (seiAddress) {
      denomInfo = denoms[seiAddress];
    }
    if (!denomInfo && evmAddress) {
      denomInfo = denoms[evmAddress];
      if (!denomInfo) {
        let details;
        try {
          details = await getErc20TokenDetails(
            evmAddress,
            compassParams.seiEvmRpcUrl,
            Number(compassParams.seiEvmChainId),
          );
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Error getting ERC20 token details', e);
        }
        if (details) {
          denomInfo = {
            name: details.name,
            coinDenom: details.symbol,
            coinDecimals: details.decimals,
            coinMinimalDenom: evmAddress,
            icon: '',
            chain: compassParams.seiCosmosChainId,
            coinGeckoId: '',
          };
        }
      }
    }
  }

  if (!denomInfo) {
    let chainInfo;
    if (!isAptosChain(chain)) {
      chainInfo = await getChainInfo(chain, testnet);
    }
    if (!chainInfo) {
      denomInfo = DefaultDenoms[denom as SupportedDenoms];
    } else {
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
  }

  return denomInfo;
}
