import { toBase64, toUtf8 } from '@cosmjs/encoding'
import {
  currencyDetail,
  formatTokenAmount,
  useGetExplorerAccountUrl,
} from '@leapwallet/cosmos-wallet-hooks'
import { useChains } from '@leapwallet/elements-hooks'
import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import Text from 'components/text'
import { useFormatCurrency, useUserPreferredCurrency } from 'hooks/settings/useCurrency'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import { useChainInfos } from 'hooks/useChainInfos'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import React, { useCallback, useMemo, useState } from 'react'
import { SourceChain, SourceToken } from 'types/swap'
import { UserClipboard } from 'utils/clipboard'
import { imgOnError } from 'utils/imgOnError'
import { sliceWord } from 'utils/strings'

export function TokenCard({
  onTokenSelect,
  token,
  isSelected,
  verified = false,
  hideAmount = false,
  showRedirection = false,
  selectedChain,
}: {
  onTokenSelect: (token: SourceToken) => void
  token: SourceToken
  isSelected: boolean
  verified?: boolean
  hideAmount?: boolean
  selectedChain: SourceChain | undefined
  showRedirection?: boolean
}) {
  const [formatCurrency] = useFormatCurrency()
  const { theme } = useTheme()
  const { formatHideBalance } = useHideAssets()
  const [preferredCurrency] = useUserPreferredCurrency()
  const defaultTokenLogo = useDefaultTokenLogo()
  const formattedTokenAmount = formatHideBalance(
    formatTokenAmount(
      token?.amount,
      sliceWord(token?.symbol, 4, 4),
      3,
      currencyDetail[preferredCurrency].locale,
    ),
  )

  const chains = useChainInfos()
  const { data: skipChains } = useChains()
  const ibcChainInfo = useMemo(() => {
    if (!token.ibcChainInfo) return

    return (
      Object.values(chains).find(
        (chain) =>
          chain.chainId === token.ibcChainInfo?.name ||
          chain.testnetChainId === token.ibcChainInfo?.name,
      ) ?? skipChains?.find((chain) => chain.chainId === token.ibcChainInfo?.name)
    )
  }, [chains, skipChains, token.ibcChainInfo])

  const formattedFiatValue = formatHideBalance(
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

  return (
    <div
      onClick={() => onTokenSelect(token)}
      className={classNames('flex flex-1 items-center py-3 cursor-pointer w-full', {
        'opacity-20': isSelected,
      })}
    >
      <div className='flex items-center flex-1 flex-row justify-between w-full gap-2'>
        <div className='flex items-center flex-1'>
          <div className='relative mr-3'>
            <img
              src={token.img ?? defaultTokenLogo}
              className='h-10 w-10'
              onError={imgOnError(defaultTokenLogo)}
            />
            {verified && (
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
                <div className='group-hover:!block hidden absolute bottom-0 right-0 translate-x-full bg-gray-200 dark:bg-gray-800 px-3 py-2 rounded-lg text-xs dark:text-white-100'>
                  Whitelisted
                </div>
              </div>
            )}
          </div>
          <div className='flex flex-col justify-center items-start gap-[2px]'>
            <div className='flex items-center gap-[4px]'>
              <Text
                size='md'
                className='font-bold'
                data-testing-id={`switch-token-${(token?.name ?? token.symbol).toLowerCase()}-ele`}
              >
                {sliceWord(token?.name ?? token.symbol, 4, 4)}
              </Text>

              {_showRedirection ? (
                <button
                  onClick={handleRedirectionClick}
                  className='material-icons-round text-gray-400 !text-md !leading-[20px]'
                >
                  open_in_new
                </button>
              ) : null}

              {showAddressCopy ? (
                <>
                  {!isAddressCopied ? (
                    <button
                      onClick={handleContentCopyClick}
                      className='material-symbols-rounded text-gray-400 !text-md !leading-[20px]'
                    >
                      content_copy
                    </button>
                  ) : (
                    <button className='text-gray-400 text-xs font-bold ml-[0.5px]'>copied</button>
                  )}
                </>
              ) : null}
            </div>
            {token?.ibcChainInfo && (
              <div className='py-[2px] px-[6px] rounded-[4px] font-medium text-[10px] !leading-[16px] dark:text-white-100 text-black-100 bg-gray-50 dark:bg-gray-900'>
                {ibcChainInfo?.chainName ?? token.ibcChainInfo?.pretty_name} • Channel{' '}
                {sliceWord(token.ibcChainInfo?.channelId?.replace('channel-', ''), 4, 4)}
              </div>
            )}
          </div>
        </div>
        {hideAmount === false && (
          <div className='flex flex-col justify-center items-end gap-[4px]'>
            <Text size='md' className='font-bold'>
              {formattedFiatValue}
            </Text>
            <div className='text-xs !leading-[16.2px] font-medium text-gray-600 dark:text-gray-400'>
              {formattedTokenAmount}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
