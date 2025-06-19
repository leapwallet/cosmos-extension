import classNames from 'classnames'
import { ErrorCard } from 'components/ErrorCard'
import { LoaderAnimation } from 'components/loader/Loader'
import React, { ReactNode } from 'react'

type FooterProps = {
  children: ReactNode
  error?: string
  isFetching?: boolean
}

export function Footer({ children, error, isFetching }: FooterProps) {
  return (
    <div
      className={classNames(
        'w-full flex flex-col flex-1 items-center box-border',
        isFetching ? 'h-full justify-center' : 'justify-end',
      )}
    >
      {error ? (
        <div className='my-2'>
          <ErrorCard text={error} />
        </div>
      ) : null}

      {!isFetching ? <>{children}</> : <LoaderAnimation color='#E18881' />}
    </div>
  )
}
