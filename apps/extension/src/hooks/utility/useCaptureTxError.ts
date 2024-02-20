import { useChainApis } from '@leapwallet/cosmos-wallet-hooks'
import * as Sentry from '@sentry/react'
import { useEffect } from 'react'

const TRANSACTION_ID_NOT_FOUND_ON_CHAIN_ERROR =
  'was submitted but was not yet found on the chain. You might want to check later. There was a wait of 60 seconds.'

const REWARD_IS_TOO_LOW = 'Reward is too low'

export function useCaptureTxError(error: string | undefined) {
  const { rpcUrl } = useChainApis()

  useEffect(() => {
    if (error) {
      if (error.includes(TRANSACTION_ID_NOT_FOUND_ON_CHAIN_ERROR)) return
      if (error.includes(REWARD_IS_TOO_LOW)) return
      if (error.includes("You don't have enough")) return

      Sentry.captureException(`${error} - node: ${rpcUrl}`)
    }
  }, [error, rpcUrl])
}
