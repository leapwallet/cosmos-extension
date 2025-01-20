import { axiosWrapper, DenomsRecord } from '@leapwallet/cosmos-wallet-sdk';
import { makeAutoObservable, runInAction } from 'mobx';
import semver from 'semver';

import { BetaERC20DenomsStore } from './erc20-denoms';

const COMPASS_TOKEN_TAGS_S3_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/config/compass-token-tags.json';

export class CompassTokenTagsStore {
  compassTokenTags: Record<string, string[]> = {};
  compassTokenDenomInfo: DenomsRecord = {};
  blacklistedTokens: string[] = [];

  betaERC20DenomsStore: BetaERC20DenomsStore;
  readyPromise: Promise<void>;
  app: 'extension' | 'mobile' = 'extension';
  version: string = '0.0.0';
  isCompass: boolean = true;

  constructor(
    app: 'extension' | 'mobile',
    version: string,
    isCompass: boolean,
    betaERC20DenomsStore: BetaERC20DenomsStore,
  ) {
    makeAutoObservable(this);

    this.app = app;
    this.version = version;
    this.isCompass = isCompass;
    this.betaERC20DenomsStore = betaERC20DenomsStore;
    this.readyPromise = this.initialize();
  }

  async initialize() {
    await this.loadCompassTokenTagsFromS3();
  }

  async loadCompassTokenTagsFromS3() {
    try {
      const { data } = await axiosWrapper({ baseURL: COMPASS_TOKEN_TAGS_S3_URL, method: 'get' });
      const tokenWiseMapping = data.tokenWiseMapping;

      // add 'All' tag to the tokenWiseMapping all tokens
      Object.keys(tokenWiseMapping ?? {}).forEach((token) => {
        if (!tokenWiseMapping[token]) {
          tokenWiseMapping[token] = [];
        }

        if (!tokenWiseMapping[token].includes('Trending') && !tokenWiseMapping[token].includes('All')) {
          tokenWiseMapping[token].push('All');
        }
      });

      const blacklistedTokens: string[] = (Object.entries(
        data.blacklist[this.app][this.isCompass ? 'compass' : 'leap'] as Record<string, string>,
      )
        ?.map(([token, version]) => {
          if (semver.satisfies(this.version, version)) {
            return token?.toLowerCase();
          }
          return undefined;
        })
        ?.filter((token) => token !== undefined) ?? []) as string[];

      runInAction(() => {
        this.compassTokenTags = tokenWiseMapping;
        this.compassTokenDenomInfo = data.tokenDenomInfo;
        this.blacklistedTokens = blacklistedTokens;
        this.betaERC20DenomsStore.setTempBetaERC20Denoms(data.tokenDenomInfo, 'seiTestnet2');
      });
    } catch (error) {
      console.error('Error loading chain tags:', error);
    }
  }
}
