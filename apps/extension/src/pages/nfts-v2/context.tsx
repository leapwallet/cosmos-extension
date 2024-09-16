import { ActivePage, NftPage } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { NftInfo } from '@leapwallet/cosmos-wallet-store'
import React, { createContext, ReactNode, useContext, useState } from 'react'
import { assert } from 'utils/assert'

export type NftDetailsType = NftInfo & { chain: SupportedChain }

type NftContextType = {
  activeTab: string
  setActiveTab: React.Dispatch<React.SetStateAction<string>>
  showCollectionDetailsFor: string
  setShowCollectionDetailsFor: React.Dispatch<React.SetStateAction<string>>
  nftDetails: NftDetailsType | null
  setNftDetails: React.Dispatch<React.SetStateAction<NftDetailsType | null>>
  showChainNftsFor: SupportedChain
  setShowChainNftsFor: React.Dispatch<React.SetStateAction<SupportedChain>>
  setActivePage: React.Dispatch<React.SetStateAction<NftPage>>
  activePage: NftPage
}

const NftContext = createContext<NftContextType>({
  setActivePage: () => undefined,
  activePage: 'ShowNfts',
  activeTab: 'All',
  setActiveTab: () => undefined,
  showCollectionDetailsFor: '',
  setShowCollectionDetailsFor: () => undefined,
  nftDetails: null,
  setNftDetails: () => undefined,
  showChainNftsFor: '' as SupportedChain,
  setShowChainNftsFor: () => undefined,
})

type NftContextProviderProps = {
  children: ReactNode
  value: ActivePage
}

export function NftContextProvider({ children, value: _value }: NftContextProviderProps) {
  const [nftDetails, setNftDetails] = useState<NftDetailsType | null>(null)
  const [activeTab, setActiveTab] = useState('All')
  const [showCollectionDetailsFor, setShowCollectionDetailsFor] = useState('')
  const [showChainNftsFor, setShowChainNftsFor] = useState<SupportedChain>('' as SupportedChain)

  const value = {
    nftDetails,
    activeTab,
    showChainNftsFor,
    showCollectionDetailsFor,
    setNftDetails,
    setActiveTab,
    setShowChainNftsFor,
    setShowCollectionDetailsFor,
    ..._value,
  }

  return <NftContext.Provider value={value}>{children}</NftContext.Provider>
}

export function useNftContext() {
  const context = useContext(NftContext)
  assert(context !== null, 'useNftContext must be used within NftContextProvider')
  return context
}
