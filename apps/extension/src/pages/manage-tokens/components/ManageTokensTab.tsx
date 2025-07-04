import { NativeDenom } from '@leapwallet/cosmos-wallet-sdk'
import { motion } from 'framer-motion'
import React from 'react'

import { ManuallyAddedTokensTab } from './ManuallyAddedTokensTab'
import { SupportedToken } from './SupportedTokens'
import { SupportedTokensTab } from './SupportedTokensTab'

const tabs = [
  { label: 'Supported', value: 'supported' },
  { label: 'Manually added', value: 'manually-added' },
]

export const ManageTokensTabs = ({
  activeTab,
  setActiveTab,
  filteredSupportedTokens,
  filteredManuallyAddedTokens,
  fetchedTokens,
  handleToggleChange,
  onDeleteClick,
  handleAddNewTokenClick,
  searchedText,
  fetchingContract,
}: {
  activeTab: string
  setActiveTab: (tab: string) => void
  filteredSupportedTokens: SupportedToken[]
  filteredManuallyAddedTokens: NativeDenom[]
  fetchedTokens: string[]
  handleToggleChange: (isEnabled: boolean, coinMinimalDenom: string) => Promise<void>
  onDeleteClick: (token: NativeDenom) => void
  handleAddNewTokenClick: () => void
  searchedText: string
  fetchingContract: boolean
}) => {
  return (
    <>
      <div className='h-[33px] border-b shrink-0 px-6 border-secondary-300 flex flex-row justify-start items-center gap-5'>
        {tabs.map((tab) => (
          <button
            key={tab.value}
            className={`font-medium text-center text-sm !leading-[22px] h-full transition-colors duration-200 flex justify-center items-center ${
              tab.value === activeTab ? 'text-accent-green' : 'text-muted-foreground'
            }`}
            onClick={() => {
              setActiveTab(tab.value)
            }}
          >
            <div className='relative w-fit px-2 pb-3'>
              {tab.label}

              {tab.value === activeTab && (
                <motion.div
                  className='absolute bottom-0 left-0 right-0 h-0.5 bg-primary z-10'
                  layoutId='active-tab-indicator'
                />
              )}
            </div>
          </button>
        ))}
      </div>

      {activeTab === 'supported' ? (
        <SupportedTokensTab
          filteredSupportedTokens={filteredSupportedTokens}
          handleToggleChange={handleToggleChange}
          fetchingContract={fetchingContract}
          handleAddNewTokenClick={handleAddNewTokenClick}
          searchedText={searchedText}
        />
      ) : (
        <ManuallyAddedTokensTab
          filteredManuallyAddedTokens={filteredManuallyAddedTokens}
          handleToggleChange={handleToggleChange}
          fetchedTokens={fetchedTokens}
          onDeleteClick={onDeleteClick}
          fetchingContract={fetchingContract}
          handleAddNewTokenClick={handleAddNewTokenClick}
          searchedText={searchedText}
        />
      )}
    </>
  )
}
