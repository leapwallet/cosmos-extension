import { Token, useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import NoSearchResults from 'components/no-search-results'
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
        <div className='mx-auto w-[344px] mb-[16px] flex h-10 bg-white-100 dark:bg-gray-900 rounded-[30px] py-2 pl-5 pr-[10px]'>
          <input
            placeholder='search tokens...'
            className='flex flex-grow text-base text-gray-400 outline-none bg-white-0'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
          className='bg-white-100 dark:bg-gray-900 rounded-2xl min-h-[200px] max-h-[400px] w-fit'
          style={{ overflowY: 'scroll' }}
        >
          {transferableTokens.length > 0 ? (
            transferableTokens.map((asset, index) => {
              const isFirst = index === 0
              const isLast = index === transferableTokens.length - 1

              return (
                <React.Fragment key={`${asset.symbol}-${index}`}>
                  <div className='relative' onClick={() => handleSelectToken(asset)}>
                    <TokenCard
                      assetImg={asset.img}
                      title={asset?.name ?? asset.symbol}
                      ibcChainInfo={asset.ibcChainInfo}
                      amount={asset.amount}
                      symbol={asset.symbol}
                      isIconVisible={selectedToken?.symbol === asset?.symbol}
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
