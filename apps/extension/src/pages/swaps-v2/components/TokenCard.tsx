import { toBase64, toUtf8 } from '@cosmjs/encoding'
import {
  currencyDetail,
  formatTokenAmount,
  useActiveChain,
  useGetChains,
  useGetExplorerAccountUrl,
} from '@leapwallet/cosmos-wallet-hooks'
import { ArrowSquareOut, CopySimple } from '@phosphor-icons/react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import Text from 'components/text'
import { TokenImageWithFallback } from 'components/token-image-with-fallback'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { useNonNativeCustomChains } from 'hooks'
import { useFormatCurrency, useUserPreferredCurrency } from 'hooks/settings/useCurrency'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { hideAssetsStore } from 'stores/hide-assets-store'
import { SourceChain, SourceToken } from 'types/swap'
import { AggregatedSupportedChain } from 'types/utility'
import { UserClipboard } from 'utils/clipboard'
import { cn } from 'utils/cn'
import { sliceWord } from 'utils/strings'

import { useGetChainsToShow } from '../hooks'

export const TokenCardSkeleton = () => {
  return (
    <div className='flex items-center py-3 mx-6 z-0 !h-[72px]'>
      <div className='w-9 h-9'>
        <Skeleton
          circle
          className='w-9 h-9'
          containerClassName='block !leading-none'
          style={{
            zIndex: 0,
          }}
        />
      </div>
      <div className='max-w-[80px] z-0 ml-2'>
        <Skeleton width={80} className='z-0 h-[17px]' />
        <Skeleton width={60} className='z-0 h-[14px]' />
      </div>
      <div className='max-w-[70px] ml-auto z-0 flex flex-col items-end'>
        <Skeleton width={50} className='z-0 h-[17px]' />
        <Skeleton width={70} className='z-0 h-[14px]' />
      </div>
    </div>
  )
}

