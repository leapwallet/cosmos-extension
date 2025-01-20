/* eslint-disable @typescript-eslint/no-explicit-any */
import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { BITCOIN_METHOD_TYPE } from '@leapwallet/cosmos-wallet-provider/dist/provider/types'
import { isBitcoinChain } from '@leapwallet/cosmos-wallet-store/dist/utils'
import { MessageTypes } from 'config/message-types'
import { BG_RESPONSE } from 'config/storage-keys'
import { useSetActiveChain } from 'hooks/settings/useActiveChain'
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { rootBalanceStore } from 'stores/root-store'
import Browser from 'webextension-polyfill'

import { Loading, SendBitcoin, SignMessage, SignPsbt, SignPsbts } from './components'
import { handleRejectClick } from './utils'

type BitcoinTransactionProps = {
  txnData: Record<string, any>
}

function BitcoinTransaction({ txnData }: BitcoinTransactionProps) {
  const navigate = useNavigate()

  useEffect(() => {
    window.addEventListener('beforeunload', () => handleRejectClick(navigate, txnData?.payloadId))
    Browser.storage.local.remove(BG_RESPONSE)

    return () => {
      window.removeEventListener('beforeunload', () =>
        handleRejectClick(navigate, txnData?.payloadId),
      )
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  switch (txnData.signTxnData.methodType) {
    case BITCOIN_METHOD_TYPE.SEND_BITCOIN:
      return (
        <SendBitcoin
          txnData={txnData}
          rootDenomsStore={rootDenomsStore}
          rootBalanceStore={rootBalanceStore}
        />
      )

    case BITCOIN_METHOD_TYPE.SIGN_PSBT:
      return <SignPsbt txnData={txnData} rootDenomsStore={rootDenomsStore} />

    case BITCOIN_METHOD_TYPE.SIGN_PSBTS:
      return <SignPsbts txnData={txnData} rootDenomsStore={rootDenomsStore} />

    case BITCOIN_METHOD_TYPE.SIGN_MESSAGE:
      return <SignMessage txnData={txnData} />

    default:
      return null
  }
}

/**
 * This HOC helps makes sure that the txn signing request is decoded and the chain is set
 */
const withBitcoinTxnSigningRequest = (Component: React.FC<any>) => {
  const Wrapped = () => {
    const _activeChain = useActiveChain()
    const setActiveChain = useSetActiveChain()
    const [hasCorrectChain, setHasCorrectChain] = useState(false)
    const [txnData, setTxnData] = useState<Record<string, any> | null>(null)

    useEffect(() => {
      ;(async function () {
        if (isBitcoinChain(_activeChain)) {
          setHasCorrectChain(true)
        } else {
          await setActiveChain('bitcoin')
          setHasCorrectChain(true)
        }
      })()

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [_activeChain])

    const signBitcoinTxEventHandler = useCallback(async (message: any, sender: any) => {
      if (sender.id !== Browser.runtime.id) return

      if (message.type === MessageTypes.signTransaction) {
        const txnData = message.payload
        setTxnData(txnData)
      }
    }, [])

    useEffect(() => {
      if (hasCorrectChain) {
        Browser.runtime.sendMessage({ type: MessageTypes.signingPopupOpen })
        Browser.runtime.onMessage.addListener(signBitcoinTxEventHandler)

        return () => {
          Browser.runtime.onMessage.removeListener(signBitcoinTxEventHandler)
        }
      }
    }, [hasCorrectChain, signBitcoinTxEventHandler])

    if (txnData) {
      return <Component txnData={txnData} />
    }

    return <Loading />
  }

  Wrapped.displayName = `withBitcoinTxnSigningRequest(${Component.displayName})`
  return Wrapped
}

const signBitcoinTx = withBitcoinTxnSigningRequest(React.memo(BitcoinTransaction))
export default signBitcoinTx
