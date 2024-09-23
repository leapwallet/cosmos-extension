/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CosmosTxType,
  getChainId,
  getMetaDataForIbcTx,
  getMetaDataForSendTx,
  getTxnLogAmountValue,
  LeapWalletApi,
  sliceAddress,
  useAddress,
  useChainId,
  useChainsStore,
  useDenoms,
  usePendingTxState,
  useTxMetadata,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  ChainInfos,
  EthermintTxHandler,
  getClientState,
  getErrorMessageFromCode,
  InjectiveTx,
  LeapLedgerSigner,
  sleep,
  SupportedChain,
  toSmall,
} from '@leapwallet/cosmos-wallet-sdk'
import { TxClient as InjectiveTxClient } from '@leapwallet/cosmos-wallet-sdk/dist/browser/proto/injective/core/modules'
import {
  Account,
  getMessageMetadataForSigning,
  Signer,
  SKIP_TXN_STATUS,
  SkipAPI,
  SkipCosmosMsg,
  TxClient,
} from '@leapwallet/elements-core'
import { useChains } from '@leapwallet/elements-hooks'
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx'
import { useWalletClient } from 'hooks/useWalletClient'
import { Wallet } from 'hooks/wallet/useWallet'
import { useSendContext } from 'pages/send-v2/context'
import { handleCosmosTx } from 'pages/swaps-v2/tx/cosmosTxHandler'
import { useMemo, useState } from 'react'
import { SourceChain } from 'types/swap'
import { getLedgerEnabledEvmChainsKey } from 'utils/getLedgerEnabledEvmChains'
import { useTxCallBack } from 'utils/txCallback'

