/* eslint-disable no-unused-vars */
import React from 'react'

import { ProposalStatusEnum } from '../components'

export enum NtrnProposalStatus {
  OPEN = 'open',
  EXECUTED = 'executed',
  PASSED = 'passed',
  REJECTED = 'rejected',
}

type NtrnStatusProps = {
  status: NtrnProposalStatus | ProposalStatusEnum
}

export function NtrnStatus({ status }: NtrnStatusProps) {
  switch (status) {
    case NtrnProposalStatus.OPEN:
    case ProposalStatusEnum.PROPOSAL_STATUS_IN_PROGRESS:
    case ProposalStatusEnum.PROPOSAL_STATUS_VOTING_PERIOD:
      return (
        <span className='font-semibold  dark:text-orange-300 text-orange-600'>In Progress</span>
      )
    case NtrnProposalStatus.PASSED:
    case NtrnProposalStatus.EXECUTED:
    case ProposalStatusEnum.PROPOSAL_STATUS_PASSED:
    case ProposalStatusEnum.PROPOSAL_STATUS_EXECUTED:
      return <span className='font-semibold text-green-600 dark:text-green-300'>Executed</span>
    case ProposalStatusEnum.PROPOSAL_STATUS_FAILED:
    case ProposalStatusEnum.PROPOSAL_STATUS_REJECTED:
    case NtrnProposalStatus.REJECTED:
      return <span className='font-semibold text-red-300'>Rejected</span>
    default:
      return <span className='font-semibold text-gray-400'>Unspecified</span>
  }
}
