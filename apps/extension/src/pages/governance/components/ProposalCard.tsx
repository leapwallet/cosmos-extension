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
      className='bg-white-100 dark:bg-gray-950 rounded-xl flex flex-col items-start justify-start gap-[2px] p-[12px] h-[112px] cursor-pointer'
      style={style}
      onClick={handleClick}
    >
      <p className='text-gray-600 dark:text-gray-400 text-[12px] font-bold'>
        {chainInfo?.chainName ?? 'Unknown Chain'}
      </p>
      <p
        className='text-black-100 dark:text-white-100 font-[700] line-clamp-2'
        title={(proposal as ProposalApi)?.title ?? (proposal as Proposal)?.content?.title}
      >
        {(proposal as ProposalApi)?.title ?? (proposal as Proposal)?.content?.title}
      </p>
      <p className='text-gray-600 dark:text-gray-400 text-[12px] font-[500]'>
        #{proposal.proposal_id} · <ProposalStatus status={proposal.status as ProposalStatusEnum} />
      </p>
    </div>
  )
}
