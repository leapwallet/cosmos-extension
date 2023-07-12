export interface IBCData {
  $schema: string;
  chain_1: Blockchain;
  chain_2: Blockchain;
  channels: Channel[];
}

export interface Channel {
  chain_1: Blockchain;
  chain_2: Blockchain;
  ordering: string;
  version: string;
}

export interface Blockchain {
  channel_id: string;
  port_id: string;
  connection_id?: string;
}
