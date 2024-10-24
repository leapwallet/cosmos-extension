/* eslint-disable @typescript-eslint/ban-ts-comment */
import { StdFee } from '@cosmjs/stargate'
import { getClientState, InjectiveTx, LeapLedgerSignerEth } from '@leapwallet/cosmos-wallet-sdk'
import { TxClient } from '@leapwallet/cosmos-wallet-sdk/dist/browser/proto/injective/core/modules'
import { MsgExecuteContract } from '@leapwallet/cosmos-wallet-sdk/dist/browser/proto/osmosis/cosmwasm/wasm/v1/tx'
import BigNumber from 'bignumber.js'
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx'
import { SourceChain } from 'types/swap'

export async function handleInjectiveTx(
  wallet: LeapLedgerSignerEth,
  messageChain: SourceChain,
  _encodedMessage: { typeUrl: string; value: MsgTransfer | MsgExecuteContract },
  senderAddress: string,
  fee: StdFee,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawMessage: { typeUrl: string; message: any },
) {
  const injectiveTx = new InjectiveTx(false, wallet, messageChain.restUrl)

  if (_encodedMessage.typeUrl === '/ibc.applications.transfer.v1.MsgTransfer') {
    const encodedMessage = _encodedMessage as { typeUrl: string; value: MsgTransfer }

    const channelIdData = await getClientState(
      messageChain.restUrl,
      encodedMessage.value.sourceChannel,
      'transfer',
    )

    const latest_height = channelIdData.data.identified_client_state.client_state.latest_height

    const height = {
      revisionHeight: new BigNumber(latest_height.revision_height).plus(150).toString(),
      revisionNumber: latest_height.revision_number,
    }

    const newEncodedMessage = {
      ...encodedMessage,
      value: {
        memo: encodedMessage.value.memo,
        sender: encodedMessage.value.sender,
        receiver: encodedMessage.value.receiver,
        amount: encodedMessage.value.token,
        height,
        timeout: encodedMessage.value.timeoutTimestamp,
        port: encodedMessage.value.sourcePort,
        channelId: encodedMessage.value.sourceChannel,
      },
    }
    const txRaw = await injectiveTx.signTx(senderAddress, [newEncodedMessage], fee, '')
    const txBytesString = TxClient.encode(txRaw)
    return { txRaw, txBytesString }
  } else if (_encodedMessage.typeUrl === '/cosmwasm.wasm.v1.MsgExecuteContract') {
    const encodedMessage = _encodedMessage as { typeUrl: string; value: MsgExecuteContract }
    const newEncodedMessage = {
      typeUrl: rawMessage.typeUrl,
      value: {
        sender: encodedMessage.value.sender,
        contractAddress: encodedMessage.value.contract,
        msg: rawMessage.message.msg,
        funds: encodedMessage.value.funds,
      },
    }
    const txRaw = await injectiveTx.signTx(senderAddress, [newEncodedMessage], fee, '')
    const txBytesString = TxClient.encode(txRaw)
    return { txRaw, txBytesString }
  } else {
    throw new Error('Unsupported Transaction type')
  }
}
