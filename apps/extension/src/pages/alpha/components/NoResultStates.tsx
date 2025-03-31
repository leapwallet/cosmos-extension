import { motion } from 'framer-motion'
import React from 'react'

import EmptyBookmarks from './EmptyBookmarks'

export const NoFilterResult = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <EmptyBookmarks title='No Results Found' subTitle='Try using different filters' />
    </motion.div>
  )
}

export const NoSearchResult = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <EmptyBookmarks title='No Results Found' subTitle='Try searching with different keywords' />
    </motion.div>
  )
}
