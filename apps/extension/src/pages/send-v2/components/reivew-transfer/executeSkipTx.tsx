import { coin } from '@cosmjs/proto-signing'
import {
  CosmosTxType,
  getTxnLogAmountValue,
  LeapWalletApi,
  sliceAddress,
  useChainsStore,
  useDenoms,
  usePendingTxState,
  useTxMetadata,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  getMetaDataForIbcTx,
  getMetaDataForSendTx,
} from '@leapwallet/cosmos-wallet-hooks/dist/send/get-metadata'
import { sleep, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import {
  Account,
  getMessageMetadataForSigning,
  Signer,
  SKIP_TXN_STATUS,
  SkipAPI,
  TxClient,
} from '@leapwallet/elements-core'
import { useChains } from '@leapwallet/elements-hooks'
import { useWalletClient } from 'hooks/useWalletClient'
import { useSendContext } from 'pages/send-v2/context'
import { useState } from 'react'
import { useTxCallBack } from 'utils/txCallback'

export const useExecuteSkipTx = () => {
  const [txnProcessing, setTxnProcessing] = useState<boolean>(false)
  const [error, setError] = useState<string | undefined>()

  const denoms = useDenoms()
  const { chains } = useChainsStore()
  const { data: elementsChains } = useChains()
  const { setPendingTx } = usePendingTxState()
  const txCallback = useTxCallBack()
  const { walletClient } = useWalletClient()
  const txMetadata = useTxMetadata()
  const txPostToDB = LeapWalletApi.useOperateCosmosTx()
  const [showLedgerPopupSkipTx, setShowLedgerPopup] = useState(false)

  const { selectedToken, selectedAddress, fee, inputAmount, isIBCTransfer, transferData, memo } =
    useSendContext()

  const confirmSkipTx = async () => {
    if (
      !fee ||
      !transferData ||
      !('messages' in transferData) ||
      !transferData?.messages ||
      !chains
    ) {
      if (!fee) setError(`Invalid transfer fee`)
      else if (!transferData || !('messages' in transferData) || !transferData?.messages) {
        setError(`Invalid transfer message`)
      } else if (!chains) setError(`Invalid transfer chains`)
      else setError(`Invalid transfer data`)
      return
    }

    setError(undefined)

    setTxnProcessing(true)
    const { messages } = transferData

    for (let i = 0; i < messages.length; i++) {
      const multiHopMsg = messages[i]
      const msgJSON = JSON.parse(multiHopMsg.msg)
      const currentTimestamp = new Date().getTime()
      const timeoutMilliseconds = Number(msgJSON.timeout_timestamp / 10 ** 6)
      if (timeoutMilliseconds < currentTimestamp) {
        setError('Transaction timed out')
        setTxnProcessing(false)
        return
      }

      const { senderAddress, encodedMessage } = getMessageMetadataForSigning(
        multiHopMsg.msg_type_url,
        msgJSON,
      )

      const messageChain = elementsChains?.find((chain) => chain.chainId === multiHopMsg.chain_id)

      if (!messageChain) {
        setError('Chain info is not found')
        return
      }

      let account: Account | undefined
      let signer: Signer | undefined
      try {
        account = await walletClient.getAccount('')
        signer = await walletClient.getSigner('')
        if (account?.isNanoLedger) {
          setShowLedgerPopup(true)
        }
      } catch (e: any) {
        setError(e?.message)
        setTxnProcessing(false)
        return
      }

      const tx = new TxClient(
        String(messageChain.chainId),
        messageChain.restUrl,
        messageChain.coinType,
        signer,
        account,
      )

      let txBytesString: string | undefined = undefined
      try {
        txBytesString = await tx.sign(senderAddress, [encodedMessage], fee, memo)
      } catch (e: any) {
        const err = e as Error
        if (err?.message?.includes('rejected') || err?.message?.includes('declined')) {
          setTxnProcessing(false)
          setError(err?.message)
        } else {
          setError(err?.message)
          setTxnProcessing(false)
        }
        setShowLedgerPopup(false)
        return
      } finally {
        setShowLedgerPopup(false)
      }

      try {
        const { success, response } = await tx.submitTx(
          String(messageChain.chainId),
          txBytesString!,
        )

        if (!success) setError('SubmitTx Failed')

        const getTxStatus = async () => {
          let index = 0
          const max = 100
          while (index <= max) {
            const txnStatus = await SkipAPI.getTxnStatus({
              chain_id: multiHopMsg.chain_id,
              tx_hash: response.tx_hash,
            })
            if (txnStatus.success) {
              const { state, error } = txnStatus.response

              if (state === SKIP_TXN_STATUS.STATE_COMPLETED_SUCCESS) {
                return { code: 0 }
              } else if (state === SKIP_TXN_STATUS.STATE_ABANDONED) {
                return { code: 0 }
              }

              if (error?.code) {
                return error
              }
            }
            index += 1
            await sleep(2000)
          }
        }
        const pendingTx = {
          img: messageChain.icon,
          sentAmount: inputAmount,
          sentTokenInfo: {
            ...selectedToken,
            coinDenom: selectedToken?.symbol || selectedToken?.name,
          },
          sentUsdValue: '',
          subtitle1: `to ${sliceAddress(selectedAddress?.address)}`,
          title1: `Sent ${selectedToken?.symbol || selectedToken?.name}`,
          txStatus: 'loading',
          txType: isIBCTransfer ? 'ibc/transfer' : 'send',
          txHash: response.tx_hash,
          promise: getTxStatus(),
        }

        const toAddress = selectedAddress?.address || ''
        const denom = selectedToken?.coinMinimalDenom || selectedToken?.ibcDenom || ''

        const txnLogAmountValue = await getTxnLogAmountValue(inputAmount, {
          coinGeckoId: denoms[selectedToken?.coinMinimalDenom ?? '']?.coinGeckoId,
          chain: (selectedToken?.chain ?? '') as SupportedChain,
        })

        let metadata = isIBCTransfer
          ? getMetaDataForIbcTx(msgJSON?.source_channel, toAddress, {
              denom: denom,
              amount: inputAmount,
            })
          : getMetaDataForSendTx(toAddress, coin(inputAmount, denom))

        metadata = { ...metadata, ...txMetadata }

        await txPostToDB({
          txHash: response?.tx_hash,
          txType: isIBCTransfer ? CosmosTxType.IbcSend : CosmosTxType.Send,
          amount: txnLogAmountValue,
          metadata,
          feeDenomination: fee?.amount[0]?.denom,
          feeQuantity: fee?.amount[0]?.amount,
        })

        // @ts-ignore
        setPendingTx(pendingTx)

        if (success) {
          txCallback('success')
        } else {
          txCallback('txDeclined')
        }
      } catch (err: any) {
        setTxnProcessing(false)
        if (err?.message?.includes('insufficient fees')) {
          setError('Send failed due to low gas fees. Please try again with higher gas.')
        } else {
          setError(err?.message)
        }
        return
      }
    }
    setTxnProcessing(false)
  }

  return { confirmSkipTx, txnProcessing, error, showLedgerPopupSkipTx }
}
