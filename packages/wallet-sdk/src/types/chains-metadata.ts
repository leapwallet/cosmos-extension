import { BestApis, Repository } from './chains-directory';

export interface ChainMetaData {
  repository: Repository;
  chain: ChainData;
}
export interface ChainData {
  data: { calculated_apr: number };
  $schema: string;
  chain_name: string;
  status: string;
  updatelink?: string;
  network_type: string;
  pretty_name: string;
  chain_id: string;
  bech32_prefix: string;
  daemon_name: string;
  node_home: string;
  genesis: Genesis;
  codebase: Codebase;
  peers: Peers;
  apis: Apis;
  explorers: Explorer[];
  name: string;
  path: string;
  symbol: string;
  denom: string;
  decimals: number;
  coingecko_id: string;
  image: string;
  height: number;
  best_apis: BestApis;
  params?: AllParams;
  key_algos?: string[];
  slip44?: number;
  fees?: Fees;
  experimental?: boolean;
  assets: ChainAsset[];
}

export interface Fees {
  fee_tokens: {
    denom: string; // 'uosmo',
    fixed_min_gas_price: number; // 0,
    low_gas_price?: number; // 0,
    average_gas_price?: number; // 0.025,
    high_gas_price?: number; // 0.04
  }[];
}

export interface Genesis {
  genesis_url: string;
}

export interface Codebase {
  git_repo: string;
  recommended_version: string;
  compatible_versions: string[];
}

export interface Peers {
  persistent_peers: PersistentPeer[];
}

export interface PersistentPeer {
  id: string;
  address: string;
  provider?: string;
}

export interface Apis {
  rpc: API[];
  rest: API[];
  grpc: API[];
}

export interface API {
  address: string;
  provider: string;
}

export interface Explorer {
  kind: string;
  url: string;
  tx_page: string;
  account_page?: string;
}

export interface AllParams {
  authz: boolean;
  actual_block_time: number;
  actual_blocks_per_year: number;
  unbonding_time: number;
  max_validators: number;
  bonded_ratio: number;
  blocks_per_year: number;
  block_time: number;
  community_tax: number;
  base_inflation: number;
  estimated_apr: number;
  calculated_apr: number;
  bonded_tokens: string;
  total_supply: string;
  annual_provision?: string;
  minting_epoch_provision?: number;
  epoch_duration?: number;
  year_minting_provision?: number;
}

export interface ChainAsset {
  name: string;
  description: string;
  symbol: string;
  denom: string;
  decimals: number;
  coingecko_id: string;
  base: DenomUnit;
  display: DenomUnit;
  denom_units: DenomUnit[];
  logo_URIs: LogoUris;
  image: string;
  prices: Prices;
}

export interface DenomUnit {
  denom: string;
  exponent: number;
}

export interface LogoUris {
  svg: string;
  png: string;
}

export interface Prices {
  coingecko: Coingecko;
}

export interface Coingecko {
  usd: number;
}
