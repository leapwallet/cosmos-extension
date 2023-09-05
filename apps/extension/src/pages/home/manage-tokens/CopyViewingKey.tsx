import { sliceWord, useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons } from '@leapwallet/leap-ui'
import Text from 'components/text'
import React from 'react'
import { Colors } from 'theme/colors'

export function CopyViewingKey(props: {
  generatedViewingKey: string
  onCopy: () => Promise<void>
}) {
  const activeChain = useActiveChain()

  return (
    <div>
      <div className='flex items-center justify-center bg-white-100 dark:bg-gray-900 p-3 rounded-2xl mb-2'>
        <span className='material-icons-round text-indigo-300 mr-3'>info</span>
        <Text size='md' className='font-bold text-center'>
          Note down the viewing key
        </Text>
      </div>
      <div className='flex items-center bg-white-100 dark:bg-gray-900 p-4 rounded-2xl justify-center'>
        <Text size='md' className='text-center font-bold'>
          {sliceWord(props.generatedViewingKey ?? '')}
        </Text>
      </div>

      <Buttons.CopyToClipboard color={Colors.getChainColor(activeChain)} onCopy={props.onCopy} />
    </div>
  )
}
