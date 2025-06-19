import { rawSecp256k1PubkeyToRawAddress } from '@cosmjs/amino'
import { fromBase64, fromHex, toBech32 } from '@cosmjs/encoding'
import { Key, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import {
  ChainInfo,
  pubKeyToEvmAddressToShow,
  SupportedChain,
  validateSuiPrivateKey,
} from '@leapwallet/cosmos-wallet-sdk'
import { decrypt } from '@leapwallet/leap-keychain'
import {
  generateWalletFromMnemonic,
  generateWalletFromPrivateKey,
  getFullHDPath,
  Secp256k1,
} from '@leapwallet/leap-keychain'
import { validateSolanaPrivateKey } from 'extension-scripts/utils'
import {
  customKeygenfnMove,
  customKeygenfnSolana,
  customKeygenfnSui,
} from 'utils/getChainInfosList'

type ActionType = 'UPDATE' | 'DELETE'

export const getUpdatedKeyStore = async (
  chainInfos: Record<SupportedChain, ChainInfo>,
  password: Uint8Array,
  chain: SupportedChain,
  existingWallet: Key,
  actionType: ActionType,
  _chainInfo?: ChainInfo,
): Promise<Key | undefined> => {
  if (existingWallet.watchWallet) {
    return existingWallet
  }
  const chainInfo = _chainInfo ?? chainInfos[chain]
  const addressPrefix = chainInfo?.addressPrefix
  const coinType = chainInfo?.bip44.coinType
  const purpose = chainInfo?.useBip84 ? '84' : '44'
  const hdPath = getFullHDPath(
    purpose,
    (chainInfos[chain] || chainInfo)?.bip44.coinType,
    existingWallet.addressIndex.toString(),
  )
  const btcNetwork = (chainInfos[chain] || chainInfo)?.btcNetwork
  const secret = decrypt(existingWallet.cipher, password)

  if (!addressPrefix) return existingWallet
  if (actionType === 'DELETE') {
    existingWallet.pubKeys && delete existingWallet.pubKeys[chain]
    delete existingWallet.addresses[chain]
    return existingWallet
  } else if (
    existingWallet.walletType === WALLETTYPE.SEED_PHRASE ||
    existingWallet.walletType === WALLETTYPE.SEED_PHRASE_IMPORTED
  ) {
    if (coinType === '637') {
      const account = await customKeygenfnMove(secret, hdPath, 'seedPhrase')
      const pubKeys = existingWallet.pubKeys
        ? { ...existingWallet.pubKeys, [chain]: account.pubkey }
        : ({ [chain]: account.pubkey } as unknown as Record<SupportedChain, string>)
      return {
        ...existingWallet,
        addresses: {
          ...existingWallet.addresses,
          [chain]: account.address,
        },
        pubKeys,
      }
    } else if (coinType === '501') {
      const account = await customKeygenfnSolana(secret, hdPath, 'seedPhrase')
      const pubKeys = existingWallet.pubKeys
        ? { ...existingWallet.pubKeys, [chain]: account.pubkey }
        : ({ [chain]: account.pubkey } as unknown as Record<SupportedChain, string>)
      return {
        ...existingWallet,
        addresses: {
          ...existingWallet.addresses,
          [chain]: account.address,
        },
        pubKeys,
      }
    } else if (coinType === '784') {
      const account = await customKeygenfnSui(secret, hdPath, 'seedPhrase')
      const pubKeys = existingWallet.pubKeys
        ? { ...existingWallet.pubKeys, [chain]: account.pubkey }
        : ({ [chain]: account.pubkey } as unknown as Record<SupportedChain, string>)
      return {
        ...existingWallet,
        addresses: {
          ...existingWallet.addresses,
          [chain]: account.address,
        },
        pubKeys,
      }
    } else {
      const wallet = generateWalletFromMnemonic(secret, {
        hdPath,
        addressPrefix,
        ethWallet: false,
        btcNetwork,
      })
      const accounts = wallet.getAccounts()
      if (!accounts[0].pubkey) return existingWallet
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
    }
  } else if (existingWallet.walletType === WALLETTYPE.PRIVATE_KEY) {
    if (validateSolanaPrivateKey(secret).isValid) {
      if (coinType === '501') {
        const account = await customKeygenfnSolana(secret, hdPath, 'privateKey')
        const pubKeys = existingWallet.pubKeys
          ? { ...existingWallet.pubKeys, [chain]: account.pubkey }
          : ({ [chain]: account.pubkey } as unknown as Record<SupportedChain, string>)
        return {
          ...existingWallet,
          addresses: {
            ...existingWallet.addresses,
            [chain]: account.address,
          },
          pubKeys,
        }
      }
      return existingWallet
    }
    if (coinType === '501') {
      return existingWallet
    }
    if (validateSuiPrivateKey(secret)) {
      if (coinType === '784') {
        const account = await customKeygenfnSui(secret, hdPath, 'privateKey')
        const pubKeys = existingWallet.pubKeys
          ? { ...existingWallet.pubKeys, [chain]: account.pubkey }
          : ({ [chain]: account.pubkey } as unknown as Record<SupportedChain, string>)
        return {
          ...existingWallet,
          addresses: {
            ...existingWallet.addresses,
            [chain]: account.address,
          },
          pubKeys,
        }
      }
      return existingWallet
    }

    if (coinType === '784') {
      return existingWallet
    }
    if (coinType === '637') {
      try {
        const account = await customKeygenfnMove(secret, hdPath, 'privateKey')
        const pubKeys = existingWallet.pubKeys
          ? { ...existingWallet.pubKeys, [chain]: account.pubkey }
          : ({ [chain]: account.pubkey } as unknown as Record<SupportedChain, string>)
        return {
          ...existingWallet,
          addresses: {
            ...existingWallet.addresses,
            [chain]: account.address,
          },
          pubKeys,
        }
      } catch (error) {
        return existingWallet
      }
    } else {
      const wallet = generateWalletFromPrivateKey(secret, hdPath, addressPrefix, btcNetwork)
      const accounts = wallet.getAccounts()
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
    }
  } else if (existingWallet.walletType === WALLETTYPE.LEDGER) {
    if (
      coinType === '931' ||
      coinType === '0' ||
      coinType === '1' ||
      coinType === '637' ||
      coinType === '501' ||
      coinType === '784'
    ) {
      return existingWallet
    }
    const sameCoinTypeChains = Object.values(chainInfos).filter(
      (chain) => chain.bip44.coinType === coinType,
    )

    const existingPubKeys = existingWallet.pubKeys

    if (!existingPubKeys) {
      return existingWallet
    }
    const chainWithPubKey = sameCoinTypeChains?.find((chain) => !!existingPubKeys[chain.key])
    if (!chainWithPubKey) {
      return existingWallet
    }
    const pubKeyString = existingPubKeys[chainWithPubKey.key]
    const pubKeyVal = fromBase64(pubKeyString)

    let compressedPubKey = rawSecp256k1PubkeyToRawAddress(
      Secp256k1.publicKeyConvert(pubKeyVal, true),
    )
    if (coinType === '60') {
      const hexAddress = pubKeyToEvmAddressToShow(pubKeyString)
      compressedPubKey = fromHex(hexAddress.replace('0x', ''))
    }
    const address = toBech32(addressPrefix, compressedPubKey)
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
