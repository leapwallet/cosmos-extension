import { AirdropEligibilityInfo } from 'utils';
import create from 'zustand';

type AirdropsEligibilityData = {
  airdropsEligibilityData: Record<string, AirdropEligibilityInfo> | null;
  setAirdropsEligibilityData: (data: Record<string, AirdropEligibilityInfo> | null) => void;
};

export const useAirdropsEligibilityDataStore = create<AirdropsEligibilityData>((set) => ({
  airdropsEligibilityData: null,
  setAirdropsEligibilityData: (data) =>
    set(() => {
      return { airdropsEligibilityData: data };
    }),
}));

export const useAirdropsEligibilityData = () => {
  const { airdropsEligibilityData } = useAirdropsEligibilityDataStore();
  return airdropsEligibilityData;
};
