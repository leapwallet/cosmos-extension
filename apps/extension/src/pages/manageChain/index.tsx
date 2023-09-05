import { Key } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfo, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, Header, HeaderActionType } from '@leapwallet/leap-ui'
import { chainInfosState } from 'atoms/chains'
import { deleteChain } from 'atoms/delete-chain'
import BottomSheet from 'components/bottom-sheet/BottomSheet'
import DraggableContainer from 'components/draggable'
import { ManageChainDraggables, ManageChainNonDraggables } from 'components/draggable/manage-chains'
import PopupLayout from 'components/layout/popup-layout'
import NoSearchResults from 'components/no-search-results'
import Text from 'components/text'
import { BETA_CHAINS } from 'config/storage-keys'
import { useActiveChain, useSetActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet, { useUpdateKeyStore } from 'hooks/settings/useActiveWallet'
import type { ManageChainSettings } from 'hooks/settings/useManageChains'
import {
  useManageChainData,
  useToggleChainState,
  useUpdatePreferenceOrder,
} from 'hooks/settings/useManageChains'
import { Images } from 'images'
import React, { ReactElement } from 'react'
import { DropResult } from 'react-beautiful-dnd'
import { useNavigate } from 'react-router'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { Colors } from 'theme/colors'
import browser from 'webextension-polyfill'

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

const RemoveChain = ({ defaultChain }: { defaultChain: SupportedChain }) => {
  const setActiveChain = useSetActiveChain()
  const setChainInfos = useSetRecoilState(chainInfosState)
  const { activeWallet, setActiveWallet } = useActiveWallet()
  const [chain, setDeleteChain] = useRecoilState<ChainInfo | null>(deleteChain)

  const updateKeyStore = useUpdateKeyStore()
  const handleRemove = async () => {
    await browser.storage.local.get([BETA_CHAINS]).then(async (resp) => {
      const _betaChains = JSON.parse(resp['beta-chains'])
      delete _betaChains[chain?.chainName as string]
      await browser.storage.local.set({ [BETA_CHAINS]: JSON.stringify(_betaChains) })
      setChainInfos((prevChains) => {
        const _newChains = { ...prevChains }
        delete _newChains[chain?.chainName as keyof typeof _newChains]
        return _newChains
      })
      const updatedKeystore = await updateKeyStore(
        activeWallet as Key,
        chain?.chainName as unknown as SupportedChain,
        'DELETE',
      )
      await setActiveWallet(updatedKeystore[activeWallet?.id as string] as Key)
      setActiveChain(defaultChain)
      setDeleteChain(null)
    })
  }
  return (
    <BottomSheet
      isVisible={!!chain}
      onClose={() => setDeleteChain(null)}
      headerTitle='Remove Chain?'
      headerActionType={HeaderActionType.CANCEL}
    >
      <div className='flex flex-col p-7 gap-y-1'>
        <div className='text-center px-5'>
          <div className='rounded-2xl bg-white-100 dark:bg-gray-800 p-[12px] w-[48px] h-[48px] text-red-300 material-icons-round mb-4'>
            remove_circle
          </div>
          <Text size='md' color='text-gray-800 dark:text-gray-200 font-medium'>
            Are you sure you want to remove {chain?.chainName}?
          </Text>
        </div>
        <div className='flex flex-col justify-between w-full mt-7'>
          <Buttons.Generic
            style={{ height: '48px', background: Colors.gray900, color: Colors.white100 }}
            className='w-full'
            onClick={handleRemove}
          >
            Remove
          </Buttons.Generic>
          <Buttons.Generic
            style={{
              height: '48px',
              background: Colors.cosmosPrimary,
              color: Colors.white100,
            }}
            className='mt-3 bg-gray-800 w-full'
            onClick={() => setDeleteChain(null)}
          >
            Don’t Remove
          </Buttons.Generic>
        </div>
      </div>
    </BottomSheet>
  )
}

export default function ManageChain(): ReactElement {
  const [searchQuery, setSearchQuery] = React.useState('')
  const navigate = useNavigate()
  const activeChain = useActiveChain()
  const [chains] = useManageChainData()
  const [updateChainData] = useToggleChainState()
  const [updatePreferenceOrder] = useUpdatePreferenceOrder()
  const _chains = chains.filter((chain) => !chain.beta)
  const _betaChains = chains.filter((chain) => chain.beta)
  const _filteredBetaChains = _betaChains.filter((chain) =>
    chain.chainName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // function that defines what happens when a draggable is dropped
  const onDragEnd = async (result: DropResult) => {
    // dropped outside the list
    if (!result.destination) {
      return
    }
    const items: ManageChainSettings[] = reorder(
      _chains,
      result.source.index,
      result.destination.index,
    )
    updatePreferenceOrder(items)
  }

  return (
    <div className='relative'>
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
          <div className='align-middle flex flex-col items-center justify-center mt-[20px] mb-10'>
            <DraggableContainer onDragEnd={onDragEnd}>
              {_chains.filter((chain) =>
                chain.chainName.toLowerCase().includes(searchQuery.toLowerCase()),
              ).length === 0 && <NoSearchResults searchQuery={searchQuery} />}
              {searchQuery.length === 0 ? (
                <ManageChainDraggables
                  chains={_chains}
                  searchQuery={searchQuery}
                  updateChainFunction={updateChainData}
                />
              ) : (
                <ManageChainNonDraggables
                  chains={_chains}
                  searchQuery={searchQuery}
                  updateChainFunction={updateChainData}
                />
              )}
            </DraggableContainer>
            {_filteredBetaChains.length > 0 ? (
              <div className='mt-[16px]'>
                <ManageChainNonDraggables
                  chains={_filteredBetaChains}
                  searchQuery={searchQuery}
                  updateChainFunction={updateChainData}
                  title='Recently added (Beta)'
                />
              </div>
            ) : null}
          </div>
        </div>
      </PopupLayout>
      <RemoveChain defaultChain={chains[0].chainName} />
    </div>
  )
}
