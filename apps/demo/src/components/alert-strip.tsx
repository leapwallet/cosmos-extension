import React, { useCallback, useEffect, useRef, useState } from 'react'

import Text from '~/components/text'

type AlertStripProps = {
  message: React.ReactNode
  bgColor: string
  alwaysShow?: boolean
  onHide?: VoidFunction
}

export default function AlertStrip({
  message,
  bgColor,
  alwaysShow = false,
  onHide,
}: AlertStripProps) {
  const [show, setShow] = useState<boolean>(true)
  const mountedRef = useRef(true)

  const fn = useCallback(() => {
    new Promise((res) => setTimeout(res, 8000)).then(() => {
      if (mountedRef.current) {
        setShow(false)
        onHide && onHide()
      }
    })
    return () => {
      mountedRef.current = false
    }
  }, [onHide])

  useEffect(() => {
    if (show && !alwaysShow) fn()
    return () => {
      mountedRef.current = false
    }
  }, [alwaysShow, fn, show])

  return show ? (
    <div
      className='flex items-center w-full justify-center h-[36px]'
      style={{ backgroundColor: bgColor }}
    >
      <Text size='sm' className='font-bold text-white-100 text-center'>
        {message}
      </Text>
    </div>
  ) : null
}
