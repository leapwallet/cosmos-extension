import { CardDivider } from '@leapwallet/leap-ui'
import { Info } from '@phosphor-icons/react'
import BottomModal from 'components/new-bottom-modal'
import Text from 'components/text'
import React, { Fragment, useState } from 'react'
import Skeleton from 'react-loading-skeleton'

type ITally = {
  label: string
  value: number
}

export function Turnout({ tallying }: { tallying: ITally[] }) {
  const [detail, showDetail] = useState('')

  return (
    <>
      <div className='rounded-2xl bg-secondary-100 flex flex-col mt-7'>
        {tallying.map((tally, index) => (
          <Fragment key={tally.label}>
            <div className='flex items-center justify-between gap-3 px-5 py-4' key={tally.label}>
              <div className='flex flex-row items-center'>
                <p className='text-secondary-800 text-sm'>{tally.label}</p>
                <button onClick={() => showDetail(tally.label)} className='h-[16px] w-[16px]'>
                  <Info size={16} className='text-secondary-600 ml-1' />
                </button>
              </div>

              {tally.value ? (
                <p className='text-sm font-bold text-gray-800 dark:text-white-100'>
                  {`${Number(tally.value).toFixed(2)}%`}
                </p>
              ) : (
                <Skeleton count={1} width='50px' />
              )}
            </div>

            {index === 0 && <CardDivider />}
          </Fragment>
        ))}
      </div>

      <BottomModal isOpen={!!detail} onClose={() => showDetail('')} title={detail} className='p-6'>
        <Text size='sm' color='text-gray-800 dark:text-white-100'>
          {detail === 'Turnout'
            ? 'Defined as the percentage of voting power already casted on a proposal  as a percentage of total staked tokens.'
            : 'Defined as the minimum percentage of voting power that needs to be cast on a proposal for the result to be valid.'}
        </Text>
      </BottomModal>
    </>
  )
}
