import create from 'zustand';

import { SupportedCurrencies } from '../types/currencies';

export type PreferredCurrencyStore = {
  preferredCurrency: SupportedCurrencies;
  setPreferredCurrency: (preferredCurrency: SupportedCurrencies) => void;
};

export const usePreferredCurrencyStore = create<PreferredCurrencyStore>((set) => ({
  preferredCurrency: 'US',
  setPreferredCurrency: (preferredCurrency: SupportedCurrencies) => set(() => ({ preferredCurrency })),
}));
