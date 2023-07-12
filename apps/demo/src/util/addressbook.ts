import {
  getBlockChainFromAddress,
  isValidAddress,
} from '@leapwallet/cosmos-wallet-sdk/dist/utils/validateAddress'
import { useEffect, useState } from 'react'

import { AppConfig } from '~/config'

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AddressBook {
  export type Blockchain =
    | 'ETH'
    | 'BSC'
    | 'Avalanche'
    | 'Fantom'
    | 'terra'
    | 'OSMOSIS'
    | 'HARMONY'
    | string

  export type SavedAddress = {
    emoji: number
    name: string
    address: string
    blockchain: Blockchain
    tnsAddress?: string
    memo?: string
  }

  /**
   * @description Saved address
   * @property {number} emoji
   * @property {string} name
   * @property {string} address
   * @property {string} blockchain
   * @property {string} tnsAddress
   * @property {string} chain
   */

  export type SavedAddresses = {
    [address: string]: SavedAddress
  }

  /**
   * @desc Get the address book entry for given address
   * @param {string} address
   * @returns {SavedEntry | undefined} address book entry or undefined
   */

  export function getEntry(address: string): SavedAddress | null {
    const data = localStorage.getItem(AppConfig.STORAGE_KEYS.ADDRESS_BOOK)
    if (!data) return null
    const storedContacts: SavedAddresses = JSON.parse(data)
    return storedContacts[address]
  }

  /**
   * @desc Save address book entry for given address
   * @param {SavedAddress} entry
   */

  export async function save(entry: SavedAddress): Promise<void> {
    if (!isValidAddress(entry.address)) {
      return
    }

    const { address, blockchain } = entry

    const existingEntry = getEntry(address)

    if (!blockchain) {
      entry.blockchain = getBlockChainFromAddress(address)
    }

    const data = localStorage.getItem(AppConfig.STORAGE_KEYS.ADDRESS_BOOK)
    const newContacts: SavedAddresses = {}

    if (existingEntry) {
      newContacts[address] = { ...existingEntry, ...entry }
    } else {
      newContacts[address] = entry
    }
    if (data) {
      const book = JSON.parse(data) as SavedAddresses
      const updatedAddressBook = { ...book, ...newContacts }
      localStorage.setItem(AppConfig.STORAGE_KEYS.ADDRESS_BOOK, JSON.stringify(updatedAddressBook))
    } else {
      localStorage.setItem(AppConfig.STORAGE_KEYS.ADDRESS_BOOK, JSON.stringify(newContacts))
    }
  }

  export function useGetContact(address: string) {
    const [contact, setContact] = useState<SavedAddress | null>(null)

    useEffect(() => {
      let cancel = false
      if (cancel) return

      if (address) {
        const entry = getEntry(address)
        if (entry && !cancel) {
          setContact(entry)
        }
      }

      return () => {
        cancel = true
      }
    }, [address])

    return contact
  }

  /**
   * @desc Get all addresses
   */

  export const getAllEntries = (): SavedAddresses | null => {
    const data = localStorage.getItem(AppConfig.STORAGE_KEYS.ADDRESS_BOOK)
    if (!data) return null
    return JSON.parse(data) as SavedAddresses
  }

  /**
   * @desc Removes specified address
   * @param {string} address
   */

  export function removeEntry(address: string): void {
    const data = localStorage.getItem(AppConfig.STORAGE_KEYS.ADDRESS_BOOK)
    if (!data) return null
    const book = JSON.parse(data) as SavedAddresses
    delete book[address]
    localStorage.setItem(AppConfig.STORAGE_KEYS.ADDRESS_BOOK, JSON.stringify(book))
  }

  /**
   * @desc Deletes all addresses
   */

  export function clear() {
    localStorage.removeItem(AppConfig.STORAGE_KEYS.ADDRESS_BOOK)
  }
}
