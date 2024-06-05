import { rawSecp256k1PubkeyToRawAddress } from '@cosmjs/amino'
import { fromBase64, fromHex, toBech32 } from '@cosmjs/encoding'
import { Key, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import {
  ChainInfo,
  generateWalletFromMnemonic,
  generateWalletFromPrivateKey,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import getHDPath from '@leapwallet/cosmos-wallet-sdk/dist/browser/utils/get-hdpath'
import { decrypt } from '@leapwallet/leap-keychain'
import { Secp256k1 } from '@leapwallet/leap-keychain'

type ActionType = 'UPDATE' | 'DELETE'

export const getUpdatedKeyStore = async (
  chainInfos: Record<SupportedChain, ChainInfo>,
  password: string,
  chain: SupportedChain,
  existingWallet: Key,
  actionType: ActionType,
  chainInfo?: ChainInfo,
): Promise<Key | undefined> => {
  const addressPrefix = (chainInfos[chain] || chainInfo)?.addressPrefix
  const coinType = (chainInfos[chain] || chainInfo)?.bip44.coinType
  const hdPath = getHDPath(
    (chainInfos[chain] || chainInfo)?.bip44.coinType,
    existingWallet.addressIndex.toString(),
  )
  const secret = decrypt(existingWallet.cipher, password as string)

  if (!addressPrefix) return existingWallet
  if (actionType === 'DELETE') {
    existingWallet.pubKeys && delete existingWallet.pubKeys[chain]
    delete existingWallet.addresses[chain]
    return existingWallet
  } else if (
    existingWallet.walletType === WALLETTYPE.SEED_PHRASE ||
    existingWallet.walletType === WALLETTYPE.SEED_PHRASE_IMPORTED
  ) {
    const wallet = await generateWalletFromMnemonic(secret, hdPath, addressPrefix)
    const accounts = await wallet.getAccounts()
    const cryptoPubKey = Secp256k1.publicKeyConvert(accounts[0].pubkey, true)
    const pubKeys = existingWallet.pubKeys
      ? { ...existingWallet.pubKeys, [chain]: Buffer.from(cryptoPubKey).toString('base64') }
      : ({ [chain]: Buffer.from(cryptoPubKey).toString('base64') } as unknown as Record<
          SupportedChain,
          string
        >)
    return {
      ...existingWallet,
      addresses: {
        ...existingWallet.addresses,
        [chain]: accounts[0].address,
      },
      pubKeys,
    }
  } else if (existingWallet.walletType === WALLETTYPE.PRIVATE_KEY) {
    const wallet = await generateWalletFromPrivateKey(secret, addressPrefix, coinType)
    const accounts = await wallet.getAccounts()
    const cryptoPubKey = Secp256k1.publicKeyConvert(accounts[0].pubkey, true)
    const pubKeys = existingWallet.pubKeys
      ? { ...existingWallet.pubKeys, [chain]: Buffer.from(cryptoPubKey).toString('base64') }
      : ({ [chain]: Buffer.from(cryptoPubKey).toString('base64') } as unknown as Record<
          SupportedChain,
          string
        >)
    return {
      ...existingWallet,
      addresses: {
        ...existingWallet.addresses,
        [chain]: accounts[0].address,
      },
      pubKeys,
    }
  } else if (existingWallet.walletType === WALLETTYPE.LEDGER) {
    if (coinType === '60' || coinType === '931') return existingWallet
    const pubKeyVal = existingWallet.pubKeys
      ? fromBase64(Object.values(existingWallet.pubKeys)[0])
      : fromHex(secret)
    const compressedPubKey = rawSecp256k1PubkeyToRawAddress(
      Secp256k1.publicKeyConvert(pubKeyVal, true),
    )

    const address = toBech32(addressPrefix, compressedPubKey)
    let pubKeyString
    if (existingWallet.pubKeys) {
      pubKeyString = Object.values(existingWallet.pubKeys)[0]
    } else {
      const rawPubKey = Secp256k1.publicKeyConvert(fromHex(secret), true)
      pubKeyString = Buffer.from(rawPubKey).toString('base64')
    }

    const pubKeys = existingWallet.pubKeys
      ? {
          ...existingWallet.pubKeys,
          [chain]: pubKeyString,
        }
      : ({
          [chain]: pubKeyString,
        } as Record<SupportedChain, string>)

    const addresses = existingWallet.addresses[chain]
      ? existingWallet.addresses
      : { ...existingWallet.addresses, [chain]: address }

    return {
      ...existingWallet,
      addresses,
      pubKeys,
    }
  }
}
