import { sleep } from '@leapwallet/cosmos-wallet-sdk'
import { SkipAPI } from '@leapwallet/elements-core'

export async function sendTrackingRequest(
  chainId: string,
  txHash: string,
  retries = 3,
  waitFor = 3_000,
) {
  let response

  for (let i = 0; i < retries; i++) {
    const nextWaitFor = waitFor * 2
    try {
      const result = await SkipAPI.trackTransaction({
        chain_id: chainId,
        tx_hash: txHash,
      })
      response = result

      // If the request was successful, return the result
      if (result.success) {
        break
      }

      // If we have no retries left, throw an error
      const noRetriesLeft = i === retries - 1
      if (noRetriesLeft) {
        return {
          success: false,
          error: 'Unable to track transaction',
        } as {
          success: false
          error: string
        }
      }

      // If it was not successful and we still have retries left, wait for 3 seconds and retry
      await sleep(nextWaitFor)
    } catch (error) {
      const noRetriesLeft = i === retries - 1
      if (noRetriesLeft) {
        return {
          success: false,
          error: 'Unable to track transaction',
        } as {
          success: false
          error: string
        } // If we have no retries left, throw an error
      }

      await sleep(nextWaitFor) // If an error occurred and we still have retries left, wait for 3 seconds and retry
    }
  }
  return response
}
