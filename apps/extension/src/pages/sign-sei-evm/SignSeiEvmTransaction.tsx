/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getSeiEvmInfo,
  SeiEvmInfoEnum,
  useActiveChain,
  useGetSeiEvmBalance,
  useGetTokenBalances,
  useSeiLinkedAddressState,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import { ETHEREUM_METHOD_TYPE } from '@leapwallet/cosmos-wallet-provider/dist/provider/types'
import { formatEtherUnits, getErc20TokenDetails } from '@leapwallet/cosmos-wallet-sdk'
import { Header } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import PopupLayout from 'components/layout/popup-layout'
import { LoaderAnimation } from 'components/loader/Loader'
import { MessageTypes } from 'config/message-types'
import { Wallet } from 'hooks/wallet/useWallet'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Browser from 'webextension-polyfill'

import { MessageSignature, SignTransaction, SignTransactionProps } from './components'

function Loading() {
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

function SeiEvmTransaction({ txnData, isEvmTokenExist }: SignTransactionProps) {
  switch (txnData.signTxnData.methodType) {
    case ETHEREUM_METHOD_TYPE.PERSONAL_SIGN:
    case ETHEREUM_METHOD_TYPE.ETH__SIGN:
    case ETHEREUM_METHOD_TYPE.ETH__SIGN_TYPED_DATA_V4:
      return <MessageSignature txnData={txnData} />
  }

  return <SignTransaction txnData={txnData} isEvmTokenExist={isEvmTokenExist} />
}

/**
 * This HOC helps makes sure that the txn signing request is decoded and the chain is set
 */
const withSeiEvmTxnSigningRequest = (Component: React.FC<any>) => {
  const Wrapped = () => {
    const activeChain = useActiveChain()
    const activeNetwork = useSelectedNetwork()
    const [txnData, setTxnData] = useState<Record<string, any> | null>(null)
    const getWallet = Wallet.useGetWallet()
    const { allAssets } = useGetTokenBalances()
    const { addressLinkState } = useSeiLinkedAddressState(getWallet)
    const { data: seiEvmBalance, status: seiEvmStatus } = useGetSeiEvmBalance()

    const assets = useMemo(() => {
      let _assets = allAssets

      if (!['done', 'unknown'].includes(addressLinkState)) {
        _assets = [..._assets, ...(seiEvmBalance?.seiEvmBalance ?? [])].filter((token) =>
          new BigNumber(token.amount).gt(0),
        )
      }

      return _assets
    }, [addressLinkState, allAssets, seiEvmBalance?.seiEvmBalance])

    const isEvmTokenExist = useMemo(
      () => (assets ?? []).some((asset) => asset?.isEvm && asset?.coinMinimalDenom === 'usei'),
      [assets],
    )

    const signSeiEvmTxEventHandler = useCallback(
      async (message: any, sender: any) => {
        if (sender.id !== Browser.runtime.id) return

        if (message.type === MessageTypes.signTransaction) {
          const txnData = message.payload

          if (txnData?.signTxnData?.spendPermissionCapValue) {
            const rpcUrl = (await getSeiEvmInfo({
              activeNetwork,
              activeChain: activeChain as 'seiDevnet' | 'seiTestnet2',
              infoType: SeiEvmInfoEnum.EVM_RPC_URL,
            })) as string

            const chainId = (await getSeiEvmInfo({
              activeNetwork,
              activeChain: activeChain as 'seiDevnet' | 'seiTestnet2',
              infoType: SeiEvmInfoEnum.EVM_CHAIN_ID,
            })) as number

            const tokenDetails = await getErc20TokenDetails(txnData.signTxnData.to, rpcUrl, chainId)
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
      [activeChain, activeNetwork],
    )

    useEffect(() => {
      Browser.runtime.sendMessage({ type: MessageTypes.signingPopupOpen })
      Browser.runtime.onMessage.addListener(signSeiEvmTxEventHandler)

      return () => {
        Browser.runtime.onMessage.removeListener(signSeiEvmTxEventHandler)
      }
    }, [signSeiEvmTxEventHandler])

    if (!['done', 'unknown'].includes(addressLinkState) && seiEvmStatus === 'loading') {
      return <Loading />
    }

    if (txnData) {
      return <Component txnData={txnData} isEvmTokenExist={isEvmTokenExist} />
    }

    return <Loading />
  }

  Wrapped.displayName = `withSeiEvmTxnSigningRequest(${Component.displayName})`
  return Wrapped
}

const signSeiEvmTx = withSeiEvmTxnSigningRequest(React.memo(SeiEvmTransaction))
export default signSeiEvmTx
