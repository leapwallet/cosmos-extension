import { Fee } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import create from 'zustand';

type DappDefaultStore = {
  defaultFee: Fee | null;
  setDefaultFee: (defaultFee: Fee | null) => void;
};

/**
 * @description Please use `DappDefaultFeeStore` from `@leapwallet/cosmos-wallet-store` instead of this hook
 * You must keep the state in sync with the mobx store until we remove all the instances of this hook
 */
export const useDappDefaultFeeStore = create<DappDefaultStore>((set) => ({
  defaultFee: null,
  setDefaultFee: (defaultFee: Fee | null) => set(() => ({ defaultFee })),
}));

export const useDappDefaultFee = () => {
  const { defaultFee } = useDappDefaultFeeStore();
  return { defaultFee };
};
