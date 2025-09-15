import 'react-loading-skeleton/dist/skeleton.css'

import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import { IconContext } from '@phosphor-icons/react'
import { useInitClientId } from 'hooks/settings/useClientId'
import { useInitNodeUrls } from 'hooks/useInitNodeUrls'
import { observer } from 'mobx-react-lite'
import React, { lazy, PropsWithChildren, Suspense, useEffect } from 'react'
import { SkeletonTheme } from 'react-loading-skeleton'
import { clientIdStore } from 'stores/client-id-store'

import Routes from './Routes'
import { Colors } from './theme/colors'
const ElementsInitializer = lazy(() => import('./ElementsInitializer'))

const AppWrapper = observer((props: PropsWithChildren) => {
  const { theme, setTheme } = useTheme()

  useInitNodeUrls()
  useInitClientId(clientIdStore)

  useEffect(() => {
    if (theme === ThemeName.SYSTEM) {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? ThemeName.DARK
        : ThemeName.LIGHT
      setTheme(systemTheme)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme])

  return (
    <>
      <SkeletonTheme
        baseColor={theme === ThemeName.DARK ? Colors.gray800 : Colors.gray300}
        highlightColor={theme === ThemeName.DARK ? Colors.gray900 : Colors.gray400}
      >
        {props.children}
      </SkeletonTheme>
      <Suspense fallback={<></>}>
        <ElementsInitializer />
      </Suspense>
    </>
  )
})

export default function App() {
  return (
    <AppWrapper>
      <IconContext.Provider
        value={{
          weight: 'bold',
        }}
      >
        <Routes />
      </IconContext.Provider>
    </AppWrapper>
  )
}
