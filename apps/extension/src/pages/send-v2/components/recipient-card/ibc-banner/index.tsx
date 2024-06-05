import {
  useActiveChain,
  useAddCustomChannel,
  useChainsStore,
  useCustomChannels,
  useDefaultChannelId,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { SkipMsg, SkipMsgV2, UseRouteResponse, useTransactions } from '@leapwallet/elements-hooks'
import classNames from 'classnames'
import { ActionInputWithPreview } from 'components/action-input-with-preview'
import Tooltip from 'components/better-tooltip'
import BottomModal from 'components/bottom-modal'
import DisclosureContainer from 'components/disclosure-container'
import { LoaderAnimation } from 'components/loader/Loader'
import RadioGroup from 'components/radio-group'
import Text from 'components/text'
import { Images } from 'images'
import { useSendContext } from 'pages/send-v2/context'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Colors } from 'theme/colors'

import { SecondaryActionButton } from '../secondary-action-button'
import IbcUnwinding from './IbcUnwinding'

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

export const IBCSettings: React.FC<IBCSettingsProps> = ({ targetChain, onSelectChannel }) => {
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

  const { transferData, isIbcUnwindingDisabled, addressError } = useSendContext()

  const routeWithMessages = useMemo(
    () =>
      transferData?.isSkipTransfer && transferData?.routeResponse
        ? {
            ...transferData?.routeResponse,
            messages: transferData?.messages,
          }
        : {
            operations: [],
            messages: [],
            sourceAsset: { denom: null },
          },
    //@ts-ignore
    [transferData?.isSkipTransfer, transferData?.messages, transferData?.routeResponse],
  )

  const { groupedTransactions } = useTransactions(
    routeWithMessages as (UseRouteResponse & { messages?: SkipMsg[] | SkipMsgV2[] }) | null,
  )

  const path: string[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Object.values(groupedTransactions)?.forEach((d: any[], index1: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    d.forEach((f: any, index2: number) => {
      if (index1 == 0 && index2 == 0) {
        path.push(f.sourceChain)
      }
      path.push(f.destinationChain)
    })
  })

  const isIBCNotSupported =
    addressError?.includes('IBC transfers not supported between') || isIbcUnwindingDisabled
  const isIBCUnwindingCase = path?.length > 1 || isIBCNotSupported

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
      <SecondaryActionButton
        onClick={handleClick}
        actionLabel='Add Contact to Address Book'
        leftIcon={'settings'}
        className={'flex-row-reverse'}
      >
        <Text
          size='xs'
          className='text-black-100 dark:text-white-100 whitespace-nowrap ml-1 font-bold'
        >
          IBC
        </Text>
      </SecondaryActionButton>
      <BottomModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title='Advanced IBC Settings'
        closeOnBackdropClick={true}
      >
        {/* If skip unwinding is possible then showing the path */}
        {isIBCUnwindingCase ? <IbcUnwinding path={path} /> : null}

        {/* If skip unwinding is disabled or unwinding is not supported showing channel */}
        {!isIBCUnwindingCase || isIbcUnwindingDisabled ? (
          <>
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
                      ID of the channel that will relay your tokens from {sourceChainInfo.chainName}{' '}
                      to {targetChainInfo.chainName}.
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
          </>
        ) : null}
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
