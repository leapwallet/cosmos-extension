import { useAddress } from '@leapwallet/cosmos-wallet-hooks'
import { useAlphaUser } from 'hooks/useAlphaUser'
import { NftCollection, useChadNftCollections } from 'hooks/useChadNftCollections'
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useSearchParams } from 'react-router-dom'

import { RaffleListingProps } from '../chad-components/RaffleListing'
import { AlphaUser } from '../types'

type ContextType = {
  selectedOpportunities: string[]
  selectedEcosystems: string[]
  setOpportunities: (opportunities: string[]) => void
  setEcosystems: (ecosystems: string[]) => void
  clearFilters: () => void
  selectedOpportunity: RaffleListingProps | null
  showDetails: boolean
  nftCollections: NftCollection[]
  alphaUser: AlphaUser | undefined
  refetchAlphaUser: () => void
  setSelectedOpportunity: (opportunity: RaffleListingProps | null) => void
  setShowDetails: (show: boolean) => void
  openDetails: (opportunity: RaffleListingProps) => void
  closeDetails: () => void
}

const ChadContext = createContext<ContextType | undefined>(undefined)

export const ChadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { nftCollections } = useChadNftCollections()
  const cosmosAddress = useAddress('cosmos')
  const { alphaUser, refetchAlphaUser } = useAlphaUser(cosmosAddress)

  const [selectedOpportunities, setSelectedOpportunities] = useState<string[]>(() => {
    const category = searchParams.get('chad_category')
    return category ? category.split(',') : []
  })
  const [selectedEcosystems, setSelectedEcosystems] = useState<string[]>(() => {
    const ecosystem = searchParams.get('chad_ecosystem')
    return ecosystem ? ecosystem.split(',') : []
  })
  const [selectedOpportunity, setSelectedOpportunity] = useState<RaffleListingProps | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const setOpportunitiesWithoutDuplicates = useCallback(
    (opportunities: string[]) => {
      const uniqueOpportunities = [...new Set(opportunities)]
      setSelectedOpportunities(uniqueOpportunities)

      const params = new URLSearchParams(searchParams)
      if (uniqueOpportunities.length > 0) {
        params.set('chad_category', uniqueOpportunities.join(','))
      } else {
        params.delete('chad_category')
      }
      setSearchParams(params)
    },
    [searchParams, setSearchParams],
  )

  const setEcosystemsWithoutDuplicates = useCallback(
    (ecosystems: string[]) => {
      const uniqueEcosystems = [...new Set(ecosystems)]
      setSelectedEcosystems(uniqueEcosystems)

      const params = new URLSearchParams(searchParams)
      if (uniqueEcosystems.length > 0) {
        params.set('chad_ecosystem', uniqueEcosystems.join(','))
      } else {
        params.delete('chad_ecosystem')
      }
      setSearchParams(params)
    },
    [searchParams, setSearchParams],
  )

  const clearFilters = useCallback(() => {
    setSelectedOpportunities([])
    setSelectedEcosystems([])

    const params = new URLSearchParams(searchParams)
    params.delete('chad_category')
    params.delete('chad_ecosystem')
    setSearchParams(params)
  }, [searchParams, setSearchParams])

  const openDetails = (opportunity: RaffleListingProps) => {
    setSelectedOpportunity(opportunity)
    setShowDetails(true)
  }

  const closeDetails = () => {
    setShowDetails(false)
    const params = new URLSearchParams(searchParams)
    if (params.has('listingId')) {
      params.delete('listingId')
      setSearchParams(params)
    }
  }

  useEffect(() => {
    const category = searchParams.get('chad_category')
    const ecosystem = searchParams.get('chad_ecosystem')

    if (category) {
      setSelectedOpportunities(category.split(','))
    }

    if (ecosystem) {
      setSelectedEcosystems(ecosystem.split(','))
    }
  }, [searchParams])

  return (
    <ChadContext.Provider
      value={{
        selectedOpportunities,
        selectedEcosystems,
        setOpportunities: setOpportunitiesWithoutDuplicates,
        setEcosystems: setEcosystemsWithoutDuplicates,
        clearFilters,
        selectedOpportunity,
        showDetails,
        nftCollections,
        alphaUser,
        refetchAlphaUser,
        setSelectedOpportunity,
        setShowDetails,
        openDetails,
        closeDetails,
      }}
    >
      {children}
    </ChadContext.Provider>
  )
}

export const useChadProvider = (): ContextType => {
  const context = useContext(ChadContext)
  if (!context) {
    throw new Error('useChadProvider must be used within a ChadProvider')
  }
  return context
}
