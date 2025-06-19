export type Address = { address: string; pubKey: Uint8Array }

export type Addresses = Record<string, Record<string, Address>>

export type CustomPathAddresses = Record<string, Record<string, Address>>

export type WalletAccount = {
  index: number
  pubkey: Uint8Array | null
  path?: string
  name?: string
  address?: string
  moveAddress?: string
  evmAddress?: string
  bitcoinAddress?: string
  solanaAddress?: string
  suiAddress?: string
}
