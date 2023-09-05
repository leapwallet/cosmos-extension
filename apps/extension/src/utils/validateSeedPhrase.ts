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
  const correctedSecret = correctMnemonic(phrase)

  if (isPrivateKey) {
    try {
      const privateKey = correctedSecret.toLowerCase().startsWith('0x')
        ? correctedSecret.slice(2)
        : correctedSecret
      if (!secp256k1.utils.isValidPrivateKey(privateKey)) {
        throw new Error('Invalid private key.')
      }
    } catch (error) {
      setError('Invalid private key.')
      return false
    }
  } else if (!SeedPhrase.validateSeedPhrase(correctedSecret)) {
    setError('Invalid secret recovery phrase.')
    return false
  }

  setSecret(correctedSecret)
  return true
}
