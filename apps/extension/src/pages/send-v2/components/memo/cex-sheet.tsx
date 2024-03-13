import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import React from 'react'
import { Colors } from 'theme/colors'

type CEXSheetProps = {
  isOpen: boolean
  onClose: () => void
}

const cexBlogLink = 'https://www.leapwallet.io/blog/what-are-memo-in-cex-transfers'

export const CEXSheet: React.FC<CEXSheetProps> = ({ isOpen, onClose }) => {
  const activeChain = useActiveChain()

  return (
    <BottomModal isOpen={isOpen} closeOnBackdropClick={true} title='' onClose={onClose}>
      <div className='px-4 py-3 flex flex-col gap-4 items-center'>
        <div
          className='material-icons-round text-white-100 p-3 bg-gray-800 rounded-full'
          style={{ fontSize: '44px' }}
        >
          control_point_duplicate
        </div>
        <h2 className='text-black-100 dark:text-white-100 font-bold text-lg text-center !leading-7'>
          Sending funds to Centralized exchanges?
        </h2>
        <p className='text-gray-500 text-sm font-medium text-center'>
          Check out our blog on Memo & Withdraw to CEX to get help with your transactions
        </p>
      </div>
      <Buttons.Generic
        color={Colors.getChainColor(activeChain)}
        onClick={() => window.open(cexBlogLink)}
        className='!w-full mt-4'
      >
        <div className='flex gap-2 items-center'>
          Memo & Withdraw to CEX blog
          <div className='material-icons-round text-white-100' style={{ fontSize: 20 }}>
            launch
          </div>
        </div>
      </Buttons.Generic>
    </BottomModal>
  )
}
