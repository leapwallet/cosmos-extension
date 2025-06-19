import { ChainInfo, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { ChainFeatureFlagsStore, ChainInfosStore } from '@leapwallet/cosmos-wallet-store'
import BottomModal from 'components/bottom-modal'
import Text from 'components/text'
import { SearchInput } from 'components/ui/input/search-input'
import { GenericLight } from 'images/logos'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import { imgOnError } from 'utils/imgOnError'

type SelectInitiaChainSheetProps = {
  isOpen: boolean
  setSelectedInitiaChain: (chain: SupportedChain) => void
  onClose: () => void
  chainFeatureFlagsStore: ChainFeatureFlagsStore
  chainInfoStore: ChainInfosStore
  selectedNetwork: 'mainnet' | 'testnet'
}

export const SelectInitiaChainSheet: React.FC<SelectInitiaChainSheetProps> = observer(
  ({
    isOpen,
    setSelectedInitiaChain,
    onClose,
    chainFeatureFlagsStore,
    chainInfoStore,
    selectedNetwork,
  }) => {
    const [searchedTerm, setSearchedTerm] = useState('')

    const chains = chainInfoStore.chainInfos
    const chainFeatureFlags = chainFeatureFlagsStore.chainFeatureFlagsData

    const minitiaChains = useMemo(() => {
      const _minitiaChains: ChainInfo[] = []
      Object.keys(chainFeatureFlags)
        .filter((chain) => chainFeatureFlags[chain].chainType === 'minitia')
        .forEach((c) => {
          if (chains[c as SupportedChain]) {
            _minitiaChains.push(chains[c as SupportedChain])
          }
          const _chain = Object.values(chainInfoStore.chainInfos).find((chainInfo) =>
            selectedNetwork === 'testnet'
              ? chainInfo?.testnetChainId === c
              : chainInfo?.chainId === c,
          )
          if (_chain) {
            _minitiaChains.push(_chain)
          }
        })
      return _minitiaChains
    }, [chainFeatureFlags, chainInfoStore.chainInfos, chains, selectedNetwork])

    const initiaChains = useMemo(() => {
      return minitiaChains.filter((chain) =>
        chain?.chainName.toLowerCase().includes(searchedTerm.toLowerCase()),
      )
    }, [minitiaChains, searchedTerm])

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
