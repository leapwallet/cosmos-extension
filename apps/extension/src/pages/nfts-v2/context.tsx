import {
  NftChain,
  OwnedCollectionTokenInfo,
  TokensListByCollection,
  useDisabledNFTsCollections,
  useNftChains,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useHiddenNFTs } from 'hooks/settings'
import { useChainInfos } from 'hooks/useChainInfos'
import React, {
  createContext,
  ReactNode,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { assert } from 'utils/assert'
import { isCompassWallet } from 'utils/isCompassWallet'
import { sortStringArr } from 'utils/strings'

export type Collection = {
  chain: SupportedChain
  name: string
  address: string
  image?: string
  totalNfts?: number
  tokensListByCollection?: TokensListByCollection
  forceChain?: string
  forceNetwork?: string
}

export type CollectionData = {
  collections: Collection[]
  nfts: { [key: string]: OwnedCollectionTokenInfo[] }
}

type IsLoading = {
  [key: string]: boolean
}

export type NftPage = 'ShowNfts' | 'CollectionDetails' | 'NftDetails' | 'ChainNftsDetails'

type ActivePage = {
  setActivePage: React.Dispatch<React.SetStateAction<NftPage>>
  activePage: NftPage
}

type NftDetails = (OwnedCollectionTokenInfo & { chain: SupportedChain }) | null

export type NftDetailsType = NftDetails

type NftContextType = ActivePage & {
  collectionData: CollectionData | null
  _collectionData: CollectionData | null
  isLoading: IsLoading
  setCollectionData: React.Dispatch<React.SetStateAction<CollectionData | null>>
  setIsLoading: React.Dispatch<React.SetStateAction<IsLoading>>
  _isLoading: boolean
  activeTab: string
  setActiveTab: React.Dispatch<React.SetStateAction<string>>
  showCollectionDetailsFor: string
  setShowCollectionDetailsFor: React.Dispatch<React.SetStateAction<string>>
  nftDetails: NftDetails
  setNftDetails: React.Dispatch<React.SetStateAction<NftDetails>>
  nftChains: NftChain[]
  sortedCollectionChains: SupportedChain[]
  showChainNftsFor: SupportedChain
  setShowChainNftsFor: React.Dispatch<React.SetStateAction<SupportedChain>>
  setTriggerRerender: React.Dispatch<React.SetStateAction<boolean>>
  areAllNftsHiddenRef: React.MutableRefObject<boolean>
}

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
})

type NftContextProviderProps = {
  children: ReactNode
  value: ActivePage
}

export function NftContextProvider({ children, value: _value }: NftContextProviderProps) {
  const nftChains = useNftChains()
  const [nftDetails, setNftDetails] = useState<NftDetails>(null)
  const [activeTab, setActiveTab] = useState('All')
  const chainInfos = useChainInfos()
  const disabledNftsCollections = useDisabledNFTsCollections()
  const [triggerRerender, setTriggerRerender] = useState(false)
  const hiddenNfts = useHiddenNFTs()
  const areAllNftsHiddenRef = useRef<boolean>(false)
  const activeNetwork = useSelectedNetwork()

  const _nftChains = useMemo(() => {
    return isCompassWallet()
      ? nftChains.filter(
          ({ forceContractsListChain, forceNetwork }) =>
            forceContractsListChain === 'seiTestnet2' && forceNetwork === activeNetwork,
        )
      : nftChains.filter((nftChain: NftChain) => {
          if (nftChain.forceNetwork === 'testnet') {
            const chainInfo = chainInfos[nftChain.forceContractsListChain]

            if (chainInfo.chainId !== chainInfo.testnetChainId) {
              return false
            }
          }

          return true
        })
  }, [activeNetwork, chainInfos, nftChains])

  const isLoadingInitialValue = useMemo(
    () =>
      _nftChains.reduce((_isLoading, nft, index) => {
        return {
          ..._isLoading,
          [`${nft.forceContractsListChain}-${index}`]: true,
        }
      }, {}),
    [_nftChains],
  )

  const [collectionData, setCollectionData] = useState<CollectionData | null>(null)
  const [isLoading, setIsLoading] = useState(isLoadingInitialValue)
  const [showCollectionDetailsFor, setShowCollectionDetailsFor] = useState('')
  const [showChainNftsFor, setShowChainNftsFor] = useState<SupportedChain>('' as SupportedChain)

  useLayoutEffect(() => {
    setIsLoading(isLoadingInitialValue)
  }, [isLoadingInitialValue, triggerRerender])

  const _collectionData = useMemo(() => {
    if (hiddenNfts.length && collectionData) {
      const tempNfts = { ...collectionData.nfts }

      hiddenNfts.forEach((hiddenNft) => {
        const [address, tokenId] = hiddenNft.split('-')

        const collection = collectionData.collections?.find(
          (collection) => collection.address === address,
        )

        if (collection) {
          const { chain } = collection
          const nfts: OwnedCollectionTokenInfo[] = tempNfts[chain]
          const _nfts = nfts.filter((nft) => (nft.tokenId ?? nft.domain) !== tokenId)

          if (_nfts.length) {
            tempNfts[chain] = _nfts
          } else {
            delete tempNfts[chain]
          }
        }
      })

      if (Object.keys(tempNfts).length === 0 && Object.keys(collectionData.nfts).length !== 0) {
        areAllNftsHiddenRef.current = true
      } else {
        areAllNftsHiddenRef.current = false
      }

      return { collections: collectionData.collections, nfts: tempNfts }
    }

    areAllNftsHiddenRef.current = false
    return collectionData
  }, [collectionData, hiddenNfts])

  const sortedCollectionChains = useMemo(() => {
    const collectionChains =
      _collectionData?.collections.reduce((_collectionChains: SupportedChain[], collection) => {
        if (
          collection.totalNfts &&
          !disabledNftsCollections.includes(collection.address) &&
          !_collectionChains.includes(collection.chain) &&
          Object.keys(_collectionData.nfts).includes(collection.chain)
        ) {
          return [..._collectionChains, collection.chain]
        }

        return _collectionChains
      }, []) ?? []

    return sortStringArr(collectionChains) as SupportedChain[]
  }, [_collectionData?.collections, _collectionData?.nfts, disabledNftsCollections])

  const _isLoading = Object.values(isLoading).includes(true)
  const value = {
    areAllNftsHiddenRef,
    collectionData,
    _collectionData,
    setCollectionData,
    isLoading,
    setIsLoading,
    _isLoading,
    activeTab,
    setActiveTab,
    showCollectionDetailsFor,
    setShowCollectionDetailsFor,
    nftDetails,
    setNftDetails,
    nftChains: _nftChains,
    sortedCollectionChains,
    showChainNftsFor,
    setShowChainNftsFor,
    setTriggerRerender,
    ..._value,
  }

  return <NftContext.Provider value={value}>{children}</NftContext.Provider>
}

export function useNftContext() {
  const context = useContext(NftContext)
  assert(context !== null, 'useNftContext must be used within NftContextProvider')
  return context
}
