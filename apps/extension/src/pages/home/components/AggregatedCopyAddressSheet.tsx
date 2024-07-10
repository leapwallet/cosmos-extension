import { sliceAddress, useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { AggregatedNullComponents } from 'components/aggregated'
import BottomModal from 'components/bottom-modal'
import { CopyAddressCard } from 'components/card'
import NoSearchResults from 'components/no-search-results'
import { SearchInput } from 'components/search-input'
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
}

const AggregatedCopyAddressSheet = React.memo(
  ({ isVisible, onClose }: AggregatedCopyAddressSheetProps) => {
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

    const filteredWalletAddresses: AggregatedWalletAddresses = useMemo(() => {
      if (searchQuery?.length > 0) {
        return Object.keys(walletAddresses).reduce((acc, key) => {
          if (key.includes(searchQuery)) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            acc[key] = walletAddresses[key]
          }
          return acc
        }, {})
      } else {
        return walletAddresses
      }
    }, [searchQuery, walletAddresses])

    return (
      <>
        <AggregatedNullComponents
          setAggregatedStore={setWalletAddresses}
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
            {Object.entries(filteredWalletAddresses)?.length > 0 ? (
              Object.entries(filteredWalletAddresses).map(([chain, addresses], index) => {
                const chainInfo = chains[chain as SupportedChain]

                if (addresses.length > 1) {
                  const address =
                    sliceAddress(addresses[0], 5) + ', ' + sliceAddress(addresses[1], 5)

                  return (
                    <CopyAddressCard
                      key={`${addresses[0]}-${index}`}
                      address={address}
                      forceChain={chain as SupportedChain}
                      showDifferentIconForButton={true}
                      DifferentIconToShow={
                        <RightArrowSvg className='w-[16px] h-[16px] fill-white-100' />
                      }
                      differentIconButtonClassName='cursor-pointer'
                      forceName={chainInfo.chainName}
                      differentIconButtonOnClick={() =>
                        handleDifferentIconClick(chain as SupportedChain)
                      }
                    />
                  )
                }

                return (
                  <CopyAddressCard
                    address={addresses[0]}
                    key={`${addresses[0]}-${index}`}
                    forceChain={chain as SupportedChain}
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
