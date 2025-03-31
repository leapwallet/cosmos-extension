import { Token, useChainInfo } from '@leapwallet/cosmos-wallet-hooks'
import { DenomsRecord } from '@leapwallet/cosmos-wallet-sdk'
import { MagnifyingGlassMinus } from '@phosphor-icons/react'
import BottomModal from 'components/bottom-modal'
import { SearchInput } from 'components/search-input'
import useQuery from 'hooks/useQuery'
import { TokenCard } from 'pages/send/components/TokenCard'
import { useSendContext } from 'pages/send/context'
import React, { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { SourceToken } from 'types/swap'

type SelectTokenSheetProps = {
  assets: Token[]
  isOpen: boolean
  onClose: () => void
  selectedToken: Token
  onTokenSelect: (token: Token) => void
  denoms: DenomsRecord
}

export const SelectTokenSheet = ({
  assets,
  selectedToken,
  isOpen,
  onClose,
  onTokenSelect,
  denoms,
}: SelectTokenSheetProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const { sendActiveChain } = useSendContext()
  const locationState = useLocation().state
  const activeChainInfo = useChainInfo(sendActiveChain)

  // TODO: remove this if unused please?
  let assetCoinDenom = useQuery().get('assetCoinDenom') ?? undefined
  assetCoinDenom = useMemo(() => {
    if (locationState && (locationState as Token).coinMinimalDenom) {
      const token = locationState as Token

      return token.ibcDenom || token.coinMinimalDenom
    }

    return assetCoinDenom
  }, [assetCoinDenom, locationState])

  const _assets = useMemo(() => {
    return assets.filter((token) => {
      return (
        String(token.amount) !== '0' &&
        (denoms[token.coinMinimalDenom as keyof typeof denoms] ??
          Object.values(activeChainInfo.nativeDenoms).find(
            (_denom) => _denom.coinMinimalDenom === token.coinMinimalDenom,
          ))
      )
    })
  }, [activeChainInfo.nativeDenoms, assets, denoms])

  const transferableTokens = useMemo(
    () =>
      _assets.filter(
        (asset) =>
          asset?.coinMinimalDenom !== selectedToken?.coinMinimalDenom &&
          asset.symbol.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      ),
    [_assets, searchQuery, selectedToken?.coinMinimalDenom],
  )

  const handleSelectToken = (token: Token) => {
    onTokenSelect(token)
    onClose()
  }

  return (
    <BottomModal
      title='Select Token'
      isOpen={isOpen}
      onClose={onClose}
      contentClassName='!bg-white-100 dark:!bg-gray-950'
      className='!p-6 !pb-0'
      fullScreen={true}
    >
      <div className='flex flex-col items-center h-full'>
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          placeholder='Select Token'
          divClassName='rounded-2xl w-full flex items-center gap-[10px] bg-gray-50 dark:bg-gray-900 py-3 pr-3 pl-4 dark:focus-within:border-white-100 hover:border-secondary-400 focus-within:border-black-100 border border-transparent'
          inputClassName='flex flex-grow text-base text-gray-400 outline-none bg-white-0 font-bold dark:text-white-100 text-md placeholder:font-medium dark:placeholder:text-gray-400  !leading-[21px]'
        />

        <div
          className='bg-white-100 dark:bg-gray-950 rounded-2xl min-h-[200px] w-full mt-4'
          style={{ overflowY: 'scroll' }}
        >
          {transferableTokens.length > 0 ? (
            transferableTokens.map((asset, index) => {
              const isLast = index === transferableTokens.length - 1

              let isSelected = selectedToken?.coinMinimalDenom === asset.coinMinimalDenom
              if (selectedToken?.ibcDenom || asset.ibcDenom) {
                isSelected = selectedToken?.ibcDenom === asset.ibcDenom
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
                  />
                  {!isLast && (
                    <div className='border-b w-full border-gray-100 dark:border-gray-850' />
                  )}
                </React.Fragment>
              )
            })
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
  )
}

SelectTokenSheet.displayName = 'SelectTokenSheet'
