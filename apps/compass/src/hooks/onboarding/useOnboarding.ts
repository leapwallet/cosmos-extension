/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { useChainsStore } from '@leapwallet/cosmos-wallet-hooks'
import { importLedgerAccount, pubKeyToEvmAddressToShow } from '@leapwallet/cosmos-wallet-sdk'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/browser/constants'
import { KeyChain } from '@leapwallet/leap-keychain'
import { SeedPhrase } from 'hooks/wallet/seed-phrase/useSeedPhrase'
import { Wallet } from 'hooks/wallet/useWallet'
import { useWeb3Login } from 'pages/onboarding/use-social-login'
import { useEffect, useRef, useState } from 'react'
import { getDerivationPathToShow } from 'utils'
import { getLedgerEnabledEvmChainsKey } from 'utils/getLedgerEnabledEvmChains'

import { mergeAddresses } from './mergeAddresses'
import { Address, Addresses, WalletAccount } from './types'

export function useOnboarding() {
  const [walletAccounts, setWalletAccounts] = useState<WalletAccount[]>()
  const [customWalletAccounts, setCustomWalletAccounts] = useState<WalletAccount[]>()
  const [mnemonic, setMnemonic] = useState('')

  const socialLogin = useWeb3Login()

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

  const onOnboardingComplete = (
    mnemonic: string,
    password: Uint8Array,
    selectedIds: { [key: number]: boolean },
    type: 'create' | 'import' | 'create-social' | 'import-social',
    email?: string,
  ) => {
    if (mnemonic && password) {
      return importWalletAccounts({
        mnemonic,
        password,
        selectedAddressIndexes: Object.entries(selectedIds)
          .filter(([, selected]) => selected)
          .map(([addressIndex]) => parseInt(addressIndex)),
        type,
        email,
      })
    }
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
          account = customWalletAccounts?.find((account) => {
            const path = getDerivationPathToShow(account.path ?? '')
            return path === curr
          })
        } else {
          account = walletAccounts?.find((account) => {
            return account.index === parseInt(curr)
          })
        }

        return {
          ...acc,
          [curr]: { pubkey: account?.pubkey, path: account?.path },
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
    const addressPrefix = 'sei'
    const walletAccounts = await KeyChain.getWalletsFromMnemonic(mnemonic, 5, '118', addressPrefix)

    setWalletAccounts(
      walletAccounts.map((account) => ({
        ...account,
        evmAddress: account.pubkey ? pubKeyToEvmAddressToShow(account.pubkey) : null,
      })),
    )
  }

  const getEvmLedgerAccountDetails = async () => {
    const useEvmApp = true
    const chain = useEvmApp ? 'injective' : 'seiTestnet2'

    const ledgerEnabledEvmChains = getLedgerEnabledEvmChainsKey(Object.values(chains))
    const { chainWiseAddresses } = await importLedgerAccount(
      [0, 1, 2, 3, 4],
      useEvmApp,
      chain,
      ledgerEnabledEvmChains,
      chains,
    )

    updateAddresses(chainWiseAddresses, 0)
  }

  const getLedgerAccountDetails = async (useEvmApp: boolean) => {
    const chain = useEvmApp ? 'injective' : 'seiTestnet2'

    const { primaryChainAccount, chainWiseAddresses } = await importLedgerAccount(
      [0, 1, 2, 3, 4],
      useEvmApp,
      chain,
      [],
      chains,
    )

    setWalletAccounts(
      primaryChainAccount.map((account, index) => ({
        index,
        evmAddress: null,
        address: account.address,
        pubkey: account.pubkey,
        // @ts-ignore
        path: account.path,
      })),
    )

    updateAddresses(chainWiseAddresses, 0)
  }

  const getLedgerAccountDetailsForIdxs = async (useEvmApp: boolean, idxs: number[]) => {
    const chain = useEvmApp ? 'injective' : 'seiTestnet2'

    const { primaryChainAccount, chainWiseAddresses } = await importLedgerAccount(
      idxs,
      useEvmApp,
      chain,
      //Added as a placeholder
      [],
      chains,
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    updateAddresses(chainWiseAddresses, idxs[0])
  }

  const getCustomLedgerAccountDetails = async (
    useEvmApp: boolean,
    customDerivationPath: string,
    name: string,
    existingAddresses: string[] | undefined,
  ) => {
    const allAccounts = [...(walletAccounts ?? []), ...(customWalletAccounts ?? [])]
    // const isNameAlreadyPresent = allAccounts.some(
    //   (account) => !!account.name && account.name === name,
    // )

    // if (isNameAlreadyPresent) {
    //   throw new Error('This wallet name is already present, please enter a different name.')
    // }

    const primaryChain = useEvmApp ? 'injective' : 'seiTestnet2'

    const { primaryChainAccount, chainWiseAddresses } = await importLedgerAccount(
      // Added as a placeholder
      [],
      useEvmApp,
      primaryChain,
      [],
      chains,
      [customDerivationPath],
    )
    const getHdCustomPaths = (customDerivationPath: Array<string>, coinType: string) => {
      return customDerivationPath.map((path) => `m/44'/${coinType}'/${path}`)
    }

    const hdCustomPaths = getHdCustomPaths([customDerivationPath], useEvmApp ? '60' : '118')

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

    setCustomWalletAccounts((prev: any) => [
      ...(prev ?? []),
      ...primaryChainAccount.map((account, index) => ({
        address: account.address,
        pubkey: account.pubkey,
        index: (prev ?? []).length + index,
        // @ts-ignore
        path: account.path,
        name,
        evmAddress: pubKeyToEvmAddressToShow(account.pubkey, true) || null,
      })),
    ])

    updateAddresses(chainWiseAddresses, customDerivationPath)
  }

  return {
    mnemonic,
    walletAccounts,
    customWalletAccounts,
    getAccountDetails,
    getLedgerAccountDetails,
    onOnboardingComplete,
    onBoardingCompleteLedger,
    getEvmLedgerAccountDetails,
    getLedgerAccountDetailsForIdxs,
    socialLogin,
    getCustomLedgerAccountDetails,
  }
}
