import {
  getChainInfo,
  getUnbondingTime,
  isAptosChain,
  isSolanaChain,
  pubKeyToEvmAddressToShow,
  SupportedChain,
  Validator,
} from '@leapwallet/cosmos-wallet-sdk';
import CosmosDirectory from '@leapwallet/cosmos-wallet-sdk/dist/browser/chains/cosmosDirectory';
import { computed, makeObservable, observable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';

import {
  AggregatedChainsStore,
  ChainInfosConfigStore,
  ChainInfosStore,
  DenomsStore,
  NmsStore,
  PriorityValidatorsStore,
} from '../assets';
import {
  AggregatedSupportedChainType,
  ChainInfosConfigType,
  LoadingStatusType,
  SelectedNetworkType,
  ValidatorData,
} from '../types';
import { getChainsApr, isFeatureExistForChain } from '../utils';
import { ActiveChainStore, AddressStore, SelectedNetworkStore } from '../wallet';
import { StakingApiStore } from './staking-api-store';
import { ChainsAprStore } from './utils-store';

export class ValidatorsStore {
  chainInfosStore: ChainInfosStore;
  addressStore: AddressStore;
  activeChainStore: ActiveChainStore;
  selectedNetworkStore: SelectedNetworkStore;
  chainInfosConfigStore: ChainInfosConfigStore;
  denomsStore: DenomsStore;
  nmsStore: NmsStore;
  priorityValidatorsStore: PriorityValidatorsStore;
  aggregatedChainsStore: AggregatedChainsStore;
  chainsAprStore: ChainsAprStore;
  stakingApiStore: StakingApiStore;

  chainWiseValidators: Record<string, ValidatorData | Record<string, never>> = {};
  chainWiseStatus: Record<string, LoadingStatusType> = {};
  chainWiseRefetchNetwork: Record<string, () => Promise<void>> = {};

  constructor(
    chainInfosStore: ChainInfosStore,
    addressStore: AddressStore,
    activeChainStore: ActiveChainStore,
    selectedNetworkStore: SelectedNetworkStore,
    chainInfosConfigStore: ChainInfosConfigStore,
    denomsStore: DenomsStore,
    nmsStore: NmsStore,
    priorityValidatorsStore: PriorityValidatorsStore,
    aggregatedChainsStore: AggregatedChainsStore,
    chainsAprStore: ChainsAprStore,
    stakingApiStore: StakingApiStore,
  ) {
    makeObservable(this, {
      chainWiseValidators: observable.shallow,
      chainWiseStatus: observable,
      chainWiseRefetchNetwork: observable.shallow,
      chainValidators: computed,
    });

    this.chainInfosStore = chainInfosStore;
    this.addressStore = addressStore;
    this.activeChainStore = activeChainStore;
    this.selectedNetworkStore = selectedNetworkStore;
    this.chainInfosConfigStore = chainInfosConfigStore;
    this.denomsStore = denomsStore;
    this.nmsStore = nmsStore;
    this.priorityValidatorsStore = priorityValidatorsStore;
    this.aggregatedChainsStore = aggregatedChainsStore;
    this.chainsAprStore = chainsAprStore;
    this.stakingApiStore = stakingApiStore;
  }

  get chainValidators() {
    return this.validatorsForChain(this.activeChainStore.activeChain as SupportedChain);
  }

  validatorsForChain = computedFn((chain: SupportedChain) => {
    const chainKey = this.getChainKey(chain);

    return {
      validatorData: this.chainWiseValidators[chainKey] ?? {},
      validatorDataStatus: this.chainWiseStatus[chainKey] ?? 'loading',
      refetchNetwork:
        this.chainWiseRefetchNetwork[chainKey] ??
        async function () {
          await Promise.resolve();
        },
    };
  });

  async initialize() {
    await Promise.all([
      this.addressStore.readyPromise,
      this.activeChainStore.readyPromise,
      this.selectedNetworkStore.readyPromise,
      this.chainInfosConfigStore.readyPromise,
      this.denomsStore.readyPromise,
      this.nmsStore.readyPromise,
      this.priorityValidatorsStore.readyPromise,
      this.aggregatedChainsStore.readyPromise,
      this.chainsAprStore.readyPromise,
    ]);

    this.loadValidators();
  }

  async loadValidators(chain?: AggregatedSupportedChainType, network?: SelectedNetworkType, forceRefetch = false) {
    chain = chain || this.activeChainStore.activeChain;
    network = network || this.selectedNetworkStore.selectedNetwork;

    if (chain === 'aggregated') {
      Promise.allSettled(
        this.aggregatedChainsStore.aggregatedChainsData.map(async (chain) => {
          const chainKey = this.getChainKey(chain as SupportedChain);
          if (!this.chainWiseValidators[chainKey] || forceRefetch) {
            runInAction(() => {
              this.chainWiseStatus[chainKey] = 'loading';
            });
            await this.fetchChainValidators(chain as SupportedChain, network ?? 'mainnet', true);
          }
        }),
      );
    } else {
      const chainKey = this.getChainKey(chain);

      if ((this.chainWiseValidators[chainKey]?.validators ?? []).length === 0 || forceRefetch) {
        runInAction(() => {
          this.chainWiseStatus[chainKey] = 'loading';
        });
        this.fetchChainValidators(chain, network);
      }
    }
  }

  ensureValidatorsLoaded(chain: SupportedChain, network: SelectedNetworkType) {
    const shouldLoadValidators =
      !this?.chainValidators?.validatorData?.validators ||
      this?.chainValidators?.validatorData?.validators?.length === 0 ||
      this?.chainValidators?.validatorDataStatus !== 'error';

    if (shouldLoadValidators) this.loadValidators(chain, network);
  }

  async fetchChainValidators(chain: SupportedChain, network: SelectedNetworkType, isAggregated = false) {
    const isTestnet = network === 'testnet';
    const address = this.addressStore.addresses?.[chain];

    const activeChainInfo = this.chainInfosStore.chainInfos[chain];
    const activeChainId = isTestnet ? activeChainInfo?.testnetChainId : activeChainInfo?.chainId;

    const chainKey = this.getChainKey(chain);
    if (!activeChainId || !address || activeChainInfo?.evmOnlyChain || isAptosChain(chain) || isSolanaChain(chain)) {
      runInAction(() => {
        this.chainWiseValidators[chainKey] = {};
        this.chainWiseStatus[chainKey] = 'success';
      });
      return;
    }

    const isFeatureComingSoon = isFeatureExistForChain(
      'comingSoon',
      'stake',
      'Extension',
      activeChainId,
      this.chainInfosConfigStore.chainInfosConfig as ChainInfosConfigType,
    );

    const isFeatureNotSupported = isFeatureExistForChain(
      'notSupported',
      'stake',
      'Extension',
      activeChainId,
      this.chainInfosConfigStore.chainInfosConfig as ChainInfosConfigType,
    );

    runInAction(() => {
      this.chainWiseRefetchNetwork[chainKey] = async () => {
        await this.fetchChainValidators(chain, this.selectedNetworkStore.selectedNetwork);
      };
    });

    if (isFeatureComingSoon || isFeatureNotSupported) {
      runInAction(() => {
        this.chainWiseValidators[chainKey] = {};
        this.chainWiseStatus[chainKey] = 'success';
      });
      return;
    }

    const activeChainKey = activeChainInfo?.key ?? '';
    const denoms = this.denomsStore.denoms;
    const denom = denoms[Object.keys(activeChainInfo?.nativeDenoms ?? {})?.[0] ?? ''];

    const nodeUrlKey = isTestnet ? 'restTest' : 'rest';
    const hasEntryInNms =
      this.nmsStore.restEndpoints[activeChainId] && this.nmsStore.restEndpoints[activeChainId].length > 0;

    const lcdUrl = hasEntryInNms
      ? this.nmsStore.restEndpoints[activeChainId][0].nodeUrl
      : activeChainInfo?.apis[nodeUrlKey];

    try {
      let validators: Validator[] = [];
      let unbonding_time = 0;
      if (!isAggregated) {
        const chainData = await getChainInfo(activeChainKey, isTestnet);
        const validatorsPromise = this.stakingApiStore.getValidators(activeChainInfo.chainId, denom.coinMinimalDenom);

        const unbondingTimePromise = getUnbondingTime(
          activeChainKey,
          isTestnet,
          lcdUrl,
          this.chainInfosStore.chainInfos,
          chainData,
        );

        const [{ data, error }, res] = await Promise.all([validatorsPromise, unbondingTimePromise]);

        if (error && error.chainId === activeChainInfo.chainId) {
          validators = (await CosmosDirectory(isTestnet).getValidators(
            activeChainKey,
            lcdUrl,
            denom,
            this.chainInfosStore.chainInfos,
          )) as Validator[];
        } else {
          validators = data;
        }

        unbonding_time = res.unbonding_time;
      }

      const calculatedApr = await getChainsApr(
        this.chainsAprStore.chainsApr,
        chain as SupportedChain,
        isTestnet,
        this.chainInfosStore.chainInfos,
      );

      const priorityValidatorsByChain = this.priorityValidatorsStore.priorityValidators;
      if (Object.keys(priorityValidatorsByChain).includes(activeChainId ?? '')) {
        const priorityValidators = validators.reduce((acc, validator) => {
          const priorityValidator = priorityValidatorsByChain[activeChainId ?? ''].find(
            (v) => v.validatorAddress === validator.operator_address,
          );

          if (priorityValidator && validator.status === 'BOND_STATUS_BONDED') {
            acc.push(Object.assign(validator, { custom_attributes: { priority: priorityValidator.priority } }));
          }

          return acc;
        }, [] as Validator[]);

        priorityValidators.sort((a, b) => {
          const aPriority = a.custom_attributes?.priority ?? 0;
          const bPriority = b.custom_attributes?.priority ?? 0;

          return aPriority - bPriority;
        });

        const otherValidators = validators.filter((validator) =>
          priorityValidatorsByChain[activeChainId ?? ''].every(
            (v) => v.validatorAddress !== validator.operator_address,
          ),
        );

        validators = priorityValidators.concat(otherValidators);
      }

      runInAction(() => {
        this.chainWiseValidators[chainKey] = {
          chainData: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            params: Object.assign({}, { calculated_apr: calculatedApr, unbonding_time }),
          },
          validators,
        };
        this.chainWiseStatus[chainKey] = 'success';
      });
    } catch (_) {
      runInAction(() => {
        this.chainWiseValidators[chainKey] = {};
        this.chainWiseStatus[chainKey] = 'error';
      });
    }
  }

  private getChainKey(chain: SupportedChain) {
    const evmPubKey = this.addressStore?.pubKeys?.ethereum;
    const cosmosAddress = this.addressStore?.addresses?.cosmos;
    const evmAddress = evmPubKey ? pubKeyToEvmAddressToShow(evmPubKey, true) : '';
    const address = cosmosAddress || evmAddress;

    const chainId =
      this.selectedNetworkStore.selectedNetwork == 'testnet'
        ? this.chainInfosStore.chainInfos[chain]?.testnetChainId
        : this.chainInfosStore.chainInfos[chain]?.chainId;

    return `${address}-${chain}-${chainId}`;
  }
}
