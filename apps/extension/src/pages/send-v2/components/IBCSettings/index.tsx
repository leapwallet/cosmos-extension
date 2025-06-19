import {
  useChainsStore,
  useCustomChannels,
  useDefaultChannelId,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { SkipMsg, SkipMsgV2, UseRouteResponse, useTransactions } from '@leapwallet/elements-hooks'
import { Buttons } from '@leapwallet/leap-ui'
import { Info, MinusCircle, PlusCircle, Question, Warning } from '@phosphor-icons/react'
import classNames from 'classnames'
import Tooltip from 'components/better-tooltip'
import BottomModal from 'components/bottom-modal'
import { CustomCheckbox } from 'components/custom-checkbox'
import { LoaderAnimation } from 'components/loader/Loader'
import RadioGroup from 'components/radio-group'
import Text from 'components/text'
import { useSendContext } from 'pages/send-v2/context'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Colors } from 'theme/colors'

import AddIBCChannel from './AddIBCChannel'

type IBCSettingsProps = {
  className?: string
  targetChain: SupportedChain
  sourceChain: SupportedChain
}

const IBCSettings: React.FC<IBCSettingsProps> = ({ targetChain, sourceChain }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  // this will be null when data is loading
  const [defaultChannelId, setDefaultChannelId] = useState<string | undefined | null>(null)
  const [sendViaUnverifiedChannel, setSendViaUnverifiedChannel] = useState<boolean>(false)
  const [isAddChannel, setIsAddChannel] = useState<boolean>(false)
  const [customChannelId, setCustomChannelId] = useState<string>()

  const { chains } = useChainsStore()
  const sourceChainInfo = chains[sourceChain]
  const targetChainInfo = chains[targetChain]

  const customChannels = useCustomChannels()
  const { data, status } = useDefaultChannelId(sourceChain, targetChain)
  const { transferData, setIsIbcUnwindingDisabled, customIbcChannelId, setCustomIbcChannelId } =
    useSendContext()

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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
      if (value === customChannelId && customChannelId !== undefined) {
        setCustomChannelId(undefined)
      } else {
        setCustomChannelId(value)
      }
    },
    [customChannelId, setCustomChannelId],
  )

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
        subTitle: 'Prefetched from Cosmos directory registry',
        value: defaultChannelId,
      },
      ...customChannelsForTargetChain,
    ]
  }, [customChannelsForTargetChain, defaultChannelId])

  const hasChannelId = allOptions.length > 0

  const handleAddChannel = useCallback(() => {
    if (hasChannelId) {
      setIsAddChannel((prev) => !prev)
      setCustomChannelId(undefined)
    }
  }, [hasChannelId, setIsAddChannel])

  const onProceed = () => {
    setIsIbcUnwindingDisabled(true)
    setIsSettingsOpen(false)
    setCustomIbcChannelId(customChannelId)
  }

  return (
    <>
      <div
        className={classNames(
          'p-4 rounded-2xl bg-red-100 dark:bg-red-900 items-center flex gap-2',
          {
            'bg-orange-200 dark:bg-orange-900': customIbcChannelId,
          },
        )}
      >
        {customIbcChannelId ? (
          <Info
            size={16}
            className={classNames('text-[#FFB33D] dark:text-orange-300 self-start')}
          />
        ) : (
          <Warning size={16} className={classNames('text-red-400 dark:text-red-300 self-start')} />
        )}
        <div className='flex-1'>
          <Text size='xs' className='font-bold mb-2'>
            {customIbcChannelId ? 'Unverified Channel' : 'No verified routes available.'}
          </Text>
          <Text size='xs' color='text-gray-800 dark:text-gray-200' className='font-medium'>
            {customIbcChannelId
              ? customIbcChannelId
              : hasChannelId
              ? 'You can select channels from an unverified list to transfer.'
              : 'You can add a custom channel to transfer.'}
          </Text>
        </div>
        <button
          title={`${hasChannelId ? 'Select' : 'Add'} channel`}
          onClick={handleClick}
          className='text-xs font-bold text-black-100 bg-white-100 py-2 px-4 rounded-3xl'
        >
          {customIbcChannelId ? 'Edit selection' : hasChannelId ? 'Select channel' : 'Add channel'}
        </button>
      </div>
      <BottomModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title='Advanced IBC Settings'
        closeOnBackdropClick={true}
        containerClassName='!max-panel-height'
        contentClassName='!bg-white-100 dark:!bg-gray-950'
        className='p-6'
      >
        <div className='p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 justify-center items-center'>
          <div className='flex items-center mb-4 justify-between'>
            <div className='flex gap-2 items-center'>
              <Text className='font-bold'>Select channels</Text>
              <Tooltip
                content={
                  <p className='text-gray-500 dark:text-gray-100 text-sm'>
                    ID of the channel that will relay your tokens from {sourceChainInfo.chainName}{' '}
                    to {targetChainInfo?.chainName}.
                  </p>
                }
              >
                <div className='relative flex'>
                  <Question size={20} className='text-gray-600 dark:text-gray-400' />
                </div>
              </Tooltip>
            </div>
            <div
              className='bg-gray-100 dark:bg-gray-850 rounded-3xl px-[10px] py-1 flex gap-1 items-center cursor-pointer'
              onClick={handleAddChannel}
            >
              {!isAddChannel && hasChannelId ? (
                <PlusCircle
                  size={16}
                  weight='bold'
                  className='text-black-100 dark:text-white-100'
                />
              ) : (
                <MinusCircle
                  size={16}
                  weight='bold'
                  className='text-black-100 dark:text-white-100'
                />
              )}
              <Text size='xs' className='font-medium'>
                Add Channel
              </Text>
            </div>
          </div>

          <div className='bg-gray-100 dark:bg-gray-850 rounded-2xl p-4 gap-4'>
            {!isAddChannel && hasChannelId ? (
              <>
                <Text size='sm' className='text-gray-800 dark:text-gray-200 font-bold capitalize'>
                  {sourceChainInfo.chainName} to {targetChainInfo?.chainName} channels
                </Text>
                {defaultChannelId === null ? (
                  <div className='flex justify-center items-center my-3'>
                    <LoaderAnimation color='white' />
                  </div>
                ) : (
                  <RadioGroup
                    themeColor={Colors.green600}
                    options={allOptions}
                    onChange={handleSelectChannel}
                    selectedOption={customChannelId as string}
                  />
                )}
              </>
            ) : (
              <AddIBCChannel targetChain={targetChain} onAddComplete={handleSelectChannel} />
            )}
          </div>
        </div>

        <div className='p-4 rounded-2xl bg-red-100 dark:bg-red-900 my-4'>
          <div className='items-center flex gap-2'>
            <Warning
              size={24}
              weight='bold'
              className='text-red-400 dark:text-red-300 self-start'
            />
            <Text size='sm' className='font-bold mb-2'>
              Sending via unverified channel.
            </Text>
          </div>
          <div className='items-start flex gap-2'>
            <div className='ml-[1px]'>
              <CustomCheckbox
                checked={sendViaUnverifiedChannel}
                onClick={() => setSendViaUnverifiedChannel((prevValue) => !prevValue)}
              />
            </div>
            <Text size='xs' color='text-gray-800 dark:text-gray-200' className='font-medium'>
              Usability of tokens sent via unverified channels is not guaranteed. I understand and
              wish to proceed.
            </Text>
          </div>
        </div>

        <Buttons.Generic
          color={Colors.green600}
          size='normal'
          className='w-full'
          title='Proceed'
          disabled={!sendViaUnverifiedChannel || !customChannelId}
          onClick={onProceed}
        >
          Proceed
        </Buttons.Generic>
      </BottomModal>
    </>
  )
}

export default IBCSettings
