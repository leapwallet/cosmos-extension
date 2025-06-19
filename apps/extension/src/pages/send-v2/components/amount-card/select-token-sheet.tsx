import { useChainInfo } from '@leapwallet/cosmos-wallet-hooks'
import { DenomsRecord } from '@leapwallet/cosmos-wallet-sdk'
import { Token } from '@leapwallet/cosmos-wallet-store'
import BottomModal from 'components/bottom-modal'
import NoSearchResults from 'components/no-search-results'
import { SearchInput } from 'components/ui/input/search-input'
import { useSendContext } from 'pages/send-v2/context'
import { TokenCard } from 'pages/swaps-v2/components/TokenCard'
import React, { useMemo, useState } from 'react'
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
  const activeChainInfo = useChainInfo(sendActiveChain)

  const _assets = useMemo(() => {
    return assets.filter((token) => {
      if (token.isAptos) return true
      if (token.isSolana) return true
      if (token.isSui) return true
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
      _assets.filter((asset) =>
        asset.symbol?.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      ),
    [_assets, searchQuery],
  )

  const handleSelectToken = (token: Token) => {
    onTokenSelect(token)
    onClose()
  }

  return (
    <BottomModal
      title='Select Token'
      isOpen={isOpen}
      closeOnBackdropClick={true}
      onClose={onClose}
      contentClassName='!bg-white-100 dark:!bg-gray-950'
      className='p-0 scrollbar'
    >
      <div className='flex flex-col items-center h-full py-6'>
        <div className='w-full px-6'>
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            placeholder='Search tokens...'
          />
        </div>

        <div
          className='bg-white-100 dark:bg-gray-950 rounded-2xl min-h-[200px] max-h-[calc(100%-240px)] w-full mt-4'
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
                    isSelected={isSelected}
                    selectedChain={undefined}
                    showRedirection={false}
                  />
                  {!isLast && (
                    <div className='border-b mx-6 border-gray-100 dark:border-gray-850' />
                  )}
                </React.Fragment>
              )
            })
          ) : (
            <NoSearchResults searchQuery={searchQuery} classname='mx-6' />
          )}
        </div>
      </div>
    </BottomModal>
  )
}

SelectTokenSheet.displayName = 'SelectTokenSheet'
