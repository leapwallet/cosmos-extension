import { AddressZero } from '@ethersproject/constants'
import { NativeDenom, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import {
  AutoFetchedCW20DenomsStore,
  BetaCW20DenomsStore,
  BetaERC20DenomsStore,
  CW20DenomsStore,
  DisabledCW20DenomsStore,
  EnabledCW20DenomsStore,
  ERC20DenomsStore,
  RootBalanceStore,
  RootDenomsStore,
} from '@leapwallet/cosmos-wallet-store'
import { useCallback, useMemo } from 'react'
import { SourceChain, SourceToken } from 'types/swap'

import { SWAP_NETWORK } from './useSwapsTx'

export function useEnableToken(
  chain: SourceChain | undefined,
  tokenToEnable: SourceToken | undefined | null,
  autoFetchedCW20DenomsStore: AutoFetchedCW20DenomsStore,
  betaCW20DenomsStore: BetaCW20DenomsStore,
  cw20DenomsStore: CW20DenomsStore,
  disabledCW20DenomsStore: DisabledCW20DenomsStore,
  enabledCW20DenomsStore: EnabledCW20DenomsStore,
  erc20DenomsStore: ERC20DenomsStore,
  betaERC20DenomsStore: BetaERC20DenomsStore,
  rootBalanceStore: RootBalanceStore,
  rootDenomsStore: RootDenomsStore,
) {
  const cw20Tokens = cw20DenomsStore.getCW20DenomsForChain((chain?.key ?? '') as SupportedChain)
  const enabledCW20Tokens = enabledCW20DenomsStore.getEnabledCW20DenomsForChain(
    (chain?.key ?? '') as SupportedChain,
  )
  const disabledCW20Tokens = disabledCW20DenomsStore.getDisabledCW20DenomsForChain(
    (chain?.key ?? '') as SupportedChain,
  )
  const betaCw20Tokens = betaCW20DenomsStore.getBetaCW20DenomsForChain(
    (chain?.key ?? '') as SupportedChain,
  )
  const autoFetchedCW20Denoms = autoFetchedCW20DenomsStore.getAutoFetchedCW20DenomsForChain(
    (chain?.key ?? '') as SupportedChain,
  )
  const erc20Denoms = erc20DenomsStore.getERC20DenomsForChain((chain?.key ?? '') as SupportedChain)
  const betaERC20Denoms = betaERC20DenomsStore.getBetaERC20DenomsForChain(
    (chain?.key ?? '') as SupportedChain,
  )
  const rootDenoms = rootDenomsStore.baseDenomsStore.denoms

  const managedTokens = useMemo(() => {
    let _managedTokens: string[] = []
    if (cw20Tokens) {
      _managedTokens = _managedTokens.concat(
        Object.values(cw20Tokens)?.map((token) => token.coinMinimalDenom),
      )
    }
    if (autoFetchedCW20Denoms) {
      _managedTokens = _managedTokens.concat(
        Object.values(autoFetchedCW20Denoms)?.map((token) => token.coinMinimalDenom),
      )
    }
    if (betaCw20Tokens) {
      _managedTokens = _managedTokens.concat(
        Object.values(betaCw20Tokens)?.map((token) => token.coinMinimalDenom),
      )
    }
    return _managedTokens?.filter(Boolean)
  }, [cw20Tokens, autoFetchedCW20Denoms, betaCw20Tokens])

  const enableToken = useCallback(async () => {
    if (!tokenToEnable || !chain) return

    if (
      tokenToEnable?.skipAsset?.evmTokenContract ||
      tokenToEnable?.coinMinimalDenom?.startsWith('0x')
    ) {
      const evmAddress =
        tokenToEnable?.skipAsset?.evmTokenContract ?? tokenToEnable?.coinMinimalDenom

      if (evmAddress === AddressZero) {
        return
      }

      const isAbsentInBetaERC20Denoms =
        !betaERC20Denoms ||
        !(Object.values(betaERC20Denoms)?.map((token) => token.coinMinimalDenom) ?? []).includes(
          evmAddress,
        )
      const isAbsentInERC20Denoms =
        !erc20Denoms ||
        !(Object.values(erc20Denoms)?.map((token) => token.coinMinimalDenom) ?? []).includes(
          evmAddress,
        )

      const seiAddress = tokenToEnable?.coinMinimalDenom

      let isAbsentInCW20Denoms = false
      let isAbsentInBetaCW20Denoms = false
      let isAbsentInEnabledCW20Denoms = false
      let isAbsentInRootDenoms = false

      if (!seiAddress || seiAddress?.startsWith('0x')) {
        isAbsentInCW20Denoms = true
        isAbsentInBetaCW20Denoms = true
        isAbsentInEnabledCW20Denoms = true
        isAbsentInRootDenoms = true
      } else if (seiAddress?.startsWith('factory/')) {
        isAbsentInRootDenoms =
          !rootDenoms ||
          !(Object.values(rootDenoms)?.map((token) => token.coinMinimalDenom) ?? []).includes(
            seiAddress,
          )
        isAbsentInCW20Denoms = true
        isAbsentInBetaCW20Denoms = true
        isAbsentInEnabledCW20Denoms = true
      } else {
        isAbsentInRootDenoms = true
        isAbsentInCW20Denoms =
          !cw20Tokens ||
          !(Object.values(cw20Tokens)?.map((token) => token.coinMinimalDenom) ?? []).includes(
            seiAddress,
          )

        isAbsentInBetaCW20Denoms =
          !betaCw20Tokens ||
          !(Object.values(betaCw20Tokens)?.map((token) => token.coinMinimalDenom) ?? []).includes(
            seiAddress,
          )

        isAbsentInEnabledCW20Denoms =
          !enabledCW20Tokens || !(enabledCW20Tokens ?? []).includes(seiAddress)
      }

      if (
        isAbsentInBetaERC20Denoms &&
        isAbsentInERC20Denoms &&
        isAbsentInCW20Denoms &&
        isAbsentInBetaCW20Denoms &&
        isAbsentInEnabledCW20Denoms &&
        isAbsentInRootDenoms
      ) {
        const tokenInfo: NativeDenom = {
          name: tokenToEnable.name ?? tokenToEnable.skipAsset?.name ?? '',
          coinDenom: tokenToEnable.symbol ?? tokenToEnable.skipAsset?.symbol,
          coinMinimalDenom: evmAddress,
          icon: tokenToEnable.img ?? tokenToEnable.skipAsset?.logoUri ?? '',
          coinDecimals:
            tokenToEnable?.skipAsset?.evmDecimals ??
            tokenToEnable.coinDecimals ??
            tokenToEnable.skipAsset?.decimals,
          chain: chain?.key,
          coinGeckoId: tokenToEnable.coinGeckoId ?? tokenToEnable.skipAsset?.coingeckoId ?? '',
        }
        await betaERC20DenomsStore.setBetaERC20Denoms(evmAddress, tokenInfo, chain?.key)
        await rootBalanceStore.erc20BalanceStore.fetchERC20TokenBalances(
          chain.key,
          SWAP_NETWORK,
          [evmAddress],
          false,
          { [evmAddress]: tokenInfo },
        )
        const _disabledCW20Tokens = disabledCW20Tokens.filter((_token) => _token !== evmAddress)
        const _enabledCW20Tokens = [...enabledCW20Tokens, evmAddress]
        await disabledCW20DenomsStore.setDisabledCW20Denoms(_disabledCW20Tokens, chain?.key)
        await enabledCW20DenomsStore.setEnabledCW20Denoms(_enabledCW20Tokens, chain?.key)
        return
      }
    }

    if (!managedTokens.includes(tokenToEnable.coinMinimalDenom)) return

    if (
      !(
        disabledCW20Tokens.includes(tokenToEnable.coinMinimalDenom) ||
        (Object.keys(autoFetchedCW20Denoms).includes(tokenToEnable.coinMinimalDenom) &&
          !enabledCW20Tokens?.includes(tokenToEnable.coinMinimalDenom))
      )
    ) {
      return
    }

    const _disabledCW20Tokens = disabledCW20Tokens.filter(
      (_token) => _token !== tokenToEnable?.coinMinimalDenom,
    )
    const _enabledCW20Tokens = [...enabledCW20Tokens, tokenToEnable?.coinMinimalDenom]
    await disabledCW20DenomsStore.setDisabledCW20Denoms(_disabledCW20Tokens, chain?.key)
    await enabledCW20DenomsStore.setEnabledCW20Denoms(_enabledCW20Tokens, chain?.key)
  }, [
    tokenToEnable,
    chain,
    managedTokens,
    disabledCW20Tokens,
    autoFetchedCW20Denoms,
    enabledCW20Tokens,
    disabledCW20DenomsStore,
    enabledCW20DenomsStore,
    betaERC20Denoms,
    erc20Denoms,
    rootDenoms,
    cw20Tokens,
    betaCw20Tokens,
    betaERC20DenomsStore,
    rootBalanceStore.erc20BalanceStore,
  ])

  return { enableToken }
}
