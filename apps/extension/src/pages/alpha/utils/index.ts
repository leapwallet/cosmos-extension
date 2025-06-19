import { BOOKMARKED_ALPHAS, BOOKMARKED_CHAD_LISTINGS } from 'config/storage-keys'
import dayjs from 'dayjs'
import { Raffle, RaffleStatus } from 'hooks/useAlphaOpportunities'
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

export const getBookmarkedChadListings = async (): Promise<string[]> => {
  try {
    const { [BOOKMARKED_CHAD_LISTINGS]: stored } = await browser.storage.local.get(
      BOOKMARKED_CHAD_LISTINGS,
    )
    return stored ? JSON.parse(stored) : []
  } catch {
    await browser.storage.local.remove(BOOKMARKED_CHAD_LISTINGS)
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

export const toggleChadListingBookmark = async (id: string): Promise<void> => {
  const bookmarks = await getBookmarkedChadListings()
  const newBookmarks = bookmarks.includes(id)
    ? bookmarks.filter((bookmarkId) => bookmarkId !== id)
    : [...bookmarks, id]
  await browser.storage.local.set({
    [BOOKMARKED_CHAD_LISTINGS]: JSON.stringify(newBookmarks),
  })
}

/**
 * @description sort raffles by status: ongoing first, then upcoming, then ended
 * - Ongoing: start date has passed, end date not reached yet
 * - Upcoming: start date is in the future
 * - Ended: end date is in the past
 */
export const sortRafflesByStatus = (raffles: Raffle[]) => {
  return [...raffles].sort((a, b) => {
    const now = dayjs()
    const aStartsAt = dayjs(a.startsAt)
    const aEndsAt = dayjs(a.endsAt)
    const bStartsAt = dayjs(b.startsAt)
    const bEndsAt = dayjs(b.endsAt)

    // Define status categories: 1 = ongoing, 2 = upcoming, 3 = ended
    const getStatusPriority = (raffle: Raffle, startsAt: dayjs.Dayjs, endsAt: dayjs.Dayjs) => {
      if (raffle.status === RaffleStatus.COMPLETED) return 3 // ended if status is Completed
      if (startsAt.isBefore(now) && now.isBefore(endsAt)) return 1 // ongoing
      if (startsAt.isAfter(now)) return 2 // upcoming
      return 3 // ended
    }

    const aPriority = getStatusPriority(a, aStartsAt, aEndsAt)
    const bPriority = getStatusPriority(b, bStartsAt, bEndsAt)

    // First sort by status priority
    if (aPriority !== bPriority) {
      return aPriority - bPriority
    }

    // Within the same status group, sort by most recent first
    if (aPriority === 3) {
      // For ended: most recently ended first
      return bEndsAt.unix() - aEndsAt.unix()
    } else if (aPriority === 2) {
      // For upcoming: soonest to start first
      return aStartsAt.unix() - bStartsAt.unix()
    } else {
      // For ongoing: closest to ending first
      return aEndsAt.unix() - bEndsAt.unix()
    }
  })
}

/**
 * @description misc utilities for UI, sorting, formatting, etc.
 */
export const sortOpportunitiesByDate = <T extends { additionDate: string }>(
  opportunities: T[],
): T[] => {
  return opportunities.sort((a, b) => {
    const [monthA, dayA, yearA] = a.additionDate.split('/').map(Number)
    const [monthB, dayB, yearB] = b.additionDate.split('/').map(Number)

    const dateA = new Date(yearA, monthA - 1, dayA).getTime()
    const dateB = new Date(yearB, monthB - 1, dayB).getTime()

    return dateB - dateA
  })
}

/**
 * @description format a date string recieved from raffle.createdAt
 * to MM/DD/YYYY format, so it is compatible with date format for
 * alpha-timeline sorting
 */
export const formatRaffleDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${month}/${day}/${year}`
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
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
  const months = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 30))

  if (months > 0) return `${months} month${months > 1 ? 's' : ''}`
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`
  return 'Today'
}

export const endsIn = (endDate: string) => {
  const parsedDate = parseDate(endDate)
  const now = new Date()

  // set both dates to midnight to compare only the date part
  parsedDate.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  if (now.getTime() === parsedDate.getTime()) {
    return 'Ends today'
  }
  if (now.getTime() > parsedDate.getTime()) {
    return 'Ended'
  }

  const timeDiff = parsedDate.getTime() - now.getTime()
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

/**
 * Formats a datetime string (YYYY-MM-DD HH:MM:SS) from UTC to a readable format
 * @param dateTimeString - datetime string in format "YYYY-MM-DD HH:MM:SS" (UTC)
 * @param includeTime - whether to include the time in the output
 * @returns Formatted date string
 */
export const formatDateTime = (dateTimeString: string, includeTime = true): string => {
  // Parse the UTC datetime string
  const date = new Date(`${dateTimeString.replace(' ', 'T')}Z`)

  // Options for date formatting
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }

  // Add time options if includeTime is true
  if (includeTime) {
    Object.assign(dateOptions, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  // Format the date according to user's locale
  return date.toLocaleString(undefined, dateOptions)
}

export const RaffleEndsIn = (endDate: string) => {
  const parsedDate = parseDate(endDate)
  const timeDiff = parsedDate.getTime() - new Date().getTime()

  if (timeDiff <= 0) return 'Ended'
  if (new Date().toDateString() === parsedDate.toDateString()) {
    return 'Ends today'
  }

  const timeLeft = formatTimeDiff(timeDiff)
  return timeLeft === 'Today' ? 'Ends today' : `Ends in ${timeLeft}`
}

/**
 * @note the UTC standard is used to avoid timezone issues
 * in raffle duration calculations
 */
export const endsInUTC = (endDateUTC: string): string => {
  const endDate = new Date(endDateUTC)
  const nowUTC = new Date()

  const timeDiff = endDate.getTime() - nowUTC.getTime()

  if (timeDiff <= 0) return 'Ended'

  const isSameUTCDate =
    endDate.getUTCFullYear() === nowUTC.getUTCFullYear() &&
    endDate.getUTCMonth() === nowUTC.getUTCMonth() &&
    endDate.getUTCDate() === nowUTC.getUTCDate()

  if (isSameUTCDate) return 'Ends today'

  const timeLeft = formatTimeDiff(timeDiff)
  return timeLeft === 'Today' ? 'Ends today' : `Ends in ${timeLeft}`
}

/**
 * @note the UTC standard is used to avoid timezone issues
 * in raffle start time calculations
 */
export const startsInUTC = (startDateUTC: string): string => {
  const startDate = new Date(startDateUTC)
  const nowUTC = new Date()

  const timeDiff = startDate.getTime() - nowUTC.getTime()

  if (timeDiff <= 0) return 'Started'

  const isSameUTCDate =
    startDate.getUTCFullYear() === nowUTC.getUTCFullYear() &&
    startDate.getUTCMonth() === nowUTC.getUTCMonth() &&
    startDate.getUTCDate() === nowUTC.getUTCDate()

  if (isSameUTCDate) return 'Starts today'

  const timeLeft = formatTimeDiff(timeDiff)
  return timeLeft === 'Today' ? 'Starts today' : `Starts in ${timeLeft}`
}
