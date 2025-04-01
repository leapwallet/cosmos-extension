import { useChainApis } from '@leapwallet/cosmos-wallet-hooks'
import { NativeDenom } from '@leapwallet/cosmos-wallet-sdk'
import { Plus } from '@phosphor-icons/react'
import { LoaderAnimation } from 'components/loader/Loader'
import { Button } from 'components/ui/button'
import { SearchInput } from 'components/ui/input/search-input'
import { autorun } from 'mobx'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { GroupedVirtuoso } from 'react-virtuoso'
import { activeChainStore } from 'stores/active-chain-store'
import { cw20TokenBalanceStore, erc20TokenBalanceStore } from 'stores/balance-store'
import { chainInfoStore } from 'stores/chain-infos-store'
import {
  autoFetchedCW20DenomsStore,
  betaCW20DenomsStore,
  betaERC20DenomsStore,
  betaNativeDenomsStore,
  cw20DenomsStore,
  disabledCW20DenomsStore,
  enabledCW20DenomsStore,
  erc20DenomsStore,
  interactedDenomsStore,
} from 'stores/denoms-store-instance'
import { selectedNetworkStore } from 'stores/selected-network-store'
import { getContractInfo } from 'utils/getContractInfo'
import extension from 'webextension-polyfill'

import { DeleteTokenSheet, ManageTokensEmptyCard, SupportedToken } from './components'
import { ManageTokensHeader } from './components/manage-tokens-header'
import { ManuallyAddedTokenCard } from './components/ManuallyAddedTokenCard'
import { SupportedTokenCard } from './components/SupportedTokenCard'
import { sortBySymbols } from './utils'

