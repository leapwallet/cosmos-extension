import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useSearchParams } from 'react-router-dom'

import { AlphaOpportunityProps } from '../components/alpha-timeline'

type FilterContextType = {
  selectedOpportunities: string[]
  selectedEcosystems: string[]
  setOpportunities: (opportunities: string[]) => void
  setEcosystems: (ecosystems: string[]) => void
  clearFilters: () => void
  selectedOpportunity: AlphaOpportunityProps | null
  showDetails: boolean
  setSelectedOpportunity: (opportunity: AlphaOpportunityProps | null) => void
  setShowDetails: (show: boolean) => void
  openDetails: (opportunity: AlphaOpportunityProps) => void
  closeDetails: () => void
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedOpportunities, setSelectedOpportunities] = useState<string[]>(() => {
    const category = searchParams.get('category')
    return category ? category.split(',') : []
  })
  const [selectedEcosystems, setSelectedEcosystems] = useState<string[]>(() => {
    const ecosystem = searchParams.get('ecosystem')
    return ecosystem ? ecosystem.split(',') : []
  })
  const [selectedOpportunity, setSelectedOpportunity] = useState<AlphaOpportunityProps | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const setOpportunitiesWithoutDuplicates = useCallback(
    (opportunities: string[]) => {
      const uniqueOpportunities = [...new Set(opportunities)]
      setSelectedOpportunities(uniqueOpportunities)

      const params = new URLSearchParams(searchParams)
      if (uniqueOpportunities.length > 0) {
        params.set('category', uniqueOpportunities.join(','))
      } else {
        params.delete('category')
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
        params.set('ecosystem', uniqueEcosystems.join(','))
      } else {
        params.delete('ecosystem')
      }
      setSearchParams(params)
    },
    [searchParams, setSearchParams],
  )

  const clearFilters = useCallback(() => {
    setSelectedOpportunities([])
    setSelectedEcosystems([])

    const params = new URLSearchParams(searchParams)
    params.delete('category')
    params.delete('ecosystem')
    setSearchParams(params)
  }, [searchParams, setSearchParams])

  const openDetails = (opportunity: AlphaOpportunityProps) => {
    setSelectedOpportunity(opportunity)
    setShowDetails(true)
  }

  const closeDetails = () => {
    setShowDetails(false)
  }

  useEffect(() => {
    const category = searchParams.get('category')
    const ecosystem = searchParams.get('ecosystem')

    if (category) {
      setSelectedOpportunities(category.split(','))
    }

    if (ecosystem) {
      setSelectedEcosystems(ecosystem.split(','))
    }
  }, [searchParams])

  return (
    <FilterContext.Provider
      value={{
        selectedOpportunities,
        selectedEcosystems,
        setOpportunities: setOpportunitiesWithoutDuplicates,
        setEcosystems: setEcosystemsWithoutDuplicates,
        clearFilters,
        selectedOpportunity,
        showDetails,
        setSelectedOpportunity,
        setShowDetails,
        openDetails,
        closeDetails,
      }}
    >
      {children}
    </FilterContext.Provider>
  )
}

export const useFilters = (): FilterContextType => {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider')
  }
  return context
}
