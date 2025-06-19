import { Token, useChainInfo } from '@leapwallet/cosmos-wallet-hooks'
import {
  ChainInfo,
  ChainInfos,
  DenomsRecord,
  isAptosAddress,
  isAptosChain,
  isEthAddress,
  isSolanaAddress,
  isSolanaChain,
  isSuiChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { MagnifyingGlassMinus } from '@phosphor-icons/react'
import { BigNumber } from 'bignumber.js'
import BottomModal from 'components/new-bottom-modal'
import Text from 'components/text'
import { SearchInput } from 'components/ui/input/search-input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'components/ui/tooltip'
import { SHOW_ETH_ADDRESS_CHAINS } from 'config/constants'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import { TokenCard } from 'pages/send/components/TokenCard'
import { useSendContext } from 'pages/send/context'
import { useAllChainsPlaceholder } from 'pages/swaps-v2/hooks/useAllChainsPlaceholder'
import React, { useEffect, useMemo, useState } from 'react'
import { chainInfoStore } from 'stores/chain-infos-store'
import { rootBalanceStore } from 'stores/root-store'
import { SourceToken } from 'types/swap'
import { cn } from 'utils/cn'
import { imgOnError } from 'utils/imgOnError'

import { SelectChainSheet } from './select-chain-sheet'

type SelectTokenSheetProps = {
  assets: Token[]
  isOpen: boolean
  onClose: () => void
  selectedToken: Token | null
  onTokenSelect: (token: Token) => void
  denoms: DenomsRecord
  assetCoinDenom?: string
}

export const priorityChainsIds = [
  ChainInfos.ethereum.key,
  ChainInfos.cosmos.key,
  ChainInfos.movement.key,
  ChainInfos.base.key,
]

export const SelectTokenSheet = observer(
  ({
    assets,
    selectedToken,
    isOpen,
    onClose,
    onTokenSelect,
    denoms,
    assetCoinDenom,
  }: SelectTokenSheetProps) => {
    const [searchQuery, setSearchQuery] = useState('')
    const { sendActiveChain, selectedAddress, setSelectedChain, selectedChain } = useSendContext()
    const activeChainInfo = useChainInfo(sendActiveChain)
    const selectedNetwork = useSelectedNetwork()
    const allChainsPlaceholder = useAllChainsPlaceholder()
    const [isSelectChainOpen, setIsSelectChainOpen] = useState(false)
    const defaultTokenLogo = useDefaultTokenLogo()
    const [selectedFilteredChain, setSelectedFilteredChain] = useState<ChainInfo>(
      allChainsPlaceholder.chain as unknown as ChainInfo,
    )
    const chains = useMemo(
      () =>
        Object.values(chainInfoStore.chainInfos).filter((chain) => {
          if (!chain.enabled) return false
          if (selectedNetwork === 'mainnet') {
            return !chain.testnetChainId || chain.chainId !== chain.testnetChainId
          } else {
            return !!chain.testnetChainId
          }
        }),
      [selectedNetwork],
    )

    const cosmosEcosystem: ChainInfo = useMemo(() => {
      return {
        ...ChainInfos.cosmos,
        chainName: 'Cosmos',
        chainSymbolImageUrl: Images.Misc.CosmosEcosystem,
      }
    }, [])
    const { cosmosSupportedChains, evmSupportedChains } = useMemo(() => {
      const evmSupportedChains = chains.filter(
        (chain) => chain.evmOnlyChain || SHOW_ETH_ADDRESS_CHAINS.includes(chain.key),
      )
      const cosmosSupportedChains = chains.filter(
        (chain) =>
          !chain.evmOnlyChain &&
          !chain.useBip84 &&
          !isAptosChain(chain.key) &&
          !isSuiChain(chain.key ?? '') &&
          !isSolanaChain(chain.key),
      )
      return {
        evmSupportedChains,
        cosmosSupportedChains,
      }
    }, [chains])

    const assetList = useMemo(() => {
      let _assets = []
      // aptos tokens
      if (selectedAddress?.address && isAptosAddress(selectedAddress.address)) {
        _assets = assets.filter(
          (token) =>
            isAptosChain(token.tokenBalanceOnChain) || isSuiChain(token.tokenBalanceOnChain ?? ''),
        )
      } else if (
        selectedAddress?.address &&
        isSolanaAddress(selectedAddress.address) &&
        !cosmosSupportedChains.some((chain) => chain.key === selectedAddress.chainName)
      ) {
        _assets = assets.filter(
          (token) => token.tokenBalanceOnChain && isSolanaChain(token.tokenBalanceOnChain),
        )
      } else if (
        // btc tokens
        selectedAddress?.address?.startsWith('bc1q') ||
        selectedAddress?.address?.startsWith('tb1q')
      ) {
        _assets = assets.filter((token) => token.tokenBalanceOnChain === selectedAddress.chainName)
      } else if (
        // evm + 0x send supported cosmos tokens
        (selectedAddress?.address && isEthAddress(selectedAddress.address)) ||
        (selectedAddress?.ethAddress && isEthAddress(selectedAddress.ethAddress))
      ) {
        _assets = assets.filter(
          (token) =>
            token.tokenBalanceOnChain &&
            evmSupportedChains.some((chain) => chain.key === token.tokenBalanceOnChain),
        )
      } else {
        // cosmos tokens
        _assets = assets.filter(
          (token) =>
            token.tokenBalanceOnChain &&
            cosmosSupportedChains.some((chain) => chain.key === token.tokenBalanceOnChain),
        )
      }
      return _assets.filter((token) => {
        return (
          !new BigNumber(token?.amount).isNaN() &&
          new BigNumber(token?.amount).gt(0) &&
          (isSuiChain(token.tokenBalanceOnChain ?? '') ||
            (denoms[token.coinMinimalDenom as keyof typeof denoms] ??
              Object.values(activeChainInfo.nativeDenoms).find(
                (_denom) => _denom.coinMinimalDenom === token.coinMinimalDenom,
              )))
        )
      })
    }, [
      activeChainInfo.nativeDenoms,
      assets,
      cosmosSupportedChains,
      denoms,
      evmSupportedChains,
      selectedAddress?.address,
      selectedAddress?.chainName,
      selectedAddress?.ethAddress,
    ])

    const assetsToShow = useMemo(() => {
      let _assets = []
      if (selectedFilteredChain.chainId === 'all') {
        _assets = assetList
      } else if (selectedFilteredChain.chainId === ChainInfos.cosmos.chainId) {
        _assets = assetList.filter((asset) =>
          cosmosSupportedChains.some((chain) => chain.key === asset.tokenBalanceOnChain),
        )
      } else {
        _assets = assetList.filter(
          (asset) => asset.tokenBalanceOnChain === selectedFilteredChain.key,
        )
      }
      return _assets.filter((asset) =>
        asset.symbol.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      )
    }, [
      assetList,
      cosmosSupportedChains,
      searchQuery,
      selectedFilteredChain.chainId,
      selectedFilteredChain.key,
    ])

    const chainsToShowForPlaceholders = useMemo(() => {
      let _chains: ChainInfo[] = []
      if (
        (selectedAddress?.address && isEthAddress(selectedAddress.address)) ||
        (selectedAddress?.ethAddress && isEthAddress(selectedAddress.ethAddress))
      ) {
        _chains = chains.filter((chain) =>
          evmSupportedChains.some((evmChain) => evmChain.key === chain.key),
        )
      } else if (
        selectedAddress?.address?.startsWith('bc1q') ||
        selectedAddress?.address?.startsWith('tb1q')
      ) {
        _chains = chains.filter((chain) => chain.key === selectedAddress.chainName)
      } else if (selectedAddress?.address && isAptosAddress(selectedAddress.address)) {
        _chains = chains.filter((chain) => isAptosChain(chain.key) || isSuiChain(chain.key ?? ''))
      } else if (
        selectedAddress?.address &&
        isSolanaAddress(selectedAddress.address) &&
        !cosmosSupportedChains.some((chain) => chain.key === selectedAddress.chainName)
      ) {
        _chains = chains.filter((chain) => isSolanaChain(chain.key))
      } else {
        _chains = chains.filter((chain) =>
          cosmosSupportedChains.some((cosmosChain) => cosmosChain.key === chain.key),
        )
      }
      if (
        _chains.some((chain) =>
          cosmosSupportedChains.some((cosmosChain) => cosmosChain.key === chain.key),
        )
      ) {
        _chains.push(cosmosEcosystem)
      }
      return _chains.filter((chain) =>
        assetList.some((asset) => {
          if (new BigNumber(asset?.amount).isNaN() || !new BigNumber(asset?.amount).gt(0)) {
            return false
          }
          if (chain.key === 'cosmos') {
            return cosmosSupportedChains.some(
              (cosmosChain) => cosmosChain.key === asset.tokenBalanceOnChain,
            )
          }
          return chain.key === asset.tokenBalanceOnChain
        }),
      )
    }, [
      assetList,
      chains,
      cosmosEcosystem,
      cosmosSupportedChains,
      evmSupportedChains,
      selectedAddress?.address,
      selectedAddress?.chainName,
      selectedAddress?.ethAddress,
    ])

    const filterChainPlaceholders = useMemo(() => {
      const NUM_OF_CHAINS_TO_SHOW = 4
      const allPlaceholders: (ChainInfo | { id: string; label: string; tooltip: string })[] = []

      priorityChainsIds.forEach((chainId) => {
        const chain = chainsToShowForPlaceholders.find((chain) => chain.key === chainId)
        if (chain) {
          if (chain.chainId === ChainInfos.cosmos.chainId) {
            allPlaceholders.push(cosmosEcosystem)
          } else {
            allPlaceholders.push({ ...chain })
          }
        }
      })

      const remainingNonCosmosChains = chainsToShowForPlaceholders.filter(
        (chain) =>
          (chain.evmOnlyChain ||
            chain.useBip84 ||
            isAptosChain(chain.key) ||
            isSuiChain(chain.key ?? '') ||
            isSolanaChain(chain.key)) &&
          !priorityChainsIds.includes(chain.key),
      )

      if (remainingNonCosmosChains.length > 0) {
        const remainingUpfrontPlaceholders = Math.max(
          NUM_OF_CHAINS_TO_SHOW - (allPlaceholders?.length ?? 0),
          0,
        )
        if (remainingUpfrontPlaceholders > 0) {
          const remainingChainsToShowUpfront = remainingNonCosmosChains.slice(
            0,
            remainingUpfrontPlaceholders,
          )
          allPlaceholders.push(
            ...remainingChainsToShowUpfront.map((chain) => ({
              ...chain,
            })),
          )
        }
        const numberOfRemainingChains =
          remainingNonCosmosChains.length - remainingUpfrontPlaceholders
        if (numberOfRemainingChains > 0) {
          allPlaceholders.push({
            id: 'remaining-chains',
            tooltip: `View all +${numberOfRemainingChains} networks`,
            label: `+${numberOfRemainingChains}`,
          })
        }
      }

      if (allPlaceholders.length > 1) {
        allPlaceholders.unshift({
          ...allChainsPlaceholder.chain,
          key: 'aggregated',
        } as unknown as ChainInfo)
      }
      return allPlaceholders
    }, [allChainsPlaceholder.chain, chainsToShowForPlaceholders, cosmosEcosystem])

    const chainsToShow = useMemo(() => {
      const chainsToShowWithoutCosmosChains: ChainInfo[] = []
      chainsToShowForPlaceholders
        .filter(
          (chain) =>
            chain.evmOnlyChain ||
            chain.useBip84 ||
            isSolanaChain(chain.key) ||
            isAptosChain(chain.key) ||
            isSuiChain(chain.key ?? '') ||
            chain.chainId === ChainInfos.cosmos.chainId,
        )
        .forEach((chain) => {
          if (chain.chainId === ChainInfos.cosmos.chainId) {
            chainsToShowWithoutCosmosChains.push(cosmosEcosystem)
          } else {
            chainsToShowWithoutCosmosChains.push({ ...chain })
          }
        })
      return chainsToShowWithoutCosmosChains
    }, [chainsToShowForPlaceholders, cosmosEcosystem])

    const handleSelectToken = (token: Token) => {
      onTokenSelect(token)
      onClose()
    }

    useEffect(() => {
      if (selectedFilteredChain && assetList?.length === 0) {
        rootBalanceStore.loadBalances(selectedFilteredChain.key, selectedNetwork)
      }
    }, [assetList?.length, selectedFilteredChain, selectedNetwork])

    useEffect(() => {
      const address = selectedAddress?.address || selectedAddress?.ethAddress
      if (address) {
        const isCosmosChain = cosmosSupportedChains.some(
          (chain) => chain.key === selectedAddress?.chainName,
        )
        if (isAptosAddress(address)) {
          setSelectedFilteredChain(allChainsPlaceholder.chain as unknown as ChainInfo)
        } else if (
          address.startsWith('bc1q') ||
          address.startsWith('tb1q') ||
          (isSolanaAddress(address) && !isCosmosChain)
        ) {
          const chain = chains.find((chain) => chain.key === selectedAddress.chainName)
          if (chain) {
            setSelectedFilteredChain(chain)
          }
        } else if (isEthAddress(address)) {
          if (selectedAddress?.chainName) {
            const chain = chainsToShowForPlaceholders.find(
              (chain) => chain.key === selectedAddress.chainName,
            )
            if (chain) {
              setSelectedFilteredChain(chain)
            }
          }
        } else {
          setSelectedFilteredChain(cosmosEcosystem)
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      chains,
      cosmosEcosystem,
      selectedAddress?.address,
      selectedAddress?.chainName,
      selectedAddress?.ethAddress,
      allChainsPlaceholder.chain,
    ])

    useEffect(() => {
      if (!selectedToken && assetsToShow.length > 0 && !assetCoinDenom) {
        const tokensWithBalance = assetsToShow.filter((token) => new BigNumber(token.amount).gt(0))
        const token = tokensWithBalance[0] as Token
        onTokenSelect(token)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assetCoinDenom, assetsToShow, selectedToken])

    return (
      <>
        <BottomModal
          title='Select Token'
          isOpen={isOpen}
          onClose={onClose}
          contentClassName='!bg-white-100 dark:!bg-gray-950'
          className='!p-6 !pb-0'
          fullScreen
        >
          <div className='flex flex-col items-center h-full w-full gap-7'>
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder='Select Token'
            />

            <div className='flex flex-col items-start justify-start w-full'>
              <div>
                <span className='text-xs !leading-[19.2px] text-muted-foreground'>
                  Select ecosystem:{' '}
                </span>
                <span className='text-xs font-bold !leading-[19.2px] text-foreground'>
                  {selectedFilteredChain?.chainName}
                </span>
              </div>
              <div className='flex gap-2 items-center w-full overflow-x-auto hide-scrollbar py-[2px] mt-3'>
                <TooltipProvider delayDuration={100}>
                  {filterChainPlaceholders.map((chain) => {
                    const key = 'id' in chain ? chain.id : chain.chainId
                    const tooltip = 'id' in chain ? chain.tooltip : chain.chainName
                    return (
                      <Tooltip key={key}>
                        <TooltipContent>
                          <span className='text-xs font-medium !leading-[19.2px] text-secondary-800'>
                            {tooltip}
                          </span>
                        </TooltipContent>
                        <TooltipTrigger asChild>
                          <button
                            key={key}
                            className={cn(
                              'flex items-center justify-center w-13 shrink-0 py-2 px-[10px] rounded-xl border',
                              selectedFilteredChain?.chainId === key
                                ? 'border-foreground bg-secondary-200'
                                : 'border-secondary-300',
                            )}
                            onClick={() => {
                              if ('id' in chain) {
                                setIsSelectChainOpen(true)
                              } else {
                                setSelectedFilteredChain(chain)
                                return
                              }
                            }}
                          >
                            {'id' in chain ? (
                              <div className='w-[28px] h-[28px] flex items-center justify-center'>
                                <span className='text-[16px] font-bold !leading-[22.4px] text-foreground'>
                                  {chain.label}
                                </span>
                              </div>
                            ) : (
                              <img
                                src={
                                  chain.chainId === 'all'
                                    ? (chain as any)?.icon ?? defaultTokenLogo
                                    : chain.chainSymbolImageUrl
                                }
                                className='w-[28px] h-[28px] rounded-full'
                                onError={imgOnError(defaultTokenLogo)}
                              />
                            )}
                          </button>
                        </TooltipTrigger>
                      </Tooltip>
                    )
                  })}
                </TooltipProvider>
              </div>
            </div>

            <div className='bg-white-100 dark:bg-gray-950 w-full h-[calc(100%-190px)]'>
              <Text size='xs' className='font-bold mb-1' color='text-muted-foreground'>
                Select token
              </Text>
              {assetsToShow.length > 0 ? (
                <div style={{ overflowY: 'scroll' }} className='h-[calc(100%-20px)]'>
                  {assetsToShow.map((asset, index) => {
                    const isLast = index === assetsToShow.length - 1

                    let isSelected = selectedToken?.coinMinimalDenom === asset.coinMinimalDenom
                    if (selectedToken?.ibcDenom || asset.ibcDenom) {
                      isSelected = selectedToken?.ibcDenom === asset.ibcDenom
                    }
                    if (selectedToken?.isEvm || asset?.isEvm) {
                      isSelected = isSelected && selectedToken?.isEvm === asset?.isEvm
                    }

                    return (
                      <React.Fragment key={`${asset.coinMinimalDenom}-${index}`}>
                        <TokenCard
                          onTokenSelect={handleSelectToken}
                          token={asset as SourceToken}
                          hideAmount={asset.amount === '0'}
                          isSelected={isSelected}
                          selectedChain={undefined}
                          showRedirection={false}
                          isFirst={index === 0}
                          isLast={isLast}
                        />
                      </React.Fragment>
                    )
                  })}
                </div>
              ) : (
                <div className='py-[80px] px-4 w-full flex-col flex  justify-center items-center gap-4'>
                  <MagnifyingGlassMinus
                    size={64}
                    className='dark:text-gray-50 text-gray-900 p-5 rounded-full bg-secondary-200'
                  />
                  <div className='flex flex-col justify-start items-center w-full gap-4'>
                    <div className='text-lg text-center font-bold !leading-[21.5px] dark:text-white-100'>
                      No tokens found
                    </div>
                    <div className='text-sm font-normal !leading-[22.4px] text-gray-400 dark:text-gray-400 text-center'>
                      We couldn’t find a match. Try searching again or use a different keyword.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <SelectChainSheet
            isOpen={isSelectChainOpen}
            onClose={() => {
              setIsSelectChainOpen(false)
            }}
            chainsToShow={chainsToShow}
            selectedChain={selectedFilteredChain}
            onChainSelect={(chain) => {
              setSelectedFilteredChain(chain)
              setIsSelectChainOpen(false)
            }}
            priorityChainsIds={priorityChainsIds}
          />
        </BottomModal>
      </>
    )
  },
)

SelectTokenSheet.displayName = 'SelectTokenSheet'
