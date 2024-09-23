import BottomModal from 'components/bottom-modal'
import React from 'react'

type PriceImpactSheetProps = { isOpen: boolean; onClose: () => void }

function PriceImpactSheet({ isOpen, onClose }: PriceImpactSheetProps) {
  return (
    <BottomModal
      title='Price Impact'
      onClose={onClose}
      isOpen={isOpen}
      closeOnBackdropClick={true}
      contentClassName='!bg-white-100 dark:!bg-gray-950'
      className='p-6'
    >
      <div className='text-md !leading-[25.6px] font-medium text-gray-800 dark:text-gray-200 text-left'>
        The impact your trade has on the market price of this pool. The higher the size of the swap,
        the higher the price impact.
      </div>
    </BottomModal>
  )
}

export default PriceImpactSheet
