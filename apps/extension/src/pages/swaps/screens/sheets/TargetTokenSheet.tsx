import { CardDivider, GenericCard, HeaderActionType } from '@leapwallet/leap-ui'
import BottomSheet from 'components/bottom-sheet/BottomSheet'
import NoSearchResults from 'components/no-search-results'
import { useTokenList } from 'hooks/swaps/useTokenList'
import { Images } from 'images'
import React, { useCallback } from 'react'
import { Token } from 'types/bank'
import { fetchedTokenTypes } from 'types/swap'

interface propTypes {
  isVisible: boolean
  onCloseHandler: () => void
  assets: fetchedTokenTypes[]
  allAssets: Token[]
  selectedTargetToken: string
  selectedToken: string
  // eslint-disable-next-line no-unused-vars
  setTagetTokenData: (tokenName: string, tokenIcon: string) => void
}

const TargetTokenSheet = (props: propTypes) => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [tokenList] = useTokenList()

  const tokenId = (token: Token): string => {
    const tokenId = token.ibcDenom != '' ? token.ibcDenom : token.coinMinimalDenom
    return tokenId ?? ''
  }

  const assetBalances = useCallback(
    (asset: fetchedTokenTypes) => {
      const swappableAssets = props.allAssets.filter((asset) =>
        tokenList?.tokens.find((token) => token.denom === tokenId(asset)),
      )
      const balance = swappableAssets.find(
        (token) => token.coinMinimalDenom === asset.denom || token.ibcDenom === asset.denom,
      )
      return balance && balance.amount ? balance.amount : 0
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.allAssets],
  )

  const filteredTokens = props.assets.filter(
    (asset) =>
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) &&
      asset.symbol.toLowerCase() !== props.selectedToken.toLowerCase(),
  )

  return (
    <BottomSheet
      isVisible={props.isVisible}
      onClose={props.onCloseHandler}
      headerTitle='Swap to'
      headerActionType={HeaderActionType.CANCEL}
    >
      <div>
        <div className='flex flex-col items-center px-[28px] max-h-'>
          <div className='mx-auto mt-[28px] w-[344px] mb-[16px] flex h-10 bg-white-100 dark:bg-gray-900 rounded-[30px] py-2 pl-5 pr-[10px]'>
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
            {filteredTokens.length > 0 ? (
              filteredTokens.map((asset, index) => {
                const isFirst = index === 0
                const isLast = index === filteredTokens.length - 1
                return (
                  <div className='mx-auto w-full' key={index}>
                    <GenericCard
                      onClick={() => {
                        props.setTagetTokenData(asset.symbol, asset.logoURI)
                        props.onCloseHandler()
                      }}
                      className='mx-auto'
                      img={<img className='w-[20px] h-[20px]' src={asset.logoURI} />}
                      isRounded={isFirst || isLast}
                      size='md'
                      title={<span className='ml-2'>{asset.symbol}</span>}
                      subtitle={
                        <span className='ml-2'>
                          Balance: {assetBalances(asset)} {asset.symbol}
                        </span>
                      }
                      icon={
                        <img
                          className={`w-[20px] h-[20px] ${
                            asset.symbol.toLowerCase() === props.selectedTargetToken.toLowerCase()
                              ? ''
                              : 'hidden'
                          }`}
                          src={Images.Misc.CheckRed}
                        />
                      }
                    />
                    <CardDivider />
                  </div>
                )
              })
            ) : (
              <NoSearchResults searchQuery={searchQuery} />
            )}
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}

export default TargetTokenSheet
