import { getApr, getChainInfo, getUnbondingTime, SupportedChain, Validator } from '@leapwallet/cosmos-wallet-sdk';
import CosmosDirectory from '@leapwallet/cosmos-wallet-sdk/dist/chains/cosmosDirectory';
import { useEffect } from 'react';

import {
  useActiveChain,
  useChainApis,
  useDenoms,
  useGetChains,
  useSelectedNetwork,
  useStakeValidatorsStore,
} from '../store';

export function useFetchStakeValidators(forceChain?: SupportedChain, forceNetwork?: 'mainnet' | 'testnet') {
  const _activeChain = useActiveChain();
  const activeChain = forceChain ?? _activeChain;

  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = forceNetwork ?? _selectedNetwork;

  const { lcdUrl } = useChainApis(activeChain, selectedNetwork);
  const isTestnet = useSelectedNetwork() === 'testnet';
  const { setStakeValidatorData, setStakeValidatorStatus, setStakeValidatorRefetch } = useStakeValidatorsStore();

  const denoms = useDenoms();
  const chainInfos = useGetChains();
  const activeChainInfo = chainInfos[activeChain];

  const fetchStakeValidators = async () => {
    try {
      const chainId = activeChainInfo.key;
      const denom = denoms[Object.keys(activeChainInfo.nativeDenoms)[0]];

      const chainData = await getChainInfo(chainId, isTestnet);
      const _chainData = activeChainInfo.beta
        ? { params: { calculated_apr: 0, estimated_apr: 0, unbonding_time: 0 } }
        : chainData;

      const validators = (await CosmosDirectory(isTestnet).getValidators(
        chainId,
        lcdUrl,
        denom,
        chainInfos,
      )) as Validator[];

      const { unbonding_time = 0 } = await getUnbondingTime(chainId, isTestnet, lcdUrl, chainInfos, chainData);
      const calculatedApr = await getApr(activeChain, isTestnet, chainInfos, chainData);

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
      setStakeValidatorData({});
      setStakeValidatorStatus('error');
    }
  };

  useEffect(() => {
    if (lcdUrl && activeChain && selectedNetwork && Object.keys(denoms).length) {
      setTimeout(() => {
        setStakeValidatorStatus('loading');
        setStakeValidatorData({});
        setStakeValidatorRefetch(async function () {
          await fetchStakeValidators();
        });
        fetchStakeValidators();
      }, 0);
    }
  }, [lcdUrl, denoms, activeChain, selectedNetwork]);
}
