import {
  ActivityCardContent,
  useAddress,
  useGetExplorerTxnUrl,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Avatar, Buttons, Card, GenericCard } from '@leapwallet/leap-ui'
import { parfait, ParsedMessageType, type ParsedTransaction } from '@leapwallet/parser-parfait'
import { ArrowSquareOut } from '@phosphor-icons/react'
import { PageHeader } from 'components/header'
import PopupLayout from 'components/layout/popup-layout'
import dayjs from 'dayjs'
import { getSwapImage, useActivityImage } from 'hooks/activity/useActivityImage'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { useChainInfos } from 'hooks/useChainInfos'
import { Images } from 'images'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Colors } from 'theme/colors'
import { HeaderActionType } from 'types/components'
import { AddressBook } from 'utils/addressbook'
import { UserClipboard } from 'utils/clipboard'
import { isCompassWallet } from 'utils/isCompassWallet'
import { formatTokenAmount, sliceAddress } from 'utils/strings'

import { ActivityIcon } from './ActivityIcon'

export type TxDetailsProps = {
  parsedTx: ParsedTransaction
  content: ActivityCardContent
  onBack: () => void
  forceChain?: SupportedChain
}

export type ToExplorer = {
  mainnet?:
    | {
        readonly name: string
        readonly txUrl: string
      }
    | undefined
  testnet?:
    | {
        readonly name: string
        readonly txUrl: string
      }
    | undefined
}

