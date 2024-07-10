export type VoteTally = {
  yes: string;
  no: string;
  no_with_veto?: string; // optional, because neutron does not have abstain
  abstain: string;
};

export type Proposer = {
  address: string;
  url?: string;
};

type Amount = {
  amount?: string;
  denom?: string;
};

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

export type ProposalApi = {
  proposal_id: string;
  status: ProposalStatus;
  title: string;
  description: string;
  submit_time?: Date;
  deposit_end_time?: Date;
  voting_end_time?: Date;
  voting_start_time?: Date;
  tally: VoteTally;
  proposer?: Proposer;
  total_deposit?: Amount[];
  quorum?: number;
  turnout?: number;
  chain?: string;
};
