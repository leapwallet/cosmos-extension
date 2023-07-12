import { Buttons, HeaderActionType, TextArea } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import React, { useState } from 'react'

import BottomSheet from '~/components/bottom-sheet'
import Text from '~/components/text'
import { useActiveChain } from '~/hooks/settings/use-active-chain'
import { Colors } from '~/theme/colors'

type ImportWalletFormProps = {
  isVisible: boolean
  onClose: (closeParent: boolean) => void
}

export default function ImportWalletForm({ isVisible, onClose }: ImportWalletFormProps) {
  const [privateKey, setPrivateKey] = useState('')
  const [error] = useState<string>('')
  const activeChain = useActiveChain()

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={() => onClose(false)}
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
            'border-solid border-2 bg-white-100 dark:bg-gray-900 text text-black-100 dark:text-white-100 p-4 text-center items-center justify-center rounded-lg w-[344px] h-[176px] resize-none',
            {
              'border-red-300': !!error,
              'dark:border-gray-400 border-gray-200 focus:border-gray-400': !error,
            },
          )}
          placeholder='Enter / Paste Secret recovery phrase or Private Key'
          isErrorHighlighted={!!error}
          textMsg={error}
        />
        <div className='flex shrink w-[344px]'>
          <Buttons.Generic
            disabled={!privateKey}
            onClick={console.log}
            color={Colors.getChainColor(activeChain)}
          >
            Import wallet
          </Buttons.Generic>
        </div>
      </div>
    </BottomSheet>
  )
}
