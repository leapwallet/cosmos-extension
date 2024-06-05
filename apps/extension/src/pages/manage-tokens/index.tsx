import {
  useAutoFetchedCW20Tokens,
  useBetaCW20Tokens,
  useBetaERC20Tokens,
  useBetaNativeTokens,
  useChainApis,
  useCW20Tokens,
  useDisabledCW20Tokens,
  useEnabledCW20Tokens,
  useERC20Tokens,
  useGetTokenBalances,
  useInteractedTokens,
  useSetBetaCW20Tokens,
  useSetDisabledCW20InStorage,
  useSetEnabledCW20InStorage,
  useSetInteractedTokensInStorage,
} from '@leapwallet/cosmos-wallet-hooks'
import { NativeDenom } from '@leapwallet/cosmos-wallet-sdk'
import { Header, HeaderActionType } from '@leapwallet/leap-ui'
import PopupLayout from 'components/layout/popup-layout'
import { LoaderAnimation } from 'components/loader/Loader'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useThemeColor } from 'hooks/utility/useThemeColor'
import { Images } from 'images'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { getContractInfo } from 'utils/getContractInfo'
import extension from 'webextension-polyfill'

import {
  DeleteTokenSheet,
  ManageTokensEmptyCard,
  ManuallyAddedTokens,
  SupportedToken,
  SupportedTokens,
} from './components'
import { sortBySymbols } from './utils'

