import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { MagnifyingGlassMinus } from '@phosphor-icons/react'
import BottomModal from 'components/new-bottom-modal'
import Text from 'components/text'
import { SearchInput } from 'components/ui/input/search-input'
import { useChainInfos } from 'hooks/useChainInfos'
import { UnlinkIcon } from 'icons/unlink'
import { Images } from 'images'
import React, { useMemo, useState } from 'react'
import { cn } from 'utils/cn'
import { imgOnError } from 'utils/imgOnError'

export const ChainsList = ({
  chains,
  isVisible,
  onClose,
  onDisconnect,
}: {
  chains: SupportedChain[]
  isVisible: boolean
  onClose: () => void
  onDisconnect: (chain: SupportedChain) => void
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const chainInfos = useChainInfos()

  const handleSearchSite = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const chainsToDisplay = useMemo(() => {
    return chains.filter((chain) => {
      return chainInfos[chain].chainName.toLowerCase().includes(searchQuery.toLowerCase())
    })
  }, [chains, chainInfos, searchQuery])

  return (
    <BottomModal
      fullScreen
      isOpen={isVisible}
      onClose={onClose}
      title='Chain Connections'
      className='!p-0 h-full'
    >
      <SearchInput
        placeholder='Search by chain name'
        onChange={handleSearchSite}
        value={searchQuery}
        onClear={() => setSearchQuery('')}
        className='m-6 w-auto'
      />
      {chainsToDisplay.length > 0 ? (
        <div className='flex flex-col gap-3 mx-6 h-[calc(100%-96px)] overflow-y-scroll'>
          {chainsToDisplay.map((chain) => {
            const chainInfo = chainInfos[chain]
            return (
              <div key={chain} className='flex p-3 items-center rounded-lg bg-secondary-100 gap-3'>
                <img
                  src={chainInfo.chainSymbolImageUrl}
                  onError={imgOnError(Images.Logos.GenericDark)}
                  className='w-10 h-10 p-1 rounded-full'
                />
                <Text color='text-monochrome' className='font-bold grow'>
                  {chainInfo?.chainName}
                </Text>
                <div
                  onClick={() => {
                    onDisconnect(chain)
                  }}
                  className='p-1 w-8 h-8 flex items-center justify-center text-secondary-600 hover:text-red-300 cursor-pointer'
                >
                  <UnlinkIcon weight='fill' size={24} />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div
          className={cn(
            'flex items-center justify-center rounded-2xl border border-secondary-200 w-auto mx-6 h-[calc(100%-108px)]',
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
    </BottomModal>
  )
}
