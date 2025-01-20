import { CaretDown, CaretUp } from '@phosphor-icons/react'
import Text from 'components/text'
import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'

const BasicAccordion = ({
  title,
  children,
  isExpanded,
  toggleAccordion,
}: {
  title: string | React.ReactNode
  children: React.ReactNode
  isExpanded: boolean
  toggleAccordion: () => void
}) => {
  return (
    <div className='w-full flex-col bg-white-100 dark:bg-gray-900 flex items-center justify-between p-4 gap-3 rounded-2xl overflow-hidden'>
      <div
        role='button'
        tabIndex={0}
        onClick={toggleAccordion}
        className='w-full flex-row flex justify-between items-center gap-2 cursor-pointer'
      >
        <Text size='sm'>{title}</Text>

        {isExpanded ? (
          <CaretUp size={16} className='dark:text-white-100' />
        ) : (
          <CaretDown size={16} className='dark:text-white-100' />
        )}
      </div>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key='more-details'
            initial={{ height: 0, opacity: 0.6 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0.6 }}
            transition={{ duration: 0.1 }}
            className='w-full'
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BasicAccordion
