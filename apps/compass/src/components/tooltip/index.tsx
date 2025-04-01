import React from 'react'

export const Tooltip = ({ message }: { message: string }) => {
  return (
    <div
      role='tooltip'
      className='inline-block absolute invisible z-10 py-2 px-3 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 shadow-sm opacity-0 tooltip'
    >
      {message}
      <div className='tooltip-arrow' data-popper-arrow></div>
    </div>
  )
}
