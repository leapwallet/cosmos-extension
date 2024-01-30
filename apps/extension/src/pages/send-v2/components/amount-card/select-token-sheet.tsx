import { Token, useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import NoSearchResults from 'components/no-search-results'
import { SearchInput } from 'components/search-input'
import { TokenCard } from 'components/token-card/TokenCard'
import { Images } from 'images'
import React, { useMemo, useState } from 'react'

type SelectTokenSheetProps = {
  assets: Token[]
  isOpen: boolean
  onClose: () => void
  selectedToken: Token
  // eslint-disable-next-line no-unused-vars
  onTokenSelect: (token: Token) => void
}

export const SelectTokenSheet: React.FC<SelectTokenSheetProps> = ({
  assets,
  selectedToken,
  isOpen,
  onClose,
  onTokenSelect,
}) => {
  const activeChain = useActiveChain()
  const [searchQuery, setSearchQuery] = useState('')

  const transferableTokens = useMemo(() => {
    return assets.filter((asset) =>
      asset.symbol.toLowerCase().includes(searchQuery.trim().toLowerCase()),
    )
  }, [assets, searchQuery])

  const handleSelectToken = (token: Token) => {
    onTokenSelect(token)
    onClose()
  }

  return (
    <BottomModal title='Select Token' isOpen={isOpen} closeOnBackdropClick={true} onClose={onClose}>
      <div className='flex flex-col items-center h-full'>
        <SearchInput
          placeholder='Search tokens...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
        />

        <div
          className='bg-white-100 dark:bg-gray-900 rounded-2xl min-h-[200px] max-h-[400px] w-fit'
          style={{ overflowY: 'scroll' }}
        >
          {transferableTokens.length > 0 ? (
            transferableTokens.map((asset, index) => {
              const isFirst = index === 0
              const isLast = index === transferableTokens.length - 1

              let isSelected = selectedToken?.coinMinimalDenom === asset.coinMinimalDenom
              if (selectedToken?.ibcDenom || asset.ibcDenom) {
                isSelected = selectedToken?.ibcDenom === asset.ibcDenom
              }

              return (
                <React.Fragment key={`${asset.symbol}-${index}`}>
                  <div className='relative' onClick={() => handleSelectToken(asset)}>
                    <TokenCard
                      assetImg={asset.img}
                      title={asset?.name ?? asset.symbol}
                      ibcChainInfo={asset.ibcChainInfo}
                      amount={asset.amount}
                      symbol={asset.symbol}
                      isIconVisible={isSelected}
                      iconSrc={
                        Images.Misc.ChainChecks[activeChain] ?? Images.Misc.ChainChecks['cosmos']
                      }
                      isRounded={isFirst || isLast}
                      size='md'
                      usdValue={asset.usdValue}
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
