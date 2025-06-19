import {
  AddressWarning,
  INITIAL_ADDRESS_WARNING,
  useActiveWallet,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import { AccountDetails, pubKeyToEvmAddressToShow } from '@leapwallet/cosmos-wallet-sdk'
import { FetchStatus, QueryStatus } from '@tanstack/react-query'
import { ReactElement, useEffect } from 'react'

export type UseFillAddressWarningParams = {
  fetchAccountDetailsData: AccountDetails | undefined
  fetchAccountDetailsStatus: QueryStatus | FetchStatus

  addressWarningElementError: ReactElement
  setAddressWarning: React.Dispatch<React.SetStateAction<AddressWarning>>
}

export function useFillAddressWarning({
  fetchAccountDetailsData,
  fetchAccountDetailsStatus,

  addressWarningElementError,
  setAddressWarning,
}: UseFillAddressWarningParams) {
  const activeWallet = useActiveWallet()

  useEffect(() => {
    ;(async function fillAddressWarning() {
      switch (fetchAccountDetailsStatus) {
        case 'loading': {
          setAddressWarning({
            type: 'erc20',
            message: addressWarningElementError,
          })

          break
        }

        case 'success': {
          if (
            fetchAccountDetailsData?.pubKey.key &&
            activeWallet?.walletType !== WALLETTYPE.LEDGER
          ) {
            const recipient0xAddress = pubKeyToEvmAddressToShow(fetchAccountDetailsData.pubKey.key)

            if (recipient0xAddress.toLowerCase().startsWith('0x')) {
              setAddressWarning({
                type: 'erc20',
                message: `Recipient will receive tokens on associated EVM address: ${recipient0xAddress}`,
              })
            } else {
              setAddressWarning({
                type: 'erc20',
                message: 'You can only transfer EVM tokens to an EVM address.',
              })
            }
          } else {
            setAddressWarning(INITIAL_ADDRESS_WARNING)
          }

          break
        }

        case 'error': {
          setAddressWarning({
            type: 'erc20',
            message: 'You can only transfer EVM tokens to an EVM address.',
          })
          break
        }

        default: {
          setAddressWarning(INITIAL_ADDRESS_WARNING)
        }
      }
    })()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAccountDetailsData?.pubKey?.key, fetchAccountDetailsStatus])
}
