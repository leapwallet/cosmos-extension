import { ChainInfo } from '../constants';

export const getChainId = (
  chainInfo: ChainInfo | undefined,
  selectedNetwork: string,
  isEvm?: boolean,
): string | undefined => {
  if (isEvm) {
    return selectedNetwork === 'testnet' ? chainInfo?.evmChainIdTestnet : chainInfo?.evmChainId;
  }

  return selectedNetwork === 'testnet' ? chainInfo?.testnetChainId : chainInfo?.chainId;
};
