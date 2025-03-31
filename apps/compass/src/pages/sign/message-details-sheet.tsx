import { useChainApis } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/browser/constants'
import { ParsedMessage, ParsedMessageType } from '@leapwallet/parser-parfait'
import BottomModal from 'components/bottom-modal'
import DisclosureContainer from 'components/disclosure-container'
import { LoaderAnimation } from 'components/loader/Loader'
import React from 'react'

import { getSimpleType, useMessageDetails } from './message-details'

const MessageDetailsSheet: React.FC<{
  isOpen: boolean
  // eslint-disable-next-line no-unused-vars
  setIsOpen: (isOpen: boolean) => void
  onClose: () => void
  message: {
    index: number
    parsed: ParsedMessage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    raw: any
  } | null
  activeChain: SupportedChain
  selectedNetwork: 'mainnet' | 'testnet'
}> = ({ isOpen, setIsOpen, message, onClose, activeChain, selectedNetwork }) => {
  const { lcdUrl } = useChainApis(activeChain, selectedNetwork)
  const { isLoading, data } = useMessageDetails(message?.parsed, lcdUrl ?? '', activeChain)

  if (!message) return null

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false)
        onClose()
      }}
      title={`Message ${message.index + 1}`}
    >
      {!isLoading && data ? (
        <>
          <div className='w-full text-left dark:bg-gray-900 bg-white-100 p-4 rounded-2xl'>
            <p className='text-gray-500 dark:text-gray-100 text-sm font-medium tracking-wide'>
              Description
            </p>
            <p className='dark:text-white-100 text-gray-900 text-sm mt-1 font-bold'>
              {data === 'unknown' ? (
                message.parsed.__type === ParsedMessageType.Unimplemented ? (
                  <span className='text-red-500'>
                    {getSimpleType(
                      message.parsed.message['@type'] ??
                        message.parsed.message.type ??
                        message.parsed.message.type_url ??
                        message.parsed.message.typeUrl,
                    )}
                  </span>
                ) : (
                  'Unknown'
                )
              ) : (
                data
              )}
            </p>
          </div>
          <DisclosureContainer
            title='Message Data'
            className='overflow-x-auto mt-4 p-0'
            initialOpen={true}
          >
            <pre className='text-xs text-gray-900 dark:text-white-100 w-full overflow-x-auto'>
              {JSON.stringify(
                message.raw,
                (key, value) => {
                  if (typeof value === 'bigint') {
                    return value.toString()
                  }
                  return value
                },
                2,
              )}
            </pre>
          </DisclosureContainer>
        </>
      ) : (
        <div className='h-32 flex flex-col items-center justify-center'>
          <LoaderAnimation color='white' />
          <p className='text-gray-900 dark:text-white-100 text-xs mt-2'>Loading message details</p>
        </div>
      )}
    </BottomModal>
  )
}

export default MessageDetailsSheet
