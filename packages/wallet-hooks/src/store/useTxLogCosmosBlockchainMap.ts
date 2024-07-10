import create from 'zustand';

import { TX_LOG_COSMOS_BLOCKCHAIN_MAP } from '../config/tx-log-cosmos-blockchain-map';

type TxLogCosmosBlockchainMap = Record<string, string>;
type TxLogCosmosBlockchainMapStore = {
  txLogCosmosBlockchainMap: TxLogCosmosBlockchainMap;
  setTxLogCosmosBlockchainMap: (txLogCosmosBlockchainMap: TxLogCosmosBlockchainMap) => void;
};

export const getTxLogCosmosBlockchainMapStoreSnapshot = (): Promise<TxLogCosmosBlockchainMap> => {
  const currentState = useTxLogCosmosBlockchainMapStore.getState().txLogCosmosBlockchainMap;

  if (currentState === null) {
    return new Promise((resolve) => {
      const unsubscribe = useTxLogCosmosBlockchainMapStore.subscribe((state) => {
        if (state.txLogCosmosBlockchainMap !== null) {
          unsubscribe();
          resolve(state.txLogCosmosBlockchainMap);
        }
      });
    });
  }

  return Promise.resolve(currentState);
};

export const useTxLogCosmosBlockchainMapStore = create<TxLogCosmosBlockchainMapStore>((set) => ({
  txLogCosmosBlockchainMap: TX_LOG_COSMOS_BLOCKCHAIN_MAP,
  setTxLogCosmosBlockchainMap: (txLogCosmosBlockchainMap) => set(() => ({ txLogCosmosBlockchainMap })),
}));

export const useTxLogCosmosBlockchainMap = () => {
  const { txLogCosmosBlockchainMap } = useTxLogCosmosBlockchainMapStore();
  return txLogCosmosBlockchainMap ?? TX_LOG_COSMOS_BLOCKCHAIN_MAP;
};