const getActivityIconAndTitle = (
  activeChain: SupportedChain,
): Record<string, { icon: string; title: string }> => {
  return {
    send: { icon: Images.Activity.SendDetails, title: 'Sent' },
    receive: { icon: Images.Activity.ReceiveDetails, title: 'Received' },
    pending: { icon: Images.Activity.PendingDetails, title: 'Pending' },
    delegate: { icon: Images.Activity.DelegateDetails, title: 'Delegated' },
    undelegate: { icon: Images.Activity.UndelegateDetails, title: 'Undelegated' },
    'ibc/transfer': { icon: Images.Activity.SwapDetails, title: 'IBC Transfer' },
    vote: { icon: Images.Activity.TxHash, title: 'Voted' },
    swap: { icon: getSwapImage(activeChain), title: 'Swap' },
    fallback: { icon: Images.Activity.SendDetails, title: 'Success' },
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

const emptyContact = { name: '', emoji: 0 }

export function TxDetails({ parsedTx, content, onBack, forceChain }: TxDetailsProps) {
  const chainInfos = useChainInfos()
  const selectedNetwork = useSelectedNetwork()
  const copyAddressRef = useRef<HTMLButtonElement>(null)
  const copyTxHashRef = useRef<HTMLButtonElement>(null)

  const _activeChain = useActiveChain()
  const activeChain = useMemo(() => forceChain || _activeChain, [forceChain, _activeChain])
  const [contact, setContact] = useState<{ name: string; emoji: number }>(emptyContact)

  const {
    sentAmount,
    sentTokenInfo,
    receivedAmount,
    receivedTokenInfo,
    sentUsdValue,
    txType,
    secondaryImg,
    img: customImage,
  } = content

  const address = useAddress(activeChain)
  const defaultImg = useActivityImage(txType)
  const txnMessage = parsedTx.messages[0]
  const img = customImage || defaultImg
  const iconAndTitle = getActivityIconAndTitle(activeChain)

  const { icon, title } = iconAndTitle[txType] ?? iconAndTitle.fallback
  const date = dayjs(parsedTx.timestamp).format('D MMMM YYYY h:mm A')

  const sentAmountInfo =
    sentAmount && sentTokenInfo?.coinDenom
      ? formatTokenAmount(sentAmount, sentTokenInfo.coinDenom)
      : undefined
  const receivedAmountInfo =
    receivedAmount && receivedTokenInfo?.coinDenom
      ? formatTokenAmount(receivedAmount, receivedTokenInfo.coinDenom)
      : undefined

  useEffect(() => {
    if (txnMessage.__type === ParsedMessageType.BankSend) {
      const isReceive = address === txnMessage.toAddress
      AddressBook.getEntry(isReceive ? txnMessage.fromAddress : txnMessage.toAddress).then(
        (contact) => {
          if (contact) {
            setContact({
              name: contact.name,
              emoji: contact.emoji,
            })
          } else {
            setContact(emptyContact)
          }
        },
      )
    }
  }, [parsedTx, content, setContact, txnMessage, address])

  const { explorerTxnUrl: txnUrl } = useGetExplorerTxnUrl({ forceTxHash: parsedTx.txHash })
  const isSimpleTokenTransfer =
    content.txType === 'send' || content.txType === 'receive' || content.txType === 'ibc/transfer'

  const isTxSuccessful = parsedTx.code === 0

  return (
    <PopupLayout>
      <PageHeader
        action={{
          onClick: onBack,
          type: HeaderActionType.BACK,
        }}
        title='Transaction Details'
      />

      <div className='flex flex-col justify-center items-center p-7'>
        <div className='bg-white-100 dark:bg-gray-950 rounded-2xl w-full flex flex-col items-center p-7'>
          {content.txType === 'vote' || content.txType === 'swap' ? (
            <ActivityIcon
              size='lg'
              img={img}
              voteOption={content.title1}
              secondaryImg={secondaryImg}
              type={txType}
              isSuccessful={isTxSuccessful}
            />
          ) : (
            <>
              {isTxSuccessful ? (
                <img src={icon} className='h-16 w-16 mb-3' />
              ) : (
                <img src={Images.Activity.Error} className='h-16 w-16 mb-3' />
              )}
            </>
          )}

          {/** Vote Info */}
          <div className='font-black text-2xl text-black-100 dark:text-white-100'>
            {content.txType === 'vote' ? content.title1 : isTxSuccessful ? title : 'Fail'}
          </div>

          {content.txType === 'vote' && (
            <div className='text-base text-gray-600 font-bold'>{content.subtitle1}</div>
          )}

          {content.txType === 'swap' ? (
            <div className='flex flex-col mt-2 w-full items-center'>
              <p className='text-base text-center text-gray-600 font-bold'>{content.title1}</p>
              {sentAmountInfo || receivedAmountInfo ? (
                <div className='flex mt-2 space-x-2'>
                  {sentAmountInfo ? (
                    <p className='text-sm text-gray-600 dark:text-gray-400'>- {sentAmountInfo}</p>
                  ) : null}
                  {receivedAmountInfo ? (
                    <p className='text-sm text-green-600 dark:text-green-600'>
                      + {receivedAmountInfo}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : (
            /** Amount info */
            <div className='flex my-2 items-center'>
              {sentAmountInfo && (
                <>
                  <img src={img} className='h-4 w-4 mr-1' />
                  <div className='text-base text-gray-600 font-bold'>{sentAmountInfo}</div>
                </>
              )}
              {sentUsdValue && (
                <div className='text-base text-gray-600 font-bold'>
                  &nbsp; (~ ${Number(sentUsdValue).toFixed(3)})
                </div>
              )}
            </div>
          )}

          {/** Date */}
          <div className='text-xs text-gray-400 mt-2'>{date}</div>
        </div>

        {/** Send, Receive and IBC */}
        {isSimpleTokenTransfer && (
          <div className='rounded-2xl overflow-hidden w-full m-4'>
            {content.txType === 'send' ? (
              <GenericCard
                title={'Sent to ' + contact.name}
                img={<Avatar emoji={contact.emoji} size='sm' className='mr-3' />}
                subtitle={sliceAddress((txnMessage as parfait.cosmos.bank.send).toAddress)}
                onClick={() => {
                  copyAddressRef.current?.click()
                  UserClipboard.copyText((txnMessage as parfait.cosmos.bank.send).toAddress)
                }}
                size='md'
                icon={
                  <Buttons.CopyWalletAddress
                    copyIcon={Images.Activity.Copy}
                    ref={copyAddressRef}
                    color={isCompassWallet() ? Colors.compassPrimary : Colors.green600}
                    className='dark:!bg-gray-950'
                  />
                }
                className='dark:!bg-gray-950'
              />
            ) : content.txType === 'receive' ? (
              <GenericCard
                title={'Received from ' + contact.name}
                img={<Avatar emoji={contact.emoji} size='sm' className='mr-3' />}
                subtitle={sliceAddress((txnMessage as parfait.cosmos.bank.send).fromAddress)}
                onClick={() => {
                  copyAddressRef.current?.click()
                  UserClipboard.copyText((txnMessage as parfait.cosmos.bank.send).fromAddress)
                }}
                size='md'
                icon={
                  <Buttons.CopyWalletAddress
                    copyIcon={Images.Activity.Copy}
                    ref={copyAddressRef}
                    color={isCompassWallet() ? Colors.compassPrimary : Colors.green600}
                    className='dark:!bg-gray-950'
                  />
                }
                className='dark:!bg-gray-950'
              />
            ) : (
              content.txType === 'ibc/transfer' &&
              (() => {
                const ibcTransfer = txnMessage as parfait.ibc.applications.send
                const isReceive = ibcTransfer.toAddress === address
                return (
                  <GenericCard
                    title={isReceive ? 'Sent to ' + contact.name : 'Received from ' + contact.name}
                    img={<Avatar emoji={contact.emoji} size='sm' className='mr-3' />}
                    subtitle={
                      isReceive
                        ? sliceAddress(ibcTransfer.toAddress)
                        : sliceAddress(ibcTransfer.fromAddress)
                    }
                    onClick={() => {
                      copyAddressRef.current?.click()
                      UserClipboard.copyText(
                        isReceive ? ibcTransfer.toAddress : ibcTransfer.fromAddress,
                      )
                    }}
                    size='md'
                    icon={
                      <Buttons.CopyWalletAddress
                        copyIcon={Images.Activity.Copy}
                        ref={copyAddressRef}
                        color={isCompassWallet() ? Colors.compassPrimary : Colors.green600}
                        className='dark:!bg-gray-950'
                      />
                    }
                    className='dark:!bg-gray-950'
                  />
                )
              })()
            )}
          </div>
        )}

        <div className='rounded-2xl overflow-hidden w-full m-4'>
          <GenericCard
            title='Transaction ID'
            img={<img className='mr-3' src={Images.Activity.TxHash} />}
            subtitle={sliceAddress(parsedTx.txHash)}
            onClick={() => {
              copyTxHashRef.current?.click()
              UserClipboard.copyText(parsedTx.txHash)
            }}
            size='md'
            icon={
              <Buttons.CopyWalletAddress
                copyIcon={Images.Activity.Copy}
                ref={copyTxHashRef}
                color={isCompassWallet() ? Colors.compassPrimary : Colors.green600}
                className='dark:!bg-gray-950'
              />
            }
            className='dark:!bg-gray-950'
          />

          {content.feeAmount && (
            <Card
              title='Transaction Fee'
              imgSrc={Images.Activity.TxFee}
              subtitle={content.feeAmount}
              size='md'
              className='dark:!bg-gray-950'
            />
          )}
        </div>

        {txnUrl && (
          <Buttons.Generic
            className='w-[344px] py-3'
            size='normal'
            onClick={() => window.open(txnUrl, '_blank')}
          >
            <div className='flex justify-center items-center'>
              <ArrowSquareOut size={20} className='mr-2' />
              <span>View on {chainInfos[activeChain].txExplorer?.[selectedNetwork]?.name}</span>
            </div>
          </Buttons.Generic>
        )}
      </div>
    </PopupLayout>
  )
}
