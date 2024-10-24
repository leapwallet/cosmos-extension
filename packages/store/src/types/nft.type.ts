import { Dict, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';

export type NftAttribute = {
  trait_type: string;
  value: string;
};

export interface Collection {
  chain: SupportedChain;
  name: string;
  address: string;
  image: string;
  totalNfts: number;
}

export type NftInfo = {
  name: string;
  extension: Dict | null;
  image?: string;
  tokenUri?: string;
  tokenId?: string;
  description?: string;
  collection: {
    name: string;
    address: string;
    image: string;
  };
  domain?: string;
  media_type?: string;
  attributes?: NftAttribute[];
  server_response?: NftResponse;
};

export interface CollectionData {
  collections: Collection[];
  nfts: { [key: string]: NftInfo[] };
}

export interface NftCollection {
  name: string;
  address: string;
  image?: string;
}

export interface BatchRequestData {
  'chain-id': string;
  'wallet-address': string;
  'evm-address': string;
  'is-testnet': string;
  'rpc-url': string;
  collections: NftCollection[];
}

export interface ExtensionResponse {
  name: string;
  image: null;
  domain: string;
  expiry: number;
  created: number;
  accounts: [];
  websites: [];
  subdomains: [];
  description: string;
}

export interface MediaResponse {
  url: string;
  type: 'image/jpeg' | 'video/mp4';
}

export interface NftResponse {
  name: string;
  description: string;
  tokenId: string;
  tokenUri: null | string;
  extension: ExtensionResponse | null;
  media: {
    text?: string;
    image: MediaResponse;
    video: MediaResponse;
    audio: MediaResponse;
  };
  attributes: NftAttribute[];
  collection: {
    name: string;
    image: string;
    address: string;
  };
}

export interface LeapServerResponse {
  chainId: string;
  walletAddress: string;
  nftDetails: NftResponse[];
  seiApiIsDown: boolean;
}
