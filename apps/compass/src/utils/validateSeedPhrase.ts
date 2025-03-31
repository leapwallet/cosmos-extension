import * as secp256k1 from '@noble/secp256k1'
import { SeedPhrase } from 'hooks/wallet/seed-phrase/useSeedPhrase'

import correctMnemonic from './correct-mnemonic'

type validateSeedPhraseParams = {
  phrase: string
  isPrivateKey: boolean
  // eslint-disable-next-line no-unused-vars
  setError: (value: React.SetStateAction<string>) => void
  // eslint-disable-next-line no-unused-vars
  setSecret: (value: React.SetStateAction<string>) => void
}

export const validatePrivateKey = (key: string) => {
  const correctedSecret = correctMnemonic(key || '')
  const privateKey = correctedSecret.toLowerCase().startsWith('0x')
    ? correctedSecret.slice(2)
    : correctedSecret

  try {
    if (!secp256k1.utils.isValidPrivateKey(privateKey)) {
      throw new Error('Invalid private key.')
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid private key.',
    } as const
  }

  return {
    valid: true,
    correctedSecret,
  } as const
}

/**
 * @description Function to validate the entered secret
 * @returns boolean - true/false
 */
export const validateSeedPhrase = ({
  phrase,
  isPrivateKey,
  setError,
  setSecret,
}: validateSeedPhraseParams) => {
  setError('')

  if (isPrivateKey) {
    const { valid, error, correctedSecret } = validatePrivateKey(phrase)
    if (!valid) {
      setError(error)
      return false
    }

    setSecret(correctedSecret)
    return true
  }

  const correctedSecret = correctMnemonic(phrase)
  if (!SeedPhrase.validateSeedPhrase(correctedSecret)) {
    setError('Invalid recovery phrase.')
    return false
  }

  setSecret(correctedSecret)
  return true
}
