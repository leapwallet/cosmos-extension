import { PageName } from 'config/analytics'
import { usePageView } from 'hooks/analytics/usePageView'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useAlphaUser } from 'hooks/useAlphaUser'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { homePageViewStore } from 'stores/home-pageview-store'

import { GeneralHome } from './components'

const Home = observer(() => {
  const { activeWallet } = useActiveWallet()
  const { alphaUser } = useAlphaUser(activeWallet?.addresses?.cosmos ?? '')
  usePageView(
    PageName.Home,
    !homePageViewStore.hasSeen,
    {
      isChad: alphaUser?.isChad ?? false,
    },
    () => {
      homePageViewStore.updateSeen(true)
    },
  )

  return <GeneralHome />
})

export default Home
