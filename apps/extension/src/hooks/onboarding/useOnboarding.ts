import { importLedgerAccount } from '@leapwallet/cosmos-wallet-sdk'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/constants'
import { KeyChain } from '@leapwallet/leap-keychain'
import { SeedPhrase } from 'hooks/wallet/seed-phrase/useSeedPhrase'
import { Wallet } from 'hooks/wallet/useWallet'
import { useEffect, useState } from 'react'
import { isCompassWallet } from 'utils/isCompassWallet'

type Addresses = Record<number, Record<string, { address: string; pubKey: Uint8Array }>>

export function useOnboarding() {
  const [walletAccounts, setWalletAccounts] =
    useState<{ address: string; index: number; pubkey: Uint8Array | null }[]>()

  const importWalletAccounts = Wallet.useImportMultipleWalletAccounts()

  const [mnemonic, setMnemonic] = useState('')
  const [addresses, setAddresses] = useState<Addresses>()
  const saveLedgerWallet = Wallet.useSaveLedgerWallet()

  useEffect(() => {
    if (!mnemonic) {
      const _mnemonic = SeedPhrase.CreateNewMnemonic()
      setMnemonic(_mnemonic)
    }
  }, [mnemonic])

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
      const accountsToSave = Object.entries(addresses ?? {})
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

  const getLedgerAccountDetails = async () => {
    const { primaryChainAccount, chainWiseAddresses } = await importLedgerAccount(
      [0, 1, 2, 3, 4],
      isCompassWallet() ? 'seiTestnet2' : 'cosmos',
    )

    setWalletAccounts(
      primaryChainAccount.map((account, index) => ({
        address: account.address,
        pubkey: account.pubkey,
        index,
      })),
    )
    const addresses: Addresses = {}

    for (const [chain, chainAddresses] of Object.entries(chainWiseAddresses)) {
      let index = 0
      for (const address of chainAddresses) {
        if (addresses[index]) {
          addresses[index][chain] = address
        } else {
          addresses[index] = { [chain]: address }
        }
        index += 1
      }
    }

    setAddresses(addresses)
  }

  return {
    mnemonic,
    walletAccounts,
    getAccountDetails,
    getLedgerAccountDetails,
    onOnboardingComplete,
    onBoardingCompleteLedger,
  }
}
