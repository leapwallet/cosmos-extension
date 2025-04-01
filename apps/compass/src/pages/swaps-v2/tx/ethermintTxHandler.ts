import { StdFee } from '@cosmjs/stargate'
import { ChainInfos, EthermintTxHandler, LeapLedgerSignerEth } from '@leapwallet/cosmos-wallet-sdk'
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx'
import { SourceChain } from 'types/swap'

export async function handleEthermintTx(
  messageChain: SourceChain,
  wallet: LeapLedgerSignerEth,
  encodedMessage: { typeUrl: string; value: MsgTransfer },
  fee: StdFee,
) {
  const ethermintTx = new EthermintTxHandler(
    messageChain.restUrl ?? '',
    wallet,
    ChainInfos[messageChain.key].chainId,
    ChainInfos[messageChain.key].evmChainId,
  )
  const msgValue = encodedMessage.value
  if (!msgValue.token) {
    throw new Error('Invalid token')
  }

  return await ethermintTx.signIbcTx({
    fromAddress: msgValue.sender,
    toAddress: msgValue.receiver,
    transferAmount: msgValue.token,
    sourcePort: msgValue.sourcePort,
    sourceChannel: msgValue.sourceChannel,
    timeoutTimestamp: undefined,
    timeoutHeight: undefined,
    fee,
    memo: '',
    txMemo: msgValue.memo,
  })
}
