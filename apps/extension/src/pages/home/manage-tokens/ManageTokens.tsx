import {
  capitalize,
  sliceSearchWord,
  sliceWord,
  Token,
  useChainApis,
  useDisabledCW20Tokens,
  useSetDisabledCW20InStorage,
} from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider, HeaderActionType, ToggleCard } from '@leapwallet/leap-ui'
import BottomSheet from 'components/bottom-sheet/BottomSheet'
import { EmptyCard } from 'components/empty-card'
import { LoaderAnimation } from 'components/loader/Loader'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useSetBetaCW20Tokens } from 'hooks/useSetBetaCW20Tokens'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { getContractInfo } from 'utils/getContractInfo'
import { imgOnError as imgError } from 'utils/imgOnError'
import extension from 'webextension-polyfill'

type ManageTokensProps = {
  isVisible: boolean
  onClose: VoidFunction
  tokens: Token[] | undefined
}

export function ManageTokens({ isVisible, onClose, tokens: _tokens }: ManageTokensProps) {
  const [searchedText, setSearchedText] = useState('')
  const disabledCW20Tokens = useDisabledCW20Tokens()
  const setDisabledCW20Tokens = useSetDisabledCW20InStorage()
  const [tokens, setTokens] = useState(_tokens ?? [])
  const activeChain = useActiveChain()
  const [fetchedTokens, setFetchedTokens] = useState<string[]>([])

  const navigate = useNavigate()
  const defaultTokenLogo = useDefaultTokenLogo()
  const setBetaCW20Tokens = useSetBetaCW20Tokens()
  const { lcdUrl } = useChainApis()
  const timeoutIdRef = useRef<NodeJS.Timeout>()
  const [fetchingContract, setFetchingContract] = useState(false)

  useEffect(() => {
    if (_tokens) {
      ;(async () => {
        setTokens([...(_tokens ?? [])])
      })()
    }
  }, [_tokens])

  useEffect(() => {
    setFetchedTokens((prevValue) => {
      return (prevValue ?? []).filter((tokenDenom) => !disabledCW20Tokens.includes(tokenDenom))
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabledCW20Tokens.length])

  const filteredTokens = useMemo(() => {
    return (
      tokens
        ?.filter((token) => {
          const lowercasedSearchedText = searchedText.trim().toLowerCase()

          if (
            (token.name ?? '').toLowerCase().includes(lowercasedSearchedText) ||
            token.symbol.toLowerCase().includes(lowercasedSearchedText) ||
            token.coinMinimalDenom.toLowerCase().includes(lowercasedSearchedText)
          ) {
            return true
          }

          return false
        })
        ?.sort((tokenA, tokenB) => {
          const symbolA = tokenA.symbol.toUpperCase()
          const symbolB = tokenB.symbol.toUpperCase()

          if (symbolA < symbolB) return -1
          if (symbolA < symbolB) return 1
          return 0
        }) ?? []
    )
  }, [tokens, searchedText])

  useEffect(() => {
    if (searchedText.length !== 0 && filteredTokens.length === 0) {
      clearTimeout(timeoutIdRef.current)

      timeoutIdRef.current = setTimeout(async () => {
        try {
          setFetchingContract(true)
          const result = await getContractInfo(lcdUrl ?? '', searchedText)

          if (typeof result !== 'string' && result.symbol) {
            setFetchedTokens((prevValue) => [...prevValue, searchedText])
            setTokens((prevValue) => [
              ...prevValue,
              {
                name: result.name,
                coinDecimals: result.decimals,
                coinMinimalDenom: searchedText,
                symbol: result.symbol,
                img: '',
                coinGeckoId: '',
              } as unknown as Token,
            ])
          }
        } catch (_) {
          //
        } finally {
          setFetchingContract(false)
        }
      }, 100)
    }
  }, [searchedText, filteredTokens.length, lcdUrl])

  const handleBottomSheetClose = () => {
    onClose()
    setSearchedText('')
  }

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

  const handleToggleClick = async (isEnabled: boolean, coinMinimalDenom: string) => {
    let _disabledCW20Tokens: string[] = []
    let hasToUpdateBetaCW20Tokens = false

    if (isEnabled) {
      _disabledCW20Tokens = disabledCW20Tokens.filter((token) => token !== coinMinimalDenom)

      const tokenInfo = tokens.find((token) => token.coinMinimalDenom === coinMinimalDenom)
      if (fetchedTokens.includes(coinMinimalDenom) && tokenInfo) {
        hasToUpdateBetaCW20Tokens = true
      }
    } else {
      _disabledCW20Tokens = [...disabledCW20Tokens, coinMinimalDenom]
    }

    await setDisabledCW20Tokens(_disabledCW20Tokens)
    if (hasToUpdateBetaCW20Tokens) {
      const tokenInfo = tokens.find((token) => token.coinMinimalDenom === coinMinimalDenom) as Token
      const _fetchTokens = fetchedTokens.filter((tokenDenom) => tokenDenom !== coinMinimalDenom)

      setFetchedTokens(_fetchTokens)

      await setBetaCW20Tokens(
        coinMinimalDenom,
        {
          chain: activeChain,
          name: tokenInfo?.name,
          coinDenom: tokenInfo?.symbol,
          coinMinimalDenom: tokenInfo?.coinMinimalDenom,
          coinDecimals: tokenInfo?.coinDecimals ?? 6,
          icon: tokenInfo?.img,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          coinGeckoId: tokenInfo?.coinGeckoId,
        },
        activeChain,
      )
    }
  }

  return (
    <BottomSheet
      isVisible={isVisible}
      headerTitle='Manage Tokens'
      onClose={handleBottomSheetClose}
      headerActionType={HeaderActionType.CANCEL}
      closeOnClickBackDrop={true}
    >
      <div className='w-full h-[580px] flex flex-col pt-6 pb-2 px-7 sticky top-[72px] bg-gray-50 dark:bg-black-100'>
        <div className='flex items-center justify-between'>
          <div className='w-[344px] flex h-10 bg-white-100 dark:bg-gray-900 rounded-[30px] mb-4 py-2 pl-5 pr-[10px]'>
            <input
              placeholder='search tokens'
              className='flex flex-grow text-base text-gray-600 dark:text-gray-200  outline-none bg-white-0'
              onChange={(event) => setSearchedText(event.target.value)}
            />
            <img src={Images.Misc.SearchIcon} />
          </div>

          <button className='mb-4 ml-2' onClick={() => handleAddNewTokenClick()}>
            <img src={Images.Misc.PlusIcon} alt='add token' />
          </button>
        </div>

        <div className='overflow-y-auto pb-20'>
          {fetchingContract === true && (
            <div className='flex items-center justify-center'>
              <LoaderAnimation color='#29a874' />
            </div>
          )}

          {fetchingContract === false && filteredTokens.length === 0 ? (
            <EmptyCard
              isRounded
              subHeading={
                searchedText ? (
                  <p>
                    You can also add the token manually{' '}
                    <button
                      className='border-none bg-transparent hover:underline cursor-pointer font-bold text-sm'
                      style={{ color: '#ad4aff' }}
                      onClick={() => handleAddNewTokenClick(true)}
                    >
                      here
                    </button>
                  </p>
                ) : (
                  <p>
                    Or You can manually add token data{' '}
                    <button
                      className='border-none bg-transparent hover:underline cursor-pointer font-bold text-sm'
                      style={{ color: '#ad4aff' }}
                      onClick={() => handleAddNewTokenClick(false)}
                    >
                      here
                    </button>
                  </p>
                )
              }
              heading={
                <p>
                  {searchedText
                    ? 'No results for “' + sliceSearchWord(searchedText) + '”'
                    : 'You can search for any CW20 token address'}
                </p>
              }
              src={Images.Misc.Explore}
            />
          ) : null}

          <div className='rounded-2xl flex flex-col items-center justify-center dark:bg-gray-900 bg-white-100 overflow-hidden'>
            {filteredTokens.map((filteredToken, index, array) => {
              const isLast = index === array.length - 1

              const title = sliceWord(
                filteredToken?.name ?? capitalize(filteredToken.symbol.toLowerCase()),
                7,
                4,
              )
              const subTitle = sliceWord(filteredToken.symbol, 4, 4)

              return (
                <React.Fragment key={`${filteredToken.coinMinimalDenom}-${index}`}>
                  <ToggleCard
                    title={title}
                    subtitle={subTitle}
                    isRounded={isLast}
                    size='md'
                    imgSrc={filteredToken.img ?? defaultTokenLogo}
                    imgOnError={imgError(defaultTokenLogo)}
                    imgClassName='h-8 w-8 mr-3'
                    isEnabled={
                      !disabledCW20Tokens.includes(filteredToken.coinMinimalDenom) &&
                      !fetchedTokens.includes(filteredToken.coinMinimalDenom)
                    }
                    onClick={(isEnabled) =>
                      handleToggleClick(isEnabled, filteredToken.coinMinimalDenom)
                    }
                  />
                  {!isLast ? <CardDivider /> : null}
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}
