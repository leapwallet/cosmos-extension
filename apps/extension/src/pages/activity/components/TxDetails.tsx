import { useAddress, useGetExplorerTxnUrl } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { ParsedMessageType } from '@leapwallet/parser-parfait'
import { ArrowSquareOut } from '@phosphor-icons/react'
import BottomModal from 'components/new-bottom-modal'
import { Button } from 'components/ui/button'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { useChainInfos } from 'hooks/useChainInfos'
import React, { useEffect, useMemo, useState } from 'react'
import { AddressBook } from 'utils/addressbook'

import { SelectedTx } from './ChainActivity'
import { TxDetailsContent } from './tx-details-content'

export type TxDetailsProps = {
  open: boolean
  tx: SelectedTx | null
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

const emptyContact = { name: '', emoji: 0 }

export function TxDetails({ open, tx, onBack, forceChain }: TxDetailsProps) {
  const chainInfos = useChainInfos()
  const selectedNetwork = useSelectedNetwork()

  const _activeChain = useActiveChain()
  const activeChain = useMemo(() => forceChain || _activeChain, [forceChain, _activeChain])
  const [contact, setContact] = useState<{ name: string; emoji: number }>(emptyContact)

  const address = useAddress(activeChain)
  const txnMessage = tx?.parsedTx?.messages[0]

  useEffect(() => {
    if (txnMessage?.__type === ParsedMessageType.BankSend) {
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
  }, [tx, setContact, txnMessage, address])

  const { explorerTxnUrl: txnUrl } = useGetExplorerTxnUrl({
    forceTxHash: tx?.parsedTx?.txHash,
    forceChain: activeChain,
    forceNetwork: selectedNetwork,
  })

  return (
    <BottomModal
      fullScreen
      title='Transaction details'
      isOpen={open}
      onClose={onBack}
      className='px-6 pb-6 pt-8 flex flex-col gap-8 overflow-auto h-full'
    >
      {tx && (
        <TxDetailsContent
          tx={tx}
          contact={contact}
          txnMessage={txnMessage}
          activeChain={activeChain}
        />
      )}

      {txnUrl && (
        <Button className='w-full mt-auto' onClick={() => window.open(txnUrl, '_blank')}>
          <div className='flex justify-center items-center'>
            <ArrowSquareOut size={20} className='mr-1' />
            <span>View on {chainInfos[activeChain].txExplorer?.[selectedNetwork]?.name}</span>
          </div>
        </Button>
      )}
    </BottomModal>
  )
}
