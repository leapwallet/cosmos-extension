import { formatTokenAmount, sliceWord } from '@leapwallet/cosmos-wallet-hooks'
import classNames from 'classnames'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { hideAssetsStore } from 'stores/hide-assets-store'
import { imgOnError } from 'utils/imgOnError'

import { TxReviewTokenInfoProps } from './index'

type TxPageAmountProps = TxReviewTokenInfoProps & { isFirst?: boolean }

function TxPageAmountView({ amount, token, chain, isFirst }: TxPageAmountProps) {
  const defaultTokenLogo = useDefaultTokenLogo()

  const balanceAmount = useMemo(() => {
    return hideAssetsStore.formatHideBalance(
      formatTokenAmount(amount ?? '0', sliceWord(token?.symbol ?? '', 4, 4), 3),
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, token?.symbol])

  return (
    <div
      className={classNames(
        "flex items-center gap-4 relative before:content-[''] before:absolute before:w-[1px] before:h-[150px] before:left-[15px] before:bg-gray-200 before:dark:bg-gray-800",
        {
          'before:bottom-[30px]': !isFirst,
          'before:top-[30px]': isFirst,
        },
      )}
    >
      <img
        src={chain?.icon ?? defaultTokenLogo}
        onError={imgOnError(defaultTokenLogo)}
        className='w-[32px] h-[32px] border-[0.5px] border-gray-700 rounded-full z-10 dark:bg-gray-900'
      />

      <div className='flex flex-col'>
        <p className='dark:text-white-100 text-[18px] font-bold'>{balanceAmount}</p>
        <p className='text-gray-300 text-sm'>On {chain?.chainName ?? ''}</p>
      </div>
    </div>
  )
}

export const TxPageAmount = observer(TxPageAmountView)
