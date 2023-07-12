import { ThemeName } from '@leapwallet/leap-ui'
import { useEffect } from 'react'
import { atom, useRecoilState, useSetRecoilState } from 'recoil'

import { AppConfig } from '~/config'

export const themeAtom = atom<ThemeName>({
  key: AppConfig.STORAGE_KEYS.THEME,
  default: ThemeName.DARK,
})

export function useInitTheme() {
  const setThemeState = useSetRecoilState(themeAtom)

  useEffect(() => {
    const preExistingThemeName = localStorage.getItem(AppConfig.STORAGE_KEYS.THEME)
    if (preExistingThemeName) {
      setThemeState(preExistingThemeName as ThemeName)
    }
  }, [setThemeState])
}

export function useThemeState() {
  const [theme, setTheme] = useRecoilState(themeAtom)

  useEffect(() => {
    if (theme) {
      localStorage.setItem(AppConfig.STORAGE_KEYS.THEME, theme)
    }
  }, [theme])

  return { theme, setTheme }
}
