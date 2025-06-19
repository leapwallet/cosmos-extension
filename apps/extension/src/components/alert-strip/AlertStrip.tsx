import { X } from '@phosphor-icons/react'
import classNames from 'classnames'
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
  showCloseButton?: boolean
  onClose?: VoidFunction
}

const AlertStrip = React.memo(
  ({
    message,
    bgColor,
    alwaysShow = false,
    onHide,
    className,
    onClick,
    timeOut = 8000,
    textClassName,
    showCloseButton = false,
    onClose,
    ...rest
  }: AlertStripProps) => {
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

    const handleClose = (e: React.MouseEvent) => {
      e.stopPropagation()
      setShow(false)
      onClose?.()
    }

    return show ? (
      <div
        className={classNames(
          'flex items-center w-full justify-center h-[36px] relative',
          className,
          {
            'cursor-pointer': !!onClick,
          },
        )}
        style={{ backgroundColor: bgColor }}
        onClick={onClick}
      >
        <Text
          size='sm'
          className={`font-bold text-center' ${textClassName ?? 'text-black-100'}`}
          data-testing-id={rest['data-testing-id']}
        >
          {message}
        </Text>
        {showCloseButton && (
          <button
            onClick={handleClose}
            className='absolute right-4 top-1/2 -translate-y-1/2 text-white-100 hover:text-gray-200'
          >
            <X size={16} />
          </button>
        )}
      </div>
    ) : null
  },
)

AlertStrip.displayName = 'AlertStrip'

export { AlertStrip }
