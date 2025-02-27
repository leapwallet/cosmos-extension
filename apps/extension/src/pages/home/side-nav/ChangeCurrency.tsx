import { Header, HeaderActionType } from '@leapwallet/leap-ui'
import React from 'react'

import { CurrencyList } from './CurrencyList'

const ChangeCurrency = ({ goBack }: { goBack: () => void }) => {
  return (
    <div className='pb-5 panel-width enclosing-panel '>
      <Header title='Currency' action={{ type: HeaderActionType.BACK, onClick: goBack }} />
      <CurrencyList />
    </div>
  )
}

export default ChangeCurrency
