import { MenuIcon } from 'icons/menu-icon'
import React, { ReactNode } from 'react'
import { globalSheetsStore, SideNavDefaults } from 'stores/global-sheets-store'

type SideNavMenuOpenProps = {
  children?: ReactNode
  className?: string
  sideNavDefaults?: SideNavDefaults
}

export const SideNavMenuOpen = ({ children, className, sideNavDefaults }: SideNavMenuOpenProps) => {
  const toggle = () => globalSheetsStore.toggleSideNav(sideNavDefaults)

  if (children) {
    return (
      <button onClick={toggle} className={className}>
        {children}
      </button>
    )
  }

  return (
    <button onClick={toggle} className={className}>
      <MenuIcon />
    </button>
  )
}
