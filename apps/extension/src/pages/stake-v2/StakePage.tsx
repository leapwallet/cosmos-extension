/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  SelectedNetwork,
  useActiveChain,
  useActiveStakingDenom,
  useFeatureFlags,
  useLiquidStakingProviders,
  useSelectedNetwork,
  useStaking,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Validator } from '@leapwallet/cosmos-wallet-sdk/dist/browser/types/validators'
import {
  AggregatedSupportedChainType,
  ChainTagsStore,
  ClaimRewardsStore,
  DelegationsStore,
  RootBalanceStore,
  RootDenomsStore,
  UndelegationsStore,
  ValidatorsStore,
} from '@leapwallet/cosmos-wallet-store'
import { HeaderActionType, useTheme } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import BottomNav, { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import { WalletButton } from 'components/button'
import { EmptyCard } from 'components/empty-card'
import { PageHeader } from 'components/header'
import PopupLayout from 'components/layout/popup-layout'
import { AmountCardSkeleton } from 'components/Skeletons/StakeSkeleton'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { decodeChainIdToChain } from 'extension-scripts/utils'
import { useChainPageInfo, useWalletInfo } from 'hooks'
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor'
import { useSetActiveChain } from 'hooks/settings/useActiveChain'
import { useDontShowSelectChain } from 'hooks/useDontShowSelectChain'
import { useGetWalletAddresses } from 'hooks/useGetWalletAddresses'
import useQuery from 'hooks/useQuery'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import SelectChain from 'pages/home/SelectChain'
import SelectWallet from 'pages/home/SelectWallet'
import SideNav from 'pages/home/side-nav'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useNavigate } from 'react-router'
import { stakeEpochStore } from 'stores/epoch-store'
import { manageChainsStore } from 'stores/manage-chains-store'
import { UserClipboard } from 'utils/clipboard'

import ClaimInfo from './components/ClaimInfo'
import NotStakedCard from './components/NotStakedCard'
import ReviewClaimAndStakeTx from './components/ReviewClaimAndStakeTx'
import ReviewClaimTx from './components/ReviewClaimTx'
import SelectLSProvider from './components/SelectLSProvider'
import StakeAmountCard from './components/StakeAmountCard'
import StakeHeading from './components/StakeHeading'
import StakingCTAs from './components/StakingCTAs'
import TabList from './components/TabList'
import LavaClaimInfo from './restaking/LavaClaimInfo'
import { ReviewClaimLavaTx } from './restaking/ReviewClaimLavaTx'
import { StakeInputPageState } from './StakeInputPage'

type StakePageProps = {
  forceChain?: SupportedChain
  forceNetwork?: SelectedNetwork
  showBackAction?: boolean
  onBackClick?: () => void
  rootDenomsStore: RootDenomsStore
  delegationsStore: DelegationsStore
  validatorsStore: ValidatorsStore
  unDelegationsStore: UndelegationsStore
  claimRewardsStore: ClaimRewardsStore
  rootBalanceStore: RootBalanceStore
  chainTagsStore: ChainTagsStore
}

