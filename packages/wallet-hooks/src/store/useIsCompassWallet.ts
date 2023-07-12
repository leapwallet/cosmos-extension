import create from 'zustand';

type IsCompassWalletState = {
  isCompassWallet: boolean;
  setIsCompassWallet: (isCompassWallet: boolean) => void;
};

export const useIsCompassWalletStore = create<IsCompassWalletState>((set) => ({
  isCompassWallet: false,
  setIsCompassWallet: (isCompassWallet) => set(() => ({ isCompassWallet })),
}));

export const useIsCompassWallet = () => useIsCompassWalletStore((state) => state.isCompassWallet);

export const useSetIsCompassWallet = () => {
  const { setIsCompassWallet } = useIsCompassWalletStore();
  return setIsCompassWallet;
};
