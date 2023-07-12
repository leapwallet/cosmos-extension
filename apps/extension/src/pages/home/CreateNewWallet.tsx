import { Buttons, HeaderActionType } from '@leapwallet/leap-ui'
import BottomSheet from 'components/bottom-sheet/BottomSheet'
import React, { useCallback, useState } from 'react'

import { Wallet } from '../../hooks/wallet/useWallet'
import useCreateNewWallet = Wallet.useCreateNewWallet

import CreateWalletInput from '../../components/create-wallet-form/CreateWalletInput'
import SelectWalletColors from '../../components/create-wallet-form/SelectWalletColors'
import { ErrorCard } from '../../components/ErrorCard'
import { LoaderAnimation } from '../../components/loader/Loader'
import { useActiveChain } from '../../hooks/settings/useActiveChain'
import { Colors } from '../../theme/colors'

type NewWalletFormProps = {
  isVisible: boolean
  // eslint-disable-next-line no-unused-vars
  onClose: (closeParent: boolean) => void
}

export function NewWalletForm({ isVisible, onClose }: NewWalletFormProps) {
  const [isLoading, setLoading] = useState<boolean>(false)
  const createNewWallet = useCreateNewWallet()
  const [name, setName] = useState('')
  const [colorIndex, setColorIndex] = useState<number>(0)
  const [error, setError] = useState('')
  const activeChain = useActiveChain()

  const handleClose = useCallback((value: boolean) => {
    setName('')
    setError('')
    onClose(value)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const createWallet = async () => {
    setError('')
    setLoading(true)
    if (name) {
      const err = await createNewWallet({ name: name.trim(), colorIndex })
      if (err) setError(err)
      else {
        handleClose(true)
      }
    }
    setLoading(false)
  }

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={() => handleClose(false)}
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
          <CreateWalletInput
            value={name}
            onChange={(e) => {
              if (e.target.value.length < 25) setName(e.target.value)
            }}
          />
          <SelectWalletColors selectColorIndex={setColorIndex} colorIndex={colorIndex} />
        </div>
        {!!error && <ErrorCard data-testing-id='create-new-wallet-error' text={error} />}
        <div className='flex shrink w-[344px]'>
          <Buttons.Generic
            disabled={!name || isLoading}
            color={Colors.getChainColor(activeChain)}
            onClick={createWallet}
            data-testing-id='btn-create-wallet'
          >
            {isLoading ? <LoaderAnimation color={Colors.white100} /> : 'Create Wallet'}
          </Buttons.Generic>
        </div>
      </div>
    </BottomSheet>
  )
}
