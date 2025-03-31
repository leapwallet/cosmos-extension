import { Button } from 'components/ui/button'
import { MenuIcon } from 'icons/menu-icon'
import React, { ReactNode } from 'react'
import { globalSheetsStore } from 'stores/ui/global-sheets-store'

type SideNavMenuOpenProps = {
  children?: ReactNode
  className?: string
}

export const SideNavMenuOpen = ({ children, className }: SideNavMenuOpenProps) => {
  const toggle = () => globalSheetsStore.toggleSideNav()

  if (children) {
    return (
      <button onClick={toggle} className={className}>
        {children}
      </button>
    )
  }

  return (
    <Button onClick={toggle} size={'icon'} variant={'ghost'} className={className}>
      <MenuIcon />
    </Button>
  )
}
