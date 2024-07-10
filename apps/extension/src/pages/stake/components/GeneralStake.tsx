import {
  useActiveStakingDenom,
  useChainInfo,
  useIsCancleUnstakeSupported,
  useSelectedNetwork,
  useStaking,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  Delegation,
  Network,
  RewardsResponse,
  SupportedChain,
  UnbondingDelegation,
  Validator,
} from '@leapwallet/cosmos-wallet-sdk'
import { LineDivider } from '@leapwallet/leap-ui'
import { BigNumber } from 'bignumber.js'
import classNames from 'classnames'
import { TestnetAlertStrip } from 'components/alert-strip'
import BottomNav, { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import { EmptyCard } from 'components/empty-card'
import { PageHeader } from 'components/header'
import InfoSheet from 'components/Infosheet'
import PopupLayout from 'components/layout/popup-layout'
import ReadMoreText from 'components/read-more-text'
import Text from 'components/text'
import { addSeconds } from 'date-fns'
import { useChainPageInfo } from 'hooks'
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import { SelectedNetwork } from 'hooks/settings/useNetwork'
import { Images } from 'images'
import SelectChain from 'pages/home/SelectChain'
import SideNav from 'pages/home/side-nav'
import React, { useCallback, useMemo, useState } from 'react'
import { Colors } from 'theme/colors'
import { HeaderActionType } from 'types/components'
import { timeLeft } from 'utils/timeLeft'

import {
  DepositAmountCard,
  StakeHeading,
  StakeRewardCard,
  UnboundingDelegations,
  ValidatorBreakdown,
  YourRewardsSheet,
} from './index'

type StakeProps = {
  forceChain?: SupportedChain
  forceNetwork?: SelectedNetwork
  showBackAction?: boolean
  onBackClick?: () => void
}

const GeneralStake = React.memo(
  ({ forceChain, forceNetwork, showBackAction, onBackClick }: StakeProps) => {
    const [formatCurrency] = useFormatCurrency()
    const _activeChain = useActiveChain()
    const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain])
    const activeChainInfo = useChainInfo(activeChain)

    const _activeNetwork = useSelectedNetwork()
    const activeNetwork = useMemo(
      () => forceNetwork || _activeNetwork,
      [_activeNetwork, forceNetwork],
    )
    const [activeStakingDenom] = useActiveStakingDenom(activeChain, activeNetwork)
    const { headerChainImgSrc } = useChainPageInfo()
    const { formatHideBalance } = useHideAssets()
    const { isCancleUnstakeSupported } = useIsCancleUnstakeSupported(activeChain, activeNetwork)

    const [showChainSelector, setShowChainSelector] = useState(false)
    const [showSideNav, setShowSideNav] = useState(false)
    const [showYourRewardsSheet, setShowYourRewardsSheet] = useState(false)
    const [viewInfoSheet, setViewInfoSheet] = useState(false)

    const {
      rewards,
      totalDelegationAmount,
      loadingRewards,
      minMaxApy,
      token,
      totalRewardsDollarAmt,
      loadingNetwork,
      loadingUnboundingDelegations,
      unboundingDelegationsInfo,
      network,
      loadingDelegations,
      currencyAmountDelegation,
      delegations,
      isFetchingRewards,
    } = useStaking(activeChain, activeNetwork)

    const unstakingPeriod = useMemo(
      () =>
        timeLeft(
          addSeconds(
            new Date(),
            network?.chain?.params?.unbonding_time ?? 24 * 60 * 60 + 10,
          ).toISOString(),
          '',
        ),
      [network],
    )

    const isNotSupportedChain = false //isTestnet && (activeChain === 'juno' || activeChain === 'osmosis')
    const isLoadingAll =
      loadingDelegations || loadingNetwork || loadingRewards || loadingUnboundingDelegations
    const themeColor = Colors.getChainColor(activeChain, activeChainInfo)

    usePerformanceMonitor({
      page: 'stake',
      queryStatus: isLoadingAll ? 'loading' : 'success',
      op: 'stakePageLoad',
      description: 'loading state on stake page',
    })

    const handleOpenSelectChainSheet = useCallback(() => setShowChainSelector(true), [])
    const handleOpenSideNavSheet = useCallback(() => setShowSideNav(true), [])

    return (
      <div className='relative w-[400px] overflow-clip'>
        <SideNav isShown={showSideNav} toggler={() => setShowSideNav(!showSideNav)} />
        <PopupLayout
          header={
            <PageHeader
              title='Staking'
              imgSrc={headerChainImgSrc}
              onImgClick={handleOpenSelectChainSheet}
              action={
                showBackAction && onBackClick
                  ? {
                      onClick: onBackClick,
                      type: HeaderActionType.BACK,
                    }
                  : {
                      onClick: handleOpenSideNavSheet,
                      type: HeaderActionType.NAVIGATION,
                      className:
                        'w-[48px] h-[40px] px-3 bg-[#FFFFFF] dark:bg-gray-950 rounded-full',
                    }
              }
            />
          }
        >
          <>
            <TestnetAlertStrip />
            <div
              className={classNames('flex flex-col p-7 mb-10 overflow-scroll', {
                'h-[452px]': isLoadingAll || showChainSelector,
                'h-[483px]': !isLoadingAll,
              })}
            >
              <StakeHeading
                minApy={minMaxApy?.[0]}
                maxApy={minMaxApy?.[1]}
                chainName={activeChain}
                isLoading={loadingNetwork}
                network={network as Network}
                activeStakingCoinDenom={activeStakingDenom.coinDenom}
              />
              <div className='flex flex-col gap-y-4'>
                {!isNotSupportedChain && (
                  <>
                    {(rewards?.total[0] || loadingRewards) && (
                      <StakeRewardCard
                        isLoading={loadingRewards || isFetchingRewards}
                        onClaim={() => setShowYourRewardsSheet(true)}
                        rewardsAmount={totalRewardsDollarAmt ?? '0'}
                        forceChain={activeChain}
                        rewardsTokens={`${token?.symbol ?? ''}${
                          (rewards?.total.length ?? 1) > 1
                            ? ` +${(rewards?.total.length ?? 2) - 1} more`
                            : ''
                        }`}
                      />
                    )}

                    <DepositAmountCard
                      formatHideBalance={formatHideBalance}
                      unstakingPeriod={unstakingPeriod}
                      network={network as Network}
                      activeChain={activeChain}
                      totalDelegations={totalDelegationAmount as string}
                      currencyAmountDelegation={formatCurrency(
                        new BigNumber(currencyAmountDelegation as string),
                      )}
                      isLoading={loadingDelegations}
                      activeStakingCoinDenom={activeStakingDenom.coinDenom}
                      activeNetwork={activeNetwork}
                    />

                    <ValidatorBreakdown
                      formatHideBalance={formatHideBalance}
                      unstakingPeriod={unstakingPeriod}
                      rewards={rewards as RewardsResponse}
                      delegation={delegations as Record<string, Delegation>}
                      network={network as Network}
                      isLoading={loadingNetwork || loadingDelegations}
                      activeChain={activeChain}
                      activeNetwork={activeNetwork}
                    />

                    <UnboundingDelegations
                      formatHideBalance={formatHideBalance}
                      isLoading={loadingUnboundingDelegations}
                      unboundingDelegations={
                        unboundingDelegationsInfo as Record<string, UnbondingDelegation>
                      }
                      validators={network?.getValidators({}) as Record<string, Validator>}
                      onWhyPending={() => {
                        setViewInfoSheet(true)
                      }}
                      isCancleUnstakeSupported={isCancleUnstakeSupported}
                      activeChain={activeChain}
                      activeNetwork={activeNetwork}
                    />
                  </>
                )}

                {isNotSupportedChain && (
                  <EmptyCard
                    src={Images.Misc.CrossFilled}
                    isRounded
                    heading='Not supported'
                    subHeading={`Staking not supported for ${activeChain} testnet`}
                  />
                )}

                <div className='mt-0' />
                <LineDivider size='sm' />

                <div className='rounded-[16px] items-center'>
                  <Text
                    size='sm'
                    className='p-[4px] font-bold '
                    color='text-gray-600 dark:text-gray-400'
                  >
                    {`About Staking ${activeStakingDenom.coinDenom}`}
                  </Text>

                  <div className='flex flex-col px-[4px] pt-[4px]'>
                    <ReadMoreText
                      textProps={{ size: 'md', className: 'font-medium  flex flex-column' }}
                      readMoreColor={themeColor}
                    >
                      {`Staking is the process of locking up a digital asset non custodially (${activeStakingDenom.coinDenom}} in the case of the ${activeChainInfo.chainName} Network) to provide economic security.
                     When the staking transaction is complete, rewards will start to be generated immediately. At any time, stakers can send a transaction to claim their accumulated rewards, using a wallet.
                     Staking rewards are generated and distributed to staked ${activeStakingDenom.coinDenom}} holders in two ways: Transaction fees collected on the ${activeChainInfo.chainName} are distributed to staked ${activeStakingDenom.coinDenom}} holders. and secondly
                     from newly created ${activeStakingDenom.coinDenom}}. The total supply of ${activeStakingDenom.coinDenom}} is inflated to reward stakers. ${activeStakingDenom.coinDenom}} holders that do not stake do not receive rewards, meaning their ${activeStakingDenom.coinDenom}} get diluted over time.
                     The yearly inflation rate of ${activeStakingDenom.coinDenom}} is available on most explorers.
                     Staking ${activeStakingDenom.coinDenom} is not risk-free. If a validator has downtime or underperforms, a percentage of ${activeStakingDenom.coinDenom}} delegated to them may be forfeited. To mitigate these risks, it is recommended that ${activeStakingDenom.coinDenom}} holders delegate to multiple validators.
                     Upon unstaking, tokens are locked for a period of ${unstakingPeriod} post which you will automatically get them back in your wallet.
                     `}
                    </ReadMoreText>
                  </div>
                </div>
              </div>
            </div>
          </>
        </PopupLayout>

        <SelectChain isVisible={showChainSelector} onClose={() => setShowChainSelector(false)} />
        <YourRewardsSheet
          isOpen={showYourRewardsSheet}
          onClose={() => setShowYourRewardsSheet(false)}
          forceChain={forceChain}
          forceNetwork={forceNetwork}
        />

        <InfoSheet
          isVisible={viewInfoSheet}
          setVisible={setViewInfoSheet}
          heading={`Why does is take ${unstakingPeriod} to get the funds back?`}
          title='Why is Unstake Pending?'
          desc={`Upon unstaking, tokens are locked for a period of ${unstakingPeriod} post which you will automatically get them back in your wallet.`}
        />
        <BottomNav label={BottomNavLabel.Stake} />
      </div>
    )
  },
)

GeneralStake.displayName = 'GeneralStake'
export { GeneralStake }
