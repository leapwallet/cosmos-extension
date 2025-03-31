import { useActiveChain, useSeiLinkedAddressState } from '@leapwallet/cosmos-wallet-hooks'
import { TestnetAlertStrip } from 'components/alert-strip'
import { AlertStripV2 } from 'components/alert-strip/alert-strip-v2'
import { ApiStatusWarningStrip } from 'components/alert-strip/ApiStatusWarningStrip'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { SHOW_LINK_ADDRESS_NUDGE } from 'config/storage-keys'
import { Wallet } from 'hooks/wallet/useWallet'
import React, { useEffect } from 'react'
import { globalSheetsStore } from 'stores/ui/global-sheets-store'
import { AggregatedSupportedChain } from 'types/utility'

export const GeneralHomeAlertStirps = ({
  evmStatus,
  balanceError,
}: {
  evmStatus: string
  balanceError: boolean
}) => {
  const activeChain = useActiveChain() as AggregatedSupportedChain
  const getWallet = Wallet.useGetWallet()
  const { addressLinkState } = useSeiLinkedAddressState(
    getWallet,
    activeChain === AGGREGATED_CHAIN_KEY ? 'seiTestnet2' : undefined,
  )

  useEffect(() => {
    if (
      addressLinkState === 'pending' &&
      evmStatus === 'success' &&
      localStorage.getItem(SHOW_LINK_ADDRESS_NUDGE) !== 'false'
    ) {
      globalSheetsStore.setCopyAddressSheetOpen(true)
    }
  }, [addressLinkState, evmStatus])

  return (
    <>
      {addressLinkState === 'pending' ? (
        <AlertStripV2>
          To use SEI, first{' '}
          <button
            onClick={() => globalSheetsStore.setCopyAddressSheetOpen(true)}
            className='underline underline-offset-2'
          >
            Link your address
          </button>
        </AlertStripV2>
      ) : (
        <TestnetAlertStrip />
      )}

      {balanceError && <ApiStatusWarningStrip />}
    </>
  )
}
