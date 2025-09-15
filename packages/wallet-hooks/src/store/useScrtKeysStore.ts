import { Permit } from '@leapwallet/cosmos-wallet-sdk/dist/browser/proto/secret';
import create from 'zustand';

type ScrtKeyStore = {
  viewingKeys: Record<string, Record<string, string>>;
  queryPermits: Record<string, { contracts: Array<string>; permit: Permit }>;
  setViewingKeys: (keys: Record<string, Record<string, string>>) => void;
  setQueryPermits: (permit: Record<string, { contracts: Array<string>; permit: Permit }>) => void;
};

export const useScrtKeysStore = create<ScrtKeyStore>((set) => {
  return {
    viewingKeys: {},
    queryPermits: {},
    setViewingKeys: (keys) => set(() => ({ viewingKeys: keys })),
    setQueryPermits: (permits) => set(() => ({ queryPermits: permits })),
  };
});
