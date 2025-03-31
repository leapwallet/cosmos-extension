import { ParsedMessage, ParsedMessageType } from '@leapwallet/parser-parfait'
import classNames from 'classnames'
import { RightArrow } from 'images/misc'
import React from 'react'

import { getMessageTitle, getSimpleType } from './message-details'

type MessageItemProps = {
  message: ParsedMessage
  messageNumber: number
  isLast: boolean
  onClick: () => void
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isLast, onClick }) => {
  const _title = getMessageTitle(message)

  const title =
    message.__type === ParsedMessageType.Unimplemented
      ? getSimpleType(
          message.message['@type'] ??
            message.message.type ??
            message.message.type_url ??
            message.message.typeUrl,
        )
      : _title

  return (
    <button
      className={`flex items-center justify-between dark:bg-gray-900 mt-2 bg-white-100 w-full cursor-pointer p-4 rounded-2xl ${
        !isLast ? 'border-b dark:border-gray-800 border-gray-100' : ''
      }`}
      onClick={onClick}
    >
      <div className='flex flex-col flex-1 max-w-[90%]'>
        <p className='font-bold dark:text-white-100 text-gray-900 text-sm text-left'>{title}</p>
      </div>
      <img src={RightArrow} alt='View Details' className='block flex-shrink-0 mr-2' />
    </button>
  )
}

type MessageListProps = {
  parsedMessages: ParsedMessage[]
  // eslint-disable-next-line no-unused-vars
  onMessageSelect: (message: ParsedMessage, index: number) => void
  className?: string
}

const MessageList: React.FC<MessageListProps> = ({
  parsedMessages,
  onMessageSelect,
  className,
}) => {
  return (
    <div className={classNames('', className)}>
      {parsedMessages.map((message, index) => {
        return (
          <MessageItem
            key={index}
            isLast={index === parsedMessages.length - 1}
            message={message}
            messageNumber={index + 1}
            onClick={() => {
              onMessageSelect(message, index)
            }}
          />
        )
      })}
    </div>
  )
}

export default MessageList
