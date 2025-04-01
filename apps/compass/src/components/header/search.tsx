import { Button } from 'components/ui/button'
import { LensIcon } from 'icons/lens-icon'
import React from 'react'
import { Link } from 'react-router-dom'

export const HeaderSearch = (props: { className?: string }) => {
  return (
    <Button variant={'ghost'} size={'icon'} asChild className={props.className}>
      <Link to='/search' className='flex items-center gap-2'>
        <LensIcon size={22} />
      </Link>
    </Button>
  )
}
