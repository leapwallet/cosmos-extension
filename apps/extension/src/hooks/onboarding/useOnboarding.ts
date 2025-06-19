import { useChainsStore } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfos, importLedgerAccountV2 } from '@leapwallet/cosmos-wallet-sdk'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/browser/constants'
import getHDPath from '@leapwallet/cosmos-wallet-sdk/dist/browser/utils/get-hdpath'
import {
  BtcWalletHD,
  EthWallet,
  generateWalletFromMnemonic,
  getFullHDPath,
  KeyChain,
  NETWORK,
} from '@leapwallet/leap-keychain'
import { SeedPhrase } from 'hooks/wallet/seed-phrase/useSeedPhrase'
import { Wallet } from 'hooks/wallet/useWallet'
import { LEDGER_NETWORK } from 'pages/onboarding/import/import-wallet-context'
import { useEffect, useRef, useState } from 'react'
import { getDerivationPathToShow } from 'utils'
import {
  customKeygenfnMove,
  customKeygenfnSolana,
  customKeygenfnSui,
} from 'utils/getChainInfosList'
import { getLedgerEnabledEvmChainsKey } from 'utils/getLedgerEnabledEvmChains'

import { Address, Addresses, WalletAccount } from './types'

export function useOnboarding() {
  const [walletAccounts, setWalletAccounts] = useState<WalletAccount[]>()
  const [customWalletAccounts, setCustomWalletAccounts] = useState<WalletAccount[]>()
  const [mnemonic, setMnemonic] = useState('')

  const importWalletAccounts = Wallet.useImportMultipleWalletAccounts()
  const { chains } = useChainsStore()

  const saveLedgerWallet = Wallet.useSaveLedgerWallet()
  const addresses = useRef<Addresses>()

  useEffect(() => {
    if (!mnemonic) {
      const _mnemonic = SeedPhrase.CreateNewMnemonic()
      setMnemonic(_mnemonic)
    }
  }, [mnemonic])

  const setAddresses = (_addresses: Addresses) => {
    addresses.current = _addresses
  }

  const updateAddresses = (pathWiseAddresses: Record<string, Record<string, Address>>) => {
    const newAddresses = Object.assign(addresses.current ?? {}, {})
    Object.entries(pathWiseAddresses).forEach(([path, chainAddresses]) => {
      newAddresses[path] = { ...newAddresses[path], ...chainAddresses }
    })
    setAddresses(newAddresses)
  }

  const onOnboardingComplete = (
    mnemonic: string,
    password: Uint8Array,
    selectedIds: { [key: number]: boolean },
    type: 'create' | 'import',
  ) => {
    if (mnemonic && password) {
      return importWalletAccounts({
        mnemonic,
        password,
        type,
        selectedAddressIndexes: Object.entries(selectedIds)
          .filter(([, selected]) => selected)
          .map(([addressIndex]) => parseInt(addressIndex)),
      })
    }
  }

  const onBoardingCompleteLedger = async (
    password: Uint8Array,
    selectedPaths: string[],
    existingAddresses: string[],
  ) => {
    if (password) {
      const selectedCurrentAddresses = Object.entries(addresses.current ?? {}).filter(([path]) => {
        return selectedPaths.includes(path)
      })

      const accountsToSave = selectedCurrentAddresses.reduce(
        (
          acc: Record<
            string,
            {
              chainAddresses: Record<string, Address>
              isCosmosAddressPresent: boolean
              isEvmAddressPresent: boolean
            }
          >,
          addressEntry,
        ) => {
          const [addressIndex, addressInfo] = addressEntry

          const isCosmosAddressPresent =
            !!addressInfo?.cosmos?.address && existingAddresses.includes(addressInfo.cosmos.address)

          const isEvmAddressPresent =
            !!addressInfo?.ethereum?.address &&
            existingAddresses.includes(addressInfo.ethereum.address)

          if (isCosmosAddressPresent && isEvmAddressPresent) {
            return acc
          }

          acc[addressIndex] = {
            chainAddresses: addressInfo,
            isCosmosAddressPresent,
            isEvmAddressPresent,
          }
          return acc
        },
        {},
      )

      const selectedAccountsPubKeys = Object.keys(accountsToSave).reduce((acc, path) => {
        const primaryChain: SupportedChain = 'cosmos'
        const alternateChain: SupportedChain = 'ethereum'
        const account = accountsToSave[path]

        const pubkey = account?.isCosmosAddressPresent
          ? account?.chainAddresses?.[primaryChain]?.pubKey
          : account?.isEvmAddressPresent
          ? account?.chainAddresses?.[alternateChain]?.pubKey
          : account?.chainAddresses?.[primaryChain]?.pubKey ??
            account?.chainAddresses?.[alternateChain]?.pubKey

        return {
          ...acc,
          [path]: {
            pubkey,
            path: getDerivationPathToShow(path),
          },
        }
      }, {})

      await saveLedgerWallet({
        addresses: accountsToSave,
        password,
        pubKeys: selectedAccountsPubKeys,
      })
    }
  }

  const getAccountDetails = async (mnemonic: string) => {
    const walletAccounts = await KeyChain.getWalletsFromMnemonic(
      mnemonic,
      5,
      '118',
      ChainInfos.cosmos.addressPrefix,
    )

    const walletAccountsWithAdditionalAddresses = await Promise.all(
      walletAccounts.map(async (account) => {
        // Generate EVM address
        const evmHdPath = getHDPath('60', account.index.toString())
        const evmWallet = generateWalletFromMnemonic(mnemonic, {
          hdPath: evmHdPath,
          addressPrefix: ChainInfos.ethereum.addressPrefix,
          ethWallet: false,
        })

        // Generate Bitcoin address
        const btcHdPath = getFullHDPath('84', account.index.toString())
        const btcWallet = BtcWalletHD.generateWalletFromMnemonic(mnemonic, {
          addressPrefix: ChainInfos.bitcoin.addressPrefix,
          paths: [btcHdPath],
          network: ChainInfos.bitcoin.btcNetwork || NETWORK,
        })

        // Generate Aptos address
        const aptosHdPath = getHDPath('637', account.index.toString())
        const aptosAccount = await customKeygenfnMove(mnemonic, aptosHdPath, 'seedPhrase')

        // Generate Solana address
        const solanaHdPath = getHDPath('501', account.index.toString())
        const solanaAccount = await customKeygenfnSolana(mnemonic, solanaHdPath, 'seedPhrase')

        // Generate Sui address
        const suiHdPath = getHDPath('784', account.index.toString())
        const suiAccount = await customKeygenfnSui(mnemonic, suiHdPath, 'seedPhrase')

        const evmAddress =
          evmWallet instanceof EthWallet
            ? evmWallet.getAccountWithHexAddress()[0]?.address
            : undefined
        const bitcoinAddress = btcWallet.getAccounts()[0]?.address
        const moveAddress = aptosAccount?.address
        const solanaAddress = solanaAccount?.address
        const suiAddress = suiAccount?.address

        return {
          ...account,
          evmAddress,
          bitcoinAddress,
          moveAddress,
          solanaAddress,
          suiAddress,
        }
      }),
    )

    setWalletAccounts(walletAccountsWithAdditionalAddresses)
  }

  const getChainDetails = () => {
    const chainInfos = {} as Record<
      SupportedChain,
      { addressPrefix: string; enabled: boolean; coinType: string }
    >

    for (const chainEntry of Object.entries(chains)) {
      const [chain, chainInfo] = chainEntry
      chainInfos[chain as SupportedChain] = {
        addressPrefix: chainInfo.addressPrefix,
        enabled: chainInfo.enabled,
        coinType: chainInfo.bip44.coinType,
      }
    }
    return chainInfos
  }

  const getLedgerAccountDetails = async (app: LEDGER_NETWORK) => {
    const primaryChain = app === LEDGER_NETWORK.ETH ? 'ethereum' : 'cosmos'
    const defaultIndexes = [0, 1, 2, 3, 4]
    const ledgerEnabledEvmChains = getLedgerEnabledEvmChainsKey(Object.values(chains))
    const chainsToImport = app === LEDGER_NETWORK.ETH ? ledgerEnabledEvmChains : []
    const chainInfos = getChainDetails()

    const { pathWiseAddresses } = await importLedgerAccountV2(app, defaultIndexes, undefined, {
      primaryChain,
      chainsToImport,
      chainInfos,
    })

    updateAddresses(pathWiseAddresses)
  }

  const getLedgerAccountDetailsForIdxs = async (app: LEDGER_NETWORK, idxs: number[]) => {
    const primaryChain = app === LEDGER_NETWORK.ETH ? 'ethereum' : 'cosmos'
    const chainInfos = getChainDetails()
    const ledgerEnabledEvmChains = getLedgerEnabledEvmChainsKey(Object.values(chains))
    const chainsToImport = app === LEDGER_NETWORK.ETH ? ledgerEnabledEvmChains : []

    const { primaryChainAccount, pathWiseAddresses } = await importLedgerAccountV2(
      app,
      idxs,
      undefined,
      {
        primaryChain,
        chainsToImport,
        chainInfos,
      },
    )

    setWalletAccounts((prev: any) => [
      ...(prev ?? []),
      ...primaryChainAccount.map((account, index) => ({
        address: account.address,
        pubkey: account.pubkey,
        index: (prev ?? []).length + index,
        // @ts-ignore
        path: account.path,
      })),
    ])

    updateAddresses(pathWiseAddresses)
  }

  const getCustomLedgerAccountDetails = async (
    app: LEDGER_NETWORK,
    customDerivationPath: string,
    name: string,
    existingAddresses: string[] | undefined,
  ) => {
    const allAccounts = [...(walletAccounts ?? []), ...(customWalletAccounts ?? [])]
    const primaryChain = app === LEDGER_NETWORK.ETH ? 'ethereum' : 'cosmos'

    const chainInfos = getChainDetails()

    const { primaryChainAccount, pathWiseAddresses } = await importLedgerAccountV2(
      app,
      [],
      [customDerivationPath],
      {
        primaryChain,
        chainsToImport: [],
        chainInfos,
      },
    )

    const isCustomAccountPresentAlready = allAccounts.some((account) => {
      return (
        !!account.path &&
        customDerivationPath.includes(account.path) &&
        account.address === primaryChainAccount[0].address
      )
    })

    const isAddressPresentAlready =
      !!primaryChainAccount?.[0]?.address &&
      existingAddresses?.includes(primaryChainAccount[0].address)

    if (isCustomAccountPresentAlready || isAddressPresentAlready) {
      throw new Error('This account is already present. Kindly enter a different derivation path.')
    }

    setCustomWalletAccounts((prev: any) => [
      ...(prev ?? []),
      ...primaryChainAccount.map((account, index) => ({
        address: account.address,
        pubkey: account.pubkey,
        index: (prev ?? []).length + index,
        // @ts-ignore
        path: account.path,
        name,
      })),
    ])

    updateAddresses(pathWiseAddresses)
  }

  return {
    addresses: addresses.current,
    mnemonic,
    walletAccounts,
    setWalletAccounts,
    customWalletAccounts,
    setAddresses,
    getAccountDetails,
    getLedgerAccountDetails,
    onOnboardingComplete,
    onBoardingCompleteLedger,
    getLedgerAccountDetailsForIdxs,
    getCustomLedgerAccountDetails,
  }
}
