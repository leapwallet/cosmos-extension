import {
  initCachingLayer,
  setCustomHeaders,
  setLeapIntegratorID,
  setMosaicAPIKey,
} from '@leapwallet/elements-hooks'
import { useChains, useSkipSupportedChains } from '@leapwallet/elements-hooks'
import { memo } from 'react'
import { AsyncIDBStorage } from 'utils/asyncIDBStorage'

// elements config
setCustomHeaders({
  'x-app-type': 'leap-extension',
})
initCachingLayer(AsyncIDBStorage)
setLeapIntegratorID(process.env.ELEMENTS_INTEGRATOR_ID as string)
setMosaicAPIKey(process.env.MOSAIC_API_KEY as string)

function ElementsInitializer() {
  useChains()
  useSkipSupportedChains({
    chainTypes: ['cosmos', 'evm'],
  })

  return null
}

export default memo(ElementsInitializer)
