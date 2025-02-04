/* eslint-disable @typescript-eslint/no-explicit-any */
import { ETHEREUM_METHOD_TYPE } from '@leapwallet/cosmos-wallet-provider/dist/provider/types'
import {
  formatEtherUnits,
  getChainApis,
  getErc20TokenDetails,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { MessageTypes } from 'config/message-types'
import { BG_RESPONSE } from 'config/storage-keys'
import { getChainOriginStorageKey, getSupportedChains } from 'extension-scripts/utils'
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { evmBalanceStore } from 'stores/balance-store'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { rootBalanceStore } from 'stores/root-store'
import { isCompassWallet } from 'utils/isCompassWallet'
import Browser from 'webextension-polyfill'

import { ArrowHeader, Loading, MessageSignature, SignTransaction } from './components'
import { handleRejectClick } from './utils'

type TxOriginData = {
  activeChain: SupportedChain
  activeNetwork: 'mainnet' | 'testnet'
}

type SeiEvmTransactionProps = {
  txOriginData: TxOriginData
  txnDataList: Record<string, any>[]
  setTxnDataList: React.Dispatch<React.SetStateAction<Record<string, any>[] | null>>
}

function SeiEvmTransaction({ txnDataList, setTxnDataList, txOriginData }: SeiEvmTransactionProps) {
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
            activeChain={txOriginData.activeChain}
            activeNetwork={txOriginData.activeNetwork}
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
    const [txnDataList, setTxnDataList] = useState<Record<string, any>[] | null>(null)
    const [txOriginData, setTxOriginData] = useState<TxOriginData | null>(null)

    const signSeiEvmTxEventHandler = useCallback(async (message: any, sender: any) => {
      if (sender.id !== Browser.runtime.id) return

      if (message.type === MessageTypes.signTransaction) {
        const txnData = message.payload
        const storageKey = getChainOriginStorageKey(txnData.origin)

        const storage = await Browser.storage.local.get(storageKey)
        const defaultChain = isCompassWallet() ? 'seiTestnet2' : 'ethereum'
        const { chainKey = defaultChain, network = 'mainnet' } = storage[storageKey] || {}
        const supportedChains = await getSupportedChains()
        const chainData = supportedChains[chainKey as SupportedChain]
        const evmChainId = Number(
          network === 'testnet' ? chainData?.evmChainIdTestnet : chainData?.evmChainId,
        )

        setTxOriginData({ activeChain: chainKey, activeNetwork: network })

        const { evmJsonRpc } = getChainApis(chainKey, network, supportedChains)

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
    }, [])

    useEffect(() => {
      Browser.runtime.sendMessage({ type: MessageTypes.signingPopupOpen })
      Browser.runtime.onMessage.addListener(signSeiEvmTxEventHandler)

      return () => {
        Browser.runtime.onMessage.removeListener(signSeiEvmTxEventHandler)
      }
    }, [signSeiEvmTxEventHandler])

    if (txnDataList?.length) {
      return (
        <Component
          txnDataList={txnDataList}
          setTxnDataList={setTxnDataList}
          txOriginData={txOriginData}
        />
      )
    }

    return <Loading />
  }

  Wrapped.displayName = `withSeiEvmTxnSigningRequest(${Component.displayName})`
  return Wrapped
}

const signSeiEvmTx = withSeiEvmTxnSigningRequest(React.memo(SeiEvmTransaction))
export default signSeiEvmTx
