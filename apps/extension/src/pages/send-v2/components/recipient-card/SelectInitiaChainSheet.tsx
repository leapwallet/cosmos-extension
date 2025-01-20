import { chainIdToChain, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { ChainInfosStore, ChainTagsStore } from '@leapwallet/cosmos-wallet-store'
import BottomModal from 'components/bottom-modal'
import { SearchInput } from 'components/search-input'
import Text from 'components/text'
import { GenericLight } from 'images/logos'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import { imgOnError } from 'utils/imgOnError'

type SelectInitiaChainSheetProps = {
  isOpen: boolean
  setSelectedInitiaChain: (chain: SupportedChain) => void
  onClose: () => void
  chainTagsStore: ChainTagsStore
  chainInfoStore: ChainInfosStore
}
export const SelectInitiaChainSheet: React.FC<SelectInitiaChainSheetProps> = observer(
  ({ isOpen, setSelectedInitiaChain, onClose, chainTagsStore, chainInfoStore }) => {
    const [searchedTerm, setSearchedTerm] = useState('')
    const initiaChains = useMemo(() => {
      return Object.entries(chainTagsStore.allChainTags)
        .filter(([chainId, tags]) => tags.includes('Initia'))
        .map(([chainId]) => chainInfoStore.chainInfos[chainIdToChain[chainId] as SupportedChain])
        .filter((chain) => chain?.chainName.toLowerCase().includes(searchedTerm.toLowerCase()))
    }, [chainInfoStore.chainInfos, chainTagsStore.allChainTags, searchedTerm])

    return (
      <BottomModal
        title='Select Recipient'
        onClose={() => {
          setSearchedTerm('')
          onClose()
        }}
        isOpen={isOpen}
        closeOnBackdropClick={true}
        containerClassName='h-[calc(100%-34px)]'
        className='p-6'
      >
        <div className='flex flex-col gap-y-6 h-full'>
          <SearchInput
            divClassName='flex w-full bg-white-100 dark:bg-gray-950 rounded-full py-2 pl-5 pr-[10px] focus-within:border-green-600'
            value={searchedTerm}
            onChange={(e) => setSearchedTerm(e.target.value)}
            placeholder='Search chain'
            onClear={() => setSearchedTerm('')}
          />
          <div className='flex flex-col'>
            {initiaChains.map((chain) => {
              if (!chain) return null
              return (
                <div
                  key={chain.key}
                  onClick={() => {
                    setSelectedInitiaChain(chain.key)
                    onClose()
                  }}
                  className='flex items-center gap-x-3 py-3 border-b dark:border-b-gray-850 border-b-gray-100 cursor-pointer'
                >
                  <img
                    src={chain.chainSymbolImageUrl}
                    onError={imgOnError(GenericLight)}
                    width={40}
                    height={40}
                    className='rounded-full'
                  />
                  <Text size='md' color='text-gray-800 dark:text-white-100' className='font-bold'>
                    {chain.chainName}
                  </Text>
                </div>
              )
            })}
          </div>
        </div>
      </BottomModal>
    )
  },
)
