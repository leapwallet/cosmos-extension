import { useWhitelistedUrls } from '@leapwallet/cosmos-wallet-hooks'
import classNames from 'classnames'
import RedirectionConfirmationModal from 'components/redirect-confirmation'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import React, { useCallback, useMemo, useState } from 'react'
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
  const [url, setUrl] = useState<string>('')
  const formattedDescription = useMemo(() => {
    return description.replace(/\/n/g, '\n').split(/\\n/).join('\n')
  }, [description])
  const [showRedirectConfirmation, setShowRedirectConfirmation] = useState<boolean>(false)

  const { data: allWhitelistedUrls } = useWhitelistedUrls()
  const activeChain = useActiveChain()

  const whiteListedUrls = useMemo(() => {
    if (!allWhitelistedUrls) return []
    return [...(allWhitelistedUrls[activeChain] ?? []), ...(allWhitelistedUrls['all_chains'] ?? [])]
  }, [allWhitelistedUrls, activeChain])

  const isAllowedUrl = useCallback(
    (url: string) => {
      return whiteListedUrls.some((allowedUrl) => url.includes(allowedUrl))
    },
    [whiteListedUrls],
  )

  const handleLinkClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault()
      const url = e.currentTarget.href
      if (isAllowedUrl(url)) {
        window.open(url, '_blank', 'noopener noreferrer')
      } else {
        setShowRedirectConfirmation(true)
        setUrl(url)
      }
    },
    [isAllowedUrl],
  )

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
          components={{
            a: ({ ...props }) => {
              return (
                <a {...props} target='_blank' rel='noreferrer noopener' onClick={handleLinkClick}>
                  {props.children}
                </a>
              )
            },
          }}
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

      <RedirectionConfirmationModal
        isOpen={showRedirectConfirmation}
        onClose={() => {
          setShowRedirectConfirmation(false)
        }}
        url={url}
        setUrl={setUrl}
      />
    </div>
  )
}
