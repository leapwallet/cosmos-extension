import {
  SelectedNetwork,
  useActiveChain,
  useSelectedNetwork,
  useStaking,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import {
  ClaimRewardsStore,
  DelegationsStore,
  RootDenomsStore,
  UndelegationsStore,
  ValidatorsStore,
} from '@leapwallet/cosmos-wallet-store'
import BigNumber from 'bignumber.js'
import Text from 'components/text'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'
import { hideAssetsStore } from 'stores/hide-assets-store'

import StakeRewardCard from './StakeRewardCard'

interface StakeAmountCardProps {
  onClaim: () => void
  onClaimAndStake?: () => void
  rootDenomsStore: RootDenomsStore
  delegationsStore: DelegationsStore
  validatorsStore: ValidatorsStore
  unDelegationsStore: UndelegationsStore
  claimRewardsStore: ClaimRewardsStore
  forceChain?: SupportedChain
  forceNetwork?: SelectedNetwork
}

const StakeAmountCard = observer(
  ({
    onClaim,
    onClaimAndStake,
    rootDenomsStore,
    delegationsStore,
    validatorsStore,
    unDelegationsStore,
    claimRewardsStore,
    forceChain,
    forceNetwork,
  }: StakeAmountCardProps) => {
    const _activeChain = useActiveChain()
    const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain])

    const _activeNetwork = useSelectedNetwork()
    const activeNetwork = useMemo(
      () => forceNetwork || _activeNetwork,
      [_activeNetwork, forceNetwork],
    )

    const denoms = rootDenomsStore.allDenoms
    const chainDelegations = delegationsStore.delegationsForChain(activeChain)
    const chainValidators = validatorsStore.validatorsForChain(activeChain)
    const chainUnDelegations = unDelegationsStore.unDelegationsForChain(activeChain)
    const chainClaimRewards = claimRewardsStore.claimRewardsForChain(activeChain)

    const { loadingDelegations, currencyAmountDelegation, totalDelegationAmount } = useStaking(
      denoms,
      chainDelegations,
      chainValidators,
      chainUnDelegations,
      chainClaimRewards,
      activeChain,
      activeNetwork,
    )
    const [formatCurrency] = useFormatCurrency()

    const formattedCurrencyAmountDelegation = useMemo(() => {
      if (currencyAmountDelegation && new BigNumber(currencyAmountDelegation).gt(0)) {
        return formatCurrency(new BigNumber(currencyAmountDelegation))
      }
    }, [currencyAmountDelegation, formatCurrency])

    return (
      <div className='flex flex-col w-full bg-white-100 dark:bg-gray-950 rounded-2xl p-4 gap-y-4'>
        <Text size='xs' color='dark:text-gray-400 text-gray-700' className='font-medium'>
          Your deposited amount
        </Text>
        {loadingDelegations && <Skeleton width={100} count={2} />}
        {!loadingDelegations && (
          <div>
            <Text size='lg' className='font-black'>
              {formattedCurrencyAmountDelegation &&
                hideAssetsStore.formatHideBalance(formattedCurrencyAmountDelegation)}
            </Text>
            <Text size='sm' className='font-medium' color='text-gray-800 dark:text-gray-200'>
              {hideAssetsStore.formatHideBalance(totalDelegationAmount ?? '-')}
            </Text>
          </div>
        )}

        <StakeRewardCard
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
      </div>
    )
  },
)

export default StakeAmountCard