const StakePage = observer(
  ({
    forceChain,
    forceNetwork,
    showBackAction,
    onBackClick,
    rootDenomsStore,
    delegationsStore,
    validatorsStore,
    unDelegationsStore,
    claimRewardsStore,
    rootBalanceStore,
    chainTagsStore,
  }: StakePageProps) => {
    const _activeChain = useActiveChain()
    const setActiveChain = useSetActiveChain()
    const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain])

    const _activeNetwork = useSelectedNetwork()
    const activeNetwork = useMemo(
      () => forceNetwork || _activeNetwork,
      [_activeNetwork, forceNetwork],
    )

    const { walletAvatar, walletName, activeWallet } = useWalletInfo()
    const { headerChainImgSrc } = useChainPageInfo()
    const dontShowSelectChain = useDontShowSelectChain(manageChainsStore)
    const walletAddresses = useGetWalletAddresses(activeChain)

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

    const isLoadingAll = useMemo(() => {
      return loadingDelegations || loadingNetwork || loadingRewards || loadingUnboundingDelegations
    }, [loadingDelegations, loadingNetwork, loadingRewards, loadingUnboundingDelegations])

    const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, activeNetwork)

    const [showChainSelector, setShowChainSelector] = useState(false)
    const [defaultFilter, setDefaultFilter] = useState('All')
    const [showSelectWallet, setShowSelectWallet] = useState(false)
    const [showSideNav, setShowSideNav] = useState(false)
    const [showReviewClaimTx, setShowReviewClaimTx] = useState(false)
    const [showReviewClaimLavaTx, setShowReviewClaimLavaTx] = useState(false)
    const [showReviewClaimAndStakeTx, setShowReviewClaimAndStakeTx] = useState(false)
    const [showClaimInfo, setShowClaimInfo] = useState(false)
    const [showLavaClaimInfo, setShowLavaClaimInfo] = useState(false)
    const [showSelectLSProvider, setShowSelectLSProvider] = useState(false)
    const [isWalletAddressCopied, setIsWalletAddressCopied] = useState(false)

    const { isLoading: isLSProvidersLoading, data: lsProviders = {} } = useLiquidStakingProviders()
    const { data: featureFlags } = useFeatureFlags()

    useEffect(() => {
      if (!showChainSelector) {
        setDefaultFilter('All')
      }
    }, [showChainSelector])

    const onImgClick = useCallback(
      (event?: React.MouseEvent<HTMLDivElement>, props?: { defaultFilter?: string }) => {
        setShowChainSelector(true)
        if (props?.defaultFilter) {
          setDefaultFilter(props.defaultFilter)
        }
      },
      [],
    )
    const handleOpenWalletSheet = useCallback(() => setShowSelectWallet(true), [])
    const handleCopyClick = useCallback(() => {
      setIsWalletAddressCopied(true)
      setTimeout(() => setIsWalletAddressCopied(false), 2000)

      UserClipboard.copyText(walletAddresses?.[0])
    }, [walletAddresses])

    const tokenLSProviders = useMemo(() => {
      const _sortedTokenProviders = lsProviders[activeStakingDenom?.coinDenom]?.sort((a, b) => {
        const priorityA = a.priority
        const priorityB = b.priority

        if (priorityA !== undefined && priorityB !== undefined) {
          return priorityA - priorityB
        } else if (priorityA !== undefined) {
          return -1
        } else if (priorityB !== undefined) {
          return 1
        } else {
          return 0
        }
      })
      return _sortedTokenProviders
    }, [activeStakingDenom?.coinDenom, lsProviders])

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
        if (
          paramChainId &&
          (_activeChain as AggregatedSupportedChainType) !== AGGREGATED_CHAIN_KEY
        ) {
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
      if (paramChainId && (_activeChain as AggregatedSupportedChainType) !== AGGREGATED_CHAIN_KEY) {
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
    }, [
      _activeChain,
      activeChain,
      activeNetwork,
      navigate,
      paramChainId,
      paramValidatorAddress,
      validators,
    ])

    useEffect(() => {
      switch (paramAction) {
        case 'CLAIM_REWARDS':
          setShowReviewClaimTx(true)
          break
        case 'OPEN_LIQUID_STAKING':
          setShowSelectLSProvider(true)
          break
        case 'DELEGATE':
          redirectToInputPage()
          break
        default:
          break
      }
    }, [paramAction, redirectToInputPage])

    const onClaim = useCallback(() => {
      if (activeChain === 'lava' && featureFlags?.restaking?.extension) {
        setShowLavaClaimInfo(true)
      } else {
        setShowReviewClaimTx(true)
      }
    }, [activeChain, featureFlags?.restaking?.extension])

    const onClaimAndStake = useCallback(() => setShowClaimInfo(true), [])

    usePerformanceMonitor({
      enabled: !!activeWallet,
      page: 'stake',
      op: 'stakePageLoad',
      description: 'loading state on stake page',
      queryStatus: isLoadingAll ? 'loading' : 'success',
    })

    if (!activeWallet) {
      return (
        <div className='relative w-full overflow-clip panel-height'>
          <PopupLayout>
            <div>
              <EmptyCard src={Images.Logos.LeapCosmos} heading='No wallet found' />
            </div>
          </PopupLayout>
        </div>
      )
    }

    return (
      <div className='relative w-full overflow-clip panel-height'>
        <SideNav isShown={showSideNav} toggler={() => setShowSideNav(!showSideNav)} />
        <PopupLayout
          header={
            <PageHeader
              action={
                showBackAction && onBackClick
                  ? {
                      onClick: onBackClick,
                      type: HeaderActionType.BACK,
                    }
                  : {
                      onClick: () => setShowSideNav(true),
                      type: HeaderActionType.NAVIGATION,
                      className:
                        'min-w-[48px] h-[36px] px-2 bg-[#FFFFFF] dark:bg-gray-950 rounded-full',
                    }
              }
              imgSrc={headerChainImgSrc}
              onImgClick={dontShowSelectChain ? undefined : onImgClick}
              title={
                <WalletButton
                  walletName={walletName}
                  showWalletAvatar={true}
                  walletAvatar={walletAvatar}
                  showDropdown={true}
                  handleDropdownClick={handleOpenWalletSheet}
                  giveCopyOption={true}
                  handleCopyClick={handleCopyClick}
                  isAddressCopied={isWalletAddressCopied}
                />
              }
            />
          }
        >
          <div className='flex flex-col gap-y-6 p-6 mb-10 overflow-scroll'>
            <StakeHeading
              rootDenomsStore={rootDenomsStore}
              delegationsStore={delegationsStore}
              validatorsStore={validatorsStore}
              unDelegationsStore={unDelegationsStore}
              claimRewardsStore={claimRewardsStore}
              forceChain={activeChain}
              forceNetwork={activeNetwork}
            />

            {isLoadingAll && <AmountCardSkeleton />}
            {!isLoadingAll &&
              (Object.values(delegations ?? {}).length > 0 ||
              stakeEpochStore.getDelegationEpochMessages(activeStakingDenom).length > 0 ? (
                <StakeAmountCard
                  onClaim={onClaim}
                  onClaimAndStake={onClaimAndStake}
                  rootDenomsStore={rootDenomsStore}
                  delegationsStore={delegationsStore}
                  validatorsStore={validatorsStore}
                  unDelegationsStore={unDelegationsStore}
                  claimRewardsStore={claimRewardsStore}
                  forceChain={activeChain}
                  forceNetwork={activeNetwork}
                />
              ) : (
                <NotStakedCard
                  rootDenomsStore={rootDenomsStore}
                  activeChain={activeChain}
                  activeNetwork={activeNetwork}
                />
              ))}

            <div className='flex gap-x-4 w-full'>
              {isLSProvidersLoading && <Skeleton width={352} borderRadius={100} height={50} />}

              {!isLSProvidersLoading && (
                <StakingCTAs
                  tokenLSProviders={tokenLSProviders}
                  isLSProvidersLoading={isLSProvidersLoading}
                  setShowSelectLSProvider={setShowSelectLSProvider}
                  activeChain={activeChain}
                  activeNetwork={activeNetwork}
                />
              )}
            </div>

            <TabList
              rootDenomsStore={rootDenomsStore}
              delegationsStore={delegationsStore}
              validatorsStore={validatorsStore}
              unDelegationsStore={unDelegationsStore}
              claimRewardsStore={claimRewardsStore}
              forceChain={activeChain}
              forceNetwork={activeNetwork}
              rootBalanceStore={rootBalanceStore}
            />
          </div>
        </PopupLayout>

        <SelectChain
          isVisible={showChainSelector}
          onClose={() => setShowChainSelector(false)}
          chainTagsStore={chainTagsStore}
          defaultFilter={defaultFilter}
        />
        <SelectWallet
          isVisible={showSelectWallet}
          onClose={() => setShowSelectWallet(false)}
          title='Wallets'
        />

        {!loadingNetwork && (
          <>
            <ReviewClaimTx
              isOpen={showReviewClaimTx}
              onClose={() => setShowReviewClaimTx(false)}
              validators={validators}
              rootDenomsStore={rootDenomsStore}
              rootBalanceStore={rootBalanceStore}
              delegationsStore={delegationsStore}
              validatorsStore={validatorsStore}
              unDelegationsStore={unDelegationsStore}
              claimRewardsStore={claimRewardsStore}
              forceChain={activeChain}
              forceNetwork={activeNetwork}
            />

            {activeChain === 'lava' && featureFlags?.restaking?.extension === 'active' && (
              <ReviewClaimLavaTx
                isOpen={showReviewClaimLavaTx}
                onClose={() => setShowReviewClaimLavaTx(false)}
                rootDenomsStore={rootDenomsStore}
                rootBalanceStore={rootBalanceStore}
                forceChain={activeChain}
                forceNetwork={activeNetwork}
              />
            )}

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
              rootDenomsStore={rootDenomsStore}
              delegationsStore={delegationsStore}
              validatorsStore={validatorsStore}
              unDelegationsStore={unDelegationsStore}
              claimRewardsStore={claimRewardsStore}
              forceChain={activeChain}
              forceNetwork={activeNetwork}
            />
            {activeChain === 'lava' && featureFlags?.restaking?.extension === 'active' && (
              <LavaClaimInfo
                isOpen={showLavaClaimInfo}
                onClose={() => setShowLavaClaimInfo(false)}
                onClaimValidatorRewards={() => {
                  setShowLavaClaimInfo(false)
                  setShowReviewClaimTx(true)
                }}
                onClaimProviderRewards={() => {
                  setShowLavaClaimInfo(false)
                  setShowReviewClaimLavaTx(true)
                }}
                rootDenomsStore={rootDenomsStore}
                delegationsStore={delegationsStore}
                validatorsStore={validatorsStore}
                unDelegationsStore={unDelegationsStore}
                claimRewardsStore={claimRewardsStore}
                rootBalanceStore={rootBalanceStore}
                forceChain={forceChain}
                forceNetwork={forceNetwork}
              />
            )}

            {chainRewards && (
              <ReviewClaimAndStakeTx
                isOpen={showReviewClaimAndStakeTx}
                onClose={() => setShowReviewClaimAndStakeTx(false)}
                validators={validators}
                chainRewards={chainRewards}
                rootDenomsStore={rootDenomsStore}
                delegationsStore={delegationsStore}
                validatorsStore={validatorsStore}
                unDelegationsStore={unDelegationsStore}
                claimRewardsStore={claimRewardsStore}
                rootBalanceStore={rootBalanceStore}
                forceChain={activeChain}
                forceNetwork={activeNetwork}
              />
            )}
          </>
        )}

        {tokenLSProviders && (
          <SelectLSProvider
            isVisible={showSelectLSProvider}
            onClose={() => setShowSelectLSProvider(false)}
            providers={tokenLSProviders}
            rootDenomsStore={rootDenomsStore}
            forceChain={activeChain}
            forceNetwork={activeNetwork}
          />
        )}
        <BottomNav label={BottomNavLabel.Stake} />
      </div>
    )
  },
)

export default StakePage
