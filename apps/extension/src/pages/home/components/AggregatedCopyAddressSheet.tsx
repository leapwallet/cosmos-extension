import { sliceAddress, useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { AggregatedChainsStore } from '@leapwallet/cosmos-wallet-store'
import { AggregatedNullComponents } from 'components/aggregated'
import BottomModal from 'components/bottom-modal'
import { CopyAddressCard } from 'components/card'
import NoSearchResults from 'components/no-search-results'
import { SearchInput } from 'components/search-input'
import { PriorityChains } from 'config/constants'
import { useWalletInfo } from 'hooks'
import { useGetWalletAddresses } from 'hooks/useGetWalletAddresses'
import { RightArrowSvg } from 'images/misc'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { CopyAddressSheet } from './index'

type AggregatedWalletAddresses = {
  [chain: string]: string[]
}

type FetchChainWalletAddressesProps = {
  chain: SupportedChain
  setWalletAddresses: React.Dispatch<React.SetStateAction<AggregatedWalletAddresses>>
}

const FetchChainWalletAddresses = React.memo(
  ({ chain, setWalletAddresses }: FetchChainWalletAddressesProps) => {
    const walletAddresses = useGetWalletAddresses(chain)

    useEffect(() => {
      setWalletAddresses((prev) => ({ ...prev, [chain]: walletAddresses }))
    }, [chain, setWalletAddresses, walletAddresses])

    return null
  },
)

FetchChainWalletAddresses.displayName = 'FetchChainWalletAddresses'

type AggregatedCopyAddressSheetProps = {
  isVisible: boolean
  onClose: (refetch?: boolean) => void
  aggregatedChainsStore: AggregatedChainsStore
}

const AggregatedCopyAddressSheet = React.memo(
  ({ isVisible, onClose, aggregatedChainsStore }: AggregatedCopyAddressSheetProps) => {
    const [walletAddresses, setWalletAddresses] = useState<AggregatedWalletAddresses>({})
    const { walletAvatar, walletName } = useWalletInfo()
    const chains = useGetChains()
    const [showCopyAddressSheet, setShowCopyAddressSheet] = useState(false)
    const [selectedChain, setSelectedChain] = useState<SupportedChain>('cosmos')
    const [searchQuery, setSearchQuery] = useState('')

    const Title = useMemo(() => {
      return (
        <h3 className='flex items-center justify-center gap-2'>
          <img className='w-[20px] h-[20px]' src={walletAvatar} alt='wallet avatar' />

          <span
            className='dark:text-white-100 text-black-100 truncate text-[18px] font-bold max-w-[196px]'
            title={walletName}
          >
            {walletName}
          </span>
        </h3>
      )
    }, [walletAvatar, walletName])

    const handleDifferentIconClick = useCallback(
      (chain: SupportedChain) => {
        if (walletAddresses[chain].length > 1) {
          setShowCopyAddressSheet(true)
          setSelectedChain(chain)
        }
      },
      [walletAddresses],
    )

    const handleCopyAddressSheetClose = useCallback(() => {
      setShowCopyAddressSheet(false)
      setSelectedChain('cosmos')
    }, [])

    const sortedWalletAddresses = useMemo(() => {
      const _chains = Object.keys(walletAddresses).map((chain) => ({
        chain: chain as SupportedChain,
        addresses: walletAddresses[chain],
      }))

      const priorityChains = _chains
        .filter((chain) => PriorityChains.includes(chain.chain))
        .sort(
          (chainA, chainB) =>
            PriorityChains.indexOf(chainA.chain) - PriorityChains.indexOf(chainB.chain),
        )

      const otherChains = _chains
        .filter((chain) => !PriorityChains.includes(chain.chain))
        .sort((chainA, chainB) => chainA.chain.localeCompare(chainB.chain))

      return [...priorityChains, ...otherChains]
    }, [walletAddresses])

    const filteredWalletAddresses: { chain: SupportedChain; addresses: string[] }[] =
      useMemo(() => {
        if (searchQuery?.length > 0) {
          return sortedWalletAddresses.filter((chain) => {
            const chainName = chains[chain.chain]?.chainName
            return (chainName ?? chain.chain).toLowerCase().includes(searchQuery.toLowerCase())
          })
        } else {
          return sortedWalletAddresses
        }
      }, [chains, searchQuery, sortedWalletAddresses])

    return (
      <>
        <AggregatedNullComponents
          setAggregatedStore={setWalletAddresses}
          aggregatedChainsStore={aggregatedChainsStore}
          render={({ key, chain, setAggregatedStore }) => (
            <FetchChainWalletAddresses
              key={key}
              chain={chain}
              setWalletAddresses={setAggregatedStore}
            />
          )}
        />

        <BottomModal
          isOpen={isVisible}
          onClose={onClose}
          closeOnBackdropClick={true}
          titleComponent={Title}
          title=''
          contentClassName='[&>div:first-child>div:last-child]:-mt-[2px]'
        >
          <SearchInput
            placeholder='Search for a chain'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
          />
          <div
            className='flex flex-col items-center justif-center gap-4 h-[375px] w-full'
            style={{ overflowY: 'scroll' }}
          >
            {filteredWalletAddresses?.length > 0 ? (
              filteredWalletAddresses.map(({ chain, addresses }, index) => {
                const chainInfo = chains[chain]

                if (addresses.length > 1) {
                  const address =
                    sliceAddress(addresses[0], 5) + ', ' + sliceAddress(addresses[1], 5)

                  return (
                    <CopyAddressCard
                      key={`${addresses[0]}-${index}`}
                      address={address}
                      forceChain={chain}
                      showDifferentIconForButton={true}
                      DifferentIconToShow={
                        <RightArrowSvg className='w-[16px] h-[16px] fill-white-100' />
                      }
                      differentIconButtonClassName='cursor-pointer'
                      forceName={chainInfo.chainName}
                      differentIconButtonOnClick={() => handleDifferentIconClick(chain)}
                    />
                  )
                }

                return (
                  <CopyAddressCard
                    address={addresses[0]}
                    key={`${addresses[0]}-${index}`}
                    forceChain={chain}
                    forceName={chainInfo.chainName}
                  />
                )
              })
            ) : (
              <NoSearchResults searchQuery={searchQuery} />
            )}
          </div>
        </BottomModal>

        <CopyAddressSheet
          isVisible={showCopyAddressSheet}
          onClose={handleCopyAddressSheetClose}
          walletAddresses={walletAddresses[selectedChain] ?? []}
          forceChain={selectedChain}
        />
      </>
    )
  },
)

AggregatedCopyAddressSheet.displayName = 'AggregatedCopyAddressSheet'
export { AggregatedCopyAddressSheet }
