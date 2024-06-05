import {
  getSeiEvmInfo,
  Key,
  SeiEvmInfoEnum,
  SelectedNetworkType,
  useActiveChain as useActiveChainWalletHooks,
  useGetChains,
  usePendingTxState,
  useSetActiveChain as useSetActiveChainWalletHooks,
  useSetSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfo, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useQueryClient } from '@tanstack/react-query'
import { COMPASS_CHAINS } from 'config/config'
import { ACTIVE_CHAIN, KEYSTORE } from 'config/storage-keys'
import { useSetNetwork } from 'hooks/settings/useNetwork'
import { useChainInfos } from 'hooks/useChainInfos'
import { useEffect } from 'react'
import { useSetRecoilState } from 'recoil'
import { sendMessageToTab } from 'utils'
import browser from 'webextension-polyfill'

import { selectedChainAlertState } from '../../atoms/selected-chain-alert'
import { isCompassWallet } from '../../utils/isCompassWallet'
import useActiveWallet, { useUpdateKeyStore } from './useActiveWallet'

export function useActiveChain(): SupportedChain {
  return useActiveChainWalletHooks()
}

export function useSetActiveChain() {
  const chainInfos = useGetChains()
  const setSelectedChainAlert = useSetRecoilState(selectedChainAlertState)
  const { setPendingTx } = usePendingTxState()
  const setNetwork = useSetNetwork()
  const setSelectedNetwork = useSetSelectedNetwork()

  const updateKeyStore = useUpdateKeyStore()
  const { activeWallet, setActiveWallet } = useActiveWallet()
  const setActiveChain = useSetActiveChainWalletHooks()

  const queryClient = useQueryClient()

  return async (chain: SupportedChain, chainInfo?: ChainInfo) => {
    const storage = await browser.storage.local.get(['networkMap', KEYSTORE])
    const keystore = storage[KEYSTORE]
    if (keystore) {
      const shouldUpdateKeystore = Object.keys(keystore).some((key) => {
        const wallet = keystore[key]
        return wallet && (!wallet.addresses[chain] || !wallet.pubKeys?.[chain])
      })
      if (activeWallet && shouldUpdateKeystore) {
        const updatedKeystore = await updateKeyStore(activeWallet, chain)
        await setActiveWallet(updatedKeystore[activeWallet.id] as Key)
      }
    }

    await queryClient.cancelQueries()
    setActiveChain(chain)
    setSelectedChainAlert(true)
    browser.storage.local.set({ [ACTIVE_CHAIN]: chain })
    setPendingTx(null)

    const networkMap = JSON.parse(storage.networkMap ?? '{}')
    const _chainInfo = chainInfos[chain] || chainInfo
    let _network: SelectedNetworkType = 'mainnet'

    if (chain === 'seiDevnet') {
      setSelectedNetwork('mainnet')
      setNetwork('mainnet')
    } else {
      if (networkMap[chain]) {
        let network = networkMap[chain]
        let hasChainOnlyTestnet = false

        if (_chainInfo && !_chainInfo?.beta && _chainInfo?.chainId === _chainInfo?.testnetChainId) {
          hasChainOnlyTestnet = true
        }

        if (hasChainOnlyTestnet && network !== 'testnet') {
          network = 'testnet'
          _network = 'testnet'
        }

        setNetwork(network)
        setSelectedNetwork(network)
      } else if (_chainInfo && _chainInfo?.apis?.rpc) {
        setNetwork('mainnet')
        setSelectedNetwork('mainnet')
      } else if (_chainInfo && _chainInfo?.apis?.rpcTest) {
        setNetwork('testnet')
        setSelectedNetwork('testnet')
        _network = 'testnet'
      }
    }

    if (isCompassWallet()) {
      const chainId = await getSeiEvmInfo({
        activeChain: chain as 'seiDevnet' | 'seiTestnet2',
        activeNetwork: _network,
        infoType: SeiEvmInfoEnum.EVM_CHAIN_ID,
      })
      await sendMessageToTab({ event: 'chainChanged', data: chainId })
    }
  }
}

export function useInitActiveChain() {
  const chainInfos = useChainInfos()
  const chains = useGetChains()
  const setActiveChain = useSetActiveChainWalletHooks()

  useEffect(() => {
    browser.storage.local.get(ACTIVE_CHAIN).then((storage) => {
      let activeChain: SupportedChain = storage[ACTIVE_CHAIN]
      const defaultActiveChain = isCompassWallet()
        ? chainInfos.seiTestnet2.key
        : chainInfos.cosmos.key

      if (!activeChain || chains[activeChain] === undefined) {
        activeChain = defaultActiveChain
      }

      if (isCompassWallet() && !COMPASS_CHAINS.includes(activeChain)) {
        activeChain = defaultActiveChain
      }

      setActiveChain(activeChain)
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainInfos, chains])
}
