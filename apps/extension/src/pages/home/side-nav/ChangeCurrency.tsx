import BottomModal from 'components/new-bottom-modal'
import React from 'react'

import { CurrencyList } from './CurrencyList'

const ChangeCurrency = ({ isVisible, goBack }: { isVisible: boolean; goBack: () => void }) => {
  return (
    <BottomModal fullScreen isOpen={isVisible} onClose={goBack} title='Currency' className='p-6'>
      <CurrencyList />
    </BottomModal>
  )
}

export default ChangeCurrency
