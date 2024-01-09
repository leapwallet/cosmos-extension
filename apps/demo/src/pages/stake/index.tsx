import { ChainInfos } from '@leapwallet/cosmos-wallet-sdk/dist/constants'
import { Validator } from '@leapwallet/cosmos-wallet-sdk/dist/types/validators'
import { Header, HeaderActionType, LineDivider } from '@leapwallet/leap-ui'
import { BigNumber } from 'bignumber.js'
import { addSeconds } from 'date-fns'
import React, { useEffect, useMemo, useState } from 'react'

import BottomNav, { BottomNavLabel } from '~/components/bottom-nav'
import InfoSheet from '~/components/info-sheet'
import PopupLayout from '~/components/popup-layout'
import ReadMoreText from '~/components/read-more-text'
import SelectChain from '~/components/select-chain'
import SideNav from '~/components/side-nav'
import Text from '~/components/text'
import { useWalletActivity } from '~/hooks/activity/use-activity'
import { useActiveChain } from '~/hooks/settings/use-active-chain'
import { useFormatCurrency } from '~/hooks/settings/use-currency'
import { useClaimRewards } from '~/hooks/staking/use-claim-rewards'
import { useRewardsBalance } from '~/hooks/staking/use-rewards-balance'
import { useDelegations } from '~/hooks/staking/use-staking'
import { ChainLogos } from '~/images/logos'
import { Colors } from '~/theme/colors'
import timeLeft from '~/util/time-left'
import { tokensByChain } from '~/util/tokens'

import AssetActivity from './widgets/asset-activity'
import DepositAmountCard from './widgets/deposit-amount-card'
import StakeHeading from './widgets/stake-heading'
import StakeRewardCard from './widgets/stake-reward-card'
import ValidatorBreakdown from './widgets/validator-breakdown'

const leapValidator: Validator = {
  path: 'leap-wallet',
  name: 'Leap Wallet',
  moniker: 'Leap Wallet',
  identity: '55B2C424EE64C03A',
  address: 'cosmosvaloper1usxshtypjw57edkwaq3tagme665398f0hf4wuc',
  active: true,
  hex_address: '08F1DC39C9966130B9628EB8C234FA2174361FA2',
  operator_address: 'cosmosvaloper1usvshtypjw57edpoxq3tagme665398f0hf4wuc',
  consensus_pubkey: {
    '@type': '/cosmos.crypto.ed25519.PubKey',
    key: '4jkFAWNCgmrEevSVOjqGGnRCwqgdXnffb70gW6sUaJc=',
  },
  jailed: false,
  status: 'BOND_STATUS_BONDED',
  tokens: '81947.187459',
  delegator_shares: '81947187459.000000000000000000',
  description: {
    moniker: 'leap-wallet',
    identity: '55B2C424EE64C03A',
    website: 'https://leapwallet.io',
    security_contact: '',
    details: 'The best super wallet for web3',
  },
  unbonding_height: '12119378',
  unbonding_time: '2022-10-10T17:50:30.064087929Z',
  commission: {
    commission_rates: {
      rate: '0.010000000000000000',
      max_rate: '0.500000000000000000',
      max_change_rate: '0.100000000000000000',
    },
    update_time: '2022-09-19T18:53:54.993689989Z',
    rate: 0.01,
  },
  min_self_delegation: '1000000',
  rank: 12,
  mintscan_image: 'https://raw.githubusercontent.com/leapwallet/assets/main/images/logo.svg',
  keybase_image: 'https://raw.githubusercontent.com/leapwallet/assets/main/images/logo.svg',
  slashes: [],
  delegations: {
    total_tokens: '7324047058150',
    total_tokens_display: 7324047.05815,
    total_usd: 1054985.317113,
    total_count: 7324047058150,
  },
  signing_info: {
    address: 'cosmosvalcons1prcacwwfjesnpwtq36uvyd86y96rv8azq63ken',
    start_height: '10096894',
    index_offset: '2203153',
    jailed_until: '1970-01-01T00:00:00Z',
    tombstoned: false,
    missed_blocks_counter: '7',
  },
  image: 'https://raw.githubusercontent.com/leapwallet/assets/main/images/logo.svg',
  restake: {
    address: 'cosmos1ljahtlzw6zy7fea6yywavuvvlq96vec9n9mnz9',
    run_time: '21:00',
    minimum_reward: 10000,
  },
  uptime: 1,
  uptime_periods: [
    {
      blocks: 100,
      uptime: 1,
    },
    {
      blocks: 10000,
      uptime: 0.9993,
    },
  ],
  missed_blocks: 0,
  missed_blocks_periods: [
    {
      blocks: 100,
      missed: 0,
    },
    {
      blocks: 10000,
      missed: 7,
    },
  ],
}

