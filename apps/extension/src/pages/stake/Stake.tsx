import {
  useIsCancleUnstakeSupported,
  useStaking,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/constants'
import Network from '@leapwallet/cosmos-wallet-sdk/dist/stake/network'
import {
  Delegation,
  RewardsResponse,
  UnbondingDelegation,
} from '@leapwallet/cosmos-wallet-sdk/dist/types/staking'
import { Validator } from '@leapwallet/cosmos-wallet-sdk/dist/types/validators'
import {
  Avatar,
  Buttons,
  CardDivider,
  GenericCard,
  Header,
  HeaderActionType,
  LineDivider,
} from '@leapwallet/leap-ui'
import { BigNumber } from 'bignumber.js'
import classNames from 'classnames'
import AlertStrip from 'components/alert-strip/AlertStrip'
import BottomNav, { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import { EmptyCard } from 'components/empty-card'
import InfoSheet from 'components/Infosheet'
import PopupLayout from 'components/layout/popup-layout'
import ReadMoreText from 'components/read-more-text'
import TokenCardSkeleton from 'components/Skeletons/TokenCardSkeleton'
import Text from 'components/text'
import { PageName } from 'config/analytics'
import currency from 'currency.js'
import { addSeconds } from 'date-fns'
import { usePageView } from 'hooks/analytics/usePageView'
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import { useChainInfos } from 'hooks/useChainInfos'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { useThemeColor } from 'hooks/utility/useThemeColor'
import { Images } from 'images'
import SelectChain from 'pages/home/SelectChain'
import SideNav from 'pages/home/side-nav'
import React, { useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useNavigate } from 'react-router'
import { useRecoilState } from 'recoil'
import { Colors } from 'theme/colors'
import { hex2rgba } from 'utils/hextorgba'
import { imgOnError } from 'utils/imgOnError'
import { isCompassWallet } from 'utils/isCompassWallet'
import { sliceWord } from 'utils/strings'
import { timeLeft } from 'utils/timeLeft'

import { selectedChainAlertState } from '../../atoms/selected-chain-alert'
import { CancleUndelegationProps } from './cancelUndelegation'
import { ChooseValidatorProps } from './chooseValidator'
import { YourRewardsSheet } from './components'
import { ValidatorDetailsProps } from './validatorDetails'

function UnboundingDelegations({
  unboundingDelegations,
  validators,
  isLoading,
  onWhyPending,
  formatHideBalance,
  isCancleUnstakeSupported,
}: {
  isLoading: boolean
  onWhyPending: () => void
  validators: Record<string, Validator>
  unboundingDelegations: Record<string, UnbondingDelegation>
  // eslint-disable-next-line no-unused-vars
  formatHideBalance: (s: string) => React.ReactNode
  isCancleUnstakeSupported: boolean
}) {
  const navigate = useNavigate()

  if (!isLoading && (Object.values(unboundingDelegations ?? {}).length === 0 || !validators)) {
    return <></>
  }

  return (
    <div className='dark:bg-gray-900 rounded-2xl bg-white-100 pt-4'>
      {isLoading && (
        <div className='w-[312px] p-4'>
          <Skeleton count={3} />
        </div>
      )}

      {!isLoading && Object.values(unboundingDelegations).length !== 0 && validators && (
        <div className='flex justify-between'>
          <Text size='xs' color='dark:text-gray-200 text-gray-600' className='font-bold py-1 px-4'>
            Pending Unstakes
          </Text>
          <div className='px-4'>
            <div
              className={
                'flex justify-center text-xs text-gray-600 dark:text-gray-200 items-center cursor-pointer'
              }
              onClick={onWhyPending}
            >
              <span className='mr-1 text-lg material-icons-round'>info</span>
              <span className='text-xs font-semibold'>Why pending?</span>
            </div>
          </div>
        </div>
      )}
      {!isLoading &&
        unboundingDelegations &&
        validators &&
        Object.values(unboundingDelegations).map((ud, index) => {
          const validator = validators[ud?.validator_address]
          const frags = ud?.entries?.map((d, idx) => {
            const timeLeftText = timeLeft(d.completion_time)
            const Component = () => {
              const { data: keybaseImageUrl } = useValidatorImage(validator)

              return (
                <React.Fragment key={`validators ${validator?.rank} ${idx}`}>
                  {index !== 0 && <CardDivider />}
                  {validator && (
                    <div className='relative cursor-default'>
                      {!isCancleUnstakeSupported && (
                        <div className='absolute h-[72px] w-[344px] cursor-default ' />
                      )}
                      <GenericCard
                        img={
                          <img
                            src={keybaseImageUrl ?? validator.image ?? Images.Misc.Validator}
                            onError={imgOnError(Images.Misc.Validator)}
                            className={'rounded-full  overflow-clip w-6 h-6'}
                          />
                        }
                        icon={
                          isCancleUnstakeSupported ? (
                            <span className='material-icons-round text-gray-400'>
                              keyboard_arrow_right
                            </span>
                          ) : undefined
                        }
                        onClick={
                          isCancleUnstakeSupported
                            ? () => {
                                navigate('/stakeCancelUndelegation', {
                                  state: {
                                    unBoundingdelegation: ud,
                                    unBoundingdelegationEntry: d,
                                    validatorAddress: ud.validator_address,
                                    validators: validators,
                                  } as CancleUndelegationProps,
                                })
                              }
                            : undefined
                        }
                        isRounded
                        title={
                          <Text size='md' className='  font-bold ml-3'>
                            {sliceWord(validator.moniker ?? validator.name, 10, 3)}
                          </Text>
                        }
                        subtitle={
                          <div className='ml-3'>
                            {formatHideBalance(`${d.formattedBalance} | ${timeLeftText}`)}
                          </div>
                        }
                        subtitle2={''}
                      />
                    </div>
                  )}
                </React.Fragment>
              )
            }

            return <Component key={`validators ${validator?.rank} ${idx}`} />
          })

          return <React.Fragment key={`validators ${index}`}>{frags}</React.Fragment>
        })}
    </div>
  )
}

function DepositAmountCard({
  totalDelegations,
  currencyAmountDelegation,
  activeChain,
  isLoading,
  unstakingPeriod,
  network,
  formatHideBalance,
}: {
  totalDelegations: string
  unstakingPeriod: string
  // eslint-disable-next-line no-unused-vars
  formatHideBalance: (s: string) => React.ReactNode
  network: Network
  currencyAmountDelegation: string
  activeChain: SupportedChain
  isLoading: boolean
}) {
  const navigate = useNavigate()
  const chainInfos = useChainInfos()
  const activeChainInfo = chainInfos[activeChain]

  return (
    <div className='dark:bg-gray-900 rounded-2xl bg-white-100 pt-4'>
      {isLoading && (
        <div className='w-[312px] p-4'>
          <Skeleton count={3} />
        </div>
      )}
      {!isLoading && (
        <Text
          size='xs'
          color='dark:text-gray-200 text-gray-600'
          className='font-bold mb-3 py-1 px-4'
        >
          Your deposited amount
        </Text>
      )}
      {!isLoading && (
        <div className='flex px-4 pb-4 justify-between items-center'>
          <div>
            <Text size='xl' className='text-[28px] mb-2 font-black'>
              {formatHideBalance(currencyAmountDelegation === '-' ? '-' : currencyAmountDelegation)}
            </Text>
            <Text size='xs' className='font-semibold'>
              {formatHideBalance(totalDelegations ?? `0.00 ${activeChainInfo.denom}`)}
            </Text>
          </div>
          <div className='flex shrink  h-[48px] w-[121px]'>
            <Buttons.Generic
              disabled={!network}
              onClick={async () => {
                if (network) {
                  const validators = network?.getValidators({})

                  navigate('/stakeChooseValidator', {
                    state: {
                      validators,
                      apy: network.validatorApys,
                      unstakingPeriod,
                      mode: 'DELEGATE',
                    } as ChooseValidatorProps,
                  })
                }
              }}
              color={Colors.getChainColor(activeChain, activeChainInfo)}
            >
              <div className='flex justify-center text-white-100'>
                <span className='mr-1 material-icons-round'>add_circle</span>
                <span>Stake</span>
              </div>
            </Buttons.Generic>
          </div>
        </div>
      )}
    </div>
  )
}

function ValidatorBreakdown({
  delegation,
  unstakingPeriod,
  network,
  rewards,
  isLoading,
  formatHideBalance,
}: {
  unstakingPeriod: string
  delegation: Record<string, Delegation>
  network: Network
  rewards: RewardsResponse
  isLoading: boolean
  // eslint-disable-next-line no-unused-vars
  formatHideBalance: (s: string) => React.ReactNode
}) {
  const navigate = useNavigate()
  const validators = network?.getValidators({}) as Record<string, Validator>
  const delegations = Object.values(delegation ?? {})
  if (!isLoading && delegations.length === 0) return <></>

  return (
    <div className='dark:bg-gray-900 rounded-2xl bg-white-100 pt-4'>
      {!isLoading && (
        <Text size='xs' color='dark:text-gray-200 text-gray-600' className='font-bold py-1 px-4'>
          Breakdown by Validator
        </Text>
      )}
      {isLoading && (
        <div className='w-[312px] p-4'>
          <Skeleton count={3} />
        </div>
      )}
      {!isLoading &&
        validators &&
        delegation &&
        delegations.map((d, index) => {
          const validator = validators[d?.delegation?.validator_address]
          const Component = () => {
            const { data: keybaseImageUrl } = useValidatorImage(validator)

            return (
              <React.Fragment key={`validators${index}`}>
                {index !== 0 && <CardDivider />}
                {validator && (
                  <GenericCard
                    onClick={() => {
                      if (network) {
                        const apy = network.validatorApys
                        const reward = rewards?.rewards.find(
                          (r) => r.validator_address === d.delegation.validator_address,
                        )

                        navigate('/stakeValidatorDetails', {
                          state: {
                            unstakingPeriod,
                            delegation: d,
                            reward: reward,
                            validatorAddress: d.delegation.validator_address,
                            validators: validators,
                            apy: apy,
                          } as ValidatorDetailsProps,
                        })
                      }
                    }}
                    img={
                      <img
                        src={keybaseImageUrl ?? validator.image ?? Images.Misc.Validator}
                        onError={imgOnError(Images.Misc.Validator)}
                        className={'rounded-full overflow-clip w-6 h-6'}
                      />
                    }
                    isRounded
                    title={
                      <Text size='md' className='font-bold text-ellipsis ml-3'>
                        {sliceWord(validator.moniker ?? validator.name, 10, 3)}
                      </Text>
                    }
                    title2={formatHideBalance(d.balance.formatted_amount ?? d.balance.amount)}
                    subtitle={''}
                    subtitle2={''}
                    icon={
                      <span className='material-icons-round text-gray-400'>
                        keyboard_arrow_right
                      </span>
                    }
                  />
                )}
              </React.Fragment>
            )
          }
          return <Component key={validator?.address} />
        })}
    </div>
  )
}

export function StakeRewardCard({
  rewardsAmount,
  onClaim,
  isLoading,
  validatorIcon,
  rewardsTokens,
}: {
  rewardsAmount: string
  validatorIcon?: string
  onClaim?: () => void
  isLoading: boolean
  rewardsTokens: string
}) {
  const defaultTokenLogo = useDefaultTokenLogo()
  const themeColor = useThemeColor()
  const [formatCurrency] = useFormatCurrency()
  const { formatHideBalance } = useHideAssets()

  if (isLoading) {
    return (
      <div className='rounded-2xl py-3 dark:bg-gray-900 bg-white-100 justify-center'>
        <TokenCardSkeleton />
      </div>
    )
  }

  return (
    <div className='relative rounded-2xl items-center py-3 dark:bg-gray-900 bg-white-100 justify-center'>
      <GenericCard
        img={
          <div className='mr-3'>
            <Avatar
              size='sm'
              avatarImage={
                (isCompassWallet() ? Images.Misc.CompassReward : Images.Misc.LeapReward) ??
                defaultTokenLogo
              }
              chainIcon={validatorIcon}
              avatarOnError={imgOnError(defaultTokenLogo)}
            />
          </div>
        }
        isRounded
        className='hover:cursor-default'
        title='Your Rewards'
        subtitle={`${formatHideBalance(
          rewardsAmount ? formatCurrency(new BigNumber(rewardsAmount)) : '-',
        )} | ${rewardsTokens}`}
      />

      {onClaim && (
        <div
          onClick={onClaim}
          className='absolute hover:cursor-pointer rounded-2xl px-3 py-1 right-6 top-[28px]'
          style={{ backgroundColor: hex2rgba(themeColor, 0.1) }}
        >
          <Text size='sm' className='font-bold' style={{ color: themeColor }}>
            Claim
          </Text>
        </div>
      )}
    </div>
  )
}

function StakeHeading({
  chainName,
  network,
  isLoading,
  maxApy,
  minApy,
}: {
  chainName: SupportedChain
  network: Network
  isLoading: boolean
  minApy: number | undefined
  maxApy: number | undefined
}) {
  const chainInfos = useChainInfos()
  const defaultTokenLogo = useDefaultTokenLogo()

  const minApyValue = minApy
    ? currency((minApy * 100).toString(), { precision: 2, symbol: '' }).format()
    : null

  const maxApyValue = minApy
    ? currency(((maxApy as number) * 100).toString(), { precision: 2, symbol: '' }).format()
    : null

  const apyText = useMemo(
    () =>
      network ? (
        <Text size='md' color='dark:text-gray-200 text-gray-800' className='font-bold'>
          APY:{' '}
          {minApyValue === null || maxApyValue === null
            ? 'N/A'
            : `${minApyValue} - ${maxApyValue} %`}
        </Text>
      ) : (
        <Text size='md' color='dark:text-gray-200 text-gray-800' className='font-bold'>
          APY: N/A
        </Text>
      ),
    [maxApyValue, minApyValue, network],
  )

  return (
    <div className='flex flex-col pb-8'>
      <div className='flex gap-x-[12px]'>
        <div className='h-8 w-8'>
          <Avatar
            size='sm'
            avatarImage={chainInfos[chainName].chainSymbolImageUrl ?? defaultTokenLogo}
            avatarOnError={imgOnError(defaultTokenLogo)}
            chainIcon={Images.Activity.Delegate}
          />
        </div>
        <Text size='xxl' className='font-black'>
          Stake {chainInfos[chainName].denom}
        </Text>
      </div>
      {isLoading ? <Skeleton count={1} width={200} /> : apyText}
    </div>
  )
}

export default function Stake() {
  usePageView(PageName.Stake)

  const chainInfos = useChainInfos()
  const [showChainSelector, setShowChainSelector] = useState(false)
  const [showSideNav, setShowSideNav] = useState(false)
  const [formatCurrency] = useFormatCurrency()
  const activeChain = useActiveChain()

  const [showYourRewardsSheet, setShowYourRewardsSheet] = useState(false)
  const [viewInfoSheet, setViewInfoSheet] = useState(false)
  const [showSelectedChainAlert, setShowSelectedChainAlert] =
    useRecoilState(selectedChainAlertState)

  const defaultTokenLogo = useDefaultTokenLogo()

  const {
    isTestnet,
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
  } = useStaking()

  const { isCancleUnstakeSupported } = useIsCancleUnstakeSupported()

  const { formatHideBalance } = useHideAssets()

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

  usePerformanceMonitor({
    page: 'stake',
    queryStatus: isLoadingAll ? 'loading' : 'success',
    op: 'stakePageLoad',
    description: 'loading state on stake page',
  })

  const activeChainInfo = chainInfos[activeChain]
  const themeColor = Colors.getChainColor(activeChain, activeChainInfo)

  return (
    <div className='relative w-[400px] overflow-clip'>
      <SideNav isShown={showSideNav} toggler={() => setShowSideNav(!showSideNav)} />
      <PopupLayout
        header={
          <Header
            action={{
              onClick: function noRefCheck() {
                setShowSideNav(true)
              },
              type: HeaderActionType.NAVIGATION,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              className:
                'w-[48px] h-[40px] px-3 bg-[#FFFFFF] dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full',
            }}
            imgSrc={activeChainInfo.chainSymbolImageUrl ?? defaultTokenLogo}
            onImgClick={isCompassWallet() ? undefined : () => setShowChainSelector(true)}
            title={'Staking'}
            topColor={themeColor}
          />
        }
      >
        <>
          {isCompassWallet() && isTestnet && (
            <AlertStrip
              message='You are on Sei Testnet'
              bgColor={Colors.getChainColor(activeChain)}
              alwaysShow={isTestnet}
            />
          )}

          {showSelectedChainAlert && !isCompassWallet() && (
            <AlertStrip
              message={`You are on ${activeChainInfo.chainName}${
                isTestnet && !activeChainInfo?.chainName.includes('Testnet') ? ' Testnet' : ''
              }`}
              bgColor={Colors.getChainColor(activeChain)}
              alwaysShow={isTestnet}
              onHide={() => {
                setShowSelectedChainAlert(false)
              }}
            />
          )}

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
            />
            <div className='flex flex-col gap-y-4'>
              {!isNotSupportedChain && (
                <>
                  {(rewards?.total[0] || loadingRewards) && (
                    <StakeRewardCard
                      isLoading={loadingRewards || isFetchingRewards}
                      onClaim={() => setShowYourRewardsSheet(true)}
                      rewardsAmount={totalRewardsDollarAmt ?? '0'}
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
                  />
                  <ValidatorBreakdown
                    formatHideBalance={formatHideBalance}
                    unstakingPeriod={unstakingPeriod}
                    rewards={rewards as RewardsResponse}
                    delegation={delegations as Record<string, Delegation>}
                    network={network as Network}
                    isLoading={loadingNetwork || loadingDelegations}
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
                  {`About Staking ${activeChainInfo.denom}`}
                </Text>
                <div className='flex flex-col px-[4px] pt-[4px]'>
                  <ReadMoreText
                    textProps={{ size: 'md', className: 'font-medium  flex flex-column' }}
                    readMoreColor={themeColor}
                  >
                    {`Staking is the process of locking up a digital asset non custodially (${activeChainInfo.denom} in the case of the ${activeChainInfo.chainName} Network) to provide economic security.
                     When the staking transaction is complete, rewards will start to be generated immediately. At any time, stakers can send a transaction to claim their accumulated rewards, using a wallet.
                     Staking rewards are generated and distributed to staked ${activeChainInfo.denom} holders in two ways: Transaction fees collected on the ${activeChainInfo.chainName} are distributed to staked ${activeChainInfo.denom} holders. and secondly
                     from newly created ${activeChainInfo.denom}. The total supply of ${activeChainInfo.denom} is inflated to reward stakers. ${activeChainInfo.denom} holders that do not stake do not receive rewards, meaning their ${activeChainInfo.denom} get diluted over time.
                     The yearly inflation rate of ${activeChainInfo.denom} is available on most explorers.
                     Staking ${activeChainInfo.denom} is not risk-free. If a validator has downtime or underperforms, a percentage of ${activeChainInfo.denom} delegated to them may be forfeited. To mitigate these risks, it is recommended that ${activeChainInfo.denom} holders delegate to multiple validators.
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
}
