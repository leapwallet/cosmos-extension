export interface ChainsList {
  chains: Chain[];
  repository: Repository;
}

export interface Chain {
  operators: any;
  apyEnabled: boolean;
  prettyName: string;
  default: any;
  testnet: boolean;
  restUrl: any;
  best_apis: BestApis;
  chain_id: string;
  chain_name: string;
  decimals?: number;
  denom?: string;
  height?: number;
  image?: string;
  name: string;
  network_type: string;
  params: Params;
  path: string;
  pretty_name: string;
  status: string;
  symbol?: string;
  coingecko_id?: string;
}

export interface BestApis {
  rest: Api[];
  rpc: Api[];
}

export interface Api {
  address: string;
  provider?: string;
}

export interface Params {
  actual_block_time?: number;
  authz?: boolean;
  bonded_tokens?: string;
  calculated_apr?: number;
  total_supply?: string;
}

export interface Repository {
  branch: string;
  commit: string;
  timestamp: number;
  url: string;
}
