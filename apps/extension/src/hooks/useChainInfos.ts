/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useChainsStore, useCustomChains } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfos } from '@leapwallet/cosmos-wallet-sdk'
import { chainInfosState } from 'atoms/chains'
import { BETA_CHAINS, CUSTOM_ENDPOINTS } from 'config/storage-keys'
import { useEffect } from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { isCompassWallet } from 'utils/isCompassWallet'
import browser from 'webextension-polyfill'

export function useInitChainInfos() {
  const setChains = useChainsStore((store) => store.setChains)
  const setChainInfos = useSetRecoilState(chainInfosState)
  const customChains = useCustomChains()

  useEffect(() => {
    function getBetaChains(updateStore?: boolean) {
      browser.storage.local.get([BETA_CHAINS, CUSTOM_ENDPOINTS]).then(async (resp) => {
        const _allChains: any = JSON.parse(resp[BETA_CHAINS] ?? '{}')
        for (let i = 0; i < customChains?.length; i++) {
          if (
            !isCompassWallet() &&
            !!resp[BETA_CHAINS] &&
            Object.keys(JSON.parse(resp[BETA_CHAINS])).includes(customChains[i].chainName)
          ) {
            const existingChain = JSON.parse(resp[BETA_CHAINS])[customChains[i]?.chainName]
            _allChains[customChains[i]?.chainName] = {
              ...customChains[i],
              chainId: existingChain.chainId,
              bip44: existingChain.bip44,
              addressPrefix: existingChain.addressPrefix,
              chainRegistryPath: existingChain.chainRegistryPath,
              testnetChainRegistryPath: existingChain.testnetChainRegistryPath,
            }
          }
        }

        const betaChains = isCompassWallet()
          ? {}
          : Object.keys(_allChains).length > 0
          ? _allChains
          : JSON.parse(resp[BETA_CHAINS] ?? '{}')

        if (!isCompassWallet()) {
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

          if (updateStore) {
            await browser.storage.local.set({ [BETA_CHAINS]: JSON.stringify(betaChains) })
          }
        }

        const enabledChains = Object.entries(ChainInfos).reduce(
          (chainInfos, [chainKey, chainData]) => {
            //cosmoshub is kept here for backwards compatibility
            if (
              isCompassWallet() &&
              !['arctic-1', 'pacific-1', 'cosmoshub-4'].includes(chainData.chainId)
            ) {
              return chainInfos
            } else if (!isCompassWallet() && chainData.chainId === 'arctic-1') {
              return chainInfos
            }

            if (!chainData.enabled) {
              return chainInfos
            } else return { ...chainInfos, [chainKey]: chainData }
          },
          {},
        )

        const allChains = { ...betaChains, ...enabledChains }
        const sortedChains = Object.keys(allChains).sort((a, b) =>
          allChains[a].chainName.toLowerCase().localeCompare(allChains[b].chainName.toLowerCase()),
        )

        const _chains: Record<string, any> = {}
        sortedChains.map((key) => {
          _chains[key] = allChains[key]
        })

        const customEndpoints = JSON.parse(resp[CUSTOM_ENDPOINTS] ?? '{}')

        for (const chain in customEndpoints) {
          if (_chains[chain] === undefined) {
            continue
          }

          const { rpc, lcd } = customEndpoints[chain]
          const isChainHaveTestnetOnly = _chains[chain]?.chainId === _chains[chain]?.testnetChainId
          let _chain = _chains[chain]

          if (_chain) {
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
        }

        setChainInfos(_chains)
        setChains(_chains)
      })
    }

    getBetaChains(true)
    const addChainEventListener = (storage: Record<string, any>) => {
      if (storage && (storage[BETA_CHAINS] || storage[CUSTOM_ENDPOINTS])) {
        getBetaChains(false)
      }
    }

    browser.storage.onChanged.addListener(addChainEventListener)

    return () => {
      browser.storage.onChanged.removeListener(addChainEventListener)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customChains])
}

export function useChainInfos() {
  return useRecoilValue(chainInfosState)
}
