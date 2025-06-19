import { STAKE_MODE } from '@leapwallet/cosmos-wallet-hooks'

type StakeTxnMode = STAKE_MODE | 'CLAIM_AND_DELEGATE'

export const txStatusMap = {
  loading: 'in progress',
  success: 'successful',
  submitted: 'submitted',
  failed: 'failed',
}

export const txModeTitleMap: Record<StakeTxnMode, string> = {
  DELEGATE: 'Stake',
  UNDELEGATE: 'Unstake',
  REDELEGATE: 'Switching',
  CLAIM_REWARDS: 'Claim',
  CANCEL_UNDELEGATION: 'Cancel unstake',
  CLAIM_AND_DELEGATE: 'Claim',
}

export const stakeModeMap: Record<StakeTxnMode, string> = {
  DELEGATE: 'Enter amount to be staked',
  REDELEGATE: 'Enter amount to be redelegated',
  UNDELEGATE: 'Enter unstaking amount',
  CLAIM_REWARDS: 'Enter amount to be claimed',
  CANCEL_UNDELEGATION: 'Enter amount to be cancelled',
  CLAIM_AND_DELEGATE: 'Enter amount to be claimed',
}

export const stakeButtonTitleMap: Record<StakeTxnMode, string> = {
  DELEGATE: 'stake',
  UNDELEGATE: 'unstake',
  CANCEL_UNDELEGATION: 'cancel unstake',
  CLAIM_REWARDS: 'claiming',
  REDELEGATE: 'validator switching',
  CLAIM_AND_DELEGATE: 'claiming',
}

export const transitionTitleMap: Record<StakeTxnMode, string> = {
  CLAIM_REWARDS: 'Review claim',
  CLAIM_AND_DELEGATE: 'Review claim and stake',
  DELEGATE: 'Review stake',
  UNDELEGATE: 'Review unstake',
  REDELEGATE: 'Review validator switching',
  CANCEL_UNDELEGATION: 'Review cancel unstake',
}
