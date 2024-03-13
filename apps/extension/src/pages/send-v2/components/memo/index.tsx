import { ChainInfos, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import Text from 'components/text'
import { useSendContext } from 'pages/send-v2/context'
import React, { useState } from 'react'

import { CEXSheet } from './cex-sheet'

const tokenOnCEX = ['ATOM', 'SEI', 'INJ', 'NTRN', 'USDC', 'TIA', 'OSMO']

export const Memo: React.FC = () => {
  const [showCEXSheet, setShowCEXSheet] = useState<boolean>(false)
  const { memo, setMemo, selectedAddress, selectedToken, isIBCTransfer } = useSendContext()
  const selectedAddressNativeDenoms: string[] = Object.keys(
    ChainInfos[selectedAddress?.chainName as SupportedChain]?.nativeDenoms ?? {},
  )

  const canBeCEXTransfer =
    isIBCTransfer &&
    tokenOnCEX.includes(selectedToken?.symbol || '') &&
    selectedAddressNativeDenoms?.includes(selectedToken?.coinMinimalDenom || '')

  return (
    <>
      <div className='card-container'>
        <div className='flex justify-between w-full mb-4'>
          <p className='font-bold text-sm text-gray-600 dark:text-gray-200'>Memo</p>
          <p
            className='font-medium text-sm text-gray-500 cursor-pointer'
            onClick={() => setShowCEXSheet(true)}
          >
            Learn more
          </p>
        </div>
        <input
          type='text'
          value={memo}
          placeholder='Required for sending to centralised exchanges..'
          className='border w-full border-gray-300 dark:border-gray-800 rounded-lg px-4 py-3 font-medium text-sm placeholder:text-gray-300 dark:placeholder:text-gray-700 text-gray-600 dark:text-gray-200 outline-none focus:border-gray-400 dark:focus:border-gray-500 bg-white-0'
          onChange={(e) => setMemo(e.target?.value)}
        />
      </div>

      {canBeCEXTransfer && (
        <div className='rounded-xl p-4 flex items-center bg-[#422800] border border-[#704400] gap-2'>
          <div className='material-icons-round text-orange-600' style={{ fontSize: 20 }}>
            warning
          </div>
          <Text size='sm' color='text-orange-600 font-medium'>
            Avoid IBC transfers to Centralised exchanges. Your token might get lost.
          </Text>
        </div>
      )}

      <CEXSheet isOpen={showCEXSheet} onClose={() => setShowCEXSheet(false)} />
    </>
  )
}
