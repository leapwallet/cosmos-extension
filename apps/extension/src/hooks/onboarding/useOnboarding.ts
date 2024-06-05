import { useChainsStore } from '@leapwallet/cosmos-wallet-hooks'
import { importLedgerAccount } from '@leapwallet/cosmos-wallet-sdk'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/browser/constants'
import { KeyChain } from '@leapwallet/leap-keychain'
import { LEDGER_ENABLED_EVM_CHAINS } from 'config/config'
import { SeedPhrase } from 'hooks/wallet/seed-phrase/useSeedPhrase'
import { Wallet } from 'hooks/wallet/useWallet'
import { useEffect, useRef, useState } from 'react'
import { isCompassWallet } from 'utils/isCompassWallet'

export type Addresses = Record<number, Record<string, { address: string; pubKey: Uint8Array }>>

export function useOnboarding() {
  const [walletAccounts, setWalletAccounts] =
    useState<{ address: string; index: number; pubkey: Uint8Array | null }[]>()

  const importWalletAccounts = Wallet.useImportMultipleWalletAccounts()
  const { chains } = useChainsStore()

  const [mnemonic, setMnemonic] = useState('')
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

  const onOnboardingComplete = (
    mnemonic: string,
    password: string,
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

  const onBoardingCompleteLedger = async (password: string, selectedAddresses: string[]) => {
    if (password) {
      const accountsToSave = Object.entries(addresses.current ?? {})
        .filter(([, addressInfo]) => {
          const primaryChain: SupportedChain = isCompassWallet() ? 'seiTestnet2' : 'cosmos'
          return selectedAddresses.indexOf(addressInfo[primaryChain].address) > -1
        })
        .reduce(
          (
            acc: Record<
              number,
              { chainAddresses: Record<string, { address: string; pubKey: Uint8Array }> }
            >,
            addressEntry,
          ) => {
            const [addressIndex, addressInfo] = addressEntry
            acc[parseInt(addressIndex)] = { chainAddresses: addressInfo }
            return acc
          },
          {},
        )
      await saveLedgerWallet({
        addresses: accountsToSave,
        password,
        pubKeys: (walletAccounts ?? []).map((account) => account.pubkey as Uint8Array),
      })
    }
  }

  const getAccountDetails = async (mnemonic: string) => {
    const addressPrefix = isCompassWallet() ? 'sei' : 'cosmos'
    const walletAccounts = await KeyChain.getWalletsFromMnemonic(mnemonic, 5, '118', addressPrefix)
    setWalletAccounts(walletAccounts)
  }

  function mergeAddresses(addressesNew: Addresses, addressesOriginal: Addresses) {
    const addressIndexes = Object.keys(addressesOriginal).map((addressIndex) =>
      parseInt(addressIndex),
    )
    const updatedAddresses = { ...addressesOriginal }
    for (const addressIndex of addressIndexes) {
      if (updatedAddresses[addressIndex]) {
        updatedAddresses[addressIndex] = {
          ...updatedAddresses[addressIndex],
          ...addressesNew[addressIndex],
        }
      } else {
        updatedAddresses[addressIndex] = addressesNew[addressIndex]
      }
    }
    return updatedAddresses
  }

  const getEvmLedgerAccountDetails = async () => {
    const useEvmApp = true
    const defaultChainCosmos = isCompassWallet() ? 'seiTestnet2' : 'cosmos'
    const defaultChainEth = 'injective'
    const { chainWiseAddresses } = await importLedgerAccount(
      [0, 1, 2, 3, 4],
      useEvmApp,
      useEvmApp ? defaultChainEth : defaultChainCosmos,
      LEDGER_ENABLED_EVM_CHAINS,
      chains,
    )

    const newAddresses: Addresses = {}
    for (const [chain, chainAddresses] of Object.entries(chainWiseAddresses)) {
      let index = 0
      for (const address of chainAddresses) {
        if (newAddresses[index]) {
          newAddresses[index][chain] = address
        } else {
          newAddresses[index] = { [chain]: address }
        }
        index += 1
      }
    }
    if (addresses.current) {
      const updatedAddresses = mergeAddresses(newAddresses, addresses.current)
      setAddresses(updatedAddresses)
    } else {
      setAddresses(newAddresses)
    }
  }

  const getLedgerAccountDetails = async (useEvmApp: boolean) => {
    const defaultChainCosmos = isCompassWallet() ? 'seiTestnet2' : 'cosmos'
    const defaultChainEth = 'injective'
    const { primaryChainAccount, chainWiseAddresses } = await importLedgerAccount(
      [0, 1, 2, 3, 4],
      useEvmApp,
      useEvmApp ? defaultChainEth : defaultChainCosmos,
      //Added as a placeholder
      [],
      chains,
    )

    setWalletAccounts(
      primaryChainAccount.map((account, index) => ({
        address: account.address,
        pubkey: account.pubkey,
        index,
      })),
    )
    const newAddresses: Addresses = {}

    for (const [chain, chainAddresses] of Object.entries(chainWiseAddresses)) {
      let index = 0
      for (const address of chainAddresses) {
        if (newAddresses[index]) {
          newAddresses[index][chain] = address
        } else {
          newAddresses[index] = { [chain]: address }
        }
        index += 1
      }
    }
    if (addresses.current) {
      const updatedAddresses = mergeAddresses(newAddresses, addresses.current)
      setAddresses(updatedAddresses)
    } else {
      setAddresses(newAddresses)
    }
  }

  return {
    mnemonic,
    walletAccounts,
    getAccountDetails,
    getLedgerAccountDetails,
    onOnboardingComplete,
    onBoardingCompleteLedger,
    getEvmLedgerAccountDetails,
  }
}