export const useExecuteSkipTx = () => {
  const [txnProcessing, setTxnProcessing] = useState<boolean>(false)
  const [error, setError] = useState<string | undefined>()

  const {
    selectedToken,
    selectedAddress,
    fee,
    inputAmount,
    isIBCTransfer,
    transferData,
    memo,
    sendActiveChain,
    sendSelectedNetwork,
    associatedSeiAddress,
  } = useSendContext()

  const denoms = useDenoms()
  const { chains } = useChainsStore()
  const { data: elementsChains } = useChains()
  const { setPendingTx } = usePendingTxState()
  const txCallback = useTxCallBack()
  const { walletClient } = useWalletClient(sendActiveChain)
  const txMetadata = useTxMetadata()
  const txPostToDB = LeapWalletApi.useOperateCosmosTx()
  const [showLedgerPopupSkipTx, setShowLedgerPopup] = useState(false)
  const getWallet = Wallet.useGetWallet()
  const activeWalletAddress = useAddress(sendActiveChain)
  const activeChainId = useChainId(sendActiveChain, sendSelectedNetwork)

  const ledgerEnabledEvmChains = useMemo(() => {
    return getLedgerEnabledEvmChainsKey(Object.values(chains))
  }, [chains])

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
      const allMessages = messages[i] as SkipCosmosMsg
      const multiHopMsg = allMessages?.multi_chain_msg
      const msgJSON = JSON.parse(multiHopMsg.msg)
      const currentTimestamp = new Date().getTime()
      const timeoutMilliseconds = Number(msgJSON.timeout_timestamp / 10 ** 6)
      if (timeoutMilliseconds < currentTimestamp) {
        setError('Transaction timed out')
        setTxnProcessing(false)
        return
      }

      const { senderAddress, encodedMessage: transferMessage } = getMessageMetadataForSigning(
        multiHopMsg.msg_type_url,
        msgJSON,
      )
      const encodedMessage = transferMessage as { typeUrl: string; value: MsgTransfer }

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
      let txBytesString: string | undefined = undefined

      const tx = new TxClient(
        String(messageChain.chainId),
        messageChain.restUrl,
        messageChain.coinType,
        signer,
        account,
      )

      try {
        if (!ledgerEnabledEvmChains.includes(messageChain.key as SupportedChain)) {
          const wallet = await getWallet(messageChain.key as SupportedChain)
          const res = await handleCosmosTx(
            encodedMessage,
            fee,
            messageChain as SourceChain,
            wallet as LeapLedgerSigner,
            senderAddress,
            memo,
          )
          txBytesString = res.txBytesString
        } else {
          if (messageChain.key === 'injective') {
            const wallet = await getWallet(messageChain.key)

            const injectiveTx = new InjectiveTx(false, wallet as any, messageChain.restUrl)

            const channelIdData = await getClientState(
              messageChain.restUrl,
              encodedMessage.value.sourceChannel,
              'transfer',
            )

            const latest_height =
              channelIdData.data.identified_client_state.client_state.latest_height

            const height = {
              revisionHeight: latest_height.revision_height + 150,
              revisionNumber: latest_height.revision_number,
            }
            const newEncodedMessage = {
              ...encodedMessage,
              value: {
                memo: encodedMessage.value.memo,
                receiver: encodedMessage.value.receiver,
                sender: encodedMessage.value.sender,
                amount: encodedMessage.value.token,
                height: height,
                timeout: encodedMessage.value.timeoutTimestamp,
                port: encodedMessage.value.sourcePort,
                channelId: encodedMessage.value.sourceChannel,
              },
            }
            const txRaw = await injectiveTx.signTx(senderAddress, [newEncodedMessage], fee, memo)
            txBytesString = InjectiveTxClient.encode(txRaw)
          } else if (
            messageChain.key === 'dymension' ||
            messageChain.key === 'evmos' ||
            messageChain.key === 'humans'
          ) {
            const wallet = await getWallet(messageChain.key)
            const ethermintTx = new EthermintTxHandler(
              messageChain.restUrl,
              wallet as any,
              ChainInfos[messageChain.key].chainId,
              ChainInfos[messageChain.key].evmChainId,
            )
            const msgValue = encodedMessage.value as MsgTransfer
            if (!msgValue.token) {
              throw new Error('Invalid token')
            }

            txBytesString = await ethermintTx.signIbcTx({
              fromAddress: msgValue.sender,
              toAddress: msgValue.receiver,
              transferAmount: msgValue.token,
              sourcePort: msgValue.sourcePort,
              sourceChannel: msgValue.sourceChannel,
              timeoutTimestamp: undefined,
              timeoutHeight: undefined,
              fee,
              memo: memo || '',
              txMemo: msgValue.memo,
            })
          }
        }
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
        let txHash: string = ''
        let success: boolean = false
        try {
          const submitResponse = await tx.submitTx(
            String(messageChain.chainId),
            txBytesString as string,
          )
          success = submitResponse.success
          if (!success) throw new Error('SubmitTx Failed')
          txHash = submitResponse.response.tx_hash
        } catch (e: any) {
          if (e.message === 'SubmitTx Failed') {
            const { transactionHash, code, codespace } = await tx.broadcastTx(
              txBytesString as string,
            )
            txHash = transactionHash
            if (code !== 0) {
              throw new Error(`BroadcastTx Failed ${getErrorMessageFromCode(code, codespace)}`)
            }
            success = true
          } else {
            throw new Error(`BroadcastTx Failed ${getErrorMessageFromCode(e.code, e.codespace)}`)
          }
        }

        const getTxStatus = async () => {
          let index = 0
          const max = 100
          while (index <= max) {
            const txnStatus = await SkipAPI.getTxnStatus({
              chain_id: multiHopMsg.chain_id,
              tx_hash: txHash,
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
        const toAddress = associatedSeiAddress || selectedAddress?.address || ''
        const denom = selectedToken?.coinMinimalDenom || selectedToken?.ibcDenom || ''

        const pendingTx = {
          img: messageChain.icon,
          sentAmount: inputAmount,
          sentTokenInfo: {
            ...selectedToken,
            coinDenom: selectedToken?.symbol || selectedToken?.name,
          },
          sentUsdValue: '',
          subtitle1: sliceAddress(toAddress),
          title1: `${inputAmount} ${selectedToken?.symbol || selectedToken?.name}`,
          txStatus: 'loading',
          txType: isIBCTransfer ? 'ibc/transfer' : 'send',
          txHash,
          promise: getTxStatus(),
          sourceChain: sendActiveChain,
          sourceNetwork: sendSelectedNetwork,
        }

        const denomChainInfo =
          chains[(denoms[selectedToken?.coinMinimalDenom ?? '']?.chain ?? '') as SupportedChain]
        const txnLogAmountValue = await getTxnLogAmountValue(inputAmount, {
          coinGeckoId: denoms[selectedToken?.coinMinimalDenom ?? '']?.coinGeckoId,
          coinMinimalDenom: selectedToken?.coinMinimalDenom ?? '',
          chainId: getChainId(denomChainInfo, sendSelectedNetwork),
          chain: (selectedToken?.chain ?? '') as SupportedChain,
        })

        const normalizedAmount = toSmall(inputAmount.toString(), selectedToken?.coinDecimals ?? 6)
        let metadata = isIBCTransfer
          ? await getMetaDataForIbcTx(msgJSON?.source_channel, toAddress, {
              denom,
              amount: normalizedAmount,
            })
          : getMetaDataForSendTx(toAddress, {
              denom,
              amount: normalizedAmount,
            })

        metadata = { ...metadata, ...txMetadata }

        await txPostToDB({
          txHash,
          txType: isIBCTransfer ? CosmosTxType.IbcSend : CosmosTxType.Send,
          amount: txnLogAmountValue,
          metadata,
          feeDenomination: fee?.amount[0]?.denom,
          feeQuantity: fee?.amount[0]?.amount,
          forceChain: sendActiveChain,
          forceNetwork: sendSelectedNetwork,
          forceWalletAddress: activeWalletAddress,
          chainId: activeChainId,
        })

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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

  return { confirmSkipTx, txnProcessing, error, showLedgerPopupSkipTx, setError }
}
