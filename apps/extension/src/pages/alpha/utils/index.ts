import { BOOKMARKED_ALPHAS } from 'config/storage-keys'
import browser from 'webextension-polyfill'

/**
 * @description collection of utility functions for the alpha page
 */

/**
 * @description handling bookmarking alphas:
 * - get bookmarked alphas
 * - check if an alpha is bookmarked
 * - toggle an alpha's bookmark status
 */
export const getBookmarkedAlphas = async (): Promise<string[]> => {
  try {
    const { [BOOKMARKED_ALPHAS]: stored } = await browser.storage.local.get(BOOKMARKED_ALPHAS)
    return stored ? JSON.parse(stored) : []
  } catch {
    await browser.storage.local.remove(BOOKMARKED_ALPHAS)
    return []
  }
}

export const isAlphaBookmarked = async (id: string): Promise<boolean> => {
  const bookmarks = await getBookmarkedAlphas()
  return bookmarks.includes(id)
}

export const toggleAlphaBookmark = async (id: string): Promise<void> => {
  const bookmarks = await getBookmarkedAlphas()
  const newBookmarks = bookmarks.includes(id)
    ? bookmarks.filter((bookmarkId) => bookmarkId !== id)
    : [...bookmarks, id]
  await browser.storage.local.set({
    [BOOKMARKED_ALPHAS]: JSON.stringify(newBookmarks),
  })
}

/**
 * @description misc utilities for UI, sorting, formatting, etc.
 */
export const sortOpportunitiesByDate = <T extends { additionDate: string }>(
  opportunities: T[],
): T[] => {
  return opportunities.sort((a, b) => {
    const dateA = a.additionDate.split('/').reverse().join('')
    const dateB = b.additionDate.split('/').reverse().join('')
    return dateB.localeCompare(dateA)
  })
}

export const getHostname = (url: string) => {
  try {
    const hostname = new URL(url).hostname
    return hostname.split('.').slice(-2).join('.')
  } catch {
    return url
  }
}

export const parseDate = (dateStr: string) => {
  // For MM/DD/YYYY format
  const [month, day, year] = dateStr.split('/').map((num) => parseInt(num, 10))
  return new Date(year, month - 1, day)
}

export const formatTimeDiff = (timeDiff: number, pastSuffix = false) => {
  if (timeDiff < 0) return 'Today'

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
  const months = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 30))

  if (months > 0) return `${months} month${months > 1 ? 's' : ''}`
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`
  return 'Today'
}

export const endsIn = (endDate: string) => {
  const parsedDate = parseDate(endDate)
  const timeDiff = parsedDate.getTime() - new Date().getTime()

  if (timeDiff <= 0) return 'Ended'
  if (new Date().toDateString() === parsedDate.toDateString()) {
    return 'Ends today'
  }

  const timeLeft = formatTimeDiff(timeDiff)
  return timeLeft === 'Today' ? 'Ends today' : `Ends in ${timeLeft}`
}

export const addedAt = (additionDate: string) => {
  const parsedDate = parseDate(additionDate)

  if (new Date().toDateString() === parsedDate.toDateString()) {
    return 'Today'
  }

  const day = parsedDate.getDate()
  const month = parsedDate.toLocaleString('en-US', { month: 'short' })

  return `${day} ${month}`
}
