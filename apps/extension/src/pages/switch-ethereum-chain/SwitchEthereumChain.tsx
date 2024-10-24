import { useActiveWallet, useChainInfo, useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, Header, ThemeName, useTheme } from '@leapwallet/leap-ui'
import { ArrowRight } from '@phosphor-icons/react'
import assert from 'assert'
import PopupLayout from 'components/layout/popup-layout'
import { LoaderAnimation } from 'components/loader/Loader'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import {
  ACTIVE_CHAIN,
  BG_RESPONSE,
  LAST_EVM_ACTIVE_CHAIN,
  REDIRECT_REQUEST,
  SELECTED_NETWORK,
} from 'config/storage-keys'
import { useChainPageInfo } from 'hooks'
import { useActiveChain, useSetActiveChain } from 'hooks/settings/useActiveChain'
import { useSetNetwork } from 'hooks/settings/useNetwork'
import { Images } from 'images'
import { GenericLight } from 'images/logos'
import { addToConnections } from 'pages/ApproveConnection/utils'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { rootStore } from 'stores/root-store'
import { Colors } from 'theme/colors'
import { AggregatedSupportedChain } from 'types/utility'
import { formatWalletName } from 'utils/formatWalletName'
import { isCompassWallet } from 'utils/isCompassWallet'
import { isSidePanel } from 'utils/isSidePanel'
import { trim } from 'utils/strings'
import Browser from 'webextension-polyfill'

import { ChainDiv } from './components'

export default function SwitchEthereumChain() {
  const { theme } = useTheme()
  const activeChain = useActiveChain()
  const _chainInfo = useChainInfo()
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

  const activeWallet = useActiveWallet()
  const { topChainColor } = useChainPageInfo()

  const setActiveChain = useSetActiveChain()
  const setNetwork = useSetNetwork()

  assert(activeWallet !== null, 'activeWallet is null')
  const walletName = useMemo(() => {
    return formatWalletName(activeWallet.name)
  }, [activeWallet.name])

  const chains = useGetChains()
  const [isLoading, setIsLoading] = useState(false)
  const [requestedActiveChain, setRequestedActiveChain] = useState('')
  const [setNetworkTo, setSetNetworkTo] = useState()
  const navigate = useNavigate()
  const [origin, setOrigin] = useState<string>('')

  useEffect(() => {
    Browser.storage.local
      .get([REDIRECT_REQUEST])
      .then(async function initializeContractInfo(response) {
        const { requestedActiveChain, setNetworkTo, origin } = response[REDIRECT_REQUEST].msg
        setRequestedActiveChain(requestedActiveChain)
        setSetNetworkTo(setNetworkTo)
        setOrigin(origin)
      })
  }, [])

  const handleRejectClick = async () => {
    await Browser.storage.local.set({ [BG_RESPONSE]: { error: 'Rejected by the user.' } })

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
    setIsLoading(true)
    const requestedChainId =
      (setNetworkTo === 'testnet'
        ? chains[requestedActiveChain as SupportedChain]?.testnetChainId
        : chains[requestedActiveChain as SupportedChain]?.chainId) ?? ''

    await addToConnections([requestedChainId], [activeWallet.id], origin)
    await Browser.storage.local.set({
      [ACTIVE_CHAIN]: requestedActiveChain,
    })

    setActiveChain(requestedActiveChain as SupportedChain)
    rootStore.setActiveChain(requestedActiveChain as SupportedChain)
    if (chains[requestedActiveChain as SupportedChain]?.evmOnlyChain) {
      await Browser.storage.local.set({ [LAST_EVM_ACTIVE_CHAIN]: requestedActiveChain })
    }

    if (setNetworkTo) {
      setNetwork(setNetworkTo)
      await Browser.storage.local.set({
        [SELECTED_NETWORK]: setNetworkTo,
      })
    }

    await Browser.storage.local.set({
      [BG_RESPONSE]: { data: 'Approved' },
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
                    brandLogo={
                      isCompassWallet() ? (
                        <img className='w-[24px] h-[24px] mr-1' src={Images.Logos.CompassCircle} />
                      ) : undefined
                    }
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

            <div className='flex w-full p-8 items-center justify-between'>
              <ChainDiv
                src={chainInfo?.chainSymbolImageUrl ?? ''}
                bodyText={chainInfo?.chainName ?? ''}
                alt={chainInfo?.chainName + ' logo'}
              />

              <div className='bg-gray-100 dark:bg-gray-850 shrink-0 flex justify-center items-center w-[36px] h-[36px] rounded-full'>
                <ArrowRight size={24} className='dark:text-white-100 text-black-100' />
              </div>

              <ChainDiv
                src={chains[requestedActiveChain as SupportedChain]?.chainSymbolImageUrl ?? ''}
                bodyText={chains[requestedActiveChain as SupportedChain]?.chainName ?? ''}
                alt={chains[requestedActiveChain as SupportedChain]?.chainName + ' logo'}
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
