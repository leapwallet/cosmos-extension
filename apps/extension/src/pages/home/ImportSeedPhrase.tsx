import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons, Header, HeaderActionType } from '@leapwallet/leap-ui'
import Text from 'components/text'
import { usePassword } from 'hooks/settings/usePassword'
import { Wallet } from 'hooks/wallet/useWallet'
import React, { useState } from 'react'
import { Colors } from 'theme/colors'
import { validateSeedPhrase } from 'utils/validateSeedPhrase'

import useImportWallet = Wallet.useImportWallet
import { LoaderAnimation } from 'components/loader/Loader'
import { SeedPhraseInput } from 'components/seed-phrase-input'
import { Images } from 'images'

type ImportSeedPhraseProps = {
  isVisible: boolean
  // eslint-disable-next-line no-unused-vars
  onClose: (closeParent: boolean) => void
}

export function ImportSeedPhrase({ isVisible, onClose }: ImportSeedPhraseProps) {
  const password = usePassword()
  const activeChain = useActiveChain()
  const [secret, setSecret] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const importWallet = useImportWallet()

  const onChangeHandler = (value: string) => {
    setError('')
    setSecret(value)
  }

  const handleImportWallet = async () => {
    setError('')
    setIsLoading(true)

    if (
      secret &&
      password &&
      validateSeedPhrase({ phrase: secret, isPrivateKey: false, setError, setSecret })
    ) {
      try {
        await importWallet({ privateKey: secret, type: 'import', addressIndex: '0', password })
        setSecret('')
        onClose(true)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        setError(error.message)
      }
    }

    setIsLoading(false)
  }

  if (!isVisible) return null
  return (
    <div className='h-[600px] overflow-scroll bg-white-100 dark:bg-black-100 absolute top-0 z-10'>
      <Header
        topColor={Colors.getChainColor(activeChain)}
        title='Import Wallet'
        action={{
          type: HeaderActionType.BACK,
          onClick: () => {
            onClose(false)
            setError('')
          },
        }}
      />
      <div className='flex flex-col gap-y-4 justify-between min-h-[530px] items-center p-[28px] pt-[10px]'>
        <SeedPhraseInput
          onChangeHandler={onChangeHandler}
          isError={!!error}
          heading='To import an existing wallet, please enter the recovery phrase here:'
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
              <Text size='sm' className='tex font-black font-bold'>
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
    </div>
  )
}
