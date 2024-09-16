import { formatTokenAmount, sliceWord } from '@leapwallet/cosmos-wallet-hooks'
import { ArrowRight } from '@phosphor-icons/react'
import classNames from 'classnames'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import React, { useMemo } from 'react'
import { SourceToken } from 'types/swap'
import { imgOnError } from 'utils/imgOnError'
import { isSidePanel } from 'utils/isSidePanel'

type Props = {
  inAmount: string
  sourceToken: SourceToken | null
  amountOut: string
  destinationToken: SourceToken | null
}

function TxTokensSummaryMini({ inAmount, sourceToken, amountOut, destinationToken }: Props) {
  const defaultTokenLogo = useDefaultTokenLogo()
  const { formatHideBalance } = useHideAssets()

  const sourceBalance = useMemo(() => {
    return formatHideBalance(
      formatTokenAmount(inAmount ?? '0', sliceWord(sourceToken?.symbol ?? '', 4, 4), 3),
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inAmount, sourceToken?.symbol])

  const destinationBalance = useMemo(() => {
    return formatHideBalance(
      formatTokenAmount(amountOut ?? '0', sliceWord(destinationToken?.symbol ?? '', 4, 4), 3),
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountOut, destinationToken?.symbol])

  const _isSidePanel = isSidePanel()

  return (
    <div className='w-full bg-white-100 dark:bg-gray-950 flex items-center justify-between p-4 gap-2 rounded-2xl'>
      <div
        className={classNames('flex justify-center gap-1 items-center w-full max-w-[140px]', {
          'max-[399px]:!max-w-[calc(min(43%,140px))]': _isSidePanel,
        })}
      >
        <img
          className='bg-gray-100 dark:bg-gray-850 h-[24px] w-[24px] rounded-full'
          src={sourceToken?.img ?? defaultTokenLogo}
          onError={imgOnError(defaultTokenLogo)}
          alt={sourceToken?.skipAsset?.denom}
        />
        <div className='text-black-100 text-center whitespace-nowrap overflow-hidden max-w-full text-ellipsis font-bold text-sm max-[350px]:!text-xs !leading-[19.6px] max-[350px]:!leading-[16.8px] dark:text-white-100'>
          {sourceBalance}
        </div>
      </div>

      <div
        className={classNames(
          'bg-gray-100 dark:bg-gray-850 shrink-0 flex justify-center items-center rounded-full',
          {
            'w-[24px] h-[24px]': !_isSidePanel,
            'w-[20px] h-[20px]': _isSidePanel,
          },
        )}
      >
        <ArrowRight
          size={16}
          className={classNames('text-black-100 dark:text-white-100', {
            '!leading-[16px]': !_isSidePanel,
            '!leading-[13.33px]': _isSidePanel,
          })}
        />
      </div>

      <div
        className={classNames('flex justify-center gap-1 items-center w-full max-w-[140px]', {
          'max-[399px]:!max-w-[calc(min(45%,140px))]': _isSidePanel,
        })}
      >
        <img
          className='bg-gray-100 dark:bg-gray-850 h-[24px] w-[24px] rounded-full'
          src={destinationToken?.img ?? defaultTokenLogo}
          onError={imgOnError(defaultTokenLogo)}
          alt={destinationToken?.skipAsset?.denom}
        />
        <div className='text-black-100 text-center whitespace-nowrap overflow-hidden max-w-full text-ellipsis font-bold text-sm max-[350px]:!text-xs !leading-[19.6px] dark:text-white-100'>
          {destinationBalance}
        </div>
      </div>
    </div>
  )
}

export default TxTokensSummaryMini
