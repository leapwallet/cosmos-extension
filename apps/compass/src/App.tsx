import 'react-loading-skeleton/dist/skeleton.css'

import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import { IconContext } from '@phosphor-icons/react'
import { useInitClientId } from 'hooks/settings/useClientId'
import { useInitNodeUrls } from 'hooks/useInitNodeUrls'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { SkeletonTheme } from 'react-loading-skeleton'
import { clientIdStore } from 'stores/client-id-store'

import { useInitTheme } from './hooks/settings/useTheme'
import Routes from './Routes'
import { Colors } from './theme/colors'

export default observer(function App() {
  const { theme } = useTheme()

  useInitNodeUrls()
  useInitTheme()
  useInitClientId(clientIdStore)

  return (
    <SkeletonTheme
      baseColor={theme === ThemeName.DARK ? Colors.gray800 : Colors.gray300}
      highlightColor={theme === ThemeName.DARK ? Colors.gray900 : Colors.gray400}
    >
      <IconContext.Provider
        value={{
          weight: 'bold',
        }}
      >
        <Routes />
      </IconContext.Provider>
    </SkeletonTheme>
  )
})
