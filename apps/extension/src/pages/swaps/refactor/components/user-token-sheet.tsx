import { sortTokens, useGetTokenBalances } from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider } from '@leapwallet/leap-ui'
import { BigNumber } from 'bignumber.js'
import BottomModal from 'components/bottom-modal'
import { EmptyCard } from 'components/empty-card'
import { ErrorCard } from 'components/ErrorCard'
import { LoaderAnimation } from 'components/loader/Loader'
import NoSearchResults from 'components/no-search-results'
import { TokenCard } from 'components/token-card/TokenCard'
import Fuse from 'fuse.js'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { Images } from 'images'
import React, { useCallback, useMemo, useState } from 'react'
import { Token } from 'types/bank'

import { useSwapContext } from '../swap-context'

type TokenItemProps = {
  asset: Token
  isRounded: boolean
  assetAmount: BigNumber
  // eslint-disable-next-line no-unused-vars
  handleSelectToken: (s: Token) => void
}

const TokenItem: React.FC<TokenItemProps> = ({
  asset,
  isRounded,
  assetAmount,
  handleSelectToken,
}) => {
  const activeChain = useActiveChain()
  const [{ selectedToken }] = useSwapContext()

  const usdValue = useMemo(() => {
    const usdValue = new BigNumber(asset.usdValue ?? 0)

    if (usdValue.isNaN()) {
      return new BigNumber(0)
    }

    return usdValue
  }, [asset])

  return (
    <div className='relative' onClick={() => handleSelectToken(asset)}>
      <TokenCard
        assetImg={asset.img}
        title={asset.symbol}
        ibcChainInfo={asset.ibcChainInfo}
        usdValue={usdValue.toString()}
        amount={assetAmount.toString()}
        symbol={asset.symbol}
        isIconVisible={asset.symbol === selectedToken?.symbol}
        iconSrc={Images.Misc.ChainChecks[activeChain] ?? Images.Misc.ChainChecks['cosmos']}
        isRounded={isRounded}
        size='md'
      />
    </div>
  )
}

interface propTypes {
  isOpen: boolean
  onClose: () => void
}

const UserTokensSheet: React.FC<propTypes> = ({ isOpen, onClose }) => {
  const [, swapperAction] = useSwapContext()
  const { allAssets, nativeTokensBalance, nativeTokensStatus, ibcTokensBalances, ibcTokensStatus } =
    useGetTokenBalances()

  const [searchQuery, setSearchQuery] = useState('')
  const input = useMemo(() => searchQuery.trim(), [searchQuery])

  const assetsFuse = useMemo(() => {
    return new Fuse(allAssets, {
      threshold: 0.3,
      keys: ['symbol'],
    })
  }, [allAssets])

  const swappableAssets = useMemo(() => {
    const clearSearchQuery = input.trim()
    if (!input) {
      return allAssets.sort(sortTokens)
    }
    return assetsFuse.search(clearSearchQuery).map((site) => site.item)
  }, [allAssets, assetsFuse, input])

  const handleSelectToken = useCallback(
    (token: Token) => {
      swapperAction.setSelectedToken({
        denom: token.coinMinimalDenom,
        symbol: token.symbol,
        image: token.img,
        ibcDenom: token.ibcDenom,
      })
      onClose()
    },
    [onClose, swapperAction],
  )

  const showLoading = nativeTokensStatus === 'loading' || ibcTokensStatus === 'loading'
  const showError = nativeTokensStatus === 'error' && ibcTokensStatus === 'error'
  const showTokens = nativeTokensStatus === 'success' || ibcTokensStatus === 'success'

  return (
    <BottomModal isOpen={isOpen} onClose={onClose} title='Swap from'>
      <div className='flex flex-col items-center h-full'>
        <div className='mx-auto w-[344px] mb-4 flex h-10 bg-white-100 dark:bg-gray-900 rounded-[30px] py-2 pl-5 pr-[10px]'>
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
        <div
          className='bg-white-100 dark:bg-gray-900 rounded-2xl min-h-[200px] max-h-[400px] w-full'
          style={{ overflowY: 'scroll' }}
        >
          {showLoading ? (
            <div className='h-[200px] w-full flex items-center justify-center'>
              <LoaderAnimation color='white' />
            </div>
          ) : null}
          {showError ? <ErrorCard text='Failed to load your tokens' /> : null}
          {showTokens && nativeTokensBalance?.length === 0 && ibcTokensBalances?.length === 0 ? (
            <EmptyCard
              isRounded
              heading={'No tokens found'}
              subHeading='Please add tokens to your wallet to swap'
              src={Images.Misc.Explore}
            />
          ) : null}
          {showTokens && allAssets.length > 0 ? (
            <>
              {swappableAssets.length === 0 ? (
                <NoSearchResults searchQuery={searchQuery} />
              ) : (
                swappableAssets.map((asset, index) => {
                  const isFirst = index === 0
                  const isLast = index === swappableAssets.length - 1
                  const assetAmt = new BigNumber(asset.amount)

                  return (
                    <React.Fragment key={`${asset.symbol}-${index}`}>
                      <TokenItem
                        asset={asset}
                        isRounded={isFirst || isLast}
                        assetAmount={assetAmt}
                        handleSelectToken={handleSelectToken}
                      />
                      {!isLast && <CardDivider />}
                    </React.Fragment>
                  )
                })
              )}
            </>
          ) : null}
        </div>
      </div>
    </BottomModal>
  )
}

export default UserTokensSheet
