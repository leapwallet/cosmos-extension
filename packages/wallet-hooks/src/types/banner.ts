export type BannerADType = 'popup' | 'redirect-interanlly' | 'redirect-external' | 'add-chain' | 'switch-chain';

export enum NumiaTrackAction {
  VIEWED = 'viewed',
  CLICKED = 'clicked',
}

export const ALL_CHAIN_BANNERS = 'ALL_CHAIN_BANNERS';

export type NumiaBannerAttribute = {
  campaign_id: number;
  campaign_name: string;
  audience_id: number;
  audience_name: string;
  position_id?: string;
};

export type BannerAD = {
  id: string;
  image_url: string;
  redirect_url: string;
  banner_type: BannerADType;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  position_id?: string;
  display_position?: string;
  attributes?: NumiaBannerAttribute;
  visibleOn?: 'ALL' | 'EXTENSION' | 'MOBILE';
};

export type NumiaBannerAD = NumiaBannerAttribute & {
  campaign_owner: string;
  campaign_topic: string;
  address: string;
  creatives: {
    position_id: 'leap_wallet_home';
    logo: string;
    title: string;
    body: string;
    cta: string;
    url: string;
    banner_url: string;
  };
  start_date: string;
  end_date: string;
};

export type BannerData = Record<string, BannerAD[]>;
