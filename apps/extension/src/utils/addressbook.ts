import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-use-before-define */
// eslint-disable-next-line @typescript-eslint/no-var-requires
import {
  getBlockChainFromAddress,
  isValidAddress,
} from '@leapwallet/cosmos-wallet-sdk/dist/utils/validateAddress'
import { useEffect, useState } from 'react'
import extension from 'webextension-polyfill'

import { DEBUG } from './debug'

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AddressBook {
  const STORAGE_ID = 'all-saved-contacts'

  export type SavedAddress = {
    emoji: number
    name: string
    address: string
    blockchain: SupportedChain
    tnsAddress?: string
    memo?: string
    ethAddress?: string
  }

  export type SavedAddresses = {
    [address: string]: SavedAddress
  }

  // eslint-disable-next-line no-unused-vars
  export function subscribe(cb: (s: SavedAddresses) => void) {
    extension.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && changes[STORAGE_ID]) {
        cb(changes[STORAGE_ID].newValue)
      }
    })
  }

  // eslint-disable-next-line no-unused-vars
  export function unsubscribe(cb: (s: SavedAddresses) => void) {
    extension.storage.onChanged.removeListener((changes, areaName) => {
      if (areaName === 'local' && changes[STORAGE_ID]) {
        cb(changes[STORAGE_ID].newValue)
      }
    })
  }

  /**
   * @desc Save address book entry for given address
   * @param {SavedAddress} entry
   */

  export async function save(entry: SavedAddress) {
    if (!isValidAddress(entry.address)) {
      DEBUG('Save contact', 'Address not valid')
      return
    }

    const { address, blockchain } = entry

    const existingEntry = await getEntry(address)

    if (!blockchain) {
      entry.blockchain = getBlockChainFromAddress(address) as SupportedChain
    }

    const data = await extension.storage.local.get([STORAGE_ID])

    const storedContacts: SavedAddresses = data[STORAGE_ID] ?? {}

    const newContacts: SavedAddresses = {}

    if (existingEntry) {
      newContacts[address] = { ...existingEntry, ...entry }
    } else {
      newContacts[address] = entry
    }

    const newSaveContact = { ...storedContacts, ...newContacts }

    await extension.storage.local.set({
      [STORAGE_ID]: newSaveContact,
    })

    return entry
  }

  /**
   * @desc Get the address book entry for given address
   */

  export async function getEntry(address: string) {
    const data = await extension.storage.local.get([STORAGE_ID])
    const storedContacts = (data[STORAGE_ID] as SavedAddresses) ?? {}
    return storedContacts[address]
  }

  export function useGetContact(address: string) {
    const [contact, setContact] = useState<SavedAddress>()

    useEffect(() => {
      let cancel = false

      if (address) {
        if (cancel) return
        getEntry(address)
          .then((s) => {
            if (!cancel) setContact(s)
          })
          .catch(() => {
            if (!cancel) setContact(undefined)
          })
      } else {
        setContact(undefined)
      }

      // subscribe to changes in storage for data[address] at [STORAGE_ID]
      const onChange = (changes: any, areaName: string) => {
        if (areaName === 'local' && changes[STORAGE_ID]) {
          const newContacts = changes[STORAGE_ID].newValue
          if (newContacts[address]) {
            setContact(newContacts[address])
          }
        }
      }

      extension.storage.onChanged.addListener(onChange)

      return () => {
        cancel = true
        extension.storage.onChanged.removeListener(onChange)
      }
    }, [address])

    return contact
  }

  /**
   * @desc Get all addresses
   * @returns list of all addresses
   */

  export const getAllEntries = async () => {
    const data = await extension.storage.local.get([STORAGE_ID])
    const storedContacts: SavedAddresses = data[STORAGE_ID] ?? {}
    return storedContacts
  }

  /**
   * @desc Removes specified address
   * @param {string} address
   */

  export async function removeEntry(address: string) {
    const data = await extension.storage.local.get([STORAGE_ID])

    const storedContacts: SavedAddresses = data[STORAGE_ID] ?? {}

    const savedEntry = await getEntry(address)

    if (savedEntry) {
      delete storedContacts[address]
    }

    delete storedContacts[address]

    await extension.storage.local.set({
      [STORAGE_ID]: storedContacts,
    })
  }

  /**
   * @desc Deletes all addresses
   */

  export function clear() {
    extension.storage.local.set({
      [STORAGE_ID]: {},
    })
  }
}
