import { Buttons, TextArea } from '@leapwallet/leap-ui'
import { SeedPhraseInput } from 'components/seed-phrase-input'
import Text from 'components/text'
import { Images } from 'images'
import React, { useEffect, useState } from 'react'
import { Colors } from 'theme/colors'
import { isCompassWallet } from 'utils/isCompassWallet'
import { validateSeedPhrase } from 'utils/validateSeedPhrase'

import {
  useGetSeedPhraseViewImgSrc,
  useGetSeedPhraseViewSubtitle,
  useGetSeedPhraseViewTitle,
} from '../hooks'
import { AdditionalInfo, OnlySeedPhraseAdditionalInfo } from './index'

type SeedPhraseViewProps = {
  readonly walletName: string
  readonly onProceed: () => void
  secret: string
  setSecret: React.Dispatch<React.SetStateAction<string>>
  isPrivateKey: boolean
  privateKeyError?: string
  setPrivateKeyError?: React.Dispatch<React.SetStateAction<string>>
  isMetamaskKey?: boolean
  isOtherEvmWallets?: boolean
}

export function SeedPhraseView({
  onProceed,
  walletName,
  secret,
  setSecret,
  isPrivateKey,
  privateKeyError,
  setPrivateKeyError,
  isMetamaskKey,
  isOtherEvmWallets,
}: SeedPhraseViewProps) {
  const [error, setError] = useState(privateKeyError ?? '')
  const isCosmostation = walletName === 'Cosmostation'

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
    if (validateSeedPhrase({ phrase: secret, isPrivateKey, setError, setSecret })) {
      onProceed()
    }
  }

  const imgSrc = useGetSeedPhraseViewImgSrc(
    isPrivateKey,
    walletName,
    isMetamaskKey,
    isOtherEvmWallets,
  )
  const title = useGetSeedPhraseViewTitle(
    isPrivateKey,
    walletName,
    isMetamaskKey,
    isOtherEvmWallets,
  )
  const subTitle = useGetSeedPhraseViewSubtitle(
    isPrivateKey,
    walletName,
    isMetamaskKey,
    isOtherEvmWallets,
  )

  return (
    <div className='flex flex-row overflow-scroll gap-x-[20px]'>
      <div className='flex flex-col w-[408px]'>
        <img src={imgSrc} width='36' height='36' />
        <Text size='xxl' className='font-black mt-4'>
          {title}
        </Text>
        <Text size='md' color='text-gray-600 dark:text-gray-400' className='font-medium mb-[32px]'>
          {subTitle}
        </Text>

        {isPrivateKey ? (
          <TextArea
            autoFocus
            onChange={(event) => onChangeHandler(event.target.value)}
            value={secret}
            isErrorHighlighted={!!error}
            placeholder='Enter or Paste your private key'
            data-testing-id='enter-phrase'
          />
        ) : (
          <div className='w-[376px]'>
            <SeedPhraseInput onChangeHandler={onChangeHandler} isError={!!error} heading='' />
          </div>
        )}

        {error && (
          <Text size='sm' color='text-red-300 mt-[16px]' data-testing-id='error-text-ele'>
            {error}
          </Text>
        )}

        <div className='w-[376px] h-auto rounded-xl dark:bg-gray-900 bg-white-100 flex items-center px-5 py-3 my-7'>
          <img className='mr-[16px]' src={Images.Misc.Warning} width='40' height='40' />
          <div className='flex flex-col gap-y-[2px]'>
            <Text size='sm' color='text-gray-400 font-medium'>
              Recommended security practice:
            </Text>
            <Text size='sm' color='text-gray-400 dark:text-white-100 font-bold'>
              {`It is always safer to type the ${
                isPrivateKey ? 'private key' : 'recovery phrase'
              } rather than pasting it.`}
            </Text>
          </div>
        </div>

        <Buttons.Generic
          disabled={!!error || !secret}
          color={Colors.cosmosPrimary}
          onClick={handleImportWalletClick}
          data-testing-id='btn-import-wallet'
        >
          Import Wallet
        </Buttons.Generic>
      </div>
      <div>
        <div className='shrink flex-col gap-y-[4px] w-[408px] p-[32px] rounded-lg border-[1px] border-gray-800'>
          <AdditionalInfo
            heading={`What is a ${isPrivateKey ? 'private key' : 'recovery phrase'}?`}
            description={`${
              isPrivateKey
                ? 'A private key is like a password — a string of letters and numbers — '
                : 'Recovery phrase is a 12 or 24-word phrase'
            } that can be used to restore your wallet.`}
            descriptionClassName='mb-[32px]'
          />

          {walletName && !isPrivateKey && (
            <OnlySeedPhraseAdditionalInfo walletName={walletName} isCosmostation={isCosmostation} />
          )}

          <AdditionalInfo
            heading={`Is it safe to enter it into ${isCompassWallet() ? 'Compass' : 'Leap'}?`}
            description='Yes. It will be stored locally and never leave your device without your explicit permission.'
          />
        </div>
      </div>
    </div>
  )
}
