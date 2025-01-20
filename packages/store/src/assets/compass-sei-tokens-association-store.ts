import { axiosWrapper } from '@leapwallet/cosmos-wallet-sdk';
import { makeAutoObservable, runInAction } from 'mobx';

const COMPASS_TOKENS_ASSOCIATIONS_S3_URL =
  'https://assets.leapwallet.io/cosmos-registry/v1/config/compass-tokens-associations.json';

export class CompassSeiTokensAssociationStore {
  compassEvmToSeiMapping: Record<string, string> = {};
  compassSeiToEvmMapping: Record<string, string> = {};
  readyPromise: Promise<void>;

  constructor() {
    makeAutoObservable(this);
    this.readyPromise = this.initialize();
  }

  async initialize() {
    await this.loadCompassTokenTagsFromS3();
  }

  async loadCompassTokenTagsFromS3() {
    try {
      const { data } = await axiosWrapper({ baseURL: COMPASS_TOKENS_ASSOCIATIONS_S3_URL, method: 'get' });
      runInAction(() => {
        this.compassEvmToSeiMapping = data;
        this.compassSeiToEvmMapping = Object.entries((data ?? {}) as Record<string, string>).reduce<
          Record<string, string>
        >((acc, [key, value]) => {
          acc[value] = key;
          return acc;
        }, {});
      });
    } catch (error) {
      console.error('Error loading chain tags:', error);
    }
  }
}
