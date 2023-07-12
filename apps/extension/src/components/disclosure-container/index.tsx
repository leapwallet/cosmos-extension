import { AnimatePresence, motion } from 'framer-motion'
import { Images } from 'images'
import React, { useCallback, useState } from 'react'

const DisclosureContainer = ({
  children,
  title,
  className,
  leftIcon,
  initialOpen = false,
}: {
  children: React.ReactNode
  title: string
  leftIcon?: string
  className?: string
  initialOpen?: boolean
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen)

  const toggle = useCallback(() => {
    setIsOpen((v) => !v)
  }, [])

  return (
    <div className='rounded-2xl p-4 mt-4 dark:bg-gray-900 bg-white-100'>
      <button className='flex items-center w-full' onClick={toggle}>
        {leftIcon ? <img src={leftIcon} className='mr-2 h-5 w-5' /> : null}
        <p className='text-gray-500 dark:text-gray-100 text-sm font-medium tracking-wide'>
          {title}
        </p>
        <div className='p-2 ml-auto cursor-pointer'>
          <img
            src={Images.Misc.DownArrow}
            alt='Down Arrow'
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            style={{ overflow: 'hidden' }}
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            transition={{ duration: 0.25 }}
            exit={{ height: 0 }}
            key='container'
            className={className}
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
export default DisclosureContainer
