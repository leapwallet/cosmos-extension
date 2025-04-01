import { PageName } from 'config/analytics'
import { usePageView } from 'hooks/analytics/usePageView'
import React from 'react'

import { ChainActivity } from './components'

export default function Activity() {
  usePageView(PageName.Activity)

  return <ChainActivity />
}
