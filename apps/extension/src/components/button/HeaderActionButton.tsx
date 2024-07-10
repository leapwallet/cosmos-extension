import { Buttons } from '@leapwallet/leap-ui'
import React from 'react'
import { HeaderAction, HeaderActionType } from 'types/components'

const ActionButton = React.memo(({ type, onClick, className }: HeaderAction) => {
  switch (type) {
    case HeaderActionType.CANCEL:
      return <Buttons.Cancel onClick={onClick} className={className} />

    case HeaderActionType.BACK:
      return <Buttons.Back onClick={onClick} className={className} />

    case HeaderActionType.NAVIGATION:
      return <Buttons.Nav onClick={onClick} className={className} />
  }
})

ActionButton.displayName = 'ActionButton'
export { ActionButton }
