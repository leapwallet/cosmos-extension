import { EncodeObject, OfflineSigner, TxBodyEncodeObject } from '@cosmjs/proto-signing'
import { StdFee } from '@cosmjs/stargate'
import { LuminaTxClient } from '@leapwallet/cosmos-wallet-hooks'
import { BigNumber } from '@leapwallet/cosmos-wallet-sdk/dist/browser/proto/injective/utils/classes'
import { base64 } from '@scure/base'
import { TxClient } from 'lumina-node-wasm'
import { nmsStore } from 'stores/balance-store'

export class LuminaTxClientWasm extends LuminaTxClient {
  async signAndBroadcastTx(
    signerAddress: string,
    msgs: EncodeObject[],
    fee: StdFee | 'auto' | number,
    memo = '',
  ) {
    if (!this.wallet) throw new Error('Wallet not found')
    const grpcUrl = nmsStore.grpcWebEndpoints['celestia'][0].nodeUrl

    const accounts = await this.wallet.getAccounts()
    const pubkey = accounts[0].pubkey

    const wallet = this.wallet
    const signerFn = async (signDoc: any): Promise<Uint8Array> => {
      //@ts-expect-error - sign direct is available on the wallet
      const signedTx = await wallet.signDirect(signerAddress, signDoc)
      return base64.decode(signedTx.signature.signature)
    }

    const txClient = await new TxClient(grpcUrl, signerAddress, pubkey, signerFn)
    const txBodyEncodeObject: TxBodyEncodeObject = {
      typeUrl: '/cosmos.tx.v1beta1.TxBody',
      value: {
        messages: msgs,
        memo: memo,
      },
    }

    const msg = this.registry.encodeAsAny(msgs[0])
    const _fee = fee as StdFee

    const gasPrice = new BigNumber(_fee.amount[0].amount).div(_fee.gas)

    const res = await txClient.submitMessage(msg, {
      gasLimit: BigInt(_fee.gas),
      gasPrice: gasPrice.toNumber(),
      memo,
    })
    return res.hash
  }
  setWallet(wallet: OfflineSigner) {
    this.wallet = wallet
  }
}
