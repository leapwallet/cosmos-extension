import classNames from 'classnames'
import Text from 'components/text'
import { Images } from 'images'
import React, { useEffect, useState } from 'react'

export interface StepCardProps {
  stepNo: number
  description: string
  suggestion?: string
  status: 'pending' | 'processing' | 'done'
}

export default function StepCard({ stepNo, description, suggestion, status }: StepCardProps) {
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)

  useEffect(() => {
    if (status === 'pending') {
      let timer = 0
      const timerId = setInterval(() => {
        if (timer >= 4) {
          clearInterval(timerId)
          setShowSuggestions(true)
        }
        timer = timer + 1
      }, 1000)
      return () => clearInterval(timerId)
    }
  }, [status])

  const transition = 'transition-all duration-300 ease'

  return (
    <div
      className={classNames(`rounded-2xl mb-8 overflow-hidden ${transition}`, {
        'opacity-[0.4]': status === 'pending',
      })}
    >
      <div className='flex p-6 gap-6 rounded-2xl bg-gray-200 dark:bg-gray-800 items-center'>
        {status === 'pending' ? (
          <img src={Images.Misc.ConnectLedgerSteps} alt='Connect Ledger Steps' />
        ) : (
          <div
            className={classNames(
              `w-[72px] h-[72px] bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center border-2 ${transition}`,
              {
                'border-green-600': status === 'processing',
                'ripple-loader': status === 'processing',
              },
            )}
          >
            {status === 'done' && (
              <>
                <button />
                <button />
              </>
            )}
            <div
              className={`h-6 w-6 rounded-full bg-white-100 z-[10] flex items-center justify-center ${transition}`}
            >
              {status === 'done' && (
                <div className='material-icons-round text-green-600' style={{ fontSize: '32px' }}>
                  check_circle
                </div>
              )}
            </div>
          </div>
        )}
        <div className='bg-gray-400 dark:bg-gray-600 h-8 w-[2px] rounded-lg' />
        <div className='flex-1'>
          <Text size='lg' className='font-bold mb-2'>
            Step {stepNo}
          </Text>
          <Text size='md' color='text-gray-800 dark:text-gray-200' className='font-medium'>
            {description}
          </Text>
        </div>
      </div>
      {suggestion && (
        <div
          className={classNames(
            `px-4 rounded-b-[12px] font-medium text-white-100 dark:text-black-100 ${transition}`,
            {
              'opacity-0 h-0 py-0': !(showSuggestions && status === 'done'),
              'opacity-1 h-[54px] py-4': showSuggestions && status === 'done',
            },
          )}
        >
          {suggestion}
        </div>
      )}
    </div>
  )
}
