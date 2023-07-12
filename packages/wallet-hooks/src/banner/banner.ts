import { useQuery } from '@tanstack/react-query';
import { BannerAD, BannerData } from 'types/banner';

export function useGetBannerApi() {
  return useQuery<BannerData>(
    ['banner-ad-data'],
    async () => {
      const res = await fetch('https://assets.leapwallet.io/banner/banner.json');
      const data: BannerData = await res.json();
      return data;
    },
    {
      retry: 2,
    },
  );
}

export function useGetBannerData(chain: string) {
  const { data } = useQuery<BannerData>(['banner-ad-data']);
  return data?.[chain] as BannerAD[];
}