export default function ManageTokens() {
  const betaNativeTokens = useBetaNativeTokens()
  const betaCw20Tokens = useBetaCW20Tokens()
  const betaERC20Tokens = useBetaERC20Tokens()
  const disabledCW20Tokens = useDisabledCW20Tokens()
  const enabledCW20Tokens = useEnabledCW20Tokens()
  const cw20Tokens = useCW20Tokens()
  const erc20Tokens = useERC20Tokens()

  const interactedTokens = useInteractedTokens()
  const setDisabledCW20Tokens = useSetDisabledCW20InStorage()
  const setEnabledCW20Tokens = useSetEnabledCW20InStorage()
  const setInteractedTokens = useSetInteractedTokensInStorage()
  const activeChain = useActiveChain()

  const navigate = useNavigate()
  const themeColor = useThemeColor()
  const setBetaCW20Tokens = useSetBetaCW20Tokens()
  const { lcdUrl } = useChainApis()
  const { cw20TokensBalances, erc20TokensBalances } = useGetTokenBalances()
  const autoFetchedCW20Tokens = useAutoFetchedCW20Tokens()

  const [showDeleteSheet, setShowDeleteSheet] = useState(false)
  const [tokenToDelete, setTokenToDelete] = useState<NativeDenom>()

  const [searchedText, setSearchedText] = useState('')
  const [fetchedTokens, setFetchedTokens] = useState<string[]>([])
  const [fetchingContract, setFetchingContract] = useState(false)
  const timeoutIdRef = useRef<NodeJS.Timeout>()
  const [manuallyAddedTokens, setManuallyAddedTokens] = useState<NativeDenom[]>([])
  const [supportedTokens, setSupportedTokens] = useState<SupportedToken[]>([])

  /**
   * Initialize supported tokens
   */
  useEffect(() => {
    let _supportedTokens: SupportedToken[] = []

    const _nativeCW20Tokens =
      Object.values(cw20Tokens)?.map((token) => {
        const tokenBalance = cw20TokensBalances?.find(
          (balance) => balance.coinMinimalDenom === token.coinMinimalDenom,
        )
        return {
          ...token,
          enabled:
            String(tokenBalance?.amount) === '0'
              ? enabledCW20Tokens?.includes(token.coinMinimalDenom)
              : !disabledCW20Tokens?.includes(token.coinMinimalDenom),
          verified: true,
        }
      }) ?? []

    const _autoFetchedCW20Tokens =
      Object.values(autoFetchedCW20Tokens)?.map((token) => ({
        ...token,
        enabled: enabledCW20Tokens?.includes(token.coinMinimalDenom),
        verified: false,
      })) ?? []

    const _nativeERC20Tokens =
      Object.values(erc20Tokens)?.map((token) => {
        const tokenBalance = erc20TokensBalances?.find(
          (balance) => balance.coinMinimalDenom === token.coinMinimalDenom,
        )

        return {
          ...token,
          enabled:
            String(tokenBalance?.amount) === '0'
              ? enabledCW20Tokens?.includes(token.coinMinimalDenom)
              : !disabledCW20Tokens?.includes(token.coinMinimalDenom),
          verified: true,
        }
      }) ?? []

    _supportedTokens = [
      ..._supportedTokens,
      ..._nativeCW20Tokens,
      ..._autoFetchedCW20Tokens,
      ..._nativeERC20Tokens,
    ]

    setSupportedTokens(_supportedTokens)
  }, [
    autoFetchedCW20Tokens,
    cw20Tokens,
    cw20TokensBalances,
    disabledCW20Tokens,
    enabledCW20Tokens,
    erc20Tokens,
    erc20TokensBalances,
  ])

  /**
   * Initialize manually added tokens
   */
  useEffect(() => {
    let _manuallyAddedTokens: NativeDenom[] = []

    if (betaNativeTokens) {
      _manuallyAddedTokens = [..._manuallyAddedTokens, ...Object.values(betaNativeTokens)]
    }

    if (betaCw20Tokens) {
      _manuallyAddedTokens = [..._manuallyAddedTokens, ...Object.values(betaCw20Tokens)]
    }

    if (betaERC20Tokens) {
      _manuallyAddedTokens = [..._manuallyAddedTokens, ...Object.values(betaERC20Tokens)]
    }

    setManuallyAddedTokens(_manuallyAddedTokens)
  }, [betaCw20Tokens, betaERC20Tokens, betaNativeTokens])

  /**
   * Remove disabled tokens from fetched tokens
   */
  useEffect(() => {
    setFetchedTokens((prevValue) => {
      return (prevValue ?? []).filter((tokenDenom) => !disabledCW20Tokens.includes(tokenDenom))
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabledCW20Tokens.length])

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
            cw20Tokens?.[tokenA.coinMinimalDenom] || erc20Tokens?.[tokenA.coinMinimalDenom]
          )
          const isNativeCW20B = !!(
            cw20Tokens?.[tokenB.coinMinimalDenom] || erc20Tokens?.[tokenB.coinMinimalDenom]
          )

          if (isNativeCW20A && !isNativeCW20B) return -1
          if (!isNativeCW20A && isNativeCW20B) return 1

          return sortBySymbols(tokenA, tokenB)
        }) ?? []
    )
  }, [supportedTokens, searchedText, cw20Tokens, erc20Tokens])

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
  const handleAddNewTokenClick = (passState = false) => {
    const views = extension.extension.getViews({ type: 'popup' })

    if (views.length === 0) {
      const params: { replace: boolean; state?: { coinMinimalDenom: string } } = { replace: true }
      if (passState) params['state'] = { coinMinimalDenom: searchedText }

      navigate('/add-token', params)
    } else {
      window.open(extension.runtime.getURL('index.html#/add-token'))
    }
  }

  /**
   * Handle toggle change
   */
  const handleToggleChange = async (isEnabled: boolean, coinMinimalDenom: string) => {
    const hasUserInteracted = interactedTokens.some((token) => token === coinMinimalDenom)
    if (!hasUserInteracted) {
      await setInteractedTokens([...interactedTokens, coinMinimalDenom])
    }

    let _disabledCW20Tokens: string[] = []
    let _enabledCW20Tokens: string[] = []
    let hasToUpdateBetaCW20Tokens = false

    if (isEnabled) {
      _disabledCW20Tokens = disabledCW20Tokens.filter((token) => token !== coinMinimalDenom)
      _enabledCW20Tokens = [...enabledCW20Tokens, coinMinimalDenom]

      const tokenInfo = manuallyAddedTokens.find(
        (token) => token.coinMinimalDenom === coinMinimalDenom,
      )
      if (fetchedTokens.includes(coinMinimalDenom) && tokenInfo) {
        hasToUpdateBetaCW20Tokens = true
      }
    } else {
      _disabledCW20Tokens = [...disabledCW20Tokens, coinMinimalDenom]
      _enabledCW20Tokens = enabledCW20Tokens.filter((token) => token !== coinMinimalDenom)
    }

    await setDisabledCW20Tokens(_disabledCW20Tokens)
    await setEnabledCW20Tokens(_enabledCW20Tokens)
    if (hasToUpdateBetaCW20Tokens) {
      const tokenInfo = manuallyAddedTokens.find(
        (token) => token.coinMinimalDenom === coinMinimalDenom,
      ) as NativeDenom
      const _fetchTokens = fetchedTokens.filter((tokenDenom) => tokenDenom !== coinMinimalDenom)

      setFetchedTokens(_fetchTokens)

      await setBetaCW20Tokens(
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
  }

  return (
    <div className='relative w-[400px] overflow-clip'>
      <PopupLayout
        header={
          <Header
            action={{
              onClick: () => navigate(-1),
              type: HeaderActionType.BACK,
            }}
            title='Manage Tokens'
            topColor={themeColor}
          />
        }
      >
        <div className='w-full flex flex-col justify-center py-[28px] items-center px-7 gap-[16px]'>
          <div className='w-full flex items-center justify-between gap-[10px]'>
            <div className='w-[296px] flex h-10 bg-white-100 dark:bg-gray-900 rounded-[30px] py-2 pl-5 pr-[10px]'>
              <input
                placeholder='Search by token or paste address...'
                className='flex flex-grow text-base text-gray-600 dark:text-gray-200  outline-none bg-white-0'
                onChange={(event) => setSearchedText(event.target.value)}
              />
              <img src={Images.Misc.SearchIcon} />
            </div>

            <button
              className='h-10 bg-white-100 dark:bg-gray-900 w-10 flex justify-center items-center rounded-full'
              onClick={() => handleAddNewTokenClick()}
            >
              <span className='material-icons-round !text-lg text-gray-400 dark:text-gray-400'>
                add
              </span>
            </button>
          </div>

          {fetchingContract === true ? (
            <div className='flex items-center justify-center'>
              <LoaderAnimation color='#29a874' />
            </div>
          ) : null}

          {fetchingContract === false &&
          filteredManuallyAddedTokens.length === 0 &&
          filteredSupportedTokens.length === 0 ? (
            <ManageTokensEmptyCard
              onAddTokenClick={handleAddNewTokenClick}
              searchedText={searchedText}
            />
          ) : null}

          {filteredSupportedTokens.length > 0 ? (
            <SupportedTokens
              tokens={filteredSupportedTokens}
              handleToggleChange={handleToggleChange}
            />
          ) : null}

          {filteredManuallyAddedTokens.length > 0 ? (
            <ManuallyAddedTokens
              onDeleteClick={(token: NativeDenom) => {
                setShowDeleteSheet(true)
                setTokenToDelete(token)
              }}
              tokens={filteredManuallyAddedTokens}
              handleToggleChange={handleToggleChange}
              fetchedTokens={fetchedTokens}
            />
          ) : null}
        </div>
      </PopupLayout>

      <DeleteTokenSheet
        isOpen={showDeleteSheet}
        onClose={() => {
          setShowDeleteSheet(false)
          setTokenToDelete(undefined)
        }}
        tokenToDelete={tokenToDelete}
      />
    </div>
  )
}
