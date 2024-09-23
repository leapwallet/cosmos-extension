import {
  SelectedNetwork,
  useActiveChain,
  useDualStaking,
  useFeatureFlags,
  useSelectedNetwork,
  useStaking,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import {
  ClaimRewardsStore,
  DelegationsStore,
  RootBalanceStore,
  RootDenomsStore,
  UndelegationsStore,
  ValidatorsStore,
} from '@leapwallet/cosmos-wallet-store'
import Text from 'components/text'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'

import ProviderList from '../restaking/ProviderList'
import PendingUnstakeList from './PendingUnstakeList'
import ValidatorList from './ValidatorList'

export enum TabElements {
  YOUR_VALIDATORS = 'Your validators',
  PENDING_UNSTAKE = 'Pending unstake',
  YOUR_PROVIDERS = 'Your providers',
}

type TabListProps = {
  rootDenomsStore: RootDenomsStore
  delegationsStore: DelegationsStore
  validatorsStore: ValidatorsStore
  unDelegationsStore: UndelegationsStore
  claimRewardsStore: ClaimRewardsStore
  forceChain?: SupportedChain
  forceNetwork?: SelectedNetwork
  rootBalanceStore: RootBalanceStore
}

const TabList = observer(
  ({
    rootDenomsStore,
    rootBalanceStore,
    delegationsStore,
    validatorsStore,
    unDelegationsStore,
    claimRewardsStore,
    forceChain,
    forceNetwork,
  }: TabListProps) => {
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

    const {
      delegations,
      unboundingDelegationsInfo,
      loadingDelegations,
      loadingUnboundingDelegations,
    } = useStaking(
      denoms,
      chainDelegations,
      chainValidators,
      chainUnDelegations,
      chainClaimRewards,
      activeChain,
      activeNetwork,
    )
    const { delegations: providerDelegations } = useDualStaking()

    const [selectedTab, setSelectedTab] = useState<TabElements | undefined>()
    const isLoading = loadingDelegations || loadingUnboundingDelegations

    const { data: featureFlags } = useFeatureFlags()

    const tabs: TabElements[] = useMemo(() => {
      const _tabs = []
      if (Object.values(delegations ?? {}).length > 0) {
        _tabs.push(TabElements.YOUR_VALIDATORS)
      }
      if (
        Object.values(providerDelegations ?? {}).length > 0 &&
        featureFlags?.restaking?.extension === 'active' &&
        activeChain === 'lava'
      ) {
        _tabs.push(TabElements.YOUR_PROVIDERS)
      }
      if (Object.values(unboundingDelegationsInfo ?? {}).length > 0) {
        _tabs.push(TabElements.PENDING_UNSTAKE)
      }
      if (_tabs.length > 0) {
        setSelectedTab(_tabs[0])
      }
      return _tabs
    }, [
      activeChain,
      delegations,
      featureFlags?.restaking?.extension,
      providerDelegations,
      unboundingDelegationsInfo,
    ])

    if (isLoading) {
      return <></>
    }

    return (
      <div className='flex flex-col gap-y-4'>
        <div className='flex gap-x-2'>
          {tabs.map((element) => (
            <div
              onClick={() => {
                if (selectedTab !== element) {
                  setSelectedTab(element)
                }
              }}
              key={element}
            >
              <Text
                className={`rounded-full hover:cursor-pointer px-3 py-2 border bg-white-100 dark:bg-gray-950 font-bold ${
                  selectedTab === element
                    ? 'dark:border-white-100 border-gray-800'
                    : 'border-white-100 dark:border-gray-950'
                }`}
                size='xs'
                color={
                  selectedTab === element
                    ? 'text-gray-900 dark:text-white-100'
                    : 'text-gray-800 dark:text-gray-200'
                }
              >
                {element}
              </Text>
            </div>
          ))}
        </div>

        {selectedTab === TabElements.YOUR_VALIDATORS && (
          <ValidatorList
            rootDenomsStore={rootDenomsStore}
            rootBalanceStore={rootBalanceStore}
            delegationsStore={delegationsStore}
            validatorsStore={validatorsStore}
            unDelegationsStore={unDelegationsStore}
            claimRewardsStore={claimRewardsStore}
            forceChain={activeChain}
            forceNetwork={activeNetwork}
          />
        )}

        {selectedTab === TabElements.PENDING_UNSTAKE && (
          <PendingUnstakeList
            rootDenomsStore={rootDenomsStore}
            delegationsStore={delegationsStore}
            validatorsStore={validatorsStore}
            unDelegationsStore={unDelegationsStore}
            claimRewardsStore={claimRewardsStore}
            forceChain={activeChain}
            forceNetwork={activeNetwork}
            rootBalanceStore={rootBalanceStore}
          />
        )}

        {selectedTab === TabElements.YOUR_PROVIDERS && <ProviderList />}
      </div>
    )
  },
)

export default TabList
