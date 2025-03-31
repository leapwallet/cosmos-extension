import React from 'react'
import Markdown from 'react-markdown'
import gfm from 'remark-gfm'

import { AlphaOpportunityProps } from './AlphaOpportunity'

const remarkPlugins = [gfm]
const components = {
  a: ({ ...props }) => (
    <a
      {...props}
      target='_blank'
      rel='noreferrer noopener'
      className='text-green-600 hover:text-green-500 no-underline transition-colors'
    />
  ),
}

/**
 * renders the description for a Alpha listing using markdown
 */
export default function AlphaDescription(opportunity: AlphaOpportunityProps) {
  return (
    <div className='rounded-xl bg-white-100 dark:bg-gray-950 text-gray-700 dark:text-gray-100 px-4 border-gray-100 dark:border-[#2C2C2C] py-4 prose-neutral prose prose-sm dark:prose-invert'>
      <Markdown remarkPlugins={remarkPlugins} components={components}>
        {opportunity.descriptionActions}
      </Markdown>
    </div>
  )
}
