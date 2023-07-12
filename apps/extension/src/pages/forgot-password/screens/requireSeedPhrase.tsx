import { Buttons, TextArea } from '@leapwallet/leap-ui'
import PopupLayout from 'components/layout/popup-layout'
import Text from 'components/text'
import { SeedPhrase } from 'hooks/wallet/seed-phrase/useSeedPhrase'
import { Images } from 'images'
import React, { useState } from 'react'
import { Colors } from 'theme/colors'
import correctMnemonic from 'utils/correct-mnemonic'

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
  const onChangeHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setError('')
    setMnemonic(e.target.value)
  }

  /**
   * @description Function to validate the entered seed phrase
   * @returns boolean - true/false
   */
  const validateSeedPhrase = () => {
    setError('')

    if (!SeedPhrase.validateSeedPhrase(correctMnemonic(mnemonic))) {
      setError('Invalid secret recovery phrase.')
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
    <PopupLayout>
      <div className='flex flex-col h-full pt-[20%]'>
        <div className='mx-5 bg-gray-900 dark:bg-gray-100 rounded-[16px] mb-4 h-[36px] w-[36px] flex flex-col justify-center text-center'>
          <div
            style={{ fontSize: 20 }}
            className='material-icons-round dark:text-gray-900 text-gray-100'
          >
            lock
          </div>
        </div>
        <Text size='xxl' className='font-bold px-5'>
          Enter secret recovery phrase
        </Text>
        <Text size='md' color='text-gray-500 dark:text-gray-300 mb-[32px] px-5'>
          To restore your wallet enter your secret recovery phrase
        </Text>
        {/* input box for recovery phase */}
        <div className='mx-auto'>
          <TextArea
            onChange={onChangeHandler}
            value={mnemonic}
            isErrorHighlighted={!!error}
            placeholder='Enter or Paste your recovery / seed phrase'
          />
        </div>
        {error && (
          <Text size='sm' color='text-red-300 mx-auto my-0'>
            {error}
          </Text>
        )}
        <div className='w-[376px] h-auto rounded-xl dark:bg-gray-900 bg-white-100 flex items-center p-[10px] mx-auto mt-[10px]'>
          <img className='mr-[16px]' src={Images.Misc.Warning} />
          <div className='flex flex-col gap-y-[2px]'>
            <Text size='xs' className='tex font-black font-bold'>
              Recommended security practice:
            </Text>
            <Text size='xs' color='text-gray-400'>
              Type out seed phrase instead of pasting it
            </Text>
          </div>
        </div>
        <div className='flex w-full shrink mt-[10px] p-5'>
          <Buttons.Generic
            size='normal'
            color={Colors.cosmosPrimary}
            onClick={() => {
              mnemonic !== '' && importWalletFromSeedPhrase()
            }}
            style={{
              opacity: `${mnemonic === '' ? '0.4' : '1'}`,
              background: Colors.cosmosPrimary,
            }}
          >
            Restore Wallet
          </Buttons.Generic>
        </div>
      </div>
    </PopupLayout>
  )
}

export default RequireSeedPhrase
