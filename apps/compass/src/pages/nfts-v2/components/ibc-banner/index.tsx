import {
  useActiveChain,
  useAddCustomChannel,
  useChainsStore,
  useCustomChannels,
  useDefaultChannelId,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import classNames from 'classnames'
import { ActionInputWithPreview } from 'components/action-input-with-preview'
import Tooltip from 'components/better-tooltip'
import BottomModal from 'components/bottom-modal'
import DisclosureContainer from 'components/disclosure-container'
import { LoaderAnimation } from 'components/loader/Loader'
import RadioGroup from 'components/radio-group'
import Text from 'components/text'
import { Images } from 'images'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Colors } from 'theme/colors'

type AddIBCChannelProps = {
  targetChain: string
  // eslint-disable-next-line no-unused-vars
  onAddComplete: (value: string) => void
}

const AddIBCChannel: React.FC<AddIBCChannelProps> = ({ targetChain, onAddComplete }) => {
  const [value, setValue] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')

  const addCustomChannel = useAddCustomChannel({
    targetChain,
  })
  const activeChain = useActiveChain()

  const { chains } = useChainsStore()
  const activeChainInfo = chains[activeChain]

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
      <ActionInputWithPreview
        action={status === 'error' ? 'Clear' : 'Save'}
        buttonText={status === 'error' ? 'Clear' : 'Save'}
        buttonTextColor={Colors.getChainColor(activeChain)}
        rightElement={status === 'loading' ? <LoaderAnimation color='white' /> : null}
        value={value}
        invalid={status === 'error'}
        placeholder='Enter source channel ID'
        onAction={(_, action, value) => {
          if (action === 'Clear') {
            setValue('')
            setStatus('idle')
            setMessage('')
          } else {
            handleAddChannel(value)
          }
        }}
        onChange={(e) => {
          setValue(e.target.value)
          if (status === 'error') {
            setStatus('idle')
            setMessage('')
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleAddChannel(value)
          }
        }}
      />
      <p className='text-xs mt-2 dark:text-gray-300 text-gray-700'>
        You can enter{' '}
        <strong>
          <em>24</em>
        </strong>{' '}
        for channel-24 on {activeChainInfo.chainName}
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

type IBCSettingsProps = {
  className?: string
  targetChain: SupportedChain
  // eslint-disable-next-line no-unused-vars
  onSelectChannel: (channelId: string | undefined) => void
}

export const IBCSettings: React.FC<IBCSettingsProps> = ({
  className,
  targetChain,
  onSelectChannel,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  // this will be null when data is loading
  const [defaultChannelId, setDefaultChannelId] = useState<string | undefined | null>(null)
  const [customChannelId, setCustomChannelId] = useState('')

  const { chains } = useChainsStore()
  const sourceChain = useActiveChain()

  const sourceChainInfo = chains[sourceChain]
  const targetChainInfo = chains[targetChain]

  const customChannels = useCustomChannels()

  const { data, status } = useDefaultChannelId(sourceChain, targetChain)

  useEffect(() => {
    if (status === 'success') {
      setDefaultChannelId(data)
    } else if (status === 'error') {
      setDefaultChannelId(undefined)
    }
  }, [data, status])

  const handleClick = useCallback(() => {
    setIsSettingsOpen((prev) => !prev)
  }, [setIsSettingsOpen])

  const handleSelectChannel = useCallback(
    (value: string) => {
      setCustomChannelId(value)
      if (value === defaultChannelId && defaultChannelId !== undefined) {
        onSelectChannel(undefined)
      } else {
        onSelectChannel(value)
      }
    },
    [defaultChannelId, onSelectChannel],
  )

  useEffect(() => {
    if (defaultChannelId) {
      handleSelectChannel(defaultChannelId)
    }
  }, [defaultChannelId, handleSelectChannel])

  const customChannelsForTargetChain = useMemo(
    () =>
      customChannels
        .filter(({ counterPartyChain }) => counterPartyChain === targetChain)
        .map(({ channelId }) => ({
          title: channelId,
          subTitle: 'Custom channel',
          value: channelId,
        }))
        .sort((a, b) => a.title.localeCompare(b.title)),
    [customChannels, targetChain],
  )

  const allOptions = useMemo(() => {
    if (!defaultChannelId) {
      return customChannelsForTargetChain
    }
    return [
      {
        title: defaultChannelId,
        subTitle: 'Default channel',
        value: defaultChannelId,
      },
      ...customChannelsForTargetChain,
    ]
  }, [customChannelsForTargetChain, defaultChannelId])

  return (
    <>
      <div
        className={classNames(
          'bg-purple-800 flex justify-center items-center w-full px-4 py-2',
          className,
        )}
      >
        <img src={Images.Misc.IBC} />
        <div className='flex justify-between items-center'>
          <Text size='sm' color='text-gray-100 ml-2'>
            This is an IBC transfer{' '}
            {!!customChannelId && customChannelId !== defaultChannelId ? (
              <>&middot; {customChannelId} </>
            ) : null}
          </Text>
        </div>
        <button className='ml-auto' onClick={handleClick}>
          <img src={Images.Misc.Settings} />
        </button>
      </div>
      <BottomModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title='Advanced IBC Settings'
      >
        <div className='px-4 py-3 rounded-2xl bg-white-100 dark:bg-gray-900 justify-center items-center'>
          <Text size='sm' className='text-gray-900 dark:text-gray-50 capitalize'>
            {sourceChainInfo.chainName} to {targetChainInfo.chainName} channels
          </Text>
          {defaultChannelId === null ? (
            <div className='flex justify-center items-center my-3'>
              <LoaderAnimation color='white' />
            </div>
          ) : allOptions.length > 0 ? (
            <RadioGroup
              className='mt-2 mb-4'
              themeColor={Colors.getChainColor(sourceChain)}
              options={allOptions}
              onChange={handleSelectChannel}
              selectedOption={customChannelId}
            />
          ) : (
            <div className='flex items-center justify-center my-4'>
              <p className='text-gray-400 text-sm font-medium'>
                No IBC channels found, you can add a custom channel below.
              </p>
            </div>
          )}
          <div className='flex items-center'>
            <Text size='xs' className='text-gray-700 dark:text-gray-300 capitalize'>
              Need Help?
            </Text>
            <Tooltip
              content={
                <p className='text-gray-500 dark:text-gray-100 text-sm'>
                  ID of the channel that will relay your tokens from {sourceChainInfo.chainName} to{' '}
                  {targetChainInfo.chainName}.
                </p>
              }
            >
              <div className='relative ml-2 flex items-center justify-center'>
                <img src={Images.Misc.InfoCircle} alt='Hint' />
              </div>
            </Tooltip>
          </div>
        </div>
        <DisclosureContainer
          title='Add Custom Channel'
          className='mt-4'
          initialOpen={allOptions.length === 0}
          leftIcon={Images.Misc.AddCircle}
        >
          <AddIBCChannel targetChain={targetChain} onAddComplete={handleSelectChannel} />
        </DisclosureContainer>
      </BottomModal>
    </>
  )
}

export const IBCBanner: React.FC<{
  className?: string
  channelId?: string
}> = ({ className, channelId }) => {
  return (
    <div
      className={classNames(
        'bg-purple-800 flex justify-center items-center w-full px-4 py-2',
        className,
      )}
    >
      <img src={Images.Misc.IBC} />
      <Text size='sm' color='text-gray-100 ml-2'>
        This is an IBC transfer {channelId === undefined ? null : <>&middot; {channelId}</>}
      </Text>
    </div>
  )
}
