import {
  getMayaTxFee,
  getThorChainTxFee,
  useActiveChain,
  useChainApis,
  useformatCurrency,
} from '@leapwallet/cosmos-wallet-hooks'
import BigNumber from 'bignumber.js'
import { useSendContext } from 'pages/send-v2/context'
import React, { useEffect, useState } from 'react'

export function FixedFee() {
  const [fee, setFee] = useState(new BigNumber(1))
  const [formatCurrency] = useformatCurrency()
  const { feeDenom, feeTokenFiatValue } = useSendContext()
  const { lcdUrl } = useChainApis()
  const activeChain = useActiveChain()

  useEffect(() => {
    ;(async function () {
      switch (activeChain) {
        case 'mayachain': {
          const fee = await getMayaTxFee(lcdUrl ?? '')
          setFee(new BigNumber(fee).div(10 ** feeDenom.coinDecimals))

          break
        }

        case 'thorchain': {
          const fee = await getThorChainTxFee(lcdUrl ?? '')
          setFee(new BigNumber(fee).div(10 ** feeDenom.coinDecimals))

          break
        }
      }
    })()
  }, [feeDenom.coinDecimals, lcdUrl, activeChain])

  return (
    <div className='flex items-center justify-center text-gray-600 dark:text-gray-200'>
      <p className='font-semibold text-center text-sm'>Transaction fee: </p>
      <p className='font-semibold text-center text-sm ml-1'>
        <strong className='mr-1'>
          {fee.toString()} {feeDenom.coinDenom}
        </strong>
        {feeTokenFiatValue ? `(${formatCurrency(fee.multipliedBy(feeTokenFiatValue))})` : null}
      </p>
    </div>
  )
}
