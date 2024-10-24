import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { makeObservable, observable, runInAction } from 'mobx';

const aggregatedChainsUrl = 'https://assets.leapwallet.io/cosmos-registry/v1/config/aggregated-chains.json';

const INITIAL_AGGREGATED_CHAINS_DATA: SupportedChain[] = [
  'cosmos',
  'osmosis',
  'akash',
  'axelar',
  'stargaze',
  'umee',
  'kujira',
  'aura',
  'injective',
  'stride',
  'carbon',
  'archway',
  'migaloo',
  'neutron',
  'mainCoreum',
  'seiTestnet2',
  'noble',
  'nibiru',
  'dydx',
  'celestia',
  'composable',
  'dymension',
  'saga',
  'omniflix',
  'cheqd',
];

export class AggregatedChainsStore {
  aggregatedChainsData: Array<string> = INITIAL_AGGREGATED_CHAINS_DATA;
  readyPromise: Promise<void>;

  constructor() {
    makeObservable(this, {
      aggregatedChainsData: observable.shallow,
    });
    this.readyPromise = this.loadAggregatedChainsData();
  }

  async loadAggregatedChainsData() {
    const response = await fetch(aggregatedChainsUrl);
    const data = await response.json();
    runInAction(() => {
      this.aggregatedChainsData = data;
    });
  }
}
