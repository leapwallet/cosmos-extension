import { Check } from '@phosphor-icons/react'
import classNames from 'classnames'
import Text from 'components/text'
import React from 'react'

export default function FilterItem({
  icon,
  label,
  isSelected = false,
  isLast = false,
  onSelect,
  onRemove,
}: {
  icon: string
  label: string
  isSelected?: boolean
  isLast?: boolean
  onSelect?: () => void
  onRemove?: () => void
}) {
  return (
    <div
      className={classNames(
        'flex items-center justify-between px-2 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-900 ',
        isLast ? '' : 'border-b border-gray-200 dark:border-gray-850',
      )}
      onClick={isSelected ? onRemove : onSelect}
    >
      <div className='flex items-center gap-3'>
        <img
          src={icon}
          alt={label}
          className='w-5 h-5 rounded-full'
          onError={(e) => {
            e.currentTarget.src = `https://placehold.co/20x20?text=${label}`
          }}
        />
        <Text size='sm' className='font-semibold'>
          {label}
        </Text>
      </div>
      {isSelected && (
        <div className='bg-green-600 rounded-full p-1'>
          <Check weight='bold' color='white' className='h-3 w-3' />
        </div>
      )}
    </div>
  )
}
