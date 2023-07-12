import create from 'zustand';

type TxMetadataState = {
  txMetadata: any;
  setTxMetadata: (txMetadata: any) => void;
};

export const useTxMetadataStore = create<TxMetadataState>((set) => ({
  txMetadata: {},
  setTxMetadata: (chain: any) => set(() => ({ txMetadata: chain })),
}));

export const useTxMetadata = () => useTxMetadataStore((state) => state.txMetadata);

export const useSetTxMetadata = () => {
  const { setTxMetadata } = useTxMetadataStore();
  return setTxMetadata;
};
