import { sortTokens, Token, useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import NoSearchResults from 'components/no-search-results'
import { SearchInput } from 'components/search-input'
import { TokenCard } from 'components/token-card/TokenCard'
import { Images } from 'images'
import React, { useCallback, useMemo, useState } from 'react'

type SelectTokenSheetProps = {
  assets: Token[]
  isOpen: boolean
  onClose: () => void
  selectedToken?: Token
  // eslint-disable-next-line no-unused-vars
  onTokenSelect: (baseDenom: string, ibcDenom?: string) => void
}

export const SelectTokenModal: React.FC<SelectTokenSheetProps> = React.memo(
  ({ assets, selectedToken, isOpen, onClose, onTokenSelect }: SelectTokenSheetProps) => {
    const activeChain = useActiveChain()
    const [searchQuery, setSearchQuery] = useState('')
    const input = useMemo(() => searchQuery.trim(), [searchQuery])

    const choiceOfTokens = useMemo(() => {
      return (
        assets
          // filter by search query
          .filter((asset) => asset.symbol.toLowerCase().includes(input.toLowerCase()))
          // sort the tokens
          .sort(sortTokens)
      )
    }, [assets, input])

    const handleSelectToken = useCallback(
      (token: Token) => {
        if (token) {
          onTokenSelect(token.coinMinimalDenom, token.ibcDenom)
          onClose()
        }
      },
      [onClose, onTokenSelect],
    )

    return (
      <BottomModal isOpen={isOpen} onClose={onClose} title='Select Fee Token'>
        <div className='flex flex-col items-center'>
          <SearchInput
            placeholder='Search tokens...'
            value={input}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
          />

          <div className='bg-white-100 dark:bg-gray-900 rounded-2xl w-full min-h-[200px] max-h-[350px] mt-4 overflow-y-auto p-0'>
            {choiceOfTokens.length > 0 ? (
              choiceOfTokens.map((asset, index) => {
                const isFirst = index === 0
                const isLast = index === choiceOfTokens.length - 1

                let isSelected = false
                if (selectedToken) {
                  isSelected = selectedToken?.ibcDenom
                    ? selectedToken?.ibcDenom === asset.ibcDenom
                    : selectedToken?.coinMinimalDenom === asset.coinMinimalDenom
                }

                return (
                  <React.Fragment
                    key={`${asset.symbol}-${asset?.coinMinimalDenom}-${asset?.ibcDenom}-${asset?.amount}-${index}`}
                  >
                    <div className='relative' onClick={() => handleSelectToken(asset)}>
                      <TokenCard
                        title={asset.symbol}
                        assetImg={asset.img}
                        ibcChainInfo={asset.ibcChainInfo}
                        amount={asset.amount}
                        symbol={asset.symbol}
                        isRounded={isFirst || isLast}
                        isIconVisible={isSelected}
                        iconSrc={
                          Images.Misc.ChainChecks[activeChain] ?? Images.Misc.ChainChecks['cosmos']
                        }
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
  },
)

SelectTokenModal.displayName = 'SelectTokenModal'
