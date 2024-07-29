import { AddressPrefix, CoinType, Denom, NativeDenom, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';

type Currency = {
  coinDenom?: string | undefined;
  coinMinimalDenom?: string | undefined;
  coinDecimals?: number | undefined;
  coinGeckoId?: string | undefined;
};

type Bech32Config = {
  bech32PrefixAccAddr: string;
  bech32PrefixAccPub: string;
  bech32PrefixValAddr: string;
  bech32PrefixValPub: string;
  bech32PrefixConsAddr: string;
  bech32PrefixConsPub: string;
};

interface FeeCurrency extends Currency {
  gasPriceStep: {
    low: number;
    average: number;
    high: number;
  };
}

export interface CustomChainsType {
  rpc: string;
  rest: string;
  rpcTest?: string | undefined;
  restTest?: string | undefined;
  chainId: string;
  chainName: string;
  stakeCurrency?: Currency;
  bip44: {
    coinType: 60 | 118;
  };
  bech32Config: Bech32Config;
  currencies: Currency[];
  feeCurrencies: FeeCurrency[];
  features?: string[] | undefined;
  walletUrlForStaking?: string | undefined;
  chainRegistryPath: string;
  txExplorer?:
    | {
        mainnet: {
          name: string;
          txUrl: string;
          accountUrl: string;
        };
        testnet: {
          name: string;
          txUrl: string;
          accountUrl: string;
        };
      }
    | undefined;
  theme: {
    primaryColor: string;
    gradient: string;
  };
  image?: string | undefined;
  apiStatus?: boolean | undefined;
  status: 'live';
  key_algos: 'secp256k1' | 'ethsecp256k1';
  cosmosSDK?: string;
}

function removeTrailingSlash(url: string) {
  if (!url) return '';
  return url.replace(/\/$/, '');
}

export function formatNewChainInfo(chainInfo: CustomChainsType) {
  const apis = {
    rest: removeTrailingSlash(chainInfo.rest),
    rpc: removeTrailingSlash(chainInfo.rpc),
    rpcTest: removeTrailingSlash(chainInfo?.rpcTest || ''),
    restTest: removeTrailingSlash(chainInfo?.restTest || ''),
  };
  if (chainInfo?.rpcTest) apis.rpcTest = chainInfo.rpcTest;
  if (chainInfo?.restTest) apis.restTest = chainInfo.restTest;
  const { gasPriceStep, ...rest } = chainInfo.feeCurrencies[0];
  const addressPrefix = chainInfo.bech32Config.bech32PrefixAccAddr;
  let testnetData = {};
  if (chainInfo?.rpcTest || chainInfo?.restTest) {
    testnetData = {
      testnetChainId: chainInfo.chainId,
      testnetChainRegistryPath: chainInfo.chainRegistryPath ?? addressPrefix,
    };
  }
  return {
    chainId: chainInfo.chainId,
    chainName: chainInfo.chainName,
    chainRegistryPath: chainInfo.chainRegistryPath ?? addressPrefix,
    key: chainInfo.chainRegistryPath as SupportedChain,
    chainSymbolImageUrl: chainInfo?.image,
    txExplorer: {
      mainnet: chainInfo.txExplorer?.mainnet,
      testnet: chainInfo.txExplorer?.testnet,
    },
    apis,
    denom: rest.coinDenom as Denom,
    bip44: {
      coinType: `${chainInfo.bip44.coinType}` as CoinType,
    },
    addressPrefix: addressPrefix as AddressPrefix,
    gasPriceStep: gasPriceStep,
    ibcChannelIds: {},
    nativeDenoms: {
      [rest.coinMinimalDenom as string]: {
        ...rest,
        chain: chainInfo.chainRegistryPath,
      } as NativeDenom,
    },
    theme: chainInfo.theme || {
      primaryColor: '#E18881',
      gradient: 'linear-gradient(180deg, rgba(225, 136, 129, 0.32) 0%, rgba(225, 136, 129, 0) 100%)',
    },
    enabled: chainInfo.status === 'live',
    beta: true,
    features: chainInfo.features || [],
    apiStatus: chainInfo?.apiStatus,
    cosmosSDK: chainInfo?.cosmosSDK,
    ...testnetData,
  };
}
