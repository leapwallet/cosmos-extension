import React, { PropsWithChildren, ReactNode } from 'react'
import { cn } from 'utils/cn'
import { sidePanel } from 'utils/isSidePanel'

type ExtensionPageProps = {
  children?: ReactNode
  className?: string
}

export default function ExtensionPage(props: PropsWithChildren<ExtensionPageProps>) {
  return (
    <div
      className={cn(
        'relative grid place-items-center w-screen h-screen z-0 rounded-md overflow-hidden border border-secondary-300',
        sidePanel ? 'panel-height panel-width enclosing-panel' : 'p-5',
        props.className,
      )}
    >
      {props.children}
    </div>
  )
}
