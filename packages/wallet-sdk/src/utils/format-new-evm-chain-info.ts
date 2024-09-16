import { defaultGasPriceStep } from '../constants';

export interface NewEvmChainInfo {
  chainId: number;
  chainName: string;
  nativeCurrency: {
    name?: string;
    symbol: string;
    decimals: number;
  };
  rpcUrl: string;
  blockExplorerUrl?: string;
  iconUrl?: string;
}

export function formatNewEvmChainInfo(chainInfo: NewEvmChainInfo) {
  const chainId = chainInfo.chainId.toString();
  const chainKey = (chainInfo.chainName ?? chainInfo.chainId)?.toLowerCase().replace(/\s/g, '_');
  const rpcUrl = chainInfo.rpcUrl;
  let addressPrefix = '';
  if (chainInfo.chainName) {
    const firstWord = chainInfo.chainName.split(' ')[0];
    addressPrefix = firstWord.toLowerCase();
  } else if (chainInfo.chainId) {
    addressPrefix = chainInfo.chainId.toString();
  }

  const txExplorer: { mainnet?: any } = {};
  if (chainInfo.blockExplorerUrl) {
    txExplorer['mainnet'] = {
      name: chainInfo.chainName,
      txUrl: `${chainInfo.blockExplorerUrl}/tx`,
      accountUrl: `${chainInfo.blockExplorerUrl}/address`,
    };
  }

  return {
    chainId,
    evmChainId: chainId,
    key: chainKey,
    chainName: chainInfo.chainName,
    chainRegistryPath: chainKey,
    chainSymbolImageUrl: chainInfo.iconUrl ?? '',
    apis: {
      rpc: rpcUrl,
      evmJsonRpc: rpcUrl,
    },
    denom: chainInfo.nativeCurrency.symbol,
    bip44: {
      coinType: '60',
    },
    addressPrefix: addressPrefix,
    txExplorer,
    gasPriceStep: defaultGasPriceStep,
    nativeDenoms: {
      [chainInfo.nativeCurrency.symbol]: {
        name: chainInfo.nativeCurrency.name ?? chainInfo.nativeCurrency.symbol,
        coinDenom: chainInfo.nativeCurrency.symbol,
        coinMinimalDenom: chainInfo.nativeCurrency.symbol,
        coinDecimals: chainInfo.nativeCurrency.decimals,
        coinGeckoId: '',
        icon: chainInfo.iconUrl ?? '',
        chain: chainKey,
      },
    },
    theme: {
      primaryColor: '#ff6b6b',
      gradient: 'linear-gradient(180deg, rgba(255, 107, 107, 0.32) 0%, rgba(255, 107, 107, 0) 100%)',
    },
    beta: true,
    enabled: true,
    evmOnlyChain: true,
  };
}
