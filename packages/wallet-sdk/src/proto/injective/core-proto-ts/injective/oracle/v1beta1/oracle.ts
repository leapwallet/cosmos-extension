/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import { Decimal } from '@cosmjs/math';

import { BinaryReader, BinaryWriter } from '../../../../../binary';
import { base64FromBytes, bytesFromBase64 } from '../../../../../helpers';
import { Coin, CoinAmino, CoinSDKType } from '../../../cosmos/base/v1beta1/coin';
export enum OracleType {
  Unspecified = 0,
  Band = 1,
  PriceFeed = 2,
  Coinbase = 3,
  Chainlink = 4,
  Razor = 5,
  Dia = 6,
  API3 = 7,
  Uma = 8,
  Pyth = 9,
  BandIBC = 10,
  Provider = 11,
  Stork = 12,
  UNRECOGNIZED = -1,
}
export const OracleTypeSDKType = OracleType;
export const OracleTypeAmino = OracleType;
export function oracleTypeFromJSON(object: any): OracleType {
  switch (object) {
    case 0:
    case 'Unspecified':
      return OracleType.Unspecified;
    case 1:
    case 'Band':
      return OracleType.Band;
    case 2:
    case 'PriceFeed':
      return OracleType.PriceFeed;
    case 3:
    case 'Coinbase':
      return OracleType.Coinbase;
    case 4:
    case 'Chainlink':
      return OracleType.Chainlink;
    case 5:
    case 'Razor':
      return OracleType.Razor;
    case 6:
    case 'Dia':
      return OracleType.Dia;
    case 7:
    case 'API3':
      return OracleType.API3;
    case 8:
    case 'Uma':
      return OracleType.Uma;
    case 9:
    case 'Pyth':
      return OracleType.Pyth;
    case 10:
    case 'BandIBC':
      return OracleType.BandIBC;
    case 11:
    case 'Provider':
      return OracleType.Provider;
    case 12:
    case 'Stork':
      return OracleType.Stork;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return OracleType.UNRECOGNIZED;
  }
}
export function oracleTypeToJSON(object: OracleType): string {
  switch (object) {
    case OracleType.Unspecified:
      return 'Unspecified';
    case OracleType.Band:
      return 'Band';
    case OracleType.PriceFeed:
      return 'PriceFeed';
    case OracleType.Coinbase:
      return 'Coinbase';
    case OracleType.Chainlink:
      return 'Chainlink';
    case OracleType.Razor:
      return 'Razor';
    case OracleType.Dia:
      return 'Dia';
    case OracleType.API3:
      return 'API3';
    case OracleType.Uma:
      return 'Uma';
    case OracleType.Pyth:
      return 'Pyth';
    case OracleType.BandIBC:
      return 'BandIBC';
    case OracleType.Provider:
      return 'Provider';
    case OracleType.Stork:
      return 'Stork';
    case OracleType.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}
export interface Params {
  pythContract: string;
}
export interface ParamsProtoMsg {
  typeUrl: '/injective.oracle.v1beta1.Params';
  value: Uint8Array;
}
export interface ParamsAmino {
  pyth_contract?: string;
}
export interface ParamsAminoMsg {
  type: 'oracle/Params';
  value: ParamsAmino;
}
export interface ParamsSDKType {
  pyth_contract: string;
}
export interface OracleInfo {
  symbol: string;
  oracleType: OracleType;
}
export interface OracleInfoProtoMsg {
  typeUrl: '/injective.oracle.v1beta1.OracleInfo';
  value: Uint8Array;
}
export interface OracleInfoAmino {
  symbol?: string;
  oracle_type?: OracleType;
}
export interface OracleInfoAminoMsg {
  type: '/injective.oracle.v1beta1.OracleInfo';
  value: OracleInfoAmino;
}
export interface OracleInfoSDKType {
  symbol: string;
  oracle_type: OracleType;
}
export interface ChainlinkPriceState {
  feedId: string;
  answer: string;
  timestamp: bigint;
  priceState: PriceState;
}
export interface ChainlinkPriceStateProtoMsg {
  typeUrl: '/injective.oracle.v1beta1.ChainlinkPriceState';
  value: Uint8Array;
}
export interface ChainlinkPriceStateAmino {
  feed_id?: string;
  answer?: string;
  timestamp?: string;
  price_state?: PriceStateAmino;
}
export interface ChainlinkPriceStateAminoMsg {
  type: '/injective.oracle.v1beta1.ChainlinkPriceState';
  value: ChainlinkPriceStateAmino;
}
export interface ChainlinkPriceStateSDKType {
  feed_id: string;
  answer: string;
  timestamp: bigint;
  price_state: PriceStateSDKType;
}
export interface BandPriceState {
  symbol: string;
  rate: string;
  resolveTime: bigint;
  requestID: bigint;
  priceState: PriceState;
}
export interface BandPriceStateProtoMsg {
  typeUrl: '/injective.oracle.v1beta1.BandPriceState';
  value: Uint8Array;
}
export interface BandPriceStateAmino {
  symbol?: string;
  rate?: string;
  resolve_time?: string;
  request_ID?: string;
  price_state?: PriceStateAmino;
}
export interface BandPriceStateAminoMsg {
  type: '/injective.oracle.v1beta1.BandPriceState';
  value: BandPriceStateAmino;
}
export interface BandPriceStateSDKType {
  symbol: string;
  rate: string;
  resolve_time: bigint;
  request_ID: bigint;
  price_state: PriceStateSDKType;
}
export interface PriceFeedState {
  base: string;
  quote: string;
  priceState?: PriceState;
  relayers: string[];
}
export interface PriceFeedStateProtoMsg {
  typeUrl: '/injective.oracle.v1beta1.PriceFeedState';
  value: Uint8Array;
}
export interface PriceFeedStateAmino {
  base?: string;
  quote?: string;
  price_state?: PriceStateAmino;
  relayers?: string[];
}
export interface PriceFeedStateAminoMsg {
  type: '/injective.oracle.v1beta1.PriceFeedState';
  value: PriceFeedStateAmino;
}
export interface PriceFeedStateSDKType {
  base: string;
  quote: string;
  price_state?: PriceStateSDKType;
  relayers: string[];
}
export interface ProviderInfo {
  provider: string;
  relayers: string[];
}
export interface ProviderInfoProtoMsg {
  typeUrl: '/injective.oracle.v1beta1.ProviderInfo';
  value: Uint8Array;
}
export interface ProviderInfoAmino {
  provider?: string;
  relayers?: string[];
}
export interface ProviderInfoAminoMsg {
  type: '/injective.oracle.v1beta1.ProviderInfo';
  value: ProviderInfoAmino;
}
export interface ProviderInfoSDKType {
  provider: string;
  relayers: string[];
}
export interface ProviderState {
  providerInfo?: ProviderInfo;
  providerPriceStates: ProviderPriceState[];
}
export interface ProviderStateProtoMsg {
  typeUrl: '/injective.oracle.v1beta1.ProviderState';
  value: Uint8Array;
}
export interface ProviderStateAmino {
  provider_info?: ProviderInfoAmino;
  provider_price_states?: ProviderPriceStateAmino[];
}
export interface ProviderStateAminoMsg {
  type: '/injective.oracle.v1beta1.ProviderState';
  value: ProviderStateAmino;
}
export interface ProviderStateSDKType {
  provider_info?: ProviderInfoSDKType;
  provider_price_states: ProviderPriceStateSDKType[];
}
export interface ProviderPriceState {
  symbol: string;
  state?: PriceState;
}
export interface ProviderPriceStateProtoMsg {
  typeUrl: '/injective.oracle.v1beta1.ProviderPriceState';
  value: Uint8Array;
}
export interface ProviderPriceStateAmino {
  symbol?: string;
  state?: PriceStateAmino;
}
export interface ProviderPriceStateAminoMsg {
  type: '/injective.oracle.v1beta1.ProviderPriceState';
  value: ProviderPriceStateAmino;
}
export interface ProviderPriceStateSDKType {
  symbol: string;
  state?: PriceStateSDKType;
}
export interface PriceFeedInfo {
  base: string;
  quote: string;
}
export interface PriceFeedInfoProtoMsg {
  typeUrl: '/injective.oracle.v1beta1.PriceFeedInfo';
  value: Uint8Array;
}
export interface PriceFeedInfoAmino {
  base?: string;
  quote?: string;
}
export interface PriceFeedInfoAminoMsg {
  type: '/injective.oracle.v1beta1.PriceFeedInfo';
  value: PriceFeedInfoAmino;
}
export interface PriceFeedInfoSDKType {
  base: string;
  quote: string;
}
export interface PriceFeedPrice {
  price: string;
}
export interface PriceFeedPriceProtoMsg {
  typeUrl: '/injective.oracle.v1beta1.PriceFeedPrice';
  value: Uint8Array;
}
export interface PriceFeedPriceAmino {
  price?: string;
}
export interface PriceFeedPriceAminoMsg {
  type: '/injective.oracle.v1beta1.PriceFeedPrice';
  value: PriceFeedPriceAmino;
}
export interface PriceFeedPriceSDKType {
  price: string;
}
export interface CoinbasePriceState {
  /** kind should always be "prices" */
  kind: string;
  /** timestamp of the when the price was signed by coinbase */
  timestamp: bigint;
  /** the symbol of the price, e.g. BTC */
  key: string;
  /** the value of the price scaled by 1e6 */
  value: bigint;
  /** the price state */
  priceState: PriceState;
}
export interface CoinbasePriceStateProtoMsg {
  typeUrl: '/injective.oracle.v1beta1.CoinbasePriceState';
  value: Uint8Array;
}
export interface CoinbasePriceStateAmino {
  /** kind should always be "prices" */
  kind?: string;
  /** timestamp of the when the price was signed by coinbase */
  timestamp?: string;
  /** the symbol of the price, e.g. BTC */
  key?: string;
  /** the value of the price scaled by 1e6 */
  value?: string;
  /** the price state */
  price_state?: PriceStateAmino;
}
export interface CoinbasePriceStateAminoMsg {
  type: '/injective.oracle.v1beta1.CoinbasePriceState';
  value: CoinbasePriceStateAmino;
}
export interface CoinbasePriceStateSDKType {
  kind: string;
  timestamp: bigint;
  key: string;
  value: bigint;
  price_state: PriceStateSDKType;
}
export interface StorkPriceState {
  /** timestamp of the when the price was signed by stork */
  timestamp: bigint;
  /** the symbol of the price, e.g. BTC */
  symbol: string;
  /** the value of the price scaled by 1e18 */
  value: string;
  /** the price state */
  priceState: PriceState;
}
export interface StorkPriceStateProtoMsg {
  typeUrl: '/injective.oracle.v1beta1.StorkPriceState';
  value: Uint8Array;
}
export interface StorkPriceStateAmino {
  /** timestamp of the when the price was signed by stork */
  timestamp?: string;
  /** the symbol of the price, e.g. BTC */
  symbol?: string;
  /** the value of the price scaled by 1e18 */
  value?: string;
  /** the price state */
  price_state?: PriceStateAmino;
}
export interface StorkPriceStateAminoMsg {
  type: '/injective.oracle.v1beta1.StorkPriceState';
  value: StorkPriceStateAmino;
}
export interface StorkPriceStateSDKType {
  timestamp: bigint;
  symbol: string;
  value: string;
  price_state: PriceStateSDKType;
}
export interface PriceState {
  price: string;
  cumulativePrice: string;
  timestamp: bigint;
}
export interface PriceStateProtoMsg {
  typeUrl: '/injective.oracle.v1beta1.PriceState';
  value: Uint8Array;
}
export interface PriceStateAmino {
  price?: string;
  cumulative_price?: string;
  timestamp?: string;
}
export interface PriceStateAminoMsg {
  type: '/injective.oracle.v1beta1.PriceState';
  value: PriceStateAmino;
}
export interface PriceStateSDKType {
  price: string;
  cumulative_price: string;
  timestamp: bigint;
}
export interface PythPriceState {
  priceId: string;
  emaPrice: string;
  emaConf: string;
  conf: string;
  publishTime: bigint;
  priceState: PriceState;
}
export interface PythPriceStateProtoMsg {
  typeUrl: '/injective.oracle.v1beta1.PythPriceState';
  value: Uint8Array;
}
export interface PythPriceStateAmino {
  price_id?: string;
  ema_price?: string;
  ema_conf?: string;
  conf?: string;
  publish_time?: string;
  price_state?: PriceStateAmino;
}
export interface PythPriceStateAminoMsg {
  type: '/injective.oracle.v1beta1.PythPriceState';
  value: PythPriceStateAmino;
}
export interface PythPriceStateSDKType {
  price_id: string;
  ema_price: string;
  ema_conf: string;
  conf: string;
  publish_time: bigint;
  price_state: PriceStateSDKType;
}
export interface BandOracleRequest {
  /** Unique Identifier for band ibc oracle request */
  requestId: bigint;
  /**
   * OracleScriptID is the unique identifier of the oracle script to be
   * executed.
   */
  oracleScriptId: bigint;
  /** Symbols is the list of symbols to prepare in the calldata */
  symbols: string[];
  /**
   * AskCount is the number of validators that are requested to respond to this
   * oracle request. Higher value means more security, at a higher gas cost.
   */
  askCount: bigint;
  /**
   * MinCount is the minimum number of validators necessary for the request to
   * proceed to the execution phase. Higher value means more security, at the
   * cost of liveness.
   */
  minCount: bigint;
  /**
   * FeeLimit is the maximum tokens that will be paid to all data source
   * providers.
   */
  feeLimit: Coin[];
  /** PrepareGas is amount of gas to pay to prepare raw requests */
  prepareGas: bigint;
  /** ExecuteGas is amount of gas to reserve for executing */
  executeGas: bigint;
  /**
   * MinSourceCount is the minimum number of data sources that must be used by
   * each validator
   */
  minSourceCount: bigint;
}
export interface BandOracleRequestProtoMsg {
  typeUrl: '/injective.oracle.v1beta1.BandOracleRequest';
  value: Uint8Array;
}
export interface BandOracleRequestAmino {
  /** Unique Identifier for band ibc oracle request */
  request_id?: string;
  /**
   * OracleScriptID is the unique identifier of the oracle script to be
   * executed.
   */
  oracle_script_id?: string;
  /** Symbols is the list of symbols to prepare in the calldata */
  symbols?: string[];
  /**
   * AskCount is the number of validators that are requested to respond to this
   * oracle request. Higher value means more security, at a higher gas cost.
   */
  ask_count?: string;
  /**
   * MinCount is the minimum number of validators necessary for the request to
   * proceed to the execution phase. Higher value means more security, at the
   * cost of liveness.
   */
  min_count?: string;
  /**
   * FeeLimit is the maximum tokens that will be paid to all data source
   * providers.
   */
  fee_limit?: CoinAmino[];
  /** PrepareGas is amount of gas to pay to prepare raw requests */
  prepare_gas?: string;
  /** ExecuteGas is amount of gas to reserve for executing */
  execute_gas?: string;
  /**
   * MinSourceCount is the minimum number of data sources that must be used by
   * each validator
   */
  min_source_count?: string;
}
export interface BandOracleRequestAminoMsg {
  type: '/injective.oracle.v1beta1.BandOracleRequest';
  value: BandOracleRequestAmino;
}
export interface BandOracleRequestSDKType {
  request_id: bigint;
  oracle_script_id: bigint;
  symbols: string[];
  ask_count: bigint;
  min_count: bigint;
  fee_limit: CoinSDKType[];
  prepare_gas: bigint;
  execute_gas: bigint;
  min_source_count: bigint;
}
export interface BandIBCParams {
  /** true if Band IBC should be enabled */
  bandIbcEnabled: boolean;
  /** block request interval to send Band IBC prices */
  ibcRequestInterval: bigint;
  /** band IBC source channel */
  ibcSourceChannel: string;
  /** band IBC version */
  ibcVersion: string;
  /** band IBC portID */
  ibcPortId: string;
  /** legacy oracle scheme ids */
  legacyOracleIds: bigint[];
}
export interface BandIBCParamsProtoMsg {
  typeUrl: '/injective.oracle.v1beta1.BandIBCParams';
  value: Uint8Array;
}
export interface BandIBCParamsAmino {
  /** true if Band IBC should be enabled */
  band_ibc_enabled?: boolean;
  /** block request interval to send Band IBC prices */
  ibc_request_interval?: string;
  /** band IBC source channel */
  ibc_source_channel?: string;
  /** band IBC version */
  ibc_version?: string;
  /** band IBC portID */
  ibc_port_id?: string;
  /** legacy oracle scheme ids */
  legacy_oracle_ids?: string[];
}
export interface BandIBCParamsAminoMsg {
  type: '/injective.oracle.v1beta1.BandIBCParams';
  value: BandIBCParamsAmino;
}
export interface BandIBCParamsSDKType {
  band_ibc_enabled: boolean;
  ibc_request_interval: bigint;
  ibc_source_channel: string;
  ibc_version: string;
  ibc_port_id: string;
  legacy_oracle_ids: bigint[];
}
export interface SymbolPriceTimestamp {
  oracle: OracleType;
  symbolId: string;
  timestamp: bigint;
}
export interface SymbolPriceTimestampProtoMsg {
  typeUrl: '/injective.oracle.v1beta1.SymbolPriceTimestamp';
  value: Uint8Array;
}
export interface SymbolPriceTimestampAmino {
  oracle?: OracleType;
  symbol_id?: string;
  timestamp?: string;
}
export interface SymbolPriceTimestampAminoMsg {
  type: '/injective.oracle.v1beta1.SymbolPriceTimestamp';
  value: SymbolPriceTimestampAmino;
}
export interface SymbolPriceTimestampSDKType {
  oracle: OracleType;
  symbol_id: string;
  timestamp: bigint;
}
export interface LastPriceTimestamps {
  lastPriceTimestamps: SymbolPriceTimestamp[];
}
export interface LastPriceTimestampsProtoMsg {
  typeUrl: '/injective.oracle.v1beta1.LastPriceTimestamps';
  value: Uint8Array;
}
export interface LastPriceTimestampsAmino {
  last_price_timestamps?: SymbolPriceTimestampAmino[];
}
export interface LastPriceTimestampsAminoMsg {
  type: '/injective.oracle.v1beta1.LastPriceTimestamps';
  value: LastPriceTimestampsAmino;
}
export interface LastPriceTimestampsSDKType {
  last_price_timestamps: SymbolPriceTimestampSDKType[];
}
export interface PriceRecords {
  oracle: OracleType;
  symbolId: string;
  latestPriceRecords: PriceRecord[];
}
export interface PriceRecordsProtoMsg {
  typeUrl: '/injective.oracle.v1beta1.PriceRecords';
  value: Uint8Array;
}
export interface PriceRecordsAmino {
  oracle?: OracleType;
  symbol_id?: string;
  latest_price_records?: PriceRecordAmino[];
}
export interface PriceRecordsAminoMsg {
  type: '/injective.oracle.v1beta1.PriceRecords';
  value: PriceRecordsAmino;
}
export interface PriceRecordsSDKType {
  oracle: OracleType;
  symbol_id: string;
  latest_price_records: PriceRecordSDKType[];
}
export interface PriceRecord {
  timestamp: bigint;
  price: string;
}
export interface PriceRecordProtoMsg {
  typeUrl: '/injective.oracle.v1beta1.PriceRecord';
  value: Uint8Array;
}
export interface PriceRecordAmino {
  timestamp?: string;
  price?: string;
}
export interface PriceRecordAminoMsg {
  type: '/injective.oracle.v1beta1.PriceRecord';
  value: PriceRecordAmino;
}
export interface PriceRecordSDKType {
  timestamp: bigint;
  price: string;
}
/**
 * MetadataStatistics refers to the metadata summary statistics of the
 * historical sample considered
 */
export interface MetadataStatistics {
  /**
   * GroupCount refers to the number of groups used. Equals RecordsSampleSize if
   * no grouping is used
   */
  groupCount: number;
  /** RecordsSampleSize refers to the total number of records used. */
  recordsSampleSize: number;
  /**
   * Mean refers to the arithmetic mean
   * For trades, the mean is the VWAP computed over the grouped trade records ∑
   * (price * quantity) / ∑ quantity For oracle prices, the mean is computed
   * over the price records ∑ (price) / prices_count
   */
  mean: string;
  /**
   * TWAP refers to the time-weighted average price which equals ∑ (price_i *
   * ∆t_i) / ∑ ∆t_i where ∆t_i = t_i - t_{i-1}
   */
  twap: string;
  /** FirstTimestamp is the timestamp of the oldest record considered */
  firstTimestamp: bigint;
  /** LastTimestamp is the timestamp of the youngest record considered */
  lastTimestamp: bigint;
  /** MinPrice refers to the smallest individual raw price considered */
  minPrice: string;
  /** MaxPrice refers to the largest individual raw price considered */
  maxPrice: string;
  /** MedianPrice refers to the median individual raw price considered */
  medianPrice: string;
}
export interface MetadataStatisticsProtoMsg {
  typeUrl: '/injective.oracle.v1beta1.MetadataStatistics';
  value: Uint8Array;
}
/**
 * MetadataStatistics refers to the metadata summary statistics of the
 * historical sample considered
 */
export interface MetadataStatisticsAmino {
  /**
   * GroupCount refers to the number of groups used. Equals RecordsSampleSize if
   * no grouping is used
   */
  group_count?: number;
  /** RecordsSampleSize refers to the total number of records used. */
  records_sample_size?: number;
  /**
   * Mean refers to the arithmetic mean
   * For trades, the mean is the VWAP computed over the grouped trade records ∑
   * (price * quantity) / ∑ quantity For oracle prices, the mean is computed
   * over the price records ∑ (price) / prices_count
   */
  mean?: string;
  /**
   * TWAP refers to the time-weighted average price which equals ∑ (price_i *
   * ∆t_i) / ∑ ∆t_i where ∆t_i = t_i - t_{i-1}
   */
  twap?: string;
  /** FirstTimestamp is the timestamp of the oldest record considered */
  first_timestamp?: string;
  /** LastTimestamp is the timestamp of the youngest record considered */
  last_timestamp?: string;
  /** MinPrice refers to the smallest individual raw price considered */
  min_price?: string;
  /** MaxPrice refers to the largest individual raw price considered */
  max_price?: string;
  /** MedianPrice refers to the median individual raw price considered */
  median_price?: string;
}
export interface MetadataStatisticsAminoMsg {
  type: '/injective.oracle.v1beta1.MetadataStatistics';
  value: MetadataStatisticsAmino;
}
/**
 * MetadataStatistics refers to the metadata summary statistics of the
 * historical sample considered
 */
export interface MetadataStatisticsSDKType {
  group_count: number;
  records_sample_size: number;
  mean: string;
  twap: string;
  first_timestamp: bigint;
  last_timestamp: bigint;
  min_price: string;
  max_price: string;
  median_price: string;
}
export interface PriceAttestation {
  priceId: string;
  /** MaxPrice refers to the largest individual raw price considered */
  price: bigint;
  conf: bigint;
  expo: number;
  emaPrice: bigint;
  emaConf: bigint;
  emaExpo: number;
  publishTime: bigint;
}
export interface PriceAttestationProtoMsg {
  typeUrl: '/injective.oracle.v1beta1.PriceAttestation';
  value: Uint8Array;
}
export interface PriceAttestationAmino {
  price_id?: string;
  /** MaxPrice refers to the largest individual raw price considered */
  price?: string;
  conf?: string;
  expo?: number;
  ema_price?: string;
  ema_conf?: string;
  ema_expo?: number;
  publish_time?: string;
}
export interface PriceAttestationAminoMsg {
  type: '/injective.oracle.v1beta1.PriceAttestation';
  value: PriceAttestationAmino;
}
export interface PriceAttestationSDKType {
  price_id: string;
  price: bigint;
  conf: bigint;
  expo: number;
  ema_price: bigint;
  ema_conf: bigint;
  ema_expo: number;
  publish_time: bigint;
}
export interface AssetPair {
  assetId: string;
  signedPrices: SignedPriceOfAssetPair[];
}
export interface AssetPairProtoMsg {
  typeUrl: '/injective.oracle.v1beta1.AssetPair';
  value: Uint8Array;
}
export interface AssetPairAmino {
  asset_id?: string;
  signed_prices?: SignedPriceOfAssetPairAmino[];
}
export interface AssetPairAminoMsg {
  type: '/injective.oracle.v1beta1.AssetPair';
  value: AssetPairAmino;
}
export interface AssetPairSDKType {
  asset_id: string;
  signed_prices: SignedPriceOfAssetPairSDKType[];
}
export interface SignedPriceOfAssetPair {
  publisherKey: string;
  timestamp: bigint;
  price: string;
  signature: Uint8Array;
}
export interface SignedPriceOfAssetPairProtoMsg {
  typeUrl: '/injective.oracle.v1beta1.SignedPriceOfAssetPair';
  value: Uint8Array;
}
export interface SignedPriceOfAssetPairAmino {
  publisher_key?: string;
  timestamp?: string;
  price?: string;
  signature?: string;
}
export interface SignedPriceOfAssetPairAminoMsg {
  type: '/injective.oracle.v1beta1.SignedPriceOfAssetPair';
  value: SignedPriceOfAssetPairAmino;
}
export interface SignedPriceOfAssetPairSDKType {
  publisher_key: string;
  timestamp: bigint;
  price: string;
  signature: Uint8Array;
}
function createBaseParams(): Params {
  return {
    pythContract: '',
  };
}
export const Params = {
  typeUrl: '/injective.oracle.v1beta1.Params',
  encode(message: Params, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.pythContract !== '') {
      writer.uint32(10).string(message.pythContract);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Params {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pythContract = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Params>): Params {
    const message = createBaseParams();
    message.pythContract = object.pythContract ?? '';
    return message;
  },
  fromAmino(object: ParamsAmino): Params {
    const message = createBaseParams();
    if (object.pyth_contract !== undefined && object.pyth_contract !== null) {
      message.pythContract = object.pyth_contract;
    }
    return message;
  },
  toAmino(message: Params): ParamsAmino {
    const obj: any = {};
    obj.pyth_contract = message.pythContract === '' ? undefined : message.pythContract;
    return obj;
  },
  fromAminoMsg(object: ParamsAminoMsg): Params {
    return Params.fromAmino(object.value);
  },
  toAminoMsg(message: Params): ParamsAminoMsg {
    return {
      type: 'oracle/Params',
      value: Params.toAmino(message),
    };
  },
  fromProtoMsg(message: ParamsProtoMsg): Params {
    return Params.decode(message.value);
  },
  toProto(message: Params): Uint8Array {
    return Params.encode(message).finish();
  },
  toProtoMsg(message: Params): ParamsProtoMsg {
    return {
      typeUrl: '/injective.oracle.v1beta1.Params',
      value: Params.encode(message).finish(),
    };
  },
};
function createBaseOracleInfo(): OracleInfo {
  return {
    symbol: '',
    oracleType: 0,
  };
}
export const OracleInfo = {
  typeUrl: '/injective.oracle.v1beta1.OracleInfo',
  encode(message: OracleInfo, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.symbol !== '') {
      writer.uint32(10).string(message.symbol);
    }
    if (message.oracleType !== 0) {
      writer.uint32(16).int32(message.oracleType);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): OracleInfo {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOracleInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.symbol = reader.string();
          break;
        case 2:
          message.oracleType = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<OracleInfo>): OracleInfo {
    const message = createBaseOracleInfo();
    message.symbol = object.symbol ?? '';
    message.oracleType = object.oracleType ?? 0;
    return message;
  },
  fromAmino(object: OracleInfoAmino): OracleInfo {
    const message = createBaseOracleInfo();
    if (object.symbol !== undefined && object.symbol !== null) {
      message.symbol = object.symbol;
    }
    if (object.oracle_type !== undefined && object.oracle_type !== null) {
      message.oracleType = object.oracle_type;
    }
    return message;
  },
  toAmino(message: OracleInfo): OracleInfoAmino {
    const obj: any = {};
    obj.symbol = message.symbol === '' ? undefined : message.symbol;
    obj.oracle_type = message.oracleType === 0 ? undefined : message.oracleType;
    return obj;
  },
  fromAminoMsg(object: OracleInfoAminoMsg): OracleInfo {
    return OracleInfo.fromAmino(object.value);
  },
  fromProtoMsg(message: OracleInfoProtoMsg): OracleInfo {
    return OracleInfo.decode(message.value);
  },
  toProto(message: OracleInfo): Uint8Array {
    return OracleInfo.encode(message).finish();
  },
  toProtoMsg(message: OracleInfo): OracleInfoProtoMsg {
    return {
      typeUrl: '/injective.oracle.v1beta1.OracleInfo',
      value: OracleInfo.encode(message).finish(),
    };
  },
};
function createBaseChainlinkPriceState(): ChainlinkPriceState {
  return {
    feedId: '',
    answer: '',
    timestamp: BigInt(0),
    priceState: PriceState.fromPartial({}),
  };
}
export const ChainlinkPriceState = {
  typeUrl: '/injective.oracle.v1beta1.ChainlinkPriceState',
  encode(message: ChainlinkPriceState, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.feedId !== '') {
      writer.uint32(10).string(message.feedId);
    }
    if (message.answer !== '') {
      writer.uint32(18).string(Decimal.fromUserInput(message.answer, 18).atomics);
    }
    if (message.timestamp !== BigInt(0)) {
      writer.uint32(24).uint64(message.timestamp);
    }
    if (message.priceState !== undefined) {
      PriceState.encode(message.priceState, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ChainlinkPriceState {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseChainlinkPriceState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.feedId = reader.string();
          break;
        case 2:
          message.answer = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 3:
          message.timestamp = reader.uint64();
          break;
        case 4:
          message.priceState = PriceState.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<ChainlinkPriceState>): ChainlinkPriceState {
    const message = createBaseChainlinkPriceState();
    message.feedId = object.feedId ?? '';
    message.answer = object.answer ?? '';
    message.timestamp =
      object.timestamp !== undefined && object.timestamp !== null ? BigInt(object.timestamp.toString()) : BigInt(0);
    message.priceState =
      object.priceState !== undefined && object.priceState !== null
        ? PriceState.fromPartial(object.priceState)
        : undefined;
    return message;
  },
  fromAmino(object: ChainlinkPriceStateAmino): ChainlinkPriceState {
    const message = createBaseChainlinkPriceState();
    if (object.feed_id !== undefined && object.feed_id !== null) {
      message.feedId = object.feed_id;
    }
    if (object.answer !== undefined && object.answer !== null) {
      message.answer = object.answer;
    }
    if (object.timestamp !== undefined && object.timestamp !== null) {
      message.timestamp = BigInt(object.timestamp);
    }
    if (object.price_state !== undefined && object.price_state !== null) {
      message.priceState = PriceState.fromAmino(object.price_state);
    }
    return message;
  },
  toAmino(message: ChainlinkPriceState): ChainlinkPriceStateAmino {
    const obj: any = {};
    obj.feed_id = message.feedId === '' ? undefined : message.feedId;
    obj.answer = message.answer === '' ? undefined : message.answer;
    obj.timestamp = message.timestamp !== BigInt(0) ? (message.timestamp?.toString)() : undefined;
    obj.price_state = message.priceState ? PriceState.toAmino(message.priceState) : undefined;
    return obj;
  },
  fromAminoMsg(object: ChainlinkPriceStateAminoMsg): ChainlinkPriceState {
    return ChainlinkPriceState.fromAmino(object.value);
  },
  fromProtoMsg(message: ChainlinkPriceStateProtoMsg): ChainlinkPriceState {
    return ChainlinkPriceState.decode(message.value);
  },
  toProto(message: ChainlinkPriceState): Uint8Array {
    return ChainlinkPriceState.encode(message).finish();
  },
  toProtoMsg(message: ChainlinkPriceState): ChainlinkPriceStateProtoMsg {
    return {
      typeUrl: '/injective.oracle.v1beta1.ChainlinkPriceState',
      value: ChainlinkPriceState.encode(message).finish(),
    };
  },
};
function createBaseBandPriceState(): BandPriceState {
  return {
    symbol: '',
    rate: '',
    resolveTime: BigInt(0),
    requestID: BigInt(0),
    priceState: PriceState.fromPartial({}),
  };
}
export const BandPriceState = {
  typeUrl: '/injective.oracle.v1beta1.BandPriceState',
  encode(message: BandPriceState, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.symbol !== '') {
      writer.uint32(10).string(message.symbol);
    }
    if (message.rate !== '') {
      writer.uint32(18).string(message.rate);
    }
    if (message.resolveTime !== BigInt(0)) {
      writer.uint32(24).uint64(message.resolveTime);
    }
    if (message.requestID !== BigInt(0)) {
      writer.uint32(32).uint64(message.requestID);
    }
    if (message.priceState !== undefined) {
      PriceState.encode(message.priceState, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): BandPriceState {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBandPriceState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.symbol = reader.string();
          break;
        case 2:
          message.rate = reader.string();
          break;
        case 3:
          message.resolveTime = reader.uint64();
          break;
        case 4:
          message.requestID = reader.uint64();
          break;
        case 5:
          message.priceState = PriceState.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<BandPriceState>): BandPriceState {
    const message = createBaseBandPriceState();
    message.symbol = object.symbol ?? '';
    message.rate = object.rate ?? '';
    message.resolveTime =
      object.resolveTime !== undefined && object.resolveTime !== null
        ? BigInt(object.resolveTime.toString())
        : BigInt(0);
    message.requestID =
      object.requestID !== undefined && object.requestID !== null ? BigInt(object.requestID.toString()) : BigInt(0);
    message.priceState =
      object.priceState !== undefined && object.priceState !== null
        ? PriceState.fromPartial(object.priceState)
        : undefined;
    return message;
  },
  fromAmino(object: BandPriceStateAmino): BandPriceState {
    const message = createBaseBandPriceState();
    if (object.symbol !== undefined && object.symbol !== null) {
      message.symbol = object.symbol;
    }
    if (object.rate !== undefined && object.rate !== null) {
      message.rate = object.rate;
    }
    if (object.resolve_time !== undefined && object.resolve_time !== null) {
      message.resolveTime = BigInt(object.resolve_time);
    }
    if (object.request_ID !== undefined && object.request_ID !== null) {
      message.requestID = BigInt(object.request_ID);
    }
    if (object.price_state !== undefined && object.price_state !== null) {
      message.priceState = PriceState.fromAmino(object.price_state);
    }
    return message;
  },
  toAmino(message: BandPriceState): BandPriceStateAmino {
    const obj: any = {};
    obj.symbol = message.symbol === '' ? undefined : message.symbol;
    obj.rate = message.rate === '' ? undefined : message.rate;
    obj.resolve_time = message.resolveTime !== BigInt(0) ? (message.resolveTime?.toString)() : undefined;
    obj.request_ID = message.requestID !== BigInt(0) ? (message.requestID?.toString)() : undefined;
    obj.price_state = message.priceState ? PriceState.toAmino(message.priceState) : undefined;
    return obj;
  },
  fromAminoMsg(object: BandPriceStateAminoMsg): BandPriceState {
    return BandPriceState.fromAmino(object.value);
  },
  fromProtoMsg(message: BandPriceStateProtoMsg): BandPriceState {
    return BandPriceState.decode(message.value);
  },
  toProto(message: BandPriceState): Uint8Array {
    return BandPriceState.encode(message).finish();
  },
  toProtoMsg(message: BandPriceState): BandPriceStateProtoMsg {
    return {
      typeUrl: '/injective.oracle.v1beta1.BandPriceState',
      value: BandPriceState.encode(message).finish(),
    };
  },
};
function createBasePriceFeedState(): PriceFeedState {
  return {
    base: '',
    quote: '',
    priceState: undefined,
    relayers: [],
  };
}
export const PriceFeedState = {
  typeUrl: '/injective.oracle.v1beta1.PriceFeedState',
  encode(message: PriceFeedState, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.base !== '') {
      writer.uint32(10).string(message.base);
    }
    if (message.quote !== '') {
      writer.uint32(18).string(message.quote);
    }
    if (message.priceState !== undefined) {
      PriceState.encode(message.priceState, writer.uint32(26).fork()).ldelim();
    }
    for (const v of message.relayers) {
      writer.uint32(34).string(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): PriceFeedState {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePriceFeedState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.base = reader.string();
          break;
        case 2:
          message.quote = reader.string();
          break;
        case 3:
          message.priceState = PriceState.decode(reader, reader.uint32());
          break;
        case 4:
          message.relayers.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<PriceFeedState>): PriceFeedState {
    const message = createBasePriceFeedState();
    message.base = object.base ?? '';
    message.quote = object.quote ?? '';
    message.priceState =
      object.priceState !== undefined && object.priceState !== null
        ? PriceState.fromPartial(object.priceState)
        : undefined;
    message.relayers = object.relayers?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: PriceFeedStateAmino): PriceFeedState {
    const message = createBasePriceFeedState();
    if (object.base !== undefined && object.base !== null) {
      message.base = object.base;
    }
    if (object.quote !== undefined && object.quote !== null) {
      message.quote = object.quote;
    }
    if (object.price_state !== undefined && object.price_state !== null) {
      message.priceState = PriceState.fromAmino(object.price_state);
    }
    message.relayers = object.relayers?.map((e) => e) || [];
    return message;
  },
  toAmino(message: PriceFeedState): PriceFeedStateAmino {
    const obj: any = {};
    obj.base = message.base === '' ? undefined : message.base;
    obj.quote = message.quote === '' ? undefined : message.quote;
    obj.price_state = message.priceState ? PriceState.toAmino(message.priceState) : undefined;
    if (message.relayers) {
      obj.relayers = message.relayers.map((e) => e);
    } else {
      obj.relayers = message.relayers;
    }
    return obj;
  },
  fromAminoMsg(object: PriceFeedStateAminoMsg): PriceFeedState {
    return PriceFeedState.fromAmino(object.value);
  },
  fromProtoMsg(message: PriceFeedStateProtoMsg): PriceFeedState {
    return PriceFeedState.decode(message.value);
  },
  toProto(message: PriceFeedState): Uint8Array {
    return PriceFeedState.encode(message).finish();
  },
  toProtoMsg(message: PriceFeedState): PriceFeedStateProtoMsg {
    return {
      typeUrl: '/injective.oracle.v1beta1.PriceFeedState',
      value: PriceFeedState.encode(message).finish(),
    };
  },
};
function createBaseProviderInfo(): ProviderInfo {
  return {
    provider: '',
    relayers: [],
  };
}
export const ProviderInfo = {
  typeUrl: '/injective.oracle.v1beta1.ProviderInfo',
  encode(message: ProviderInfo, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.provider !== '') {
      writer.uint32(10).string(message.provider);
    }
    for (const v of message.relayers) {
      writer.uint32(18).string(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ProviderInfo {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProviderInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.provider = reader.string();
          break;
        case 2:
          message.relayers.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<ProviderInfo>): ProviderInfo {
    const message = createBaseProviderInfo();
    message.provider = object.provider ?? '';
    message.relayers = object.relayers?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: ProviderInfoAmino): ProviderInfo {
    const message = createBaseProviderInfo();
    if (object.provider !== undefined && object.provider !== null) {
      message.provider = object.provider;
    }
    message.relayers = object.relayers?.map((e) => e) || [];
    return message;
  },
  toAmino(message: ProviderInfo): ProviderInfoAmino {
    const obj: any = {};
    obj.provider = message.provider === '' ? undefined : message.provider;
    if (message.relayers) {
      obj.relayers = message.relayers.map((e) => e);
    } else {
      obj.relayers = message.relayers;
    }
    return obj;
  },
  fromAminoMsg(object: ProviderInfoAminoMsg): ProviderInfo {
    return ProviderInfo.fromAmino(object.value);
  },
  fromProtoMsg(message: ProviderInfoProtoMsg): ProviderInfo {
    return ProviderInfo.decode(message.value);
  },
  toProto(message: ProviderInfo): Uint8Array {
    return ProviderInfo.encode(message).finish();
  },
  toProtoMsg(message: ProviderInfo): ProviderInfoProtoMsg {
    return {
      typeUrl: '/injective.oracle.v1beta1.ProviderInfo',
      value: ProviderInfo.encode(message).finish(),
    };
  },
};
function createBaseProviderState(): ProviderState {
  return {
    providerInfo: undefined,
    providerPriceStates: [],
  };
}
export const ProviderState = {
  typeUrl: '/injective.oracle.v1beta1.ProviderState',
  encode(message: ProviderState, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.providerInfo !== undefined) {
      ProviderInfo.encode(message.providerInfo, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.providerPriceStates) {
      ProviderPriceState.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ProviderState {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProviderState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.providerInfo = ProviderInfo.decode(reader, reader.uint32());
          break;
        case 2:
          message.providerPriceStates.push(ProviderPriceState.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<ProviderState>): ProviderState {
    const message = createBaseProviderState();
    message.providerInfo =
      object.providerInfo !== undefined && object.providerInfo !== null
        ? ProviderInfo.fromPartial(object.providerInfo)
        : undefined;
    message.providerPriceStates = object.providerPriceStates?.map((e) => ProviderPriceState.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: ProviderStateAmino): ProviderState {
    const message = createBaseProviderState();
    if (object.provider_info !== undefined && object.provider_info !== null) {
      message.providerInfo = ProviderInfo.fromAmino(object.provider_info);
    }
    message.providerPriceStates = object.provider_price_states?.map((e) => ProviderPriceState.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: ProviderState): ProviderStateAmino {
    const obj: any = {};
    obj.provider_info = message.providerInfo ? ProviderInfo.toAmino(message.providerInfo) : undefined;
    if (message.providerPriceStates) {
      obj.provider_price_states = message.providerPriceStates.map((e) =>
        e ? ProviderPriceState.toAmino(e) : undefined,
      );
    } else {
      obj.provider_price_states = message.providerPriceStates;
    }
    return obj;
  },
  fromAminoMsg(object: ProviderStateAminoMsg): ProviderState {
    return ProviderState.fromAmino(object.value);
  },
  fromProtoMsg(message: ProviderStateProtoMsg): ProviderState {
    return ProviderState.decode(message.value);
  },
  toProto(message: ProviderState): Uint8Array {
    return ProviderState.encode(message).finish();
  },
  toProtoMsg(message: ProviderState): ProviderStateProtoMsg {
    return {
      typeUrl: '/injective.oracle.v1beta1.ProviderState',
      value: ProviderState.encode(message).finish(),
    };
  },
};
function createBaseProviderPriceState(): ProviderPriceState {
  return {
    symbol: '',
    state: undefined,
  };
}
export const ProviderPriceState = {
  typeUrl: '/injective.oracle.v1beta1.ProviderPriceState',
  encode(message: ProviderPriceState, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.symbol !== '') {
      writer.uint32(10).string(message.symbol);
    }
    if (message.state !== undefined) {
      PriceState.encode(message.state, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ProviderPriceState {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProviderPriceState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.symbol = reader.string();
          break;
        case 2:
          message.state = PriceState.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<ProviderPriceState>): ProviderPriceState {
    const message = createBaseProviderPriceState();
    message.symbol = object.symbol ?? '';
    message.state =
      object.state !== undefined && object.state !== null ? PriceState.fromPartial(object.state) : undefined;
    return message;
  },
  fromAmino(object: ProviderPriceStateAmino): ProviderPriceState {
    const message = createBaseProviderPriceState();
    if (object.symbol !== undefined && object.symbol !== null) {
      message.symbol = object.symbol;
    }
    if (object.state !== undefined && object.state !== null) {
      message.state = PriceState.fromAmino(object.state);
    }
    return message;
  },
  toAmino(message: ProviderPriceState): ProviderPriceStateAmino {
    const obj: any = {};
    obj.symbol = message.symbol === '' ? undefined : message.symbol;
    obj.state = message.state ? PriceState.toAmino(message.state) : undefined;
    return obj;
  },
  fromAminoMsg(object: ProviderPriceStateAminoMsg): ProviderPriceState {
    return ProviderPriceState.fromAmino(object.value);
  },
  fromProtoMsg(message: ProviderPriceStateProtoMsg): ProviderPriceState {
    return ProviderPriceState.decode(message.value);
  },
  toProto(message: ProviderPriceState): Uint8Array {
    return ProviderPriceState.encode(message).finish();
  },
  toProtoMsg(message: ProviderPriceState): ProviderPriceStateProtoMsg {
    return {
      typeUrl: '/injective.oracle.v1beta1.ProviderPriceState',
      value: ProviderPriceState.encode(message).finish(),
    };
  },
};
function createBasePriceFeedInfo(): PriceFeedInfo {
  return {
    base: '',
    quote: '',
  };
}
export const PriceFeedInfo = {
  typeUrl: '/injective.oracle.v1beta1.PriceFeedInfo',
  encode(message: PriceFeedInfo, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.base !== '') {
      writer.uint32(10).string(message.base);
    }
    if (message.quote !== '') {
      writer.uint32(18).string(message.quote);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): PriceFeedInfo {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePriceFeedInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.base = reader.string();
          break;
        case 2:
          message.quote = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<PriceFeedInfo>): PriceFeedInfo {
    const message = createBasePriceFeedInfo();
    message.base = object.base ?? '';
    message.quote = object.quote ?? '';
    return message;
  },
  fromAmino(object: PriceFeedInfoAmino): PriceFeedInfo {
    const message = createBasePriceFeedInfo();
    if (object.base !== undefined && object.base !== null) {
      message.base = object.base;
    }
    if (object.quote !== undefined && object.quote !== null) {
      message.quote = object.quote;
    }
    return message;
  },
  toAmino(message: PriceFeedInfo): PriceFeedInfoAmino {
    const obj: any = {};
    obj.base = message.base === '' ? undefined : message.base;
    obj.quote = message.quote === '' ? undefined : message.quote;
    return obj;
  },
  fromAminoMsg(object: PriceFeedInfoAminoMsg): PriceFeedInfo {
    return PriceFeedInfo.fromAmino(object.value);
  },
  fromProtoMsg(message: PriceFeedInfoProtoMsg): PriceFeedInfo {
    return PriceFeedInfo.decode(message.value);
  },
  toProto(message: PriceFeedInfo): Uint8Array {
    return PriceFeedInfo.encode(message).finish();
  },
  toProtoMsg(message: PriceFeedInfo): PriceFeedInfoProtoMsg {
    return {
      typeUrl: '/injective.oracle.v1beta1.PriceFeedInfo',
      value: PriceFeedInfo.encode(message).finish(),
    };
  },
};
function createBasePriceFeedPrice(): PriceFeedPrice {
  return {
    price: '',
  };
}
export const PriceFeedPrice = {
  typeUrl: '/injective.oracle.v1beta1.PriceFeedPrice',
  encode(message: PriceFeedPrice, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.price !== '') {
      writer.uint32(10).string(Decimal.fromUserInput(message.price, 18).atomics);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): PriceFeedPrice {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePriceFeedPrice();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.price = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<PriceFeedPrice>): PriceFeedPrice {
    const message = createBasePriceFeedPrice();
    message.price = object.price ?? '';
    return message;
  },
  fromAmino(object: PriceFeedPriceAmino): PriceFeedPrice {
    const message = createBasePriceFeedPrice();
    if (object.price !== undefined && object.price !== null) {
      message.price = object.price;
    }
    return message;
  },
  toAmino(message: PriceFeedPrice): PriceFeedPriceAmino {
    const obj: any = {};
    obj.price = message.price === '' ? undefined : message.price;
    return obj;
  },
  fromAminoMsg(object: PriceFeedPriceAminoMsg): PriceFeedPrice {
    return PriceFeedPrice.fromAmino(object.value);
  },
  fromProtoMsg(message: PriceFeedPriceProtoMsg): PriceFeedPrice {
    return PriceFeedPrice.decode(message.value);
  },
  toProto(message: PriceFeedPrice): Uint8Array {
    return PriceFeedPrice.encode(message).finish();
  },
  toProtoMsg(message: PriceFeedPrice): PriceFeedPriceProtoMsg {
    return {
      typeUrl: '/injective.oracle.v1beta1.PriceFeedPrice',
      value: PriceFeedPrice.encode(message).finish(),
    };
  },
};
function createBaseCoinbasePriceState(): CoinbasePriceState {
  return {
    kind: '',
    timestamp: BigInt(0),
    key: '',
    value: BigInt(0),
    priceState: PriceState.fromPartial({}),
  };
}
export const CoinbasePriceState = {
  typeUrl: '/injective.oracle.v1beta1.CoinbasePriceState',
  encode(message: CoinbasePriceState, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.kind !== '') {
      writer.uint32(10).string(message.kind);
    }
    if (message.timestamp !== BigInt(0)) {
      writer.uint32(16).uint64(message.timestamp);
    }
    if (message.key !== '') {
      writer.uint32(26).string(message.key);
    }
    if (message.value !== BigInt(0)) {
      writer.uint32(32).uint64(message.value);
    }
    if (message.priceState !== undefined) {
      PriceState.encode(message.priceState, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): CoinbasePriceState {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCoinbasePriceState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.kind = reader.string();
          break;
        case 2:
          message.timestamp = reader.uint64();
          break;
        case 3:
          message.key = reader.string();
          break;
        case 4:
          message.value = reader.uint64();
          break;
        case 5:
          message.priceState = PriceState.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<CoinbasePriceState>): CoinbasePriceState {
    const message = createBaseCoinbasePriceState();
    message.kind = object.kind ?? '';
    message.timestamp =
      object.timestamp !== undefined && object.timestamp !== null ? BigInt(object.timestamp.toString()) : BigInt(0);
    message.key = object.key ?? '';
    message.value = object.value !== undefined && object.value !== null ? BigInt(object.value.toString()) : BigInt(0);
    message.priceState =
      object.priceState !== undefined && object.priceState !== null
        ? PriceState.fromPartial(object.priceState)
        : undefined;
    return message;
  },
  fromAmino(object: CoinbasePriceStateAmino): CoinbasePriceState {
    const message = createBaseCoinbasePriceState();
    if (object.kind !== undefined && object.kind !== null) {
      message.kind = object.kind;
    }
    if (object.timestamp !== undefined && object.timestamp !== null) {
      message.timestamp = BigInt(object.timestamp);
    }
    if (object.key !== undefined && object.key !== null) {
      message.key = object.key;
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = BigInt(object.value);
    }
    if (object.price_state !== undefined && object.price_state !== null) {
      message.priceState = PriceState.fromAmino(object.price_state);
    }
    return message;
  },
  toAmino(message: CoinbasePriceState): CoinbasePriceStateAmino {
    const obj: any = {};
    obj.kind = message.kind === '' ? undefined : message.kind;
    obj.timestamp = message.timestamp !== BigInt(0) ? (message.timestamp?.toString)() : undefined;
    obj.key = message.key === '' ? undefined : message.key;
    obj.value = message.value !== BigInt(0) ? (message.value?.toString)() : undefined;
    obj.price_state = message.priceState ? PriceState.toAmino(message.priceState) : undefined;
    return obj;
  },
  fromAminoMsg(object: CoinbasePriceStateAminoMsg): CoinbasePriceState {
    return CoinbasePriceState.fromAmino(object.value);
  },
  fromProtoMsg(message: CoinbasePriceStateProtoMsg): CoinbasePriceState {
    return CoinbasePriceState.decode(message.value);
  },
  toProto(message: CoinbasePriceState): Uint8Array {
    return CoinbasePriceState.encode(message).finish();
  },
  toProtoMsg(message: CoinbasePriceState): CoinbasePriceStateProtoMsg {
    return {
      typeUrl: '/injective.oracle.v1beta1.CoinbasePriceState',
      value: CoinbasePriceState.encode(message).finish(),
    };
  },
};
function createBaseStorkPriceState(): StorkPriceState {
  return {
    timestamp: BigInt(0),
    symbol: '',
    value: '',
    priceState: PriceState.fromPartial({}),
  };
}
export const StorkPriceState = {
  typeUrl: '/injective.oracle.v1beta1.StorkPriceState',
  encode(message: StorkPriceState, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.timestamp !== BigInt(0)) {
      writer.uint32(8).uint64(message.timestamp);
    }
    if (message.symbol !== '') {
      writer.uint32(18).string(message.symbol);
    }
    if (message.value !== '') {
      writer.uint32(26).string(Decimal.fromUserInput(message.value, 18).atomics);
    }
    if (message.priceState !== undefined) {
      PriceState.encode(message.priceState, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): StorkPriceState {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStorkPriceState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.timestamp = reader.uint64();
          break;
        case 2:
          message.symbol = reader.string();
          break;
        case 3:
          message.value = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 5:
          message.priceState = PriceState.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<StorkPriceState>): StorkPriceState {
    const message = createBaseStorkPriceState();
    message.timestamp =
      object.timestamp !== undefined && object.timestamp !== null ? BigInt(object.timestamp.toString()) : BigInt(0);
    message.symbol = object.symbol ?? '';
    message.value = object.value ?? '';
    message.priceState =
      object.priceState !== undefined && object.priceState !== null
        ? PriceState.fromPartial(object.priceState)
        : undefined;
    return message;
  },
  fromAmino(object: StorkPriceStateAmino): StorkPriceState {
    const message = createBaseStorkPriceState();
    if (object.timestamp !== undefined && object.timestamp !== null) {
      message.timestamp = BigInt(object.timestamp);
    }
    if (object.symbol !== undefined && object.symbol !== null) {
      message.symbol = object.symbol;
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = object.value;
    }
    if (object.price_state !== undefined && object.price_state !== null) {
      message.priceState = PriceState.fromAmino(object.price_state);
    }
    return message;
  },
  toAmino(message: StorkPriceState): StorkPriceStateAmino {
    const obj: any = {};
    obj.timestamp = message.timestamp !== BigInt(0) ? (message.timestamp?.toString)() : undefined;
    obj.symbol = message.symbol === '' ? undefined : message.symbol;
    obj.value = message.value === '' ? undefined : message.value;
    obj.price_state = message.priceState ? PriceState.toAmino(message.priceState) : undefined;
    return obj;
  },
  fromAminoMsg(object: StorkPriceStateAminoMsg): StorkPriceState {
    return StorkPriceState.fromAmino(object.value);
  },
  fromProtoMsg(message: StorkPriceStateProtoMsg): StorkPriceState {
    return StorkPriceState.decode(message.value);
  },
  toProto(message: StorkPriceState): Uint8Array {
    return StorkPriceState.encode(message).finish();
  },
  toProtoMsg(message: StorkPriceState): StorkPriceStateProtoMsg {
    return {
      typeUrl: '/injective.oracle.v1beta1.StorkPriceState',
      value: StorkPriceState.encode(message).finish(),
    };
  },
};
function createBasePriceState(): PriceState {
  return {
    price: '',
    cumulativePrice: '',
    timestamp: BigInt(0),
  };
}
export const PriceState = {
  typeUrl: '/injective.oracle.v1beta1.PriceState',
  encode(message: PriceState, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.price !== '') {
      writer.uint32(10).string(Decimal.fromUserInput(message.price, 18).atomics);
    }
    if (message.cumulativePrice !== '') {
      writer.uint32(18).string(Decimal.fromUserInput(message.cumulativePrice, 18).atomics);
    }
    if (message.timestamp !== BigInt(0)) {
      writer.uint32(24).int64(message.timestamp);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): PriceState {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePriceState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.price = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 2:
          message.cumulativePrice = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 3:
          message.timestamp = reader.int64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<PriceState>): PriceState {
    const message = createBasePriceState();
    message.price = object.price ?? '';
    message.cumulativePrice = object.cumulativePrice ?? '';
    message.timestamp =
      object.timestamp !== undefined && object.timestamp !== null ? BigInt(object.timestamp.toString()) : BigInt(0);
    return message;
  },
  fromAmino(object: PriceStateAmino): PriceState {
    const message = createBasePriceState();
    if (object.price !== undefined && object.price !== null) {
      message.price = object.price;
    }
    if (object.cumulative_price !== undefined && object.cumulative_price !== null) {
      message.cumulativePrice = object.cumulative_price;
    }
    if (object.timestamp !== undefined && object.timestamp !== null) {
      message.timestamp = BigInt(object.timestamp);
    }
    return message;
  },
  toAmino(message: PriceState): PriceStateAmino {
    const obj: any = {};
    obj.price = message.price === '' ? undefined : message.price;
    obj.cumulative_price = message.cumulativePrice === '' ? undefined : message.cumulativePrice;
    obj.timestamp = message.timestamp !== BigInt(0) ? (message.timestamp?.toString)() : undefined;
    return obj;
  },
  fromAminoMsg(object: PriceStateAminoMsg): PriceState {
    return PriceState.fromAmino(object.value);
  },
  fromProtoMsg(message: PriceStateProtoMsg): PriceState {
    return PriceState.decode(message.value);
  },
  toProto(message: PriceState): Uint8Array {
    return PriceState.encode(message).finish();
  },
  toProtoMsg(message: PriceState): PriceStateProtoMsg {
    return {
      typeUrl: '/injective.oracle.v1beta1.PriceState',
      value: PriceState.encode(message).finish(),
    };
  },
};
function createBasePythPriceState(): PythPriceState {
  return {
    priceId: '',
    emaPrice: '',
    emaConf: '',
    conf: '',
    publishTime: BigInt(0),
    priceState: PriceState.fromPartial({}),
  };
}
export const PythPriceState = {
  typeUrl: '/injective.oracle.v1beta1.PythPriceState',
  encode(message: PythPriceState, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.priceId !== '') {
      writer.uint32(10).string(message.priceId);
    }
    if (message.emaPrice !== '') {
      writer.uint32(18).string(Decimal.fromUserInput(message.emaPrice, 18).atomics);
    }
    if (message.emaConf !== '') {
      writer.uint32(26).string(Decimal.fromUserInput(message.emaConf, 18).atomics);
    }
    if (message.conf !== '') {
      writer.uint32(34).string(Decimal.fromUserInput(message.conf, 18).atomics);
    }
    if (message.publishTime !== BigInt(0)) {
      writer.uint32(40).uint64(message.publishTime);
    }
    if (message.priceState !== undefined) {
      PriceState.encode(message.priceState, writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): PythPriceState {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePythPriceState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.priceId = reader.string();
          break;
        case 2:
          message.emaPrice = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 3:
          message.emaConf = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 4:
          message.conf = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 5:
          message.publishTime = reader.uint64();
          break;
        case 6:
          message.priceState = PriceState.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<PythPriceState>): PythPriceState {
    const message = createBasePythPriceState();
    message.priceId = object.priceId ?? '';
    message.emaPrice = object.emaPrice ?? '';
    message.emaConf = object.emaConf ?? '';
    message.conf = object.conf ?? '';
    message.publishTime =
      object.publishTime !== undefined && object.publishTime !== null
        ? BigInt(object.publishTime.toString())
        : BigInt(0);
    message.priceState =
      object.priceState !== undefined && object.priceState !== null
        ? PriceState.fromPartial(object.priceState)
        : undefined;
    return message;
  },
  fromAmino(object: PythPriceStateAmino): PythPriceState {
    const message = createBasePythPriceState();
    if (object.price_id !== undefined && object.price_id !== null) {
      message.priceId = object.price_id;
    }
    if (object.ema_price !== undefined && object.ema_price !== null) {
      message.emaPrice = object.ema_price;
    }
    if (object.ema_conf !== undefined && object.ema_conf !== null) {
      message.emaConf = object.ema_conf;
    }
    if (object.conf !== undefined && object.conf !== null) {
      message.conf = object.conf;
    }
    if (object.publish_time !== undefined && object.publish_time !== null) {
      message.publishTime = BigInt(object.publish_time);
    }
    if (object.price_state !== undefined && object.price_state !== null) {
      message.priceState = PriceState.fromAmino(object.price_state);
    }
    return message;
  },
  toAmino(message: PythPriceState): PythPriceStateAmino {
    const obj: any = {};
    obj.price_id = message.priceId === '' ? undefined : message.priceId;
    obj.ema_price = message.emaPrice === '' ? undefined : message.emaPrice;
    obj.ema_conf = message.emaConf === '' ? undefined : message.emaConf;
    obj.conf = message.conf === '' ? undefined : message.conf;
    obj.publish_time = message.publishTime !== BigInt(0) ? (message.publishTime?.toString)() : undefined;
    obj.price_state = message.priceState ? PriceState.toAmino(message.priceState) : undefined;
    return obj;
  },
  fromAminoMsg(object: PythPriceStateAminoMsg): PythPriceState {
    return PythPriceState.fromAmino(object.value);
  },
  fromProtoMsg(message: PythPriceStateProtoMsg): PythPriceState {
    return PythPriceState.decode(message.value);
  },
  toProto(message: PythPriceState): Uint8Array {
    return PythPriceState.encode(message).finish();
  },
  toProtoMsg(message: PythPriceState): PythPriceStateProtoMsg {
    return {
      typeUrl: '/injective.oracle.v1beta1.PythPriceState',
      value: PythPriceState.encode(message).finish(),
    };
  },
};
function createBaseBandOracleRequest(): BandOracleRequest {
  return {
    requestId: BigInt(0),
    oracleScriptId: BigInt(0),
    symbols: [],
    askCount: BigInt(0),
    minCount: BigInt(0),
    feeLimit: [],
    prepareGas: BigInt(0),
    executeGas: BigInt(0),
    minSourceCount: BigInt(0),
  };
}
export const BandOracleRequest = {
  typeUrl: '/injective.oracle.v1beta1.BandOracleRequest',
  encode(message: BandOracleRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.requestId !== BigInt(0)) {
      writer.uint32(8).uint64(message.requestId);
    }
    if (message.oracleScriptId !== BigInt(0)) {
      writer.uint32(16).int64(message.oracleScriptId);
    }
    for (const v of message.symbols) {
      writer.uint32(26).string(v!);
    }
    if (message.askCount !== BigInt(0)) {
      writer.uint32(32).uint64(message.askCount);
    }
    if (message.minCount !== BigInt(0)) {
      writer.uint32(40).uint64(message.minCount);
    }
    for (const v of message.feeLimit) {
      Coin.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    if (message.prepareGas !== BigInt(0)) {
      writer.uint32(56).uint64(message.prepareGas);
    }
    if (message.executeGas !== BigInt(0)) {
      writer.uint32(64).uint64(message.executeGas);
    }
    if (message.minSourceCount !== BigInt(0)) {
      writer.uint32(72).uint64(message.minSourceCount);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): BandOracleRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBandOracleRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.requestId = reader.uint64();
          break;
        case 2:
          message.oracleScriptId = reader.int64();
          break;
        case 3:
          message.symbols.push(reader.string());
          break;
        case 4:
          message.askCount = reader.uint64();
          break;
        case 5:
          message.minCount = reader.uint64();
          break;
        case 6:
          message.feeLimit.push(Coin.decode(reader, reader.uint32()));
          break;
        case 7:
          message.prepareGas = reader.uint64();
          break;
        case 8:
          message.executeGas = reader.uint64();
          break;
        case 9:
          message.minSourceCount = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<BandOracleRequest>): BandOracleRequest {
    const message = createBaseBandOracleRequest();
    message.requestId =
      object.requestId !== undefined && object.requestId !== null ? BigInt(object.requestId.toString()) : BigInt(0);
    message.oracleScriptId =
      object.oracleScriptId !== undefined && object.oracleScriptId !== null
        ? BigInt(object.oracleScriptId.toString())
        : BigInt(0);
    message.symbols = object.symbols?.map((e) => e) || [];
    message.askCount =
      object.askCount !== undefined && object.askCount !== null ? BigInt(object.askCount.toString()) : BigInt(0);
    message.minCount =
      object.minCount !== undefined && object.minCount !== null ? BigInt(object.minCount.toString()) : BigInt(0);
    message.feeLimit = object.feeLimit?.map((e) => Coin.fromPartial(e)) || [];
    message.prepareGas =
      object.prepareGas !== undefined && object.prepareGas !== null ? BigInt(object.prepareGas.toString()) : BigInt(0);
    message.executeGas =
      object.executeGas !== undefined && object.executeGas !== null ? BigInt(object.executeGas.toString()) : BigInt(0);
    message.minSourceCount =
      object.minSourceCount !== undefined && object.minSourceCount !== null
        ? BigInt(object.minSourceCount.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: BandOracleRequestAmino): BandOracleRequest {
    const message = createBaseBandOracleRequest();
    if (object.request_id !== undefined && object.request_id !== null) {
      message.requestId = BigInt(object.request_id);
    }
    if (object.oracle_script_id !== undefined && object.oracle_script_id !== null) {
      message.oracleScriptId = BigInt(object.oracle_script_id);
    }
    message.symbols = object.symbols?.map((e) => e) || [];
    if (object.ask_count !== undefined && object.ask_count !== null) {
      message.askCount = BigInt(object.ask_count);
    }
    if (object.min_count !== undefined && object.min_count !== null) {
      message.minCount = BigInt(object.min_count);
    }
    message.feeLimit = object.fee_limit?.map((e) => Coin.fromAmino(e)) || [];
    if (object.prepare_gas !== undefined && object.prepare_gas !== null) {
      message.prepareGas = BigInt(object.prepare_gas);
    }
    if (object.execute_gas !== undefined && object.execute_gas !== null) {
      message.executeGas = BigInt(object.execute_gas);
    }
    if (object.min_source_count !== undefined && object.min_source_count !== null) {
      message.minSourceCount = BigInt(object.min_source_count);
    }
    return message;
  },
  toAmino(message: BandOracleRequest): BandOracleRequestAmino {
    const obj: any = {};
    obj.request_id = message.requestId !== BigInt(0) ? (message.requestId?.toString)() : undefined;
    obj.oracle_script_id = message.oracleScriptId !== BigInt(0) ? (message.oracleScriptId?.toString)() : undefined;
    if (message.symbols) {
      obj.symbols = message.symbols.map((e) => e);
    } else {
      obj.symbols = message.symbols;
    }
    obj.ask_count = message.askCount !== BigInt(0) ? (message.askCount?.toString)() : undefined;
    obj.min_count = message.minCount !== BigInt(0) ? (message.minCount?.toString)() : undefined;
    if (message.feeLimit) {
      obj.fee_limit = message.feeLimit.map((e) => (e ? Coin.toAmino(e) : undefined));
    } else {
      obj.fee_limit = message.feeLimit;
    }
    obj.prepare_gas = message.prepareGas !== BigInt(0) ? (message.prepareGas?.toString)() : undefined;
    obj.execute_gas = message.executeGas !== BigInt(0) ? (message.executeGas?.toString)() : undefined;
    obj.min_source_count = message.minSourceCount !== BigInt(0) ? (message.minSourceCount?.toString)() : undefined;
    return obj;
  },
  fromAminoMsg(object: BandOracleRequestAminoMsg): BandOracleRequest {
    return BandOracleRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: BandOracleRequestProtoMsg): BandOracleRequest {
    return BandOracleRequest.decode(message.value);
  },
  toProto(message: BandOracleRequest): Uint8Array {
    return BandOracleRequest.encode(message).finish();
  },
  toProtoMsg(message: BandOracleRequest): BandOracleRequestProtoMsg {
    return {
      typeUrl: '/injective.oracle.v1beta1.BandOracleRequest',
      value: BandOracleRequest.encode(message).finish(),
    };
  },
};
function createBaseBandIBCParams(): BandIBCParams {
  return {
    bandIbcEnabled: false,
    ibcRequestInterval: BigInt(0),
    ibcSourceChannel: '',
    ibcVersion: '',
    ibcPortId: '',
    legacyOracleIds: [],
  };
}
export const BandIBCParams = {
  typeUrl: '/injective.oracle.v1beta1.BandIBCParams',
  encode(message: BandIBCParams, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.bandIbcEnabled === true) {
      writer.uint32(8).bool(message.bandIbcEnabled);
    }
    if (message.ibcRequestInterval !== BigInt(0)) {
      writer.uint32(16).int64(message.ibcRequestInterval);
    }
    if (message.ibcSourceChannel !== '') {
      writer.uint32(26).string(message.ibcSourceChannel);
    }
    if (message.ibcVersion !== '') {
      writer.uint32(34).string(message.ibcVersion);
    }
    if (message.ibcPortId !== '') {
      writer.uint32(42).string(message.ibcPortId);
    }
    writer.uint32(50).fork();
    for (const v of message.legacyOracleIds) {
      writer.int64(v);
    }
    writer.ldelim();
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): BandIBCParams {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBandIBCParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.bandIbcEnabled = reader.bool();
          break;
        case 2:
          message.ibcRequestInterval = reader.int64();
          break;
        case 3:
          message.ibcSourceChannel = reader.string();
          break;
        case 4:
          message.ibcVersion = reader.string();
          break;
        case 5:
          message.ibcPortId = reader.string();
          break;
        case 6:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.legacyOracleIds.push(reader.int64());
            }
          } else {
            message.legacyOracleIds.push(reader.int64());
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<BandIBCParams>): BandIBCParams {
    const message = createBaseBandIBCParams();
    message.bandIbcEnabled = object.bandIbcEnabled ?? false;
    message.ibcRequestInterval =
      object.ibcRequestInterval !== undefined && object.ibcRequestInterval !== null
        ? BigInt(object.ibcRequestInterval.toString())
        : BigInt(0);
    message.ibcSourceChannel = object.ibcSourceChannel ?? '';
    message.ibcVersion = object.ibcVersion ?? '';
    message.ibcPortId = object.ibcPortId ?? '';
    message.legacyOracleIds = object.legacyOracleIds?.map((e) => BigInt(e.toString())) || [];
    return message;
  },
  fromAmino(object: BandIBCParamsAmino): BandIBCParams {
    const message = createBaseBandIBCParams();
    if (object.band_ibc_enabled !== undefined && object.band_ibc_enabled !== null) {
      message.bandIbcEnabled = object.band_ibc_enabled;
    }
    if (object.ibc_request_interval !== undefined && object.ibc_request_interval !== null) {
      message.ibcRequestInterval = BigInt(object.ibc_request_interval);
    }
    if (object.ibc_source_channel !== undefined && object.ibc_source_channel !== null) {
      message.ibcSourceChannel = object.ibc_source_channel;
    }
    if (object.ibc_version !== undefined && object.ibc_version !== null) {
      message.ibcVersion = object.ibc_version;
    }
    if (object.ibc_port_id !== undefined && object.ibc_port_id !== null) {
      message.ibcPortId = object.ibc_port_id;
    }
    message.legacyOracleIds = object.legacy_oracle_ids?.map((e) => BigInt(e)) || [];
    return message;
  },
  toAmino(message: BandIBCParams): BandIBCParamsAmino {
    const obj: any = {};
    obj.band_ibc_enabled = message.bandIbcEnabled === false ? undefined : message.bandIbcEnabled;
    obj.ibc_request_interval =
      message.ibcRequestInterval !== BigInt(0) ? (message.ibcRequestInterval?.toString)() : undefined;
    obj.ibc_source_channel = message.ibcSourceChannel === '' ? undefined : message.ibcSourceChannel;
    obj.ibc_version = message.ibcVersion === '' ? undefined : message.ibcVersion;
    obj.ibc_port_id = message.ibcPortId === '' ? undefined : message.ibcPortId;
    if (message.legacyOracleIds) {
      obj.legacy_oracle_ids = message.legacyOracleIds.map((e) => e.toString());
    } else {
      obj.legacy_oracle_ids = message.legacyOracleIds;
    }
    return obj;
  },
  fromAminoMsg(object: BandIBCParamsAminoMsg): BandIBCParams {
    return BandIBCParams.fromAmino(object.value);
  },
  fromProtoMsg(message: BandIBCParamsProtoMsg): BandIBCParams {
    return BandIBCParams.decode(message.value);
  },
  toProto(message: BandIBCParams): Uint8Array {
    return BandIBCParams.encode(message).finish();
  },
  toProtoMsg(message: BandIBCParams): BandIBCParamsProtoMsg {
    return {
      typeUrl: '/injective.oracle.v1beta1.BandIBCParams',
      value: BandIBCParams.encode(message).finish(),
    };
  },
};
function createBaseSymbolPriceTimestamp(): SymbolPriceTimestamp {
  return {
    oracle: 0,
    symbolId: '',
    timestamp: BigInt(0),
  };
}
export const SymbolPriceTimestamp = {
  typeUrl: '/injective.oracle.v1beta1.SymbolPriceTimestamp',
  encode(message: SymbolPriceTimestamp, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.oracle !== 0) {
      writer.uint32(8).int32(message.oracle);
    }
    if (message.symbolId !== '') {
      writer.uint32(18).string(message.symbolId);
    }
    if (message.timestamp !== BigInt(0)) {
      writer.uint32(24).int64(message.timestamp);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): SymbolPriceTimestamp {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSymbolPriceTimestamp();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.oracle = reader.int32() as any;
          break;
        case 2:
          message.symbolId = reader.string();
          break;
        case 3:
          message.timestamp = reader.int64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<SymbolPriceTimestamp>): SymbolPriceTimestamp {
    const message = createBaseSymbolPriceTimestamp();
    message.oracle = object.oracle ?? 0;
    message.symbolId = object.symbolId ?? '';
    message.timestamp =
      object.timestamp !== undefined && object.timestamp !== null ? BigInt(object.timestamp.toString()) : BigInt(0);
    return message;
  },
  fromAmino(object: SymbolPriceTimestampAmino): SymbolPriceTimestamp {
    const message = createBaseSymbolPriceTimestamp();
    if (object.oracle !== undefined && object.oracle !== null) {
      message.oracle = object.oracle;
    }
    if (object.symbol_id !== undefined && object.symbol_id !== null) {
      message.symbolId = object.symbol_id;
    }
    if (object.timestamp !== undefined && object.timestamp !== null) {
      message.timestamp = BigInt(object.timestamp);
    }
    return message;
  },
  toAmino(message: SymbolPriceTimestamp): SymbolPriceTimestampAmino {
    const obj: any = {};
    obj.oracle = message.oracle === 0 ? undefined : message.oracle;
    obj.symbol_id = message.symbolId === '' ? undefined : message.symbolId;
    obj.timestamp = message.timestamp !== BigInt(0) ? (message.timestamp?.toString)() : undefined;
    return obj;
  },
  fromAminoMsg(object: SymbolPriceTimestampAminoMsg): SymbolPriceTimestamp {
    return SymbolPriceTimestamp.fromAmino(object.value);
  },
  fromProtoMsg(message: SymbolPriceTimestampProtoMsg): SymbolPriceTimestamp {
    return SymbolPriceTimestamp.decode(message.value);
  },
  toProto(message: SymbolPriceTimestamp): Uint8Array {
    return SymbolPriceTimestamp.encode(message).finish();
  },
  toProtoMsg(message: SymbolPriceTimestamp): SymbolPriceTimestampProtoMsg {
    return {
      typeUrl: '/injective.oracle.v1beta1.SymbolPriceTimestamp',
      value: SymbolPriceTimestamp.encode(message).finish(),
    };
  },
};
function createBaseLastPriceTimestamps(): LastPriceTimestamps {
  return {
    lastPriceTimestamps: [],
  };
}
export const LastPriceTimestamps = {
  typeUrl: '/injective.oracle.v1beta1.LastPriceTimestamps',
  encode(message: LastPriceTimestamps, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.lastPriceTimestamps) {
      SymbolPriceTimestamp.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): LastPriceTimestamps {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLastPriceTimestamps();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.lastPriceTimestamps.push(SymbolPriceTimestamp.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<LastPriceTimestamps>): LastPriceTimestamps {
    const message = createBaseLastPriceTimestamps();
    message.lastPriceTimestamps = object.lastPriceTimestamps?.map((e) => SymbolPriceTimestamp.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: LastPriceTimestampsAmino): LastPriceTimestamps {
    const message = createBaseLastPriceTimestamps();
    message.lastPriceTimestamps = object.last_price_timestamps?.map((e) => SymbolPriceTimestamp.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: LastPriceTimestamps): LastPriceTimestampsAmino {
    const obj: any = {};
    if (message.lastPriceTimestamps) {
      obj.last_price_timestamps = message.lastPriceTimestamps.map((e) =>
        e ? SymbolPriceTimestamp.toAmino(e) : undefined,
      );
    } else {
      obj.last_price_timestamps = message.lastPriceTimestamps;
    }
    return obj;
  },
  fromAminoMsg(object: LastPriceTimestampsAminoMsg): LastPriceTimestamps {
    return LastPriceTimestamps.fromAmino(object.value);
  },
  fromProtoMsg(message: LastPriceTimestampsProtoMsg): LastPriceTimestamps {
    return LastPriceTimestamps.decode(message.value);
  },
  toProto(message: LastPriceTimestamps): Uint8Array {
    return LastPriceTimestamps.encode(message).finish();
  },
  toProtoMsg(message: LastPriceTimestamps): LastPriceTimestampsProtoMsg {
    return {
      typeUrl: '/injective.oracle.v1beta1.LastPriceTimestamps',
      value: LastPriceTimestamps.encode(message).finish(),
    };
  },
};
function createBasePriceRecords(): PriceRecords {
  return {
    oracle: 0,
    symbolId: '',
    latestPriceRecords: [],
  };
}
export const PriceRecords = {
  typeUrl: '/injective.oracle.v1beta1.PriceRecords',
  encode(message: PriceRecords, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.oracle !== 0) {
      writer.uint32(8).int32(message.oracle);
    }
    if (message.symbolId !== '') {
      writer.uint32(18).string(message.symbolId);
    }
    for (const v of message.latestPriceRecords) {
      PriceRecord.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): PriceRecords {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePriceRecords();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.oracle = reader.int32() as any;
          break;
        case 2:
          message.symbolId = reader.string();
          break;
        case 3:
          message.latestPriceRecords.push(PriceRecord.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<PriceRecords>): PriceRecords {
    const message = createBasePriceRecords();
    message.oracle = object.oracle ?? 0;
    message.symbolId = object.symbolId ?? '';
    message.latestPriceRecords = object.latestPriceRecords?.map((e) => PriceRecord.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: PriceRecordsAmino): PriceRecords {
    const message = createBasePriceRecords();
    if (object.oracle !== undefined && object.oracle !== null) {
      message.oracle = object.oracle;
    }
    if (object.symbol_id !== undefined && object.symbol_id !== null) {
      message.symbolId = object.symbol_id;
    }
    message.latestPriceRecords = object.latest_price_records?.map((e) => PriceRecord.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: PriceRecords): PriceRecordsAmino {
    const obj: any = {};
    obj.oracle = message.oracle === 0 ? undefined : message.oracle;
    obj.symbol_id = message.symbolId === '' ? undefined : message.symbolId;
    if (message.latestPriceRecords) {
      obj.latest_price_records = message.latestPriceRecords.map((e) => (e ? PriceRecord.toAmino(e) : undefined));
    } else {
      obj.latest_price_records = message.latestPriceRecords;
    }
    return obj;
  },
  fromAminoMsg(object: PriceRecordsAminoMsg): PriceRecords {
    return PriceRecords.fromAmino(object.value);
  },
  fromProtoMsg(message: PriceRecordsProtoMsg): PriceRecords {
    return PriceRecords.decode(message.value);
  },
  toProto(message: PriceRecords): Uint8Array {
    return PriceRecords.encode(message).finish();
  },
  toProtoMsg(message: PriceRecords): PriceRecordsProtoMsg {
    return {
      typeUrl: '/injective.oracle.v1beta1.PriceRecords',
      value: PriceRecords.encode(message).finish(),
    };
  },
};
function createBasePriceRecord(): PriceRecord {
  return {
    timestamp: BigInt(0),
    price: '',
  };
}
export const PriceRecord = {
  typeUrl: '/injective.oracle.v1beta1.PriceRecord',
  encode(message: PriceRecord, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.timestamp !== BigInt(0)) {
      writer.uint32(8).int64(message.timestamp);
    }
    if (message.price !== '') {
      writer.uint32(18).string(Decimal.fromUserInput(message.price, 18).atomics);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): PriceRecord {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePriceRecord();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.timestamp = reader.int64();
          break;
        case 2:
          message.price = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<PriceRecord>): PriceRecord {
    const message = createBasePriceRecord();
    message.timestamp =
      object.timestamp !== undefined && object.timestamp !== null ? BigInt(object.timestamp.toString()) : BigInt(0);
    message.price = object.price ?? '';
    return message;
  },
  fromAmino(object: PriceRecordAmino): PriceRecord {
    const message = createBasePriceRecord();
    if (object.timestamp !== undefined && object.timestamp !== null) {
      message.timestamp = BigInt(object.timestamp);
    }
    if (object.price !== undefined && object.price !== null) {
      message.price = object.price;
    }
    return message;
  },
  toAmino(message: PriceRecord): PriceRecordAmino {
    const obj: any = {};
    obj.timestamp = message.timestamp !== BigInt(0) ? (message.timestamp?.toString)() : undefined;
    obj.price = message.price === '' ? undefined : message.price;
    return obj;
  },
  fromAminoMsg(object: PriceRecordAminoMsg): PriceRecord {
    return PriceRecord.fromAmino(object.value);
  },
  fromProtoMsg(message: PriceRecordProtoMsg): PriceRecord {
    return PriceRecord.decode(message.value);
  },
  toProto(message: PriceRecord): Uint8Array {
    return PriceRecord.encode(message).finish();
  },
  toProtoMsg(message: PriceRecord): PriceRecordProtoMsg {
    return {
      typeUrl: '/injective.oracle.v1beta1.PriceRecord',
      value: PriceRecord.encode(message).finish(),
    };
  },
};
function createBaseMetadataStatistics(): MetadataStatistics {
  return {
    groupCount: 0,
    recordsSampleSize: 0,
    mean: '',
    twap: '',
    firstTimestamp: BigInt(0),
    lastTimestamp: BigInt(0),
    minPrice: '',
    maxPrice: '',
    medianPrice: '',
  };
}
export const MetadataStatistics = {
  typeUrl: '/injective.oracle.v1beta1.MetadataStatistics',
  encode(message: MetadataStatistics, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.groupCount !== 0) {
      writer.uint32(8).uint32(message.groupCount);
    }
    if (message.recordsSampleSize !== 0) {
      writer.uint32(16).uint32(message.recordsSampleSize);
    }
    if (message.mean !== '') {
      writer.uint32(26).string(Decimal.fromUserInput(message.mean, 18).atomics);
    }
    if (message.twap !== '') {
      writer.uint32(34).string(Decimal.fromUserInput(message.twap, 18).atomics);
    }
    if (message.firstTimestamp !== BigInt(0)) {
      writer.uint32(40).int64(message.firstTimestamp);
    }
    if (message.lastTimestamp !== BigInt(0)) {
      writer.uint32(48).int64(message.lastTimestamp);
    }
    if (message.minPrice !== '') {
      writer.uint32(58).string(Decimal.fromUserInput(message.minPrice, 18).atomics);
    }
    if (message.maxPrice !== '') {
      writer.uint32(66).string(Decimal.fromUserInput(message.maxPrice, 18).atomics);
    }
    if (message.medianPrice !== '') {
      writer.uint32(74).string(Decimal.fromUserInput(message.medianPrice, 18).atomics);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MetadataStatistics {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMetadataStatistics();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.groupCount = reader.uint32();
          break;
        case 2:
          message.recordsSampleSize = reader.uint32();
          break;
        case 3:
          message.mean = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 4:
          message.twap = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 5:
          message.firstTimestamp = reader.int64();
          break;
        case 6:
          message.lastTimestamp = reader.int64();
          break;
        case 7:
          message.minPrice = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 8:
          message.maxPrice = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 9:
          message.medianPrice = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MetadataStatistics>): MetadataStatistics {
    const message = createBaseMetadataStatistics();
    message.groupCount = object.groupCount ?? 0;
    message.recordsSampleSize = object.recordsSampleSize ?? 0;
    message.mean = object.mean ?? '';
    message.twap = object.twap ?? '';
    message.firstTimestamp =
      object.firstTimestamp !== undefined && object.firstTimestamp !== null
        ? BigInt(object.firstTimestamp.toString())
        : BigInt(0);
    message.lastTimestamp =
      object.lastTimestamp !== undefined && object.lastTimestamp !== null
        ? BigInt(object.lastTimestamp.toString())
        : BigInt(0);
    message.minPrice = object.minPrice ?? '';
    message.maxPrice = object.maxPrice ?? '';
    message.medianPrice = object.medianPrice ?? '';
    return message;
  },
  fromAmino(object: MetadataStatisticsAmino): MetadataStatistics {
    const message = createBaseMetadataStatistics();
    if (object.group_count !== undefined && object.group_count !== null) {
      message.groupCount = object.group_count;
    }
    if (object.records_sample_size !== undefined && object.records_sample_size !== null) {
      message.recordsSampleSize = object.records_sample_size;
    }
    if (object.mean !== undefined && object.mean !== null) {
      message.mean = object.mean;
    }
    if (object.twap !== undefined && object.twap !== null) {
      message.twap = object.twap;
    }
    if (object.first_timestamp !== undefined && object.first_timestamp !== null) {
      message.firstTimestamp = BigInt(object.first_timestamp);
    }
    if (object.last_timestamp !== undefined && object.last_timestamp !== null) {
      message.lastTimestamp = BigInt(object.last_timestamp);
    }
    if (object.min_price !== undefined && object.min_price !== null) {
      message.minPrice = object.min_price;
    }
    if (object.max_price !== undefined && object.max_price !== null) {
      message.maxPrice = object.max_price;
    }
    if (object.median_price !== undefined && object.median_price !== null) {
      message.medianPrice = object.median_price;
    }
    return message;
  },
  toAmino(message: MetadataStatistics): MetadataStatisticsAmino {
    const obj: any = {};
    obj.group_count = message.groupCount === 0 ? undefined : message.groupCount;
    obj.records_sample_size = message.recordsSampleSize === 0 ? undefined : message.recordsSampleSize;
    obj.mean = message.mean === '' ? undefined : message.mean;
    obj.twap = message.twap === '' ? undefined : message.twap;
    obj.first_timestamp = message.firstTimestamp !== BigInt(0) ? (message.firstTimestamp?.toString)() : undefined;
    obj.last_timestamp = message.lastTimestamp !== BigInt(0) ? (message.lastTimestamp?.toString)() : undefined;
    obj.min_price = message.minPrice === '' ? undefined : message.minPrice;
    obj.max_price = message.maxPrice === '' ? undefined : message.maxPrice;
    obj.median_price = message.medianPrice === '' ? undefined : message.medianPrice;
    return obj;
  },
  fromAminoMsg(object: MetadataStatisticsAminoMsg): MetadataStatistics {
    return MetadataStatistics.fromAmino(object.value);
  },
  fromProtoMsg(message: MetadataStatisticsProtoMsg): MetadataStatistics {
    return MetadataStatistics.decode(message.value);
  },
  toProto(message: MetadataStatistics): Uint8Array {
    return MetadataStatistics.encode(message).finish();
  },
  toProtoMsg(message: MetadataStatistics): MetadataStatisticsProtoMsg {
    return {
      typeUrl: '/injective.oracle.v1beta1.MetadataStatistics',
      value: MetadataStatistics.encode(message).finish(),
    };
  },
};
function createBasePriceAttestation(): PriceAttestation {
  return {
    priceId: '',
    price: BigInt(0),
    conf: BigInt(0),
    expo: 0,
    emaPrice: BigInt(0),
    emaConf: BigInt(0),
    emaExpo: 0,
    publishTime: BigInt(0),
  };
}
export const PriceAttestation = {
  typeUrl: '/injective.oracle.v1beta1.PriceAttestation',
  encode(message: PriceAttestation, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.priceId !== '') {
      writer.uint32(10).string(message.priceId);
    }
    if (message.price !== BigInt(0)) {
      writer.uint32(16).int64(message.price);
    }
    if (message.conf !== BigInt(0)) {
      writer.uint32(24).uint64(message.conf);
    }
    if (message.expo !== 0) {
      writer.uint32(32).int32(message.expo);
    }
    if (message.emaPrice !== BigInt(0)) {
      writer.uint32(40).int64(message.emaPrice);
    }
    if (message.emaConf !== BigInt(0)) {
      writer.uint32(48).uint64(message.emaConf);
    }
    if (message.emaExpo !== 0) {
      writer.uint32(56).int32(message.emaExpo);
    }
    if (message.publishTime !== BigInt(0)) {
      writer.uint32(64).int64(message.publishTime);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): PriceAttestation {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePriceAttestation();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.priceId = reader.string();
          break;
        case 2:
          message.price = reader.int64();
          break;
        case 3:
          message.conf = reader.uint64();
          break;
        case 4:
          message.expo = reader.int32();
          break;
        case 5:
          message.emaPrice = reader.int64();
          break;
        case 6:
          message.emaConf = reader.uint64();
          break;
        case 7:
          message.emaExpo = reader.int32();
          break;
        case 8:
          message.publishTime = reader.int64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<PriceAttestation>): PriceAttestation {
    const message = createBasePriceAttestation();
    message.priceId = object.priceId ?? '';
    message.price = object.price !== undefined && object.price !== null ? BigInt(object.price.toString()) : BigInt(0);
    message.conf = object.conf !== undefined && object.conf !== null ? BigInt(object.conf.toString()) : BigInt(0);
    message.expo = object.expo ?? 0;
    message.emaPrice =
      object.emaPrice !== undefined && object.emaPrice !== null ? BigInt(object.emaPrice.toString()) : BigInt(0);
    message.emaConf =
      object.emaConf !== undefined && object.emaConf !== null ? BigInt(object.emaConf.toString()) : BigInt(0);
    message.emaExpo = object.emaExpo ?? 0;
    message.publishTime =
      object.publishTime !== undefined && object.publishTime !== null
        ? BigInt(object.publishTime.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: PriceAttestationAmino): PriceAttestation {
    const message = createBasePriceAttestation();
    if (object.price_id !== undefined && object.price_id !== null) {
      message.priceId = object.price_id;
    }
    if (object.price !== undefined && object.price !== null) {
      message.price = BigInt(object.price);
    }
    if (object.conf !== undefined && object.conf !== null) {
      message.conf = BigInt(object.conf);
    }
    if (object.expo !== undefined && object.expo !== null) {
      message.expo = object.expo;
    }
    if (object.ema_price !== undefined && object.ema_price !== null) {
      message.emaPrice = BigInt(object.ema_price);
    }
    if (object.ema_conf !== undefined && object.ema_conf !== null) {
      message.emaConf = BigInt(object.ema_conf);
    }
    if (object.ema_expo !== undefined && object.ema_expo !== null) {
      message.emaExpo = object.ema_expo;
    }
    if (object.publish_time !== undefined && object.publish_time !== null) {
      message.publishTime = BigInt(object.publish_time);
    }
    return message;
  },
  toAmino(message: PriceAttestation): PriceAttestationAmino {
    const obj: any = {};
    obj.price_id = message.priceId === '' ? undefined : message.priceId;
    obj.price = message.price !== BigInt(0) ? (message.price?.toString)() : undefined;
    obj.conf = message.conf !== BigInt(0) ? (message.conf?.toString)() : undefined;
    obj.expo = message.expo === 0 ? undefined : message.expo;
    obj.ema_price = message.emaPrice !== BigInt(0) ? (message.emaPrice?.toString)() : undefined;
    obj.ema_conf = message.emaConf !== BigInt(0) ? (message.emaConf?.toString)() : undefined;
    obj.ema_expo = message.emaExpo === 0 ? undefined : message.emaExpo;
    obj.publish_time = message.publishTime !== BigInt(0) ? (message.publishTime?.toString)() : undefined;
    return obj;
  },
  fromAminoMsg(object: PriceAttestationAminoMsg): PriceAttestation {
    return PriceAttestation.fromAmino(object.value);
  },
  fromProtoMsg(message: PriceAttestationProtoMsg): PriceAttestation {
    return PriceAttestation.decode(message.value);
  },
  toProto(message: PriceAttestation): Uint8Array {
    return PriceAttestation.encode(message).finish();
  },
  toProtoMsg(message: PriceAttestation): PriceAttestationProtoMsg {
    return {
      typeUrl: '/injective.oracle.v1beta1.PriceAttestation',
      value: PriceAttestation.encode(message).finish(),
    };
  },
};
function createBaseAssetPair(): AssetPair {
  return {
    assetId: '',
    signedPrices: [],
  };
}
export const AssetPair = {
  typeUrl: '/injective.oracle.v1beta1.AssetPair',
  encode(message: AssetPair, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.assetId !== '') {
      writer.uint32(10).string(message.assetId);
    }
    for (const v of message.signedPrices) {
      SignedPriceOfAssetPair.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): AssetPair {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAssetPair();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.assetId = reader.string();
          break;
        case 2:
          message.signedPrices.push(SignedPriceOfAssetPair.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<AssetPair>): AssetPair {
    const message = createBaseAssetPair();
    message.assetId = object.assetId ?? '';
    message.signedPrices = object.signedPrices?.map((e) => SignedPriceOfAssetPair.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: AssetPairAmino): AssetPair {
    const message = createBaseAssetPair();
    if (object.asset_id !== undefined && object.asset_id !== null) {
      message.assetId = object.asset_id;
    }
    message.signedPrices = object.signed_prices?.map((e) => SignedPriceOfAssetPair.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: AssetPair): AssetPairAmino {
    const obj: any = {};
    obj.asset_id = message.assetId === '' ? undefined : message.assetId;
    if (message.signedPrices) {
      obj.signed_prices = message.signedPrices.map((e) => (e ? SignedPriceOfAssetPair.toAmino(e) : undefined));
    } else {
      obj.signed_prices = message.signedPrices;
    }
    return obj;
  },
  fromAminoMsg(object: AssetPairAminoMsg): AssetPair {
    return AssetPair.fromAmino(object.value);
  },
  fromProtoMsg(message: AssetPairProtoMsg): AssetPair {
    return AssetPair.decode(message.value);
  },
  toProto(message: AssetPair): Uint8Array {
    return AssetPair.encode(message).finish();
  },
  toProtoMsg(message: AssetPair): AssetPairProtoMsg {
    return {
      typeUrl: '/injective.oracle.v1beta1.AssetPair',
      value: AssetPair.encode(message).finish(),
    };
  },
};
function createBaseSignedPriceOfAssetPair(): SignedPriceOfAssetPair {
  return {
    publisherKey: '',
    timestamp: BigInt(0),
    price: '',
    signature: new Uint8Array(),
  };
}
export const SignedPriceOfAssetPair = {
  typeUrl: '/injective.oracle.v1beta1.SignedPriceOfAssetPair',
  encode(message: SignedPriceOfAssetPair, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.publisherKey !== '') {
      writer.uint32(10).string(message.publisherKey);
    }
    if (message.timestamp !== BigInt(0)) {
      writer.uint32(16).uint64(message.timestamp);
    }
    if (message.price !== '') {
      writer.uint32(26).string(Decimal.fromUserInput(message.price, 18).atomics);
    }
    if (message.signature.length !== 0) {
      writer.uint32(34).bytes(message.signature);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): SignedPriceOfAssetPair {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSignedPriceOfAssetPair();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.publisherKey = reader.string();
          break;
        case 2:
          message.timestamp = reader.uint64();
          break;
        case 3:
          message.price = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 4:
          message.signature = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<SignedPriceOfAssetPair>): SignedPriceOfAssetPair {
    const message = createBaseSignedPriceOfAssetPair();
    message.publisherKey = object.publisherKey ?? '';
    message.timestamp =
      object.timestamp !== undefined && object.timestamp !== null ? BigInt(object.timestamp.toString()) : BigInt(0);
    message.price = object.price ?? '';
    message.signature = object.signature ?? new Uint8Array();
    return message;
  },
  fromAmino(object: SignedPriceOfAssetPairAmino): SignedPriceOfAssetPair {
    const message = createBaseSignedPriceOfAssetPair();
    if (object.publisher_key !== undefined && object.publisher_key !== null) {
      message.publisherKey = object.publisher_key;
    }
    if (object.timestamp !== undefined && object.timestamp !== null) {
      message.timestamp = BigInt(object.timestamp);
    }
    if (object.price !== undefined && object.price !== null) {
      message.price = object.price;
    }
    if (object.signature !== undefined && object.signature !== null) {
      message.signature = bytesFromBase64(object.signature);
    }
    return message;
  },
  toAmino(message: SignedPriceOfAssetPair): SignedPriceOfAssetPairAmino {
    const obj: any = {};
    obj.publisher_key = message.publisherKey === '' ? undefined : message.publisherKey;
    obj.timestamp = message.timestamp !== BigInt(0) ? (message.timestamp?.toString)() : undefined;
    obj.price = message.price === '' ? undefined : message.price;
    obj.signature = message.signature ? base64FromBytes(message.signature) : undefined;
    return obj;
  },
  fromAminoMsg(object: SignedPriceOfAssetPairAminoMsg): SignedPriceOfAssetPair {
    return SignedPriceOfAssetPair.fromAmino(object.value);
  },
  fromProtoMsg(message: SignedPriceOfAssetPairProtoMsg): SignedPriceOfAssetPair {
    return SignedPriceOfAssetPair.decode(message.value);
  },
  toProto(message: SignedPriceOfAssetPair): Uint8Array {
    return SignedPriceOfAssetPair.encode(message).finish();
  },
  toProtoMsg(message: SignedPriceOfAssetPair): SignedPriceOfAssetPairProtoMsg {
    return {
      typeUrl: '/injective.oracle.v1beta1.SignedPriceOfAssetPair',
      value: SignedPriceOfAssetPair.encode(message).finish(),
    };
  },
};
