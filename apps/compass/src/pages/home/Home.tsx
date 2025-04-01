import { PageName } from 'config/analytics'
import { usePageView } from 'hooks/analytics/usePageView'
import React from 'react'

import { GeneralHome } from './components'

export default function Home() {
  usePageView(PageName.Home)

  return <GeneralHome />
}
