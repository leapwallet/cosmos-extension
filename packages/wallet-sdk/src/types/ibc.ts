export type ClientStateData = {
  identified_client_state: IdentifiedClientState;
  proof: any;
  proof_height: Height;
};

export type IdentifiedClientState = {
  client_id: string;
  client_state: ClientState;
};

export type ClientState = {
  '@type': string;
  chain_id: string;
  trust_level: TrustLevel;
  trusting_period: string;
  unbonding_period: string;
  max_clock_drift: string;
  frozen_height: Height;
  latest_height: Height;
  proof_specs: ProofSpec[];
  upgrade_path: string[];
  allow_update_after_expiry: boolean;
  allow_update_after_misbehaviour: boolean;
};

export type TrustLevel = {
  numerator: string;
  denominator: string;
};

export type Height = {
  revision_number: string;
  revision_height: string;
};

export interface ProofSpec {
  leaf_spec: LeafSpec;
  inner_spec: InnerSpec;
  max_depth: number;
  min_depth: number;
}

export interface LeafSpec {
  hash: string;
  prehash_key: string;
  prehash_value: string;
  length: string;
  prefix: string;
}

export interface InnerSpec {
  child_order: number[];
  child_size: number;
  min_prefix_length: number;
  max_prefix_length: number;
  empty_child: any;
  hash: string;
}
