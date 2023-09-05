import { Validator } from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const validatorImageCache = new Map<string, string>();

export const useValidatorImage = (validator: Validator | undefined) => {
  return useQuery<string>({
    queryKey: ['validator-keybase-image', validator?.address, validator?.description?.identity],
    queryFn: async () => {
      if (validator?.description?.identity) {
        const cachedImage = validatorImageCache.get(validator.description.identity);
        if (cachedImage) {
          return cachedImage;
        }
        try {
          const { data } = await axios.get(
            `https://keybase.io/_/api/1.0/user/user_search.json?q=${validator.description.identity}&num_wanted=1`,
          );
          const { keybase } = data.list[0];
          validatorImageCache.set(validator.description.identity, keybase.picture_url);

          return keybase.picture_url;
        } catch (_) {
          return undefined;
        }
      } else {
        return undefined;
      }
    },
    enabled: validator?.description?.identity !== undefined,
    retry(failureCount: number, error: any) {
      if (error.response?.status === 404 || error.response?.status === 429) {
        return false;
      }
      return failureCount < 3;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};
