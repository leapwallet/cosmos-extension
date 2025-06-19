import { ArrowLeft } from '@phosphor-icons/react'
import { PageHeader } from 'components/header'
import { Button } from 'components/ui/button'
import React from 'react'
import { useNavigate } from 'react-router-dom'

export const AddTokenHeader = () => {
  const navigate = useNavigate()

  return (
    <PageHeader>
      <Button
        size={'icon'}
        variant={'ghost'}
        className={'text-muted-foreground hover:text-foreground hover:bg-inherit'}
        onClick={() => navigate(-1)}
        title='Back'
      >
        <ArrowLeft className='size-5' />
      </Button>

      <span className='text-mdl font-bold absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2'>
        Add Token
      </span>
    </PageHeader>
  )
}
