import create from 'zustand';

export type CategoryId = string;

export interface CategoryData {
  label: string;
  position: number;
  description: string;
  visible: boolean;
}

export interface DappData {
  chain: string;
  category: CategoryId[];
  name: string;
  description: string;
  website: string;
  logo: string;
  visible: boolean;
}

export interface ProductData {
  chain: string;
  dappCategory: CategoryId;
  dappName: string;
  productName: string;
  productWebsite: string;
  productDescription: string;
  tokens: string[];
  tvl: number;
  apr: number;
  visible: boolean;
}

export interface InvestData {
  dappCategories: Record<CategoryId, CategoryData>;
  dapps: Record<number, DappData>;
  products: Record<number, ProductData>;
  disclaimer: string;
}

export type InvestDataState =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'success'; data: InvestData };

export type InvestDataStore = {
  investData: InvestDataState;
  setInvestData: (data: InvestDataState | null) => void;
};

export const useInvestDataStore = create<InvestDataStore>((set) => ({
  investData: { status: 'loading' },
  setInvestData: (state) => {
    set(() => {
      return {
        investData: state ?? { status: 'loading' },
      };
    });
  },
}));

export const useInvestData = () => {
  const { investData } = useInvestDataStore();
  return investData;
};
