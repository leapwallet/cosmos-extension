/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  STAKE_MODE,
  useActiveChain,
  useActiveStakingDenom,
  useSelectedNetwork,
  useStaking,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Validator } from '@leapwallet/cosmos-wallet-sdk/dist/browser/types/validators'
import { AggregatedSupportedChainType } from '@leapwallet/cosmos-wallet-store'
import BigNumber from 'bignumber.js'
import { EmptyCard } from 'components/empty-card'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { decodeChainIdToChain } from 'extension-scripts/utils'
import { useWalletInfo } from 'hooks'
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor'
import { useSetActiveChain } from 'hooks/settings/useActiveChain'
import useQuery from 'hooks/useQuery'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import SelectChain from 'pages/home/SelectChain'
import SelectWallet from 'pages/home/SelectWallet'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { rootBalanceStore } from 'stores/root-store'
import {
  claimRewardsStore,
  delegationsStore,
  unDelegationsStore,
  validatorsStore,
} from 'stores/stake-store'

import ClaimInfo from './components/ClaimInfo'
import NotStakedCard from './components/NotStakedCard'
import ReviewClaimAndStakeTx from './components/ReviewClaimAndStakeTx'
import ReviewClaimTx from './components/ReviewClaimTx'
import StakeAmountCard from './components/StakeAmountCard'
import StakeHeading from './components/StakeHeading'
import TabList from './components/TabList'
import { StakeHeader } from './stake-header'
import { StakeInputPageState } from './StakeInputPage'
import { StakeTxnSheet } from './StakeTxnSheet'

