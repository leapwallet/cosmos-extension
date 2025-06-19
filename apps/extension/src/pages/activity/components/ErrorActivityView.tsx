import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { EmptyCard } from 'components/empty-card'
import { Images } from 'images'
import React from 'react'
import { Colors } from 'theme/colors'

type ErrorActivityViewProps = {
  accountExplorerLink: string
  chain: SupportedChain
}

export function ErrorActivityView({ accountExplorerLink }: ErrorActivityViewProps) {
  return (
    <div className='flex flex-col h-[350px]'>
      <EmptyCard src={Images.Activity.ActivityIcon} heading='Unable to fetch activity' />

      {accountExplorerLink ? (
        <a
          href={accountExplorerLink}
          target='_blank'
          className='font-semibold text-base mt-4 text-center'
          style={{ color: Colors.green600 }}
          rel='noreferrer'
        >
          Check on Explorer
        </a>
      ) : null}
    </div>
  )
}
