/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useChainsStore } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfos } from '@leapwallet/cosmos-wallet-sdk'
import { chainInfosState } from 'atoms/chains'
import { BETA_CHAINS, CUSTOM_ENDPOINTS } from 'config/storage-keys'
import { useEffect } from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import browser from 'webextension-polyfill'

export function useInitChainInfos() {
  const setChains = useChainsStore((store) => store.setChains)
  const setChainInfos = useSetRecoilState(chainInfosState)

  useEffect(() => {
    function getBetaChains() {
      browser.storage.local.get([BETA_CHAINS, CUSTOM_ENDPOINTS]).then((resp) => {
        const _chains = {
          ...ChainInfos,
          ...JSON.parse(resp[BETA_CHAINS] ?? '{}'),
        }
        const customEndpoints = JSON.parse(resp[CUSTOM_ENDPOINTS] ?? '{}')

        for (const chain in customEndpoints) {
          const { rpc, lcd } = customEndpoints[chain]
          const isChainHaveTestnetOnly = _chains[chain].chainId === _chains[chain].testnetChainId
          let _chain = _chains[chain]

          if (isChainHaveTestnetOnly) {
            _chain = { ..._chain, apis: { ..._chain.apis, restTest: lcd, rpcTest: rpc } }
          } else {
            _chain = { ..._chain, apis: { ..._chain.apis, rest: lcd, rpc } }
          }

          _chains[chain] = _chain
        }

        setChainInfos(_chains)
        setChains(_chains)
      })
    }

    getBetaChains()

    browser.storage.onChanged.addListener((storage) => {
      if (storage && (storage[BETA_CHAINS] || storage[CUSTOM_ENDPOINTS])) {
        getBetaChains()
      }
    })

    return () => {
      browser.storage.onChanged.removeListener((storage) => {
        if (storage && (storage[BETA_CHAINS] || storage[CUSTOM_ENDPOINTS])) {
          getBetaChains()
        }
      })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export function useChainInfos() {
  return useRecoilValue(chainInfosState)
}
