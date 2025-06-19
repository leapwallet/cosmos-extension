import { getKeyToUseForDenoms, Token } from '@leapwallet/cosmos-wallet-hooks'
import { DenomsRecord, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import {
  AutoFetchedCW20DenomsStore,
  BetaCW20DenomsStore,
  CW20DenomBalanceStore,
  CW20DenomsStore,
  DisabledCW20DenomsStore,
  EnabledCW20DenomsStore,
  RootBalanceStore,
} from '@leapwallet/cosmos-wallet-store'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { SourceChain, SourceToken } from 'types/swap'

import { SWAP_NETWORK } from './useSwapsTx'

export function useTokenWithBalances(
  token: SourceToken | null,
  chain: SourceChain | undefined,
  allAssets: SourceToken[] | undefined,
  loadingAssets: boolean,
  autoFetchedCW20DenomsStore: AutoFetchedCW20DenomsStore,
  betaCW20DenomsStore: BetaCW20DenomsStore,
  cw20DenomsStore: CW20DenomsStore,
  disabledCW20DenomsStore: DisabledCW20DenomsStore,
  enabledCW20DenomsStore: EnabledCW20DenomsStore,
  cw20DenomBalanceStore: CW20DenomBalanceStore,
  rootBalanceStore: RootBalanceStore,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): { data: any; status: any } {
  const disabledCW20Tokens = disabledCW20DenomsStore.getDisabledCW20DenomsForChain(
    (chain?.key ?? '') as SupportedChain,
  )
  const enabledCW20Tokens = enabledCW20DenomsStore.getEnabledCW20DenomsForChain(
    (chain?.key ?? '') as SupportedChain,
  )
  const cw20Tokens = cw20DenomsStore.getCW20DenomsForChain((chain?.key ?? '') as SupportedChain)
  const betaCw20Tokens = betaCW20DenomsStore.getBetaCW20DenomsForChain(
    (chain?.key ?? '') as SupportedChain,
  )
  const autoFetchedCW20Denoms = autoFetchedCW20DenomsStore.getAutoFetchedCW20DenomsForChain(
    (chain?.key ?? '') as SupportedChain,
  )

  /**
   * Managed Tokens Coin Minimal Denoms
   */
  const managedTokens = useMemo(() => {
    return [
      ...Object.values(cw20Tokens),
      ...Object.values(autoFetchedCW20Denoms),
      ...Object.values(betaCw20Tokens ?? {}),
    ].map((token) => token.coinMinimalDenom)
  }, [autoFetchedCW20Denoms, betaCw20Tokens, cw20Tokens])

  const updatedToken = useMemo(() => {
    if (!token || !allAssets) return token

    const latestBalance = allAssets?.find(
      (asset) =>
        asset.coinMinimalDenom === token.coinMinimalDenom &&
        asset.ibcDenom === token.ibcDenom &&
        getKeyToUseForDenoms(
          asset.skipAsset?.originDenom ?? '',
          asset.skipAsset?.originChainId ?? '',
        ) ===
          getKeyToUseForDenoms(
            token.skipAsset?.originDenom ?? '',
            token.skipAsset?.originChainId ?? '',
          ) &&
        getKeyToUseForDenoms(asset.skipAsset?.denom ?? '', asset.skipAsset?.originChainId ?? '') ===
          getKeyToUseForDenoms(token.skipAsset?.denom ?? '', token.skipAsset?.originChainId ?? ''),
    )?.amount

    return {
      ...token,
      amount: latestBalance ?? token.amount,
    }
  }, [allAssets, token])

  const { data, status } = useQuery(
    [
      updatedToken?.coinMinimalDenom,
      updatedToken?.skipAsset?.denom,
      updatedToken?.skipAsset?.originDenom,
      updatedToken?.amount,
    ],
    async () => {
      if (!updatedToken || !chain) {
        return updatedToken
      }

      if (
        !managedTokens.includes(updatedToken.coinMinimalDenom) ||
        updatedToken?.skipAsset?.evmTokenContract
      ) {
        if (!updatedToken?.amount || updatedToken?.amount === '0') {
          if (
            updatedToken?.coinMinimalDenom?.startsWith('0x') ||
            updatedToken?.skipAsset?.evmTokenContract
          ) {
            try {
              const denomInfo: DenomsRecord = {
                [updatedToken?.skipAsset?.evmTokenContract ?? updatedToken.coinMinimalDenom]: {
                  name: updatedToken.name ?? updatedToken.skipAsset?.name ?? '',
                  coinDenom: updatedToken.symbol ?? updatedToken.skipAsset?.symbol,
                  coinMinimalDenom:
                    updatedToken?.skipAsset?.evmTokenContract ?? updatedToken.coinMinimalDenom,
                  coinDecimals:
                    updatedToken?.skipAsset?.evmDecimals ??
                    updatedToken.coinDecimals ??
                    updatedToken.skipAsset?.decimals,
                  icon: updatedToken.img ?? updatedToken.skipAsset?.logoUri ?? '',
                  chain: chain.key,
                  coinGeckoId:
                    updatedToken.coinGeckoId ?? updatedToken.skipAsset?.coingeckoId ?? '',
                },
              }
              const balances: Token[] =
                (await rootBalanceStore.erc20BalanceStore.fetchERC20TokenBalances(
                  chain.key,
                  SWAP_NETWORK,
                  [updatedToken?.skipAsset?.evmTokenContract ?? updatedToken.coinMinimalDenom],
                  true,
                  denomInfo,
                )) ?? []

              if (!balances?.length) return updatedToken

              const [tokenBalance] = balances

              return {
                ...updatedToken,
                amount: tokenBalance?.amount,
                usdPrice: tokenBalance?.usdPrice,
                usdValue: tokenBalance?.usdValue,
              }
            } catch (error) {
              if (!updatedToken?.skipAsset?.isCw20) {
                return updatedToken
              }
            }
          }

          await rootBalanceStore.loadBalances(chain.key, SWAP_NETWORK)
          // sleep for 5 secs
          await new Promise((resolve) => setTimeout(resolve, 5000))
        }
        if (!updatedToken?.skipAsset?.isCw20) {
          return updatedToken
        }
      }

      if (
        !(
          disabledCW20Tokens.includes(updatedToken.coinMinimalDenom) ||
          (Object.keys(autoFetchedCW20Denoms).includes(updatedToken.coinMinimalDenom) &&
            !enabledCW20Tokens?.includes(updatedToken.coinMinimalDenom))
        )
      ) {
        return updatedToken
      }

      try {
        let balances: Token[]
        if (updatedToken?.coinMinimalDenom) {
          balances =
            (await cw20DenomBalanceStore.fetchCW20TokenBalances(
              chain.key,
              SWAP_NETWORK,
              [updatedToken?.coinMinimalDenom ?? ''],
              true,
            )) ?? []
        } else {
          balances = []
        }

        if (!balances?.length) return updatedToken

        const [tokenBalance] = balances

        return {
          ...updatedToken,
          amount: tokenBalance?.amount,
          usdPrice: tokenBalance?.usdPrice,
          usdValue: tokenBalance?.usdValue,
        }
      } catch (error) {
        return updatedToken
      }
    },
    {
      enabled: !loadingAssets,
    },
  )

  return {
    data: (status === 'success' ? data ?? null : updatedToken) as SourceToken | null,
    status: loadingAssets ? 'loading' : status,
  }
}
