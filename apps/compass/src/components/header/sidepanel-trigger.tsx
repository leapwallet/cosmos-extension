import { ArrowSquareOut } from '@phosphor-icons/react'
import { Button } from 'components/ui/button'
import { SidePanelIcon } from 'icons/side-panel-icon'
import React from 'react'
import { handleSidePanelClick, sidePanel } from 'utils/isSidePanel'

export const SidePanelTrigger = (props: { className?: string }) => {
  return (
    <Button
      variant={'ghost'}
      size={'icon'}
      className={props.className}
      onClick={handleSidePanelClick}
    >
      {sidePanel ? <ArrowSquareOut size={20} /> : <SidePanelIcon size={24} />}
    </Button>
  )
}
