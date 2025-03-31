import { SeedPhraseInput } from 'components/seed-phrase-input'
import { Button } from 'components/ui/button'
import React, { useEffect, useState } from 'react'
import { validateSeedPhrase } from 'utils/validateSeedPhrase'

import { useImportWalletContext } from '../import/import-wallet-context'
import { OnboardingWrapper } from '../wrapper'

type SeedPhraseViewProps = {
  onProceed: () => void
  secret: string
  setSecret: React.Dispatch<React.SetStateAction<string>>
  privateKeyError?: string
  setPrivateKeyError?: React.Dispatch<React.SetStateAction<string>>
}

export const SeedPhraseView = ({
  onProceed,
  secret,
  setSecret,
  privateKeyError,
  setPrivateKeyError,
}: SeedPhraseViewProps) => {
  const [error, setError] = useState(privateKeyError ?? '')
  const { currentStep, prevStep } = useImportWalletContext()

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
    if (validateSeedPhrase({ phrase: secret, isPrivateKey: false, setError, setSecret })) {
      onProceed()
    }
  }

  return (
    <OnboardingWrapper
      heading={'Enter recovery phrase'}
      subHeading={'Type or paste your 12 or 24-word recovery phrase'}
      entry={prevStep <= currentStep ? 'right' : 'left'}
    >
      <div className='w-full space-y-6'>
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
        className='mt-auto w-full'
        disabled={!!error || !secret}
        onClick={handleImportWalletClick}
      >
        Continue
      </Button>
    </OnboardingWrapper>
  )
}
