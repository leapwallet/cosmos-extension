import {
  GasAdjustments,
  gasAdjustments as defaultGasAdjustments,
  initResourceFromS3,
  isAptosChain,
  isSolanaChain,
  isSuiChain,
  StorageLayer,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { makeAutoObservable } from 'mobx';

const GAS_ADJUSTMENTS = 'gas-adjustments';
const GAS_ADJUSTMENTS_LAST_UPDATED_AT = 'gas-adjustments-last-updated-at';

const GAS_ADJUSTMENTS_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/gas/gas-adjustments.json';
const GAS_ADJUSTMENTS_LAST_UPDATED_AT_URL =
  'https://assets.leapwallet.io/cosmos-registry/v1/gas/gas-adjustments-last-updated-at.json';

// replaces useGasAdjustments
export class GasAdjustmentStore {
  adjustments = defaultGasAdjustments;

  constructor(storage: StorageLayer) {
    makeAutoObservable(this);

    this.init(storage);
  }

  private init(storage: StorageLayer) {
    initResourceFromS3({
      storage,
      setResource: (data) => this.setAdjustments(data),
      resourceKey: GAS_ADJUSTMENTS,
      resourceURL: GAS_ADJUSTMENTS_URL,
      lastUpdatedAtKey: GAS_ADJUSTMENTS_LAST_UPDATED_AT,
      lastUpdatedAtURL: GAS_ADJUSTMENTS_LAST_UPDATED_AT_URL,
      defaultResourceData: defaultGasAdjustments,
    });
  }

  getGasAdjustments(chain: SupportedChain) {
    // !TODO: remove this once we have gas adjustments for aptos
    if (isAptosChain(chain)) {
      return defaultGasAdjustments[chain];
    }

    if (isSolanaChain(chain)) {
      return defaultGasAdjustments[chain];
    }

    if (isSuiChain(chain)) {
      return defaultGasAdjustments[chain];
    }

    return this.adjustments[chain] ?? this.adjustments.cosmos;
  }

  setAdjustments(adjustments: GasAdjustments) {
    this.adjustments = adjustments;
  }
}
