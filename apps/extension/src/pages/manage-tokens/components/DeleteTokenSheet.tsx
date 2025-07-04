import { NativeDenom, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import {
  ActiveChainStore,
  BetaCW20DenomsStore,
  BetaERC20DenomsStore,
  BetaNativeDenomsStore,
  ChainInfosStore,
} from '@leapwallet/cosmos-wallet-store'
import { Buttons } from '@leapwallet/leap-ui'
import BottomModal from 'components/new-bottom-modal'
import { Button } from 'components/ui/button'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useMemo } from 'react'
import { Colors } from 'theme/colors'

type DeleteTokenSheetProps = {
  isOpen: boolean
  onClose: () => void
  tokenToDelete: NativeDenom | undefined
  activeChainStore: ActiveChainStore
  chainInfosStore: ChainInfosStore
  betaNativeDenomsStore: BetaNativeDenomsStore
  betaERC20DenomsStore: BetaERC20DenomsStore
  betaCW20DenomsStore: BetaCW20DenomsStore
}

export const DeleteTokenSheet = observer(
  ({
    isOpen,
    onClose,
    tokenToDelete,
    activeChainStore,
    chainInfosStore,
    betaNativeDenomsStore,
    betaERC20DenomsStore,
    betaCW20DenomsStore,
  }: DeleteTokenSheetProps) => {
    const { activeChain } = activeChainStore
    const { chainInfos } = chainInfosStore
    const activeChainInfo = chainInfos?.[activeChain as SupportedChain]
    const { betaNativeDenoms } = betaNativeDenomsStore
    const { betaCW20Denoms } = betaCW20DenomsStore
    const { betaERC20Denoms } = betaERC20DenomsStore

    const tokenName = useMemo(() => {
      const name = tokenToDelete?.coinDenom ?? ''

      return name.slice(0, 1).toUpperCase() + name.slice(1).toLowerCase()
    }, [tokenToDelete?.coinDenom])

    const onConfirm = useCallback(() => {
      if (tokenToDelete && betaNativeDenoms[tokenToDelete?.coinMinimalDenom ?? '']) {
        betaNativeDenomsStore.removeBetaNativeDenoms(tokenToDelete?.coinMinimalDenom, activeChain)
      } else if (tokenToDelete && betaCW20Denoms[tokenToDelete?.coinMinimalDenom ?? '']) {
        betaCW20DenomsStore.removeBetaCW20Denoms(tokenToDelete?.coinMinimalDenom, activeChain)
      } else if (tokenToDelete && betaERC20Denoms[tokenToDelete?.coinMinimalDenom ?? '']) {
        betaERC20DenomsStore.removeBetaERC20Denoms(tokenToDelete?.coinMinimalDenom, activeChain)
      }

      onClose()
    }, [
      tokenToDelete,
      betaNativeDenoms,
      betaCW20Denoms,
      betaERC20Denoms,
      onClose,
      betaNativeDenomsStore,
      activeChain,
      betaCW20DenomsStore,
      betaERC20DenomsStore,
    ])

    return (
      <BottomModal title='Delete Token' onClose={onClose} className='p-6' isOpen={isOpen}>
        <div className='rounded-2xl bg-secondary-100 p-6 flex flex-col items-center text-center'>
          <div className='rounded-full bg-destructive-100 p-[18px] w-fit flex'>
            <img src={Images.Misc.DeleteTokenSheetBin} />
          </div>

          <div className='font-bold text-gray-800 dark:text-white-100 text-base mt-4'>
            Confirm Delete?
          </div>

          <div className='text-gray-400 font-medium text-sm mt-5'>
            Are you sure you want to delete your manually added “{tokenName}” token on{' '}
            {activeChainInfo.chainName}?
          </div>
        </div>

        <div className='flex flex-row justify-between mt-6 gap-3'>
          <Button
            type='button'
            className='h-[48px] flex-1 !bg-secondary-100 hover:!bg-secondary-200'
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            type='button'
            className='h-[48px] flex-1 cursor-pointer !bg-destructive-100 hover:!bg-destructive-400'
            onClick={onConfirm}
          >
            Confirm
          </Button>
        </div>
      </BottomModal>
    )
  },
)
