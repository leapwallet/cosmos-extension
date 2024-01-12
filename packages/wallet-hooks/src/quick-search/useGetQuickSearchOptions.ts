import { useQuery } from '@tanstack/react-query';

import { DApp, DappType, QuickSearchOption } from '../types';
import { storage, useGetStorageLayer } from '../utils';
import { cachedRemoteDataWithLastModified } from '../utils/cached-remote-data';

export function getQuickSearchOptions(storage: storage): Promise<QuickSearchOption[]> {
  return cachedRemoteDataWithLastModified({
    remoteUrl: 'https://assets.leapwallet.io/cosmos-registry/v1/quick-search/options.json',
    storageKey: 'quick-search-options',
    storage,
  });
}

export function useGetQuickSearchOptions() {
  const storage = useGetStorageLayer();

  return useQuery<QuickSearchOption[]>(
    ['get-quick-search-options'],
    function () {
      return getQuickSearchOptions(storage);
    },
    { retry: 2 },
  );
}

export function useFetchDappListForQuickSearch() {
  return useQuery(['fetch-dapp-list-for-quick-search'], async function () {
    const res = await fetch('https://assets.leapwallet.io/dapps/dappslist/leap/dapplist-leap-android.json');
    const data = await res.json();
    return data;
  });
}

export function getFilteredDapps(dappList: DApp[], types: DappType[], searchedText: string): QuickSearchOption[] {
  const hasType = (dApp: DApp, searchedText: string) => {
    const res = dApp.types?.filter((typeKey: any) => {
      const type = types.find((type) => type.key === typeKey);
      return type?.label.toLowerCase().includes(searchedText.toLowerCase());
    });

    return res && res?.length > 0;
  };

  const hasKeyword = (dApp: DApp, searchedText: string) => {
    const res = dApp.keywords?.filter((keyword: any) => {
      return keyword.toLowerCase().includes(searchedText.toLowerCase());
    });
    return res && res?.length > 0;
  };

  const filteredDapps = dappList.filter(
    (dApp) =>
      dApp.title.toLowerCase().includes(searchedText.toLowerCase()) ||
      dApp.host.toLowerCase().includes(searchedText.toLowerCase()) ||
      dApp.subtitle?.toLowerCase().includes(searchedText.toLowerCase()) ||
      dApp.url.toLowerCase().includes(searchedText.toLowerCase()) ||
      hasType(dApp, searchedText) ||
      hasKeyword(dApp, searchedText),
  );

  return filteredDapps.map((dapp) => {
    return {
      action_name: dapp.title,
      action_icon_url: dapp.icon ?? '',
      action_light_icon_url: dapp.icon ?? '',
      tags: [],
      show_in_list: false,
      show_in_search: true,
      visible_on: { platforms: ['Extension'], chains: ['All'] },
      extension_config: {
        action_type: 'redirect-external',
        redirect_url: dapp.url,
      },
    };
  });
}
