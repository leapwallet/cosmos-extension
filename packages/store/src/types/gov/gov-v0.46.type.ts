// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Proposal2 {
  export type Root = {
    proposals: Proposal[];
    pagination: Pagination;
  };

  export type Proposal = {
    id: string;
    messages: Message[];
    status: string;
    final_tally_result: FinalTallyResult;
    submit_time: string;
    deposit_end_time: string;
    total_deposit: TotalDeposit[];
    voting_start_time: string;
    voting_end_time: string;
    metadata: string;
  };

  export type Message = {
    '@type': string;
    content?: Content;
    authority: string;
    start_time?: string;
    end_time?: string;
    amount?: Amount2[];
    ids?: string[];
    recipient?: string;
  };

  export type Content = {
    '@type': string;
    title: string;
    description: string;
    recipient?: string;
    amount?: Amount[];
    changes?: Change[];
  };

  export type Amount = {
    denom: string;
    amount: string;
  };

  export type Change = {
    subspace: string;
    key: string;
    value: string;
  };

  export type Amount2 = {
    denom: string;
    amount: string;
  };

  export type FinalTallyResult = {
    yes_count: string;
    abstain_count: string;
    no_count: string;
    no_with_veto_count: string;
  };

  export type TotalDeposit = {
    denom: string;
    amount: string;
  };

  export type Pagination = {
    next_key: any;
    total: string;
  };
}
