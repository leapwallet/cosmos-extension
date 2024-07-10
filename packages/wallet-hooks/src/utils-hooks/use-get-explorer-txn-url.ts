import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useCallback, useMemo } from 'react';

import { useSelectedNetwork } from '../store';
import { removeTrailingSlash, SelectedNetworkType } from '../utils';
import { useChainInfo } from './use-chain-info';

type UseGetExplorerTxnUrlParams = {
  forceChain?: SupportedChain;
  forceNetwork?: SelectedNetworkType;
  forceTxHash?: string;
};

export function useGetExplorerTxnUrl({ forceChain, forceTxHash, forceNetwork }: UseGetExplorerTxnUrlParams) {
  const chainInfo = useChainInfo(forceChain);
  const forcedTxnHash = useMemo(
    function getTxnHash() {
      return forceTxHash || '';
    },
    [forceTxHash],
  );

  const _activeNetwork = useSelectedNetwork();
  const activeNetwork = useMemo(
    function getActiveNetwork() {
      return forceNetwork || _activeNetwork;
    },
    [_activeNetwork, forceNetwork],
  );

  const getExplorerTxnUrl = useCallback(
    function getExplorerAccountUrl(txnHash?: string, txnUrl?: string) {
      if (!txnUrl) {
        if (!chainInfo) return undefined;
        if (!chainInfo.txExplorer) return undefined;
        if (!chainInfo.txExplorer[activeNetwork]?.txUrl) return undefined;
      }

      const _txnUrl = removeTrailingSlash(txnUrl || chainInfo.txExplorer?.[activeNetwork]?.txUrl);
      const _txnHash = txnHash || forcedTxnHash;

      let _explorerTxnUrl = '';

      if (_txnUrl?.includes('PLACEHOLDER_FOR_TX_HASH')) {
        _explorerTxnUrl = _txnUrl.replace('PLACEHOLDER_FOR_TX_HASH', _txnHash);
      } else {
        _explorerTxnUrl = `${_txnUrl}/${_txnHash}`;
      }

      return removeTrailingSlash(_explorerTxnUrl);
    },
    [activeNetwork, chainInfo, forcedTxnHash],
  );

  const explorerTxnUrl = useMemo(() => getExplorerTxnUrl(), [activeNetwork, chainInfo, forcedTxnHash]);
  return { explorerTxnUrl, getExplorerTxnUrl };
}
