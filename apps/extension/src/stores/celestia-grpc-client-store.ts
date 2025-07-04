import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { BaseQueryStore, IRawBalanceResponse } from '@leapwallet/cosmos-wallet-store'
import { base64 } from '@scure/base'
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { TxClient } from 'lumina-node-wasm'
import { makeObservable, runInAction } from 'mobx'

const pagination = {
  next_key: 'celestia',
  total: '100',
}

export class CelestiaBalanceStore extends BaseQueryStore<IRawBalanceResponse> {
  type: 'balances' | 'spendable_balances'
  address: string
  restUrl: string
  publicKey: string
  chain: SupportedChain
  paginationLimit: number
  override: boolean = false

  constructor(
    restUrl: string,
    address: string,
    chain: SupportedChain,
    type: 'balances' | 'spendable_balances',
    paginationLimit: number = 1000,
    publicKey: string,
  ) {
    super()
    makeObservable(this)
    this.address = address
    this.type = type
    this.restUrl = restUrl
    this.publicKey = publicKey
    this.chain = chain
    this.paginationLimit = paginationLimit
  }

  async toggleOverride() {
    runInAction(() => {
      this.override = !this.override
    })
  }

  async fetchData() {
    const pubkey = base64.decode(this.publicKey)
    const dummySignerFn = (arg: SignDoc): Promise<Uint8Array> => {
      return new Promise((resolve, reject) => {
        resolve(new Uint8Array())
      })
    }
    // we are using dummy values for public key and signer function as we don't need them for this use case
    const txClient = await new TxClient(
      this.restUrl,
      this.address,
      pubkey,
      //@ts-expect-error - this is a dummy function
      dummySignerFn,
    )

    if (this.type === 'spendable_balances') {
      const spendableBalances = await txClient.getSpendableBalances(this.address)
      return {
        balances: spendableBalances.map((balance) => ({
          denom: balance.denom,
          amount: balance.amount.toString(),
        })),
        pagination,
      }
    }
    const balances = await txClient.getAllBalances(this.address)
    return {
      balances: balances.map((balance) => ({
        denom: balance.denom,
        amount: balance.amount.toString(),
      })),
      pagination,
    }
  }
}
