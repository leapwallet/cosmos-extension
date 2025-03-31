/* eslint-disable @typescript-eslint/no-explicit-any */
import { captureException } from '@sentry/react'
import BottomModal from 'components/bottom-modal'
import { Button } from 'components/ui/button'
import { PrivateKeyInput } from 'components/ui/input/private-key-input'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import { passwordStore } from 'stores/password-store'
import { validateSeedPhrase } from 'utils/validateSeedPhrase'

import { Wallet } from '../../hooks/wallet/useWallet'

type ImportPrivateKeyProps = {
  isVisible: boolean
  onClose: (closeParent: boolean) => void
}

export const ImportPrivateKey = observer(({ isVisible, onClose }: ImportPrivateKeyProps) => {
  const [privateKey, setPrivateKey] = useState('')
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { activeWallet } = useActiveWallet()
  const importWallet = Wallet.useImportWallet()
  const updateWatchWalletSeed = Wallet.useUpdateWatchWalletSeed()

  const onChangeHandler = (value: string) => {
    setError('')
    setPrivateKey(value)
  }

  const handleImportWallet = async () => {
    setError('')
    setIsLoading(true)

    if (
      privateKey &&
      passwordStore.password &&
      validateSeedPhrase({
        phrase: privateKey,
        isPrivateKey: true,
        setError,
        setSecret: setPrivateKey,
      })
    ) {
      try {
        if (activeWallet?.watchWallet) {
          await updateWatchWalletSeed(privateKey)
        } else {
          await importWallet({
            privateKey,
            type: 'import',
            addressIndex: '0',
            password: passwordStore.password,
          })
        }
        setPrivateKey('')
        onClose(true)
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Something went wrong'
        captureException(errorMessage)
        setError(errorMessage)
      }
    }

    setIsLoading(false)
  }

  return (
    <BottomModal
      fullScreen
      isOpen={isVisible}
      onClose={() => {
        onClose(false)
        setError('')
      }}
      title={'Import Wallet'}
      footerComponent={
        <>
          <Button variant='secondary' size='md' className='flex-1' onClick={() => onClose(false)}>
            Cancel
          </Button>

          <Button
            size='md'
            disabled={!privateKey || !!error || isLoading}
            onClick={handleImportWallet}
            className='flex-1'
          >
            Import Wallet
          </Button>
        </>
      }
    >
      <div className='flex flex-col gap-y-4 items-center justify-center'>
        <PrivateKeyInput value={privateKey} onChange={onChangeHandler} error={error} />
      </div>
    </BottomModal>
  )
})
