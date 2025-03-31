import { captureException } from '@sentry/react'
import BottomModal from 'components/bottom-modal'
import { SeedPhraseInput } from 'components/seed-phrase-input'
import { Button } from 'components/ui/button'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { Wallet } from 'hooks/wallet/useWallet'
import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import { passwordStore } from 'stores/password-store'
import { validateSeedPhrase } from 'utils/validateSeedPhrase'

type ImportSeedPhraseProps = {
  isVisible: boolean
  onClose: (closeParent: boolean) => void
}

export const ImportSeedPhrase = observer(({ isVisible, onClose }: ImportSeedPhraseProps) => {
  const [secret, setSecret] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { activeWallet } = useActiveWallet()
  const importWallet = Wallet.useImportWallet()
  const updateWatchWalletSeed = Wallet.useUpdateWatchWalletSeed()

  const onChangeHandler = (value: string) => {
    setError('')
    setSecret(value)
  }

  const handleImportWallet = async () => {
    setError('')
    setIsLoading(true)

    if (
      secret &&
      passwordStore.password &&
      validateSeedPhrase({ phrase: secret, isPrivateKey: false, setError, setSecret })
    ) {
      try {
        if (activeWallet?.watchWallet) {
          await updateWatchWalletSeed(secret)
        } else {
          await importWallet({
            privateKey: secret,
            type: 'import',
            addressIndex: '0',
            password: passwordStore.password,
          })
        }
        setSecret('')
        onClose(true)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            disabled={!secret || !!error || isLoading}
            onClick={handleImportWallet}
            className='flex-1'
          >
            Import Wallet
          </Button>
        </>
      }
    >
      <div className='flex flex-col gap-y-4 items-center justify-center'>
        <SeedPhraseInput
          onChangeHandler={onChangeHandler}
          isError={!!error}
          onPage='SelectWallet'
        />

        {error && (
          <span className='text-xs font-medium text-destructive-100 block text-center'>
            {error}
          </span>
        )}
      </div>
    </BottomModal>
  )
})
