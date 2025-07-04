import { LoaderAnimation } from 'components/loader/Loader'
import React from 'react'
import { Virtuoso } from 'react-virtuoso'
import { activeChainStore } from 'stores/active-chain-store'
import { autoFetchedCW20DenomsStore, cw20DenomsStore } from 'stores/denoms-store-instance'

import { ManageTokensEmptyCard, SupportedToken } from '.'
import { SupportedTokenCard } from './SupportedTokenCard'

export const SupportedTokensTab = ({
  filteredSupportedTokens,
  handleToggleChange,
  fetchingContract,
  handleAddNewTokenClick,
  searchedText,
}: {
  filteredSupportedTokens: SupportedToken[]
  handleToggleChange: (isEnabled: boolean, coinMinimalDenom: string) => Promise<void>
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

  if (fetchingContract === false && filteredSupportedTokens.length === 0) {
    return (
      <ManageTokensEmptyCard onAddTokenClick={handleAddNewTokenClick} searchedText={searchedText} />
    )
  }

  return (
    <div className='w-full px-6 flex-1'>
      <Virtuoso
        style={{ flexGrow: '1', width: '100%' }}
        data={filteredSupportedTokens}
        itemContent={(index, item) => {
          return (
            <SupportedTokenCard
              key={`${item.coinMinimalDenom}`}
              activeChainStore={activeChainStore}
              cw20DenomsStore={cw20DenomsStore}
              autoFetchedCW20DenomsStore={autoFetchedCW20DenomsStore}
              token={item}
              tokensLength={filteredSupportedTokens.length}
              index={index}
              handleToggleChange={handleToggleChange}
            />
          )
        }}
      />
    </div>
  )
}
