import { QueryStatus, useQuery } from '@tanstack/react-query';
import axios from 'axios';

import {
  ALL_CHAIN_BANNERS,
  BannerAD,
  BannerADType,
  BannerData,
  NumiaBannerAD,
  NumiaBannerAttribute,
  NumiaTrackAction,
  SpindlApiResponse,
} from '../types/banner';
import {
  APP_NAME,
  getAppName,
  getNumiaBannerBearer,
  getSpindlBannerToken,
  storage,
  useGetStorageLayer,
} from '../utils';
import { cachedRemoteDataWithLastModified } from '../utils/cached-remote-data';

const NUMIA_BASE_URL = 'https://filament.numia.xyz';
const SPINDL_BASE_URL = 'https://e.spindlembed.com/v1';
const LEAP_BANNER_URL = 'https://assets.leapwallet.io/banner/banner-v3.json';
const COMPASS_BANNER_URL = 'https://assets.leapwallet.io/banner/compass-banner-v3.json';

export const getBannerDetailsData = (storage: storage, isCompassWallet: boolean): Promise<BannerData> => {
  return cachedRemoteDataWithLastModified({
    remoteUrl: isCompassWallet ? COMPASS_BANNER_URL : LEAP_BANNER_URL,
    storageKey: 'banner-ad-data',
    storage,
  });
};

export function useGetBannerApi() {
  /**
   * We are using `getAppName()` here to determine if we are in the Compass Wallet, instead of using the `useIsCompassWallet` hook.
   * This is because the `useIsCompassWallet` hook is initialized at the same time as `useFeatureFlags`,
   * which causes an initial network request to get the Leap Cosmos's feature flags.
   * However, this is not necessary for the Compass Wallet.
   * On the other hand, `getAppName()` is initialized before `useFeatureFlags` is called for the first time,
   * ensuring that the correct feature-flag files are fetched.
   */
  const isCompassWallet = getAppName() === APP_NAME.Compass;
  const storage = useGetStorageLayer();

  return useQuery<BannerData>(
    [`query-${isCompassWallet}-banner-ad-data`],
    async () => getBannerDetailsData(storage, isCompassWallet),
    {
      retry: 2,
      cacheTime: 1000 * 10, // 10 seconds
      staleTime: 0,
    },
  );
}

export type BannerConfig = {
  extension: {
    'auto-scroll-duration': number;
    'position-ids': string[];
  };
};

export const getBannerConfig = (storage: storage): Promise<BannerConfig> => {
  return cachedRemoteDataWithLastModified({
    remoteUrl: 'https://assets.leapwallet.io/cosmos-registry/v1/config/banners.json',
    storageKey: 'banner-config-data',
    storage,
  });
};

export function useBannerConfig() {
  const storage = useGetStorageLayer();

  return useQuery<BannerConfig>(['banner-config-data'], () => getBannerConfig(storage), {
    retry: 2,
  });
}

export function useGetNumiaBanner(addresses: string[], positionIds: string[], bannerConfigStatus: QueryStatus) {
  const numiaBearer = getNumiaBannerBearer();
  const isCompassWallet = getAppName() === APP_NAME.Compass;

  return useQuery(
    ['numia-banner-ad-data', addresses, positionIds, isCompassWallet, numiaBearer],
    async () => {
      if (isCompassWallet) {
        return [];
      }

      const responses = await Promise.allSettled(
        positionIds.map(async (positionId) => {
          const URL = `${NUMIA_BASE_URL}/campaign/multiple-cointype?position_id=${positionId}&addresses=${addresses.join(
            ',',
          )}`;
          const { data } = await axios.get(URL, {
            headers: {
              Authorization: `Bearer ${numiaBearer}`,
            },
          });

          const bannerList = (data ?? []).map((banner: NumiaBannerAD) => {
            return {
              start_date: banner.start_date,
              end_date: banner.end_date,
              description: banner.creatives.body,
              title: banner.creatives.title,
              banner_type: 'redirect-external' as BannerADType,
              id: `numia-campaign-${banner.campaign_id}-banner-${banner.audience_id}`,
              redirect_url: banner.creatives.url,
              image_url: banner.creatives.banner_url,
              mobile_config: {
                redirect_url: banner.creatives.url,
                image_url: banner.creatives.banner_url,
              },
              logo: banner.creatives.logo,
              visibleOn: 'ALL',
              attributes: {
                position_id: positionId,
                campaign_id: banner.campaign_id,
                campaign_name: banner.campaign_name,
                audience_id: banner.audience_id,
                audience_name: banner.audience_name,
              },
            };
          });

          return bannerList;
        }),
      );

      return responses.reduce((acc: BannerAD[], curr) => {
        if (curr.status === 'fulfilled') {
          return [...acc, ...curr.value];
        }

        return acc;
      }, []);
    },
    {
      enabled: bannerConfigStatus !== 'loading',
      cacheTime: 1000 * 60 * 5,
      staleTime: 1000 * 60 * 5,
    },
  );
}

