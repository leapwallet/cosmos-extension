import { useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { EmptyCard } from 'components/empty-card'
import { Images } from 'images'
import React from 'react'
import { Colors } from 'theme/colors'

type NoActivityViewProps = {
  accountExplorerLink?: string
  chain: SupportedChain
}

export function NoActivityView({ accountExplorerLink, chain }: NoActivityViewProps) {
  const chains = useGetChains()

  return (
    <div className='flex flex-col h-[350px]'>
      <EmptyCard
        src={Images.Activity.ActivityIcon}
        heading='No activity'
        subHeading='Your activity will appear here'
      />

      {accountExplorerLink ? (
        <a
          href={accountExplorerLink}
          target='_blank'
          className='font-semibold text-base mt-4 text-center'
          style={{ color: Colors.getChainColor(chain, chains[chain]) }}
          rel='noreferrer'
        >
          Check on Explorer
        </a>
      ) : null}
    </div>
  )
}
