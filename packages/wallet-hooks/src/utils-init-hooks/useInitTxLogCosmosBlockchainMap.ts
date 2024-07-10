import { useEffect } from 'react';

import { useTxLogCosmosBlockchainMapStore } from '../store';
import { cachedRemoteDataWithLastModified, storage, useGetStorageLayer } from '../utils';

export function getTxLogCosmosBlockchainMap(storage: storage): Promise<Record<string, string>> {
  return cachedRemoteDataWithLastModified({
    remoteUrl: 'https://assets.leapwallet.io/cosmos-registry/v1/config/tx-log-cosmos-blockchain-map.json',
    storageKey: 'tx-log-cosmos-blockchain-map',
    storage,
  });
}

export function useInitTxLogCosmosBlockchainMap() {
  const storage = useGetStorageLayer();
  const { setTxLogCosmosBlockchainMap } = useTxLogCosmosBlockchainMapStore();

  useEffect(() => {
    (async function initTxLogCosmosBlockchainMap() {
      const txLogCosmosBlockchainMap = await getTxLogCosmosBlockchainMap(storage);
      setTxLogCosmosBlockchainMap(txLogCosmosBlockchainMap);
    })();
  }, []);
}
