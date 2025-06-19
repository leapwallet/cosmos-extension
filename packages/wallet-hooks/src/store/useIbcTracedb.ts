import { useEffect } from 'react';
import create from 'zustand';

import { LeapWalletApi } from '../apis/LeapWalletApi';

export type IbcDenomData = {
  path: string;
  baseDenom: string;
  originChainId: string;
  sourceChainId?: string;
  channelId: string;
};

type IbcDenomRecord = Record<string, IbcDenomData>;

type IbcTraceStore = {
  ibcTraceData: IbcDenomRecord;
  setIbcTraceData: (data: IbcDenomRecord) => void;
  addIbcTraceData: (data: IbcDenomRecord) => void;
};

export const useIbcTraceStore = create<IbcTraceStore>((set) => ({
  ibcTraceData: {},
  setIbcTraceData: (data: IbcDenomRecord) => set({ ibcTraceData: data }),
  addIbcTraceData: (data: IbcDenomRecord) => set((state) => ({ ibcTraceData: { ...state.ibcTraceData, ...data } })),
}));

const ibcStoreUrl = 'https://assets.leapwallet.io/cosmos-registry/v1/denom-trace/base.json';

export const initIbcTraceStore = async () => {
  const res = await fetch(ibcStoreUrl);
  const data = await res.json();
  useIbcTraceStore.getState().setIbcTraceData(data);
};

export const useInitIbcTraceStore = () => {
  useEffect(() => {
    initIbcTraceStore();
  }, []);
};

export const fetchIbcTrace = async (ibcHash: string, lcdUrl: string, chainId: string) => {
  const data = await LeapWalletApi.getIbcDenomData(ibcHash, lcdUrl, chainId);
  return data;
};
