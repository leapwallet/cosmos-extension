import { NativeDenom } from '@leapwallet/cosmos-wallet-sdk'
import { LoaderAnimation } from 'components/loader/Loader'
import React from 'react'
import { Virtuoso } from 'react-virtuoso'
import {
  betaCW20DenomsStore,
  betaERC20DenomsStore,
  disabledCW20DenomsStore,
  enabledCW20DenomsStore,
} from 'stores/denoms-store-instance'

import { ManageTokensEmptyCard } from '.'
import { ManuallyAddedTokenCard } from './ManuallyAddedTokenCard'

export const ManuallyAddedTokensTab = ({
  filteredManuallyAddedTokens,
  handleToggleChange,
  fetchedTokens,
  onDeleteClick,
  fetchingContract,
  handleAddNewTokenClick,
  searchedText,
}: {
  filteredManuallyAddedTokens: NativeDenom[]
  handleToggleChange: (isEnabled: boolean, coinMinimalDenom: string) => Promise<void>
  fetchedTokens: string[]
  onDeleteClick: (token: NativeDenom) => void
  fetchingContract: boolean
  handleAddNewTokenClick: () => void
  searchedText: string
}) => {
  if (fetchingContract === true) {
    return (
      <div className='flex items-center justify-center flex-1'>
        <LoaderAnimation color='#29a874' />
      </div>
    )
  }

  if (fetchingContract === false && filteredManuallyAddedTokens.length === 0) {
    return (
      <ManageTokensEmptyCard onAddTokenClick={handleAddNewTokenClick} searchedText={searchedText} />
    )
  }

  return (
    <div className='w-full px-6 flex-1'>
      <Virtuoso
        style={{ flexGrow: '1', width: '100%' }}
        data={filteredManuallyAddedTokens}
        itemContent={(index, item) => {
          return (
            <ManuallyAddedTokenCard
              index={index}
              key={`${item?.coinMinimalDenom ?? index}`}
              token={item}
              tokensLength={filteredManuallyAddedTokens.length}
              handleToggleChange={handleToggleChange}
              fetchedTokens={fetchedTokens}
              onDeleteClick={onDeleteClick}
              betaCW20DenomsStore={betaCW20DenomsStore}
              disabledCW20DenomsStore={disabledCW20DenomsStore}
              enabledCW20DenomsStore={enabledCW20DenomsStore}
              betaERC20DenomsStore={betaERC20DenomsStore}
            />
          )
        }}
      />
    </div>
  )
}
