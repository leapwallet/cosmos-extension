import React from 'react'

export function TokenTitle({
  title,
  showRedirection,
  handleRedirectionClick,
}: {
  title: string
  showRedirection?: boolean
  handleRedirectionClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}) {
  return (
    <div className='flex gap-1 items-center font-bold dark:text-white-100'>
      <span className='shrink-0'>{title}</span>
      {showRedirection && (
        <button
          onClick={handleRedirectionClick}
          className='!text-md dark:text-gray-400 !leading-4 flex items-center material-icons-round'
        >
          open_in_new
        </button>
      )}
    </div>
  )
}
