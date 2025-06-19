import { Check } from '@phosphor-icons/react'
import React from 'react'

export default function FilterItem({
  icon,
  label,
  isSelected = false,
  onSelect,
  isLast = false,
  onRemove,
}: {
  icon: string | React.ReactNode
  label: string
  isSelected?: boolean
  isLast?: boolean
  onSelect?: () => void
  onRemove?: () => void
}) {
  return (
    <button
      onClick={isSelected ? onRemove : onSelect}
      className={`flex items-center justify-between px-2 py-3 cursor-pointer hover:bg-secondary-200 border-secondary-300 transition-colors ${
        isLast ? '' : 'border-b'
      }`}
    >
      <div className='flex items-center gap-3 p-1'>
        {typeof icon === 'string' ? (
          <img
            src={icon}
            alt={label}
            className='size-8 rounded-full'
            onError={(e) => {
              e.currentTarget.src = `https://placehold.co/20x20?text=${label}`
            }}
          />
        ) : (
          icon
        )}
        <span className='font-bold'>{label}</span>
      </div>
      {isSelected && (
        <div className='bg-primary rounded-full p-1'>
          <Check weight='bold' color='white' className='h-3 w-3' />
        </div>
      )}
    </button>
  )
}
