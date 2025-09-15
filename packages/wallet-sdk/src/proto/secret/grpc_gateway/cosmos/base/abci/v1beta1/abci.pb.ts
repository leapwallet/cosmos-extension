import * as GoogleProtobufAny from '../../../../google/protobuf/any.pb';

export type Event = {
  type?: string;
  attributes?: EventAttribute[];
};

export type EventAttribute = {
  key?: Uint8Array;
  value?: Uint8Array;
  index?: boolean;
};

export type TxResponse = {
  height?: string;
  txhash?: string;
  codespace?: string;
  code?: number;
  data?: string;
  raw_log?: string;
  logs?: ABCIMessageLog[];
  info?: string;
  gas_wanted?: string;
  gas_used?: string;
  tx?: GoogleProtobufAny.Any;
  timestamp?: string;
  events?: Event[];
};

export type ABCIMessageLog = {
  msg_index?: number;
  log?: string;
  events?: StringEvent[];
};

export type StringEvent = {
  type?: string;
  attributes?: Attribute[];
};

export type Attribute = {
  key?: string;
  value?: string;
};

export type GasInfo = {
  gas_wanted?: string;
  gas_used?: string;
};

export type Result = {
  data?: Uint8Array;
  log?: string;
  events?: Event[];
};

export type SimulationResponse = {
  gas_info?: GasInfo;
  result?: Result;
};

export type MsgData = {
  msg_type?: string;
  data?: Uint8Array;
};

export type TxMsgData = {
  data?: MsgData[];
};

export type SearchTxsResult = {
  total_count?: string;
  count?: string;
  page_number?: string;
  page_total?: string;
  limit?: string;
  txs?: TxResponse[];
};
