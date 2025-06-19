import { SeedPhraseInput } from 'components/seed-phrase-input'
import { Button } from 'components/ui/button'
import React, { useEffect, useState } from 'react'
import { validateSeedPhrase } from 'utils/validateSeedPhrase'

import { OnboardingWrapper } from '../../wrapper'
import { useImportWalletContext } from '../import-wallet-context'

export const SeedPhrase = () => {
  const {
    walletName,
    privateKeyError,
    setPrivateKeyError,
    secret,
    setSecret,
    importWalletFromSeedPhrase,
    prevStep,
    currentStep,
  } = useImportWalletContext()
  const [error, setError] = useState(privateKeyError ?? '')
  const [isLoading, setIsLoading] = useState(false)
  const isPrivateKey = walletName === 'private-key'

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

  const handleImportWalletClick = async () => {
    if (validateSeedPhrase({ phrase: secret, isPrivateKey, setError, setSecret })) {
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 100))
      await importWalletFromSeedPhrase()
      setIsLoading(false)
    }
  }

  return (
    <OnboardingWrapper
      heading={'Enter recovery phrase'}
      subHeading={'Type or paste your 12 or 24-word recovery phrase'}
      entry={prevStep <= currentStep ? 'right' : 'left'}
    >
      <div className='w-full space-y-6 flex-1'>
        <SeedPhraseInput onChangeHandler={onChangeHandler} isError={!!error} />

        {error && (
          <span
            className='text-xs font-medium text-destructive-100 block text-center'
            data-testing-id='error-text-ele'
          >
            {error}
          </span>
        )}
      </div>

      <Button
        data-testing-id='btn-import-wallet'
        className='mt-4 w-full'
        disabled={!!error || !secret || isLoading}
        onClick={handleImportWalletClick}
      >
        Continue
      </Button>
    </OnboardingWrapper>
  )
}
