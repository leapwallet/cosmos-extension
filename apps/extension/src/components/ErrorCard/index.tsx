import React, { useEffect, useRef } from 'react'

type ErrorCardProps = React.ComponentPropsWithoutRef<'div'> & {
  text?: string
  'data-testing-id'?: string
}

export function ErrorCard({ text, ...props }: ErrorCardProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <div
      ref={ref}
      className='flex p-4 w-[344px] border justify-start items-center dark:border-red-800 border-red-200 dark:bg-red-900 bg-red-100 overflow-clip rounded-xl '
    >
      <span className='mr-2 dark:text-red-200 text-red-300 text-lg material-icons-round'>info</span>
      <p
        className='dark:text-red-100 text-red-300 font-medium text-sm overflow-x-auto'
        data-testing-id={props['data-testing-id']}
      >
        {text}
      </p>
    </div>
  )
}
