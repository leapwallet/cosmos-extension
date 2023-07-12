import { Dict } from '@leapwallet/cosmos-wallet-sdk';
import type { UseQueryOptions } from '@tanstack/react-query';

export type QueryOptions<T> = Omit<UseQueryOptions<T, unknown>, 'queryFn' | 'queryKey'>;

export const defaultQueryOptions: QueryOptions<any> = {
  retry: 3,
  retryDelay: 0,
  networkMode: 'always',
};

export type TokensListByCollection = { collection: { address: string; name: string }; tokens: string[] };

export type NFTInfo = {
  token_uri: string;
  extension: unknown;
};

export type NFTDisplayInformation = {
  name: string;
  image: string;
  properties?: unknown;
  media?: string;
};

export type CollectionInfo = {
  name: string;
  symbol: string;
};

export type NFTDetailedInformation = {
  imgSrc: string;
  name: string;
  collection: string;
  description: string;
  tokenUri: string;
  collectionAddress: string;
  tokenId: string;
};

export type TokenUriModifierFn = (_: string) => string;

export type OwnedCollectionInfo = {
  collection: {
    image: string;
    name: string;
  };
  tokens: {
    image: string;
    name: string;
    tokenUri: string;
    tokenId: string;
    extension: Dict | null;
    collection: {
      name: string;
      contractAddress: string;
    };
  }[];
};
