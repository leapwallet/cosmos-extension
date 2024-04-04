import { Buttons, LineDivider, ThemeName, useTheme } from '@leapwallet/leap-ui'
import { Divider } from 'components/dapp'
import Text from 'components/text'
import { LedgerEvmChains } from 'images/logos'
import { CheckGreenNew } from 'images/misc'
import React from 'react'
import { Colors } from 'theme/colors'

interface ImportEvmModalProps {
  onYes: () => void
  onNo: () => void
  onClose: () => void
}

export default function ImportEvmModal({ onYes, onNo, onClose }: ImportEvmModalProps) {
  const { theme } = useTheme()

  return (
    <div className='absolute w-full h-full flex items-center justify-center left-0 top-0 bg-[#0003] backdrop-blur-[10px] z-10'>
      <div className='w-[540px] bg-gray-950 rounded-3xl'>
        <div className='flex justify-between py-6 px-6 border-b border-gray-900'>
          <Text className='font-[700] text-[18px]'>Cosmos import successful</Text>
          <div className='material-icons-round text-gray-500 cursor-pointer' onClick={onClose}>
            close
          </div>
        </div>
        <div className='flex flex-col items-center justify-center gap-4 mb-8 mt-11'>
          <img src={CheckGreenNew} className='height-[72px] width-[72px]' />
          <Text size='lg' className='font-bold text-center'>
            Your Cosmos wallets can <br /> now be used with Leap!
          </Text>
        </div>
        <div className='h-[1px] bg-gray-900 w-full' />
        <div className='flex flex-col items-center justify-center gap-3 mt-11 mb-7'>
          <img src={LedgerEvmChains} className='height-[32px] width-[88px]' />
          <Text size='md' className='text-center'>
            You can now import your EVM based wallets to use <br /> chains like Dymension, Evmos &
            Injective.
          </Text>
        </div>
        <div className='flex gap-4 px-6 mb-6'>
          <Buttons.Generic
            color={theme === ThemeName.DARK ? Colors.gray800 : Colors.gray100}
            size='normal'
            className={'w-full'}
            onClick={onNo}
          >
            <Text color='text-green-600'>Skip</Text>
          </Buttons.Generic>
          <Buttons.Generic
            color={Colors.green600}
            size='normal'
            className={'w-full'}
            onClick={onYes}
          >
            Import
          </Buttons.Generic>
        </div>
        <div className='flex items-center justify-center text-center mb-8'>
          <Text color='text-gray-400 dark:text-gray-600 ' className='font-medium'>
            You can also import EVM wallets later.
          </Text>
        </div>
      </div>
    </div>
  )
}
