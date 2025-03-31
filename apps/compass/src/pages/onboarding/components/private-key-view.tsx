import { Button } from 'components/ui/button'
import { PrivateKeyInput } from 'components/ui/input/private-key-input'
import { KeySlimIcon } from 'icons/key-slim-icon'
import React, { useEffect, useState } from 'react'
import { validateSeedPhrase } from 'utils/validateSeedPhrase'

import { useImportWalletContext } from '../import/import-wallet-context'
import { OnboardingWrapper } from '../wrapper'

type PrivateKeyProps = {
  onProceed: () => void
  secret: string
  setSecret: React.Dispatch<React.SetStateAction<string>>
  privateKeyError?: string
  setPrivateKeyError?: React.Dispatch<React.SetStateAction<string>>
}

export const PrivateKeyView = ({
  onProceed,
  secret,
  setSecret,
  privateKeyError,
  setPrivateKeyError,
}: PrivateKeyProps) => {
  const [error, setError] = useState(privateKeyError ?? '')
  const { prevStep, currentStep } = useImportWalletContext()

  useEffect(() => {
    if (privateKeyError?.length) {
      setError(privateKeyError)
    }
  }, [privateKeyError])

  const onChangeHandler = (value: string) => {
    setError('')
    setPrivateKeyError && setPrivateKeyError('')
    setSecret(value)
  }

  const handleImportWalletClick = () => {
    if (validateSeedPhrase({ phrase: secret, isPrivateKey: true, setError, setSecret })) {
      onProceed()
    }
  }

  return (
    <OnboardingWrapper
      headerIcon={<KeySlimIcon className='size-6' />}
      heading={'Import with private key'}
      subHeading={'Type or paste your private key here'}
      entry={prevStep <= currentStep ? 'right' : 'left'}
      className='gap-10'
    >
      <PrivateKeyInput value={secret} onChange={onChangeHandler} error={error} />

      <Button
        data-testing-id='btn-import-wallet'
        className='mt-auto w-full'
        disabled={!!error || !secret}
        onClick={handleImportWalletClick}
      >
        Import private key
      </Button>
    </OnboardingWrapper>
  )
}
