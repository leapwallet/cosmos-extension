import { BalanceErrorStatus } from '@leapwallet/cosmos-wallet-store'
import { RaffleAndTestnetAlertStrip } from 'components/alert-strip'
import { ApiStatusWarningStrip } from 'components/alert-strip/ApiStatusWarningStrip'
import { AlertStrip } from 'components/alert-strip/v2'
import { useQueryParams } from 'hooks/useQuery'
import React from 'react'
import { queryParams } from 'utils/query-params'

export const GeneralHomeAlertStirps = ({ balanceError }: { balanceError: BalanceErrorStatus }) => {
  const query = useQueryParams()

  const txDeclined = query.get(queryParams.txDeclined)
  const walletAvatarChanged = query.get(queryParams.walletAvatarChanged)
  const faucetError = query.get(queryParams.faucetError)
  const faucetSuccess = query.get(queryParams.faucetSuccess)

  return (
    <>
      <RaffleAndTestnetAlertStrip />

      <ApiStatusWarningStrip balanceError={balanceError} />

      {txDeclined ? (
        <AlertStrip type='error' timeOut={4000} onHide={() => query.remove(queryParams.txDeclined)}>
          Transaction declined
        </AlertStrip>
      ) : null}

      {faucetSuccess || faucetError ? (
        <AlertStrip
          timeOut={6000}
          type={faucetSuccess ? 'success' : 'error'}
          onHide={() => {
            query.remove([queryParams.faucetSuccess, queryParams.faucetError])
          }}
        >
          {faucetSuccess || faucetError}
        </AlertStrip>
      ) : null}

      {walletAvatarChanged ? (
        <AlertStrip
          timeOut={2500}
          type='success'
          onHide={() => query.remove(queryParams.walletAvatarChanged)}
        >
          Profile picture changed successfully
        </AlertStrip>
      ) : null}
    </>
  )
}
