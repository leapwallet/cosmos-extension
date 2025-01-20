import { Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk'
import { ChainInfo, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { ChainInfo as ChainKeygenInfo, getHardenedPath } from '@leapwallet/leap-keychain'
import { base64 } from '@scure/base'

export function sanitizeMovePath(path: string) {
  const segments = path.split('/')
  const addressIndex = segments[3]?.replace("'", '')
  const index = segments[5]?.replace("'", '')
  segments[3] = index
  segments[5] = addressIndex
  return segments.join('/')
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

export function getChainInfosList(chainInfos: Record<SupportedChain, ChainInfo>) {
  return Object.values(chainInfos)
    .filter((chain) => chain.enabled)
    .map((chainInfo) => {
      const chainKeygenInfo: ChainKeygenInfo = {
        addressPrefix: chainInfo.addressPrefix,
        coinType: chainInfo.bip44.coinType,
        key: chainInfo.key,
        useBip84: chainInfo.useBip84 ?? false,
        btcNetwork: chainInfo.btcNetwork,
      }
      const isMoveEvmChain = chainInfo.bip44.coinType === '637'
      if (isMoveEvmChain) chainKeygenInfo.customKeygenfn = customKeygenfnMove
      return chainKeygenInfo
    })
}
