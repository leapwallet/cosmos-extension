import { makeCosmoshubPath } from '@cosmjs/amino'
import { AccountData, DirectSecp256k1HdWallet, OfflineSigner } from '@cosmjs/proto-signing'
import { Key, useChainsStore, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import {
  ChainInfos,
  generateWalletFromMnemonic,
  getLedgerTransport,
  LeapLedgerSigner,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import getHDPath from '@leapwallet/cosmos-wallet-sdk/dist/utils/get-hdpath'
import { KeyChain } from '@leapwallet/leap-keychain'
import { encrypt } from '@leapwallet/leap-keychain'
import {
  ACTIVE_CHAIN,
  ACTIVE_WALLET,
  BETA_CHAINS,
  CONNECTIONS,
  ENCRYPTED_ACTIVE_WALLET,
  ENCRYPTED_KEY_STORE,
  KEYSTORE,
  PRIMARY_WALLET_ADDRESS,
} from 'config/storage-keys'
import { useAuth } from 'context/auth-context'
import { useChainInfos } from 'hooks/useChainInfos'
import { useCallback, useEffect, useMemo, useState } from 'react'
import correctMnemonic from 'utils/correct-mnemonic'
import { getChainInfosList } from 'utils/getChainInfosList'
import browser from 'webextension-polyfill'
import extension from 'webextension-polyfill'

import { useActiveChain } from '../settings/useActiveChain'
import useActiveWallet from '../settings/useActiveWallet'
import { usePassword } from '../settings/usePassword'
import { SeedPhrase } from './seed-phrase/useSeedPhrase'

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Wallet {
  export type Keystore = Record<string, Key>

  export async function storeWallets(newWallets: Record<string, Key>): Promise<void> {
    const data = await browser.storage.local.get([KEYSTORE])
    const keystore: Keystore[] = data[KEYSTORE] ?? {}
    const newKeystore = { ...keystore, ...newWallets }
    const newWalletEntries = Object.keys(newWallets)
    const lastEntry = newWalletEntries[0]
    return await browser.storage.local.set({
      [KEYSTORE]: newKeystore,
      [ACTIVE_WALLET]: newWallets[lastEntry],
      [ACTIVE_CHAIN]: ChainInfos.cosmos.key,
    })
  }

  export async function getAccountDetails(
    mnemonic: string,
  ): Promise<{ accounts: readonly AccountData[]; mainWallet: DirectSecp256k1HdWallet }> {
    const hdPath = getHDPath(ChainInfos.cosmos.bip44.coinType)
    const mainWallet = await generateWalletFromMnemonic(
      mnemonic,
      hdPath,
      ChainInfos.cosmos.addressPrefix,
    )
    const accounts = await mainWallet.getAccounts()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return { accounts, mainWallet }
  }

  export type WalletAccount = {
    account: AccountData
    wallet: OfflineSigner
    index: number
  }

  export function useRemoveWallet() {
    const { activeWallet, setActiveWallet } = useActiveWallet()
    const auth = useAuth()

    const removeAll = async (signout = true) => {
      await browser.storage.local.set({
        [KEYSTORE]: null,
        [ACTIVE_WALLET]: null,
        [ENCRYPTED_KEY_STORE]: null,
        [ENCRYPTED_ACTIVE_WALLET]: null,
        [CONNECTIONS]: null,
        [BETA_CHAINS]: null,
        [ACTIVE_CHAIN]: ChainInfos.cosmos.key,
      })

      await setActiveWallet(null)

      if (signout) auth?.signout()
    }

    const removeWallets = async (keyIds: string[]) => {
      await browser.storage.local.get([KEYSTORE]).then((data) => {
        const _storedWallets: Keystore = data[KEYSTORE]

        keyIds.forEach((keyId) => {
          delete _storedWallets[keyId]
        })

        // TODO: wallet type based updation
        if (Object.keys(_storedWallets ?? {}).length === 0) {
          removeAll()
        } else {
          if (keyIds.includes(activeWallet?.id ?? '') && Object.values(_storedWallets).length > 0) {
            setActiveWallet(Object.values(_storedWallets)[0])
          }
          browser.storage.local.set({
            [KEYSTORE]: _storedWallets,
          })
        }
      })
    }

    return { removeAll, removeWallets }
  }

  export function getAllWallets() {
    return KeyChain.getAllWallets()
  }

  export function useWallets() {
    const [wallets, setWallets] = useState<Keystore | undefined>(undefined)
    useEffect(() => {
      KeyChain.getAllWallets().then((keystore) => setWallets(keystore))
    }, [])

    useEffect(() => {
      browser.storage.local.onChanged.addListener((changes) => {
        const keystoreChanges = changes[
          KEYSTORE
        ] as unknown as browser.Storage.StorageAreaOnChangedChangesType
        if (keystoreChanges) {
          const newKeystore = keystoreChanges.newValue
          setWallets(newKeystore)
        }
      })
    }, [])
    return wallets
  }

  export function useCreateNewWallet() {
    const { chains } = useChainsStore()
    const password = usePassword()
    const { setActiveWallet } = useActiveWallet()

    return useCallback(
      async ({
        name,
        colorIndex,
        forcePassword,
      }: {
        name: string
        colorIndex: number
        forcePassword?: string
      }) => {
        const wallets = await KeyChain.getAllWallets()
        const hasPrimaryWallet = Object.values(wallets).find(
          (wallet) => wallet.walletType === WALLETTYPE.SEED_PHRASE,
        )
        if (!hasPrimaryWallet) {
          window.open(
            extension.runtime.getURL(
              `index.html#/onboarding?name=${name}&colorIndex=${colorIndex}`,
            ),
          )
          return ''
        }
        const otherWallet = Object.values(wallets).find(
          (v) => v.name.toLowerCase() === name.toLowerCase(),
        )
        if (otherWallet) return 'Wallet name already exists'
        const chainInfosList = getChainInfosList(chains)
        const newWallet = await KeyChain.createNewWalletAccount(
          name,
          (forcePassword ?? password) as string,
          colorIndex,
          chainInfosList,
        )
        if (newWallet) await setActiveWallet(newWallet)
        else return 'Wallet already exists'
      },
      [password, setActiveWallet, chains],
    )
  }

  export function useFirstWalletCosmosAddress() {
    const wallets = useWallets()

    const firstWallet = useMemo(() => {
      if (!wallets) {
        return undefined
      }

      const seedPhraseWallets = Object.values(wallets)
        .filter((wallet) => wallet.walletType === WALLETTYPE.SEED_PHRASE)
        .sort((a, b) => a.addressIndex - b.addressIndex)

      if (seedPhraseWallets.length > 0) {
        return seedPhraseWallets[0]
      }

      const otherWallets = Object.values(wallets).sort((a, b) => {
        // compare IDs as there is no address index for non-seed-phrase wallets
        return a.id.localeCompare(b.id)
      })

      if (otherWallets.length > 0) {
        return otherWallets[0]
      }

      return undefined
    }, [wallets])

    return firstWallet ? firstWallet.addresses.cosmos : undefined
  }

  // eslint-disable-next-line no-inner-declarations
  function useLastWalletNumber() {
    const wallets = useWallets()

    const walletsList = useMemo(() => {
      return wallets
        ? Object.values(wallets)
            .filter((wallet) => wallet.walletType === WALLETTYPE.SEED_PHRASE)
            .sort((a, b) => a.addressIndex - b.addressIndex)
        : []
    }, [wallets])

    const lastWalletNumber: number | undefined = walletsList[walletsList.length - 1]?.addressIndex

    return lastWalletNumber
  }

  type importMultipleWalletAccountsParams = {
    mnemonic: string
    selectedAddressIndexes: number[]
    password: string
    type: 'import' | 'create'
  }

  // Import multiple wallet accounts from the same seed phrase
  export function useImportMultipleWalletAccounts() {
    const chainInfos = useChainInfos()
    const { setActiveWallet } = useActiveWallet()

    return useCallback(
      async ({
        mnemonic,
        selectedAddressIndexes,
        password,
      }: importMultipleWalletAccountsParams) => {
        const correctedMnemonic = correctMnemonic(mnemonic)
        const chainInfosList = getChainInfosList(chainInfos)
        if (SeedPhrase.validateSeedPhrase(correctedMnemonic)) {
          // here assumption is there are no wallet-accounts currently in the wallet
          // when this changes - make sure the addressIndex is handled properly
          let i = 0
          const allWallets = new Array(selectedAddressIndexes.length)
          const sortedAddressIndices = selectedAddressIndexes.sort()

          for (const addressIndex of sortedAddressIndices) {
            // we want to consider the previously imported wallets
            const walletIndex = addressIndex
            const wallet = await KeyChain.createWalletUsingMnemonic({
              name: `Wallet ${walletIndex + 1}`,
              // send in the address index specific to this seed phrase to generate the wallet at that index
              addressIndex: addressIndex,
              mnemonic: correctedMnemonic,
              password: password,
              colorIndex: walletIndex,
              chainInfos: chainInfosList,
              type: 'create',
            })
            allWallets[i] = wallet
            i++
          }
          setActiveWallet(allWallets[0])
        } else {
          let i = 0
          const allWallets = new Array(selectedAddressIndexes.length)
          for (const addressIndex of selectedAddressIndexes) {
            const wallet = await KeyChain.importNewWallet(
              mnemonic.trim(),
              password,
              chainInfosList,
              Number(addressIndex),
              `Wallet ${addressIndex + 1}`,
            )
            allWallets[i] = wallet
            i++
          }
          setActiveWallet(allWallets[0])
        }
      },
      [chainInfos, setActiveWallet],
    )
  }

  type importWalletArgs = {
    privateKey: string
    addressIndex: string
    forcePassword?: string
    type?: 'create' | 'import'
    name?: string
    colorIndex?: number
    password: string
  }

  export function useImportWallet() {
    const chainInfos = useChainInfos()

    const { setActiveWallet } = useActiveWallet()
    const walletIndex = (useLastWalletNumber() ?? 0) + 2

    return useCallback(
      async ({
        privateKey,
        addressIndex,
        forcePassword,
        name,
        colorIndex,
        password,
      }: importWalletArgs) => {
        let newWallet: Key
        const correctedMnemonic = correctMnemonic(privateKey)
        const chainInfosList = getChainInfosList(chainInfos)
        if (SeedPhrase.validateSeedPhrase(correctedMnemonic)) {
          newWallet = await KeyChain.createWalletUsingMnemonic({
            name: name ?? `Wallet ${walletIndex}`,
            mnemonic: correctedMnemonic,
            password: (forcePassword ?? password) as string,
            addressIndex: Number(addressIndex),
            colorIndex: colorIndex ?? walletIndex,
            chainInfos: chainInfosList,
            type: 'import',
          })
        } else {
          newWallet = await KeyChain.importNewWallet(
            privateKey.trim(),
            (forcePassword ?? password) as string,
            chainInfosList,
            Number(addressIndex),
            `Wallet ${walletIndex}`,
          )
        }
        if (newWallet) setActiveWallet(newWallet)
        else throw new Error('Wallet already exists')
      },
      [setActiveWallet, walletIndex, chainInfos],
    )
  }

  // eslint-disable-next-line no-inner-declarations
  export async function saveLedgerWallet({
    addresses,
    password,
    pubKeys,
  }: {
    addresses: Record<
      number,
      {
        chainAddresses: Record<string, { address: string; pubKey: Uint8Array }>
        name?: string
        colorIndex?: number
      }
    >
    password: string
    pubKeys: Uint8Array[]
  }) {
    const allWallets = await KeyChain.getAllWallets()
    const lastIndex = Object.keys(allWallets ?? {}).length
    const storage = await browser.storage.local.get([PRIMARY_WALLET_ADDRESS])
    const hasPrimaryWallet = storage[PRIMARY_WALLET_ADDRESS]

    const newWallets = Object.entries(addresses).reduce(
      (acc: Record<string, Key>, addressEntries, currentIndex) => {
        const [addressIndex, addressInfo] = addressEntries
        const { name, chainAddresses, colorIndex } = addressInfo
        const walletId = crypto.randomUUID()
        if (currentIndex === 0 && !hasPrimaryWallet) {
          browser.storage.local.set({ [PRIMARY_WALLET_ADDRESS]: chainAddresses.cosmos })
        }
        const { addresses, chainPubKeys } = Object.entries(chainAddresses).reduce(
          (
            acc: { addresses: Record<string, string>; chainPubKeys: Record<string, string> },
            [chain, { address, pubKey }],
          ) => {
            acc.addresses[chain] = address
            acc.chainPubKeys[chain] = Buffer.from(pubKey).toString('base64')
            return acc
          },
          { addresses: {}, chainPubKeys: {} },
        )

        acc[walletId] = {
          walletType: WALLETTYPE.LEDGER,
          name: name ?? `Wallet ${lastIndex + currentIndex + 1}`,
          addresses,
          addressIndex: parseInt(addressIndex),
          cipher: encrypt(Buffer.from(pubKeys[currentIndex]).toString('hex'), password),
          id: walletId,
          colorIndex: colorIndex ?? currentIndex,
          pubKeys: chainPubKeys,
        }
        return acc
      },
      {},
    )
    await storeWallets(newWallets)
    return newWallets
  }

  export function useSaveLedgerWallet() {
    const password = usePassword()
    const { setActiveWallet } = useActiveWallet()
    return useCallback(
      async ({
        addresses,
        password,
        pubKeys,
      }: {
        addresses: Record<
          number,
          {
            chainAddresses: Record<string, { address: string; pubKey: Uint8Array }>
            name?: string
            colorIndex?: number
          }
        >
        password: string
        pubKeys: Uint8Array[]
      }) => {
        const wallets = await saveLedgerWallet({
          addresses,
          password: password as string,
          pubKeys,
        })
        setActiveWallet(wallets[0])

        return wallets
      },

      // eslint-disable-next-line react-hooks/exhaustive-deps
      [password],
    )
  }

  export function useGetWallet() {
    const chainInfos = useChainInfos()
    const activeChain = useActiveChain()
    const { activeWallet } = useActiveWallet()
    const password = usePassword()
    return useCallback(
      async (chain?: SupportedChain) => {
        let _chain = activeChain
        if (chain && chainInfos[chain]) {
          _chain = chain
        }
        const prefix = chainInfos[_chain].addressPrefix
        if (activeWallet?.walletType === WALLETTYPE.LEDGER) {
          const hdPaths = [makeCosmoshubPath(activeWallet.addressIndex)]
          const ledgerTransport = await getLedgerTransport()
          return new LeapLedgerSigner(ledgerTransport, {
            hdPaths,
            prefix,
          }) as unknown as OfflineSigner
        } else {
          const walletId = activeWallet?.id
          const signer = await KeyChain.getSigner(
            walletId as string,
            password as string,
            chainInfos[_chain].addressPrefix,
            chainInfos[_chain].bip44.coinType,
          )
          return signer as unknown as OfflineSigner
        }
      },
      [activeChain, activeWallet, password, chainInfos],
    )
  }
}
