import React, { useEffect, useRef, useState } from 'react'

import Text from '../text'

type AlertStripProps = {
  message: React.ReactNode
  bgColor?: string
  alwaysShow?: boolean
  onHide?: VoidFunction
  className?: string
  timeOut?: number
  'data-testing-id'?: string
  textClassName?: string
  onClick?: VoidFunction
  childComponent?: React.ReactNode
}

export default function AlertStrip({
  message,
  childComponent,
  bgColor,
  alwaysShow = false,
  onHide,
  className,
  timeOut = 8000,
  textClassName,
  onClick,
  ...rest
}: AlertStripProps) {
  const [show, setShow] = useState<boolean>(true)
  const mountedRef = useRef(true)

  const fn = () => {
    new Promise((res) => setTimeout(res, timeOut)).then(() => {
      if (mountedRef.current) {
        setShow(false)
        onHide && onHide()
      }
    })
    return () => {
      mountedRef.current = false
    }
  }

  useEffect(() => {
    if (show && !alwaysShow) fn()
    return () => {
      mountedRef.current = false
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show])

  return show ? (
    <div
      className={`flex items-center w-full justify-center h-[36px]  ${className}`}
      style={{ backgroundColor: bgColor }}
      onClick={() => {
        if (onClick) {
          onClick()
        }
      }}
    >
      <Text
        size='sm'
        className={`font-bold text-center' ${textClassName ?? 'text-black-100'}`}
        data-testing-id={rest['data-testing-id']}
      >
        {childComponent ?? message}
      </Text>
    </div>
  ) : null
}
