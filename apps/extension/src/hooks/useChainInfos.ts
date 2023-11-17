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
      browser.storage.local.get([BETA_CHAINS, CUSTOM_ENDPOINTS]).then(async (resp) => {
        const betaChains = JSON.parse(resp[BETA_CHAINS] ?? '{}')

        for (const chainName in betaChains) {
          if (
            Object.values(ChainInfos).some(
              (chainInfo) =>
                [chainInfo.chainId, chainInfo.testnetChainId].includes(
                  betaChains[chainName].chainId,
                ) && chainInfo.enabled,
            )
          ) {
            delete betaChains[chainName]
          }
        }

        await browser.storage.local.set({ [BETA_CHAINS]: JSON.stringify(betaChains) })
        const enabledChains = Object.entries(ChainInfos).reduce((chainInfos, chain) => {
          if (!chain[1].enabled) {
            return chainInfos
          } else return { ...chainInfos, [chain[0]]: chain[1] }
        }, {})

        const _chains = {
          ...betaChains,
          ...enabledChains,
        }

        const customEndpoints = JSON.parse(resp[CUSTOM_ENDPOINTS] ?? '{}')

        for (const chain in customEndpoints) {
          const { rpc, lcd } = customEndpoints[chain]
          const isChainHaveTestnetOnly = _chains[chain].chainId === _chains[chain].testnetChainId
          let _chain = _chains[chain]

          if (isChainHaveTestnetOnly) {
            if (rpc) {
              _chain = { ..._chain, apis: { ..._chain.apis, rpcTest: rpc } }
            }

            if (lcd) {
              _chain = { ..._chain, apis: { ..._chain.apis, restTest: lcd } }
            }
          } else {
            if (rpc) {
              _chain = { ..._chain, apis: { ..._chain.apis, rpc } }
            }

            if (lcd) {
              _chain = { ..._chain, apis: { ..._chain.apis, rest: lcd } }
            }
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
