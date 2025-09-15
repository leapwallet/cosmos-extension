import { useChainsStore } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import classNames from 'classnames'
import { CtaInput } from 'components/cta-input'
import { useSendContext } from 'pages/send/context'
import React, { CSSProperties, useCallback, useEffect, useState } from 'react'
import { ibcDataStore } from 'stores/chains-api-store'

type RadioGroupProps = {
  options: { title: string; subTitle?: string; value: string }[]
  selectedOption: string
  // eslint-disable-next-line no-unused-vars
  onChange: (value: string) => void
  className?: string
  themeColor?: CSSProperties['color']
  isAddChannel?: boolean
  targetChain: SupportedChain
  hasChannelId: boolean
}

const RadioGroupSend: React.FC<RadioGroupProps> = ({
  options,
  selectedOption,
  onChange,
  className,
  isAddChannel,
  hasChannelId,
  targetChain,
  themeColor,
}) => {
  const [value, setValue] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')
  const isCustomSelected = value !== '' && status === 'success'

  const { sendActiveChain } = useSendContext()

  const { chains } = useChainsStore()
  const activeChainInfo = chains[sendActiveChain]

  const handleAddChannel = useCallback(
    async (channelId: string) => {
      setStatus('loading')
      try {
        const result = await ibcDataStore.addCustomChannel(sendActiveChain, targetChain, channelId)
        if (result.success) {
          onChange(result.channel)
          setStatus('success')
          setMessage(result.message)
        } else {
          setStatus('error')
          setMessage(result.message)
        }
      } catch (e) {
        setStatus('error')
        setMessage('Something went wrong')
      }
    },
    [onChange, sendActiveChain, targetChain],
  )

  useEffect(() => {
    if (value) {
      handleAddChannel(value)
    } else {
      setStatus('idle')
      setMessage('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <fieldset className={classNames('flex flex-col', className)}>
      {options.map((option) => {
        const isSelected = selectedOption === option.value

        return (
          <label
            key={option.value}
            className={`inline-flex items-center  ${
              option.subTitle ? 'py-2 last-of-type:pb-0' : 'py-3 last-of-type:pb-0'
            }`}
          >
            <input
              type='radio'
              value={option.value}
              checked={isSelected}
              readOnly
              className='hidden'
            />
            <div
              aria-label='radio-button'
              className={classNames(
                'w-5 h-5 rounded-full border-[2px] flex items-center justify-center cursor-pointer border-gray-300 transition-all',
                {
                  'shadow-sm': isSelected,
                },
              )}
              style={{
                borderColor: isSelected ? themeColor : undefined,
              }}
              tabIndex={0}
              onClick={() => {
                onChange(option.value)
                setValue('')
              }}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !isSelected) {
                  onChange(option.value)
                }
              }}
            >
              <div
                className='w-[10px] h-[10px] rounded-full bg-gray-300 transition-all'
                style={{
                  backgroundColor: isSelected ? themeColor : undefined,
                  opacity: isSelected ? 1 : 0,
                }}
              />
            </div>
            <div className='flex flex-col ml-3'>
              <p className='text-foreground font-medium text-sm'>{option.title}</p>
              {option.subTitle ? (
                <p className='text-muted-foreground text-xs'>{option.subTitle}</p>
              ) : null}
            </div>
          </label>
        )
      })}
      {(isAddChannel || !hasChannelId) && (
        <label className={`inline-flex items-center py-1`}>
          <div className='flex flex-col w-full'>
            <div className='flex w-full items-center gap-3'>
              <input
                type='radio'
                value={value}
                checked={isCustomSelected}
                readOnly
                className='hidden'
              />
              <div
                aria-label='radio-button'
                className={classNames(
                  'w-5 h-5 rounded-full border-[2px] flex items-center justify-center cursor-pointer border-gray-300 transition-all',
                  {
                    'shadow-sm': isCustomSelected,
                  },
                )}
                style={{
                  borderColor: isCustomSelected ? themeColor : undefined,
                }}
                tabIndex={0}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !value) {
                    setValue(value)
                  }
                }}
              >
                <div
                  className='w-[10px] h-[10px] rounded-full bg-gray-300 transition-all'
                  style={{
                    backgroundColor: isCustomSelected ? themeColor : undefined,
                    opacity: isCustomSelected ? 1 : 0,
                  }}
                />
              </div>
              <CtaInput
                value={value}
                onChange={(e) => {
                  setValue(e.target.value)
                  if (status === 'error') {
                    setStatus('idle')
                    setMessage('')
                  }
                }}
                type='number'
                onClear={() => setValue('')}
                placeholder='Enter source channel ID'
                divClassName='rounded-2xl flex-grow flex items-center gap-[10px] bg-gray-50 dark:bg-gray-900 py-3 pr-3 pl-4 dark:focus-within:border-white-100 hover:border-secondary-400 focus-within:border-black-100 border border-transparent'
                inputClassName='flex flex-grow text-base text-gray-400 outline-none bg-white-0 font-bold dark:text-white-100 text-md placeholder:font-medium dark:placeholder:text-gray-400  !leading-[21px]'
              />
            </div>
            <p className='text-xs mt-2 dark:text-gray-400 text-gray-600'>
              You can enter <span className='font-medium dark:text-gray-200 text-gray-800'>24</span>{' '}
              for <span className='font-medium dark:text-gray-200 text-gray-800'>channel-24</span>{' '}
              on {activeChainInfo.chainName}
            </p>
            {status === 'error' ? (
              <p className='text-xs mt-2 text-red-300 font-medium'>{message}</p>
            ) : null}
            {status === 'success' ? (
              <p className='text-xs mt-2 text-green-300 font-medium'>{message}</p>
            ) : null}
          </div>
        </label>
      )}
    </fieldset>
  )
}

export default RadioGroupSend
