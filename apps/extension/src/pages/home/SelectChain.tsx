import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/constants'
import { CardDivider, HeaderActionType } from '@leapwallet/leap-ui'
import { EmptyCard } from 'components/empty-card'
import { ManageChainSettings, useManageChainData } from 'hooks/settings/useManageChains'
import { useChainInfos } from 'hooks/useChainInfos'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import { GenericLight } from 'images/logos'
import React, { Fragment, useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getChainName } from 'utils/getChainName'
import { imgOnError } from 'utils/imgOnError'
import { sliceSearchWord } from 'utils/strings'
import extension from 'webextension-polyfill'

import BottomSheet from '../../components/bottom-sheet/BottomSheet'
import Text from '../../components/text'
import { useActiveChain, useSetActiveChain } from '../../hooks/settings/useActiveChain'
import { Colors } from '../../theme/colors'

export type ListChainsProps = {
  // eslint-disable-next-line no-unused-vars
  onChainSelect: (chainName: SupportedChain) => void
  selectedChain: SupportedChain
  onPage?: 'AddCollection'
}

export function ListChains({ onChainSelect, selectedChain, onPage }: ListChainsProps) {
  const [chains] = useManageChainData()
  const chainInfos = useChainInfos()
  const defaultTokenLogo = useDefaultTokenLogo()
  const [searchedChain, setSearchedChain] = useState('')

  const filteredChains = useMemo(() => {
    return chains.filter(function (chain) {
      if (onPage === 'AddCollection' && ['omniflix', 'stargaze'].includes(chain.chainName)) {
        return false
      }

      const chainName = chain.chainName === 'impacthub' ? 'ixo' : chain.chainName
      return chainName.toLowerCase().includes(searchedChain.toLowerCase())
    })
  }, [chains, onPage, searchedChain])

  return (
    <>
      <div className='flex h-10 bg-white-100 dark:bg-gray-900 rounded-[30px] py-2 pl-5 pr-[10px] mb-4 mt-5 w-[344px] mx-auto'>
        <input
          placeholder='Search'
          className='flex flex-grow text-base text-gray-600 dark:text-gray-400 outline-none bg-white-0'
          value={searchedChain}
          onChange={(event) => setSearchedChain(event.target.value)}
          data-testing-id='switch-chain-input-search'
        />
        <img src={Images.Misc.SearchIcon} />
      </div>

      <div className='flex flex-col rounded-2xl bg-white-100 dark:bg-gray-900 mx-7 mb-4 mt-4'>
        {filteredChains.length === 0 ? (
          <EmptyCard
            isRounded
            subHeading='Please try again with something else'
            src={Images.Misc.Explore}
            heading={`No results for ${sliceSearchWord(searchedChain)}`}
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
                chainInfos[chain.chainName as SupportedChain].chainSymbolImageUrl ?? GenericLight
              const chainName = chainInfos[chain.chainName as unknown as SupportedChain].chainName
              const isLast = index === array.length - 1

              return (
                <React.Fragment key={chain.chainName}>
                  <div
                    onClick={() => {
                      setSearchedChain('')
                      onChainSelect(chain.chainName)
                    }}
                    key={chain.chainName}
                    className='flex flex-1 items-center px-4 py-2 cursor-pointer'
                  >
                    <div className='flex items-center'>
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
                      {chain.beta && (
                        <span className='text-sm font-bold text-green-600 bg-green-800 py-1 px-3 rounded-[14px]'>
                          Added
                        </span>
                      )}

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

  const onChainSelect = (chainName: SupportedChain) => {
    setActiveChain(chainName)
    navigate('/home')
    onClose()
  }

  const handleAddNewChainClick = useCallback(() => {
    const views = extension.extension.getViews({ type: 'popup' })
    if (views.length === 0) navigate('/add-chain', { replace: true })
    else window.open(extension.runtime.getURL('index.html#/add-chain'))

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onClose}
      headerTitle='Switch Chains'
      headerActionType={HeaderActionType.CANCEL}
      closeOnClickBackDrop={true}
    >
      <Fragment>
        <ListChains onChainSelect={onChainSelect} selectedChain={selectedChain} />

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
          <button
            className='w-full flex items-center p-4 bg-white-100 dark:bg-gray-900 cursor-pointer'
            onClick={() => navigate('/manageChain')}
          >
            <span className='material-icons-round text-gray-400 mr-4 text-lg'>tune</span>
            <Text size='md' className='font-bold'>
              Manage Chains
            </Text>
          </button>
        </div>
      </Fragment>
    </BottomSheet>
  )
}
