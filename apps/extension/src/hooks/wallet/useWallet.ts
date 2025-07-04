import { AccountData, DirectSecp256k1HdWallet, OfflineSigner } from '@cosmjs/proto-signing'
import {
  FEATURE_FLAG_STORAGE_KEY,
  Key,
  useChainsStore,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  ChainInfos,
  getLedgerTransport,
  LeapLedgerSigner,
  LeapLedgerSignerEth,
  pubKeyToEvmAddressToShow,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import getHDPath from '@leapwallet/cosmos-wallet-sdk/dist/browser/utils/get-hdpath'
import {
  decrypt,
  encrypt,
  generateWalletFromMnemonic,
  generateWalletFromPrivateKey,
  getFullHDPath,
  KeyChain,
} from '@leapwallet/leap-keychain'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import {
  ACTIVE_CHAIN,
  ACTIVE_WALLET,
  BETA_CHAINS,
  CONNECTIONS,
  ENCRYPTED_ACTIVE_WALLET,
  ENCRYPTED_KEY_STORE,
  KEYSTORE,
  NETWORK_MAP,
  PRIMARY_WALLET_ADDRESS,
  SELECTED_NETWORK,
} from 'config/storage-keys'
import { useAuth } from 'context/auth-context'
import { Address } from 'hooks/onboarding/types'
import { isAllChainsEnabled, useIsAllChainsEnabled } from 'hooks/settings'
import { useChainInfos } from 'hooks/useChainInfos'
import { Images } from 'images'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { chainInfoStore } from 'stores/chain-infos-store'
import { importWatchWalletSeedPopupStore } from 'stores/import-watch-wallet-seed-popup-store'
import { lightNodeStore } from 'stores/light-node-store'
import { passwordStore } from 'stores/password-store'
import { getDerivationPathToShow } from 'utils'
import { closeSidePanel } from 'utils/closeSidePanel'
import correctMnemonic from 'utils/correct-mnemonic'
import { generateAddresses } from 'utils/generateAddresses'
import {
  customKeygenfnMove,
  customKeygenfnSolana,
  customKeygenfnSui,
  getChainInfosList,
} from 'utils/getChainInfosList'
import { isLedgerEnabled } from 'utils/isLedgerEnabled'
import { default as browser, default as extension } from 'webextension-polyfill'

import { useActiveChain } from '../settings/useActiveChain'
import useActiveWallet from '../settings/useActiveWallet'
import { SeedPhrase } from './seed-phrase/useSeedPhrase'

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Wallet {
  export type Keystore = Record<string, Key>

  type SaveLedgerWalletPubKeys = Record<
    string,
    { path?: string; pubkey: Uint8Array; name?: string }
  >
  type saveLedgerWalletAddress = {
    chainAddresses: Record<string, Address>
    isCosmosAddressPresent: boolean
    isEvmAddressPresent: boolean
    name?: string
    colorIndex?: number
  }

  export async function mergeAndStoreWallets(
    newWallets: Record<string, Key>,
  ): Promise<Record<string, Key>> {
    const featureFlagKey = `leap-${FEATURE_FLAG_STORAGE_KEY}`
    const data = await browser.storage.local.get([KEYSTORE, featureFlagKey])
    const keystore: Keystore = data[KEYSTORE] ?? {}
    const newKeystore = { ...keystore }
    for (const [key, value] of Object.entries(newWallets)) {
      try {
        const existingWalletKey = Object.keys(keystore).find((key) => {
          return !!keystore?.[key] && !!value.path && keystore[key].path === value.path
        })
        if (existingWalletKey) {
          const existingWallet = keystore[existingWalletKey]
          const mergedPubKeys = {
            ...existingWallet.pubKeys,
            ...value.pubKeys,
          } as Record<SupportedChain, string>
          const mergedAddresses = {
            ...existingWallet.addresses,
            ...value.addresses,
          }
          newKeystore[existingWalletKey] = {
            ...existingWallet,
            addresses: mergedAddresses,
            pubKeys: mergedPubKeys,
          }
        } else {
          newKeystore[key] = value
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
      }
    }
    const newWalletEntries = Object.keys(newKeystore)
    const lastEntry = newWalletEntries[0]
    const featureFlags = JSON.parse(data[featureFlagKey] ?? '{}')
    const allChainsEnabled = isAllChainsEnabled(featureFlags?.data)

    const leapFallbackChain = allChainsEnabled ? AGGREGATED_CHAIN_KEY : ChainInfos.cosmos.key

    await browser.storage.local.set({
      [KEYSTORE]: newKeystore,
      [ACTIVE_WALLET]: newKeystore[lastEntry],
      [ACTIVE_CHAIN]: leapFallbackChain,
      [SELECTED_NETWORK]: 'mainnet',
    })
    return newKeystore
  }

  export async function storeWallets(newWallets: Record<string, Key>): Promise<void> {
    const featureFlagKey = `leap-${FEATURE_FLAG_STORAGE_KEY}`
    const data = await browser.storage.local.get([KEYSTORE, featureFlagKey])
    const keystore: Keystore[] = data[KEYSTORE] ?? {}
    const newKeystore = { ...keystore, ...newWallets }

    const newWalletEntries = Object.keys(newWallets)
    const lastEntry = newWalletEntries[0]
    const featureFlags = JSON.parse(data[featureFlagKey] ?? '{}')
    const allChainsEnabled = isAllChainsEnabled(featureFlags?.data)

    const leapFallbackChain = allChainsEnabled ? AGGREGATED_CHAIN_KEY : ChainInfos.cosmos.key

    return await browser.storage.local.set({
      [KEYSTORE]: newKeystore,
      [ACTIVE_WALLET]: newWallets[lastEntry],
      [ACTIVE_CHAIN]: leapFallbackChain,
      [SELECTED_NETWORK]: 'mainnet',
    })
  }

  export async function getAccountDetails(
    mnemonic: string,
  ): Promise<{ accounts: readonly AccountData[]; mainWallet: DirectSecp256k1HdWallet }> {
    const hdPath = getHDPath(ChainInfos.cosmos.bip44.coinType)
    const mainWallet = generateWalletFromMnemonic(mnemonic, {
      hdPath,
      addressPrefix: ChainInfos.cosmos.addressPrefix,
      ethWallet: false,
    })
    const accounts = mainWallet.getAccounts()
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
    const allChainsEnabled = useIsAllChainsEnabled()

    const removeAll = async (signout = true) => {
      const leapFallbackChain = allChainsEnabled ? AGGREGATED_CHAIN_KEY : ChainInfos.cosmos.key

      await browser.storage.local.set({
        [KEYSTORE]: null,
        [ACTIVE_WALLET]: null,
        [ENCRYPTED_KEY_STORE]: null,
        [ENCRYPTED_ACTIVE_WALLET]: null,
        [CONNECTIONS]: null,
        [BETA_CHAINS]: null,
        [ACTIVE_CHAIN]: leapFallbackChain,
        [NETWORK_MAP]: null,
        [SELECTED_NETWORK]: 'mainnet',
      })

      await setActiveWallet(null)
      await lightNodeStore.clearLastSyncedInfo()

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
          closeSidePanel()
          return ''
        }
        const otherWallet = Object.values(wallets).find(
          (v) => v.name.toLowerCase() === name.toLowerCase(),
        )
        if (otherWallet) return 'Wallet name already exists'
        const chainInfosList = getChainInfosList(chains, 'seed')
        const newWallet = await KeyChain.createNewWalletAccount(
          name,
          (forcePassword ?? passwordStore.password) as string,
          colorIndex,
          chainInfosList,
        )
        if (newWallet) await setActiveWallet(newWallet)
        else return 'Wallet already exists'
      },
      [setActiveWallet, chains],
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

    return firstWallet ? firstWallet?.addresses?.cosmos : undefined
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
    password: Uint8Array
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
        const existingWallets = await KeyChain.getAllWallets()
        const allWallets: Key[] = new Array(selectedAddressIndexes.length)
        if (SeedPhrase.validateSeedPhrase(correctedMnemonic)) {
          const chainInfosList = getChainInfosList(chainInfos, 'seed')
          // here assumption is there are no wallet-accounts currently in the wallet
          // when this changes - make sure the addressIndex is handled properly
          let i = 0
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
        } else {
          let i = 0
          const chainInfosList = getChainInfosList(chainInfos, 'privateKey', mnemonic)
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
        }
        if (existingWallets) {
          const watchWalletsToRemove = Object.values(existingWallets).filter((wallet) => {
            if ((wallet as any)?.watchWallet) {
              const chainKey = Object.keys(wallet.addresses)[0]
              const newWallet = allWallets.find(
                (value) =>
                  wallet.addresses?.[chainKey] === value.addresses?.[chainKey as SupportedChain],
              )
              return !!newWallet
            }
            return false
          })
          if (watchWalletsToRemove.length > 0) {
            await KeyChain.removeWallets(watchWalletsToRemove.map((v) => v.id))
          }
        }
        setActiveWallet(allWallets[0])
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
    password: Uint8Array
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
        if (SeedPhrase.validateSeedPhrase(correctedMnemonic)) {
          const chainInfosList = getChainInfosList(chainInfos, 'seed')
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
          const chainInfosList = getChainInfosList(chainInfos, 'privateKey', privateKey)
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
    addresses: Record<number, saveLedgerWalletAddress>
    password: Uint8Array
    pubKeys: SaveLedgerWalletPubKeys
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
          let primaryWalletAddress = chainAddresses?.cosmos?.address
          if (!primaryWalletAddress) {
            const evmPubKey = chainAddresses?.ethereum?.pubKey
            if (evmPubKey) {
              primaryWalletAddress = pubKeyToEvmAddressToShow(evmPubKey, true) || ''
            }
          }
          if (primaryWalletAddress) {
            browser.storage.local.set({ [PRIMARY_WALLET_ADDRESS]: primaryWalletAddress })
          }
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
          name: name ?? pubKeys[addressIndex]?.name ?? `Wallet ${lastIndex + currentIndex + 1}`,
          addresses,
          addressIndex: addressIndex as any,
          cipher: encrypt(Buffer.from(pubKeys[addressIndex]?.pubkey).toString('hex'), password),
          id: walletId,
          colorIndex: colorIndex ?? currentIndex,
          pubKeys: chainPubKeys,
          path: pubKeys[addressIndex]?.path,
        }
        return acc
      },
      {},
    )

    const updatedWallets = await mergeAndStoreWallets(newWallets)
    return updatedWallets
  }

  export function useSaveLedgerWallet() {
    const { setActiveWallet } = useActiveWallet()

    return useCallback(
      async ({
        addresses,
        password,
        pubKeys,
      }: {
        addresses: Record<number, saveLedgerWalletAddress>
        password: Uint8Array
        pubKeys: SaveLedgerWalletPubKeys
      }) => {
        const wallets = await saveLedgerWallet({
          addresses,
          password: password,
          pubKeys,
        })

        setActiveWallet(Object.values(wallets)[0])
        return wallets
      },

      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    )
  }

  export function useGetWallet(forceChain?: SupportedChain) {
    const chainInfos = chainInfoStore.chainInfos
    const _activeChain = useActiveChain()
    const activeChain = forceChain || _activeChain
    const { activeWallet } = useActiveWallet()
    const password = passwordStore.password
    return useCallback(
      async (chain?: SupportedChain, ethWallet?: boolean) => {
        let _chain = activeChain
        if (chain && chainInfos[chain]) {
          _chain = chain
        }
        const prefix = chainInfos[_chain].addressPrefix
        if (
          activeWallet?.walletType === WALLETTYPE.LEDGER &&
          isLedgerEnabled(_chain, chainInfos[_chain]?.bip44?.coinType, Object.values(chainInfos))
        ) {
          if (chainInfos[_chain]?.bip44?.coinType === '60') {
            const derivationPath = activeWallet.path
              ? activeWallet.path
              : `0'/0/${activeWallet.addressIndex}`

            const hdPaths = [`m/44'/60'/${derivationPath}`]
            const ledgerTransport = await getLedgerTransport()

            return new LeapLedgerSignerEth(ledgerTransport, { hdPaths, prefix })
          } else {
            const derivationPath = activeWallet.path
              ? activeWallet.path
              : `0'/0/${activeWallet.addressIndex}`

            const hdPaths = [`m/44'/118'/${derivationPath}`]
            const ledgerTransport = await getLedgerTransport()

            return new LeapLedgerSigner(ledgerTransport, {
              hdPaths,
              prefix,
            }) as unknown as OfflineSigner
          }
        } else if (activeWallet?.walletType !== WALLETTYPE.LEDGER) {
          if (!password) throw new Error('Invalid Password')
          if (activeWallet?.watchWallet) {
            importWatchWalletSeedPopupStore.setShowPopup(true)
            throw new Error('Seed phrase not available')
          }
          const coinType = chainInfos[_chain]?.bip44?.coinType
          const walletId = activeWallet?.id
          const signer = await KeyChain.getSigner(walletId as string, password, {
            addressPrefix: chainInfos[_chain].addressPrefix,
            coinType: chainInfos[_chain]?.bip44?.coinType,
            ethWallet,
            pubKeyBech32Address: ethWallet && coinType !== '60',
            btcNetwork: chainInfos[_chain]?.btcNetwork,
          })
          return signer as unknown as OfflineSigner
        } else {
          throw new Error('Unable to get signer')
        }
      },
      [activeChain, activeWallet, chainInfos, password],
    )
  }

  export function useSaveWatchWallet() {
    const { setActiveWallet } = useActiveWallet()
    const savedpassword = passwordStore.password

    return useCallback(
      async (_address: string, walletName: string, _password?: Uint8Array) => {
        try {
          const password = _password ?? savedpassword
          const allWallets = await KeyChain.getAllWallets()
          const lastIndex = Object.keys(allWallets ?? {}).length
          const walletId = crypto.randomUUID()
          const address = _address

          const addresses = generateAddresses(address)
          const invalidPubkeys = {} as Record<SupportedChain, string>
          for (const [chain, address] of Object.entries(addresses)) {
            invalidPubkeys[chain as SupportedChain] = 'PLACEHOLDER ' + address
          }

          if (!password) throw new Error('Invalid Password')

          const newWallet = {
            walletType: WALLETTYPE.WATCH_WALLET,
            name: walletName || `Wallet ${lastIndex + 1}`,
            addresses,
            addressIndex: 0,
            id: walletId,
            colorIndex: 0,
            cipher: encrypt(Buffer.from('PLACEHOLDER').toString('hex'), password),
            pubKeys: invalidPubkeys,
            watchWallet: true,
            avatar: Images.Misc.EyeDark,
          }

          await Wallet.storeWallets({ [walletId]: newWallet })
          setActiveWallet(newWallet)
        } catch (error) {
          throw new Error('Unable to save watch wallet')
        }
      },
      [savedpassword, setActiveWallet],
    )
  }

  export function useUpdateWatchWalletSeed() {
    const { activeWallet } = useActiveWallet()
    const importWallet = Wallet.useImportWallet()
    const password = passwordStore.password
    const chainInfos = useChainInfos()
    return useCallback(
      async (secret: string) => {
        if (!activeWallet) throw new Error('No active wallet')
        if (!password) throw new Error('Invalid password')
        const [existingWalletChain, existingAddress] = Object.entries(
          activeWallet?.addresses ?? {},
        )[0]
        const walletChainInfo = chainInfos[existingWalletChain as SupportedChain]
        if (SeedPhrase.validateSeedPhrase(secret)) {
          let walletAccount
          let addressIndex = 0
          for (let i = 0; i < 20; i++) {
            const wallet = generateWalletFromMnemonic(secret, {
              hdPath: getFullHDPath(
                walletChainInfo.bip44.coinType === '1' || walletChainInfo.bip44.coinType === '0'
                  ? '84'
                  : '44',
                walletChainInfo.bip44.coinType,
                i.toString(),
              ),
              addressPrefix: walletChainInfo.addressPrefix,
              ethWallet: false,
              btcNetwork: walletChainInfo.btcNetwork,
            })

            if (wallet.getAccounts()[0].address === existingAddress) {
              walletAccount = wallet
              addressIndex = i
              break
            }
          }

          if (walletAccount) {
            await KeyChain.removeWallets([activeWallet.id])
            await importWallet({
              name: activeWallet.name,
              addressIndex: addressIndex.toString(),
              password,
              privateKey: secret,
              colorIndex: activeWallet.colorIndex,
            })
          } else {
            await importWallet({
              privateKey: secret,
              addressIndex: '0',
              password,
            })
          }
        } else {
          const pkWallet = generateWalletFromPrivateKey(
            secret,
            getFullHDPath(
              walletChainInfo.bip44.coinType === '1' || walletChainInfo.bip44.coinType === '0'
                ? '84'
                : '44',
              walletChainInfo.bip44.coinType,
            ),
            walletChainInfo.addressPrefix,
            walletChainInfo.btcNetwork,
          )

          const wallet =
            pkWallet.getAccounts()[0].address === existingAddress ? pkWallet : undefined
          if (wallet) {
            await KeyChain.removeWallets([activeWallet.id])
            await importWallet({
              name: activeWallet.name,
              addressIndex: '0',
              password,
              privateKey: secret,
              colorIndex: activeWallet.colorIndex,
            })
          } else {
            await importWallet({
              privateKey: secret,
              addressIndex: '0',
              password,
            })
          }
        }
      },
      [activeWallet, chainInfos, importWallet, password],
    )
  }

  export function useAptosSigner() {
    const { activeWallet } = useActiveWallet()
    const chainInfos = useChainInfos()
    return useCallback(
      async (chain: SupportedChain) => {
        if (!activeWallet) throw new Error('No active wallet')
        if (!passwordStore?.password) throw new Error('Invalid Password')

        const coinType = chainInfos[chain]?.bip44?.coinType
        const walletType = activeWallet.walletType
        const addressIndex = activeWallet.addressIndex
        const path = getFullHDPath('44', coinType, addressIndex.toString())
        if (
          walletType === WALLETTYPE.SEED_PHRASE ||
          walletType === WALLETTYPE.SEED_PHRASE_IMPORTED
        ) {
          const mnemonic = decrypt(activeWallet.cipher, passwordStore.password)
          const account = await customKeygenfnMove(mnemonic, path, 'seedPhrase')
          return account
        } else if (walletType === WALLETTYPE.PRIVATE_KEY) {
          const privateKey = decrypt(activeWallet.cipher, passwordStore.password)
          const account = await customKeygenfnMove(privateKey, path, 'privateKey')
          return account
        } else {
          throw new Error('Invalid wallet type')
        }
      },
      [activeWallet, chainInfos, passwordStore?.password],
    )
  }

  export function useSolanaSigner() {
    const { activeWallet } = useActiveWallet()
    const chainInfos = useChainInfos()
    return useCallback(
      async (chain: SupportedChain) => {
        if (!activeWallet) throw new Error('No active wallet')
        if (!passwordStore?.password) throw new Error('Invalid Password')

        const coinType = chainInfos[chain]?.bip44?.coinType
        const walletType = activeWallet.walletType
        const addressIndex = activeWallet.addressIndex
        const path = getFullHDPath('44', coinType, addressIndex.toString())
        if (
          walletType === WALLETTYPE.SEED_PHRASE ||
          walletType === WALLETTYPE.SEED_PHRASE_IMPORTED
        ) {
          const mnemonic = decrypt(activeWallet.cipher, passwordStore.password)
          const account = await customKeygenfnSolana(mnemonic, path, 'seedPhrase')
          return account
        } else if (walletType === WALLETTYPE.PRIVATE_KEY) {
          const privateKey = decrypt(activeWallet.cipher, passwordStore.password)
          const account = await customKeygenfnSolana(privateKey, path, 'privateKey')
          return account
        } else {
          throw new Error('Invalid wallet type')
        }
      },
      [activeWallet, chainInfos, passwordStore?.password],
    )
  }

  export function useSuiSigner() {
    const { activeWallet } = useActiveWallet()
    const chainInfos = useChainInfos()
    return useCallback(
      async (chain: SupportedChain) => {
        if (!activeWallet) throw new Error('No active wallet')
        if (!passwordStore?.password) throw new Error('Invalid Password')

        const coinType = chainInfos[chain]?.bip44?.coinType
        const walletType = activeWallet.walletType
        const addressIndex = activeWallet.addressIndex
        const path = getFullHDPath('44', coinType, addressIndex.toString())
        if (
          walletType === WALLETTYPE.SEED_PHRASE ||
          walletType === WALLETTYPE.SEED_PHRASE_IMPORTED
        ) {
          const mnemonic = decrypt(activeWallet.cipher, passwordStore.password)
          const account = await customKeygenfnSui(mnemonic, path, 'seedPhrase')
          return account
        } else if (walletType === WALLETTYPE.PRIVATE_KEY) {
          const privateKey = decrypt(activeWallet.cipher, passwordStore.password)
          const account = await customKeygenfnSui(privateKey, path, 'privateKey')
          return account
        } else {
          throw new Error('Invalid wallet type')
        }
      },
      [activeWallet, chainInfos, passwordStore?.password],
    )
  }
}
