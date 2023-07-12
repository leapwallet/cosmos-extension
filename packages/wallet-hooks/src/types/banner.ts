import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';

export type BannerADType = 'popup' | 'redirect-interanlly' | 'redirect-external';

export type BannerAD = {
  id: string;
  image_url: string;
  redirect_url: string;
  banner_type: BannerADType;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
};

export type BannerData = Record<string, BannerAD[]>;
