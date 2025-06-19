import { useAddCustomChannel, useChainsStore } from '@leapwallet/cosmos-wallet-hooks'
import { useSendContext } from 'pages/send/context'
import React, { useCallback, useState } from 'react'

type AddIBCChannelProps = {
  targetChain: string
  // eslint-disable-next-line no-unused-vars
  onAddComplete: (value: string) => void
  value: string
  setValue: (value: string) => void
}

const AddIBCChannel: React.FC<AddIBCChannelProps> = ({
  targetChain,
  onAddComplete,
  value,
  setValue,
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')

  const { sendActiveChain } = useSendContext()
  const addCustomChannel = useAddCustomChannel({
    targetChain,
  })

  const { chains } = useChainsStore()
  const activeChainInfo = chains[sendActiveChain]

  const handleAddChannel = useCallback(
    async (channelId: string) => {
      setStatus('loading')
      try {
        const result = await addCustomChannel(channelId)
        if (result.success) {
          onAddComplete(result.channel)
          setValue('')
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
    [addCustomChannel, onAddComplete],
  )

  return (
    <>
      <input
        type='number'
        value={value}
        placeholder='Source channel ID'
        className='w-full h-12 rounded-2xl px-4 py-1 font-medium placeholder:text-gray-600 dark:placeholder:text-gray-400 placeholder:text-left text-right text-black-100 dark:text-white-100 outline-none border border-[transparent] focus-within:border-green-600 bg-gray-50 dark:bg-gray-900'
        onChange={(e) => {
          setValue(e.target.value)
          if (status === 'error') {
            setStatus('idle')
            setMessage('')
          }
        }}
        onKeyUp={() => handleAddChannel(value)}
      />
      <p className='text-xs mt-2 dark:text-gray-400 text-gray-600'>
        You can enter <span className='font-medium dark:text-gray-200 text-gray-800'>24</span> for{' '}
        <span className='font-medium dark:text-gray-200 text-gray-800'>channel-24</span> on{' '}
        {activeChainInfo.chainName}
      </p>
      {status === 'error' ? (
        <p className='text-xs mt-2 text-red-300 font-medium'>{message}</p>
      ) : null}
      {status === 'success' ? (
        <p className='text-xs mt-2 text-green-300 font-medium'>{message}</p>
      ) : null}
    </>
  )
}

export default AddIBCChannel
