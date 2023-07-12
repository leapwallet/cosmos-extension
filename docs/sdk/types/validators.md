# Types - Validators

Type definitions related to validators

## `Validators`

```ts
export interface Validator {
  moniker: string;
  address: string;
  name?: string;
  identity?: string;
  hexAddress?: string;
  uptime: number;
  missedBlocks?: number;
  path?: string;
  profile?: Profile;
  operator_address: string;
  consensus_pubkey: { '@type': string; key: string };
  jailed: boolean;
  status: Status;
  tokens: string;
  delegator_shares: string;
  description: Description;
  restake?: Restake;
  unbonding_height: string;
  unbonding_time: string;
  commission: Commission;
  min_self_delegation: string;
  rank: number;

  slashes?: any[];
  signing_info?: SigningInfo;
  hex_address?: string;
  active?: boolean;
  delegations?: ValidatorDelegations;
  image?: string;
  mintscan_image?: string;
  keybase_image?: string;
  uptime_periods?: [{ blocks: number; uptime: number }, { blocks: number; uptime: number }];
  missed_blocks?: number;
  missed_blocks_periods?: [{ blocks: number; missed: number }, { blocks: number; missed: number }];
}
```