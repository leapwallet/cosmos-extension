import { makeAutoObservable, runInAction } from 'mobx';

const SPAM_PROPOSALS_S3_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/proposals/spam.json';

export class SpamProposalsStore {
  spamProposals: Record<string, number[]> = {};
  readyPromise: Promise<void>;

  constructor() {
    makeAutoObservable(this);
    this.readyPromise = this.loadSpamProposals();
  }

  // Add caching for spam proposals
  async loadSpamProposals() {
    const response = await fetch(SPAM_PROPOSALS_S3_URL);
    const data = await response.json();

    runInAction(() => {
      this.spamProposals = data;
    });
  }
}
