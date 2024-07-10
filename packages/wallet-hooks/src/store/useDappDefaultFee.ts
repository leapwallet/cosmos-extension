import { Fee } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import create from 'zustand';

type DappDefaultStore = {
  defaultFee: Fee | null;
  setDefaultFee: (defaultFee: Fee | null) => void;
};

export const useDappDefaultFeeStore = create<DappDefaultStore>((set) => ({
  defaultFee: null,
  setDefaultFee: (defaultFee: Fee | null) => set(() => ({ defaultFee })),
}));

export const useDappDefaultFee = () => {
  const { defaultFee } = useDappDefaultFeeStore();
  return { defaultFee };
};
