/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useActiveChain,
  useSetActiveChain,
  useSetSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import { ETHEREUM_METHOD_TYPE } from '@leapwallet/cosmos-wallet-provider/dist/provider/types'
import {
  ARCTIC_CHAIN_KEY,
  formatEtherUnits,
  getErc20TokenDetails,
} from '@leapwallet/cosmos-wallet-sdk'
import { Header } from '@leapwallet/leap-ui'
import PopupLayout from 'components/layout/popup-layout'
import { LoaderAnimation } from 'components/loader/Loader'
import { MessageTypes } from 'config/message-types'
import React, { useCallback, useEffect, useState } from 'react'
import Browser from 'webextension-polyfill'

import { MessageSignature, SignTransaction, SignTransactionProps } from './components'

function SeiEvmTransaction({ txnData }: SignTransactionProps) {
  switch (txnData.signTxnData.methodType) {
    case ETHEREUM_METHOD_TYPE.PERSONAL_SIGN:
    case ETHEREUM_METHOD_TYPE.ETH__SIGN:
    case ETHEREUM_METHOD_TYPE.ETH__SIGN_TYPED_DATA_V4:
      return <MessageSignature txnData={txnData} />
  }

  return <SignTransaction txnData={txnData} />
}

/**
 * This HOC helps makes sure that the txn signing request is decoded and the chain is set
 */
const withSeiEvmTxnSigningRequest = (Component: React.FC<any>) => {
  const Wrapped = () => {
    const activeChain = useActiveChain()
    const setActiveChain = useSetActiveChain()
    const setSelectedNetwork = useSetSelectedNetwork()
    const [txnData, setTxnData] = useState<Record<string, any> | null>(null)

    const signSeiEvmTxEventHandler = useCallback(
      async (message: any, sender: any) => {
        if (sender.id !== Browser.runtime.id) return

        if (message.type === MessageTypes.signTransaction) {
          const txnData = message.payload

          if (txnData?.signTxnData?.spendPermissionCapValue) {
            const tokenDetails = await getErc20TokenDetails(txnData.signTxnData.to)

            txnData.signTxnData.details = {
              Permission: `This allows the third party to spend ${formatEtherUnits(
                txnData.signTxnData.spendPermissionCapValue,
                tokenDetails.decimals,
              )} ${tokenDetails.symbol} from your current balance.`,

              ...txnData.signTxnData.details,
            }
          }

          setTxnData(txnData)
          if (activeChain !== ARCTIC_CHAIN_KEY) {
            setActiveChain(ARCTIC_CHAIN_KEY)
            setSelectedNetwork('mainnet')
          }
        }
      },
      [activeChain, setActiveChain, setSelectedNetwork],
    )

    useEffect(() => {
      Browser.runtime.sendMessage({ type: MessageTypes.signingPopupOpen })
      Browser.runtime.onMessage.addListener(signSeiEvmTxEventHandler)

      return () => {
        Browser.runtime.onMessage.removeListener(signSeiEvmTxEventHandler)
      }
    }, [signSeiEvmTxEventHandler])

    if (activeChain === ARCTIC_CHAIN_KEY && txnData) {
      return <Component txnData={txnData} />
    }

    return (
      <PopupLayout
        className='self-center justify-self-center'
        header={<Header title='Sign Transaction' topColor='#E54f47' />}
      >
        <div className='h-full w-full flex flex-col gap-4 items-center justify-center'>
          <LoaderAnimation color='white' />
        </div>
      </PopupLayout>
    )
  }

  Wrapped.displayName = `withSeiEvmTxnSigningRequest(${Component.displayName})`
  return Wrapped
}

const signSeiEvmTx = withSeiEvmTxnSigningRequest(React.memo(SeiEvmTransaction))
export default signSeiEvmTx
