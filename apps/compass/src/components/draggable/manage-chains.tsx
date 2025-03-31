/* eslint-disable @typescript-eslint/no-explicit-any */
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { CardDivider, ToggleCard } from '@leapwallet/leap-ui'
import Text from 'components/text'
import Fuse from 'fuse.js'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useChainInfos } from 'hooks/useChainInfos'
import { GenericLight } from 'images/logos'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import { Draggable } from 'react-beautiful-dnd'
import { deleteChainStore } from 'stores/delete-chain-store'
import type { ManageChainSettings } from 'stores/manage-chains-store'
import { imgOnError } from 'utils/imgOnError'
import { capitalize } from 'utils/strings'

interface PropTypes {
  chains: ManageChainSettings[]
  searchQuery: string
  // eslint-disable-next-line no-unused-vars
  updateChainFunction: (chainName: SupportedChain) => void
  title?: string
}

const BetaCard = observer(({ chain }: { chain: ManageChainSettings }) => {
  const chainInfos = useChainInfos()
  const img = chainInfos[chain.chainName]?.chainSymbolImageUrl

  return (
    <>
      <div className='flex justify-between items-center px-4 bg-white-100 dark:bg-gray-900 cursor-pointer w-[344px] h-[76px] rounded-[16px]'>
        <div className='flex items-center flex-grow'>
          <img
            src={img ?? GenericLight}
            alt='custom icon'
            width='28'
            height='28'
            className='h-7 w-7 mr-3'
            onError={imgOnError(GenericLight)}
          />
          <div className='flex flex-col justify-center items-start'>
            <div className='text-base font-bold text-black-100 dark:text-white-100 text-left max-w-[160px] text-ellipsis overflow-hidden text-xl'>
              {chain.chainName}
            </div>
            <div className='text-xs font-medium text-gray-400'>{capitalize(chain.denom)}</div>
          </div>
          <div className='flex flex-grow'></div>
          <div className='flex flex-col justify-center items-end'>
            <button
              className='text-sm font-bold text-red-300 py-1 px-3 rounded-[14px]'
              style={{ backgroundColor: 'rgba(255, 112, 126, 0.1)' }}
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              onClick={() => deleteChainStore.setChainInfo(chain)}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </>
  )
})

const ManageChainDraggables = ({ chains, searchQuery, updateChainFunction }: PropTypes) => {
  const [errorSwitch, setErrorSwitch] = useState(false)

  const activeChain = useActiveChain()
  const chainInfos = useChainInfos()

  const chainsFuse = useMemo(() => {
    return new Fuse(chains, {
      threshold: 0.3,
      keys: ['chainName'],
    })
  }, [chains])

  const filteredChains = useMemo(() => {
    const clearSearchQuery = searchQuery.trim()
    if (!searchQuery) {
      return chains
    }
    return chainsFuse.search(clearSearchQuery).map((chain) => chain.item)
  }, [searchQuery, chains, chainsFuse])

  return (
    <div className='rounded-2xl dark:bg-gray-900 bg-white-100'>
      {chains
        ? filteredChains.map((chain, index) => {
            const isFirst = index === 0
            const isLast = index === chains.length - 1

            const img = chainInfos[chain.chainName].chainSymbolImageUrl

            return (
              <Draggable
                key={chain.id ?? index}
                draggableId={chain?.id?.toString() ?? index.toString()}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <ToggleCard
                      imgSrc={img}
                      isRounded={isLast || isFirst}
                      size='lg'
                      subtitle={
                        errorSwitch && activeChain === chain.chainName ? (
                          <span style={{ color: '#FF707E' }}>Cannot disable a chain in use</span>
                        ) : (
                          capitalize(chain.denom)
                        )
                      }
                      title={capitalize(chain.chainName) as string}
                      onClick={() => {
                        if (activeChain === chain.chainName) {
                          setErrorSwitch(true)
                        } else {
                          setErrorSwitch(false)
                          updateChainFunction(chain.chainName)
                        }
                      }}
                      isEnabled={chain.active}
                    />
                    {!isLast ? <CardDivider /> : null}
                  </div>
                )}
              </Draggable>
            )
          })
        : null}
    </div>
  )
}

const ManageChainNonDraggables = ({
  chains,
  searchQuery,
  updateChainFunction,
  title,
}: PropTypes) => {
  const [errorSwitch, setErrorSwitch] = useState(false)

  const activeChain = useActiveChain()
  const chainInfos = useChainInfos()

  const chainsFuse = useMemo(() => {
    return new Fuse(chains, {
      threshold: 0.3,
      keys: ['chainName'],
    })
  }, [chains])

  const filteredChains = useMemo(() => {
    const clearSearchQuery = searchQuery.trim()
    if (!searchQuery) {
      return chains
    }
    return chainsFuse.search(clearSearchQuery).map((chain) => chain.item)
  }, [searchQuery, chains, chainsFuse])

  return (
    <div className='rounded-2xl dark:bg-gray-900 bg-white-100'>
      {title && (
        <Text size='xs' className='pt-[20px] px-4 text'>
          {title}
        </Text>
      )}
      {chains
        ? filteredChains.map((chain, index) => {
            if (chain.beta) {
              return <BetaCard chain={chain} />
            }

            const img = chainInfos[chain.chainName].chainSymbolImageUrl

            const isFirst = index === 0
            const isLast = index === filteredChains.length - 1
            return (
              <ToggleCard
                key={index}
                imgSrc={img}
                isRounded={isLast || isFirst}
                size='lg'
                subtitle={
                  errorSwitch && activeChain === chain.chainName ? (
                    <span style={{ color: '#FF707E' }}>Cannot disable a chain in use</span>
                  ) : (
                    capitalize(chain.denom)
                  )
                }
                title={capitalize(chain.chainName) as string}
                onClick={() => {
                  if (activeChain === chain.chainName) {
                    setErrorSwitch(true)
                  } else {
                    setErrorSwitch(false)
                    updateChainFunction(chain.chainName)
                  }
                }}
                isEnabled={chain.active}
              />
            )
          })
        : null}
    </div>
  )
}

export { ManageChainDraggables, ManageChainNonDraggables }
