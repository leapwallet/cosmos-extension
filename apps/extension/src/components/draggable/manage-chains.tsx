/* eslint-disable @typescript-eslint/no-explicit-any */
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { CardDivider, ToggleCard } from '@leapwallet/leap-ui'
import { deleteChain } from 'atoms/delete-chain'
import Text from 'components/text'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import type { ManageChainSettings } from 'hooks/settings/useManageChains'
import { GenericLight, getChainImage } from 'images/logos'
import React, { useState } from 'react'
import { Draggable } from 'react-beautiful-dnd'
import { useSetRecoilState } from 'recoil'
import { capitalize } from 'utils/strings'

interface PropTypes {
  chains: ManageChainSettings[]
  searchQuery: string
  // eslint-disable-next-line no-unused-vars
  updateChainFunction: (chainName: SupportedChain) => void
  title?: string
}

const BetaCard = ({ chain }: { chain: any }) => {
  const setDeleteChain = useSetRecoilState(deleteChain)
  return (
    <>
      <div className='flex justify-between items-center px-4 bg-white-100 dark:bg-gray-900 cursor-pointer w-[344px] h-[76px] rounded-[16px]'>
        <div className='flex items-center flex-grow'>
          <img
            src={GenericLight}
            alt='custom icon'
            width='28'
            height='28'
            className='h-7 w-7 mr-3'
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
              onClick={() => setDeleteChain(chain)}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

const ManageChainDraggables = (props: PropTypes) => {
  const activeChain = useActiveChain()
  const [errorSwitch, setErrorSwitch] = React.useState(false)
  const filteredChains = props.chains.filter((chain) =>
    chain.chainName.toLowerCase().includes(props.searchQuery.toLowerCase()),
  )
  return (
    <React.Fragment>
      <div className='rounded-2xl dark:bg-gray-900 bg-white-100'>
        {props.chains
          ? filteredChains.map((chain, index) => {
              const isFirst = index === 0
              const isLast = index === props.chains.length - 1

              const img = getChainImage(chain.chainName)
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
                            props.updateChainFunction(chain.chainName)
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
    </React.Fragment>
  )
}

const ManageChainNonDraggables = (props: PropTypes) => {
  const activeChain = useActiveChain()
  const [errorSwitch, setErrorSwitch] = useState(false)

  const filteredChains = props.chains.filter((chain) =>
    chain.chainName.toLowerCase().includes(props.searchQuery.toLowerCase()),
  )

  return (
    <div className='rounded-2xl dark:bg-gray-900 bg-white-100'>
      {props.title && (
        <Text size='xs' className='pt-[20px] px-4 text'>
          {props.title}
        </Text>
      )}
      {props.chains
        ? filteredChains.map((chain, index) => {
            if (chain.beta) {
              return <BetaCard chain={chain} />
            }
            const img = getChainImage(chain.chainName)
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
                    props.updateChainFunction(chain.chainName)
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
