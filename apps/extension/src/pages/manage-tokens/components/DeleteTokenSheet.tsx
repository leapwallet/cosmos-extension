import {
  useActiveChain,
  useBetaCW20Tokens,
  useBetaERC20Tokens,
  useBetaNativeTokens,
  useChainInfo,
  useRemoveBetaCW20Tokens,
  useRemoveBetaERC20Tokens,
  useRemoveBetaNativeTokens,
} from '@leapwallet/cosmos-wallet-hooks'
import { NativeDenom } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import { Images } from 'images'
import React, { useMemo } from 'react'
import { Colors } from 'theme/colors'

type DeleteTokenSheetProps = {
  isOpen: boolean
  onClose: () => void
  tokenToDelete: NativeDenom | undefined
}

export function DeleteTokenSheet({ isOpen, onClose, tokenToDelete }: DeleteTokenSheetProps) {
  const activeChain = useActiveChain()
  const activeChainInfo = useChainInfo()
  const betaNativeTokens = useBetaNativeTokens()
  const betaCw20Tokens = useBetaCW20Tokens()
  const betaErc20Tokens = useBetaERC20Tokens()
  const removeBetaCW20Tokens = useRemoveBetaCW20Tokens()
  const removeBetaNativeTokens = useRemoveBetaNativeTokens()
  const removeBetaERC20Tokens = useRemoveBetaERC20Tokens()

  const tokenName = useMemo(() => {
    const name = tokenToDelete?.coinDenom ?? ''

    return name.slice(0, 1).toUpperCase() + name.slice(1).toLowerCase()
  }, [tokenToDelete?.coinDenom])

  const onConfirm = () => {
    if (tokenToDelete && betaNativeTokens[tokenToDelete?.coinMinimalDenom ?? '']) {
      removeBetaNativeTokens(tokenToDelete, activeChain)
    } else if (tokenToDelete && betaCw20Tokens[tokenToDelete?.coinMinimalDenom ?? '']) {
      removeBetaCW20Tokens(tokenToDelete, activeChain)
    } else if (tokenToDelete && betaErc20Tokens[tokenToDelete?.coinMinimalDenom ?? '']) {
      removeBetaERC20Tokens(tokenToDelete, activeChain)
    }

    onClose()
  }

  return (
    <BottomModal title='Delete Token' closeOnBackdropClick={true} onClose={onClose} isOpen={isOpen}>
      <div className='rounded-2xl bg-white-100 dark:bg-gray-900 p-8 flex flex-col items-center mb-4 text-center'>
        <div className='rounded-full bg-red-300 p-[18px] w-fit flex'>
          <img src={Images.Misc.DeleteTokenSheetBin} />
        </div>

        <div className='font-bold text-gray-800 dark:text-white-100 text-base mt-3'>
          Confirm Delete?
        </div>

        <div className='text-gray-400 font-medium text-sm'>
          Are you sure you want to delete your manually added “{tokenName}” token on{' '}
          {activeChainInfo.chainName}?
        </div>
      </div>

      <div className='flex flex-row justify-between'>
        <Buttons.Generic
          style={{ height: '48px', background: Colors.gray900, color: Colors.white100 }}
          onClick={onClose}
        >
          Cancel
        </Buttons.Generic>

        <Buttons.Generic
          style={{
            background: Colors.getChainColor(activeChain),
          }}
          className='ml-3 h-[48px] cursor-pointer text-white-100'
          onClick={onConfirm}
        >
          Confirm
        </Buttons.Generic>
      </div>
    </BottomModal>
  )
}
