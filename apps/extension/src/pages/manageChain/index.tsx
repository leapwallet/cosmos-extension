import { Key } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, Header, HeaderActionType } from '@leapwallet/leap-ui'
import { MinusCircle } from '@phosphor-icons/react'
import BottomModal from 'components/bottom-modal'
import DraggableContainer from 'components/draggable'
import { ManageChainDraggables, ManageChainNonDraggables } from 'components/draggable/manage-chains'
import PopupLayout from 'components/layout/popup-layout'
import NoSearchResults from 'components/no-search-results'
import Text from 'components/text'
import { BETA_CHAINS } from 'config/storage-keys'
import { useSetActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet, { useUpdateKeyStore } from 'hooks/settings/useActiveWallet'
import { useChainInfos, useSetChainInfos } from 'hooks/useChainInfos'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { ReactElement } from 'react'
import { DropResult } from 'react-beautiful-dnd'
import { useNavigate } from 'react-router'
import { deleteChainStore } from 'stores/delete-chain-store'
import { ManageChainSettings, manageChainsStore } from 'stores/manage-chains-store'
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

const RemoveChain = observer(({ defaultChain }: { defaultChain: SupportedChain }) => {
  const setActiveChain = useSetActiveChain()
  const setChainInfos = useSetChainInfos()
  const chainInfos = useChainInfos()

  const { activeWallet, setActiveWallet } = useActiveWallet()

  const updateKeyStore = useUpdateKeyStore()
  const handleRemove = async () => {
    await browser.storage.local.get([BETA_CHAINS]).then(async (resp) => {
      const _betaChains = JSON.parse(resp['beta-chains'])
      delete _betaChains[deleteChainStore.chainInfo?.chainName as string]
      await browser.storage.local.set({ [BETA_CHAINS]: JSON.stringify(_betaChains) })

      const _newChains = { ...chainInfos }
      delete _newChains[deleteChainStore.chainInfo?.chainName as keyof typeof _newChains]
      setChainInfos(_newChains)

      const updatedKeystore = await updateKeyStore(
        activeWallet as Key,
        deleteChainStore.chainInfo?.chainName as unknown as SupportedChain,
        'DELETE',
      )
      await setActiveWallet(updatedKeystore[activeWallet?.id as string] as Key)
      setActiveChain(defaultChain)
      deleteChainStore.setChainInfo(null)
    })
  }
  return (
    <BottomModal
      isOpen={!!deleteChainStore.chainInfo}
      onClose={() => deleteChainStore.setChainInfo(null)}
      title={'Remove Chain?'}
    >
      <div className='flex flex-col gap-y-1'>
        <div className='text-center px-5'>
          <div className='rounded-2xl bg-white-100 dark:bg-gray-800 p-[12px] w-[48px] h-[48px] text-red-300 mb-4'>
            <MinusCircle size={24} className='text-red-300' />
          </div>
          <Text size='md' color='text-gray-800 dark:text-gray-200 font-medium'>
            Are you sure you want to remove {deleteChainStore.chainInfo?.chainName}?
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
            onClick={() => deleteChainStore.setChainInfo(null)}
          >
            Don’t Remove
          </Buttons.Generic>
        </div>
      </div>
    </BottomModal>
  )
})

export default observer(function ManageChain(): ReactElement {
  const [searchQuery, setSearchQuery] = React.useState('')
  const navigate = useNavigate()

  const _chains = manageChainsStore.chains.filter((chain) => !chain.beta)
  const _betaChains = manageChainsStore.chains.filter((chain) => chain.beta)
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

    manageChainsStore.updatePreferenceOrder(items)
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
              <img src={Images.Misc.Search} />
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
                  updateChainFunction={(chain) => manageChainsStore.toggleChain(chain)}
                />
              ) : (
                <ManageChainNonDraggables
                  chains={_chains}
                  searchQuery={searchQuery}
                  updateChainFunction={(chain) => manageChainsStore.toggleChain(chain)}
                />
              )}
            </DraggableContainer>
            {_filteredBetaChains.length > 0 ? (
              <div className='mt-[16px]'>
                <ManageChainNonDraggables
                  chains={_filteredBetaChains}
                  searchQuery={searchQuery}
                  updateChainFunction={(chain) => manageChainsStore.toggleChain(chain)}
                  title='Recently added (Beta)'
                />
              </div>
            ) : null}
          </div>
        </div>
      </PopupLayout>
      <RemoveChain defaultChain={manageChainsStore.chains[0].chainName} />
    </div>
  )
})
