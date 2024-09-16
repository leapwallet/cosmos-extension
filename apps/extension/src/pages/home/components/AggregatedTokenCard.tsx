import {
  currencyDetail,
  formatTokenAmount,
  IbcChainInfo,
  sliceWord,
  useGetChains,
  useUserPreferredCurrency,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import BigNumber from 'bignumber.js'
import Badge from 'components/badge/Badge'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import React, { useMemo } from 'react'
import { AggregatedSupportedChain } from 'types/utility'
import { imgOnError } from 'utils/imgOnError'

type AggregatedTokenCardProps = {
  readonly title: string
  readonly usdValue: string | undefined
  readonly amount: string
  readonly symbol: string
  readonly assetImg: string | undefined
  readonly onClick: () => void
  readonly ibcChainInfo: IbcChainInfo | undefined
  readonly hasToShowEvmTag: boolean | undefined
  readonly isEvm: boolean | undefined
  readonly tokenBalanceOnChain: SupportedChain
}

export function AggregatedTokenCard({
  title,
  usdValue,
  amount,
  symbol,
  assetImg,
  onClick,
  ibcChainInfo,
  hasToShowEvmTag,
  isEvm,
  tokenBalanceOnChain,
}: AggregatedTokenCardProps) {
  const chains = useGetChains()
  const [formatCurrency] = useFormatCurrency()
  const { formatHideBalance } = useHideAssets()
  const activeChain = useActiveChain() as AggregatedSupportedChain

  const defaultTokenLogo = useDefaultTokenLogo()
  const [preferredCurrency] = useUserPreferredCurrency()
  const formattedFiatValue = usdValue ? formatCurrency(new BigNumber(usdValue)) : '-'

  const ibcInfo = useMemo(() => {
    if (!ibcChainInfo) return ''

    return `${ibcChainInfo.pretty_name} / ${sliceWord(ibcChainInfo?.channelId ?? '', 7, 5)}`
  }, [ibcChainInfo])

  const chainName = useMemo(
    () => chains[tokenBalanceOnChain]?.chainName ?? 'Unknown Chain',
    [chains, tokenBalanceOnChain],
  )

  const TokenName = useMemo(() => {
    return (
      <>
        <span className='text-ellipsis overflow-hidden whitespace-nowrap max-w-[132px]'>
          {sliceWord(title, 7, 4)}
        </span>
        {ibcChainInfo ? <Badge text='IBC' title={ibcInfo} /> : null}
        {isEvm && hasToShowEvmTag ? <Badge text='EVM' /> : null}
      </>
    )
  }, [hasToShowEvmTag, ibcChainInfo, ibcInfo, isEvm, title])

  return (
    <div
      className='bg-white-100 dark:bg-gray-950 rounded-xl flex items-center justify-between p-[12px] w-full cursor-pointer'
      onClick={onClick}
    >
      <div className='flex items-center justify-start gap-2 w-[150px]'>
        <img
          className='w-[36px] h-[36px] rounded-full'
          src={assetImg ?? defaultTokenLogo}
          alt={chainName + ' logo'}
          onError={imgOnError(defaultTokenLogo)}
        />

        <div className='flex flex-col'>
          <div className='text-black-100 dark:text-white-100 font-[700] flex items-center justify-start gap-2'>
            {TokenName}
          </div>
          {activeChain === AGGREGATED_CHAIN_KEY && (
            <p className='text-gray-600 dark:text-gray-400 text-[12px] font-[500]'>{chainName}</p>
          )}
        </div>
      </div>

      <div className='flex flex-col items-end'>
        {formattedFiatValue !== '-' && (
          <p className='text-black-100 dark:text-white-100 font-[700] text-[14px] text-right'>
            {formatHideBalance(formattedFiatValue)}
          </p>
        )}
        <p className='text-gray-600 dark:text-gray-400 text-[12px] font-[500] text-right'>
          {formatHideBalance(
            formatTokenAmount(
              amount,
              sliceWord(symbol, 4, 4),
              3,
              currencyDetail[preferredCurrency].locale,
            ),
          )}
        </p>
      </div>
    </div>
  )
}
