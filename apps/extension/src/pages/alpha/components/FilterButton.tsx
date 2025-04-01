import { FunnelSimple } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'

export default function FilterButton({
  setIsFilterDrawerOpen,
  filterCount,
}: {
  setIsFilterDrawerOpen: (isOpen: boolean) => void
  filterCount: number
}) {
  return (
    <motion.button
      className='flex items-center bg-gray-100 dark:bg-gray-900 rounded-full p-2 h-9'
      onClick={() => setIsFilterDrawerOpen(true)}
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className='flex items-center h-full'>
        <FunnelSimple className='text-gray-600 dark:text-gray-400' size={20} />
        <AnimatePresence>
          {filterCount > 0 && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{
                width: 'auto',
                opacity: 1,
                marginLeft: 6,
              }}
              exit={{
                width: 0,
                opacity: 0,
                marginLeft: 0,
              }}
              transition={{
                duration: 0.2,
                ease: [0.4, 0.0, 0.2, 1],
              }}
              className='overflow-hidden h-full flex items-center'
            >
              <span className='text-gray-600 dark:text-gray-400 text-xs whitespace-nowrap'>
                {filterCount}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  )
}
