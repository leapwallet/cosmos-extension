/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useChainApis,
  useChainId,
  useChainsStore,
  useLastEvmActiveChain,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import { ETHEREUM_METHOD_TYPE } from '@leapwallet/cosmos-wallet-provider/dist/provider/types'
import {
  formatEtherUnits,
  getErc20TokenDetails,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { Header } from '@leapwallet/leap-ui'
import PopupLayout from 'components/layout/popup-layout'
import { LoaderAnimation } from 'components/loader/Loader'
import { MessageTypes } from 'config/message-types'
import { BG_RESPONSE } from 'config/storage-keys'
import { useActiveChain, useSetActiveChain } from 'hooks/settings/useActiveChain'
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { evmBalanceStore } from 'stores/balance-store'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { rootBalanceStore } from 'stores/root-store'
import { isCompassWallet } from 'utils/isCompassWallet'
import Browser from 'webextension-polyfill'

import { MessageSignature, SignTransaction, SignTransactionProps } from './components'
import { handleRejectClick } from './utils'

export function Loading() {
  return (
    <PopupLayout
      className='self-center justify-self-center'
      header={<Header title='Sign Transaction' />}
    >
      <div className='h-full w-full flex flex-col gap-4 items-center justify-center'>
        <LoaderAnimation color='white' />
      </div>
    </PopupLayout>
  )
}

function SeiEvmTransaction({ txnData }: SignTransactionProps) {
  const navigate = useNavigate()
  useEffect(() => {
    window.addEventListener('beforeunload', () => handleRejectClick(navigate))
    Browser.storage.local.remove(BG_RESPONSE)

    return () => {
      window.removeEventListener('beforeunload', () => handleRejectClick(navigate))
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  switch (txnData.signTxnData.methodType) {
    case ETHEREUM_METHOD_TYPE.PERSONAL_SIGN:
    case ETHEREUM_METHOD_TYPE.ETH__SIGN:
    case ETHEREUM_METHOD_TYPE.ETH__SIGN_TYPED_DATA_V4:
      return <MessageSignature txnData={txnData} />
  }

  return (
    <SignTransaction
      txnData={txnData}
      rootDenomsStore={rootDenomsStore}
      rootBalanceStore={rootBalanceStore}
      evmBalanceStore={evmBalanceStore}
    />
  )
}

/**
 * This HOC helps makes sure that the txn signing request is decoded and the chain is set
 */
const withSeiEvmTxnSigningRequest = (Component: React.FC<any>) => {
  const Wrapped = () => {
    const lastEvmActiveChain = useLastEvmActiveChain()
    const _activeChain = useActiveChain()
    const setActiveChain = useSetActiveChain()
    const activeChain = isCompassWallet() ? _activeChain : lastEvmActiveChain
    const [hasCorrectChain, setHasCorrectChain] = useState(false)

    const activeNetwork = useSelectedNetwork()
    const [txnData, setTxnData] = useState<Record<string, any> | null>(null)
    const { evmJsonRpc } = useChainApis(activeChain, activeNetwork)
    const evmChainId = useChainId(activeChain, activeNetwork, true)
    const { chains } = useChainsStore()

    useEffect(() => {
      // if this page opens with a cosmos chain as active chain there is an infinite re render. Setting it to last active evm chain fixes the issue.
      const fn = async () => {
        if (!isCompassWallet() && !chains[_activeChain].evmOnlyChain) {
          await setActiveChain(lastEvmActiveChain)
          setHasCorrectChain(true)
        } else {
          setHasCorrectChain(true)
        }
      }
      fn()
    }, [])

    const signSeiEvmTxEventHandler = useCallback(
      async (message: any, sender: any) => {
        if (sender.id !== Browser.runtime.id) return

        if (message.type === MessageTypes.signTransaction) {
          const txnData = message.payload

          if (txnData?.signTxnData?.spendPermissionCapValue) {
            const tokenDetails = await getErc20TokenDetails(
              txnData.signTxnData.to,
              evmJsonRpc ?? '',
              Number(evmChainId),
            )
            txnData.signTxnData.details = {
              Permission: `This allows the third party to spend ${formatEtherUnits(
                txnData.signTxnData.spendPermissionCapValue,
                tokenDetails.decimals,
              )} ${tokenDetails.symbol} from your current balance.`,

              ...txnData.signTxnData.details,
            }
          }

          setTxnData(txnData)
        }
      },
      [evmChainId, evmJsonRpc],
    )

    useEffect(() => {
      if (hasCorrectChain) {
        Browser.runtime.sendMessage({ type: MessageTypes.signingPopupOpen })
        Browser.runtime.onMessage.addListener(signSeiEvmTxEventHandler)

        return () => {
          Browser.runtime.onMessage.removeListener(signSeiEvmTxEventHandler)
        }
      }
    }, [signSeiEvmTxEventHandler, hasCorrectChain])

    if (txnData) {
      return <Component txnData={txnData} />
    }

    return <Loading />
  }

  Wrapped.displayName = `withSeiEvmTxnSigningRequest(${Component.displayName})`
  return Wrapped
}

const signSeiEvmTx = withSeiEvmTxnSigningRequest(React.memo(SeiEvmTransaction))
export default signSeiEvmTx
