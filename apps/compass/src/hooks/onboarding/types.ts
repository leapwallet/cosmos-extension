export type Address = { address: string; pubKey: Uint8Array }
export type Addresses = Record<number, Record<string, Address>>

export type WalletAccount = {
  address: string
  index: number
  evmAddress: string | null
  pubkey: Uint8Array | null
  path?: string
  name?: string
}
