import { useActiveChain, useIsSeiEvmChain } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons, Header, HeaderActionType } from '@leapwallet/leap-ui'
import { captureException } from '@sentry/react'
import InfoSheet from 'components/Infosheet'
import { LoaderAnimation } from 'components/loader/Loader'
import { SeedPhraseInput } from 'components/seed-phrase-input'
import Text from 'components/text'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { passwordStore } from 'stores/password-store'
import { Colors } from 'theme/colors'
import { isCompassWallet } from 'utils/isCompassWallet'
import { validateSeedPhrase } from 'utils/validateSeedPhrase'

type ImportSeedPhraseProps = {
  isVisible: boolean
  onClose: (closeParent: boolean) => void
}

export const ImportSeedPhrase = observer(({ isVisible, onClose }: ImportSeedPhraseProps) => {
  const activeChain = useActiveChain()
  const [secret, setSecret] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { activeWallet } = useActiveWallet()
  const importWallet = Wallet.useImportWallet()
  const updateWatchWalletSeed = Wallet.useUpdateWatchWalletSeed()

  const [viewInfoSheet, setViewInfoSheet] = useState(false)
  const isSeiEvmChain = useIsSeiEvmChain()
  const onChangeHandler = (value: string) => {
    setError('')
    setSecret(value)
  }

  const handleImportWallet = async () => {
    setError('')
    setIsLoading(true)

    if (
      secret &&
      passwordStore.password &&
      validateSeedPhrase({ phrase: secret, isPrivateKey: false, setError, setSecret })
    ) {
      try {
        if (activeWallet?.watchWallet) {
          await updateWatchWalletSeed(secret)
        } else {
          await importWallet({
            privateKey: secret,
            type: 'import',
            addressIndex: '0',
            password: passwordStore.password,
          })
        }
        setSecret('')
        onClose(true)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Something went wrong'
        captureException(errorMessage)
        setError(errorMessage)
      }
    }

    setIsLoading(false)
  }

  if (!isVisible) return null
  return createPortal(
    <div className='panel-height panel-width enclosing-panel overflow-scroll bg-white-100 dark:bg-black-100 absolute top-0 z-[10000000]'>
      {isSeiEvmChain ? (
        <button
          className='absolute top-5 right-5 w-[32px] cursor-pointer z-10'
          onClick={() => setViewInfoSheet(true)}
        >
          <img className='w-full' src={Images.Misc.HelpOutline} alt='help' />
        </button>
      ) : null}

      <Header
        title='Import Wallet'
        action={{
          type: HeaderActionType.BACK,
          onClick: () => {
            onClose(false)
            setError('')
          },
        }}
      />
      <div className='flex flex-col gap-y-4 justify-between min-h-[calc(100%-70px)] items-center p-[28px] pt-[10px]'>
        <SeedPhraseInput
          onChangeHandler={onChangeHandler}
          isError={!!error}
          heading={
            isCompassWallet()
              ? 'Importing a recovery phrase from MetaMask might give a different address, use private key instead.'
              : 'To import an existing wallet, please enter the recovery phrase here'
          }
          onPage='SelectWallet'
        />
        {error && (
          <Text size='sm' color='text-red-300 mt-[16px]'>
            {error}
          </Text>
        )}

        <div className='flex gap-y-4 flex-col items-center'>
          <div className='w-full h-auto rounded-xl dark:bg-gray-900 bg-gray-50 flex items-center p-[16px] pr-[21px]'>
            <img className='mr-[16px]' src={Images.Misc.Warning} />
            <div className='flex flex-col gap-y-[2px]'>
              <Text size='sm' className='tex font-black'>
                Recommended security practice:
              </Text>
              <Text size='xs' color='text-gray-400'>
                It is always safer to type the recovery phrase rather than pasting it.
              </Text>
            </div>
          </div>

          <Buttons.Generic
            size='normal'
            disabled={!secret || !!error || isLoading}
            onClick={handleImportWallet}
            color={Colors.getChainColor(activeChain)}
            className='w-[344px]'
          >
            {isLoading ? <LoaderAnimation color={Colors.white100} /> : 'Import Wallet'}
          </Buttons.Generic>
        </div>
      </div>

      {isSeiEvmChain ? (
        <InfoSheet
          isVisible={viewInfoSheet}
          setVisible={setViewInfoSheet}
          title='FAQ'
          heading='Can I import my MetaMask recovery phrase here?'
          desc='Yes, you can but importing a recovery phrase from MetaMask might give a different address. Instead, import your private key.'
          className='!z-[20000000]'
        />
      ) : null}
    </div>,
    document.getElementById('popup-layout')?.parentNode as HTMLElement,
  )
})
