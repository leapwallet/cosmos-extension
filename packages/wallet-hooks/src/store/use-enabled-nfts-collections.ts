import create from 'zustand';

import { useActiveChain } from './useActiveChain';

type EnabledNftsCollections = {
  enabledNftsCollections: { [chain: string]: string[] } | null;
  setEnabledNftsCollections: (enabledNftsCollections: { [chain: string]: string[] } | null) => void;
};

export const useEnabledNftsCollectionsStore = create<EnabledNftsCollections>((set) => ({
  enabledNftsCollections: null,
  setEnabledNftsCollections: (enabledNftsCollections) => set(() => ({ enabledNftsCollections })),
}));

export const useEnabledNftsCollections = (forceChain?: string) => {
  const activeChain = useActiveChain();
  const { enabledNftsCollections } = useEnabledNftsCollectionsStore();
  return (enabledNftsCollections ?? {})[forceChain ?? activeChain] ?? [];
};
