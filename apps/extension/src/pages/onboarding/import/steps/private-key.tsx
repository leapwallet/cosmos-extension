import { Button } from 'components/ui/button'
import { PrivateKeyInput } from 'components/ui/input/private-key-input'
import { KeySlimIcon } from 'icons/key-slim-icon'
import React, { useEffect, useState } from 'react'
import { validateSeedPhrase } from 'utils/validateSeedPhrase'

import { OnboardingWrapper } from '../../wrapper'
import { useImportWalletContext } from '../import-wallet-context'

export const PrivateKey = () => {
  const { secret, setSecret, privateKeyError, setPrivateKeyError, importWalletFromSeedPhrase } =
    useImportWalletContext()
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
      importWalletFromSeedPhrase()
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
