import React, { ReactNode } from 'react'

type FooterProps = {
  children: ReactNode
}

export function Footer({ children }: FooterProps) {
  return (
    <div className='w-full flex flex-col justify-center items-center box-border mt-4'>
      {children}
    </div>
  )
}
