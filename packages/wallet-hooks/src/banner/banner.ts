import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useMemo } from 'react';

import {
  ALL_CHAIN_BANNERS,
  BannerAD,
  BannerADType,
  BannerData,
  NumiaBannerAD,
  NumiaBannerAttribute,
  NumiaTrackAction,
} from '../types/banner';
import { getNumiaBannerBearer, storage, useGetStorageLayer } from '../utils';
import { cachedRemoteDataWithLastModified } from '../utils/cached-remote-data';

const NUMIA_BASE_URL = 'https://filament.numia.xyz';

export const getBannerDetailsData = (storage: storage): Promise<BannerData> => {
  return cachedRemoteDataWithLastModified({
    remoteUrl: 'https://assets.leapwallet.io/banner/banner-v2.json',
    storageKey: 'banner-ad-data',
    storage,
  });
};

export function useGetBannerApi() {
  const storage = useGetStorageLayer();

  return useQuery<BannerData>(['banner-ad-data'], async () => getBannerDetailsData(storage), {
    retry: 2,
    cacheTime: 1000 * 10, // 10 seconds
    staleTime: 0,
  });
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

export function useGetNumiaBanner(address: string, positionIds: string[]) {
  const numiaBearer = getNumiaBannerBearer();

  return useQuery(['numia-banner-ad-data', address, positionIds], async () => {
    const responses = await Promise.allSettled(
      positionIds.map(async (positionId) => {
        const URL = `${NUMIA_BASE_URL}/campaign/${address}?position_id=${positionId}`;
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
  });
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
  const { data } = useQuery<BannerData>(['banner-ad-data']);

  /*
   * We want to display banners in the following order:
   * 1. Banners for the current chain
   * 2. Banners for all chains
   */
  const combinedBannerDataToDisplay = useMemo(() => {
    const chainData = (data?.[chain] as BannerAD[]) ?? [];
    const allChainData = (data?.[ALL_CHAIN_BANNERS] as BannerAD[]) ?? [];

    return [...chainData, ...allChainData].sort((a, b) =>
      (String(a?.display_position) ?? '0') > (String(b?.display_position) ?? '0') ? 1 : -1,
    );
  }, [data, chain]);

  return combinedBannerDataToDisplay;
}
