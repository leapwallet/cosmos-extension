import create from 'zustand';

type AirdropsData = {
  airdropsData: Record<string, any> | undefined | null;
  setAirdropsData: (data: Record<string, any> | undefined | null) => void;
};

export const useAirdropsDataStore = create<AirdropsData>((set) => ({
  airdropsData: null,
  setAirdropsData: (data) =>
    set(() => {
      return { airdropsData: data };
    }),
}));

export const useAirdropsData = () => {
  const { airdropsData } = useAirdropsDataStore();
  return airdropsData;
};
