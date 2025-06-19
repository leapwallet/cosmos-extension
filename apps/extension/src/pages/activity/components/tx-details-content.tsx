import { useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Avatar } from '@leapwallet/leap-ui'
import { parfait, ParsedMessage } from '@leapwallet/parser-parfait'
import dayjs from 'dayjs'
import { useActivityImage } from 'hooks/activity/useActivityImage'
import { DollarIcon } from 'icons/dollar-icon'
import { Images } from 'images'
import React, { useMemo } from 'react'
import { UserClipboard } from 'utils/clipboard'
import { cn } from 'utils/cn'
import { formatTokenAmount, sliceAddress } from 'utils/strings'

import { SelectedTx } from './ChainActivity'
import { CopyButton } from './copy-button'
import { DetailsCard } from './tx-detail-card'

const getActivityIconAndTitle = (
  activeChain: SupportedChain,
): Record<string, { icon: string; title: string }> => {
  return {
    send: { icon: Images.Activity.SendIcon, title: 'Sent' },
    receive: { icon: Images.Activity.ReceiveIcon, title: 'Received' },
    pending: { icon: Images.Activity.PendingDetails, title: 'Pending' },
    delegate: { icon: Images.Activity.Delegate, title: 'Delegated' },
    undelegate: { icon: Images.Activity.Undelegate, title: 'Undelegated' },
    'ibc/transfer': { icon: Images.Activity.SwapIcon, title: 'IBC Transfer' },
    vote: { icon: Images.Activity.TxHash, title: 'Voted' },
    swap: {
      icon: Images.Logos.ChainLogos[activeChain] ?? Images.Activity.SendDetails,
      title: 'Swap',
    },
    fallback: { icon: Images.Activity.SendIcon, title: 'Success' },
    secretTokenTransfer: { icon: Images.Activity.SendDetails, title: 'Sent' },
    'liquidity/add': {
      icon: Images.Activity.Delegate,
      title: 'Add Liquidity',
    },
    'liquidity/remove': {
      icon: Images.Activity.Undelegate,
      title: 'Remove Liquidity',
    },
  }
}

export const TxDetailsContent = ({
  tx,
  contact,
  activeChain,
  txnMessage,
}: {
  tx: SelectedTx
  contact: { name: string; emoji: number }
  activeChain: SupportedChain
  txnMessage?: ParsedMessage
}) => {
  const chainInfos = useGetChains()
  const chainInfo = chainInfos[activeChain]

  const isSimpleTokenTransfer =
    tx?.content?.txType === 'send' ||
    tx?.content?.txType === 'receive' ||
    tx?.content?.txType === 'ibc/transfer'

  const isTxSuccessful = tx?.parsedTx?.code === 0

  const {
    sentAmount,
    sentTokenInfo,
    receivedAmount,
    receivedTokenInfo,
    sentUsdValue,
    receivedUsdValue,
    txType,
  } = tx?.content ?? {}

  const defaultImg = useActivityImage(txType ?? 'fallback', activeChain)
  const iconAndTitle = getActivityIconAndTitle(activeChain)

  const { icon, title } = iconAndTitle[txType ?? ''] || iconAndTitle.fallback
  const date = useMemo(() => dayjs(tx?.parsedTx?.timestamp).format('D MMMM YYYY h:mm A'), [tx])

  const sentAmountInfo =
    sentAmount && sentTokenInfo?.coinDenom
      ? formatTokenAmount(sentAmount, sentTokenInfo.coinDenom)
      : undefined
  const receivedAmountInfo =
    receivedAmount && receivedTokenInfo?.coinDenom
      ? formatTokenAmount(receivedAmount, receivedTokenInfo.coinDenom)
      : undefined

  return (
    <div className='flex flex-col gap-4'>
      <div className='w-full flex flex-col items-center shrink-0 gap-3 mb-4'>
        <img src={isTxSuccessful ? icon : Images.Activity.Error} className='size-[4.5rem]' />

        {/** Title */}
        <span className='font-bold text-2xl mt-4'>
          {tx?.content?.txType === 'vote' ? tx?.content?.title1 : isTxSuccessful ? title : 'Fail'}
        </span>

        {/** Date */}
        <span className='text-sm font-medium text-muted-foreground'>{date}</span>
      </div>

      {/* Amount info */}
      {sentAmountInfo || receivedAmountInfo ? (
        <DetailsCard
          title={tx?.content?.title1}
          imgSrc={chainInfo.chainSymbolImageUrl ?? defaultImg}
          subtitle={sentAmountInfo ?? receivedAmountInfo ?? ''}
          activeChain={activeChain}
          txType={tx?.content?.txType}
          trailing={
            <span
              className={cn('text-muted-foreground ml-auto font-medium', {
                'text-accent-success': receivedUsdValue,
                'text-destructive-100': sentUsdValue,
              })}
            >
              {sentUsdValue
                ? `- $${Number(sentUsdValue).toFixed(2)}`
                : receivedUsdValue
                ? `+ $${Number(receivedUsdValue).toFixed(2)}`
                : ''}
            </span>
          }
        />
      ) : null}

      {/** Send and Receive */}
      {isSimpleTokenTransfer && (
        <div className='rounded-2xl w-full overflow-auto shrink-0'>
          {tx?.content?.txType === 'send' ? (
            <DetailsCard
              title={'Sent to ' + contact.name}
              imgSrc={<Avatar emoji={contact.emoji} size='sm' />}
              subtitle={sliceAddress((txnMessage as parfait.cosmos.bank.send).toAddress)}
              activeChain={activeChain}
              txType={tx?.content?.txType}
              trailing={
                <CopyButton
                  onClick={() => {
                    UserClipboard.copyText((txnMessage as parfait.cosmos.bank.send).toAddress)
                  }}
                />
              }
            />
          ) : tx?.content?.txType === 'receive' ? (
            <DetailsCard
              title={'Received from ' + contact.name}
              imgSrc={<Avatar emoji={contact.emoji} size='sm' />}
              subtitle={sliceAddress((txnMessage as parfait.cosmos.bank.send).fromAddress)}
              activeChain={activeChain}
              txType={tx?.content?.txType}
              trailing={
                <CopyButton
                  onClick={() => {
                    UserClipboard.copyText((txnMessage as parfait.cosmos.bank.send).fromAddress)
                  }}
                />
              }
            />
          ) : null}
        </div>
      )}

      <div>
        <DetailsCard
          title='Transaction ID'
          imgSrc={
            <span className='size-10 grid place-content-center bg-secondary-250 text-secondary-foreground rounded-full text-mdl font-medium'>
              #
            </span>
          }
          subtitle={sliceAddress(tx?.parsedTx?.txHash ?? '')}
          activeChain={activeChain}
          txType={tx?.content?.txType}
          className={tx?.content?.feeAmount ? '!rounded-b-none' : ''}
          trailing={
            <CopyButton
              onClick={() => {
                UserClipboard.copyText(tx?.parsedTx?.txHash ?? '')
              }}
            />
          }
        />

        {tx?.content?.feeAmount && (
          <DetailsCard
            className='!rounded-t-none !pt-0'
            title='Transaction Fee'
            imgSrc={
              <span className='size-10 grid place-content-center bg-secondary-250 text-secondary-foreground rounded-full'>
                <DollarIcon className='size-4' />
              </span>
            }
            subtitle={tx?.content?.feeAmount}
            activeChain={activeChain}
            txType={tx?.content?.txType}
          />
        )}
      </div>
    </div>
  )
}
