import { useCustomChains } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/browser/constants'
import { CardDivider } from '@leapwallet/leap-ui'
import { captureException } from '@sentry/react'
import BottomModal from 'components/bottom-modal'
import { EmptyCard } from 'components/empty-card'
import { SearchInput } from 'components/search-input'
import { ButtonName, ButtonType, EventName } from 'config/analytics'
import { ManageChainSettings, useManageChainData } from 'hooks/settings/useManageChains'
import { useChainInfos } from 'hooks/useChainInfos'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import { GenericLight } from 'images/logos'
import mixpanel from 'mixpanel-browser'
import React, { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getChainName } from 'utils/getChainName'
import { imgOnError } from 'utils/imgOnError'
import { isCompassWallet } from 'utils/isCompassWallet'
import extension from 'webextension-polyfill'

import Text from '../../components/text'
import { useActiveChain, useSetActiveChain } from '../../hooks/settings/useActiveChain'
import { Colors } from '../../theme/colors'
import AddFromChainStore from './AddFromChainStore'

export type ListChainsProps = {
  onChainSelect: (chainName: SupportedChain) => void
  selectedChain: SupportedChain
  onPage?: 'AddCollection'
  chainsToShow?: string[]
  searchedChain?: string
  setSearchedChain?: (val: string) => void
}

export function ListChains({
  onChainSelect,
  selectedChain,
  onPage,
  chainsToShow,
  searchedChain: paramsSearchedChain,
  setSearchedChain: paramsSetSearchedChain,
}: ListChainsProps) {
  const [newChain, setNewChain] = useState<string | null>(null)
  const [newSearchedChain, setNewSearchedChain] = useState('')
  const customChains = isCompassWallet() ? [] : useCustomChains()

  const searchedChain = paramsSearchedChain ?? newSearchedChain
  const setSearchedChain = paramsSetSearchedChain ?? setNewSearchedChain

  const [chains] = useManageChainData()
  const chainInfos = useChainInfos()
  const defaultTokenLogo = useDefaultTokenLogo()

  const allNativeChainID = Object.values(chainInfos)
    .filter((chain) => chain.enabled)
    .map((chain) => chain.chainId)

  const _customChains: ManageChainSettings[] = customChains
    .filter((d) => !allNativeChainID.includes(d.chainId))
    .sort((a, b) => a.chainName.localeCompare(b.chainName))
    .map((d, index) => ({
      active: d.enabled,
      beta: undefined,
      chainName: d.chainName as SupportedChain,
      denom: d.denom,
      id: 100 + index,
      preferenceOrder: 100 + index,
    }))

  const showChains = useMemo(
    () => (searchedChain?.length > 0 ? [...chains, ..._customChains] : chains),
    [_customChains, chains, searchedChain?.length],
  )

  const filteredChains = useMemo(() => {
    return showChains
      .filter(function (chain) {
        if (
          chainsToShow &&
          chainsToShow.length &&
          !chainsToShow.includes(chainInfos[chain.chainName]?.chainRegistryPath)
        ) {
          return false
        }

        if (onPage === 'AddCollection' && ['omniflix', 'stargaze'].includes(chain.chainName)) {
          return false
        }

        const chainName = chainInfos[chain.chainName]?.chainName ?? chain.chainName
        return chainName.toLowerCase().includes(searchedChain.toLowerCase())
      })
      .filter((chain) => {
        return !(isCompassWallet() && chain.chainName === 'cosmos')
      })
  }, [chainInfos, showChains, chainsToShow, onPage, searchedChain])

  return (
    <>
      <div className='flex flex-col items-center h-full'>
        <SearchInput
          value={searchedChain}
          onChange={(e) => setSearchedChain(e.target.value)}
          data-testing-id='switch-chain-input-search'
          placeholder='Search chains...'
          onClear={() => setSearchedChain('')}
        />
      </div>

      <div
        className='bg-white-100 dark:bg-gray-900 rounded-2xl max-h-[400px] w-full'
        style={{ overflowY: 'scroll' }}
      >
        {filteredChains.length === 0 ? (
          <EmptyCard
            isRounded
            subHeading='Try a different search term'
            src={Images.Misc.Explore}
            heading={`No results found`}
            data-testing-id='switch-chain-empty-card-heading-ele'
          />
        ) : (
          filteredChains
            .filter((chains) => chains.active)
            .map((chain: ManageChainSettings, index: number, array) => {
              if (!chain) {
                return null
              }
              const img =
                chainInfos[chain.chainName as SupportedChain]?.chainSymbolImageUrl ??
                customChains.find((d) => d.chainName === chain.chainName)?.chainSymbolImageUrl ??
                GenericLight
              const chainName =
                chainInfos[chain.chainName as unknown as SupportedChain]?.chainName ??
                chain.chainName
              const isLast = index === array.length - 1

              return (
                <React.Fragment key={chain.chainName + index}>
                  <div
                    onClick={() => {
                      if (chain.beta === undefined) {
                        return
                      }
                      setSearchedChain('')
                      onChainSelect(chain.chainName)
                    }}
                    className='flex flex-1 items-center px-4 py-2 cursor-pointer'
                  >
                    <div className='flex items-center flex-1'>
                      <img
                        src={img ?? defaultTokenLogo}
                        className='h-10 w-10 mr-3'
                        onError={imgOnError(defaultTokenLogo)}
                      />
                      <Text
                        size='md'
                        className='font-bold'
                        data-testing-id={`switch-chain-${chainName.toLowerCase()}-ele`}
                      >
                        {onPage === 'AddCollection' ? getChainName(chainName) : chainName}
                      </Text>
                    </div>
                    <div className='ml-auto flex items-center'>
                      {chain.beta === undefined ? ( //TODO: check for already addded chains
                        <span
                          className='flex items-center gap-1 text-xs font-bold cursor-pointer border border-black-100 dark:border-white-100 text-black-100 dark:text-white-100 py-[5px] pl-[6px] pr-3 rounded-[14px]'
                          onClick={() => setNewChain(chain.chainName)}
                        >
                          <span className='material-icons-round' style={{ fontSize: 16 }}>
                            add
                          </span>{' '}
                          Add Chain
                        </span>
                      ) : chain.beta ? (
                        <span className='text-sm font-bold text-green-500/90 dark:text-green-600 bg-green-300/30 dark:bg-green-800 py-1 px-3 rounded-[14px]'>
                          Custom
                        </span>
                      ) : null}

                      {selectedChain === chain.chainName ? (
                        <span
                          className='material-icons-round ml-2'
                          style={{ color: Colors.getChainColor(selectedChain) }}
                        >
                          check_circle
                        </span>
                      ) : null}
                    </div>{' '}
                  </div>
                  {!isLast && <CardDivider />}
                </React.Fragment>
              )
            })
        )}
      </div>
      {!!newChain && (
        <AddFromChainStore
          isVisible={!!newChain}
          onClose={() => setNewChain(null)}
          newAddChain={customChains.find((d) => d.chainName === newChain)}
        />
      )}
    </>
  )
}

