import { useDenoms, useWhitelistedFactoryTokens } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import { SearchInput } from 'components/search-input'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { SourceChain, SourceToken } from 'types/swap'

import { TokenCard } from './TokenCard'

type SelectTokenSheetProps = {
  sourceAssets: SourceToken[]
  destinationAssets: SourceToken[]
  sourceToken: SourceToken | null
  destinationToken: SourceToken | null
  isOpen: boolean
  onClose: () => void
  showFor: 'source' | 'destination' | ''
  selectedChain: SourceChain | undefined
  // eslint-disable-next-line no-unused-vars
  onTokenSelect: (token: SourceToken) => void
}

export function SelectTokenSheet({
  sourceAssets,
  sourceToken,
  destinationAssets,
  destinationToken,
  isOpen,
  onClose,
  showFor,
  onTokenSelect,
  selectedChain,
}: SelectTokenSheetProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const baseDenoms = useDenoms()
  const whitelistedFactoryTokens = useWhitelistedFactoryTokens()

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
    }
  }, [isOpen])

  const selectedToken = useMemo(() => {
    switch (showFor) {
      case 'source':
        return sourceToken

      case 'destination':
        return destinationToken

      default:
        return null
    }
  }, [showFor, sourceToken, destinationToken])

  const tokensToShow = useMemo(() => {
    switch (showFor) {
      case 'source':
        return sourceAssets

      case 'destination':
        return destinationAssets

      default:
        return []
    }
  }, [showFor, sourceAssets, destinationAssets])

  const filteredTokens = useMemo(() => {
    if (searchQuery.length === 0) {
      return tokensToShow
    }

    return tokensToShow.filter((token) => {
      return [
        token.symbol.toLowerCase(),
        (token.name ?? '').toLowerCase(),
        token.coinMinimalDenom.toLowerCase(),
        (token.ibcDenom ?? '').toLowerCase(),
      ].some((str) => str.includes(searchQuery.trim().toLowerCase()))
    })
  }, [searchQuery, tokensToShow])

  const baseTokensList = useMemo(
    () => Object.values(baseDenoms)?.map((token) => token.coinMinimalDenom),
    [baseDenoms],
  )

  const isWhiteListedToken = useCallback(
    (token: SourceToken) => {
      if (!baseTokensList?.includes(token.coinMinimalDenom)) {
        return false
      }
      if (token.coinMinimalDenom.startsWith('factory/')) {
        return whitelistedFactoryTokens?.[token.coinMinimalDenom]
      }

      return true
    },
    [whitelistedFactoryTokens, baseTokensList],
  )

  const [whitelistedTokens, unverifiedTokens] = useMemo(() => {
    const _unverifiedTokens: SourceToken[] = []
    const _whitelistedTokens: SourceToken[] = []

    filteredTokens.forEach((token) => {
      if (isWhiteListedToken(token)) {
        _whitelistedTokens.push(token)
      } else {
        _unverifiedTokens.push(token)
      }
    })

    return [_whitelistedTokens, _unverifiedTokens]
  }, [filteredTokens, isWhiteListedToken])

  return (
    <BottomModal
      title='Select Token'
      onClose={onClose}
      isOpen={isOpen}
      closeOnBackdropClick={true}
      hideActionButton={true}
      showSecondaryActionButton={true}
      containerClassName='!bg-white-100 dark:!bg-gray-950'
      headerClassName='!bg-white-100 dark:!bg-gray-950'
      contentClassName='!bg-white-100 dark:!bg-gray-950'
      className='p-6'
      secondaryActionButton={
        <div className='absolute top-1 right-6'>
          <Buttons.Cancel onClick={onClose} />
        </div>
      }
    >
      <div className='flex flex-col items-center w-full h-full'>
        <div className='flex flex-col items-center w-full h-full mb-6'>
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testing-id='switch-token-input-search'
            placeholder='Search Token'
            onClear={() => setSearchQuery('')}
            divClassName='rounded-2xl w-full flex gap-[10px] bg-gray-50 dark:bg-gray-900 py-3 pr-3 pl-4 focus-within:border-green-600 border border-transparent'
            inputClassName='flex flex-grow text-base text-gray-400 outline-none bg-white-0 font-bold dark:text-white-100 text-md placeholder:font-medium dark:placeholder:text-gray-400  !leading-[21px]'
          />
        </div>

        <div className='max-h-[400px] w-full' style={{ overflowY: 'scroll' }}>
          {filteredTokens.length === 0 ? (
            <div className='py-[88px] w-full flex-col flex  justify-center items-center gap-4'>
              <div className='material-icons-round !text-[40px] !leading-[40px] dark:text-white-100'>
                help_outline
              </div>
              <div className='flex flex-col justify-start items-center w-full gap-1'>
                <div className='text-md text-center font-bold !leading-[21.5px] dark:text-white-100'>
                  No tokens found for &apos;{searchQuery}&apos;
                </div>
                <div className='text-sm font-normal !leading-[22.4px] text-gray-400 dark:text-gray-400'>
                  Try searching for a different term
                </div>
              </div>
            </div>
          ) : (
            <div className='w-full flex flex-col justify-start items-start gap-[16px]'>
              {whitelistedTokens?.length > 0 && (
                <div className='w-full flex flex-col justify-start items-start'>
                  <div className='mb-[8px] flex flex-row justify-start items-center gap-[4px] text-gray-400'>
                    <span className='material-icons-outlined !leading-[20px] !text-md'>
                      verified
                    </span>
                    <span className='font-bold text-xs'>Whitelisted tokens</span>
                  </div>
                  {whitelistedTokens.map((token, index) => {
                    const isLast = index === whitelistedTokens.length - 1

                    let isSelected = token.coinMinimalDenom === selectedToken?.coinMinimalDenom

                    if (token.ibcDenom !== undefined && selectedToken?.ibcDenom !== undefined) {
                      isSelected = isSelected && token.ibcDenom === selectedToken.ibcDenom
                    }

                    return (
                      <React.Fragment key={`${token.coinMinimalDenom}-${index}`}>
                        <TokenCard
                          onTokenSelect={onTokenSelect}
                          token={token}
                          hideAmount={token.amount === '0'}
                          isSelected={isSelected}
                          verified={true}
                          selectedChain={selectedChain}
                          showRedirection={false}
                        />
                        {!isLast && (
                          <div className='border-b w-full border-gray-100 dark:border-gray-850' />
                        )}
                      </React.Fragment>
                    )
                  })}
                </div>
              )}
              {searchQuery.trim() !== '' && unverifiedTokens?.length > 0 && (
                <div className='w-full flex flex-col justify-start items-start'>
                  <div className='mb-[8px] flex flex-row justify-start items-center gap-[4px] text-gray-400'>
                    <span className='material-icons-round !leading-[20px] !text-md'>
                      warning_amber
                    </span>
                    <span className='font-bold text-xs'>Unverified tokens</span>
                  </div>
                  {unverifiedTokens.map((token, index) => {
                    const isLast = index === unverifiedTokens.length - 1

                    let isSelected = token.coinMinimalDenom === selectedToken?.coinMinimalDenom

                    if (token.ibcDenom !== undefined && selectedToken?.ibcDenom !== undefined) {
                      isSelected = isSelected && token.ibcDenom === selectedToken.ibcDenom
                    }

                    return (
                      <React.Fragment key={`${token.coinMinimalDenom}-${index}`}>
                        <TokenCard
                          onTokenSelect={onTokenSelect}
                          token={token}
                          hideAmount={token.amount === '0'}
                          isSelected={isSelected}
                          verified={false}
                          selectedChain={selectedChain}
                          showRedirection={true}
                        />
                        {!isLast && (
                          <div className='border-b w-full border-gray-100 dark:border-gray-850' />
                        )}
                      </React.Fragment>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </BottomModal>
  )
}
