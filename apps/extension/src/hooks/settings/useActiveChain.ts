import {
  Key,
  SelectedNetworkType,
  useActiveChain as useActiveChainWalletHooks,
  useGetChains,
  useInitSelectedNetwork,
  usePendingTxState,
  useSetActiveChain as useSetActiveChainWalletHooks,
  useSetLastEvmActiveChain,
} from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfo, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useQueryClient } from '@tanstack/react-query'
import { COMPASS_CHAINS } from 'config/config'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { ACTIVE_CHAIN, KEYSTORE, LAST_EVM_ACTIVE_CHAIN } from 'config/storage-keys'
import { useSetNetwork } from 'hooks/settings/useNetwork'
import { useChainInfos } from 'hooks/useChainInfos'
import { useEffect, useState } from 'react'
import { rootStore } from 'stores/root-store'
import { AggregatedSupportedChain } from 'types/utility'
import { sendMessageToTab } from 'utils'
import browser from 'webextension-polyfill'

import { isCompassWallet } from '../../utils/isCompassWallet'
import useActiveWallet, { useUpdateKeyStore } from './useActiveWallet'
import { useHandleWatchWalletChainSwitch } from './useHandleWWChainSwitch'
import { useIsAllChainsEnabled } from './useIsAllChainsEnabled'

export function useActiveChain(): SupportedChain {
  return useActiveChainWalletHooks()
}

export function useSetActiveChain() {
  const chainInfos = useGetChains()
  const { setPendingTx } = usePendingTxState()
  const setNetwork = useSetNetwork()

  const updateKeyStore = useUpdateKeyStore()
  const { activeWallet, setActiveWallet } = useActiveWallet()
  const setActiveChain = useSetActiveChainWalletHooks()
  const setLastEvmActiveChain = useSetLastEvmActiveChain()
  const queryClient = useQueryClient()

  return async (
    chain: AggregatedSupportedChain,
    chainInfo?: ChainInfo,
    forceNetwork?: 'mainnet' | 'testnet',
  ) => {
    const storage = await browser.storage.local.get(['networkMap', KEYSTORE, ACTIVE_CHAIN])
    if (chain !== AGGREGATED_CHAIN_KEY) {
      const keystore = storage[KEYSTORE]
      if (keystore) {
        const shouldUpdateKeystore = Object.keys(keystore).some((key) => {
          const wallet = keystore[key]
          return (
            wallet && !wallet.watchWallet && (!wallet.addresses[chain] || !wallet.pubKeys?.[chain])
          )
        })
        if (activeWallet && shouldUpdateKeystore) {
          const updatedKeystore = await updateKeyStore(activeWallet, chain)
          await setActiveWallet(updatedKeystore[activeWallet.id] as Key)
        }
      }
    }

    await queryClient.cancelQueries()
    setActiveChain(chain as SupportedChain)
    rootStore.setActiveChain(chain)
    browser.storage.local.set({ [ACTIVE_CHAIN]: chain })
    setPendingTx(null)

    if (chain !== AGGREGATED_CHAIN_KEY) {
      const networkMap = JSON.parse(storage.networkMap ?? '{}')
      const _chainInfo = chainInfos[chain] || chainInfo
      let _network: SelectedNetworkType = 'mainnet'

      if (chain === 'seiDevnet') {
        setNetwork('mainnet')
      } else {
        if (_chainInfo?.evmOnlyChain) {
          setLastEvmActiveChain(chain)
          browser.storage.local.set({ [LAST_EVM_ACTIVE_CHAIN]: chain })
        }

        if (forceNetwork) {
          _network = forceNetwork
          setNetwork(forceNetwork)
        } else if (networkMap[chain]) {
          let network = networkMap[chain]
          let hasChainOnlyTestnet = false

          if (
            _chainInfo &&
            (!_chainInfo?.beta || _chainInfo.evmOnlyChain) &&
            _chainInfo?.chainId === _chainInfo?.testnetChainId
          ) {
            hasChainOnlyTestnet = true
          }

          if (hasChainOnlyTestnet && network !== 'testnet') {
            network = 'testnet'
            _network = 'testnet'
          }

          setNetwork(network)
        } else if (_chainInfo && _chainInfo?.apis?.rpc) {
          setNetwork('mainnet')
        } else if (_chainInfo && _chainInfo?.apis?.rpcTest) {
          setNetwork('testnet')
          _network = 'testnet'
        }
      }

      const chainId =
        (_network === 'testnet' ? _chainInfo?.evmChainIdTestnet : _chainInfo?.evmChainId) ?? ''
      await sendMessageToTab({ event: 'chainChanged', data: chainId })
    } else {
      setNetwork('mainnet')
    }
  }
}

export function useInitActiveChain(enabled: boolean) {
  const chainInfos = useChainInfos()
  const chains = useGetChains()
  const setActiveChain = useSetActiveChainWalletHooks()
  const setLastEvmActiveChain = useSetLastEvmActiveChain()
  const isAllChainsEnabled = useIsAllChainsEnabled()

  const [isActiveChainInitialized, setIsActiveChainInitialized] = useState<boolean>(false)

  useEffect(() => {
    browser.storage.local.get([ACTIVE_CHAIN, LAST_EVM_ACTIVE_CHAIN]).then((storage) => {
      if (!enabled) {
        return
      }

      let activeChain: SupportedChain = storage[ACTIVE_CHAIN]
      const leapFallbackChain = AGGREGATED_CHAIN_KEY as SupportedChain

      const defaultActiveChain = isCompassWallet() ? chainInfos.seiTestnet2.key : leapFallbackChain
      setLastEvmActiveChain(storage[LAST_EVM_ACTIVE_CHAIN] ?? 'ethereum')

      if (
        (activeChain as AggregatedSupportedChain) === AGGREGATED_CHAIN_KEY &&
        isAllChainsEnabled &&
        !isCompassWallet()
      ) {
        setActiveChain(activeChain)
        rootStore.setActiveChain(activeChain)
        setIsActiveChainInitialized(true)
        return
      }

      if (!activeChain || chains[activeChain] === undefined) {
        activeChain = defaultActiveChain
      }

      if (isCompassWallet() && !COMPASS_CHAINS.includes(activeChain)) {
        activeChain = defaultActiveChain
      }

      setActiveChain(activeChain)
      rootStore.setActiveChain(activeChain)
      setIsActiveChainInitialized(true)
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainInfos, chains, isAllChainsEnabled, enabled])

  useHandleWatchWalletChainSwitch(isActiveChainInitialized)
  useInitSelectedNetwork(isActiveChainInitialized)
}
