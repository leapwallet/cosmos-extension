export enum VoteOptions {
  YES = 'Yes',
  NO = 'No',
  NO_WITH_VETO = 'No with Veto',
  ABSTAIN = 'Abstain',
  UNSPECIFIED = 'Unspecified',
}

export type ProposalData = {
  proposals: Proposal[];
  pagination: Pagination;
};

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
};

export type Content = {
  '@type': string;
  title: string;
  description: string;
  records?: Record[];
  changes?: Change[];
  recipient?: string;
  amount?: Amount[];
  plan?: Plan;
  subject_client_id?: string;
  substitute_client_id?: string;
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

export type Amount = {
  denom: string;
  amount: string;
};

export type Plan = {
  name: string;
  time: string;
  height: string;
  info: string;
  upgraded_client_state: any;
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

export type Pagination = {
  next_key: string;
  total: string;
};
