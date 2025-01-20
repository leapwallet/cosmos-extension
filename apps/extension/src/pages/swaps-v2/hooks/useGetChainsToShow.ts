import { useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import {
  SkipSupportedChainData,
  useChains,
  useSkipSupportedChains,
} from '@leapwallet/elements-hooks'
import { useNonNativeCustomChains } from 'hooks/useNonNativeCustomChains'
import { useMemo } from 'react'
import { SourceChain } from 'types/swap'
import { isCompassWallet } from 'utils/isCompassWallet'

export function useGetChainsToShow() {
  const chains = useGetChains()
  const customChains = useNonNativeCustomChains()

  const { isLoading } = useChains()
  const { data: skipSupportedChains, isLoading: skipSupportedChainsLoading } =
    useSkipSupportedChains()

  const chainsToShow = useMemo(() => {
    if (skipSupportedChains) {
      const _chainsToShow: SourceChain[] = []

      const allChains = { ...customChains, ...chains }

      Object.values(allChains)
        .filter((chain) => (isCompassWallet() ? chain.chainId === 'pacific-1' : true))
        .forEach((chain) => {
          const skipChain = skipSupportedChains.find(
            (_skipChain): _skipChain is Extract<SkipSupportedChainData, { chainType: 'cosmos' }> =>
              _skipChain.chainId === chain.chainId,
          )

          if (skipChain) {
            _chainsToShow.push({
              key: chain.key,
              addressPrefix: skipChain.bech32Prefix ?? chain.addressPrefix,
              baseDenom: skipChain.baseDenom ?? Object.keys(chain.nativeDenoms)[0],
              chainId: skipChain.chainId ?? chain.chainId,
              chainName: skipChain.chainName ?? chain.chainName,
              chainRegistryPath: skipChain.chainRegistryPath ?? chain.chainRegistryPath,
              chainType: skipChain.chainType ?? 'cosmos',
              coinType: skipChain.coinType ?? chain.bip44?.coinType,
              icon: chain.chainSymbolImageUrl ?? skipChain.icon,
              privateInfra: skipChain.privateInfra,
              rpcUrl: skipChain.rpcUrl ?? chain.apis?.rpc ?? chain.apis?.rpcTest,
              restUrl: skipChain.restUrl ?? chain.apis?.rest ?? chain.apis?.restTest,
              txExplorer: skipChain.txExplorer ?? chain.txExplorer,
              pfmEnabled: skipChain.pfmEnabled,
              logoUri: skipChain.logoUri ?? chain.chainSymbolImageUrl,
              bech32Prefix: skipChain.bech32Prefix ?? chain.addressPrefix,
              isTestnet: false,
              enabled: !!chains[chain.key], // disable custom chains
            })
          }
        })

      return _chainsToShow
    }

    return []
  }, [chains, customChains, skipSupportedChains])

  return { chainsToShow, chainsToShowLoading: isLoading || skipSupportedChainsLoading }
}