export async function postNumiaEvent(address: string, action: NumiaTrackAction, attributes: NumiaBannerAttribute) {
  const data = {
    name: `ad_${action}`,
    identity: {
      type: 'address',
      id: address,
    },
    attributes: {
      ...attributes,
    },
    timestamp: Date.now(),
  };
  const numiaBearer = getNumiaBannerBearer();

  try {
    await fetch(`${NUMIA_BASE_URL}/track`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${numiaBearer}`,
      },
      body: JSON.stringify(data),
      keepalive: true,
    });
  } catch (_) {
    //
  }
}

export function useGetBannerData(chain: string) {
  const { data, status } = useGetBannerApi();

  const { data: leapBanners, status: leapBannersStatus } = useQuery<BannerAD[]>(
    [`${chain}-banner-ad-data`, chain, data],
    function () {
      /*
       * We want to display banners in the following order:
       * 1. Banners for the current chain
       * 2. Banners for all chains
       */

      const chainData = (data?.[chain] as BannerAD[]) ?? [];
      const _allChainData = (data?.[ALL_CHAIN_BANNERS] as BannerAD[]) ?? [];

      const allChainData = _allChainData.filter(
        (banner) => !chain || !banner.exclude_chain_ids || !banner.exclude_chain_ids?.split(',').includes(chain),
      );

      return [...chainData, ...allChainData].sort((a, b) =>
        (String(a?.display_position) ?? '0') > (String(b?.display_position) ?? '0') ? 1 : -1,
      );
    },
    {
      enabled: status !== 'loading',
      cacheTime: 1000 * 60 * 5,
      staleTime: 1000 * 60 * 5,
    },
  );

  return { leapBanners, isLeapBannersLoading: leapBannersStatus === 'loading' || status === 'loading' };
}

export function useGetSpindlBanner(address: string) {
  const spindlBannerToken = getSpindlBannerToken();
  const isCompassWallet = getAppName() === APP_NAME.Compass;

  return useQuery(
    ['spindl-banner-ad-data', isCompassWallet, spindlBannerToken],
    async () => {
      if (isCompassWallet) {
        return [];
      }

      const res = await axios.get<SpindlApiResponse>(
        `${SPINDL_BASE_URL}/render/leap_wallet?placement_id=home_tab_banner_carousel&limit=1&address=${address}`,
        {
          headers: {
            'X-API-ACCESS-KEY': spindlBannerToken,
          },
        },
      );

      const bannerList: BannerAD[] = res.data.items.map((item) => {
        return {
          start_date: new Date(Date.now() - 86400000).toISOString(),
          end_date: new Date(Date.now() + 86400000).toISOString(),
          description: item.description,
          title: item.title,
          banner_type: 'redirect-external' as BannerADType,
          id: `spindl-banner-${item.id}`,
          redirect_url: item.ctas[0].href,
          image_url: item.imageUrl,
          visibleOn: 'ALL',
          spindl_attributes: {
            impression_id: item.impressionId,
          },
        };
      });

      return bannerList;
    },
    {
      enabled: !!address,
      cacheTime: 1000 * 60 * 5,
      staleTime: 1000 * 60 * 5,
    },
  );
}

export async function postSpindlEvent(action: NumiaTrackAction, impression_id: string) {
  const data = {
    type: action === NumiaTrackAction.CLICKED ? 'click' : 'impression',
    impression_id,
  };
  const spindlBannerToken = getSpindlBannerToken();

  try {
    await axios.post(`${SPINDL_BASE_URL}/external/track`, data, {
      headers: {
        'X-API-ACCESS-KEY': spindlBannerToken,
      },
    });
  } catch (_) {
    //
  }
}
