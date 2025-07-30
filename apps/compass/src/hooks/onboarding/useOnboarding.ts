import { useChainsStore } from '@leapwallet/cosmos-wallet-hooks'
import { importLedgerAccountV2, pubKeyToEvmAddressToShow } from '@leapwallet/cosmos-wallet-sdk'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/browser/constants'
import { KeyChain } from '@leapwallet/leap-keychain'
import { SeedPhrase } from 'hooks/wallet/seed-phrase/useSeedPhrase'
import { LedgerAppId, Wallet } from 'hooks/wallet/useWallet'
import { useEffect, useRef, useState } from 'react'
import { getDerivationPathToShow } from 'utils'

import { mergeAddresses } from './mergeAddresses'
import { Address, Addresses, WalletAccount } from './types'

type LedgerWalletAccounts = {
  custom: WalletAccount[]
  default: WalletAccount[]
}

export function useLedgerOnboarding() {
  const [selectedApp, _setSelectedApp] = useState<LedgerAppId>('sei')
  const addresses = useRef<Addresses>()

  const [walletAccounts, setWalletAccounts] = useState<LedgerWalletAccounts>({
    custom: [],
    default: [],
  })
  const saveLedgerWallet = Wallet.useSaveLedgerWallet()
  const { chains } = useChainsStore()

  const setAddresses = (_addresses: Addresses) => {
    addresses.current = _addresses
  }

  const setSelectedApp = (app: LedgerAppId) => {
    _setSelectedApp(app)
    setWalletAccounts({ custom: [], default: [] })
    setAddresses({})
  }

  const updateAddresses = (
    chainWiseAddresses: Record<string, Address[]>,
    startingIndex: string | number,
  ) => {
    const newAddresses: Addresses = {}
    for (const [chain, chainAddresses] of Object.entries(chainWiseAddresses)) {
      let index = startingIndex

      for (const address of chainAddresses) {
        if (newAddresses[index as any]) {
          newAddresses[index as any][chain] = address
        } else {
          newAddresses[index as any] = { [chain]: address }
        }

        if (typeof index === 'number') {
          index += 1
        }
      }
    }

    if (addresses.current) {
      const updatedAddresses = mergeAddresses(newAddresses, addresses.current)
      setAddresses(updatedAddresses)
    } else {
      setAddresses(newAddresses)
    }
  }

  const updateWalletAccounts = (accounts: WalletAccount[], type: 'default' | 'custom') => {
    setWalletAccounts((prev) => {
      return {
        ...prev,
        [type]: prev[type].concat(accounts),
      }
    })
  }

  const onBoardingCompleteLedger = async (password: Uint8Array, selectedAddresses: string[]) => {
    if (password) {
      const selectedCurrentAddresses = Object.entries(addresses.current ?? {}).filter(
        ([, addressInfo]) => {
          const primaryChain: SupportedChain = 'seiTestnet2'
          return selectedAddresses.indexOf(addressInfo[primaryChain].address) > -1
        },
      )

      const accountsToSave = selectedCurrentAddresses.reduce(
        (acc: Record<number, { chainAddresses: Record<string, Address> }>, addressEntry) => {
          const [addressIndex, addressInfo] = addressEntry

          acc[addressIndex as any] = { chainAddresses: addressInfo }
          return acc
        },
        {},
      )

      const selectedAccountsPubKeys = Object.keys(accountsToSave).reduce((acc, curr) => {
        let account

        if (curr.includes("'")) {
          account = walletAccounts.custom?.find((account) => {
            const path = getDerivationPathToShow(account.path ?? '')
            return path === curr
          })
        } else {
          account = walletAccounts.default?.find((account) => {
            return account.index === parseInt(curr)
          })
        }

        return {
          ...acc,
          [curr]: { pubkey: account?.pubkey, path: account?.path, name: account?.name },
        }
      }, {})

      await saveLedgerWallet({
        addresses: accountsToSave,
        password,
        pubKeys: selectedAccountsPubKeys,
        app: selectedApp,
      })
    }
  }

  const getLedgerAccountDetailsForIdxs = async (idxs?: Array<number>) => {
    const primaryChain = 'seiTestnet2'

    const { primaryChainAccount, chainWiseAddresses } = await importLedgerAccountV2(
      selectedApp,
      idxs ?? [0, 1, 2, 3, 4],
      [],
      {
        primaryChain,
        chainsToImport: [],
        chainInfos: getChainDetails(),
      },
    )

    const prev = walletAccounts.default

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateWalletAccounts(
      primaryChainAccount.map((account, index) => ({
        address: account.address,
        pubkey: account.pubkey,
        index: (prev ?? []).length + index,
        // @ts-ignore
        path: account.path,
        evmAddress: selectedApp === 'sei' ? pubKeyToEvmAddressToShow(account.pubkey, true) : null,
      })),
      'default',
    )

    updateAddresses(chainWiseAddresses, idxs?.[0] ?? 0)
  }

  const getChainDetails = () => {
    const chainDetails: any = {}
    const chainEntries = Object.entries(chains)
    for (let i = 0; i < chainEntries.length; i++) {
      const [chain, chainInfo] = chainEntries[i]
      chainDetails[chain as SupportedChain] = {
        enabled: chainInfo.enabled,
        coinType: chainInfo.bip44.coinType,
        addressPrefix: chainInfo.addressPrefix,
      }
    }
    return chainDetails
  }

  const getCustomLedgerAccountDetails = async (
    customDerivationPath: string,
    name: string,
    existingAddresses: string[] | undefined,
  ) => {
    const allAccounts = walletAccounts.default.concat(walletAccounts.custom)
    const primaryChain = 'seiTestnet2'

    const { primaryChainAccount, chainWiseAddresses } = await importLedgerAccountV2(
      selectedApp,
      [],
      [customDerivationPath],
      {
        primaryChain,
        chainsToImport: [],
        chainInfos: getChainDetails(),
      },
    )
    const getHdCustomPaths = (customDerivationPath: Array<string>, coinType: string) => {
      return customDerivationPath.map((path) => `m/44'/${coinType}'/${path}`)
    }

    const hdCustomPaths = getHdCustomPaths(
      [customDerivationPath],
      selectedApp === 'sei' ? '60' : '118',
    )

    const isCustomAccountPresentAlready = allAccounts.some((account) => {
      return (
        !!account.path &&
        hdCustomPaths.includes(account.path) &&
        account.address === primaryChainAccount[0].address
      )
    })

    const isAddressPresentAlready =
      !!primaryChainAccount?.[0]?.address &&
      existingAddresses?.includes(primaryChainAccount[0].address)

    if (isCustomAccountPresentAlready || isAddressPresentAlready) {
      throw new Error('This account is already present. Kindly enter a different derivation path.')
    }

    const prev = walletAccounts.custom

    updateWalletAccounts(
      primaryChainAccount.map((account, index) => ({
        address: account.address,
        pubkey: account.pubkey,
        index: (prev ?? []).length + index,
        // @ts-ignore
        path: account.path,
        name,
        evmAddress: selectedApp === 'sei' ? pubKeyToEvmAddressToShow(account.pubkey, true) : null,
      })),
      'custom',
    )

    updateAddresses(chainWiseAddresses, customDerivationPath)
  }

  return {
    walletAccounts: walletAccounts.default,
    customWalletAccounts: walletAccounts.custom,
    //getLedgerAccountDetails,
    onBoardingCompleteLedger,
    getLedgerAccountDetailsForIdxs,
    getCustomLedgerAccountDetails,
    setSelectedApp,
    selectedApp,
  }
}

export function useOnboarding() {
  const [walletAccounts, setWalletAccounts] = useState<WalletAccount[]>()
  const [mnemonic, setMnemonic] = useState('')

  const importWalletAccounts = Wallet.useImportMultipleWalletAccounts()

  useEffect(() => {
    if (!mnemonic) {
      const _mnemonic = SeedPhrase.CreateNewMnemonic()
      setMnemonic(_mnemonic)
    }
  }, [mnemonic])

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
        selectedAddressIndexes: Object.entries(selectedIds)
          .filter(([, selected]) => selected)
          .map(([addressIndex]) => parseInt(addressIndex)),
        type,
      })
    }
  }

  const getAccountDetails = async (mnemonic: string) => {
    const addressPrefix = 'sei'
    const walletAccounts = await KeyChain.getWalletsFromMnemonic(mnemonic, 5, '118', addressPrefix)

    setWalletAccounts(
      walletAccounts.map((account) => ({
        ...account,
        evmAddress: account.pubkey ? pubKeyToEvmAddressToShow(account.pubkey) : null,
      })),
    )
  }

  return {
    mnemonic,
    walletAccounts,
    getAccountDetails,
    onOnboardingComplete,
  }
}
