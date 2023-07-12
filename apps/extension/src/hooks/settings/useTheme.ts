import { ThemeName } from '@leapwallet/leap-ui'
import { useEffect } from 'react'
import { atom, useRecoilState } from 'recoil'
import browser from 'webextension-polyfill'

const storageKey = 'theme'

const themeState = atom<ThemeName | undefined>({
  key: 'theme',
  default: undefined,
})

export function useInitTheme() {
  const [_, setState] = useRecoilState(themeState)

  useEffect(() => {
    browser.storage.local.get(storageKey).then((storage) => {
      setState(storage[storageKey] ?? ThemeName.DARK)
    })
  }, [])
}

export function useThemeState() {
  const [theme, setTheme] = useRecoilState(themeState)
  useEffect(() => {
    if (theme) {
      browser.storage.local.set({ [storageKey]: theme })
    }
  }, [theme])
  return { theme, setTheme }
}
