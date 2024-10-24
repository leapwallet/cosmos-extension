/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useChainApis,
  useChainId,
  useChainsStore,
  useLastEvmActiveChain,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import { ETHEREUM_METHOD_TYPE } from '@leapwallet/cosmos-wallet-provider/dist/provider/types'
import { formatEtherUnits, getErc20TokenDetails } from '@leapwallet/cosmos-wallet-sdk'
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

import { ArrowHeader, Loading, MessageSignature, SignTransaction } from './components'
import { handleRejectClick } from './utils'

type SeiEvmTransactionProps = {
  txnDataList: Record<string, any>[]
  setTxnDataList: React.Dispatch<React.SetStateAction<Record<string, any>[] | null>>
}

function SeiEvmTransaction({ txnDataList, setTxnDataList }: SeiEvmTransactionProps) {
  const navigate = useNavigate()
  const [activeTxn, setActiveTxn] = useState(0)

  useEffect(() => {
    window.addEventListener('beforeunload', () =>
      handleRejectClick(navigate, txnDataList[0]?.payloadId),
    )
    Browser.storage.local.remove(BG_RESPONSE)

    return () => {
      window.removeEventListener('beforeunload', () =>
        handleRejectClick(navigate, txnDataList[0]?.payloadId),
      )
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTxnListUpdate = (customId: string) => {
    const filteredTxnDataList = txnDataList.filter((_txnData) => _txnData.customId !== customId)
    setTxnDataList(filteredTxnDataList)
    setActiveTxn(0)
  }

  return (
    <>
      {txnDataList.length > 1 ? (
        <ArrowHeader
          activeIndex={activeTxn}
          setActiveIndex={setActiveTxn}
          limit={txnDataList.length}
        />
      ) : null}

      {txnDataList.map((txnData, index) => {
        if (index !== activeTxn) {
          return null
        }

        switch (txnData.signTxnData.methodType) {
          case ETHEREUM_METHOD_TYPE.PERSONAL_SIGN:
          case ETHEREUM_METHOD_TYPE.ETH__SIGN:
          case ETHEREUM_METHOD_TYPE.ETH__SIGN_TYPED_DATA_V4:
            return (
              <MessageSignature
                key={txnData.customId}
                txnData={txnData}
                donotClose={txnDataList.length > 1}
                handleTxnListUpdate={() => handleTxnListUpdate(txnData.customId)}
              />
            )
        }

        return (
          <SignTransaction
            key={txnData.customId}
            txnData={txnData}
            rootDenomsStore={rootDenomsStore}
            rootBalanceStore={rootBalanceStore}
            evmBalanceStore={evmBalanceStore}
            donotClose={txnDataList.length > 1}
            handleTxnListUpdate={() => handleTxnListUpdate(txnData.customId)}
          />
        )
      })}
    </>
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
    const [txnDataList, setTxnDataList] = useState<Record<string, any>[] | null>(null)
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

      // eslint-disable-next-line react-hooks/exhaustive-deps
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

          setTxnDataList((prev) => {
            prev = prev ?? []
            if (prev.some((txn) => txn?.origin?.toLowerCase() !== txnData?.origin?.toLowerCase())) {
              return prev
            }

            return [...prev, { ...txnData, customId: `${sender.id}-00${prev.length}` }]
          })
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

    if (txnDataList?.length) {
      return <Component txnDataList={txnDataList} setTxnDataList={setTxnDataList} />
    }

    return <Loading />
  }

  Wrapped.displayName = `withSeiEvmTxnSigningRequest(${Component.displayName})`
  return Wrapped
}

const signSeiEvmTx = withSeiEvmTxnSigningRequest(React.memo(SeiEvmTransaction))
export default signSeiEvmTx
