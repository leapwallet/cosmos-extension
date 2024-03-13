/* eslint-disable no-unused-vars */
import React from 'react'

export enum ProposalStatus {
  PROPOSAL_STATUS_IN_PROGRESS = 'PROPOSAL_STATUS_IN_PROGRESS',
  PROPOSAL_STATUS_DEPOSIT_PERIOD = 'PROPOSAL_STATUS_DEPOSIT_PERIOD',
  PROPOSAL_STATUS_VOTING_PERIOD = 'PROPOSAL_STATUS_VOTING_PERIOD',
  PROPOSAL_STATUS_PASSED = 'PROPOSAL_STATUS_PASSED',
  PROPOSAL_STATUS_EXECUTED = 'PROPOSAL_STATUS_EXECUTED',
  PROPOSAL_STATUS_FAILED = 'PROPOSAL_STATUS_FAILED',
  PROPOSAL_STATUS_REJECTED = 'PROPOSAL_STATUS_REJECTED',
  PROPOSAL_STATUS_UNSPECIFIED = 'PROPOSAL_STATUS_UNSPECIFIED',
}

export type ProposalStatusProps = {
  status: ProposalStatus
}

function Status({ status }: ProposalStatusProps): JSX.Element {
  switch (status) {
    case ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD:
      return (
        <span className=' font-semibold dark:text-orange-300 text-orange-600'>Deposit Period</span>
      )
    case ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD:
      return (
        <span className='font-semibold  dark:text-orange-300 text-orange-600'>Voting Period</span>
      )
    case ProposalStatus.PROPOSAL_STATUS_PASSED:
      return <span className='font-semibold text-green-600 dark:text-green-300'>Passed</span>
    case ProposalStatus.PROPOSAL_STATUS_FAILED:
      return <span className='font-semibold text-red-300'>Failed</span>
    case ProposalStatus.PROPOSAL_STATUS_REJECTED:
      return <span className='font-semibold text-red-300'>Rejected</span>
    case ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED:
      return <span className='font-semibold text-gray-400 '>Unspecified</span>
    default:
      return <span className='font-semibold text-gray-400'>Unspecified</span>
  }
}

export default Status
