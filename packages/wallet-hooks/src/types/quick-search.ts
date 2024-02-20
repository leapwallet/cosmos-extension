import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';

export interface OptionPlatformConfig {
  action_type: 'no-redirect' | 'redirect-internal' | 'redirect-external';
  redirect_url?: string;
}

export interface QuickSearchOption {
  action_name: string;
  action_icon_url: string;
  action_light_icon_url: string;
  visible_on: {
    platforms: ('All' | 'Extension' | 'Mobile' | 'Dashboard')[];
    chains: ('All' | SupportedChain)[];
  };
  tags: { name: string; background_color: string }[];
  show_in_list: boolean;
  show_in_search: boolean;
  extension_config?: OptionPlatformConfig;
  mobile_config?: OptionPlatformConfig;
  dashboard_config?: OptionPlatformConfig;
}

export interface DApp {
  key: string;
  title: string;
  chain?: string;
  types?: string[];
  order: number;
  keywords?: string[];
  subtitle?: string;
  host: string;
  url: string;
  icon?: string;
}

export interface DappType {
  key: string;
  label: string;
  position: number;
  visible: boolean;
}
