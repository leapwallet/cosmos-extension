import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import { useEffect } from 'react'
import browser from 'webextension-polyfill'

const themeStorageKey = 'theme'

export function useInitTheme() {
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    browser.storage.local.get(themeStorageKey).then((storage) => {
      setTheme(storage[themeStorageKey] ?? ThemeName.DARK)
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (theme) {
      browser.storage.local.set({ [themeStorageKey]: theme })
    }
  }, [theme])
}
