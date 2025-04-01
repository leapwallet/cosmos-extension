import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import BottomModal from 'components/bottom-modal'
import { EmptyCard } from 'components/empty-card'
import { PriorityChains } from 'config/constants'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useChainInfos } from 'hooks/useChainInfos'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ManageChainSettings, manageChainsStore } from 'stores/manage-chains-store'
import { starredChainsStore } from 'stores/starred-chains-store'
import { AggregatedSupportedChain } from 'types/utility'
import { isCompassWallet } from 'utils/isCompassWallet'

import { useActiveChain, useSetActiveChain } from '../../hooks/settings/useActiveChain'
import { ChainCardWrapper } from './ChainCardWrapper'

export type ListChainsProps = {
  onChainSelect: (chainName: SupportedChain) => void
  selectedChain: SupportedChain
  onPage?: 'AddCollection'
  chainsToShow?: string[]
  searchedChain?: string
  setSearchedChain?: (val: string) => void
  showAggregatedOption?: boolean
  handleAddNewChainClick?: VoidFunction | null
}

export const ListChains = observer(
  ({
    onChainSelect,
    selectedChain,
    onPage,
    chainsToShow,
    searchedChain: paramsSearchedChain,
    setSearchedChain: paramsSetSearchedChain,
    showAggregatedOption = false,
    handleAddNewChainClick,
  }: ListChainsProps) => {
    const { activeWallet } = useActiveWallet()

    const searchedChain = paramsSearchedChain ?? ''

    const chainInfos = useChainInfos()

    const showChains = manageChainsStore.chains

    const _filteredChains = useMemo(() => {
      return showChains.filter(function (chain) {
        if (
          (isCompassWallet() && chain.chainName === 'cosmos') ||
          !chain.active ||
          (onPage === 'AddCollection' &&
            [
              'omniflix',
              'stargaze',
              'forma',
              'manta',
              'aura',
              'mainCoreum',
              'coreum',
              'lightlink',
            ].includes(chain.chainName))
        ) {
          return false
        }

        if (
          chainsToShow &&
          chainsToShow.length &&
          !chainsToShow.includes(chainInfos[chain.chainName]?.chainRegistryPath)
        ) {
          return false
        }

        const chainName = chainInfos[chain.chainName]?.chainName ?? chain.chainName
        return chainName.toLowerCase().includes(searchedChain.toLowerCase())
      })
    }, [chainInfos, showChains, chainsToShow, onPage, searchedChain])

    const filteredChains = useMemo(() => {
      const chains = _filteredChains

      const favouriteChains = chains
        .filter((chain) => starredChainsStore.chains.includes(chain.chainName))
        .sort((chainA, chainB) => chainA.chainName.localeCompare(chainB.chainName))

      const priorityChains = chains
        .filter(
          (chain) =>
            PriorityChains.includes(chain.chainName) &&
            !starredChainsStore.chains.includes(chain.chainName),
        )
        .sort(
          (chainA, chainB) =>
            PriorityChains.indexOf(chainA.chainName) - PriorityChains.indexOf(chainB.chainName),
        )

      const otherChains = chains
        .filter(
          (chain) =>
            !starredChainsStore.chains.includes(chain.chainName) &&
            !PriorityChains.includes(chain.chainName),
        )
        .sort((chainA, chainB) => chainA.chainName.localeCompare(chainB.chainName))

      const chainsList = [...favouriteChains, ...priorityChains, ...otherChains]
      if (activeWallet?.watchWallet) {
        const walletChains = new Set(Object.keys(activeWallet.addresses))
        return chainsList.sort((a, b) =>
          walletChains.has(a.chainName) === walletChains.has(b.chainName)
            ? 0
            : walletChains.has(a.chainName)
            ? -1
            : 1,
        )
      }

      return chainsList
    }, [_filteredChains, activeWallet?.addresses, activeWallet?.watchWallet])

    const handleClick = (chainName: AggregatedSupportedChain) => {
      onChainSelect(chainName as SupportedChain)
    }

    return (
      <>
        {filteredChains.length == 0 ? (
          <EmptyCard
            isRounded
            subHeading='Try a different search term'
            src={Images.Misc.Explore}
            heading={`No results found`}
            data-testing-id='switch-chain-empty-card-heading-ele'
          />
        ) : (
          filteredChains.map((chain: ManageChainSettings, index: number) => (
            <ChainCardWrapper
              key={chain.chainName + index}
              chain={chain}
              handleClick={handleClick}
              selectedChain={selectedChain}
              onPage={onPage}
              index={index}
              showStars
            />
          ))
        )}
      </>
    )
  },
)

type ChainSelectorProps = {
  readonly isVisible: boolean
  readonly onClose: VoidFunction
}

const SelectChain = observer(({ isVisible, onClose }: ChainSelectorProps) => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const selectedChain = useActiveChain()
  const setActiveChain = useSetActiveChain()
  const [searchedChain, setSearchedChain] = useState('')

  const onChainSelect = (chainName: AggregatedSupportedChain) => {
    setActiveChain(chainName)
    if (pathname !== '/home') {
      navigate('/home')
    }
    onClose()
  }

  const handleAddNewChainClick = useCallback(() => {
    navigate('/add-chain', { replace: true })
  }, [navigate])

  return (
    <BottomModal
      isOpen={isVisible}
      onClose={onClose}
      title='Switch chain'
      containerClassName={`h-[calc(100%-${isCompassWallet() ? '102px' : '34px'})]`}
      className='max-h-[calc(100%-69px)]'
    >
      <ListChains
        onChainSelect={onChainSelect}
        selectedChain={selectedChain}
        searchedChain={searchedChain}
        setSearchedChain={(val) => setSearchedChain(val)}
        showAggregatedOption={true}
        handleAddNewChainClick={isCompassWallet() ? null : handleAddNewChainClick}
      />
    </BottomModal>
  )
})

export default SelectChain
