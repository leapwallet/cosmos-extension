import classNames from 'classnames'
import React, { useRef, useState } from 'react'

type TooltipProps = {
  children: React.ReactElement
  content: React.ReactNode
  className?: string
}

const Tooltip: React.FC<TooltipProps> = ({ children, content, className }) => {
  const [showContent, setShowContent] = useState(false)
  const timer = useRef<any>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)

  const handleMouseIn = () => {
    if (timer.current) {
      clearTimeout(timer.current)
    }
    setShowContent(true)
  }

  const handleMouseOut = () => {
    timer.current = setTimeout(() => {
      setShowContent(false)
    }, 250)
  }

  return (
    <>
      {React.cloneElement(
        children,
        {
          onMouseEnter: handleMouseIn,
          onMouseLeave: handleMouseOut,
          onTouchStart: handleMouseIn,
          onTouchEnd: handleMouseOut,
          onFocus: handleMouseIn,
          onBlur: handleMouseOut,
        },
        <>
          {children.props.children}
          {showContent ? (
            <div
              ref={tooltipRef}
              tabIndex={0}
              className={classNames(
                'absolute top-6 left-0 max-h-[40vh] overflow-y-auto rounded-lg shadow p-2 min-w-[200px] z-50 bg-opacity-90 bg-white-100 dark:bg-black-100 border dark-gray-300 dark:border-gray-500 cursor-default',
                className,
              )}
            >
              {content}
            </div>
          ) : null}
        </>,
      )}
    </>
  )
}

export default Tooltip
