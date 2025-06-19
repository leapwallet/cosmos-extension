import { SearchInput } from 'components/ui/input/search-input'
import { AnimatePresence } from 'framer-motion'
import { motion } from 'framer-motion'
import React from 'react'
import { transition250 } from 'utils/motion-variants'

const searchInputVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: 'auto' },
}

export const SearchTokensInput = ({
  searchQuery,
  setSearchQuery,
  showSearch,
}: {
  searchQuery: string
  setSearchQuery: (value: string) => void
  showSearch: boolean
}) => {
  return (
    <AnimatePresence>
      {showSearch ? (
        <motion.div
          initial='hidden'
          animate='visible'
          exit='hidden'
          variants={searchInputVariants}
          transition={transition250}
        >
          <SearchInput
            autoFocus={true}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e?.target?.value ?? '')}
            placeholder='Search by token name'
            onClear={() => setSearchQuery('')}
            className='mb-5'
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
