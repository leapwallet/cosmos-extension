import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons } from '@leapwallet/leap-ui'
import { Wallet as WalletIcon } from '@phosphor-icons/react'
import BottomModal from 'components/new-bottom-modal'
import { Button } from 'components/ui/button'
import { Input } from 'components/ui/input'
import { getWalletIconAtIndex } from 'images/misc'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import CreateWalletInput from '../../components/create-wallet-form/CreateWalletInput'
import SelectWalletColors from '../../components/create-wallet-form/SelectWalletColors'
import { ErrorCard } from '../../components/ErrorCard'
import { LoaderAnimation } from '../../components/loader/Loader'
import { Wallet } from '../../hooks/wallet/useWallet'
import { Colors } from '../../theme/colors'
import { getWalletName } from './utils/wallet-names'

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
  const wallets = Wallet.useWallets()
  const shouldAutoFillName = useRef(true)

  const handleClose = useCallback((value: boolean) => {
    setName('')
    setError('')
    onClose(value)
    shouldAutoFillName.current = true

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

  useEffect(() => {
    if (isVisible && shouldAutoFillName.current) {
      setName(getWalletName(Object.values(wallets || {}).filter((wallet) => !wallet.watchWallet)))
      shouldAutoFillName.current = false
    }
  }, [wallets, isVisible])

  return (
    <BottomModal
      fullScreen
      isOpen={isVisible}
      onClose={() => handleClose(false)}
      title={'Create new wallet'}
      className='w-full'
      footerComponent={
        <>
          <Button
            size='md'
            variant='secondary'
            className='flex-1'
            onClick={() => handleClose(false)}
          >
            Cancel
          </Button>
          <Button
            size='md'
            disabled={!name || isLoading}
            data-testing-id='btn-create-wallet'
            className='flex-1'
            onClick={createWallet}
          >
            Create Wallet
          </Button>
        </>
      }
    >
      <div className='flex p-4 mb-4 rounded-2xl flex-col bg-secondary-50 items-center gap-4'>
        <img src={getWalletIconAtIndex(colorIndex)} alt='wallet-icon' className='size-20' />

        <Input
          autoFocus
          placeholder='Enter wallet name'
          maxLength={24}
          value={name}
          onChange={(e) => {
            if (e.target.value.length < 25) setName(e.target.value)
          }}
          className='ring-accent-green-200 h-12'
          trailingElement={
            <div className='text-muted-foreground text-sm font-medium'>{`${name.length}/24`}</div>
          }
        />

        <SelectWalletColors selectColorIndex={setColorIndex} colorIndex={colorIndex} />
      </div>

      {!!error && <ErrorCard data-testing-id='create-new-wallet-error' text={error} />}
    </BottomModal>
  )
}
