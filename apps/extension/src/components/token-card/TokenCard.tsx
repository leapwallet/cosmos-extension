import {
  currencyDetail,
  formatTokenAmount,
  IbcChainInfo,
  sliceWord,
  useActiveChain,
  useGetChains,
  useUserPreferredCurrency,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { GenericCard } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import Badge from 'components/badge/Badge'
import IBCTokenBadge from 'components/badge/IbcTokenBadge'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { hideAssetsStore } from 'stores/hide-assets-store'
import { AggregatedSupportedChain } from 'types/utility'
import { imgOnError } from 'utils/imgOnError'

type TokenCardProps = {
  readonly title: string
  readonly usdValue: string | undefined
  readonly amount: string
  readonly symbol: string
  readonly assetImg: string | undefined
  readonly isRounded: boolean
  readonly onClick?: () => void
  readonly cardClassName?: string
  readonly isIconVisible?: boolean
  readonly iconSrc?: string
  readonly size?: 'sm' | 'md' | 'lg'
  readonly ibcChainInfo?: IbcChainInfo | undefined
  readonly hasToShowIbcTag?: boolean
  readonly hasToShowEvmTag?: boolean
  readonly isEvm?: boolean
  readonly hideAmount?: boolean
  readonly tokenBalanceOnChain?: SupportedChain
}

function TokenCardView({
  title,
  ibcChainInfo,
  usdValue,
  amount,
  symbol,
  assetImg,
  isRounded,
  onClick,
  cardClassName,
  isIconVisible,
  iconSrc,
  size,
  hasToShowIbcTag,
  hasToShowEvmTag,
  isEvm,
  hideAmount = false,
  tokenBalanceOnChain,
}: TokenCardProps) {
  const activeChain = useActiveChain() as AggregatedSupportedChain
  const chains = useGetChains()
  const [formatCurrency] = useFormatCurrency()

  const defaultTokenLogo = useDefaultTokenLogo()
  const [preferredCurrency] = useUserPreferredCurrency()
  const formattedFiatValue = usdValue ? formatCurrency(new BigNumber(usdValue)) : '-'

  const ibcInfo = useMemo(() => {
    if (!ibcChainInfo) return ''

    return `${ibcChainInfo.pretty_name} / ${sliceWord(ibcChainInfo?.channelId ?? '', 7, 5)}`
  }, [ibcChainInfo])

  const Title = useMemo(() => {
    let _Title = (
      <h3 className='text-md text-ellipsis overflow-hidden whitespace-nowrap' title={title}>
        {sliceWord(title, 7, 4)}
      </h3>
    )

    if (activeChain === AGGREGATED_CHAIN_KEY && ibcChainInfo) {
      _Title = (
        <div className='flex items-center justify-center gap-1'>
          {title}
          {activeChain === AGGREGATED_CHAIN_KEY && ibcChainInfo ? (
            <Badge text='IBC' title={ibcInfo} />
          ) : null}
        </div>
      )
    }

    return _Title
  }, [title, activeChain, ibcChainInfo, ibcInfo])

  return (
    <GenericCard
      title={Title}
      subtitle={
        <div className='flex space-x-2 font-normal text-gray-400'>
          {activeChain === AGGREGATED_CHAIN_KEY && tokenBalanceOnChain ? (
            <p>{chains[tokenBalanceOnChain]?.chainName ?? 'Unknown Chain'}</p>
          ) : (
            <>
              {ibcChainInfo && !hasToShowIbcTag ? <IBCTokenBadge text={ibcInfo} /> : null}
              {ibcChainInfo && hasToShowIbcTag ? <Badge text='IBC' title={ibcInfo} /> : null}
              {isEvm && hasToShowEvmTag ? <Badge text='EVM' /> : null}
            </>
          )}
        </div>
      }
      title2={
        formattedFiatValue &&
        formattedFiatValue !== '-' && (
          <div className='text-md text-gray-600 dark:text-gray-200 font-medium'>
            {hideAssetsStore.formatHideBalance(formattedFiatValue)}
          </div>
        )
      }
      subtitle2={
        hideAmount === false && (
          <p className='whitespace-nowrap text-gray-400 font-medium text-xs'>
            {hideAssetsStore.formatHideBalance(
              formatTokenAmount(
                amount,
                sliceWord(symbol, 4, 4),
                3,
                currencyDetail[preferredCurrency].locale,
              ),
            )}
          </p>
        )
      }
      img={
        <img
          src={assetImg ?? defaultTokenLogo}
          className='w-[28px] h-[28px] mr-2 border rounded-full dark:border-[#333333] border-[#cccccc]'
          onError={imgOnError(defaultTokenLogo)}
        />
      }
      icon={<img className={`w-5 h-5 ml-2 ${isIconVisible ? '' : 'hidden'}`} src={iconSrc} />}
      isRounded={isRounded}
      className={cardClassName}
      onClick={onClick}
      size={size}
    />
  )
}

export const TokenCard = observer(TokenCardView)
