import { useChainApis } from '@leapwallet/cosmos-wallet-hooks'
import { ParsedMessage, ParsedMessageType } from '@leapwallet/parser-parfait'
import React from 'react'
import Skeleton from 'react-loading-skeleton'

import { useMessageDetails } from './message-details'

type DetailItemProps = {
  message: ParsedMessage
}

const DetailItem: React.FC<DetailItemProps> = ({ message }) => {
  const { lcdUrl } = useChainApis()
  const { data, isLoading } = useMessageDetails(message, lcdUrl ?? '')

  return isLoading ? (
    <Skeleton />
  ) : (
    <li className='font-bold dark:text-white-100 text-gray-900 text-sm mt-1 list-none ml-0'>
      {data === 'unknown'
        ? message.__type === ParsedMessageType.Unimplemented
          ? ((typeUrl: string) => {
              const splitTypeUrl = typeUrl.split('.')
              const messageType = splitTypeUrl[splitTypeUrl.length - 1]
              return <span className='text-red-500'>{messageType}</span>
            })(message.message['@type'])
          : 'Unknown'
        : data}
    </li>
  )
}

type TransactionDetailsProps = {
  parsedMessages: ParsedMessage[] | null
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({ parsedMessages }) => {
  const noMessageIsParsed = parsedMessages === null || parsedMessages.length === 0
  const noMessageIsDecoded = noMessageIsParsed
    ? true
    : parsedMessages.every((msg) => msg.__type === ParsedMessageType.Unimplemented)

  return noMessageIsDecoded ? null : (
    <div
      className='rounded-2xl p-4 mt-3'
      style={{
        backgroundColor: 'rgba(58, 207, 146, 0.17)',
      }}
    >
      <p className='text-gray-500 dark:text-gray-100 text-sm font-medium tracking-wide'>
        Transaction Summary
      </p>
      <ul className='mt-2'>
        {parsedMessages?.map((msg, i) => <DetailItem key={i} message={msg} />) ??
          'No information available'}
      </ul>
    </div>
  )
}

export default TransactionDetails
