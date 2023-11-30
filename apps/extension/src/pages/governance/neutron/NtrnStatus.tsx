/* eslint-disable no-unused-vars */
import React from 'react'

export enum NtrnProposalStatus {
  OPEN = 'open',
  EXECUTED = 'executed',
  PASSED = 'passed',
  REJECTED = 'rejected',
}

type NtrnStatusProps = {
  status: NtrnProposalStatus
}

export function NtrnStatus({ status }: NtrnStatusProps) {
  switch (status) {
    case NtrnProposalStatus.OPEN:
      return (
        <span className='font-semibold  dark:text-orange-300 text-orange-600'>In Progress</span>
      )
    case NtrnProposalStatus.PASSED:
    case NtrnProposalStatus.EXECUTED:
      return <span className='font-semibold text-green-600 dark:text-green-300'>Executed</span>
    case NtrnProposalStatus.REJECTED:
      return <span className='font-semibold text-red-300'>Rejected</span>
    default:
      return <span className='font-semibold text-gray-400'>Unspecified</span>
  }
}
