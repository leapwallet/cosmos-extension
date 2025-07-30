import { Token, useChainInfo } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfos, DenomsRecord, isSuiChain } from '@leapwallet/cosmos-wallet-sdk'
import { MagnifyingGlassMinus } from '@phosphor-icons/react'
import { BigNumber } from 'bignumber.js'
import BottomModal from 'components/new-bottom-modal'
import { SearchInput } from 'components/ui/input/search-input'
import { observer } from 'mobx-react-lite'
import { TokenCard } from 'pages/send/components/TokenCard'
import { useSendContext } from 'pages/send/context'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { SourceToken } from 'types/swap'

type SelectTokenSheetProps = {
  assets: Token[]
  isOpen: boolean
  onClose: (isTokenSelected?: boolean) => void
  selectedToken: Token | null
  onTokenSelect: (token: Token) => void
  denoms: DenomsRecord
}

export const priorityChainsIds = [
  ChainInfos.ethereum.key,
  ChainInfos.cosmos.key,
  ChainInfos.movement.key,
  ChainInfos.base.key,
]

export const SelectTokenSheet = observer(
  ({ assets, selectedToken, isOpen, onClose, onTokenSelect, denoms }: SelectTokenSheetProps) => {
    const searchInputRef = useRef<HTMLInputElement>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const { sendActiveChain } = useSendContext()
    const activeChainInfo = useChainInfo(sendActiveChain)

    const assetsToShow = useMemo(() => {
      return assets.filter((token) => {
        return (
          !new BigNumber(token?.amount).isNaN() &&
          new BigNumber(token?.amount).gt(0) &&
          (isSuiChain(token.tokenBalanceOnChain ?? '') ||
            (denoms[token.coinMinimalDenom as keyof typeof denoms] ??
              Object.values(activeChainInfo.nativeDenoms).find(
                (_denom) => _denom.coinMinimalDenom === token.coinMinimalDenom,
              ))) &&
          token?.symbol?.toLowerCase().includes(searchQuery.trim().toLowerCase())
        )
      })
    }, [activeChainInfo?.nativeDenoms, searchQuery, assets, denoms])

    const handleSelectToken = (token: Token) => {
      onTokenSelect(token)
      onClose(true)
    }

    useEffect(() => {
      if (isOpen) {
        setSearchQuery('')
        setTimeout(() => {
          searchInputRef.current?.focus()
        }, 400)
      }
    }, [isOpen])

    return (
      <>
        <BottomModal
          title='Select Token'
          isOpen={isOpen}
          onClose={onClose}
          contentClassName='!bg-white-100 dark:!bg-gray-950'
          className='!p-6 !pb-0 h-full'
          fullScreen
        >
          <div className='flex flex-col items-center h-full w-full gap-7'>
            <SearchInput
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder='Select Token'
            />

            <div className='bg-white-100 dark:bg-gray-950 w-full h-[calc(100%-76px)]'>
              {assetsToShow.length > 0 ? (
                <div style={{ overflowY: 'scroll' }} className='h-full'>
                  <Virtuoso
                    data={assetsToShow}
                    itemContent={(index, asset) => {
                      const isLast = index === assetsToShow.length - 1

                      let isSelected = selectedToken?.coinMinimalDenom === asset.coinMinimalDenom
                      if (selectedToken?.ibcDenom || asset.ibcDenom) {
                        isSelected =
                          selectedToken?.ibcDenom === asset.ibcDenom &&
                          asset.tokenBalanceOnChain === selectedToken?.tokenBalanceOnChain
                      }
                      if (selectedToken?.isEvm || asset?.isEvm) {
                        isSelected = isSelected && selectedToken?.isEvm === asset?.isEvm
                      }

                      return (
                        <React.Fragment key={`${asset.coinMinimalDenom}-${index}`}>
                          <TokenCard
                            onTokenSelect={handleSelectToken}
                            token={asset as SourceToken}
                            hideAmount={asset.amount === '0'}
                            isSelected={isSelected}
                            selectedChain={undefined}
                            showRedirection={false}
                            isFirst={index === 0}
                            isLast={isLast}
                          />
                        </React.Fragment>
                      )
                    }}
                  />
                </div>
              ) : (
                <div className='py-[80px] px-4 w-full flex-col flex  justify-center items-center gap-4'>
                  <MagnifyingGlassMinus
                    size={64}
                    className='dark:text-gray-50 text-gray-900 p-5 rounded-full bg-secondary-200'
                  />
                  <div className='flex flex-col justify-start items-center w-full gap-4'>
                    <div className='text-lg text-center font-bold !leading-[21.5px] dark:text-white-100'>
                      No tokens found
                    </div>
                    <div className='text-sm font-normal !leading-[22.4px] text-gray-400 dark:text-gray-400 text-center'>
                      We couldn’t find a match. Try searching again or use a different keyword.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </BottomModal>
      </>
    )
  },
)

SelectTokenSheet.displayName = 'SelectTokenSheet'
