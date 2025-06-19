import {
  SelectedNetwork,
  STAKE_MODE,
  useActiveChain,
  useActiveStakingDenom,
  useDualStaking,
  useFeatureFlags,
  useSelectedNetwork,
  useStaking,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { AnimatePresence, motion } from 'framer-motion'
import { observer } from 'mobx-react-lite'
import ProviderList from 'pages/stake-v2/restaking/ProviderList'
import React, { useMemo, useState } from 'react'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { stakeEpochStore } from 'stores/epoch-store'
import { rootBalanceStore } from 'stores/root-store'
import {
  claimRewardsStore,
  delegationsStore,
  unDelegationsStore,
  validatorsStore,
} from 'stores/stake-store'
import { transition150 } from 'utils/motion-variants'
import { slideVariants } from 'utils/motion-variants/global-layout-motions'

import PendingUnstakeList from '../PendingUnstakeList'
import ValidatorList from '../ValidatorList'
import { TabSelectors } from './tab-list-selector'

export enum TabElements {
  YOUR_DELEGATIONS = 'Your delegations',
  PENDING_UNSTAKE = 'Pending unstake',
  YOUR_PROVIDERS = 'Your providers',
}

const TabList = observer(
  ({
    forceChain,
    forceNetwork,
    setClaimTxMode,
  }: {
    forceChain?: SupportedChain
    forceNetwork?: SelectedNetwork
    setClaimTxMode: (mode: STAKE_MODE | 'CLAIM_AND_DELEGATE' | null) => void
  }) => {
    const _activeChain = useActiveChain()
    const _activeNetwork = useSelectedNetwork()
    const activeChain = forceChain ?? _activeChain
    const activeNetwork = forceNetwork ?? _activeNetwork

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
    const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, activeNetwork)

    const [selectedTab, setSelectedTab] = useState<{ label: TabElements }>()
    const isLoading = loadingDelegations || loadingUnboundingDelegations

    const { data: featureFlags } = useFeatureFlags()

    const tabs = useMemo(() => {
      const pendingDelegations = stakeEpochStore.getDelegationEpochMessages(activeStakingDenom)
      const pendingUnDelegations = stakeEpochStore.getUnDelegationEpochMessages(activeStakingDenom)

      const _tabs = []
      if (Object.values(delegations ?? {}).length > 0 || pendingDelegations.length > 0) {
        _tabs.push({ label: TabElements.YOUR_DELEGATIONS })
      }
      if (
        Object.values(providerDelegations ?? {}).length > 0 &&
        featureFlags?.restaking?.extension === 'active' &&
        activeChain === 'lava'
      ) {
        _tabs.push({ label: TabElements.YOUR_PROVIDERS })
      }
      if (
        Object.values(unboundingDelegationsInfo ?? {}).length > 0 ||
        pendingUnDelegations.length > 0
      ) {
        _tabs.push({ label: TabElements.PENDING_UNSTAKE })
      }
      if (_tabs.length > 0) {
        setSelectedTab(_tabs[0])
      }
      return _tabs
    }, [
      activeChain,
      activeStakingDenom,
      delegations,
      featureFlags?.restaking?.extension,
      providerDelegations,
      unboundingDelegationsInfo,
    ])

    if (isLoading) {
      return <></>
    }

    return (
      <div className='flex flex-col gap-6'>
        <div className='flex gap-x-2 border-b border-border-bottom -mx-6 px-6'>
          <TabSelectors
            buttons={tabs}
            setSelectedTab={setSelectedTab}
            selectedIndex={tabs.findIndex(({ label }) => label === selectedTab?.label)}
          />
        </div>

        <AnimatePresence mode='wait' initial={false}>
          {selectedTab?.label === TabElements.YOUR_DELEGATIONS && (
            <motion.div
              key={TabElements.YOUR_DELEGATIONS}
              transition={transition150}
              variants={slideVariants}
              initial='exit'
              animate='animate'
              exit='exit'
              className='relative'
            >
              <ValidatorList
                rootDenomsStore={rootDenomsStore}
                rootBalanceStore={rootBalanceStore}
                delegationsStore={delegationsStore}
                validatorsStore={validatorsStore}
                unDelegationsStore={unDelegationsStore}
                claimRewardsStore={claimRewardsStore}
                forceChain={activeChain}
                forceNetwork={activeNetwork}
                setClaimTxMode={setClaimTxMode}
              />
            </motion.div>
          )}

          {selectedTab?.label === TabElements.PENDING_UNSTAKE && (
            <motion.div
              key={TabElements.PENDING_UNSTAKE}
              transition={transition150}
              variants={slideVariants}
              initial='enter'
              animate='animate'
              exit='enter'
              className='relative'
            >
              <PendingUnstakeList
                rootDenomsStore={rootDenomsStore}
                delegationsStore={delegationsStore}
                validatorsStore={validatorsStore}
                unDelegationsStore={unDelegationsStore}
                claimRewardsStore={claimRewardsStore}
                forceChain={activeChain}
                forceNetwork={activeNetwork}
                rootBalanceStore={rootBalanceStore}
                setClaimTxMode={setClaimTxMode}
              />
            </motion.div>
          )}
          {selectedTab?.label === TabElements.YOUR_PROVIDERS && (
            <ProviderList forceChain={activeChain} forceNetwork={activeNetwork} />
          )}
        </AnimatePresence>
      </div>
    )
  },
)

export default TabList
