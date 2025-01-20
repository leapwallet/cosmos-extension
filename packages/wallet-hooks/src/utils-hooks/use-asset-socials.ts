import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';

export async function getSocials(key: string | undefined): Promise<
  | {
      type: 'website' | 'twitter' | 'telegram';
      url: string;
    }[]
  | undefined
> {
  if (!key) {
    return undefined;
  }

  try {
    const { data } = await axios.get(`https://api.leapwallet.io/assets/socials?ids=${key}`);

    return data[key]?.links;
  } catch (e) {
    console.error((e as Error)?.message ?? e);
    return undefined;
  }
}

export const useAssetSocials = (
  coingeckoId: string | undefined,
): UseQueryResult<Awaited<ReturnType<typeof getSocials>>> => {
  return useQuery({
    queryKey: ['socials', coingeckoId],
    queryFn: () => getSocials(coingeckoId),
    enabled: !!coingeckoId,
  });
};
