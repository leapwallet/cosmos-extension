import { useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { AggregatedChainsStore } from '@leapwallet/cosmos-wallet-store'
import { MagnifyingGlassMinus } from '@phosphor-icons/react'
import { AggregatedNullComponents } from 'components/aggregated'
import { CopyAddressCard } from 'components/card'
import BottomModal from 'components/new-bottom-modal'
import { SearchInput } from 'components/ui/input/search-input'
import { PriorityChains } from 'config/constants'
import { useWalletInfo } from 'hooks'
import { useGetWalletAddresses } from 'hooks/useGetWalletAddresses'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from 'utils/cn'

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

const RemoveChainWalletAddresses = React.memo(
  ({ chain, setWalletAddresses }: FetchChainWalletAddressesProps) => {
    useEffect(() => {
      setWalletAddresses((prev) => {
        const updatedAddresses = { ...prev }
        delete updatedAddresses[chain]
        return updatedAddresses
      })
    }, [chain, setWalletAddresses])

    return null
  },
)

RemoveChainWalletAddresses.displayName = 'RemoveChainWalletAddresses'

type AggregatedCopyAddressSheetProps = {
  isVisible: boolean
  onClose: (refetch?: boolean) => void
  aggregatedChainsStore: AggregatedChainsStore
}

const AggregatedCopyAddressSheet = React.memo(
  ({ isVisible, onClose, aggregatedChainsStore }: AggregatedCopyAddressSheetProps) => {
    const searchInputRef = useRef<HTMLInputElement>(null)
    const [walletAddresses, setWalletAddresses] = useState<AggregatedWalletAddresses>({})
    const { walletAvatar, walletName } = useWalletInfo()
    const chains = useGetChains()
    const [showCopyAddressSheet, setShowCopyAddressSheet] = useState(false)
    const [selectedChain, setSelectedChain] = useState<SupportedChain>('cosmos')
    const [searchQuery, setSearchQuery] = useState('')

    const Title = useMemo(() => {
      return (
        <h3 className='flex items-center justify-center gap-2 h-10 bg-secondary-200 rounded-full px-5 py-2'>
          <img className='w-[24px] h-[24px]' src={walletAvatar} alt='wallet avatar' />

          <span
            className='text-foreground truncate text-md !leading-[22px] font-bold max-w-[196px]'
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

    useEffect(() => {
      if (isVisible) {
        setTimeout(() => {
          searchInputRef.current?.focus()
        }, 200)
      }
    }, [isVisible])

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
          reset={({ key, chain, setAggregatedStore }) => (
            <RemoveChainWalletAddresses
              key={key}
              chain={chain}
              setWalletAddresses={setAggregatedStore}
            />
          )}
        />

        <BottomModal
          isOpen={isVisible}
          onClose={onClose}
          title={Title}
          fullScreen
          headerClassName='h-[72px] shrink-0'
          contentClassName='[&>div:first-child>div:last-child]:-mt-[2px]'
          className='h-full p-6'
        >
          <SearchInput
            ref={searchInputRef}
            placeholder='Search by chain name'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            className='mb-7'
          />
          <div
            className='flex flex-col items-center justify-start h-[calc(100%-75px)] w-full gap-4'
            style={{ overflowY: 'scroll' }}
          >
            {filteredWalletAddresses?.length > 0 ? (
              filteredWalletAddresses.map(({ chain, addresses }, index) => {
                const chainInfo = chains[chain]

                if (addresses.length > 1) {
                  const sortedAddresses = addresses.sort((a, b) => {
                    const isEVM = a?.startsWith('0x')
                    const isEVM2 = b?.startsWith('0x')
                    if (isEVM && !isEVM2) return 1
                    if (!isEVM && isEVM2) return -1
                    return 0
                  })
                  return (
                    <React.Fragment key={`${addresses[0]}-${index}`}>
                      {sortedAddresses.map((address, index) => {
                        const isEVM = address?.startsWith('0x')
                        return (
                          <CopyAddressCard
                            address={address}
                            key={`${address}-${index}`}
                            forceChain={chain}
                            forceName={`${chainInfo.chainName}${isEVM ? ` (EVM)` : ''}`}
                          />
                        )
                      })}
                    </React.Fragment>
                  )
                }

                return (
                  <React.Fragment key={`${addresses[0]}-${index}`}>
                    <CopyAddressCard
                      address={addresses[0]}
                      key={`${addresses[0]}-${index}`}
                      forceChain={chain}
                      forceName={chainInfo.chainName}
                    />
                  </React.Fragment>
                )
              })
            ) : (
              <div
                className={cn(
                  'w-full flex items-center justify-center rounded-2xl border border-secondary-200 h-full',
                )}
              >
                <div className='flex items-center justify-center flex-col gap-4'>
                  <div className='p-5 bg-secondary-200 rounded-full flex items-center justify-center'>
                    <MagnifyingGlassMinus size={24} className='text-foreground' />
                  </div>
                  <p className='text-[18px] !leading-[24px] font-bold text-foreground text-center'>
                    No results found
                  </p>
                </div>
              </div>
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
