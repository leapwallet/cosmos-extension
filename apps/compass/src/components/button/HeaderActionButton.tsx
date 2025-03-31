import { Buttons } from '@leapwallet/leap-ui'
import { List } from '@phosphor-icons/react'
import { Button } from 'components/ui/button'
import React from 'react'
import { HeaderAction, HeaderActionType } from 'types/components'

const ActionButton = React.memo(({ type, onClick, className }: HeaderAction) => {
  switch (type) {
    case HeaderActionType.CANCEL:
      return <Buttons.Cancel onClick={onClick} className={className} />

    case HeaderActionType.BACK:
      return <Buttons.Back onClick={onClick} className={className} />

    case HeaderActionType.NAVIGATION:
      return (
        <Button onClick={onClick} size={'icon'} variant={'ghost'} className={className}>
          <List weight='bold' size={24} />
        </Button>
      )
  }
})

ActionButton.displayName = 'ActionButton'
export { ActionButton }
