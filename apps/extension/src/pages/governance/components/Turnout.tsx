import { CardDivider } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
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
      <div className='rounded-2xl mt-6 h-18 w-full roundex-xxl bg-white-100 dark:bg-gray-900'>
        {tallying.map((tally, index) => (
          <Fragment key={tally.label}>
            <div className='flex items-center justify-between p-4' key={tally.label}>
              <div className='flex flex-row items-center'>
                <p className='text-md font-bold text-gray-800 dark:text-white-100'>{tally.label}</p>
                <button onClick={() => showDetail(tally.label)} className='h-[18px] w-[18px]'>
                  <span
                    className='material-icons-round text-gray-400 ml-1'
                    style={{ fontSize: '18px' }}
                  >
                    info
                  </span>
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

      <BottomModal
        isOpen={!!detail}
        onClose={() => showDetail('')}
        title={detail}
        closeOnBackdropClick={true}
      >
        <Text size='sm' color='text-gray-800 dark:text-white-100'>
          {detail === 'Turnout'
            ? 'Defined as the percentage of voting power already casted on a proposal  as a percentage of total staked tokens.'
            : 'Defined as the minimum percentage of voting power that needs to be cast on a proposal for the result to be valid.'}
        </Text>
      </BottomModal>
    </>
  )
}
