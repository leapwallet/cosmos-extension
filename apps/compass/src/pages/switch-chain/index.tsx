import { useActiveWallet, useChainInfo, useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, Header, ThemeName, useTheme } from '@leapwallet/leap-ui'
import { ArrowRight } from '@phosphor-icons/react'
import assert from 'assert'
import PopupLayout from 'components/layout/popup-layout'
import { LoaderAnimation } from 'components/loader/Loader'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { BG_RESPONSE, REDIRECT_REQUEST } from 'config/storage-keys'
import { getChainOriginStorageKey } from 'extension-scripts/utils'
import { useChainPageInfo, useWalletInfo } from 'hooks'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { Images } from 'images'
import { GenericLight } from 'images/logos'
import { addToConnections } from 'pages/ApproveConnection/utils'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Colors } from 'theme/colors'
import { AggregatedSupportedChain } from 'types/utility'
import { sendMessageToTab } from 'utils'
import { isCompassWallet } from 'utils/isCompassWallet'
import { isSidePanel } from 'utils/isSidePanel'
import { trim } from 'utils/strings'
import Browser from 'webextension-polyfill'

import { ChainDiv } from './components'

export default function SwitchChain() {
  const { theme } = useTheme()
  const chains = useGetChains()

  const activeWallet = useActiveWallet()
  const { topChainColor } = useChainPageInfo()
  const { walletAvatar, walletName } = useWalletInfo()

  assert(activeWallet !== null, 'activeWallet is null')

  const [isLoading, setIsLoading] = useState(false)
  const [existingChainId, setExistingChainId] = useState('')
  const [existingNetwork, setExistingNetwork] = useState<'mainnet' | 'testnet'>()
  const [requestedChainId, setRequestedChainId] = useState('')
  const [requestedChain, setRequestedChain] = useState<string>('movement')
  const [requestedNetwork, setRequestedNetwork] = useState<'mainnet' | 'testnet'>()
  const navigate = useNavigate()
  const [origin, setOrigin] = useState<string>('')

  const _activeChain = useActiveChain()
  const activeChain = useMemo(() => {
    if (existingChainId) {
      const chain = Object.values(chains).find(
        (chain) => chain.chainId === existingChainId || chain.testnetChainId === existingChainId,
      )
      if (chain) {
        return chain.key
      }
    }

    return _activeChain
  }, [existingChainId, _activeChain, chains])

  const _selectedNetwork = useSelectedNetwork()

  const selectedNetwork = useMemo(() => {
    if (existingNetwork) {
      return existingNetwork
    }

    return _selectedNetwork
  }, [existingNetwork, _selectedNetwork])

  const _chainInfo = useChainInfo(activeChain as SupportedChain)
  const chainInfo = useMemo(() => {
    if (_chainInfo) {
      return _chainInfo
    }

    if ((activeChain as AggregatedSupportedChain) === AGGREGATED_CHAIN_KEY) {
      return {
        chainName: 'All chains',
        chainSymbolImageUrl:
          theme === ThemeName.DARK
            ? Images.Misc.AggregatedViewDarkSvg
            : Images.Misc.AggregatedViewSvg,
      }
    }

    return {
      chainName: 'Unknown chain',
      chainSymbolImageUrl: '',
    }
  }, [_chainInfo, activeChain, theme])

  useEffect(() => {
    Browser.storage.local
      .get([REDIRECT_REQUEST])
      .then(async function initializeContractInfo(response) {
        const { chainId, existingChainId, origin } = response[REDIRECT_REQUEST].payload
        setRequestedChainId(chainId)
        setExistingChainId(existingChainId)
        setOrigin(origin)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (requestedChainId) {
      const chain = Object.values(chains).find(
        (chain) => chain.chainId === requestedChainId || chain.testnetChainId === requestedChainId,
      )
      if (chain) {
        setRequestedChain(chain.key)
        const _requestedNetwork = chain.testnetChainId === requestedChainId ? 'testnet' : 'mainnet'
        setRequestedNetwork(_requestedNetwork)
      }
    }
  }, [chains, requestedChainId])

  useEffect(() => {
    if (existingChainId) {
      const chain = Object.values(chains).find(
        (chain) => chain.chainId === existingChainId || chain.testnetChainId === existingChainId,
      )
      if (chain) {
        const _existingNetwork = chain.testnetChainId === existingChainId ? 'testnet' : 'mainnet'
        setExistingNetwork(_existingNetwork)
      }
    }
  }, [chains, existingChainId])

  const handleRejectClick = async () => {
    await Browser.storage.local.set({
      [BG_RESPONSE]: { success: false, error: 'Rejected by the user.' },
    })

    setTimeout(async () => {
      await Browser.storage.local.remove([REDIRECT_REQUEST])
      await Browser.storage.local.remove(BG_RESPONSE)
      if (isSidePanel()) {
        navigate('/home')
      } else {
        window.close()
      }
    }, 10)
  }

  const handleSwitchChainClick = async () => {
    if (!requestedChain) {
      return
    }

    setIsLoading(true)

    await addToConnections([requestedChainId], [activeWallet.id], origin)
    const storageKey = getChainOriginStorageKey(origin, 'aptos-')

    await Browser.storage.local.set({
      [storageKey]: {
        chainKey: requestedChain,
        network: requestedNetwork,
      },
    })
    await sendMessageToTab({
      event: 'leap_activeChainInfoChanged',
      data: {
        chainId: requestedChainId,
        network: requestedNetwork,
        restUrl:
          requestedNetwork === 'testnet'
            ? chains[requestedChain as SupportedChain]?.apis?.restTest
            : chains[requestedChain as SupportedChain]?.apis?.rest,
        rpcUrl:
          requestedNetwork === 'testnet'
            ? chains[requestedChain as SupportedChain]?.apis?.rpcTest
            : chains[requestedChain as SupportedChain]?.apis?.rpc,
        chainKey: requestedChain,
      },
    })
    await Browser.storage.local.set({
      [BG_RESPONSE]: { success: true, chainId: requestedChainId },
    })

    setTimeout(async () => {
      await Browser.storage.local.remove([REDIRECT_REQUEST])
      await Browser.storage.local.remove(BG_RESPONSE)

      setIsLoading(false)
      if (isSidePanel()) {
        navigate('/home')
      } else {
        window.close()
      }
    }, 50)
  }

  return (
    <div className='w-[400px] h-full relative self-center justify-self-center flex justify-center items-center mt-2'>
      <div className='panel-height relative w-full overflow-clip rounded-md border border-gray-300 dark:border-gray-900'>
        <PopupLayout
          header={
            <div className='w-[396px]'>
              <Header
                imgSrc={chainInfo?.chainSymbolImageUrl ?? GenericLight}
                title={
                  <Buttons.Wallet
                    brandLogo={<div className='mr-1.5'>{walletAvatar}</div>}
                    title={trim(walletName, 10)}
                    className='pr-4 cursor-default'
                  />
                }
              />
            </div>
          }
        >
          <div className='px-7 py-3 overflow-y-auto relative h-[450px]'>
            <h2 className='text-center text-lg font-bold dark:text-white-100 text-gray-900 w-full'>
              Allow this site to switch the chain?
            </h2>

            <p className='text-center text-sm dark:text-gray-300 text-gray-500 w-full'>
              This will switch the selected chain within {isCompassWallet() ? 'Compass' : 'Leap'} to
              a previously added chain:
            </p>

            <div className='flex w-full p-8 items-start justify-between'>
              <ChainDiv
                src={chainInfo?.chainSymbolImageUrl ?? ''}
                bodyText={chainInfo?.chainName ?? ''}
                alt={chainInfo?.chainName + ' logo'}
                network={selectedNetwork}
              />

              <div className='flex items-center justify-center shrink-- w-[36px] h-[36px]'>
                <div className='bg-gray-100 dark:bg-gray-850 flex justify-center items-center w-[24px] h-[24px] rounded-full'>
                  <ArrowRight size={16} className='dark:text-white-100 text-black-100' />
                </div>
              </div>

              <ChainDiv
                src={chains[requestedChain as SupportedChain]?.chainSymbolImageUrl ?? ''}
                bodyText={chains[requestedChain as SupportedChain]?.chainName ?? ''}
                alt={chains[requestedChain as SupportedChain]?.chainName + ' logo'}
                network={requestedNetwork}
              />
            </div>
          </div>

          <div className='absolute bottom-[36px] left-0 py-3 px-7 dark:bg-black-100 bg-gray-50 w-full'>
            <div className='flex items-center justify-center w-full space-x-3'>
              <Buttons.Generic
                title='Reject Button'
                color={Colors.gray900}
                onClick={handleRejectClick}
                disabled={isLoading}
              >
                Reject
              </Buttons.Generic>

              <Buttons.Generic
                title='Approve Button'
                color={topChainColor}
                onClick={handleSwitchChainClick}
                disabled={isLoading}
                className={`${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {isLoading ? <LoaderAnimation color='white' /> : 'Switch chain'}
              </Buttons.Generic>
            </div>
          </div>
        </PopupLayout>
      </div>
    </div>
  )
}
