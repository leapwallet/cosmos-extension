import { useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { MosaicAPI } from '@leapwallet/elements-core'
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
    useSkipSupportedChains({
      chainTypes: ['cosmos', 'evm'],
    })

  const skipAndMosaicChains = useMemo(() => {
    return skipSupportedChains
      ? [...skipSupportedChains, ...MosaicAPI.supportedChains]
      : MosaicAPI.supportedChains
  }, [skipSupportedChains])

  const chainsToShow = useMemo(() => {
    if (skipAndMosaicChains) {
      const _chainsToShow: SourceChain[] = []

      const allChains = { ...customChains, ...chains }

      Object.values(allChains)
        .filter((chain) => (isCompassWallet() ? chain.chainId === 'pacific-1' : true))
        .forEach((chain) => {
          const skipChain = skipAndMosaicChains.find(
            (_skipChain) =>
              _skipChain.chainId === chain.chainId ||
              (chain.evmOnlyChain && _skipChain.chainId === chain.evmChainId),
          )

          if (skipChain?.chainType === 'cosmos') {
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
          } else if (skipChain?.chainType === 'evm') {
            // TODO: remove once when using elements stable release and not local version
            const skipEvmChain = skipChain as Extract<SkipSupportedChainData, { chainType: 'evm' }>
            _chainsToShow.push({
              key: chain.key,
              baseDenom: skipEvmChain.baseDenom ?? Object.keys(chain.nativeDenoms)[0],
              chainId: skipEvmChain.chainId ?? chain.chainId,
              chainName: skipEvmChain.chainName ?? chain.chainName,
              coinType: chain.bip44?.coinType,
              chainType: skipEvmChain.chainType,
              icon: chain.chainSymbolImageUrl ?? skipEvmChain.icon,
              txExplorer: skipEvmChain.txExplorer ?? chain.txExplorer,
              pfmEnabled: skipEvmChain.pfmEnabled,
              logoUri: skipEvmChain.logoUri ?? chain.chainSymbolImageUrl,
              bech32Prefix: skipEvmChain.bech32Prefix ?? chain.addressPrefix,
              isTestnet: false,
              enabled: !!chains[chain.key],
            })
          } else if (skipChain?.chainType === 'aptos') {
            _chainsToShow.push({
              key: chain.key,
              addressPrefix: chain.addressPrefix,
              baseDenom: Object.keys(chain.nativeDenoms)[0],
              chainId: chain.chainId,
              chainName: chain.chainName,
              chainRegistryPath: chain.chainRegistryPath,
              chainType: 'cosmos',
              coinType: chain.bip44?.coinType,
              icon: chain.chainSymbolImageUrl ?? '',
              rpcUrl: chain.apis?.rpc ?? chain.apis?.rpcTest ?? '',
              restUrl: chain.apis?.rest ?? chain.apis?.restTest ?? '',
              bech32Prefix: chain.addressPrefix,
              isTestnet: false,
              enabled: !!chains[chain.key],
              pfmEnabled: skipChain.pfmEnabled,
              logoUri: skipChain.logoUri || chain.chainSymbolImageUrl || '',
              txExplorer: skipChain.txExplorer,
            })
          }
        })

      return _chainsToShow
    }

    return []
  }, [chains, customChains, skipAndMosaicChains])

  return { chainsToShow, chainsToShowLoading: isLoading || skipSupportedChainsLoading }
}
