import BottomModal from 'components/bottom-modal'
import Text from 'components/text'
import React from 'react'

import { useSwapContext } from '../context'

type PriceImpactSheetProps = {
  isOpen: boolean
  onClose: () => void
}

export function PriceImpactSheet({ isOpen, onClose }: PriceImpactSheetProps) {
  const { impactedPriceValue } = useSwapContext()

  return (
    <BottomModal
      isOpen={isOpen}
      closeOnBackdropClick={true}
      onClose={onClose}
      title='Price Impact Warning'
    >
      <Text size='md' className='w-[344px] m-auto text-gray-800 dark:text-white-100 flex-col'>
        You will lose {impactedPriceValue} on this Swap.
        <br />
        <br />
        Alternatives:
        <br />
        <ul>
          <li>Do a smaller swap to reduce impact or</li>
          <li>Try again later for higher liquidity</li>
        </ul>
      </Text>
    </BottomModal>
  )
}
