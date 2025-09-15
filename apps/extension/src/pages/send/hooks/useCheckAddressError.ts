/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  AddressWarning,
  INITIAL_ADDRESS_WARNING,
  useAddress,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  isAptosAddress,
  isEthAddress,
  isSolanaAddress,
  isValidAddress,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { useEffect } from 'react'

export type UseCheckAddressErrorParams = {
  setAddressError: React.Dispatch<React.SetStateAction<string | undefined>>
  setAddressWarning: React.Dispatch<React.SetStateAction<AddressWarning>>
  recipientInputValue: string
  showNameServiceResults: boolean
  sendActiveChain: SupportedChain
}

function isHex(value: string): boolean {
  return /^(0x|0X)?[a-fA-F0-9]+$/.test(value) && value.length % 2 === 0
}

function getHexByteLength(value: string): number {
  return /^(0x|0X)/.test(value) ? (value.length - 2) / 2 : value.length / 2
}

export function isValidSuiAddress(value: string): value is string {
  return isHex(value) && getHexByteLength(value) === 32
}

export function useCheckAddressError({
  setAddressError,
  setAddressWarning,
  recipientInputValue,
  showNameServiceResults,
  sendActiveChain,
}: UseCheckAddressErrorParams) {
  const currentWalletAddress = useAddress(sendActiveChain)

  useEffect(() => {
    ;(async function () {
      if (!recipientInputValue || currentWalletAddress === recipientInputValue) {
        setAddressWarning(INITIAL_ADDRESS_WARNING)
        setAddressError(undefined)
        return
      } else if (
        !isValidAddress(recipientInputValue) &&
        !isEthAddress(recipientInputValue) &&
        !isAptosAddress(recipientInputValue) &&
        !isSolanaAddress(recipientInputValue) &&
        !showNameServiceResults
      ) {
        setAddressError('The entered address is invalid')
      } else {
        setAddressWarning(INITIAL_ADDRESS_WARNING)
        setAddressError(undefined)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWalletAddress, recipientInputValue, showNameServiceResults])
}
