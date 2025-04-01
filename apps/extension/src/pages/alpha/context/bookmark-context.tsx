import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { getBookmarkedAlphas, toggleAlphaBookmark } from '../utils'

type BookmarkContextType = {
  bookmarks: Set<string>
  isBookmarked: (id: string) => boolean
  toggleBookmark: (id: string) => void
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined)

/**
 * @description a context provider for the bookmark feature
 * - getter, setter and toggle functionality for the bookmark feature
 */
export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())

  useEffect(() => {
    getBookmarkedAlphas().then((stored) => setBookmarks(new Set(stored)))
  }, [])

  const isBookmarked = useCallback(
    (id: string) => {
      return bookmarks.has(id)
    },
    [bookmarks],
  )

  const toggleBookmark = useCallback(async (id: string) => {
    await toggleAlphaBookmark(id)
    const newBookmarks = await getBookmarkedAlphas()
    setBookmarks(new Set(newBookmarks))
  }, [])

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        isBookmarked,
        toggleBookmark,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  )
}

export const useBookmarks = () => {
  const context = useContext(BookmarkContext)
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider')
  }
  return context
}
