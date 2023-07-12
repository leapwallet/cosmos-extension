import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/constants'
import { HeaderActionType } from '@leapwallet/leap-ui'
import React from 'react'
import { useNavigate } from 'react-router-dom'

import BottomSheet from '~/components/bottom-sheet'
import CardDivider from '~/components/card-divider'
import Text from '~/components/text'
import { useActiveChain, useSetActiveChain } from '~/hooks/settings/use-active-chain'
import { ManageChainSettings, useManageChainData } from '~/hooks/settings/use-manage-chains'
import { ChainLogos } from '~/images/logos'
import { Colors } from '~/theme/colors'
import { capitalize } from '~/util/strings'

type ChainSelectorProps = {
  readonly isVisible: boolean
  readonly onClose: VoidFunction
}

export default function SelectChain({ isVisible, onClose }: ChainSelectorProps) {
  const [chains] = useManageChainData()
  const navigate = useNavigate()
  const selectedChain = useActiveChain()
  const setActiveChain = useSetActiveChain()

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onClose}
      headerTitle='Switch Chains'
      headerActionType={HeaderActionType.CANCEL}
      closeOnClickBackDrop={true}
    >
      <div className='mb-4'>
        <div className='flex flex-col rounded-2xl bg-white-100 dark:bg-gray-900 mx-7 mt-7 mb-4'>
          {chains
            .filter((chains) => chains.active)
            .map((chain: ManageChainSettings, index: number, array) => {
              const img = ChainLogos[chain.chainName as unknown as SupportedChain]
              const isLast = index === array.length - 1
              return (
                <React.Fragment key={chain.chainName}>
                  <div
                    onClick={() => {
                      setActiveChain(chain.chainName)
                      navigate('/')
                      onClose()
                    }}
                    key={chain.chainName}
                    className='flex flex-1 items-center px-4 py-2 cursor-pointer'
                  >
                    <div className='flex items-center'>
                      <img src={img} className='h-10 w-10 mr-3' />
                      <Text size='md' className='font-bold'>
                        {capitalize(chain.chainName)}
                      </Text>
                    </div>

                    {selectedChain === chain.chainName ? (
                      <span
                        className='material-icons-round ml-auto'
                        style={{ color: Colors.getChainColor(selectedChain) }}
                      >
                        check_circle
                      </span>
                    ) : null}
                  </div>
                  {!isLast && <CardDivider />}
                </React.Fragment>
              )
            })}
        </div>
        <div
          className='flex items-center rounded-2xl p-4 bg-white-100 dark:bg-gray-900 mx-7 cursor-pointer'
          onClick={() => navigate('/manage-chains')}
        >
          <span className='material-icons-round text-gray-400 mr-4'>tune</span>
          <Text size='md' className='font-bold'>
            Manage Chains
          </Text>
        </div>
      </div>
    </BottomSheet>
  )
}