type ChainSelectorProps = {
  readonly isVisible: boolean
  readonly onClose: VoidFunction
}

export default function SelectChain({ isVisible, onClose }: ChainSelectorProps) {
  const navigate = useNavigate()
  const selectedChain = useActiveChain()
  const setActiveChain = useSetActiveChain()
  const [searchedChain, setSearchedChain] = useState('')

  const onChainSelect = (chainName: SupportedChain) => {
    setActiveChain(chainName)
    navigate('/home')
    onClose()
  }

  const trackCTAEvent = (buttonName: string, redirectURL?: string) => {
    if (!isCompassWallet()) {
      try {
        mixpanel.track(EventName.ButtonClick, {
          buttonType: ButtonType.CHAIN_MANAGEMENT,
          buttonName,
          redirectURL,
          time: Date.now() / 1000,
        })
      } catch (e) {
        captureException(e)
      }
    }
  }

  const handleAddNewChainClick = useCallback(() => {
    const views = extension.extension.getViews({ type: 'popup' })
    if (views.length === 0) navigate('/add-chain', { replace: true })
    else window.open(extension.runtime.getURL('index.html#/add-chain'))
  }, [navigate])

  return (
    <BottomModal
      isOpen={isVisible}
      onClose={onClose}
      closeOnBackdropClick={true}
      title='Switch Chains'
    >
      <ListChains
        onChainSelect={onChainSelect}
        selectedChain={selectedChain}
        searchedChain={searchedChain}
        setSearchedChain={(val) => setSearchedChain(val)}
      />

      {isCompassWallet() ? null : (
        <div className='w-[344px] mt-4 mb-4 mx-auto rounded-2xl overflow-hidden'>
          <button
            className='w-full flex items-center p-4 bg-white-100 dark:bg-gray-900 cursor-pointer'
            onClick={handleAddNewChainClick}
          >
            <span className='material-icons-round text-gray-400 mr-4 text-lg'>add_circle</span>
            <Text size='md' className='font-bold'>
              Add new chain
            </Text>
          </button>
          {!searchedChain?.length && (
            <button
              className='w-full flex items-center p-4 bg-white-100 dark:bg-gray-900 cursor-pointer'
              onClick={() => {
                navigate('/manageChain')
                trackCTAEvent(ButtonName.MANAGE_CHAIN, '/manageChain')
              }}
            >
              <span className='material-icons-round text-gray-400 mr-4 text-lg'>tune</span>
              <Text size='md' className='font-bold'>
                Manage Chains
              </Text>
            </button>
          )}
        </div>
      )}
    </BottomModal>
  )
}
