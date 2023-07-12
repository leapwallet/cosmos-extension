# Types - Chains

Type definitions related to chains' data

## `ChainData`

```ts
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
```
