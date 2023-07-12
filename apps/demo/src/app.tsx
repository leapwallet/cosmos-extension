import 'react-loading-skeleton/dist/skeleton.css'

import { LeapUiTheme } from '@leapwallet/leap-ui'
import { Config } from 'mixpanel-browser'
import React, { Suspense } from 'react'
import { SkeletonTheme } from 'react-loading-skeleton'

import DemoHeader from '~/components/demo-header'
import WalletLoading from '~/components/wallet-loading'
import useMixPanelInit from '~/hooks/mix-panel/use-init'
import { useManageChains } from '~/hooks/settings/use-manage-chains'
import { useInitTheme, useThemeState } from '~/hooks/settings/use-theme'
import useInitContacts from '~/hooks/wallet/use-init-contacts'
import { Colors } from '~/theme/colors'

const Router = React.lazy(() => import('./router'))

const mixpanelToken = process.env.MIXPANEL_PROJECT_TOKEN
const mixpanelIngestionProxy = process.env.MIXPANEL_INGESTION_PROXY

const config: Partial<Config> = {
  api_host: mixpanelIngestionProxy,
}

export default function App() {
  const { theme } = useThemeState()

  useInitTheme()
  useManageChains()
  useInitContacts()
  useMixPanelInit(mixpanelToken, config)

  return (
    <LeapUiTheme defaultTheme={theme} forcedTheme={theme}>
      <SkeletonTheme
        baseColor={theme === 'dark' ? Colors.gray800 : Colors.gray300}
        highlightColor={theme === 'dark' ? Colors.gray900 : Colors.gray400}
      >
        <div className='dark:bg-black-100 bg-gray-100 h-screen w-screen flex items-center justify-center'>
          <div className='header-bg-gradient w-screen absolute z-1 top-0 left-0 h-40 bg-gradient-to-b from-mainChainTheme-100 to-transparent' />
          <DemoHeader />
          <div className='w-screen max-w-[420px] mx-auto shadow-md rounded-lg overflow-hidden outline outline-1 outline-gray-300 dark:outline-gray-800'>
            <Suspense fallback={<WalletLoading />}>
              <Router />
            </Suspense>
          </div>
        </div>
      </SkeletonTheme>
    </LeapUiTheme>
  )
}
