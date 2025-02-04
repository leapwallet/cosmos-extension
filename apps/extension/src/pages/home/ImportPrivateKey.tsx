/* eslint-disable @typescript-eslint/no-explicit-any */
import { useActiveChain, useIsSeiEvmChain } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons, TextArea } from '@leapwallet/leap-ui'
import { captureException } from '@sentry/react'
import classNames from 'classnames'
import BottomModal from 'components/bottom-modal'
import InfoSheet from 'components/Infosheet'
import { LoaderAnimation } from 'components/loader/Loader'
import Text from 'components/text'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import { passwordStore } from 'stores/password-store'
import { Colors } from 'theme/colors'
import { isCompassWallet } from 'utils/isCompassWallet'
import { validateSeedPhrase } from 'utils/validateSeedPhrase'

import { Wallet } from '../../hooks/wallet/useWallet'

type ImportPrivateKeyProps = {
  isVisible: boolean
  onClose: (closeParent: boolean) => void
}

export const ImportPrivateKey = observer(({ isVisible, onClose }: ImportPrivateKeyProps) => {
  const [privateKey, setPrivateKey] = useState('')
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const activeChain = useActiveChain()
  const { activeWallet } = useActiveWallet()
  const importWallet = Wallet.useImportWallet()
  const updateWatchWalletSeed = Wallet.useUpdateWatchWalletSeed()

  const [viewInfoSheet, setViewInfoSheet] = useState(false)
  const isSeiEvmChain = useIsSeiEvmChain()
  const onChangeHandler = (value: string) => {
    setError('')
    setPrivateKey(value)
  }

  const handleImportWallet = async () => {
    setError('')
    setIsLoading(true)

    if (
      privateKey &&
      passwordStore.password &&
      validateSeedPhrase({
        phrase: privateKey,
        isPrivateKey: true,
        setError,
        setSecret: setPrivateKey,
      })
    ) {
      try {
        if (activeWallet?.watchWallet) {
          await updateWatchWalletSeed(privateKey)
        } else {
          await importWallet({
            privateKey,
            type: 'import',
            addressIndex: '0',
            password: passwordStore.password,
          })
        }
        setPrivateKey('')
        onClose(true)
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Something went wrong'
        captureException(errorMessage)
        setError(errorMessage)
      }
    }

    setIsLoading(false)
  }

  return (
    <BottomModal
      isOpen={isVisible}
      onClose={() => {
        onClose(false)
        setError('')
      }}
      title={'Import Wallet'}
      closeOnBackdropClick={true}
    >
      <>
        {isSeiEvmChain ? (
          <button
            className='absolute top-5 left-5 w-[32px] cursor-pointer z-10'
            onClick={() => setViewInfoSheet(true)}
          >
            <img className='w-full' src={Images.Misc.HelpOutline} alt='help' />
          </button>
        ) : null}

        <div className='flex flex-col gap-y-4 items-cente justify-center'>
          <Text size='sm' color='text-center text-gray-600 dark:text-gray-600'>
            {isCompassWallet()
              ? `Use private key to import your MetaMask wallet to generate the same EVM address as on
            MetaMask.`
              : `To import an existing wallet, please enter the private key here.`}
          </Text>
          <TextArea
            onChange={(e) => onChangeHandler(e.target.value)}
            className={classNames(
              'border-solid border-2 bg-white-100 dark:bg-gray-900 text text-black-100 dark:text-white-100 p-4 text-center items-center justify-center rounded-lg w-[344px] h-[176px] resize-none focus:outline-none',
              {
                'border-red-300': !!error,
                'dark:border-gray-400 border-gray-200 focus:border-gray-400': !error,
              },
            )}
            placeholder='Enter private key'
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
              <Text size='sm' className='tex font-bold'>
                Recommended security practice:
              </Text>
              <Text size='xs' color='text-gray-400'>
                It is always safer to type the private key rather than pasting it.
              </Text>
            </div>
          </div>

          <Buttons.Generic
            size='normal'
            disabled={!privateKey || !!error || isLoading}
            onClick={handleImportWallet}
            color={Colors.getChainColor(activeChain)}
            className='w-[344px]'
          >
            {isLoading ? <LoaderAnimation color={Colors.white100} /> : 'Import Wallet'}
          </Buttons.Generic>
        </div>

        {isSeiEvmChain ? (
          <InfoSheet
            isVisible={viewInfoSheet}
            setVisible={setViewInfoSheet}
            title='FAQ'
            heading='Use private key for importing via MetaMask'
            desc='Using private key to import your MetaMask wallet will generate the same 0x address as on MetaMask.'
          />
        ) : null}
      </>
    </BottomModal>
  )
})
