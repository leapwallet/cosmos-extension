import { getApr, getChainInfo, getUnbondingTime, SupportedChain, Validator } from '@leapwallet/cosmos-wallet-sdk';
import CosmosDirectory from '@leapwallet/cosmos-wallet-sdk/dist/browser/chains/cosmosDirectory';
import { useEffect } from 'react';

import {
  useActiveChain,
  useChainApis,
  useDenoms,
  useGetChains,
  useSelectedNetwork,
  useStakeValidatorsStore,
} from '../store';
import { cachedRemoteDataWithLastModified, getPlatformType, useGetStorageLayer } from '../utils';
import { useIsFeatureExistForChain } from '../utils-hooks';

type PriorityValidatorByChains = { [key: string]: { priority: number; validatorAddress: string }[] };

export function useFetchStakeValidators(forceChain?: SupportedChain, forceNetwork?: 'mainnet' | 'testnet') {
  const _activeChain = useActiveChain();
  const activeChain = forceChain ?? _activeChain;
  const storage = useGetStorageLayer();

  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = forceNetwork ?? _selectedNetwork;

  const { lcdUrl } = useChainApis(activeChain, selectedNetwork);
  const isTestnet = useSelectedNetwork() === 'testnet';
  const { setStakeValidatorData, setStakeValidatorStatus, setStakeValidatorRefetch } = useStakeValidatorsStore();

  const denoms = useDenoms();
  const chainInfos = useGetChains();
  const activeChainInfo = chainInfos[activeChain];

  const isStakeComingSoon = useIsFeatureExistForChain({
    checkForExistenceType: 'comingSoon',
    feature: 'stake',
    platform: getPlatformType(),
    forceChain: activeChain,
    forceNetwork: selectedNetwork,
  });

  const isStakeNotSupported = useIsFeatureExistForChain({
    checkForExistenceType: 'notSupported',
    feature: 'stake',
    platform: getPlatformType(),
    forceChain: activeChain,
    forceNetwork: selectedNetwork,
  });

  useEffect(() => {
    let isCancelled = false;

    const fetchStakeValidators = async () => {
      try {
        if (isStakeComingSoon || isStakeNotSupported) {
          setTimeout(() => {
            setStakeValidatorStatus('success');
            setStakeValidatorData({});
          }, 0);

          return;
        }
        const chainId = activeChainInfo.key;
        const denom = denoms[Object.keys(activeChainInfo.nativeDenoms)[0]];

        const chainData = await getChainInfo(chainId, isTestnet);
        const _chainData = activeChainInfo.beta
          ? { params: { calculated_apr: 0, estimated_apr: 0, unbonding_time: 0 } }
          : chainData;

        if (isCancelled) return;
        let validators = (await CosmosDirectory(isTestnet).getValidators(
          chainId,
          lcdUrl,
          denom,
          chainInfos,
        )) as Validator[];

        if (isCancelled) return;
        const { unbonding_time = 0 } = await getUnbondingTime(chainId, isTestnet, lcdUrl, chainInfos, chainData);

        if (isCancelled) return;
        const calculatedApr = await getApr(activeChain, isTestnet, chainInfos, chainData);
        if (isCancelled) return;

        let priorityValidatorsByChain: PriorityValidatorByChains = {};
        try {
          priorityValidatorsByChain = await cachedRemoteDataWithLastModified({
            remoteUrl: 'https://assets.leapwallet.io/cosmos-registry/v1/nudges/leap-validator-chains.json',
            storageKey: 'leap-validator-chains',
            storage,
          });
        } catch (_) {
          //
        }

        if (isCancelled) return;
        if (Object.keys(priorityValidatorsByChain).includes(activeChainInfo.chainId)) {
          const priorityValidators = validators.reduce((acc, validator) => {
            const priorityValidator = priorityValidatorsByChain[activeChainInfo.chainId].find(
              (v) => v.validatorAddress === validator.operator_address,
            );

            if (priorityValidator && validator.status === 'BOND_STATUS_BONDED') {
              acc.push({ ...validator, custom_attributes: { priority: priorityValidator.priority } });
            }

            return acc;
          }, [] as Validator[]);

          priorityValidators.sort((a, b) => {
            const aPriority = a.custom_attributes?.priority ?? 0;
            const bPriority = b.custom_attributes?.priority ?? 0;

            return aPriority - bPriority;
          });

          const otherValidators = validators.filter((validator) =>
            priorityValidatorsByChain[activeChainInfo.chainId].every(
              (v) => v.validatorAddress !== validator.operator_address,
            ),
          );

          validators = [...priorityValidators, ...otherValidators];
        }

        if (isCancelled) return;
        setStakeValidatorData({
          chainData: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            params: { ...(_chainData?.params ?? {}), calculated_apr: calculatedApr, unbonding_time },
          },
          validators,
        });
        setStakeValidatorStatus('success');
      } catch (_) {
        if (isCancelled) return;

        setStakeValidatorData({});
        setStakeValidatorStatus('error');
      }
    };

    if (lcdUrl && activeChain && selectedNetwork && Object.keys(denoms).length) {
      setTimeout(() => {
        setStakeValidatorStatus('loading');
        setStakeValidatorData({});
        setStakeValidatorRefetch(async function () {
          await fetchStakeValidators();
        });
        fetchStakeValidators();
      }, 0);
    } else {
      setStakeValidatorStatus('success');
      setStakeValidatorData({});
    }

    return () => {
      isCancelled = true;
    };
  }, [
    lcdUrl,
    denoms,
    activeChain,
    selectedNetwork,
    isTestnet,
    activeChainInfo,
    isStakeComingSoon,
    isStakeNotSupported,
    chainInfos,
  ]);
}
