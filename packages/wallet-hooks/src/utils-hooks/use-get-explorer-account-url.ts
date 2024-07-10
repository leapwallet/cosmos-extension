import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useCallback, useMemo } from 'react';

import { useAddress, useSelectedNetwork } from '../store';
import { removeTrailingSlash, SelectedNetworkType } from '../utils';
import { useChainInfo } from './index';

type UseGetExplorerAccountUrlParams = {
  forceChain?: SupportedChain;
  forceNetwork?: SelectedNetworkType;
  forceAddress?: string;
};

export function useGetExplorerAccountUrl({ forceChain, forceAddress, forceNetwork }: UseGetExplorerAccountUrlParams) {
  const chainInfo = useChainInfo(forceChain);

  const _activeAddress = useAddress(forceChain);
  const activeAddress = useMemo(
    function getActiveAddress() {
      return forceAddress || _activeAddress;
    },
    [forceAddress, _activeAddress],
  );

  const _activeNetwork = useSelectedNetwork();
  const activeNetwork = useMemo(
    function getActiveNetwork() {
      return forceNetwork || _activeNetwork;
    },
    [_activeNetwork, forceNetwork],
  );

  const getExplorerAccountUrl = useCallback(
    function getExplorerAccountUrl(address?: string, hasToDoNativeAssetUrl?: boolean) {
      if (!chainInfo) return undefined;
      if (!chainInfo.txExplorer) return undefined;
      if (!chainInfo.txExplorer[activeNetwork]?.accountUrl) return undefined;

      let accountUrl = removeTrailingSlash(chainInfo.txExplorer[activeNetwork]?.accountUrl);

      if (hasToDoNativeAssetUrl) {
        const nativeAssetUrlEnd = '/assets/native/';
        let nativeAssetUrl = accountUrl?.replace('/accounts', nativeAssetUrlEnd);

        if (nativeAssetUrl?.endsWith('/address')) {
          nativeAssetUrl = nativeAssetUrl.replace('/address', nativeAssetUrlEnd);
        }

        accountUrl = nativeAssetUrl;
      }

      const _address = address || activeAddress;
      let _explorerAccountUrl = '';

      if (accountUrl?.includes('PLACEHOLDER_FOR_WALLET_ADDRESS')) {
        _explorerAccountUrl = accountUrl.replace('PLACEHOLDER_FOR_WALLET_ADDRESS', _address);
      } else {
        _explorerAccountUrl = `${accountUrl}/${_address}`;
      }

      return removeTrailingSlash(_explorerAccountUrl);
    },
    [activeNetwork, chainInfo, activeAddress],
  );

  const explorerAccountUrl = useMemo(() => getExplorerAccountUrl(), [activeNetwork, chainInfo, activeAddress]);
  return { explorerAccountUrl, getExplorerAccountUrl };
}
