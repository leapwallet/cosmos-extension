import { ToggleCard } from '@leapwallet/leap-ui'
import React, { useState } from 'react'
import { Draggable } from 'react-beautiful-dnd'

import CardDivider from '~/components/card-divider'
import { useActiveChain } from '~/hooks/settings/use-active-chain'
import type { ManageChainSettings } from '~/hooks/settings/use-manage-chains'
import { ChainLogos } from '~/images/logos'
import { capitalize } from '~/util/strings'

interface PropTypes {
  chains: ManageChainSettings[]
  searchQuery: string
  updateChainFunction: (chainName: string) => void
}

const ManageChainDraggables = (props: PropTypes) => {
  const activeChain = useActiveChain()
  const [errorSwitch, setErrorSwitch] = useState(false)
  const filteredChains = props.chains.filter((chain) => chain.chainName.includes(props.searchQuery))
  return (
    <React.Fragment>
      <div className='rounded-2xl dark:bg-gray-900 bg-white-100'>
        {props.chains
          ? filteredChains.map((chain, index) => {
              const isFirst = index === 0
              const isLast = index === props.chains.length - 1

              const img = ChainLogos[chain.chainName]
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
                        subTitle={
                          errorSwitch && activeChain === chain.chainName ? (
                            <span style={{ color: '#FF707E' }}>Cannot disable a chain in use</span>
                          ) : (
                            capitalize(chain.denom)
                          )
                        }
                        title={capitalize(chain.chainName)}
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

export default ManageChainDraggables
