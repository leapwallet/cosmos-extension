import classNames from 'classnames'
import Text from 'components/text'
import { Images } from 'images'
import React from 'react'
import { isSidePanel } from 'utils/isSidePanel'

import GoToLeapboard from './GoToLeapboard'

export default function MoreAirdrops() {
  return (
    <div className='p-4 bg-white-100 dark:bg-gray-950 rounded-xl relative overflow-hidden'>
      <Text size='sm' className='font-bold mb-1'>
        Looking for more?
      </Text>
      <Text
        size='xs'
        color='text-gray-800 dark:text-gray-200'
        className='font-medium mb-3 !leading-5'
      >
        View upcoming airdrops and check
        <br />
        eligibility for other addresses.
      </Text>
      <GoToLeapboard className='relative z-[2]' />
      <img
        src={Images.Misc.FrogHappy}
        alt='FrogHappy'
        className={classNames('absolute right-0 bottom-0 z-[1]', {
          'min-[350px]:!max-w-[40%] max-[349px]:!max-w-[32%]': isSidePanel(),
        })}
      />
    </div>
  )
}
