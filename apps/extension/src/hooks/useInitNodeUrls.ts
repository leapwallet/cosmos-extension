import {
  ChainInfos,
  initiateNodeUrls,
  NODE_URLS,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { BETA_CHAINS, CUSTOM_ENDPOINTS } from 'config/storage-keys'
import { useEffect } from 'react'
import Browser from 'webextension-polyfill'

export function useInitNodeUrls(
  setNodeUrlInitialised: React.Dispatch<React.SetStateAction<boolean>>,
) {
  useEffect(() => {
    async function updateNodeUrls() {
      const storage = await Browser.storage.local.get([BETA_CHAINS, CUSTOM_ENDPOINTS])

      const betaChains = JSON.parse(storage[BETA_CHAINS] ?? '{}')
      const customEndpoints = JSON.parse(storage[CUSTOM_ENDPOINTS] ?? '{}')

      for (const chainName in betaChains) {
        if (
          Object.values(ChainInfos).some((chainInfo) =>
            [chainInfo.chainId, chainInfo.testnetChainId].includes(betaChains[chainName].chainId),
          )
        ) {
          delete betaChains[chainName]
        }
      }

      const chains = {
        ...betaChains,
        ...ChainInfos,
      }

      if (NODE_URLS) {
        for (const chain in customEndpoints) {
          const { rpc, lcd } = customEndpoints[chain]
          const chainId = chains[chain as SupportedChain].chainId

          if (lcd && NODE_URLS.rest) {
            NODE_URLS.rest[chainId] = [{ nodeUrl: lcd, nodeProvider: null }]
          }

          if (rpc && NODE_URLS.rpc) {
            NODE_URLS.rpc[chainId] = [{ nodeUrl: rpc, nodeProvider: null }]
          }
        }
      }
    }

    ;(async () => {
      try {
        await initiateNodeUrls()
        updateNodeUrls()
      } finally {
        setNodeUrlInitialised(true)
      }
    })()

    Browser.storage.onChanged.addListener((storage) => {
      if (storage && (storage[BETA_CHAINS] || storage[CUSTOM_ENDPOINTS])) {
        updateNodeUrls()
      }
    })

    return () => {
      Browser.storage.onChanged.removeListener((storage) => {
        if (storage && (storage[BETA_CHAINS] || storage[CUSTOM_ENDPOINTS])) {
          updateNodeUrls()
        }
      })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
