import { makeAutoObservable, runInAction } from 'mobx';

import { StorageAdapter } from '../types';
import { cachedRemoteDataWithLastModified } from '../utils/cached-remote-data';

const POPULAR_TOKENS_S3_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/config/popular-tokens-swaps.json';

export type PopularToken = {
  denom: string;
  chainId: string;
};

export type PopularTokens = Record<string, PopularToken[]>;

export class PopularTokensStore {
  popularTokensFromS3: PopularTokens = {
    all: [
      {
        denom: 'uatom',
        chainId: 'cosmoshub-4',
      },
      {
        denom: 'uom',
        chainId: 'mantra-1',
      },
      {
        denom: 'utia',
        chainId: 'celestia',
      },
      {
        denom: 'usei',
        chainId: 'pacific-1',
      },
      {
        denom: 'ucore',
        chainId: 'coreum-mainnet-1',
      },
      {
        denom: 'uosmo',
        chainId: 'osmosis-1',
      },
      {
        denom: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        chainId: '1',
      },
      {
        denom: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        chainId: '1',
      },
      {
        denom: 'binance-native',
        chainId: '56',
      },
      {
        denom: '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0',
        chainId: '1',
      },
      {
        denom: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        chainId: '1',
      },
      {
        denom: 'inj',
        chainId: 'injective-1',
      },
      {
        denom: 'ukuji',
        chainId: 'kaiyo-1',
      },
      {
        denom: 'uakt',
        chainId: 'akashnet-2',
      },
      {
        denom: 'ustrd',
        chainId: 'stride-1',
      },
      {
        denom: 'ustars',
        chainId: 'stargaze-1',
      },
      {
        denom: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        chainId: '1',
      },
      {
        denom: 'ethereum-native',
        chainId: '1',
      },
      {
        denom: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        chainId: '1',
      },
      {
        denom: '0x912CE59144191C1204E64559FE8253a0e49E6548',
        chainId: '42161',
      },
      {
        denom: 'arbitrum-native',
        chainId: '42161',
      },
      {
        denom: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        chainId: '42161',
      },
      {
        denom: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
        chainId: '42161',
      },
      {
        denom: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        chainId: '42161',
      },
      {
        denom: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
        chainId: '42161',
      },
      {
        denom: 'base-native',
        chainId: '8453',
      },
      {
        denom: '0x4200000000000000000000000000000000000006',
        chainId: '8453',
      },
      {
        denom: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
        chainId: '8453',
      },
      {
        denom: '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b',
        chainId: '8453',
      },
      {
        denom: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
        chainId: '8453',
      },
      {
        denom: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        chainId: '8453',
      },
      {
        denom: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
        chainId: '8453',
      },
      {
        denom: 'polygon-native',
        chainId: '137',
      },
      {
        denom: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B',
        chainId: '137',
      },
      {
        denom: '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39',
        chainId: '137',
      },
      {
        denom: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        chainId: '137',
      },
      {
        denom: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        chainId: '137',
      },
      {
        denom: '0xa',
        chainId: 'aptos-126',
      },
      {
        denom: '0x908828f4fb0213d4034c3ded1630bbd904e8a3a6bf3c63270887f0b06653a376',
        chainId: 'aptos-126',
      },
      {
        denom: '0x83121c9f9b0527d1f056e21a950d6bf3b9e9e2e8353d0e95ccea726713cbea39',
        chainId: 'aptos-126',
      },
      {
        denom: '0x447721a30109c662dde9c73a0c2c9c9c459fb5e5a9c92f03c50fa69737f5d08d',
        chainId: 'aptos-126',
      },
    ],
    cosmos: [
      {
        denom: 'uatom',
        chainId: 'cosmoshub-4',
      },
      {
        denom: 'uom',
        chainId: 'mantra-1',
      },
      {
        denom: 'utia',
        chainId: 'celestia',
      },
      {
        denom: 'usei',
        chainId: 'pacific-1',
      },
      {
        denom: 'ucore',
        chainId: 'coreum-mainnet-1',
      },
      {
        denom: 'uosmo',
        chainId: 'osmosis-1',
      },
      {
        denom: 'inj',
        chainId: 'injective-1',
      },
      {
        denom: 'ukuji',
        chainId: 'kaiyo-1',
      },
      {
        denom: 'uakt',
        chainId: 'akashnet-2',
      },
      {
        denom: 'ustrd',
        chainId: 'stride-1',
      },
      {
        denom: 'ustars',
        chainId: 'stargaze-1',
      },
    ],
    ethereum: [
      {
        denom: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        chainId: '1',
      },
      {
        denom: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        chainId: '1',
      },
      {
        denom: '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0',
        chainId: '1',
      },
      {
        denom: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        chainId: '1',
      },
      {
        denom: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        chainId: '1',
      },
      {
        denom: 'ethereum-native',
        chainId: '1',
      },
      {
        denom: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        chainId: '1',
      },
    ],
    arbitrum: [
      {
        denom: '0x912CE59144191C1204E64559FE8253a0e49E6548',
        chainId: '42161',
      },
      {
        denom: 'arbitrum-native',
        chainId: '42161',
      },
      {
        denom: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        chainId: '42161',
      },
      {
        denom: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
        chainId: '42161',
      },
      {
        denom: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        chainId: '42161',
      },
      {
        denom: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
        chainId: '42161',
      },
    ],
    base: [
      {
        denom: 'base-native',
        chainId: '8453',
      },
      {
        denom: '0x4200000000000000000000000000000000000006',
        chainId: '8453',
      },
      {
        denom: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
        chainId: '8453',
      },
      {
        denom: '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b',
        chainId: '8453',
      },
      {
        denom: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
        chainId: '8453',
      },
      {
        denom: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        chainId: '8453',
      },
      {
        denom: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
        chainId: '8453',
      },
    ],
    polygon: [
      {
        denom: 'polygon-native',
        chainId: '137',
      },
      {
        denom: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B',
        chainId: '137',
      },
      {
        denom: '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39',
        chainId: '137',
      },
      {
        denom: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        chainId: '137',
      },
      {
        denom: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        chainId: '137',
      },
    ],
    movement: [
      {
        denom: '0xa',
        chainId: 'aptos-126',
      },
      {
        denom: '0x908828f4fb0213d4034c3ded1630bbd904e8a3a6bf3c63270887f0b06653a376',
        chainId: 'aptos-126',
      },
      {
        denom: '0x83121c9f9b0527d1f056e21a950d6bf3b9e9e2e8353d0e95ccea726713cbea39',
        chainId: 'aptos-126',
      },
      {
        denom: '0x447721a30109c662dde9c73a0c2c9c9c459fb5e5a9c92f03c50fa69737f5d08d',
        chainId: 'aptos-126',
      },
    ],
    bsc: [
      {
        denom: 'binance-native',
        chainId: '56',
      },
    ],
  };

  storageAdapter: StorageAdapter;
  readyPromise: Promise<void>;

  constructor(storageAdapter: StorageAdapter) {
    this.storageAdapter = storageAdapter;
    makeAutoObservable(this);
    this.readyPromise = this.initialize();
  }

  async initialize() {
    await this.loadPopularTokensFromS3();
  }

  async loadPopularTokensFromS3() {
    try {
      const data = await cachedRemoteDataWithLastModified<{ popular_tokens: PopularTokens }>({
        remoteUrl: POPULAR_TOKENS_S3_URL,
        storage: this.storageAdapter,
        storageKey: 'popular-tokens-swaps',
      });
      runInAction(() => {
        this.popularTokensFromS3 = data.popular_tokens;
      });
    } catch (error) {
      console.error('Error loading chain tags:', error);
    }
  }
}
