import { sortTokens, Token, useActiveChain, useDenoms } from '@leapwallet/cosmos-wallet-hooks'
import { SwapToken } from '@leapwallet/cosmos-wallet-sdk'
import { CardDivider } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import BottomModal from 'components/bottom-modal'
import Loader from 'components/loader/Loader'
import NoSearchResults from 'components/no-search-results'
import { TokenCard } from 'components/token-card/TokenCard'
import { Images } from 'images'
import React, { useCallback, useMemo } from 'react'

import { useSwapContext } from '../swap-context'

type TokenItemProps = {
  asset: SwapToken
  isRounded: boolean
  assetAmount: BigNumber
  // eslint-disable-next-line no-unused-vars
  handleSelectToken: (s: SwapToken) => void
  usdValue: BigNumber
}

const TokenItem: React.FC<TokenItemProps> = ({
  asset,
  isRounded,
  assetAmount,
  handleSelectToken,
  usdValue,
}) => {
  const activeChain = useActiveChain()
  const [{ selectedTargetToken }] = useSwapContext()

  return (
    <div className='mx-auto w-full'>
      <TokenCard
        onClick={() => handleSelectToken(asset)}
        cardClassName='mx-auto'
        isRounded={isRounded}
        size='md'
        assetImg={asset.image}
        title={asset.symbol}
        usdValue={usdValue.toString()}
        amount={assetAmount.toString()}
        symbol={asset.symbol}
        iconSrc={Images.Misc.ChainChecks[activeChain] ?? Images.Misc.ChainChecks['cosmos']}
        isIconVisible={asset.symbol === selectedTargetToken?.symbol}
      />
    </div>
  )
}

interface propTypes {
  isOpen: boolean
  onClose: () => void
}

const getAssetUsdValue = (asset: SwapToken, allAssets: Token[]) => {
  const usdValue = new BigNumber(
    allAssets.find((token) => token.symbol === asset.symbol)?.usdValue ?? 0,
  )

  if (usdValue.isNaN()) {
    return new BigNumber(0)
  }

  return usdValue
}

const TargetTokenSheet: React.FC<propTypes> = ({ isOpen, onClose }) => {
  const [
    { supportedTokensForSwap, isSupportedTokensForSwapLoading, allAssets, selectedToken },
    swapperAction,
  ] = useSwapContext()
  const denoms = useDenoms()

  const [searchQuery, setSearchQuery] = React.useState('')
  const input = useMemo(() => searchQuery.trim(), [searchQuery])

  const supportedDenoms = useMemo(() => {
    const _supportedDenoms: Record<string, boolean> = {}
    Object.values(denoms).forEach((denom) => {
      _supportedDenoms[denom.coinDenom] = true
    })
    return _supportedDenoms
  }, [denoms])

  const swappableAssets = useMemo(() => {
    return isSupportedTokensForSwapLoading
      ? []
      : supportedTokensForSwap
          // only allow tokens that match the search query
          ?.filter((asset) => asset.symbol.toLowerCase().includes(input.toLowerCase()))
          // only allow non-selected tokens
          .filter((asset) => asset.symbol !== selectedToken?.symbol)
          // only allow supported denoms
          .filter((asset) => supportedDenoms[asset.symbol])
          // fill usdValue
          .map((asset) => {
            const usdValue = getAssetUsdValue(asset, allAssets)

            return { ...asset, usdValue } as unknown as Token
          })
          // sort the tokens
          .sort(sortTokens)
  }, [
    allAssets,
    input,
    isSupportedTokensForSwapLoading,
    selectedToken?.symbol,
    supportedDenoms,
    supportedTokensForSwap,
  ])

  const getAssetBalance = useCallback(
    (asset: SwapToken) => {
      const balance = new BigNumber(
        allAssets.find((token) => token.symbol === asset.symbol)?.amount ?? 0,
      )
      if (balance.isNaN()) {
        return new BigNumber(0)
      }
      return balance
    },
    [allAssets],
  )

  const handleSelectToken = (c: SwapToken) => {
    swapperAction.setSelectedTargetToken(c)
    onClose()
  }

  return (
    <BottomModal isOpen={isOpen} onClose={onClose} title='Swap to'>
      <div>
        <div className='flex flex-col items-center'>
          <div className='mx-auto w-[344px] mb-4 flex h-10 bg-white-100 dark:bg-gray-900 rounded-[30px] py-2 pl-5 pr-[10px]'>
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
            {isSupportedTokensForSwapLoading ? (
              <Loader />
            ) : (swappableAssets?.length ?? 0) > 0 ? (
              swappableAssets?.map((_asset, index) => {
                const asset = _asset as unknown as SwapToken
                const isFirst = index === 0
                const isLast = index === swappableAssets.length - 1

                return (
                  <React.Fragment key={`${asset.symbol}-${index}`}>
                    <TokenItem
                      asset={asset}
                      isRounded={isFirst || isLast}
                      assetAmount={getAssetBalance(asset)}
                      handleSelectToken={handleSelectToken}
                      usdValue={new BigNumber((asset as unknown as Token).usdValue ?? 0)}
                    />
                    {!isLast && <CardDivider />}
                  </React.Fragment>
                )
              })
            ) : (
              <NoSearchResults searchQuery={searchQuery} />
            )}
          </div>
        </div>
      </div>
    </BottomModal>
  )
}

export default TargetTokenSheet
