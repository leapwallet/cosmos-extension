import { sliceAddress, useChainApis } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { ParsedMessage, ParsedMessageType } from '@leapwallet/parser-parfait'
import React, { useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'

import { useMessageDetails } from './message-details'

type DetailItemProps = {
  message: ParsedMessage
  activeChain: SupportedChain
  selectedNetwork: 'mainnet' | 'testnet'
}

const DetailItem: React.FC<DetailItemProps> = ({ message, activeChain, selectedNetwork }) => {
  const { lcdUrl } = useChainApis(activeChain, selectedNetwork)
  const { data, isLoading } = useMessageDetails(message, lcdUrl ?? '', activeChain)

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
  activeChain: SupportedChain
  selectedNetwork: 'mainnet' | 'testnet'
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  parsedMessages,
  activeChain,
  selectedNetwork,
}) => {
  const noMessageIsParsed = parsedMessages === null || parsedMessages.length === 0
  const noMessageIsDecoded = noMessageIsParsed
    ? true
    : parsedMessages.every((msg) => msg.__type === ParsedMessageType.Unimplemented)

  const claimRewardsMessage = useMemo(() => {
    if (parsedMessages) {
      let message = ''
      let counter = 0

      for (const parsedMessage of parsedMessages) {
        if (parsedMessage.__type === ParsedMessageType.ClaimReward) {
          if (counter === 0) {
            message = `Claim staking reward from ${sliceAddress(parsedMessage.validatorAddress)}`
          }
          counter += 1
        }
      }

      if (counter > 1) {
        message += ` and +${counter - 1} more validator${counter - 1 === 1 ? '' : 's'}`
      }

      return message
    }

    return ''
  }, [parsedMessages])

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
        {claimRewardsMessage ? (
          <li className='font-bold dark:text-white-100 text-gray-900 text-sm mt-1 list-none ml-0'>
            {claimRewardsMessage}
          </li>
        ) : (
          parsedMessages?.map((msg, i) => (
            <DetailItem
              key={i}
              message={msg}
              activeChain={activeChain}
              selectedNetwork={selectedNetwork}
            />
          )) ?? 'No information available'
        )}
      </ul>
    </div>
  )
}

export default TransactionDetails
