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

// --------------------------

export type Proposal = {
  proposal_id: string;
  content: Content;
  status: string;
  final_tally_result: FinalTallyResult;
  submit_time: string;
  deposit_end_time: string;
  total_deposit: TotalDeposit[];
  voting_start_time: string;
  voting_end_time: string;
  chain?: string;
};

export type Content = {
  '@type': string;
  title: string;
  description: string;
  records?: Record[];
  changes?: Change[];
  recipient?: string;
  amount?: {
    denom: string;
    amount: string;
  }[];
  plan?: Plan;
  subject_client_id?: string;
  substitute_client_id?: string;
};

export type FinalTallyResult = {
  yes: string;
  abstain: string;
  no: string;
  no_with_veto: string;
};

export type TotalDeposit = {
  denom: string;
  amount: string;
};

export type Record = {
  gauge_id: string;
  weight: string;
};

export type Change = {
  subspace: string;
  key: string;
  value: string;
};

export type Plan = {
  name: string;
  time: string;
  height: string;
  info: string;
  upgraded_client_state: any;
};