const StakePage = observer(() => {
  const activeChain = useActiveChain()

  const setActiveChain = useSetActiveChain()
  const activeNetwork = useSelectedNetwork()

  const { activeWallet } = useWalletInfo()

  const query = useQuery()
  const paramValidatorAddress = query.get('validatorAddress') ?? undefined
  const paramChainId = query.get('chainId') ?? undefined
  const paramAction = query.get('action') ?? undefined

  const navigate = useNavigate()

  const denoms = rootDenomsStore.allDenoms
  const chainDelegations = delegationsStore.delegationsForChain(activeChain)
  const chainValidators = validatorsStore.validatorsForChain(activeChain)
  const chainUnDelegations = unDelegationsStore.unDelegationsForChain(activeChain)
  const chainClaimRewards = claimRewardsStore.claimRewardsForChain(activeChain)

  const {
    rewards,
    delegations,
    loadingDelegations,
    loadingNetwork,
    loadingRewards,
    loadingUnboundingDelegations,
  } = useStaking(
    denoms,
    chainDelegations,
    chainValidators,
    chainUnDelegations,
    chainClaimRewards,
    activeChain,
    activeNetwork,
    rootBalanceStore.allSpendableTokens,
  )

  const isLoadingAll =
    loadingDelegations || loadingNetwork || loadingRewards || loadingUnboundingDelegations

  const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, activeNetwork)

  const [showChainSelector, setShowChainSelector] = useState(false)
  const [showSelectWallet, setShowSelectWallet] = useState(false)
  const [showReviewClaimTx, setShowReviewClaimTx] = useState(false)
  const [showReviewClaimAndStakeTx, setShowReviewClaimAndStakeTx] = useState(false)
  const [showClaimInfo, setShowClaimInfo] = useState(false)
  const [claimTxMode, setClaimTxMode] = useState<STAKE_MODE | 'CLAIM_AND_DELEGATE' | null>(null)

  const chainRewards = useMemo(() => {
    const rewardMap: Record<string, any> = {}

    rewards?.rewards?.forEach((rewardObj: any) => {
      const validatorAddress = rewardObj.validator_address

      if (!rewardMap[validatorAddress]) {
        rewardMap[validatorAddress] = {
          validator_address: validatorAddress,
          reward: [],
        }
      }
      const accumulatedAmounts: any = {}
      rewardObj.reward.forEach((reward: any) => {
        const { denom, amount, tokenInfo } = reward
        const numAmount = parseFloat(amount)

        if (accumulatedAmounts[denom]) {
          accumulatedAmounts[denom] += numAmount * Math.pow(10, tokenInfo?.coinDecimals ?? 6)
        } else {
          accumulatedAmounts[denom] = numAmount * Math.pow(10, tokenInfo?.coinDecimals ?? 6)
        }
      })
      rewardMap[validatorAddress].reward.push(
        ...Object.keys(accumulatedAmounts).map((denom) => ({
          denom,
          amount: accumulatedAmounts[denom],
        })),
      )
    })

    const totalRewards = rewards?.total.find(
      (reward: any) => reward.denom === activeStakingDenom?.coinMinimalDenom,
    )

    const rewardsStatus = ''
    const usdValueStatus = ''
    return {
      rewardsUsdValue: new BigNumber(totalRewards?.currencyAmount ?? '0'),
      rewardsStatus,
      usdValueStatus,
      denom: totalRewards?.denom,
      rewardsDenomValue: new BigNumber(totalRewards?.amount ?? '0'),
      rewards: {
        rewardMap,
      },
    }
  }, [activeStakingDenom, rewards])

  useEffect(() => {
    async function updateChain() {
      if (paramChainId && (activeChain as AggregatedSupportedChainType) !== AGGREGATED_CHAIN_KEY) {
        const chainIdToChain = await decodeChainIdToChain()
        const chain = chainIdToChain[paramChainId] as SupportedChain
        setActiveChain(chain)
      }
    }
    updateChain()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramChainId])

  const validators = useMemo(
    () =>
      chainValidators.validatorData.validators?.reduce((acc, validator) => {
        acc[validator.address] = validator
        return acc
      }, {} as Record<string, Validator>),
    [chainValidators.validatorData.validators],
  )
  const redirectToInputPage = useCallback(async () => {
    let chain = activeChain
    if (paramChainId && (activeChain as AggregatedSupportedChainType) !== AGGREGATED_CHAIN_KEY) {
      const chainIdToChain = await decodeChainIdToChain()
      chain = chainIdToChain[paramChainId] as SupportedChain
    }
    navigate('/stake/input', {
      state: {
        mode: 'DELEGATE',
        toValidator: paramValidatorAddress ? validators[paramValidatorAddress] : undefined,
        forceChain: chain,
        forceNetwork: activeNetwork,
      } as StakeInputPageState,
      replace: true,
    })
  }, [activeChain, activeNetwork, navigate, paramChainId, paramValidatorAddress, validators])

  useEffect(() => {
    switch (paramAction) {
      case 'CLAIM_REWARDS':
        setShowReviewClaimTx(true)
        break
      case 'DELEGATE':
        redirectToInputPage()
        break
      default:
        break
    }
  }, [paramAction, redirectToInputPage])

  const onClaim = useCallback(() => setShowClaimInfo(true), [])

  usePerformanceMonitor({
    enabled: !!activeWallet,
    page: 'stake',
    op: 'stakePageLoad',
    description: 'loading state on stake page',
    queryStatus: isLoadingAll ? 'loading' : 'success',
  })

  if (!activeWallet) {
    return (
      <div className='relative w-full overflow-clip panel-height flex items-center justify-center'>
        <EmptyCard src={Images.Logos.LeapCosmos} heading='No wallet found' />
      </div>
    )
  }

  return (
    <>
      <StakeHeader />

      <div className='flex flex-col gap-y-5 px-6 py-7 w-full flex-1 overflow-auto'>
        <StakeHeading />

        {isLoadingAll || Object.values(delegations ?? {}).length > 0 ? (
          <StakeAmountCard onClaim={onClaim} />
        ) : (
          <NotStakedCard />
        )}

        <TabList />
      </div>

      <SelectChain isVisible={showChainSelector} onClose={() => setShowChainSelector(false)} />

      <SelectWallet
        isVisible={showSelectWallet}
        onClose={() => setShowSelectWallet(false)}
        title='Wallets'
      />

      <StakeTxnSheet
        mode={claimTxMode}
        isOpen={!!claimTxMode}
        onClose={() => setClaimTxMode(null)}
      />

      <ClaimInfo
        isOpen={showClaimInfo}
        onClose={() => setShowClaimInfo(false)}
        onClaim={() => {
          setShowClaimInfo(false)
          setShowReviewClaimTx(true)
        }}
        onClaimAndStake={() => {
          setShowClaimInfo(false)
          setShowReviewClaimAndStakeTx(true)
        }}
        forceChain={activeChain}
        forceNetwork={activeNetwork}
      />

      <ReviewClaimTx
        isOpen={showReviewClaimTx}
        onClose={() => setShowReviewClaimTx(false)}
        validators={validators}
        setClaimTxMode={setClaimTxMode}
      />

      <ReviewClaimAndStakeTx
        isOpen={showReviewClaimAndStakeTx}
        onClose={() => setShowReviewClaimAndStakeTx(false)}
        validators={validators}
        chainRewards={chainRewards}
        setClaimTxMode={setClaimTxMode}
      />
    </>
  )
})

export default StakePage
