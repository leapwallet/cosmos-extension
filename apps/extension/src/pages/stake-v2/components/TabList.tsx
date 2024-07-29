import { useStaking } from '@leapwallet/cosmos-wallet-hooks'
import Text from 'components/text'
import React, { useMemo, useState } from 'react'

import PendingUnstakeList from './PendingUnstakeList'
import ValidatorList from './ValidatorList'

export enum TabElements {
  YOUR_VALIDATORS = 'Your validators',
  PENDING_UNSTAKE = 'Pending unstake',
}

export default function TabList() {
  const {
    delegations,
    unboundingDelegationsInfo,
    loadingDelegations,
    loadingUnboundingDelegations,
  } = useStaking()
  const [selectedTab, setSelectedTab] = useState<TabElements | undefined>()
  const isLoading = loadingDelegations || loadingUnboundingDelegations

  const tabs: TabElements[] = useMemo(() => {
    const _tabs = []
    if (Object.values(delegations ?? {}).length > 0) {
      _tabs.push(TabElements.YOUR_VALIDATORS)
    }
    if (Object.values(unboundingDelegationsInfo ?? {}).length > 0) {
      _tabs.push(TabElements.PENDING_UNSTAKE)
    }
    if (_tabs.length > 0) {
      setSelectedTab(_tabs[0])
    }
    return _tabs
  }, [delegations, unboundingDelegationsInfo])

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
      {selectedTab === TabElements.YOUR_VALIDATORS && <ValidatorList />}
      {selectedTab === TabElements.PENDING_UNSTAKE && <PendingUnstakeList />}
    </div>
  )
}
