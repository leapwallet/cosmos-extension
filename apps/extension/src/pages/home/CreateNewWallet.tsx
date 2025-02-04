import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons } from '@leapwallet/leap-ui'
import { Wallet as WalletIcon } from '@phosphor-icons/react'
import BottomModal from 'components/bottom-modal'
import React, { useCallback, useState } from 'react'

import CreateWalletInput from '../../components/create-wallet-form/CreateWalletInput'
import SelectWalletColors from '../../components/create-wallet-form/SelectWalletColors'
import { ErrorCard } from '../../components/ErrorCard'
import { LoaderAnimation } from '../../components/loader/Loader'
import { Wallet } from '../../hooks/wallet/useWallet'
import { Colors } from '../../theme/colors'

type NewWalletFormProps = {
  isVisible: boolean
  // eslint-disable-next-line no-unused-vars
  onClose: (closeParent: boolean) => void
}

export function NewWalletForm({ isVisible, onClose }: NewWalletFormProps) {
  const [isLoading, setLoading] = useState<boolean>(false)
  const createNewWallet = Wallet.useCreateNewWallet()
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
    <BottomModal
      isOpen={isVisible}
      onClose={() => handleClose(false)}
      title={'Create new wallet'}
      closeOnBackdropClick={true}
    >
      <div className='flex flex-col justify-center gap-y-[16px] items-center'>
        <div className='flex w-[344px] px-4 rounded-2xl flex-col dark:bg-gray-900 bg-white-100 items-center py-[24px] gap-y-[20px]'>
          <div
            className='rounded-full'
            style={{ backgroundColor: Colors.walletColors[colorIndex] }}
          >
            <div className='p-[24px] text-white-100'>
              <WalletIcon size={40} className='text-white-100' />
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
    </BottomModal>
  )
}
