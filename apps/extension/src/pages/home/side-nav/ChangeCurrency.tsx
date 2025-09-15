import BottomModal from 'components/new-bottom-modal'
import React from 'react'

import { CurrencyList } from './CurrencyList'

const ChangeCurrency = ({
  isVisible,
  goBack,
  onClose,
}: {
  isVisible: boolean
  goBack: () => void
  onClose: () => void
}) => {
  return (
    <BottomModal fullScreen isOpen={isVisible} onClose={goBack} title='Currency' className='p-6'>
      <CurrencyList onClose={onClose} />
    </BottomModal>
  )
}

export default ChangeCurrency
