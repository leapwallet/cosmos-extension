import { Fee } from '@leapwallet/parser-parfait';
import { makeAutoObservable, runInAction } from 'mobx';

// replaces useDappDefaultFeeStore
/**
 * @description You must keep the state in sync with the mobx store until we remove all the instances of this hook
 */
export class DappDefaultFeeStore {
  defaultFee: Fee | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setDefaultFee(newFee: Fee) {
    runInAction(() => {
      this.defaultFee = newFee;
    });
  }
}
