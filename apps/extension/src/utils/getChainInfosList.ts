import { Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk'
import { ChainInfo, SupportedChain, validateSuiPrivateKey } from '@leapwallet/cosmos-wallet-sdk'
import { ChainInfo as ChainKeygenInfo, getHardenedPath } from '@leapwallet/leap-keychain'
import { ed25519 } from '@noble/curves/ed25519'
import { blake2b } from '@noble/hashes/blake2b'
import { base64, bech32 } from '@scure/base'
import { PublicKey } from '@solana/web3.js'
import * as bip39 from 'bip39'
import { mnemonicToSeedSync } from 'bip39'
import { validateSolanaPrivateKey } from 'extension-scripts/utils'
import slip10, { HDKey } from 'micro-key-producer/slip10.js'

export function sanitizeMovePath(path: string) {
  const segments = path.split('/')
  const addressIndex = segments[3]?.replace("'", '')
  const index = segments[5]?.replace("'", '')
  segments[3] = index
  segments[5] = addressIndex
  return segments.join('/')
}

export function sanitizeSolanaPath(path: string) {
  const segments = path.split('/')
  const formatted = ['m', "44'", "501'", `${segments[5]}'`, `${segments[4]}'`]
  return formatted.join('/')
}

export function sanitizeSuiPath(path: string) {
  const segments = path.split('/')
  const formatted = ['m', "44'", "784'", `${segments[5]}'`, `${segments[4]}'`, "0'"]
  return formatted.join('/')
}

export async function customKeygenfnMove(
  key: string,
  path: string,
  type: 'seedPhrase' | 'privateKey',
) {
  path = sanitizeMovePath(path)
  if (type === 'privateKey') {
    const account = Account.fromPrivateKey({
      privateKey: new Ed25519PrivateKey(key),
    })
    return {
      address: account.accountAddress.toString(),
      pubkey: base64.encode(account.publicKey.toUint8Array()),
      privateKey: account.privateKey.toHexString(),
      signer: account,
    }
  }

  const account = Account.fromDerivationPath({
    mnemonic: key,
    path: getHardenedPath(path),
  })
  return {
    address: account.accountAddress.toString(),
    pubkey: base64.encode(account.publicKey.toUint8Array()),
    privateKey: account.privateKey.toHexString(),
    signer: account,
  }
}

export async function customKeygenfnSolana(
  key: string,
  path: string,
  type: 'seedPhrase' | 'privateKey',
) {
  path = sanitizeSolanaPath(path)
  if (type === 'privateKey') {
    const { isValid, publicAddress, privateKey } = validateSolanaPrivateKey(key)
    if (!isValid) {
      return {
        address: '',
        pubkey: '',
        privateKey: key,
        signer: null,
      }
    }
    return {
      address: publicAddress,
      pubkey: publicAddress,
      privateKey: privateKey,
      signer: privateKey,
    }
  }

  const seed: Buffer = bip39.mnemonicToSeedSync(key, '')

  const hdkey = HDKey.fromMasterSeed(seed)
  const hdkey1 = hdkey.derive(path)
  const privateKey = hdkey1.privateKey
  const publicKey = new PublicKey(hdkey1.publicKeyRaw).toBase58()

  return {
    address: publicKey,
    pubkey: publicKey,
    privateKey: privateKey,
    signer: privateKey,
  }
}

export async function customKeygenfnSui(
  key: string,
  path: string,
  type: 'seedPhrase' | 'privateKey',
) {
  path = sanitizeSuiPath(path)
  if (type === 'privateKey') {
    const decoded = bech32.decode(key as unknown as `suiprivkey1${string}`)
    const bytes = bech32.fromWords(decoded.words)
    const privateKeyBytes = bytes.slice(1)

    const publicKey = ed25519.getPublicKey(privateKeyBytes)

    const SCHEME_FLAG = new Uint8Array([0x00])
    const addressBytes = new Uint8Array(SCHEME_FLAG.length + publicKey.length)
    addressBytes.set(SCHEME_FLAG, 0)
    addressBytes.set(publicKey, SCHEME_FLAG.length)

    const hashedAddressBytes = blake2b(addressBytes, { dkLen: 32 })
    const suiAddress = '0x' + Buffer.from(hashedAddressBytes).toString('hex')
    const signerArray = [...Array.from(privateKeyBytes), ...Array.from(publicKey)]
    const signer = new Uint8Array(signerArray)
    return {
      address: suiAddress,
      pubkey: Buffer.from(publicKey).toString('hex'),
      privateKey: key,
      signer: signer,
    }
  }

  const seed = mnemonicToSeedSync(key, '')

  const hdkey = slip10.fromMasterSeed(seed)
  const derived = hdkey.derive(path)

  const publicKey = derived.publicKeyRaw
  const privateKey = derived.privateKey

  const SCHEME_FLAG = new Uint8Array([0x00])

  const addressBytes = new Uint8Array(SCHEME_FLAG.length + publicKey.length)
  addressBytes.set(SCHEME_FLAG, 0)
  addressBytes.set(publicKey, SCHEME_FLAG.length)
  const hashedAddressBytes = blake2b(addressBytes, { dkLen: 32 })
  const suiAddress = '0x' + Buffer.from(hashedAddressBytes).toString('hex')

  const suiPrivkey33 = new Uint8Array(33)
  suiPrivkey33.set(SCHEME_FLAG, 0)
  suiPrivkey33.set(privateKey, 1)

  const words = bech32.toWords(suiPrivkey33)
  const bech32Privkey = bech32.encode('suiprivkey', words)

  const signerArray = [...Array.from(privateKey), ...Array.from(publicKey)]
  const signer = new Uint8Array(signerArray)

  return {
    address: suiAddress,
    pubkey: Buffer.from(publicKey).toString('hex'),
    privateKey: bech32Privkey,
    signer: signer,
  }
}

export function getChainInfosList(
  chainInfos: Record<SupportedChain, ChainInfo>,
  walletType: 'seed' | 'privateKey',
  key?: string,
) {
  const isSolanaPrivateKey =
    walletType === 'privateKey' && key && validateSolanaPrivateKey(key).isValid

  const isSuiPrivateKey = walletType === 'privateKey' && key && validateSuiPrivateKey(key)

  return Object.values(chainInfos)
    .filter((chain) => {
      if (isSolanaPrivateKey) {
        return chain.enabled && chain.bip44.coinType === '501'
      }
      if (isSuiPrivateKey) {
        return chain.enabled && chain.bip44.coinType === '784'
      }
      if (walletType === 'seed') {
        return chain.enabled
      }
      return chain.enabled && !['784', '501'].includes(chain.bip44.coinType)
    })
    .map((chainInfo) => {
      const chainKeygenInfo: ChainKeygenInfo = {
        addressPrefix: chainInfo.addressPrefix,
        coinType: chainInfo.bip44.coinType,
        key: chainInfo.key,
        useBip84: chainInfo.useBip84 ?? false,
        btcNetwork: chainInfo.btcNetwork,
      }
      const isMoveEvmChain = chainInfo.bip44.coinType === '637'
      const isSolanaChain = chainInfo.bip44.coinType === '501'
      const isSuiChain = chainInfo.bip44.coinType === '784'
      if (isMoveEvmChain) chainKeygenInfo.customKeygenfn = customKeygenfnMove
      if (isSolanaChain) chainKeygenInfo.customKeygenfn = customKeygenfnSolana
      if (isSuiChain) chainKeygenInfo.customKeygenfn = customKeygenfnSui
      return chainKeygenInfo
    })
}
