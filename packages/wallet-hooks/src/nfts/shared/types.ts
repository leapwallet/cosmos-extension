import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';

import { NftChain } from '../../types';
import { OwnedCollectionTokenInfo, TokensListByCollection } from '../types';

export interface Collection {
  chain: SupportedChain;
  name: string;
  address: string;
  image?: string;
  totalNfts?: number;
  tokensListByCollection?: TokensListByCollection;
  forceChain?: string;
  forceNetwork?: string;
}

export type NftPage = 'ShowNfts' | 'CollectionDetails' | 'NftDetails' | 'ChainNftsDetails';

export interface IsLoading {
  [key: string]: boolean;
}

export type NftDetails = (OwnedCollectionTokenInfo & { chain: SupportedChain }) | null;

export interface CollectionData {
  collections: Collection[];
  nfts: { [key: string]: OwnedCollectionTokenInfo[] };
}

export interface ActivePage {
  setActivePage: React.Dispatch<React.SetStateAction<NftPage>>;
  activePage: NftPage;
}

export interface NftContextType extends ActivePage {
  collectionData: CollectionData | null;
  _collectionData: CollectionData | null;
  isLoading: IsLoading;
  setCollectionData: React.Dispatch<React.SetStateAction<CollectionData | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<IsLoading>>;
  _isLoading: boolean;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  showCollectionDetailsFor: string;
  setShowCollectionDetailsFor: React.Dispatch<React.SetStateAction<string>>;
  nftDetails: NftDetails;
  setNftDetails: React.Dispatch<React.SetStateAction<NftDetails>>;
  nftChains: NftChain[];
  sortedCollectionChains: SupportedChain[];
  showChainNftsFor: SupportedChain;
  setShowChainNftsFor: React.Dispatch<React.SetStateAction<SupportedChain>>;
  setTriggerRerender: React.Dispatch<React.SetStateAction<boolean>>;
  areAllNftsHiddenRef: React.MutableRefObject<boolean>;
  triggerRerender: boolean;
}

/****************** *****************/

export interface FavNftsList extends OwnedCollectionTokenInfo {
  chain: SupportedChain;
}
