export type Status = 'BOND_STATUS_UNBONDED' | 'BOND_STATUS_BONDED' | 'BOND_STATUS_UNBONDING';

export interface Description {
  moniker: string;
  identity: string;
  website: string;
  security_contact: string;
  details: string;
}

export interface Restake {
  address: string;
  run_time: string | string[];
  minimum_reward: number;
}

export interface SigningInfo {
  address: string;
  start_height: string;
  index_offset: string;
  jailed_until: string;
  tombstoned: boolean;
  missed_blocks_counter: string;
}

export interface ValidatorDelegations {
  // total_tokens: string;
  // total_count: number;
  total_tokens_display: number;
  // total_usd: number;
}

export interface CommissionRate {
  rate: string;
  max_rate: string;
  max_change_rate: string;
}

export interface Commission {
  commission_rates: CommissionRate;
  update_time: string;
  rate?: number;
}

export interface Profile {
  // $schema: string;
  // name: string;
  // identity: string;
  website?: string;
  // apps?: string[];
  // twitter?: string;
}

export class Validator {
  // needed
  moniker: string;
  address: string;
  name?: string;
  operator_address: string;
  jailed?: boolean;
  status?: Status;
  tokens?: string; // needed
  description?: Description;
  unbonding_time?: string;
  delegator_shares?: string;
  commission?: Commission;
  active?: boolean; // needed
  image?: string; // needed
  keybase_image?: string; // needed
  rank?: number; // needed
  uptime?: number;
  profile?: Profile;
  delegations?: ValidatorDelegations;
  custom_attributes?: { priority?: number };
  consensus_pubkey?: { '@type': string; key: string };

  constructor(validator: any) {
    this.moniker = '';
    this.address = '';
    this.operator_address = '';

    [
      'moniker',
      'address',
      'name',
      'operator_address',
      'jailed',
      'status',
      'tokens',
      'description',
      'unbonding_time',
      'delegator_shares',
      'commission',
      'active',
      'image',
      'keybase_image',
      'rank',
      'uptime',
      'profile',
      'delegations',
      'consensus_pubkey',
    ].forEach((prop) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      this[prop] = validator[prop];
    });
  }

  // mintscan_image?: string; // needed
  // identity?: string;
  // hexAddress?: string;
  // missedBlocks?: number;
  // path?: string;
  // consensus_pubkey: { '@type': string; key: string };
  // restake?: Restake;
  // unbonding_height: string;
  // min_self_delegation: string;

  // slashes?: any[];
  // signing_info?: SigningInfo;
  // hex_address?: string;

  // uptime_periods?: [{ blocks: number; uptime: number }, { blocks: number; uptime: number }];
  // missed_blocks?: number;
  // missed_blocks_periods?: [{ blocks: number; missed: number }, { blocks: number; missed: number }];
}

export class ChainValidator {
  validators: Validator[];
  name: string;
  constructor(data: any) {
    this.validators = Array.from(data?.validators ?? []).map((v) => new Validator(v));
    this.name = data?.name;
  }
}

export type Operators = Record<string, Record<string, string>>;

export type NetworkData = {
  name: string;
  gasPrice?: string;
  ownerAddress?: string;
  default?: boolean;
  maxPerDay?: number;
  autostake?: { batchTxs: number };
  txTimeout?: number;
  gasPricePrefer?: string;
  image?: string;
  gasPriceStep?: {
    low: number;
    average: number;
    high: number;
  };
  enabled?: boolean;
  testnet?: boolean;
  gasModifier?: number;
  allowOperators?: string[];
  blockOperators?: string[];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const obj: Validator = {
//   moniker: 'NosNode🔆',
//   identity: '913CE38447233C01',
//   address: 'junovaloper10jm8fvdyqlj78w0j5nawc76wsn4pqmdxnpxsgg',
//   active: true,
//   hex_address: '154B35F02A0881E71F45CDDC4AA46FD310E20812',
//   operator_address: 'junovaloper10jm8fvdyqlj78w0j5nawc76wsn4pqmdxnpxsgg',
//   consensus_pubkey: { '@type': '/cosmos.crypto.ed25519.PubKey', key: 'LHFIPize62GfVvs4Q908HMZyRbpolrVtR3zhsHTeYto=' },
//   jailed: false,
//   status: 'BOND_STATUS_BONDED',
//   tokens: '161604542127',
//   delegator_shares: '161604542127.000000000000000000',
//   description: {
//     moniker: 'NosNode🔆',
//     identity: '913CE38447233C01',
//     website: 'https://NosNode.com',
//     security_contact: 'nos@nosnode.com',
//     details: "Nostradamus411's Juno Node",
//   },
//   unbonding_height: '0',
//   unbonding_time: '1970-01-01T00:00:00Z',
//   commission: {
//     commission_rates: {
//       rate: '0.050000000000000000',
//       max_rate: '0.500000000000000000',
//       max_change_rate: '0.100000000000000000',
//     },
//     update_time: '2021-12-15T03:18:41.024451793Z',
//     rate: 0.05,
//   },
//   min_self_delegation: '1',
//   rank: 61,
//   mintscan_image:
//     'https://raw.githubusercontent.com/cosmostation/cosmostation_token_resource/master/moniker/juno/junovaloper10jm8fvdyqlj78w0j5nawc76wsn4pqmdxnpxsgg.png',
//   keybase_image: 'https://s3.amazonaws.com/keybase_processed_uploads/61d84fdd3a5969a1f8d832ca8f536a05_360_360.jpg',
//   slashes: [],
//   signing_info: {
//     address: 'junovalcons1z49ntup2pzq7w869ehwy4fr06vgwyzqjsgsrp9',
//     start_height: '1384',
//     index_offset: '4299806',
//     jailed_until: '1970-01-01T00:00:00Z',
//     tombstoned: false,
//     missed_blocks_counter: '20',
//   },
//   delegations: {
//     total_tokens: '161603202428',
//     total_count: 749,
//     total_tokens_display: 161603.202428,
//     total_usd: 869425.2290626399,
//   },
//   image:
//     'https://raw.githubusercontent.com/cosmostation/cosmostation_token_resource/master/moniker/juno/junovaloper10jm8fvdyqlj78w0j5nawc76wsn4pqmdxnpxsgg.png',
//   uptime: 1,
//   uptime_periods: [
//     { blocks: 100, uptime: 1 },
//     { blocks: 10000, uptime: 0.998 },
//   ],
//   missed_blocks: 0,
//   missed_blocks_periods: [
//     { blocks: 100, missed: 0 },
//     { blocks: 10000, missed: 20 },
//   ],
// };
