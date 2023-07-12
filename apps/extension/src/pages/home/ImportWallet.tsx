/* eslint-disable @typescript-eslint/no-explicit-any */
import { Buttons, HeaderActionType, TextArea } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import { LoaderAnimation } from 'components/loader/Loader'
import Text from 'components/text'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { usePassword } from 'hooks/settings/usePassword'
import { Images } from 'images'
import React, { ClipboardEvent, useState } from 'react'
import { Colors } from 'theme/colors'

import BottomSheet from '../../components/bottom-sheet/BottomSheet'
import { Wallet } from '../../hooks/wallet/useWallet'
import useImportWallet = Wallet.useImportWallet

type ImportWalletFormProps = {
  isVisible: boolean
  onClose: (closeParent: boolean) => void
}

export default function ImportWalletForm({ isVisible, onClose }: ImportWalletFormProps) {
  const [privateKey, setPrivateKey] = useState('')
  const [error, setError] = useState<string>('')
  const [isLoading, setLoading] = useState<boolean>(false)
  const activeChain = useActiveChain()
  const importWallet = useImportWallet()
  const password = usePassword()

  const handleImportWallet = async () => {
    setError('')
    setLoading(true)
    if (privateKey && password) {
      try {
        await importWallet({ privateKey, type: 'import', addressIndex: '0', password })
        setPrivateKey('')
        onClose(true)
      } catch (error: any) {
        setError(error.message)
      }
    } else {
      setError('Wrong recovery phrase. Please try again.')
    }
    setLoading(false)
  }

  /**
   * Paste event handler to prevent pasting content and to show error message
   * @param e {ClipboardEvent}
   */
  const onPasteEvent = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    setError('Please type your recovery phrase')
    e.preventDefault()
  }

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={() => {
        onClose(false)
        setError('')
      }}
      headerTitle={'Import Wallet'}
      headerActionType={HeaderActionType.CANCEL}
      closeOnClickBackDrop={true}
    >
      <div className='flex flex-col p-[28px] gap-y-4 items-center text-center justify-center'>
        <Text size='sm' color='text-gray-600 dark:text-gray-600'>
          Enter the secret recovery phrase / private key below. This will import an existing wallet.
        </Text>
        <TextArea
          onChange={(e) => setPrivateKey(e.target.value)}
          className={classNames(
            'border-solid border-2 bg-white-100 dark:bg-gray-900 text text-black-100 dark:text-white-100 p-4 text-center items-center justify-center rounded-lg w-[344px] h-[176px] resize-none focus:outline-none',
            {
              'border-red-300': !!error,
              'dark:border-gray-400 border-gray-200 focus:border-gray-400': !error,
            },
          )}
          placeholder='Enter / Paste Secret recovery phrase or Private Key'
          isErrorHighlighted={!!error}
        />
        {error && (
          <Text size='sm' color='text-red-300 mx-5'>
            {error}
          </Text>
        )}
        <div className='w-full h-auto rounded-xl dark:bg-gray-900 bg-white-100 flex items-center p-[16px] pr-[21px]'>
          <img className='mr-[16px]' src={Images.Misc.Warning} />
          <div className='flex flex-col gap-y-[2px]'>
            <Text size='sm' className='tex font-black font-bold'>
              Recommended security practice:
            </Text>
            <Text size='xs' color='text-gray-400'>
              Type out seed phrase instead of pasting it
            </Text>
          </div>
        </div>
        <div className='flex shrink w-[344px]'>
          {isLoading ? (
            <LoaderAnimation color={Colors.white100} />
          ) : (
            <Buttons.Generic
              disabled={!privateKey}
              onClick={handleImportWallet}
              color={Colors.getChainColor(activeChain)}
            >
              Import wallet
            </Buttons.Generic>
          )}
        </div>
      </div>
    </BottomSheet>
  )
}
