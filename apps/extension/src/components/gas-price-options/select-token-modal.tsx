import { sortTokens, Token, useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import NoSearchResults from 'components/no-search-results'
import { TokenCard } from 'components/token-card/TokenCard'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import React, { useCallback, useMemo, useState } from 'react'

type SelectTokenSheetProps = {
  assets: Token[]
  isOpen: boolean
  onClose: () => void
  selectedToken: Token
  // eslint-disable-next-line no-unused-vars
  onTokenSelect: (baseDenom: string) => void
}

export const SelectTokenModal: React.FC<SelectTokenSheetProps> = ({
  assets,
  selectedToken,
  isOpen,
  onClose,
  onTokenSelect,
}) => {
  const activeChain = useActiveChain()
  const defaultTokenLogo = useDefaultTokenLogo()

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
        onTokenSelect(token.coinMinimalDenom)
        onClose()
      }
    },
    [onClose, onTokenSelect],
  )

  return (
    <BottomModal isOpen={isOpen} onClose={onClose} title='Select Fee Token'>
      <div className='flex flex-col items-center'>
        <div className='mx-auto w-full flex h-10 bg-white-100 dark:bg-gray-900 rounded-full py-2 pl-5 pr-3'>
          <input
            placeholder='search tokens...'
            className='flex flex-grow text-base text-gray-400 outline-none bg-white-0'
            value={input}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {input.length === 0 ? (
            <img src={Images.Misc.SearchIcon} />
          ) : (
            <img
              className='cursor-pointer'
              src={Images.Misc.CrossFilled}
              onClick={() => setSearchQuery('')}
            />
          )}
        </div>
        <div className='bg-white-100 dark:bg-gray-900 rounded-2xl w-full min-h-[200px] max-h-[350px] mt-4 overflow-y-auto p-0'>
          {choiceOfTokens.length > 0 ? (
            choiceOfTokens.map((asset, index) => {
              const isFirst = index === 0
              const isLast = index === choiceOfTokens.length - 1

              const isSelected = selectedToken.ibcDenom
                ? selectedToken.ibcDenom === asset.ibcDenom
                : selectedToken.coinMinimalDenom === asset.coinMinimalDenom

              return (
                <React.Fragment key={`${asset.symbol}-${index}`}>
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
}
