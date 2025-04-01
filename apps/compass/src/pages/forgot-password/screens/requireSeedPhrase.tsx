import { SeedPhraseInput } from 'components/seed-phrase-input'
import Text from 'components/text'
import { Button } from 'components/ui/button'
import { SeedPhrase } from 'hooks/wallet/seed-phrase/useSeedPhrase'
import React, { useState } from 'react'
import correctMnemonic from 'utils/correct-mnemonic'

import { ForgotPasswordWrapper } from './wrapper'

interface PropsType {
  incrementStep: () => void
  // eslint-disable-next-line no-unused-vars
  setMnemonicAtRoot: (mneumonic: string) => void
}

/**
 *
 * @decription This component is used to promt the user to enter their secret recovery phrase.
 * @param props PropsType - props.incrementStep() is called when the user clicks the button to move to the next step, props.setMneumonicAtRoot() is called when the entered mneumonic is verified.
 * @returns React Component
 */
const RequireSeedPhrase: React.FC<PropsType> = ({ incrementStep, setMnemonicAtRoot }) => {
  const [error, setError] = useState('')
  const [mnemonic, setMnemonic] = useState('')

  /**
   * @description This function is called when the data in the textarea is modified
   * @returns null
   */
  const onChangeHandler = (value: string) => {
    setError('')
    setMnemonic(value)
  }

  /**
   * @description Function to validate the entered seed phrase
   * @returns boolean - true/false
   */
  const validateSeedPhrase = () => {
    setError('')

    if (!SeedPhrase.validateSeedPhrase(correctMnemonic(mnemonic))) {
      setError('Invalid recovery phrase.')
      return false
    }
    return true
  }

  /**
   * @description Function to import wallet from seed phrase and set the mneumonic state to the entered mneumonic in root flow
   * @returns null
   */
  const importWalletFromSeedPhrase = async () => {
    if (validateSeedPhrase()) {
      setMnemonicAtRoot(mnemonic)
      incrementStep()
    }
  }

  return (
    <ForgotPasswordWrapper>
      <header className='flex flex-col gap-1'>
        <span className='font-bold text-xl text-center'>Enter recovery phrase</span>

        <span className='text-secondary-foreground text-sm text-center'>
          To restore your wallet enter your recovery phrase
        </span>
      </header>

      <SeedPhraseInput onChangeHandler={onChangeHandler} isError={!!error} />

      {error && (
        <span className='text-sm text-destructive-100 font-medium mx-auto my-0'>{error}</span>
      )}

      <Button
        onClick={() => {
          mnemonic && importWalletFromSeedPhrase()
        }}
        disabled={!mnemonic}
        className='w-full mt-auto'
      >
        Restore Wallet
      </Button>
    </ForgotPasswordWrapper>
  )
}

export default RequireSeedPhrase
