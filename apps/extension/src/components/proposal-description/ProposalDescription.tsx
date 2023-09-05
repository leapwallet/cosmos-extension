import classNames from 'classnames'
import React, { useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'

type ProposalDescriptionProps = {
  title: string
  description: string
  btnColor: string
  className?: string
}

export function ProposalDescription({
  title,
  description,
  btnColor,
  className,
}: ProposalDescriptionProps) {
  const [showAll, setShowAll] = useState(false)
  const formattedDescription = useMemo(() => {
    return description.replace(/\/n/g, '\n').split(/\\n/).join('\n')
  }, [description])

  return (
    <div className={className}>
      <div className='text-sm text-gray-400 font-bold mb-2'>{title}</div>
      <div
        className={classNames('text-black-100 dark:text-white-100 break-words overflow-hidden', {
          'line-clamp-4': formattedDescription.length > 300,
          reset: showAll,
        })}
      >
        <ReactMarkdown
          remarkPlugins={[gfm]}
          className='text-sm [&>h1]:font-bold [&>h1]:text-base [&>h2]:my-1 [&>h2]:text-gray-300 markdown'
        >
          {formattedDescription}
        </ReactMarkdown>
      </div>

      {formattedDescription.length > 300 && (
        <button
          className='text-xs font-bold text-gray-400 h-6 w-full text-right'
          style={{ color: btnColor }}
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  )
}
