import { AddressZero } from '@ethersproject/constants'
import { getErc20TokenDetails } from '@leapwallet/cosmos-wallet-sdk'
import {
  MosaicSupportedAsset,
  SkipSupportedAsset,
  useAllSkipAssets,
  useLifiAssets,
  useMosaicAssets,
} from '@leapwallet/elements-hooks'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { compassSeiEvmConfigStore } from 'stores/balance-store'
import { compassTokensAssociationsStore } from 'stores/chain-infos-store'
import { compassTokenTagsStore, rootDenomsStore } from 'stores/denoms-store-instance'
import { isCompassWallet } from 'utils/isCompassWallet'

import useCustomAddedERC20Tokens from './useCustomAddedERC20Tokens'
import { useProviderFeatureFlags } from './useProviderFeatureFlags'

export type MergedAsset = SkipSupportedAsset & {
  evmChainId?: string
  evmTokenContract?: string
  evmDecimals?: number
}

export default function useAssets() {
  const associations = compassTokensAssociationsStore.compassEvmToSeiMapping
  const reverseAssociations = compassTokensAssociationsStore.compassSeiToEvmMapping
  const { isSkipEnabled, isLifiEnabled, isEvmSwapEnabled } = useProviderFeatureFlags()

  const useAllSkipAssetsParams = useMemo(() => {
    return {
      includeCW20Assets: true,
      includeNoMetadataAssets: false,
      includeEVMAssets: isEvmSwapEnabled,
      includeSVMAssets: false,
      nativeOnly: false,
    }
  }, [isEvmSwapEnabled])

  const { data: _allSkipAssets, isLoading: loadingAllSkipAssets } =
    useAllSkipAssets(useAllSkipAssetsParams)

  const { data: _mosaicAssets } = useMosaicAssets()
  const { data: seiLifiAssets } = useLifiAssets(
    isLifiEnabled
      ? String(compassSeiEvmConfigStore.compassSeiEvmConfig.PACIFIC_ETH_CHAIN_ID)
      : undefined,
    {
      includeEVMAssets: true,
    },
  )

  const allSkipAssets:
    | Record<string, SkipSupportedAsset[]>
    | Record<string, MosaicSupportedAsset[]>
    | undefined = isSkipEnabled
    ? Object.assign({}, _allSkipAssets, _mosaicAssets?.assets)
    : undefined

  const customAddedERC20Tokens = useCustomAddedERC20Tokens()
  const allDenoms = rootDenomsStore.allDenoms
  const compassTokenTags = compassTokenTagsStore.compassTokenTags
  const blacklistedTokens = compassTokenTagsStore.blacklistedTokens

  const compassHardcodedTokenKeys = Object.keys(compassTokenTags ?? {})

  const allAssetsKey = useMemo(() => {
    if (!isCompassWallet()) {
      return ['allSkipAssets', allSkipAssets, blacklistedTokens]
    }
    return [
      'allAssets',
      seiLifiAssets,
      allSkipAssets,
      customAddedERC20Tokens,
      allDenoms,
      blacklistedTokens,
    ]
  }, [allDenoms, allSkipAssets, customAddedERC20Tokens, seiLifiAssets, blacklistedTokens])

  const { data: allAssets, isLoading: loadingAllAssets } = useQuery(
    allAssetsKey,
    async () => {
      if (!isCompassWallet()) {
        if (blacklistedTokens.length > 0 && allSkipAssets) {
          Object.keys(allSkipAssets).forEach((chainId) => {
            if (allSkipAssets[chainId]) {
              allSkipAssets[chainId] = allSkipAssets[chainId]?.filter(
                (asset) =>
                  !blacklistedTokens.includes(
                    asset.originDenom?.replace(/(cw20:|erc20\/)/g, '').toLowerCase(),
                  ),
              )
            }
          })
          return allSkipAssets as Record<string, MergedAsset[]> | undefined
        }
        return allSkipAssets as Record<string, MergedAsset[]> | undefined
      }
      const seiCosmosChainId = compassSeiEvmConfigStore.compassSeiEvmConfig.PACIFIC_COSMOS_CHAIN_ID
      const seiEvmChainId = String(
        compassSeiEvmConfigStore.compassSeiEvmConfig.PACIFIC_ETH_CHAIN_ID,
      )
      const combinedCompassTokenDenomInfo = Object.assign(
        {},
        compassTokenTagsStore.compassTokenDenomInfo,
        allDenoms,
      )
      const seiSkipAssets = (allSkipAssets?.[seiCosmosChainId] ?? []) as MergedAsset[]
      const seiEvmRpcUrl = compassSeiEvmConfigStore.compassSeiEvmConfig.PACIFIC_EVM_RPC_URL
      const commonAssets: Set<string> = new Set([])

      await Promise.allSettled(
        seiSkipAssets.map(async (skipAsset) => {
          let evmContract = ''
          let seiContract = ''
          commonAssets.add(skipAsset.originDenom?.replace(/(cw20:|erc20\/)/g, ''))
          if (skipAsset.originDenom === 'usei') {
            // This is merging the Sei native token with the EVM native token
            skipAsset.evmTokenContract = AddressZero
            skipAsset.evmChainId = seiEvmChainId
            skipAsset.evmDecimals = 18
            commonAssets.add(AddressZero)
          } else if (skipAsset.originDenom?.startsWith('0x')) {
            skipAsset.evmTokenContract = skipAsset.originDenom
            skipAsset.evmChainId = seiEvmChainId
            evmContract = skipAsset.originDenom
          } else {
            seiContract = skipAsset.originDenom?.replace('cw20:', '')
            evmContract = reverseAssociations[seiContract]
            if (evmContract) {
              skipAsset.evmTokenContract = evmContract
              skipAsset.evmChainId = seiEvmChainId
              commonAssets.add(evmContract)
            }
          }
          skipAsset.coingeckoId =
            combinedCompassTokenDenomInfo[evmContract]?.coinGeckoId ?? skipAsset.coingeckoId
          skipAsset.logoUri = combinedCompassTokenDenomInfo[evmContract]?.icon ?? skipAsset.logoUri
        }),
      )

      const lifiExclusiveAssets = (seiLifiAssets ?? [])
        .filter((lifiAsset) => !commonAssets.has(lifiAsset.originDenom))
        ?.map((lifiAsset) => {
          const evmTokenContract = lifiAsset.originDenom
          commonAssets.add(evmTokenContract)
          if (evmTokenContract === AddressZero) {
            const originDenom = 'usei'
            return {
              ...lifiAsset,
              originDenom,
              denom: originDenom,
              chainId: seiCosmosChainId,
              evmTokenContract: AddressZero,
              evmChainId: seiEvmChainId,
              evmDecimals: 18,
              decimals: combinedCompassTokenDenomInfo[originDenom]?.coinDecimals ?? 18,
              logoUri: combinedCompassTokenDenomInfo[originDenom]?.icon ?? lifiAsset.logoUri,
              coingeckoId:
                combinedCompassTokenDenomInfo[originDenom]?.icon ?? lifiAsset.coingeckoId,
            }
          }
          return {
            ...lifiAsset,
            chainId: seiCosmosChainId,
            evmTokenContract,
            evmChainId: seiEvmChainId,
            logoUri: combinedCompassTokenDenomInfo[evmTokenContract]?.icon ?? lifiAsset.logoUri,
            coingeckoId:
              combinedCompassTokenDenomInfo[evmTokenContract]?.icon ?? lifiAsset.coingeckoId,
          }
        })

      const compassHardcodedTokensRecord: Record<string, MergedAsset> = {}

      await Promise.allSettled(
        compassHardcodedTokenKeys.map(async (token) => {
          if (commonAssets.has(token)) {
            return
          }
          let seiAddress = ''
          let evmAddress = ''
          let tokenContract
          if (token.startsWith('0x')) {
            evmAddress = token
            seiAddress = associations[evmAddress]
            if (!!seiAddress && commonAssets.has(seiAddress)) {
              return
            }
          } else {
            seiAddress = token
            evmAddress = reverseAssociations[seiAddress]
            if (!!evmAddress && commonAssets.has(evmAddress)) {
              return
            }
          }

          let denomInfo = combinedCompassTokenDenomInfo[seiAddress]
          tokenContract = seiAddress
          if (!denomInfo) {
            denomInfo = combinedCompassTokenDenomInfo[evmAddress]
            tokenContract = evmAddress
          }
          if (!denomInfo && !!evmAddress) {
            let details
            try {
              details = await getErc20TokenDetails(evmAddress, seiEvmRpcUrl, Number(seiEvmChainId))
            } catch (e) {
              // eslint-disable-next-line no-console
              console.error('Error getting ERC20 token details', e)
            }
            if (details) {
              denomInfo = {
                name: details.name,
                coinDenom: details.symbol,
                coinDecimals: details.decimals,
                coinMinimalDenom: evmAddress,
                icon: '',
                chain: seiCosmosChainId,
                coinGeckoId: '',
              }
            }
          }
          if (denomInfo) {
            compassHardcodedTokensRecord[token] = {
              evmTokenContract: evmAddress,
              evmChainId: seiEvmChainId,
              chainId: seiCosmosChainId,
              denom: seiAddress ?? evmAddress,
              originDenom: seiAddress ?? evmAddress,
              originChainId: seiCosmosChainId,
              symbol: denomInfo.coinDenom,
              logoUri: denomInfo.icon,
              trace: '',
              decimals: denomInfo.coinDecimals,
              coingeckoId: denomInfo.coinGeckoId,
              isCw20: false,
              name: denomInfo.name ?? denomInfo.coinDenom,
              tokenContract: tokenContract ?? evmAddress ?? seiAddress,
            }
            return
          }
        }),
      )

      const compassHardcodedTokens = Object.values(compassHardcodedTokensRecord ?? {})

      const _allAssets = {
        ...(allSkipAssets ?? {}),
        [seiCosmosChainId]: [...seiSkipAssets, ...lifiExclusiveAssets, ...compassHardcodedTokens],
      } as Record<string, MergedAsset[]>

      if (blacklistedTokens.length > 0 && _allAssets) {
        Object.keys(_allAssets).forEach((chainId) => {
          if (_allAssets[chainId]) {
            _allAssets[chainId] = _allAssets[chainId]?.filter(
              (asset) =>
                !blacklistedTokens.includes(
                  asset.originDenom?.replace(/(cw20:|erc20\/)/g, '').toLowerCase(),
                ),
            )
          }
        })

        return _allAssets
      }
      return _allAssets
    },
    {
      enabled: ['search', '/home', '/swap', '/assetDetails'].some((path) =>
        location.hash.includes(path),
      ),
      staleTime: 1000 * 60 * 2,
      cacheTime: 1000 * 60 * 5,
    },
  )

  return {
    data: allAssets,
    loadingAllSkipAssets,
    loading: loadingAllAssets,
  }
}
