import create from 'zustand';

import { TxResponse } from '../types';

export type AggregatedActivity = {
  perChainActivity: {
    [key: string]: {
      txResponse: TxResponse;
    };
  };
};

type AggregatedActivityStore = {
  aggregatedActivity: AggregatedActivity;
  setAggregatedActivity: (aggregatedActivity: AggregatedActivity) => void;
};

export const useAggregatedActivityStore = create<AggregatedActivityStore>((set) => ({
  aggregatedActivity: {
    perChainActivity: {},
  },
  setAggregatedActivity: (aggregatedActivity) =>
    set((prevValue) => {
      const { perChainActivity: newPerChainActivity } = aggregatedActivity;
      const { perChainActivity: prevPerChainActivity } = prevValue.aggregatedActivity;

      const perChainActivity = {
        ...prevPerChainActivity,
        ...newPerChainActivity,
      };

      return {
        aggregatedActivity: {
          perChainActivity,
        },
      };
    }),
}));

export const useAggregatedActivity = () => {
  const { aggregatedActivity } = useAggregatedActivityStore();
  return aggregatedActivity;
};
