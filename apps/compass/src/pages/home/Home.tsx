import { PageName } from 'config/analytics'
import { usePageView } from 'hooks/analytics/usePageView'
import React from 'react'
import { homePageViewStore } from 'stores/home-pageview-store'

import { GeneralHome } from './components'

export default function Home() {
  usePageView(PageName.Home, !homePageViewStore.hasSeen, {}, () => {
    homePageViewStore.updateSeen(true)
  })

  return <GeneralHome />
}
