import { SelectedAddress, sliceAddress, useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { CaretRight } from '@phosphor-icons/react'
import {
  NameServiceResolveResult,
  nameServices,
  useNameServiceResolver,
} from 'hooks/nameService/useNameService'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { useChainInfos } from 'hooks/useChainInfos'
import { Images } from 'images'
import { GenericLight } from 'images/logos'
import { useSendContext } from 'pages/send/context'
import React, { useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'
import { AggregatedSupportedChain } from 'types/utility'
import { Bech32Address } from 'utils/bech32'
import { cn } from 'utils/cn'

const NameServiceItemSkeleton = () => {
  return (
    <div className='flex w-full z-0'>
      <Skeleton
        circle
        className='w-11 h-11'
        containerClassName='block !leading-none shrink-0 w-11 h-11'
      />
      <div className='w-full z-0 ml-4 flex flex-col gap-1.5 justify-center items-start'>
        <Skeleton
          count={1}
          width={100}
          height={16}
          className='z-0'
          containerClassName='block !leading-none'
        />
        <Skeleton
          count={1}
          width={80}
          height={16}
          className='z-0'
          containerClassName='block !leading-none'
        />
      </div>
    </div>
  )
}

const MatchListItem: React.FC<{
  address: string
  title: string
  nameServiceImg: string
  chainIcon?: string
  handleClick: () => void
}> = ({ address, title, nameServiceImg, handleClick }) => (
  <button
    className={cn('w-full flex items-center gap-3 cursor-pointer pb-4')}
    onClick={handleClick}
  >
    <div className='flex justify-between items-center w-full'>
      <div className='flex items-center gap-4'>
        <img className='h-11 w-11' src={nameServiceImg ?? Images.Misc.getWalletIconAtIndex(0)} />
        <div className='flex flex-col'>
          <p className='font-bold text-left text-monochrome text-sm capitalize'>{title}</p>
          <p className='text-sm text-muted-foreground text-left'>{sliceAddress(address)}</p>
        </div>
      </div>
      <CaretRight className='text-muted-foreground' size={16} />
    </div>
  </button>
)

const NameServiceMatchList = ({
  address,
  handleContactSelect,
}: {
  address: string
  handleContactSelect: (contact: SelectedAddress) => void
}) => {
  const network = useSelectedNetwork()
  const chainInfos = useChainInfos()
  const chains = useGetChains()
  const { selectedToken, sendActiveChain: activeChain } = useSendContext()

  const [isLoading, nameServiceResults] = useNameServiceResolver(address, network)

  const resultsList: [string, NameServiceResolveResult | null][] = useMemo(() => {
    const entries = Object.entries(nameServiceResults)

    return entries.filter(([, result]) => result !== null)
  }, [nameServiceResults])

  let anyResultsForCurrentChain = false
  return (
    <div className='w-full'>
      {!isLoading ? (
        <>
          {resultsList && resultsList.length > 0 ? (
            <>
              <ul className='list-none space-y-2 mt-5 max-h-[180px] overflow-y-auto'>
                {resultsList.map(([nameService, result]) => {
                  const nameServiceImg = Images.Logos.getNameServiceLogo(nameService)
                  if (result && typeof result === 'string') {
                    let chain = Bech32Address.getChainKey(result)
                    if (!chain) {
                      chain = selectedToken?.tokenBalanceOnChain
                    }
                    if (chain === activeChain) {
                      anyResultsForCurrentChain = true
                    }
                    return (
                      <MatchListItem
                        key={`${nameService}-${result}`}
                        title={nameService}
                        address={result}
                        nameServiceImg={nameServiceImg}
                        handleClick={() => {
                          handleContactSelect({
                            avatarIcon: nameServiceImg,
                            chainIcon: chain
                              ? chainInfos[chain].chainSymbolImageUrl ?? GenericLight
                              : GenericLight,
                            chainName: '',
                            name: address,
                            address: result,
                            ethAddress: selectedToken?.isEvm ? result : undefined,
                            emoji: undefined,
                            selectionType: 'nameService',
                            information: {
                              nameService: nameServices[nameService],
                              chain_id: chain ? chainInfos[chain].chainName : null,
                            },
                          })
                        }}
                      />
                    )
                  }

                  if (result && Array.isArray(result)) {
                    const filteredItems = result
                      .map(({ chain_id, address: resolvedAddress }) => {
                        const chainDetails = Object.values(chainInfos).find(
                          (chain) => chain.chainId === chain_id,
                        )
                        const chainImage = chainDetails?.chainSymbolImageUrl ?? GenericLight

                        return (
                          <MatchListItem
                            title={
                              nameServices[nameService] ?? nameService ?? chainDetails?.chainName
                            }
                            key={`${nameService}-${chain_id}-${resolvedAddress}`}
                            address={resolvedAddress}
                            nameServiceImg={nameServiceImg}
                            chainIcon={chainImage}
                            handleClick={() => {
                              handleContactSelect({
                                avatarIcon: nameServiceImg,
                                chainIcon: chainImage,
                                chainName: '',
                                name: address,
                                address: resolvedAddress,
                                emoji: undefined,
                                selectionType: 'nameService',
                                information: {
                                  nameService: nameServices[nameService],
                                  chain_id,
                                },
                              })
                            }}
                          />
                        )
                      })
                      .filter(Boolean)

                    return filteredItems.length > 0 ? <>{filteredItems}</> : null
                  }
                  return null
                })}
              </ul>
            </>
          ) : (
            <p className='text-sm font-bold text-red-300 mt-5'>
              No results found in any name service
            </p>
          )}
        </>
      ) : (
        <div className='mt-5'>
          <NameServiceItemSkeleton />
        </div>
      )}
    </div>
  )
}

export default NameServiceMatchList
