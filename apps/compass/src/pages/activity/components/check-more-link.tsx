import { CaretRight } from '@phosphor-icons/react'
import React from 'react'

export const CheckMoreLink = (props: { href: string }) => {
  return (
    <a
      rel='noreferrer'
      target='_blank'
      href={props.href}
      className='font-medium text-sm text-center text-accent-blue hover:text-accent-blue-200 flex items-center gap-1 justify-center transition-colors py-2.5'
    >
      Check more on Explorer
      <CaretRight size={14} />
    </a>
  )
}
