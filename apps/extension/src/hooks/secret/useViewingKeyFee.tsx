import { calculateFee, StdFee } from '@cosmjs/stargate'
import {
  formatTokenAmount,
  useAddress,
  useChainApis,
  useDefaultGasEstimates,
  useGasPriceSteps,
} from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfos, feeDenoms, fromSmall } from '@leapwallet/cosmos-wallet-sdk'
import { SigningSscrt } from '@leapwallet/cosmos-wallet-sdk/dist/secret/sscrt'
import { captureException } from '@sentry/react'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { useSecretWallet } from '../wallet/useScrtWallet'

export function useViewingKeyFee(contractAddr: string | undefined) {
  const address = useAddress()
  const { lcdUrl } = useChainApis()
  const getWallet = useSecretWallet()
  const gasPriceSteps = useGasPriceSteps()
  const defaultGasEstimates = useDefaultGasEstimates()

  const simulate = async (signerAddress: string, contractAddress: string) => {
    try {
      const wallet = await getWallet()
      const sscrt = await SigningSscrt.create(lcdUrl as string, ChainInfos.secret.chainId, wallet)
      const { gasUsed } = await sscrt.simulateCreateViewingKey(signerAddress, contractAddress)

      return calculateFee(
        parseInt(gasUsed),
        `${gasPriceSteps.secret.low}${feeDenoms.mainnet.secret.coinMinimalDenom}`,
      )
    } catch (e) {
      return calculateFee(
        defaultGasEstimates.secret.DEFAULT_GAS_TRANSFER,
        `${gasPriceSteps.secret.low}${feeDenoms.mainnet.secret.coinMinimalDenom}`,
      )
    }
  }

  const { data: fee, status: feeStatus } = useQuery(
    ['simulate', contractAddr],
    () => simulate(address, contractAddr as string).catch(captureException),
    { enabled: !!contractAddr },
  )

  const feeText = useMemo(() => {
    if (fee) {
      return formatTokenAmount(
        fromSmall((fee as StdFee).amount[0].amount, 6),
        feeDenoms.mainnet.secret.coinDenom,
      )
    }
    return ''
  }, [fee])

  return { fee, feeText, loadingFees: feeStatus !== 'success' }
}
