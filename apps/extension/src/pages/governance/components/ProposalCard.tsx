import { Proposal, ProposalApi, useChainInfo } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import React from 'react'

import { ProposalStatus, ProposalStatusEnum } from './ProposalStatus'

type ProposalCardProps = {
  proposal: Proposal | ProposalApi
  style?: React.CSSProperties
  handleClick: () => void
}

export function ProposalCard({ proposal, style, handleClick }: ProposalCardProps) {
  const chainInfo = useChainInfo((proposal.chain ?? 'cosmos') as SupportedChain)

  return (
    <div
      className='flex flex-col items-start justify-start p-5 cursor-pointer w-full bg-secondary-100 hover:bg-secondary-200 transition-colors rounded-xl mb-6'
      style={style}
      onClick={handleClick}
    >
      <p className='text-muted-foreground text-xs font-bold mb-3'>
        {chainInfo?.chainName ?? 'Unknown Chain'}
      </p>
      <p
        className='text-foreground font-bold text-[18px] mb-1'
        title={(proposal as ProposalApi)?.title ?? (proposal as Proposal)?.content?.title}
      >
        {(proposal as ProposalApi)?.title ?? (proposal as Proposal)?.content?.title}
      </p>
      <p className='text-muted-foreground text-sm font-medium'>
        #{proposal.proposal_id} · <ProposalStatus status={proposal.status as ProposalStatusEnum} />
      </p>
    </div>
  )
}
