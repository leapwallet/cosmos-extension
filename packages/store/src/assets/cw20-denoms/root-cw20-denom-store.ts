import { DenomsRecord } from '@leapwallet/cosmos-wallet-sdk';
import { computed, makeObservable, toJS } from 'mobx';

import { AutoFetchedCW20DenomsStore } from './autofetched-cw20-denoms-store';
import { BetaCW20DenomsStore } from './beta-cw20-denoms-store';
import { CW20DenomsStore } from './cw20-denoms-store';

function combineValues(values: Array<DenomsRecord>) {
  const combinedValues = {};
  for (const value of values) {
    Object.assign(combinedValues, value);
  }
  return combinedValues;
}

export class RootCW20DenomsStore {
  cw20DenomsStore: CW20DenomsStore;
  betaCW20DenomsStore: BetaCW20DenomsStore;
  autoFetchedCW20DenomsStore: AutoFetchedCW20DenomsStore;

  constructor(
    cw20DenomsStore: CW20DenomsStore,
    betaCW20DenomsStore: BetaCW20DenomsStore,
    autoFetchedCW20DenomsStore: AutoFetchedCW20DenomsStore,
  ) {
    this.cw20DenomsStore = cw20DenomsStore;
    this.betaCW20DenomsStore = betaCW20DenomsStore;
    this.autoFetchedCW20DenomsStore = autoFetchedCW20DenomsStore;
    makeObservable({
      allCW20Denoms: computed.struct,
      readyPromise: computed,
    });
  }

  get allCW20Denoms() {
    const cw20DenomValues = combineValues(Object.values(toJS(this.cw20DenomsStore.denoms)));
    const betaCW20DenomValues = combineValues(Object.values(toJS(this.betaCW20DenomsStore.denoms)));
    const allAutoFetchedCW20Denoms = toJS(this.autoFetchedCW20DenomsStore.allAutoFetchedCW20Denoms);
    const retval = Object.assign(cw20DenomValues, betaCW20DenomValues, allAutoFetchedCW20Denoms);
    return retval;
  }

  get readyPromise() {
    return Promise.all([
      this.cw20DenomsStore.readyPromise,
      this.betaCW20DenomsStore.readyPromise,
      this.autoFetchedCW20DenomsStore.readyPromise,
    ]);
  }
}
