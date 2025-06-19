/* eslint-disable @typescript-eslint/no-explicit-any */
import { Addresses } from './types'

export function mergeAddresses(addressesNew: Addresses, addressesOriginal: Addresses) {
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

  const newAddressIndexes = Object.keys(addressesNew).map((addressIndex) => addressIndex)

  for (const addressIndex of newAddressIndexes) {
    if (!updatedAddresses[addressIndex as any]) {
      updatedAddresses[addressIndex as any] = addressesNew[addressIndex as any]
    }
  }

  return updatedAddresses
}
