import { Header, HeaderActionType } from '@leapwallet/leap-ui'
import React, { ReactElement, useState } from 'react'
import { DropResult } from 'react-beautiful-dnd'
import { useNavigate } from 'react-router'

import DraggableContainer from '~/components/draggable'
import NoSearchResults from '~/components/no-search-results'
import PopupLayout from '~/components/popup-layout'
import { useActiveChain } from '~/hooks/settings/use-active-chain'
import {
  ManageChainSettings,
  useManageChainData,
  useToggleChainState,
  useUpdatePreferenceOrder,
} from '~/hooks/settings/use-manage-chains'
import { Images } from '~/images'
import { Colors } from '~/theme/colors'

import ManageChainDraggables from './widgets/manage-chain-draggables'
import ManageChainNonDraggables from './widgets/manage-chain-non-draggables'

// a function to help us with reordering the result
const reorder = (
  list: ManageChainSettings[],
  startIndex: number,
  endIndex: number,
): ManageChainSettings[] => {
  const result: ManageChainSettings[] = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
}

export default function ManageChain(): ReactElement {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const activeChain = useActiveChain()
  const [chains] = useManageChainData()
  const [updateChainData] = useToggleChainState()
  const [updatePreferenceOrder] = useUpdatePreferenceOrder()

  // function that defines what happens when a draggable is dropped
  const onDragEnd = async (result: DropResult) => {
    // dropped outside the list
    if (!result.destination) {
      return
    }
    const items: ManageChainSettings[] = reorder(
      chains,
      result.source.index,
      result.destination.index,
    )
    updatePreferenceOrder(items)
  }

  return (
    <PopupLayout
      header={
        <Header
          title={'Manage chains'}
          action={{
            onClick: () => {
              navigate(-1)
            },
            type: HeaderActionType.BACK,
          }}
          topColor={Colors.getChainColor(activeChain ?? 'cosmos')}
        />
      }
    >
      <div className='pt-[28px]'>
        <div className='mx-auto w-[344px] flex h-10 bg-white-100 dark:bg-gray-900 rounded-[30px] py-2 pl-5 pr-[10px]'>
          <input
            placeholder='search chains...'
            className='flex flex-grow text-base text-gray-400 outline-none bg-white-0'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery.length === 0 ? (
            <img src={Images.Misc.SearchIcon} />
          ) : (
            <img
              className='cursor-pointer'
              src={Images.Misc.CrossFilled}
              onClick={() => setSearchQuery('')}
            />
          )}
        </div>
        <div className='align-middle flex flex-col items-center justify-center my-4'>
          <DraggableContainer onDragEnd={onDragEnd}>
            {chains.filter((chain) => chain.chainName.includes(searchQuery)).length === 0 && (
              <NoSearchResults searchQuery={searchQuery} />
            )}
            {searchQuery.length === 0 ? (
              <ManageChainDraggables
                chains={chains}
                searchQuery={searchQuery}
                updateChainFunction={updateChainData}
              />
            ) : (
              <ManageChainNonDraggables
                chains={chains}
                searchQuery={searchQuery}
                updateChainFunction={updateChainData}
              />
            )}
          </DraggableContainer>
        </div>
      </div>
    </PopupLayout>
  )
}
