import { useDebounce } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/browser/constants'
import { ActionInputWithPreview } from 'components/action-input-with-preview'
import Tooltip from 'components/better-tooltip'
import { Images } from 'images'
import React, { useEffect, useState } from 'react'
import { Colors } from 'theme/colors'

export const MemoInput: React.FC<{
  memo: string
  // eslint-disable-next-line no-unused-vars
  setMemo: (memo: string) => void
  disabled: boolean
  activeChain: SupportedChain
}> = ({ memo, setMemo, disabled, activeChain }) => {
  const [input, setInput] = useState<string>(memo)

  const debouncedInputValue = useDebounce(input, 200)

  useEffect(() => {
    if (debouncedInputValue !== memo) {
      setMemo(debouncedInputValue)
    }
  }, [debouncedInputValue, memo, setMemo])

  return (
    <div className='rounded-2xl p-4 mt-3 dark:bg-gray-900 bg-white-100 space-y-2'>
      <div className='flex items-center'>
        <p className='text-gray-500 dark:text-gray-100 text-sm font-medium tracking-wide'>Memo</p>
        <Tooltip
          content={
            <p className='text-gray-500 dark:text-gray-100 text-sm'>
              An optional short message that can be attached to a transaction, can be viewed by
              anyone.
            </p>
          }
        >
          <div className='relative ml-2'>
            <img src={Images.Misc.InfoCircle} alt='Hint' />
          </div>
        </Tooltip>
      </div>
      <ActionInputWithPreview
        disabled={disabled}
        buttonText={(() => {
          if (input.trim().length > 0) {
            return 'Clear'
          }
          return ''
        })()}
        rightElement={input.trim().length > 0 ? undefined : ' '}
        buttonTextColor={Colors.getChainColor(activeChain)}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onAction={(_, action) => {
          if (action === 'clear') {
            setInput('')
            setMemo('')
          }
        }}
        action={(() => {
          if (input.trim().length > 0) {
            return 'clear'
          }
          return 'save'
        })()}
      />
      <p className='text-gray-700 dark:text-gray-100 text-xs text-left mt-1'>
        {disabled ? 'The dApp has set the memo, you cannot change it' : 'Edit the memo here'}
      </p>
    </div>
  )
}
