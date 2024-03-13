import {
  ActivePage,
  NftContextType,
  NftDetails,
  useGetContextProviderValue,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useHiddenNFTs } from 'hooks/settings'
import { useChainInfos } from 'hooks/useChainInfos'
import React, { createContext, ReactNode, useContext } from 'react'
import { assert } from 'utils/assert'

export type NftDetailsType = NftDetails

const NftContext = createContext<NftContextType>({
  collectionData: null,
  _collectionData: null,
  isLoading: {},
  setCollectionData: () => undefined,
  setIsLoading: () => undefined,
  _isLoading: false,
  setActivePage: () => undefined,
  activePage: 'ShowNfts',
  activeTab: 'All',
  setActiveTab: () => undefined,
  showCollectionDetailsFor: '',
  setShowCollectionDetailsFor: () => undefined,
  nftDetails: null,
  setNftDetails: () => undefined,
  nftChains: [],
  sortedCollectionChains: [],
  showChainNftsFor: '' as SupportedChain,
  setShowChainNftsFor: () => undefined,
  setTriggerRerender: () => undefined,
  areAllNftsHiddenRef: { current: false },
  triggerRerender: false,
})

type NftContextProviderProps = {
  children: ReactNode
  value: ActivePage
}

export function NftContextProvider({ children, value: _value }: NftContextProviderProps) {
  const hiddenNfts = useHiddenNFTs()
  const chainInfos = useChainInfos()
  const contextProviderValue = useGetContextProviderValue({ hiddenNfts, chainInfos })

  const value = {
    ...contextProviderValue,
    ..._value,
  }

  return <NftContext.Provider value={value}>{children}</NftContext.Provider>
}

export function useNftContext() {
  const context = useContext(NftContext)
  assert(context !== null, 'useNftContext must be used within NftContextProvider')
  return context
}
