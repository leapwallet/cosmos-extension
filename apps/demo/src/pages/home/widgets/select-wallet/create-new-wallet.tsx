import { ChainInfos } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, HeaderActionType } from '@leapwallet/leap-ui'
import React, { useState } from 'react'

import BottomSheet from '~/components/bottom-sheet'
import { useActiveChain } from '~/hooks/settings/use-active-chain'
import { Colors } from '~/theme/colors'

import { CreateWalletForm, SelectWalletColors } from '../create-wallet-form'

type NewWalletFormProps = {
  isVisible: boolean
  onClose: (closeParent: boolean) => void
}

export function NewWalletForm({ isVisible, onClose }: NewWalletFormProps) {
  const [name, setName] = useState('')
  const [colorIndex, setColorIndex] = useState<number>(0)
  const activeChain = useActiveChain()

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={() => onClose(false)}
      headerTitle={'Create new wallet'}
      headerActionType={HeaderActionType.CANCEL}
      closeOnClickBackDrop={true}
    >
      <div className='flex flex-col  justify-center gap-y-[16px] items-center p-[28px]'>
        <div className='flex w-[344px] rounded-2xl flex-col dark:bg-gray-900 bg-white-100 items-center py-[24px] gap-y-[20px] px-[16]'>
          <div
            className='rounded-full'
            style={{ backgroundColor: Colors.walletColors[colorIndex] }}
          >
            <div className='p-[24px] material-icons-round text-white-100' style={{ fontSize: 40 }}>
              account_balance_wallet
            </div>
          </div>
          <CreateWalletForm
            value={name}
            onChange={(e) => {
              if (e.target.value.length < 25) setName(e.target.value)
            }}
          />
          <SelectWalletColors selectColorIndex={setColorIndex} colorIndex={colorIndex} />
        </div>
        <div className='flex shrink w-[344px]'>
          <Buttons.Generic
            disabled={!name}
            color={ChainInfos[activeChain].theme.primaryColor}
            onClick={console.log}
          >
            {' '}
            Create Wallet
          </Buttons.Generic>
        </div>
      </div>
    </BottomSheet>
  )
}
