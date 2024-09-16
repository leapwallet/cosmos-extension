import { Provider } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

type Status = 'loading' | 'success' | 'error';

type StakeProvidersStore = {
  providers: Provider[];
  providersStatus: Status;
  refetchProviders: () => Promise<void>;

  setStakeProviders: (providers: Provider[]) => void;
  setStakeProvidersStatus: (providersStatus: Status) => void;
  setStakeProvidersRefetch: (refetchProviders: () => Promise<void>) => void;
};

export const useDualStakeProvidersStore = create<StakeProvidersStore>((set) => ({
  providers: [],
  providersStatus: 'loading',
  refetchProviders: async function () {
    await Promise.resolve();
  },

  setStakeProviders: (providers) => set(() => ({ providers })),
  setStakeProvidersStatus: (providersStatus) => set(() => ({ providersStatus })),
  setStakeProvidersRefetch: (refetchProviders) => set(() => ({ refetchProviders })),
}));

export const useDualStakeProviders = () => {
  const { providers, providersStatus } = useDualStakeProvidersStore();
  return { providers, providersStatus };
};
