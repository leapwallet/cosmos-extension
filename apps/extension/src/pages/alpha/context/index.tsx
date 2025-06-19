import React from 'react'

import { BookmarkProvider, ChadBookmarkProvider } from './bookmark-context'
import { ChadProvider } from './chad-exclusives-context'
import { FilterProvider } from './filter-context'

export const AlphaContextProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <FilterProvider>
      <ChadProvider>
        <BookmarkProvider>
          <ChadBookmarkProvider>{children}</ChadBookmarkProvider>
        </BookmarkProvider>
      </ChadProvider>
    </FilterProvider>
  )
}
