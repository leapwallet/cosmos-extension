import { useQueryParams } from 'hooks/useQuery'
import React from 'react'
import { queryParams } from 'utils/query-params'

import { AlphaHeader } from './alpha-header'
import { BookmarkedChad } from './chad-components/ChadBookmarks'
import RaffleDetailsDrawer from './chad-components/RaffleDetailsDrawer'
import AlphaDetailsDrawer from './components/AlphaDetailsDrawer'
import { BookmarkedAlpha } from './components/Bookmarks'
import { useChadProvider } from './context/chad-exclusives-context'
import { useFilters } from './context/filter-context'
import { TabSwitch } from './tab-switch'
import { Tabs } from './tabs'

export default function Alpha() {
  const { showDetails, selectedOpportunity, closeDetails } = useFilters()
  const {
    showDetails: showChadDetails,
    selectedOpportunity: selectedChadOpportunity,
    closeDetails: closeChadDetails,
  } = useChadProvider()

  const params = useQueryParams()

  const activeTab = params.get(queryParams.alphaTab) || 'all'
  const showBookmarks = params.get(queryParams.alphaBookmarks) === 'true'

  return (
    <>
      <AlphaHeader />

      {activeTab === 'all' ? (
        <BookmarkedAlpha
          isOpen={showBookmarks}
          toggler={() => params.remove(queryParams.alphaBookmarks)}
        />
      ) : (
        <BookmarkedChad
          isOpen={showBookmarks}
          toggler={() => params.remove(queryParams.alphaBookmarks)}
        />
      )}

      <AlphaDetailsDrawer
        isShown={showDetails}
        onClose={closeDetails}
        opportunity={selectedOpportunity}
      />

      <RaffleDetailsDrawer
        isShown={showChadDetails}
        onClose={closeChadDetails}
        raffle={selectedChadOpportunity}
      />

      <TabSwitch />

      <Tabs activeTab={activeTab} />
    </>
  )
}
