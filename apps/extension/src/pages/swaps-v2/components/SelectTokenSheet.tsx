import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import NoSearchResults from 'components/no-search-results'
import { TokenCard } from 'components/token-card/TokenCard'
import { Images } from 'images'
import { useMemo, useState } from 'react'
import React from 'react'
import { SourceToken } from 'types/swap'

type SelectTokenSheetProps = {
  sourceAssets: SourceToken[]
  destinationAssets: SourceToken[]
  sourceToken: SourceToken | null
  destinationToken: SourceToken | null
  isOpen: boolean
  onClose: () => void
  showFor: 'source' | 'destination' | ''
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
}: SelectTokenSheetProps) {
  const activeChain = useActiveChain()
  const [searchQuery, setSearchQuery] = useState('')

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

  return (
    <BottomModal title='Select Token' isOpen={isOpen} closeOnBackdropClick={true} onClose={onClose}>
      <div className='flex flex-col items-center h-full'>
        <div className='mx-auto w-[344px] mb-[16px] flex h-10 bg-white-100 dark:bg-gray-900 rounded-[30px] py-2 pl-5 pr-[10px]'>
          <input
            placeholder='search tokens...'
            className='flex flex-grow text-base text-gray-400 outline-none bg-white-0'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            ref={(node) => node?.focus()}
          />

          {searchQuery.length === 0 ? (
            <img src={Images.Misc.SearchIcon} />
          ) : (
            <img
              className='cursor-pointer'
              src={Images.Misc.CrossFilled}
              onClick={() => setSearchQuery('')}
            />
          )}
        </div>

        <div
          className='bg-white-100 dark:bg-gray-900 rounded-2xl min-h-[200px] max-h-[400px] w-full'
          style={{ overflowY: 'scroll' }}
        >
          {filteredTokens.length > 0 ? (
            filteredTokens.map((token, index) => {
              const isFirst = index === 0
              const isLast = index === tokensToShow.length - 1

              let isSelected = token.coinMinimalDenom === selectedToken?.coinMinimalDenom

              if (token.ibcDenom !== undefined && selectedToken?.ibcDenom !== undefined) {
                isSelected = isSelected && token.ibcDenom === selectedToken.ibcDenom
              }

              return (
                <React.Fragment key={`${token.coinMinimalDenom}-${index}`}>
                  <div className='relative' onClick={() => onTokenSelect(token)}>
                    <TokenCard
                      assetImg={token.img}
                      title={token?.name ?? token.symbol}
                      ibcChainInfo={token.ibcChainInfo}
                      amount={token.amount}
                      symbol={token.symbol}
                      isIconVisible={isSelected}
                      hideAmount={token.amount === '0'}
                      iconSrc={
                        Images.Misc.ChainChecks[activeChain] ?? Images.Misc.ChainChecks['cosmos']
                      }
                      isRounded={isFirst || isLast}
                      size='md'
                      usdValue={token.usdValue}
                    />
                  </div>
                  {!isLast && <CardDivider />}
                </React.Fragment>
              )
            })
          ) : (
            <NoSearchResults searchQuery={searchQuery} />
          )}
        </div>
      </div>
    </BottomModal>
  )
}