const ManageTokens = observer(() => {
  const { activeChain } = activeChainStore
  const { selectedNetwork } = selectedNetworkStore
  const { disabledCW20Denoms } = disabledCW20DenomsStore
  const { enabledCW20Denoms } = enabledCW20DenomsStore
  const betaCW20Denoms = betaCW20DenomsStore.betaCW20Denoms
  const { cw20Denoms } = cw20DenomsStore
  const { interactedDenoms } = interactedDenomsStore
  const betaNativeDenoms = betaNativeDenomsStore.betaNativeDenoms
  const betaERC20Denoms = betaERC20DenomsStore.betaERC20Denoms
  const { erc20Denoms } = erc20DenomsStore

  const { cw20Tokens: cw20TokensBalances } = cw20TokenBalanceStore
  const { erc20Tokens: erc20TokensBalances } = erc20TokenBalanceStore

  const navigate = useNavigate()
  const { lcdUrl } = useChainApis()

  const [showDeleteSheet, setShowDeleteSheet] = useState(false)
  const [tokenToDelete, setTokenToDelete] = useState<NativeDenom>()

  const [searchedText, setSearchedText] = useState('')
  const [fetchedTokens, setFetchedTokens] = useState<string[]>([])
  const [fetchingContract, setFetchingContract] = useState(false)
  const timeoutIdRef = useRef<NodeJS.Timeout>()
  const [manuallyAddedTokens, setManuallyAddedTokens] = useState<NativeDenom[]>([])

  /**
   * Initialize supported tokens
   */
  const supportedTokens = useMemo(() => {
    let _supportedTokens: SupportedToken[] = []

    const _nativeCW20Tokens =
      Object.values(cw20Denoms)?.map((token) => {
        const tokenBalance = cw20TokensBalances?.find(
          (balance) => balance.coinMinimalDenom === token.coinMinimalDenom,
        )
        return {
          ...token,
          enabled:
            !tokenBalance || String(tokenBalance?.amount) === '0'
              ? enabledCW20Denoms?.includes(token.coinMinimalDenom)
              : !disabledCW20Denoms?.includes(token.coinMinimalDenom),
          verified: true,
        }
      }) ?? []

    const _nativeERC20Tokens =
      Object.values(erc20Denoms)?.map((token) => {
        const tokenBalance = erc20TokensBalances?.find(
          (balance) => balance.coinMinimalDenom === token.coinMinimalDenom,
        )

        return {
          ...token,
          enabled:
            !tokenBalance || String(tokenBalance?.amount) === '0'
              ? enabledCW20Denoms?.includes(token.coinMinimalDenom)
              : !disabledCW20Denoms?.includes(token.coinMinimalDenom),
          verified: true,
        }
      }) ?? []

    _supportedTokens = [..._supportedTokens, ..._nativeCW20Tokens, ..._nativeERC20Tokens]

    return _supportedTokens
  }, [
    cw20Denoms,
    cw20TokensBalances,
    disabledCW20Denoms,
    enabledCW20Denoms,
    erc20Denoms,
    erc20TokensBalances,
  ])

  /**
   * Replace with AllBetaTokensStore ?
   * Initialize manually added tokens
   */
  useEffect(
    () =>
      autorun(() => {
        let _manuallyAddedTokens: NativeDenom[] = []
        if (betaNativeDenoms) {
          _manuallyAddedTokens = [
            ..._manuallyAddedTokens,
            ...(Object.values(betaNativeDenoms) ?? []),
          ]
        }

        if (betaCW20Denoms) {
          _manuallyAddedTokens = [..._manuallyAddedTokens, ...(Object.values(betaCW20Denoms) ?? [])]
        }

        if (betaERC20Denoms) {
          _manuallyAddedTokens = [
            ..._manuallyAddedTokens,
            ...(Object.values(betaERC20Denoms) ?? []),
          ]
        }

        setManuallyAddedTokens(_manuallyAddedTokens)
      }),
    [betaCW20Denoms, betaERC20Denoms, betaNativeDenoms],
  )

  /**
   * Remove disabled tokens from fetched tokens
   */
  useEffect(() => {
    setFetchedTokens((prevValue) => {
      return (prevValue ?? []).filter((tokenDenom) => !disabledCW20Denoms.includes(tokenDenom))
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabledCW20Denoms.length])

  /**
   * Filter manually added tokens
   */
  const filteredManuallyAddedTokens = useMemo(() => {
    return (
      manuallyAddedTokens
        ?.filter((token) => {
          const lowercasedSearchedText = searchedText.trim().toLowerCase()

          if (
            (token.name ?? '').toLowerCase().includes(lowercasedSearchedText) ||
            token.coinDenom.toLowerCase().includes(lowercasedSearchedText) ||
            token.coinMinimalDenom.toLowerCase().includes(lowercasedSearchedText)
          ) {
            return true
          }

          return false
        })
        ?.sort((tokenA, tokenB) => {
          const symbolA = tokenA.coinDenom.toUpperCase()
          const symbolB = tokenB.coinDenom.toUpperCase()

          if (symbolA < symbolB) return -1
          if (symbolA < symbolB) return 1
          return 0
        }) ?? []
    )
  }, [manuallyAddedTokens, searchedText])

  /**
   * Filter supported tokens
   */
  const filteredSupportedTokens = useMemo(() => {
    return (
      supportedTokens
        ?.filter((token) => {
          const lowercasedSearchedText = searchedText.trim().toLowerCase()

          if (
            (token.name ?? '').toLowerCase().includes(lowercasedSearchedText) ||
            token.coinDenom.toLowerCase().includes(lowercasedSearchedText) ||
            token.coinMinimalDenom.toLowerCase().includes(lowercasedSearchedText)
          ) {
            return true
          }

          return false
        })
        ?.sort((tokenA, tokenB) => {
          const isEnabledA = tokenA.enabled
          const isEnabledB = tokenB.enabled

          if (isEnabledA && !isEnabledB) return -1
          if (!isEnabledA && isEnabledB) return 1

          const isNativeCW20A = !!(
            cw20Denoms?.[tokenA.coinMinimalDenom] || erc20Denoms?.[tokenA.coinMinimalDenom]
          )
          const isNativeCW20B = !!(
            cw20Denoms?.[tokenB.coinMinimalDenom] || erc20Denoms?.[tokenB.coinMinimalDenom]
          )

          if (isNativeCW20A && !isNativeCW20B) return -1
          if (!isNativeCW20A && isNativeCW20B) return 1

          return sortBySymbols(tokenA, tokenB)
        }) ?? []
    )
  }, [supportedTokens, searchedText, cw20Denoms, erc20Denoms])

  /**
   * Fetch contract info from the chain
   */
  useEffect(() => {
    if (
      searchedText.length !== 0 &&
      filteredSupportedTokens.length === 0 &&
      filteredManuallyAddedTokens.length === 0
    ) {
      clearTimeout(timeoutIdRef.current)

      timeoutIdRef.current = setTimeout(async () => {
        try {
          setFetchingContract(true)
          const result = await getContractInfo(lcdUrl ?? '', searchedText)

          if (typeof result !== 'string' && result.symbol) {
            setFetchedTokens((prevValue) => [...prevValue, searchedText])
            setManuallyAddedTokens((prevValue) => [
              ...prevValue,
              {
                name: result.name,
                coinDecimals: result.decimals,
                coinMinimalDenom: searchedText,
                coinDenom: result.symbol,
                icon: '',
                coinGeckoId: '',
                chain: activeChain,
              },
            ])
          }
        } catch (_) {
          //
        } finally {
          setFetchingContract(false)
        }
      }, 100)
    }
  }, [
    searchedText,
    filteredManuallyAddedTokens.length,
    lcdUrl,
    activeChain,
    filteredSupportedTokens.length,
  ])

  /**
   * Handle add new token click
   */
  const handleAddNewTokenClick = useCallback(
    (passState = false) => {
      const views = extension.extension.getViews({ type: 'popup' })

      if (views.length === 0) {
        const params: { replace: boolean; state?: { coinMinimalDenom: string } } = { replace: true }
        if (passState) params['state'] = { coinMinimalDenom: searchedText }

        navigate('/add-token', params)
      } else {
        window.open(extension.runtime.getURL('index.html#/add-token'))
      }
    },
    [navigate, searchedText],
  )

  /**
   * Handle toggle change
   */
  const handleToggleChange = useCallback(
    async (isEnabled: boolean, coinMinimalDenom: string) => {
      const hasUserInteracted = interactedDenoms.some((token) => token === coinMinimalDenom)
      if (!hasUserInteracted) {
        await interactedDenomsStore.setInteractedDenoms([...interactedDenoms, coinMinimalDenom])
      }

      let _disabledCW20Tokens: string[] = []
      let _enabledCW20Denoms: string[] = []
      let hasToUpdateBetaCW20Tokens = false

      if (isEnabled) {
        _disabledCW20Tokens = disabledCW20Denoms.filter((token) => token !== coinMinimalDenom)
        _enabledCW20Denoms = [...enabledCW20Denoms, coinMinimalDenom]

        const tokenInfo = manuallyAddedTokens.find(
          (token) => token.coinMinimalDenom === coinMinimalDenom,
        )
        if (fetchedTokens.includes(coinMinimalDenom) && tokenInfo) {
          hasToUpdateBetaCW20Tokens = true
        }
        if (activeChain !== 'aggregated') {
          cw20TokenBalanceStore.fetchCW20TokenBalances(activeChain, selectedNetwork, [
            coinMinimalDenom,
          ])
        }
      } else {
        _disabledCW20Tokens = [...disabledCW20Denoms, coinMinimalDenom]
        _enabledCW20Denoms = enabledCW20Denoms.filter((token) => token !== coinMinimalDenom)
      }

      await disabledCW20DenomsStore.setDisabledCW20Denoms(_disabledCW20Tokens)
      await enabledCW20DenomsStore.setEnabledCW20Denoms(_enabledCW20Denoms)
      if (hasToUpdateBetaCW20Tokens) {
        const tokenInfo = manuallyAddedTokens.find(
          (token) => token.coinMinimalDenom === coinMinimalDenom,
        ) as NativeDenom
        const _fetchTokens = fetchedTokens.filter((tokenDenom) => tokenDenom !== coinMinimalDenom)

        setFetchedTokens(_fetchTokens)

        await betaCW20DenomsStore.setBetaCW20Denoms(
          coinMinimalDenom,
          {
            chain: activeChain,
            name: tokenInfo.name,
            coinDenom: tokenInfo.coinDenom,
            coinMinimalDenom: tokenInfo.coinMinimalDenom,
            coinDecimals: tokenInfo.coinDecimals,
            icon: tokenInfo?.icon,
            coinGeckoId: tokenInfo?.coinGeckoId,
          },
          activeChain,
        )
      }
    },
    [
      activeChain,
      selectedNetwork,
      disabledCW20Denoms,
      enabledCW20Denoms,
      fetchedTokens,
      interactedDenoms,
      manuallyAddedTokens,
    ],
  )

  const onCloseDeleteTokenSheet = useCallback(() => {
    setShowDeleteSheet(false)
    setTokenToDelete(undefined)
  }, [])

  const onDeleteClick = useCallback((token: NativeDenom) => {
    setShowDeleteSheet(true)
    setTokenToDelete(token)
  }, [])

  const groups = useMemo(() => {
    return [
      {
        type: 'supported' as const,
        items: filteredSupportedTokens,
        Component: SupportedTokenCard,
      },
      {
        type: 'manually-added' as const,
        items: filteredManuallyAddedTokens,
        Component: ManuallyAddedTokenCard,
      },
    ]
  }, [filteredManuallyAddedTokens, filteredSupportedTokens])

  return (
    <>
      <ManageTokensHeader />

      <div className='w-full flex-1 flex flex-col justify-start py-[28px] items-center px-7 gap-[16px]'>
        <div className='flex gap-x-2 justify-between items-center w-full'>
          <SearchInput
            placeholder='Search by token or paste address...'
            onChange={(event) => setSearchedText(event.target.value)}
            onClear={() => setSearchedText('')}
          />
          <Button
            size={'icon'}
            variant={'secondary'}
            className='text-muted-foreground h-12 w-14 bg-secondary-100'
            onClick={() => handleAddNewTokenClick()}
          >
            <Plus size={20} />
          </Button>
        </div>

        {fetchingContract && (
          <div className='flex items-center justify-center'>
            <LoaderAnimation color='#29a874' />
          </div>
        )}

        {fetchingContract === false &&
          filteredManuallyAddedTokens.length === 0 &&
          filteredSupportedTokens.length === 0 && (
            <ManageTokensEmptyCard
              onAddTokenClick={handleAddNewTokenClick}
              searchedText={searchedText}
            />
          )}

        {filteredManuallyAddedTokens.length + filteredSupportedTokens.length !== 0 ? (
          <GroupedVirtuoso
            style={{ flexGrow: '1', width: '100%' }}
            groupContent={() => <div className='w-[1px] h-[1px] bg-transparent'></div>} //This is to avoid virtuoso errors in console logs
            groupCounts={groups.map((group) => group.items.length)}
            itemContent={(index, groupIndex) => {
              const group = groups[groupIndex]
              if (group.type === 'supported') {
                const { Component } = group
                const item = group.items[index]
                return (
                  <Component
                    key={`${item.coinMinimalDenom}`}
                    activeChainStore={activeChainStore}
                    cw20DenomsStore={cw20DenomsStore}
                    autoFetchedCW20DenomsStore={autoFetchedCW20DenomsStore}
                    token={item}
                    tokensLength={group.items.length}
                    index={index}
                    handleToggleChange={handleToggleChange}
                  />
                )
              }

              const { Component } = group
              const effectiveIndex = index - groups[0].items.length
              const item = group.items[effectiveIndex]

              return (
                <Component
                  index={effectiveIndex}
                  key={`${item?.coinMinimalDenom ?? effectiveIndex}`}
                  token={item}
                  hasSupportedTokens={filteredSupportedTokens?.length !== 0}
                  tokensLength={group.items.length}
                  handleToggleChange={handleToggleChange}
                  fetchedTokens={fetchedTokens}
                  onDeleteClick={onDeleteClick}
                  betaCW20DenomsStore={betaCW20DenomsStore}
                  disabledCW20DenomsStore={disabledCW20DenomsStore}
                  enabledCW20DenomsStore={enabledCW20DenomsStore}
                  betaERC20DenomsStore={betaERC20DenomsStore}
                />
              )
            }}
          />
        ) : null}
      </div>

      <DeleteTokenSheet
        activeChainStore={activeChainStore}
        chainInfosStore={chainInfoStore}
        betaNativeDenomsStore={betaNativeDenomsStore}
        betaERC20DenomsStore={betaERC20DenomsStore}
        betaCW20DenomsStore={betaCW20DenomsStore}
        isOpen={showDeleteSheet}
        onClose={onCloseDeleteTokenSheet}
        tokenToDelete={tokenToDelete}
      />
    </>
  )
})

export default ManageTokens