function TokenCardView({
  onTokenSelect,
  token,
  isSelected,
  verified = false,
  hideAmount = false,
  showRedirection = false,
  selectedChain,
  isChainAbstractionView,
  showChainNames = false,
  isFirst = false,
  isLast = false,
}: {
  onTokenSelect: (token: SourceToken) => void
  token: SourceToken
  isSelected: boolean
  verified?: boolean
  hideAmount?: boolean
  selectedChain: SourceChain | undefined
  showRedirection?: boolean
  isChainAbstractionView?: boolean
  showChainNames?: boolean
  isFirst?: boolean
  isLast?: boolean
}) {
  const activeChain = useActiveChain() as AggregatedSupportedChain
  const [formatCurrency] = useFormatCurrency()
  const [preferredCurrency] = useUserPreferredCurrency()
  const formattedTokenAmount = hideAssetsStore.formatHideBalance(
    formatTokenAmount(
      token?.amount || '0',
      sliceWord(token?.symbol, 4, 4),
      3,
      currencyDetail[preferredCurrency].locale,
    ),
  )

  const nonNativeChains = useNonNativeCustomChains()
  const chains = useGetChains()

  const { chainsToShow: skipChains } = useGetChainsToShow()
  const ibcChainInfo = useMemo(() => {
    if (!token.ibcChainInfo) return
    let _chainInfo = Object.values(chains).find(
      (chain) =>
        chain.chainId === token.ibcChainInfo?.name ||
        chain.testnetChainId === token.ibcChainInfo?.name,
    )
    if (_chainInfo) {
      return _chainInfo
    }
    _chainInfo = Object.values(nonNativeChains).find(
      (chain) =>
        chain.chainId === token.ibcChainInfo?.name ||
        chain.testnetChainId === token.ibcChainInfo?.name,
    )
    if (_chainInfo) {
      return _chainInfo
    }
    return skipChains?.find((chain) => chain.chainId === token.ibcChainInfo?.name)
  }, [chains, nonNativeChains, skipChains, token.ibcChainInfo])

  const tokenChain = useMemo(() => {
    if (token?.tokenBalanceOnChain) {
      const chainFromBalanceInfo =
        chains[token?.tokenBalanceOnChain] ?? nonNativeChains[token?.tokenBalanceOnChain]
      if (chainFromBalanceInfo) {
        return chainFromBalanceInfo
      }
    }

    if (!token?.skipAsset?.chainId) return

    let _chainInfo = Object.values(chains).find(
      (chain) =>
        chain.chainId === token?.skipAsset?.chainId ||
        chain.testnetChainId === token?.skipAsset?.chainId,
    )
    if (_chainInfo) {
      return _chainInfo
    }

    _chainInfo = Object.values(nonNativeChains).find(
      (chain) =>
        chain.chainId === token?.skipAsset?.chainId ||
        chain.testnetChainId === token?.skipAsset?.chainId,
    )

    if (_chainInfo) {
      return _chainInfo
    }
    return skipChains?.find((chain) => chain.chainId === token?.skipAsset?.chainId)
  }, [chains, nonNativeChains, skipChains, token?.skipAsset?.chainId, token?.tokenBalanceOnChain])

  const formattedFiatValue = hideAssetsStore.formatHideBalance(
    token.usdValue ? formatCurrency(new BigNumber(token.usdValue)) : '-',
  )

  const { getExplorerAccountUrl, explorerAccountUrl } = useGetExplorerAccountUrl({
    forceChain: selectedChain?.key,
  })

  const [isAddressCopied, setIsAddressCopied] = useState(false)
  const [_showRedirection, showAddressCopy] = useMemo(() => {
    const _showRedirection = showRedirection && selectedChain

    if (
      _showRedirection &&
      token.coinMinimalDenom.toLowerCase().startsWith('factory/') &&
      !explorerAccountUrl?.toLowerCase().includes('mintscan')
    ) {
      return [false, true]
    }

    return [_showRedirection, false]
  }, [explorerAccountUrl, selectedChain, showRedirection, token.coinMinimalDenom])

  const ibcInfo = useMemo(() => {
    if (!token?.ibcChainInfo) return ''

    return `${ibcChainInfo?.chainName ?? token.ibcChainInfo?.pretty_name} • Channel ${sliceWord(
      token.ibcChainInfo?.channelId?.replace('channel-', ''),
      4,
      4,
    )}`
  }, [ibcChainInfo?.chainName, token?.ibcChainInfo])

  const handleRedirectionClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()

      if (token.coinMinimalDenom.toLowerCase().startsWith('factory/')) {
        const asset = toBase64(toUtf8(token.coinMinimalDenom))
        const explorerURL = getExplorerAccountUrl(asset, true)

        window.open(explorerURL, '_blank')
      } else {
        const explorerURL = getExplorerAccountUrl(token.coinMinimalDenom)
        window.open(explorerURL, '_blank')
      }
    },
    [getExplorerAccountUrl, token.coinMinimalDenom],
  )

  const handleContentCopyClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()

      setIsAddressCopied(true)
      await UserClipboard.copyText(token.coinMinimalDenom)
      setTimeout(() => setIsAddressCopied(false), 2000)
    },
    [token.coinMinimalDenom],
  )

  const handleTokenSelect = useCallback(() => {
    onTokenSelect(token)
  }, [onTokenSelect, token])

  const tokenName = token.symbol ?? token?.name
  const chainIcon =
    (tokenChain
      ? 'icon' in tokenChain
        ? tokenChain?.icon
        : tokenChain?.chainSymbolImageUrl
      : '') ?? ''

  return (
    <div
      onClick={handleTokenSelect}
      className={classNames(
        'flex flex-1 items-center w-full px-6',
        isFirst ? 'mt-4' : 'mt-3',
        isLast ? 'mb-4' : '',
      )}
    >
      <div
        className={cn(
          'flex items-center flex-1 flex-row justify-between w-full gap-2 rounded-xl pl-3 py-3 pr-4 border border-transparent',
          isSelected
            ? 'bg-secondary-200 hover:bg-secondary-200 cursor-not-allowed border-secondary-600'
            : 'cursor-pointer bg-secondary-100 hover:bg-secondary-200',
        )}
      >
        <div className='flex items-center flex-1'>
          <div className='relative mr-3 h-10 w-10 flex items-center justify-center'>
            <TokenImageWithFallback
              assetImg={token?.img}
              text={tokenName}
              altText={tokenName}
              imageClassName='h-8 w-8 rounded-full'
              containerClassName='h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-850'
              textClassName='text-[11px] !leading-[15px]'
            />

            <img
              src={chainIcon}
              alt=''
              className='absolute bottom-0 right-0 h-[14px] w-[14px] rounded-full'
            />

            {/* {verified && (
              <div className='absolute group -bottom-[3px] -right-[6px]'>
                <img
                  src={
                    theme === ThemeName.DARK
                      ? Images.Misc.VerifiedWithBgStarDark
                      : Images.Misc.VerifiedWithBgStar
                  }
                  alt='verified-token'
                  className='h-5 w-5'
                />

                <div
                  className={classNames(
                    'group-hover:!block hidden absolute bottom-0 right-0 translate-x-full bg-gray-200 dark:bg-gray-800 px-3 py-2 rounded-lg text-xs dark:text-white-100',
                    {
                      '!max-w-max': isSidePanel(),
                    },
                  )}
                >
                  Whitelisted
                </div>
              </div>
            )} */}
          </div>

          <div className='flex flex-col justify-center items-start'>
            <div className='flex items-center gap-[4px]'>
              <Text
                size='md'
                className={classNames('font-bold !leading-[22px] text-foreground', {
                  'items-center justify-center gap-1':
                    (activeChain === AGGREGATED_CHAIN_KEY || isChainAbstractionView) &&
                    token?.ibcChainInfo,
                })}
                data-testing-id={`switch-token-${tokenName.toLowerCase()}-ele`}
              >
                {tokenName?.length > 20 ? sliceWord(tokenName, 6, 6) : tokenName}

                {(activeChain === AGGREGATED_CHAIN_KEY || isChainAbstractionView) &&
                token?.ibcChainInfo ? (
                  <span
                    className='py-[2px] px-[6px] rounded-[4px] font-medium text-[10px] !leading-[16px] text-foreground bg-secondary-200'
                    title={ibcInfo}
                  >
                    IBC
                  </span>
                ) : null}
              </Text>

              {_showRedirection ? (
                <button onClick={handleRedirectionClick} className='text-gray-400'>
                  <ArrowSquareOut size={16} className='!text-md !leading-[20px]' />
                </button>
              ) : null}

              {showAddressCopy ? (
                <>
                  {!isAddressCopied ? (
                    <button onClick={handleContentCopyClick} className='text-gray-400'>
                      <CopySimple size={16} />
                    </button>
                  ) : (
                    <button className='text-gray-400 text-xs font-bold ml-[0.5px]'>copied</button>
                  )}
                </>
              ) : null}
            </div>

            {(activeChain === AGGREGATED_CHAIN_KEY || isChainAbstractionView) &&
            tokenChain &&
            showChainNames ? (
              <p className='text-xs !leading-[19px] font-medium text-muted-foreground'>
                {tokenChain?.chainName ?? 'Unknown Chain'}
              </p>
            ) : (
              <>
                {token?.ibcChainInfo && (
                  <div className='py-[2px] px-[6px] rounded-[4px] font-medium text-[10px] !leading-[16px] dark:text-white-100 text-black-100 bg-gray-50 dark:bg-gray-900'>
                    {ibcInfo}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {hideAmount === false && (
          <div className='flex flex-col justify-center items-end gap-[2px]'>
            {formattedFiatValue !== '-' && (
              <Text size='md' className='font-bold !leading-[20px] text-foreground text-sm'>
                {formattedFiatValue}
              </Text>
            )}
            <div className='text-xs !leading-[19px] font-medium text-muted-foreground'>
              {formattedTokenAmount}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const TokenCard = observer(TokenCardView)
