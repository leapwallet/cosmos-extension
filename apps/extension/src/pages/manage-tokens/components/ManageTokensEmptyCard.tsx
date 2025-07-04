import { Buttons } from '@leapwallet/leap-ui'
import { EmptyCard } from 'components/empty-card'
import { Images } from 'images'
import React from 'react'

type ManageTokensEmptyCardProps = {
  onAddTokenClick: (passState?: boolean) => void
  searchedText: string
}

export function ManageTokensEmptyCard({
  onAddTokenClick,
  searchedText,
}: ManageTokensEmptyCardProps) {
  let subHeading = (
    <p className='text-[13px]'>
      Or manually add token data{' '}
      <button
        className='border-none bg-transparent hover:underline cursor-pointer font-bold text-sm'
        style={{ color: '#ad4aff' }}
        onClick={() => onAddTokenClick(false)}
      >
        here
      </button>
    </p>
  )

  if (searchedText) {
    subHeading = (
      <p className='text-[13px]'>
        Try manually adding tokens instead
        <Buttons.Generic
          onClick={() => onAddTokenClick(true)}
          className='max-w-[200px] text-gray-900 mt-[16px]'
          style={{ boxShadow: 'none' }}
        >
          Add Tokens Manually
        </Buttons.Generic>
      </p>
    )
  }

  return (
    <EmptyCard
      isRounded
      subHeading={subHeading}
      heading={
        <p className='text-[15px]'>{searchedText ? 'No results found' : 'Search for any token'}</p>
      }
      classname='flex-1 justify-center pt-0'
      src={Images.Misc.Explore}
    />
  )
}