export default function Stake() {
  const [showChainSelector, setShowChainSelector] = useState(false)
  const [showSideNav, setShowSideNav] = useState(false)
  const formatCurrency = useFormatCurrency()
  const activeChain = useActiveChain()
  const [viewInfoSheet, setViewInfoSheet] = useState(false)
  const [validators, setValidators] = useState<Record<string, Validator> | null>(null)
  const [validatorApys, setValidatorApys] = useState<Record<string, number> | null>(null)
  const activity = useWalletActivity()
  const {
    delegations,
    chainApy,
    currencyAmountDelegation,
    minMaxApy,
    token,
    totalDelegationAmount,
  } = useDelegations()
  const rewardsBalance = useRewardsBalance()

  const claimRewards = useClaimRewards()

  const unstakingPeriod = useMemo(
    () => timeLeft(addSeconds(new Date(), 24 * 60 * 60 + 10).toISOString(), ''),
    [],
  )

  const recentAssetActivity = useMemo(
    () =>
      activity.filter(
        ({ content }) =>
          content.sentTokenInfo.coinDenom === tokensByChain[activeChain].symbol &&
          (content.txType === 'delegate' || content.txType === 'undelegate'),
      ),
    [activeChain, activity],
  )

  useEffect(() => {
    import('./network-data').then(({ validators, validatorApys }) => {
      const allValidators = [...validators.slice(0, 12), leapValidator, ...validators.slice(12)]
      const validatorsObject: Record<string, Validator> = {}
      ;(allValidators as unknown as Validator[]).forEach((v) => {
        validatorsObject[v.operator_address] = v
      })
      setValidators(validatorsObject)
      setValidatorApys(validatorApys as unknown as Record<string, number>)
    })
  }, [])

  return (
    <div className='relative w-full overflow-clip'>
      <SideNav isShown={showSideNav} toggler={() => setShowSideNav(!showSideNav)} />
      <PopupLayout
        showBetaTag
        header={
          <Header
            action={{
              onClick: function noRefCheck() {
                setShowSideNav(true)
              },
              type: HeaderActionType.NAVIGATION,
            }}
            imgSrc={ChainLogos[activeChain]}
            onImgClick={function noRefCheck() {
              setShowChainSelector(true)
            }}
            title='Staking'
            topColor={ChainInfos[activeChain].theme.primaryColor}
          />
        }
      >
        <div className='bg-gray-50 dark:bg-black-100 pt-6 px-7 pb-0 space-y-4'>
          <StakeHeading
            minApy={minMaxApy[0]}
            maxApy={minMaxApy[1]}
            chainName={activeChain}
            isLoading={false}
          />
          <StakeRewardCard
            onClaim={claimRewards}
            isLoading={false}
            percent={`${(chainApy * 100).toFixed(2) ?? 0}%`}
            activeChain={activeChain}
            rewardsAmount={rewardsBalance}
          />
          <DepositAmountCard
            unstakingPeriod={unstakingPeriod}
            percentageChange={token?.percentChange}
            activeChain={activeChain}
            totalDelegations={totalDelegationAmount}
            currencyAmountDelegation={formatCurrency(new BigNumber(currencyAmountDelegation))}
            isLoading={false}
            validatorApys={validatorApys}
            validators={validators}
          />
          <ValidatorBreakdown
            percentChange={token?.percentChange}
            delegations={delegations}
            validators={validators}
            isLoading={!validators}
          />
          <LineDivider size='sm' />
        </div>
        <div className='flex flex-col gap-y-4 pt-7 px-7 pb-12'>
          <div className='rounded-[16px] items-center'>
            <Text size='sm' className='p-[4px] font-bold ' color='text-gray-600 dark:text-gray-400'>
              {`About Staking ${ChainInfos[activeChain].denom}`}
            </Text>
            <div className='flex flex-col px-[4px] pt-[4px]'>
              <ReadMoreText
                textProps={{ size: 'md', className: 'font-medium  flex flex-column' }}
                readMoreColor={Colors.getChainColor(activeChain)}
              >
                <Text size='sm' className='mb-[4px]'>
                  {`Staking is the process of locking up a digital asset non custodially (${ChainInfos[activeChain].denom} in the case of the ${ChainInfos[activeChain].chainName} Network) to provide economic security.`}
                </Text>
                <Text size='sm' className='mb-[4px]'>
                  {`When the staking transaction is complete, rewards will start to be generated immediately. At any time, stakers can send a transaction to claim their accumulated rewards, using a wallet.`}
                </Text>
                  <Text size='sm' className='mb-[4px]'>
                    {`Staking rewards are generated and distributed to staked ${ChainInfos[activeChain].denom} holders in two ways: Transaction fees collected on the ${ChainInfos[activeChain].chainName} are distributed to staked ${ChainInfos[activeChain].denom} holders. and secondly 
                   from newly created ${ChainInfos[activeChain].denom}. The total supply of ${ChainInfos[activeChain].denom} is inflated to reward stakers. ${ChainInfos[activeChain].denom} holders that do not stake do not receive rewards, meaning their ${ChainInfos[activeChain].denom} get diluted over time.`}
                  </Text>
                  <Text size='sm' className='mb-[4px]'>
                    {`The yearly inflation rate of ${ChainInfos[activeChain].denom} is available on most explorers.`}
                  </Text>
                  <Text size='sm' className='mb-[4px]'>
                    {`Staking ${ChainInfos[activeChain].denom} is not risk-free. If a validator has downtime or underperforms, a percentage of ${ChainInfos[activeChain].denom} delegated to them may be forfeited. To mitigate these risks, it is recommended that ${ChainInfos[activeChain].denom} holders delegate to multiple validators. Upon unstaking, tokens are locked for a period of ${unstakingPeriod} post which you will automatically get them back in your wallet.`}
                  </Text>
              </ReadMoreText>
            </div>
          </div>
          <LineDivider size='sm' />
          <AssetActivity activityList={recentAssetActivity} isActivityLoading={false} />
        </div>
      </PopupLayout>
      <SelectChain isVisible={showChainSelector} onClose={() => setShowChainSelector(false)} />
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
