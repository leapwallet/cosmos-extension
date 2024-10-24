import { OfflineSigner } from '@cosmjs/proto-signing';
import { StdFee } from '@cosmjs/stargate';
import {
  AccountDetails,
  Dict,
  EthermintTxHandler,
  InjectiveTx,
  SigningSscrt,
  SupportedChain,
  Tx,
} from '@leapwallet/cosmos-wallet-sdk';
import { SelectedNetworkType } from '@leapwallet/cosmos-wallet-store';
import { CosmosTxType } from '@leapwallet/leap-api-js';
import { Coin } from '@leapwallet/parser-parfait';
import { FetchStatus, QueryStatus } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import { ReactNode } from 'react';
import { Wallet } from 'secretjs';

import { ActivityCardContent, Token } from '../types';

export type TokensListByCollection = { collection: { address: string; name: string }; tokens: string[] };

export type NftInfoInvestor = {
  address: string;
  allocations: number;
};

export type NFTInfo = {
  token_uri: string;
  extension: Record<string, unknown>;
  investors?: NftInfoInvestor[];
};

export type NFTInfoWithTokenId = {
  tokenUri: string;
  extension: Record<string, unknown>;
  tokenId: string;
};

export type NFTDisplayInformation = {
  name: string;
  image: string;
  properties?: { name: { description: string }; image: { description: string } };
  title?: string;
  media?: string;
};

export type FractionalizedNftInformation = {
  'Tower Name': string;
  Address: string;
  Size: string;
  'Number of Bedrooms': string;
  'Number of Bathrooms': string;
  'Additional Features': string[];
  Images: string[];
};

export type CollectionInfo = {
  name: string;
  contractAddress: string;
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

export type TokenUriModifierFn = (image: string, collection?: string) => string;

export type OwnedCollectionTokenInfo = {
  name: string;
  extension: Dict | null;
  image?: string;
  tokenUri?: string;
  tokenId?: string;
  description?: string;
  collection: {
    name: string;
    contractAddress: string;
    address?: string;
  };
  domain?: string;
  media_type?: string;
  attributes?: NftAttribute[];
};

export type OwnedCollectionInfo = {
  collection: {
    image: string;
    name: string;
  };
  tokens: OwnedCollectionTokenInfo[];
};

export type NftAttribute = {
  trait_type: string;
  value: string;
};

export type OmniflixNft = {
  extension: Dict | null;
  collection: {
    name: string;
    address: string;
    image: string;
  };
  description: string;
  name: string;
  image: string;
  tokenId: string;
  tokenUri: string;
  attributes?: NftAttribute[];
  media_type?: string;
};

export type NftQuery =
  | { all_tokens: unknown }
  | { tokens: { owner: string; limit: number; start_after?: string } }
  | { nft_info: { token_id: string } }
  | { all_nft_info: { token_id: string } };

export type OwnedCollectionOptions = {
  tokenUriModifier?: TokenUriModifierFn;
  forceChain?: SupportedChain;
  forceNetwork?: 'mainnet' | 'testnet';
  paginationLimit?: number;
};

/** Transfer */

export type JsonObject = any;

export interface ExecuteInstruction {
  contractAddress: string;
  msg: JsonObject;
  funds?: readonly Coin[];
}

export type sendNftTokensParams = {
  toAddress: string;
  selectedToken: Token;
  amount: BigNumber;
  memo: string;
  getWallet: () => Promise<OfflineSigner | Wallet>;
  fees: StdFee;
  ibcChannelId?: string;
  txHandler?: SigningSscrt | InjectiveTx | EthermintTxHandler | Tx;
};

export type sendNFTTokensReturnType =
  | { success: false; errors: string[] }
  | {
      success: true;
      pendingTx: ActivityCardContent & {
        txHash?: string;
        promise: Promise<any>;
        txStatus: 'loading' | 'success' | 'failed';
        feeDenomination?: string;
        feeQuantity?: string;
      };
      data?: {
        txHash: string;
        txType: CosmosTxType;
        metadata: Dict;
        feeDenomination: string;
        feeQuantity: string;
      };
    };

export type UseSendNftReturnType = {
  showLedgerPopup: boolean;
  simulateTransferNFTContract: ({
    wallet,
    fromAddress,
    toAddress,
    tokenId,
    collectionId,
    memo,
  }: {
    wallet: OfflineSigner;
    fromAddress: string;
    toAddress: string;
    tokenId: string;
    collectionId: string;
    memo: string;
  }) => Promise<number | undefined>;
  transferNFTContract: any;
  fee: StdFee | undefined;
  allGasOptions: { low: string; medium: string; high: string } | undefined;
  isSending: boolean;
  fetchAccountDetails: (address: string) => Promise<void>;
  fetchAccountDetailsData: AccountDetails | undefined;
  fetchAccountDetailsStatus: QueryStatus | FetchStatus;
  setAddressWarning: React.Dispatch<React.SetStateAction<ReactNode>>;
  addressWarning: ReactNode;
  nftSendChain: SupportedChain;
  nftSendNetwork: SelectedNetworkType;
};
