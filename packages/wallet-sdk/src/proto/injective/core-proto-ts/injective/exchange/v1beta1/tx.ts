/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import { Decimal } from '@cosmjs/math';

import { BinaryReader, BinaryWriter } from '../../../../../binary';
import { base64FromBytes, bytesFromBase64 } from '../../../../../helpers';
import { Coin, CoinAmino, CoinSDKType } from '../../../cosmos/base/v1beta1/coin';
import { Params, ParamsAmino, ParamsSDKType } from '../../../cosmos/distribution/v1beta1/distribution';
import { OracleType } from '../../oracle/v1beta1/oracle';
import {
  DerivativeOrder,
  DerivativeOrderAmino,
  DerivativeOrderSDKType,
  GrantAuthorization,
  GrantAuthorizationAmino,
  GrantAuthorizationSDKType,
  MarketStatus,
  PositionDelta,
  PositionDeltaAmino,
  PositionDeltaSDKType,
  SpotOrder,
  SpotOrderAmino,
  SpotOrderSDKType,
} from './exchange';
export interface MsgUpdateSpotMarket {
  /** current admin address of the associated market */
  admin: string;
  /** id of the market to be updated */
  marketId: string;
  /** (optional) updated ticker value */
  newTicker: string;
  /** (optional) updated min price tick size value */
  newMinPriceTickSize: string;
  /** (optional) updated min quantity tick size value */
  newMinQuantityTickSize: string;
  /** (optional) updated min notional */
  newMinNotional: string;
}
export interface MsgUpdateSpotMarketProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgUpdateSpotMarket';
  value: Uint8Array;
}
export interface MsgUpdateSpotMarketAmino {
  /** current admin address of the associated market */
  admin?: string;
  /** id of the market to be updated */
  market_id?: string;
  /** (optional) updated ticker value */
  new_ticker?: string;
  /** (optional) updated min price tick size value */
  new_min_price_tick_size?: string;
  /** (optional) updated min quantity tick size value */
  new_min_quantity_tick_size?: string;
  /** (optional) updated min notional */
  new_min_notional?: string;
}
export interface MsgUpdateSpotMarketAminoMsg {
  type: 'exchange/MsgUpdateSpotMarket';
  value: MsgUpdateSpotMarketAmino;
}
export interface MsgUpdateSpotMarketSDKType {
  admin: string;
  market_id: string;
  new_ticker: string;
  new_min_price_tick_size: string;
  new_min_quantity_tick_size: string;
  new_min_notional: string;
}
export interface MsgUpdateSpotMarketResponse {}
export interface MsgUpdateSpotMarketResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgUpdateSpotMarketResponse';
  value: Uint8Array;
}
export interface MsgUpdateSpotMarketResponseAmino {}
export interface MsgUpdateSpotMarketResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgUpdateSpotMarketResponse';
  value: MsgUpdateSpotMarketResponseAmino;
}
export interface MsgUpdateSpotMarketResponseSDKType {}
export interface MsgUpdateDerivativeMarket {
  /** current admin address of the associated market */
  admin: string;
  /** id of the market to be updated */
  marketId: string;
  /** (optional) updated value for ticker */
  newTicker: string;
  /** (optional) updated value for min_price_tick_size */
  newMinPriceTickSize: string;
  /** (optional) updated value min_quantity_tick_size */
  newMinQuantityTickSize: string;
  /** (optional) updated min notional */
  newMinNotional: string;
  /** (optional) updated value for initial_margin_ratio */
  newInitialMarginRatio: string;
  /** (optional) updated value for maintenance_margin_ratio */
  newMaintenanceMarginRatio: string;
}
export interface MsgUpdateDerivativeMarketProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgUpdateDerivativeMarket';
  value: Uint8Array;
}
export interface MsgUpdateDerivativeMarketAmino {
  /** current admin address of the associated market */
  admin?: string;
  /** id of the market to be updated */
  market_id?: string;
  /** (optional) updated value for ticker */
  new_ticker?: string;
  /** (optional) updated value for min_price_tick_size */
  new_min_price_tick_size?: string;
  /** (optional) updated value min_quantity_tick_size */
  new_min_quantity_tick_size?: string;
  /** (optional) updated min notional */
  new_min_notional?: string;
  /** (optional) updated value for initial_margin_ratio */
  new_initial_margin_ratio?: string;
  /** (optional) updated value for maintenance_margin_ratio */
  new_maintenance_margin_ratio?: string;
}
export interface MsgUpdateDerivativeMarketAminoMsg {
  type: 'exchange/MsgUpdateDerivativeMarket';
  value: MsgUpdateDerivativeMarketAmino;
}
export interface MsgUpdateDerivativeMarketSDKType {
  admin: string;
  market_id: string;
  new_ticker: string;
  new_min_price_tick_size: string;
  new_min_quantity_tick_size: string;
  new_min_notional: string;
  new_initial_margin_ratio: string;
  new_maintenance_margin_ratio: string;
}
export interface MsgUpdateDerivativeMarketResponse {}
export interface MsgUpdateDerivativeMarketResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgUpdateDerivativeMarketResponse';
  value: Uint8Array;
}
export interface MsgUpdateDerivativeMarketResponseAmino {}
export interface MsgUpdateDerivativeMarketResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgUpdateDerivativeMarketResponse';
  value: MsgUpdateDerivativeMarketResponseAmino;
}
export interface MsgUpdateDerivativeMarketResponseSDKType {}
export interface MsgUpdateParams {
  /** authority is the address of the governance account. */
  authority: string;
  /**
   * params defines the exchange parameters to update.
   *
   * NOTE: All parameters must be supplied.
   */
  params: Params;
}
export interface MsgUpdateParamsProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgUpdateParams';
  value: Uint8Array;
}
export interface MsgUpdateParamsAmino {
  /** authority is the address of the governance account. */
  authority?: string;
  /**
   * params defines the exchange parameters to update.
   *
   * NOTE: All parameters must be supplied.
   */
  params?: ParamsAmino;
}
export interface MsgUpdateParamsAminoMsg {
  type: 'exchange/MsgUpdateParams';
  value: MsgUpdateParamsAmino;
}
export interface MsgUpdateParamsSDKType {
  authority: string;
  params: ParamsSDKType;
}
export interface MsgUpdateParamsResponse {}
export interface MsgUpdateParamsResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgUpdateParamsResponse';
  value: Uint8Array;
}
export interface MsgUpdateParamsResponseAmino {}
export interface MsgUpdateParamsResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgUpdateParamsResponse';
  value: MsgUpdateParamsResponseAmino;
}
export interface MsgUpdateParamsResponseSDKType {}
/**
 * MsgDeposit defines a SDK message for transferring coins from the sender's
 * bank balance into the subaccount's exchange deposits
 */
export interface MsgDeposit {
  sender: string;
  /**
   * (Optional) bytes32 subaccount ID to deposit funds into. If empty, the coin
   * will be deposited to the sender's default subaccount address.
   */
  subaccountId: string;
  amount: Coin;
}
export interface MsgDepositProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgDeposit';
  value: Uint8Array;
}
/**
 * MsgDeposit defines a SDK message for transferring coins from the sender's
 * bank balance into the subaccount's exchange deposits
 */
export interface MsgDepositAmino {
  sender?: string;
  /**
   * (Optional) bytes32 subaccount ID to deposit funds into. If empty, the coin
   * will be deposited to the sender's default subaccount address.
   */
  subaccount_id?: string;
  amount?: CoinAmino;
}
export interface MsgDepositAminoMsg {
  type: 'exchange/MsgDeposit';
  value: MsgDepositAmino;
}
/**
 * MsgDeposit defines a SDK message for transferring coins from the sender's
 * bank balance into the subaccount's exchange deposits
 */
export interface MsgDepositSDKType {
  sender: string;
  subaccount_id: string;
  amount: CoinSDKType;
}
/** MsgDepositResponse defines the Msg/Deposit response type. */
export interface MsgDepositResponse {}
export interface MsgDepositResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgDepositResponse';
  value: Uint8Array;
}
/** MsgDepositResponse defines the Msg/Deposit response type. */
export interface MsgDepositResponseAmino {}
export interface MsgDepositResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgDepositResponse';
  value: MsgDepositResponseAmino;
}
/** MsgDepositResponse defines the Msg/Deposit response type. */
export interface MsgDepositResponseSDKType {}
/**
 * MsgWithdraw defines a SDK message for withdrawing coins from a subaccount's
 * deposits to the user's bank balance
 */
export interface MsgWithdraw {
  sender: string;
  /** bytes32 subaccount ID to withdraw funds from */
  subaccountId: string;
  amount: Coin;
}
export interface MsgWithdrawProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgWithdraw';
  value: Uint8Array;
}
/**
 * MsgWithdraw defines a SDK message for withdrawing coins from a subaccount's
 * deposits to the user's bank balance
 */
export interface MsgWithdrawAmino {
  sender?: string;
  /** bytes32 subaccount ID to withdraw funds from */
  subaccount_id?: string;
  amount?: CoinAmino;
}
export interface MsgWithdrawAminoMsg {
  type: 'exchange/MsgWithdraw';
  value: MsgWithdrawAmino;
}
/**
 * MsgWithdraw defines a SDK message for withdrawing coins from a subaccount's
 * deposits to the user's bank balance
 */
export interface MsgWithdrawSDKType {
  sender: string;
  subaccount_id: string;
  amount: CoinSDKType;
}
/** MsgWithdraw defines the Msg/Withdraw response type. */
export interface MsgWithdrawResponse {}
export interface MsgWithdrawResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgWithdrawResponse';
  value: Uint8Array;
}
/** MsgWithdraw defines the Msg/Withdraw response type. */
export interface MsgWithdrawResponseAmino {}
export interface MsgWithdrawResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgWithdrawResponse';
  value: MsgWithdrawResponseAmino;
}
/** MsgWithdraw defines the Msg/Withdraw response type. */
export interface MsgWithdrawResponseSDKType {}
/**
 * MsgCreateSpotLimitOrder defines a SDK message for creating a new spot limit
 * order.
 */
export interface MsgCreateSpotLimitOrder {
  sender: string;
  order: SpotOrder;
}
export interface MsgCreateSpotLimitOrderProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgCreateSpotLimitOrder';
  value: Uint8Array;
}
/**
 * MsgCreateSpotLimitOrder defines a SDK message for creating a new spot limit
 * order.
 */
export interface MsgCreateSpotLimitOrderAmino {
  sender?: string;
  order?: SpotOrderAmino;
}
export interface MsgCreateSpotLimitOrderAminoMsg {
  type: 'exchange/MsgCreateSpotLimitOrder';
  value: MsgCreateSpotLimitOrderAmino;
}
/**
 * MsgCreateSpotLimitOrder defines a SDK message for creating a new spot limit
 * order.
 */
export interface MsgCreateSpotLimitOrderSDKType {
  sender: string;
  order: SpotOrderSDKType;
}
/**
 * MsgCreateSpotLimitOrderResponse defines the Msg/CreateSpotOrder response
 * type.
 */
export interface MsgCreateSpotLimitOrderResponse {
  orderHash: string;
  cid: string;
}
export interface MsgCreateSpotLimitOrderResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgCreateSpotLimitOrderResponse';
  value: Uint8Array;
}
/**
 * MsgCreateSpotLimitOrderResponse defines the Msg/CreateSpotOrder response
 * type.
 */
export interface MsgCreateSpotLimitOrderResponseAmino {
  order_hash?: string;
  cid?: string;
}
export interface MsgCreateSpotLimitOrderResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgCreateSpotLimitOrderResponse';
  value: MsgCreateSpotLimitOrderResponseAmino;
}
/**
 * MsgCreateSpotLimitOrderResponse defines the Msg/CreateSpotOrder response
 * type.
 */
export interface MsgCreateSpotLimitOrderResponseSDKType {
  order_hash: string;
  cid: string;
}
/**
 * MsgBatchCreateSpotLimitOrders defines a SDK message for creating a new batch
 * of spot limit orders.
 */
export interface MsgBatchCreateSpotLimitOrders {
  sender: string;
  orders: SpotOrder[];
}
export interface MsgBatchCreateSpotLimitOrdersProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgBatchCreateSpotLimitOrders';
  value: Uint8Array;
}
/**
 * MsgBatchCreateSpotLimitOrders defines a SDK message for creating a new batch
 * of spot limit orders.
 */
export interface MsgBatchCreateSpotLimitOrdersAmino {
  sender?: string;
  orders?: SpotOrderAmino[];
}
export interface MsgBatchCreateSpotLimitOrdersAminoMsg {
  type: 'exchange/MsgBatchCreateSpotLimitOrders';
  value: MsgBatchCreateSpotLimitOrdersAmino;
}
/**
 * MsgBatchCreateSpotLimitOrders defines a SDK message for creating a new batch
 * of spot limit orders.
 */
export interface MsgBatchCreateSpotLimitOrdersSDKType {
  sender: string;
  orders: SpotOrderSDKType[];
}
/**
 * MsgBatchCreateSpotLimitOrdersResponse defines the
 * Msg/BatchCreateSpotLimitOrders response type.
 */
export interface MsgBatchCreateSpotLimitOrdersResponse {
  orderHashes: string[];
  createdOrdersCids: string[];
  failedOrdersCids: string[];
}
export interface MsgBatchCreateSpotLimitOrdersResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgBatchCreateSpotLimitOrdersResponse';
  value: Uint8Array;
}
/**
 * MsgBatchCreateSpotLimitOrdersResponse defines the
 * Msg/BatchCreateSpotLimitOrders response type.
 */
export interface MsgBatchCreateSpotLimitOrdersResponseAmino {
  order_hashes?: string[];
  created_orders_cids?: string[];
  failed_orders_cids?: string[];
}
export interface MsgBatchCreateSpotLimitOrdersResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgBatchCreateSpotLimitOrdersResponse';
  value: MsgBatchCreateSpotLimitOrdersResponseAmino;
}
/**
 * MsgBatchCreateSpotLimitOrdersResponse defines the
 * Msg/BatchCreateSpotLimitOrders response type.
 */
export interface MsgBatchCreateSpotLimitOrdersResponseSDKType {
  order_hashes: string[];
  created_orders_cids: string[];
  failed_orders_cids: string[];
}
/**
 * MsgInstantSpotMarketLaunch defines a SDK message for creating a new spot
 * market by paying listing fee without governance
 */
export interface MsgInstantSpotMarketLaunch {
  sender: string;
  /** Ticker for the spot market. */
  ticker: string;
  /** type of coin to use as the base currency */
  baseDenom: string;
  /** type of coin to use as the quote currency */
  quoteDenom: string;
  /** min_price_tick_size defines the minimum tick size of the order's price */
  minPriceTickSize: string;
  /**
   * min_quantity_tick_size defines the minimum tick size of the order's
   * quantity
   */
  minQuantityTickSize: string;
  /**
   * min_notional defines the minimum notional (in quote asset) required for
   * orders in the market
   */
  minNotional: string;
}
export interface MsgInstantSpotMarketLaunchProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgInstantSpotMarketLaunch';
  value: Uint8Array;
}
/**
 * MsgInstantSpotMarketLaunch defines a SDK message for creating a new spot
 * market by paying listing fee without governance
 */
export interface MsgInstantSpotMarketLaunchAmino {
  sender?: string;
  /** Ticker for the spot market. */
  ticker?: string;
  /** type of coin to use as the base currency */
  base_denom?: string;
  /** type of coin to use as the quote currency */
  quote_denom?: string;
  /** min_price_tick_size defines the minimum tick size of the order's price */
  min_price_tick_size?: string;
  /**
   * min_quantity_tick_size defines the minimum tick size of the order's
   * quantity
   */
  min_quantity_tick_size?: string;
  /**
   * min_notional defines the minimum notional (in quote asset) required for
   * orders in the market
   */
  min_notional?: string;
}
export interface MsgInstantSpotMarketLaunchAminoMsg {
  type: 'exchange/MsgInstantSpotMarketLaunch';
  value: MsgInstantSpotMarketLaunchAmino;
}
/**
 * MsgInstantSpotMarketLaunch defines a SDK message for creating a new spot
 * market by paying listing fee without governance
 */
export interface MsgInstantSpotMarketLaunchSDKType {
  sender: string;
  ticker: string;
  base_denom: string;
  quote_denom: string;
  min_price_tick_size: string;
  min_quantity_tick_size: string;
  min_notional: string;
}
/**
 * MsgInstantSpotMarketLaunchResponse defines the Msg/InstantSpotMarketLaunch
 * response type.
 */
export interface MsgInstantSpotMarketLaunchResponse {}
export interface MsgInstantSpotMarketLaunchResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgInstantSpotMarketLaunchResponse';
  value: Uint8Array;
}
/**
 * MsgInstantSpotMarketLaunchResponse defines the Msg/InstantSpotMarketLaunch
 * response type.
 */
export interface MsgInstantSpotMarketLaunchResponseAmino {}
export interface MsgInstantSpotMarketLaunchResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgInstantSpotMarketLaunchResponse';
  value: MsgInstantSpotMarketLaunchResponseAmino;
}
/**
 * MsgInstantSpotMarketLaunchResponse defines the Msg/InstantSpotMarketLaunch
 * response type.
 */
export interface MsgInstantSpotMarketLaunchResponseSDKType {}
/**
 * MsgInstantPerpetualMarketLaunch defines a SDK message for creating a new
 * perpetual futures market by paying listing fee without governance
 */
export interface MsgInstantPerpetualMarketLaunch {
  sender: string;
  /** Ticker for the derivative market. */
  ticker: string;
  /** type of coin to use as the base currency */
  quoteDenom: string;
  /** Oracle base currency */
  oracleBase: string;
  /** Oracle quote currency */
  oracleQuote: string;
  /** Scale factor for oracle prices. */
  oracleScaleFactor: number;
  /** Oracle type */
  oracleType: OracleType;
  /**
   * maker_fee_rate defines the trade fee rate for makers on the perpetual
   * market
   */
  makerFeeRate: string;
  /**
   * taker_fee_rate defines the trade fee rate for takers on the perpetual
   * market
   */
  takerFeeRate: string;
  /**
   * initial_margin_ratio defines the initial margin ratio for the perpetual
   * market
   */
  initialMarginRatio: string;
  /**
   * maintenance_margin_ratio defines the maintenance margin ratio for the
   * perpetual market
   */
  maintenanceMarginRatio: string;
  /**
   * min_price_tick_size defines the minimum tick size of the order's price and
   * margin
   */
  minPriceTickSize: string;
  /**
   * min_quantity_tick_size defines the minimum tick size of the order's
   * quantity
   */
  minQuantityTickSize: string;
  /**
   * min_notional defines the minimum notional (in quote asset) required for
   * orders in the market
   */
  minNotional: string;
}
export interface MsgInstantPerpetualMarketLaunchProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgInstantPerpetualMarketLaunch';
  value: Uint8Array;
}
/**
 * MsgInstantPerpetualMarketLaunch defines a SDK message for creating a new
 * perpetual futures market by paying listing fee without governance
 */
export interface MsgInstantPerpetualMarketLaunchAmino {
  sender?: string;
  /** Ticker for the derivative market. */
  ticker?: string;
  /** type of coin to use as the base currency */
  quote_denom?: string;
  /** Oracle base currency */
  oracle_base?: string;
  /** Oracle quote currency */
  oracle_quote?: string;
  /** Scale factor for oracle prices. */
  oracle_scale_factor?: number;
  /** Oracle type */
  oracle_type?: OracleType;
  /**
   * maker_fee_rate defines the trade fee rate for makers on the perpetual
   * market
   */
  maker_fee_rate?: string;
  /**
   * taker_fee_rate defines the trade fee rate for takers on the perpetual
   * market
   */
  taker_fee_rate?: string;
  /**
   * initial_margin_ratio defines the initial margin ratio for the perpetual
   * market
   */
  initial_margin_ratio?: string;
  /**
   * maintenance_margin_ratio defines the maintenance margin ratio for the
   * perpetual market
   */
  maintenance_margin_ratio?: string;
  /**
   * min_price_tick_size defines the minimum tick size of the order's price and
   * margin
   */
  min_price_tick_size?: string;
  /**
   * min_quantity_tick_size defines the minimum tick size of the order's
   * quantity
   */
  min_quantity_tick_size?: string;
  /**
   * min_notional defines the minimum notional (in quote asset) required for
   * orders in the market
   */
  min_notional?: string;
}
export interface MsgInstantPerpetualMarketLaunchAminoMsg {
  type: 'exchange/MsgInstantPerpetualMarketLaunch';
  value: MsgInstantPerpetualMarketLaunchAmino;
}
/**
 * MsgInstantPerpetualMarketLaunch defines a SDK message for creating a new
 * perpetual futures market by paying listing fee without governance
 */
export interface MsgInstantPerpetualMarketLaunchSDKType {
  sender: string;
  ticker: string;
  quote_denom: string;
  oracle_base: string;
  oracle_quote: string;
  oracle_scale_factor: number;
  oracle_type: OracleType;
  maker_fee_rate: string;
  taker_fee_rate: string;
  initial_margin_ratio: string;
  maintenance_margin_ratio: string;
  min_price_tick_size: string;
  min_quantity_tick_size: string;
  min_notional: string;
}
/**
 * MsgInstantPerpetualMarketLaunchResponse defines the
 * Msg/InstantPerpetualMarketLaunchResponse response type.
 */
export interface MsgInstantPerpetualMarketLaunchResponse {}
export interface MsgInstantPerpetualMarketLaunchResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgInstantPerpetualMarketLaunchResponse';
  value: Uint8Array;
}
/**
 * MsgInstantPerpetualMarketLaunchResponse defines the
 * Msg/InstantPerpetualMarketLaunchResponse response type.
 */
export interface MsgInstantPerpetualMarketLaunchResponseAmino {}
export interface MsgInstantPerpetualMarketLaunchResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgInstantPerpetualMarketLaunchResponse';
  value: MsgInstantPerpetualMarketLaunchResponseAmino;
}
/**
 * MsgInstantPerpetualMarketLaunchResponse defines the
 * Msg/InstantPerpetualMarketLaunchResponse response type.
 */
export interface MsgInstantPerpetualMarketLaunchResponseSDKType {}
/**
 * MsgInstantBinaryOptionsMarketLaunch defines a SDK message for creating a new
 * perpetual futures market by paying listing fee without governance
 */
export interface MsgInstantBinaryOptionsMarketLaunch {
  sender: string;
  /** Ticker for the derivative contract. */
  ticker: string;
  /** Oracle symbol */
  oracleSymbol: string;
  /** Oracle Provider */
  oracleProvider: string;
  /** Oracle type */
  oracleType: OracleType;
  /** Scale factor for oracle prices. */
  oracleScaleFactor: number;
  /**
   * maker_fee_rate defines the trade fee rate for makers on the perpetual
   * market
   */
  makerFeeRate: string;
  /**
   * taker_fee_rate defines the trade fee rate for takers on the perpetual
   * market
   */
  takerFeeRate: string;
  /** expiration timestamp */
  expirationTimestamp: bigint;
  /** expiration timestamp */
  settlementTimestamp: bigint;
  /** admin of the market */
  admin: string;
  /** Address of the quote currency denomination for the binary options contract */
  quoteDenom: string;
  /**
   * min_price_tick_size defines the minimum tick size that the price and margin
   * required for orders in the market
   */
  minPriceTickSize: string;
  /**
   * min_quantity_tick_size defines the minimum tick size of the quantity
   * required for orders in the market
   */
  minQuantityTickSize: string;
  /**
   * min_notional defines the minimum notional (in quote asset) required for
   * orders in the market
   */
  minNotional: string;
}
export interface MsgInstantBinaryOptionsMarketLaunchProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgInstantBinaryOptionsMarketLaunch';
  value: Uint8Array;
}
/**
 * MsgInstantBinaryOptionsMarketLaunch defines a SDK message for creating a new
 * perpetual futures market by paying listing fee without governance
 */
export interface MsgInstantBinaryOptionsMarketLaunchAmino {
  sender?: string;
  /** Ticker for the derivative contract. */
  ticker?: string;
  /** Oracle symbol */
  oracle_symbol?: string;
  /** Oracle Provider */
  oracle_provider?: string;
  /** Oracle type */
  oracle_type?: OracleType;
  /** Scale factor for oracle prices. */
  oracle_scale_factor?: number;
  /**
   * maker_fee_rate defines the trade fee rate for makers on the perpetual
   * market
   */
  maker_fee_rate?: string;
  /**
   * taker_fee_rate defines the trade fee rate for takers on the perpetual
   * market
   */
  taker_fee_rate?: string;
  /** expiration timestamp */
  expiration_timestamp?: string;
  /** expiration timestamp */
  settlement_timestamp?: string;
  /** admin of the market */
  admin?: string;
  /** Address of the quote currency denomination for the binary options contract */
  quote_denom?: string;
  /**
   * min_price_tick_size defines the minimum tick size that the price and margin
   * required for orders in the market
   */
  min_price_tick_size?: string;
  /**
   * min_quantity_tick_size defines the minimum tick size of the quantity
   * required for orders in the market
   */
  min_quantity_tick_size?: string;
  /**
   * min_notional defines the minimum notional (in quote asset) required for
   * orders in the market
   */
  min_notional?: string;
}
export interface MsgInstantBinaryOptionsMarketLaunchAminoMsg {
  type: 'exchange/MsgInstantBinaryOptionsMarketLaunch';
  value: MsgInstantBinaryOptionsMarketLaunchAmino;
}
/**
 * MsgInstantBinaryOptionsMarketLaunch defines a SDK message for creating a new
 * perpetual futures market by paying listing fee without governance
 */
export interface MsgInstantBinaryOptionsMarketLaunchSDKType {
  sender: string;
  ticker: string;
  oracle_symbol: string;
  oracle_provider: string;
  oracle_type: OracleType;
  oracle_scale_factor: number;
  maker_fee_rate: string;
  taker_fee_rate: string;
  expiration_timestamp: bigint;
  settlement_timestamp: bigint;
  admin: string;
  quote_denom: string;
  min_price_tick_size: string;
  min_quantity_tick_size: string;
  min_notional: string;
}
/**
 * MsgInstantBinaryOptionsMarketLaunchResponse defines the
 * Msg/InstantBinaryOptionsMarketLaunchResponse response type.
 */
export interface MsgInstantBinaryOptionsMarketLaunchResponse {}
export interface MsgInstantBinaryOptionsMarketLaunchResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgInstantBinaryOptionsMarketLaunchResponse';
  value: Uint8Array;
}
/**
 * MsgInstantBinaryOptionsMarketLaunchResponse defines the
 * Msg/InstantBinaryOptionsMarketLaunchResponse response type.
 */
export interface MsgInstantBinaryOptionsMarketLaunchResponseAmino {}
export interface MsgInstantBinaryOptionsMarketLaunchResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgInstantBinaryOptionsMarketLaunchResponse';
  value: MsgInstantBinaryOptionsMarketLaunchResponseAmino;
}
/**
 * MsgInstantBinaryOptionsMarketLaunchResponse defines the
 * Msg/InstantBinaryOptionsMarketLaunchResponse response type.
 */
export interface MsgInstantBinaryOptionsMarketLaunchResponseSDKType {}
/**
 * MsgInstantExpiryFuturesMarketLaunch defines a SDK message for creating a new
 * expiry futures market by paying listing fee without governance
 */
export interface MsgInstantExpiryFuturesMarketLaunch {
  sender: string;
  /** Ticker for the derivative market. */
  ticker: string;
  /** type of coin to use as the quote currency */
  quoteDenom: string;
  /** Oracle base currency */
  oracleBase: string;
  /** Oracle quote currency */
  oracleQuote: string;
  /** Oracle type */
  oracleType: OracleType;
  /** Scale factor for oracle prices. */
  oracleScaleFactor: number;
  /** Expiration time of the market */
  expiry: bigint;
  /**
   * maker_fee_rate defines the trade fee rate for makers on the expiry futures
   * market
   */
  makerFeeRate: string;
  /**
   * taker_fee_rate defines the trade fee rate for takers on the expiry futures
   * market
   */
  takerFeeRate: string;
  /**
   * initial_margin_ratio defines the initial margin ratio for the derivative
   * market
   */
  initialMarginRatio: string;
  /**
   * maintenance_margin_ratio defines the maintenance margin ratio for the
   * derivative market
   */
  maintenanceMarginRatio: string;
  /**
   * min_price_tick_size defines the minimum tick size of the order's price and
   * margin
   */
  minPriceTickSize: string;
  /**
   * min_quantity_tick_size defines the minimum tick size of the order's
   * quantity
   */
  minQuantityTickSize: string;
  /**
   * min_notional defines the minimum notional (in quote asset) required for
   * orders in the market
   */
  minNotional: string;
}
export interface MsgInstantExpiryFuturesMarketLaunchProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgInstantExpiryFuturesMarketLaunch';
  value: Uint8Array;
}
/**
 * MsgInstantExpiryFuturesMarketLaunch defines a SDK message for creating a new
 * expiry futures market by paying listing fee without governance
 */
export interface MsgInstantExpiryFuturesMarketLaunchAmino {
  sender?: string;
  /** Ticker for the derivative market. */
  ticker?: string;
  /** type of coin to use as the quote currency */
  quote_denom?: string;
  /** Oracle base currency */
  oracle_base?: string;
  /** Oracle quote currency */
  oracle_quote?: string;
  /** Oracle type */
  oracle_type?: OracleType;
  /** Scale factor for oracle prices. */
  oracle_scale_factor?: number;
  /** Expiration time of the market */
  expiry?: string;
  /**
   * maker_fee_rate defines the trade fee rate for makers on the expiry futures
   * market
   */
  maker_fee_rate?: string;
  /**
   * taker_fee_rate defines the trade fee rate for takers on the expiry futures
   * market
   */
  taker_fee_rate?: string;
  /**
   * initial_margin_ratio defines the initial margin ratio for the derivative
   * market
   */
  initial_margin_ratio?: string;
  /**
   * maintenance_margin_ratio defines the maintenance margin ratio for the
   * derivative market
   */
  maintenance_margin_ratio?: string;
  /**
   * min_price_tick_size defines the minimum tick size of the order's price and
   * margin
   */
  min_price_tick_size?: string;
  /**
   * min_quantity_tick_size defines the minimum tick size of the order's
   * quantity
   */
  min_quantity_tick_size?: string;
  /**
   * min_notional defines the minimum notional (in quote asset) required for
   * orders in the market
   */
  min_notional?: string;
}
export interface MsgInstantExpiryFuturesMarketLaunchAminoMsg {
  type: 'exchange/MsgInstantExpiryFuturesMarketLaunch';
  value: MsgInstantExpiryFuturesMarketLaunchAmino;
}
/**
 * MsgInstantExpiryFuturesMarketLaunch defines a SDK message for creating a new
 * expiry futures market by paying listing fee without governance
 */
export interface MsgInstantExpiryFuturesMarketLaunchSDKType {
  sender: string;
  ticker: string;
  quote_denom: string;
  oracle_base: string;
  oracle_quote: string;
  oracle_type: OracleType;
  oracle_scale_factor: number;
  expiry: bigint;
  maker_fee_rate: string;
  taker_fee_rate: string;
  initial_margin_ratio: string;
  maintenance_margin_ratio: string;
  min_price_tick_size: string;
  min_quantity_tick_size: string;
  min_notional: string;
}
/**
 * MsgInstantExpiryFuturesMarketLaunchResponse defines the
 * Msg/InstantExpiryFuturesMarketLaunch response type.
 */
export interface MsgInstantExpiryFuturesMarketLaunchResponse {}
export interface MsgInstantExpiryFuturesMarketLaunchResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgInstantExpiryFuturesMarketLaunchResponse';
  value: Uint8Array;
}
/**
 * MsgInstantExpiryFuturesMarketLaunchResponse defines the
 * Msg/InstantExpiryFuturesMarketLaunch response type.
 */
export interface MsgInstantExpiryFuturesMarketLaunchResponseAmino {}
export interface MsgInstantExpiryFuturesMarketLaunchResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgInstantExpiryFuturesMarketLaunchResponse';
  value: MsgInstantExpiryFuturesMarketLaunchResponseAmino;
}
/**
 * MsgInstantExpiryFuturesMarketLaunchResponse defines the
 * Msg/InstantExpiryFuturesMarketLaunch response type.
 */
export interface MsgInstantExpiryFuturesMarketLaunchResponseSDKType {}
/**
 * MsgCreateSpotMarketOrder defines a SDK message for creating a new spot market
 * order.
 */
export interface MsgCreateSpotMarketOrder {
  sender: string;
  order: SpotOrder;
}
export interface MsgCreateSpotMarketOrderProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgCreateSpotMarketOrder';
  value: Uint8Array;
}
/**
 * MsgCreateSpotMarketOrder defines a SDK message for creating a new spot market
 * order.
 */
export interface MsgCreateSpotMarketOrderAmino {
  sender?: string;
  order?: SpotOrderAmino;
}
export interface MsgCreateSpotMarketOrderAminoMsg {
  type: 'exchange/MsgCreateSpotMarketOrder';
  value: MsgCreateSpotMarketOrderAmino;
}
/**
 * MsgCreateSpotMarketOrder defines a SDK message for creating a new spot market
 * order.
 */
export interface MsgCreateSpotMarketOrderSDKType {
  sender: string;
  order: SpotOrderSDKType;
}
/**
 * MsgCreateSpotMarketOrderResponse defines the Msg/CreateSpotMarketLimitOrder
 * response type.
 */
export interface MsgCreateSpotMarketOrderResponse {
  orderHash: string;
  results?: SpotMarketOrderResults;
  cid: string;
}
export interface MsgCreateSpotMarketOrderResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgCreateSpotMarketOrderResponse';
  value: Uint8Array;
}
/**
 * MsgCreateSpotMarketOrderResponse defines the Msg/CreateSpotMarketLimitOrder
 * response type.
 */
export interface MsgCreateSpotMarketOrderResponseAmino {
  order_hash?: string;
  results?: SpotMarketOrderResultsAmino;
  cid?: string;
}
export interface MsgCreateSpotMarketOrderResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgCreateSpotMarketOrderResponse';
  value: MsgCreateSpotMarketOrderResponseAmino;
}
/**
 * MsgCreateSpotMarketOrderResponse defines the Msg/CreateSpotMarketLimitOrder
 * response type.
 */
export interface MsgCreateSpotMarketOrderResponseSDKType {
  order_hash: string;
  results?: SpotMarketOrderResultsSDKType;
  cid: string;
}
export interface SpotMarketOrderResults {
  quantity: string;
  price: string;
  fee: string;
}
export interface SpotMarketOrderResultsProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.SpotMarketOrderResults';
  value: Uint8Array;
}
export interface SpotMarketOrderResultsAmino {
  quantity?: string;
  price?: string;
  fee?: string;
}
export interface SpotMarketOrderResultsAminoMsg {
  type: '/injective.exchange.v1beta1.SpotMarketOrderResults';
  value: SpotMarketOrderResultsAmino;
}
export interface SpotMarketOrderResultsSDKType {
  quantity: string;
  price: string;
  fee: string;
}
/** A Cosmos-SDK MsgCreateDerivativeLimitOrder */
export interface MsgCreateDerivativeLimitOrder {
  sender: string;
  order: DerivativeOrder;
}
export interface MsgCreateDerivativeLimitOrderProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgCreateDerivativeLimitOrder';
  value: Uint8Array;
}
/** A Cosmos-SDK MsgCreateDerivativeLimitOrder */
export interface MsgCreateDerivativeLimitOrderAmino {
  sender?: string;
  order?: DerivativeOrderAmino;
}
export interface MsgCreateDerivativeLimitOrderAminoMsg {
  type: 'exchange/MsgCreateDerivativeLimitOrder';
  value: MsgCreateDerivativeLimitOrderAmino;
}
/** A Cosmos-SDK MsgCreateDerivativeLimitOrder */
export interface MsgCreateDerivativeLimitOrderSDKType {
  sender: string;
  order: DerivativeOrderSDKType;
}
/**
 * MsgCreateDerivativeLimitOrderResponse defines the
 * Msg/CreateDerivativeMarketOrder response type.
 */
export interface MsgCreateDerivativeLimitOrderResponse {
  orderHash: string;
  cid: string;
}
export interface MsgCreateDerivativeLimitOrderResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgCreateDerivativeLimitOrderResponse';
  value: Uint8Array;
}
/**
 * MsgCreateDerivativeLimitOrderResponse defines the
 * Msg/CreateDerivativeMarketOrder response type.
 */
export interface MsgCreateDerivativeLimitOrderResponseAmino {
  order_hash?: string;
  cid?: string;
}
export interface MsgCreateDerivativeLimitOrderResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgCreateDerivativeLimitOrderResponse';
  value: MsgCreateDerivativeLimitOrderResponseAmino;
}
/**
 * MsgCreateDerivativeLimitOrderResponse defines the
 * Msg/CreateDerivativeMarketOrder response type.
 */
export interface MsgCreateDerivativeLimitOrderResponseSDKType {
  order_hash: string;
  cid: string;
}
/** A Cosmos-SDK MsgCreateBinaryOptionsLimitOrder */
export interface MsgCreateBinaryOptionsLimitOrder {
  sender: string;
  order: DerivativeOrder;
}
export interface MsgCreateBinaryOptionsLimitOrderProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgCreateBinaryOptionsLimitOrder';
  value: Uint8Array;
}
/** A Cosmos-SDK MsgCreateBinaryOptionsLimitOrder */
export interface MsgCreateBinaryOptionsLimitOrderAmino {
  sender?: string;
  order?: DerivativeOrderAmino;
}
export interface MsgCreateBinaryOptionsLimitOrderAminoMsg {
  type: 'exchange/MsgCreateBinaryOptionsLimitOrder';
  value: MsgCreateBinaryOptionsLimitOrderAmino;
}
/** A Cosmos-SDK MsgCreateBinaryOptionsLimitOrder */
export interface MsgCreateBinaryOptionsLimitOrderSDKType {
  sender: string;
  order: DerivativeOrderSDKType;
}
/**
 * MsgCreateBinaryOptionsLimitOrderResponse defines the
 * Msg/CreateBinaryOptionsLimitOrder response type.
 */
export interface MsgCreateBinaryOptionsLimitOrderResponse {
  orderHash: string;
  cid: string;
}
export interface MsgCreateBinaryOptionsLimitOrderResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgCreateBinaryOptionsLimitOrderResponse';
  value: Uint8Array;
}
/**
 * MsgCreateBinaryOptionsLimitOrderResponse defines the
 * Msg/CreateBinaryOptionsLimitOrder response type.
 */
export interface MsgCreateBinaryOptionsLimitOrderResponseAmino {
  order_hash?: string;
  cid?: string;
}
export interface MsgCreateBinaryOptionsLimitOrderResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgCreateBinaryOptionsLimitOrderResponse';
  value: MsgCreateBinaryOptionsLimitOrderResponseAmino;
}
/**
 * MsgCreateBinaryOptionsLimitOrderResponse defines the
 * Msg/CreateBinaryOptionsLimitOrder response type.
 */
export interface MsgCreateBinaryOptionsLimitOrderResponseSDKType {
  order_hash: string;
  cid: string;
}
/** A Cosmos-SDK MsgBatchCreateDerivativeLimitOrders */
export interface MsgBatchCreateDerivativeLimitOrders {
  sender: string;
  orders: DerivativeOrder[];
}
export interface MsgBatchCreateDerivativeLimitOrdersProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgBatchCreateDerivativeLimitOrders';
  value: Uint8Array;
}
/** A Cosmos-SDK MsgBatchCreateDerivativeLimitOrders */
export interface MsgBatchCreateDerivativeLimitOrdersAmino {
  sender?: string;
  orders?: DerivativeOrderAmino[];
}
export interface MsgBatchCreateDerivativeLimitOrdersAminoMsg {
  type: 'exchange/MsgBatchCreateDerivativeLimitOrders';
  value: MsgBatchCreateDerivativeLimitOrdersAmino;
}
/** A Cosmos-SDK MsgBatchCreateDerivativeLimitOrders */
export interface MsgBatchCreateDerivativeLimitOrdersSDKType {
  sender: string;
  orders: DerivativeOrderSDKType[];
}
/**
 * MsgBatchCreateDerivativeLimitOrdersResponse defines the
 * Msg/BatchCreateDerivativeLimitOrders response type.
 */
export interface MsgBatchCreateDerivativeLimitOrdersResponse {
  orderHashes: string[];
  createdOrdersCids: string[];
  failedOrdersCids: string[];
}
export interface MsgBatchCreateDerivativeLimitOrdersResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgBatchCreateDerivativeLimitOrdersResponse';
  value: Uint8Array;
}
/**
 * MsgBatchCreateDerivativeLimitOrdersResponse defines the
 * Msg/BatchCreateDerivativeLimitOrders response type.
 */
export interface MsgBatchCreateDerivativeLimitOrdersResponseAmino {
  order_hashes?: string[];
  created_orders_cids?: string[];
  failed_orders_cids?: string[];
}
export interface MsgBatchCreateDerivativeLimitOrdersResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgBatchCreateDerivativeLimitOrdersResponse';
  value: MsgBatchCreateDerivativeLimitOrdersResponseAmino;
}
/**
 * MsgBatchCreateDerivativeLimitOrdersResponse defines the
 * Msg/BatchCreateDerivativeLimitOrders response type.
 */
export interface MsgBatchCreateDerivativeLimitOrdersResponseSDKType {
  order_hashes: string[];
  created_orders_cids: string[];
  failed_orders_cids: string[];
}
/** MsgCancelSpotOrder defines the Msg/CancelSpotOrder response type. */
export interface MsgCancelSpotOrder {
  sender: string;
  marketId: string;
  subaccountId: string;
  orderHash: string;
  cid: string;
}
export interface MsgCancelSpotOrderProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgCancelSpotOrder';
  value: Uint8Array;
}
/** MsgCancelSpotOrder defines the Msg/CancelSpotOrder response type. */
export interface MsgCancelSpotOrderAmino {
  sender?: string;
  market_id?: string;
  subaccount_id?: string;
  order_hash?: string;
  cid?: string;
}
export interface MsgCancelSpotOrderAminoMsg {
  type: 'exchange/MsgCancelSpotOrder';
  value: MsgCancelSpotOrderAmino;
}
/** MsgCancelSpotOrder defines the Msg/CancelSpotOrder response type. */
export interface MsgCancelSpotOrderSDKType {
  sender: string;
  market_id: string;
  subaccount_id: string;
  order_hash: string;
  cid: string;
}
/** MsgCancelSpotOrderResponse defines the Msg/CancelSpotOrder response type. */
export interface MsgCancelSpotOrderResponse {}
export interface MsgCancelSpotOrderResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgCancelSpotOrderResponse';
  value: Uint8Array;
}
/** MsgCancelSpotOrderResponse defines the Msg/CancelSpotOrder response type. */
export interface MsgCancelSpotOrderResponseAmino {}
export interface MsgCancelSpotOrderResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgCancelSpotOrderResponse';
  value: MsgCancelSpotOrderResponseAmino;
}
/** MsgCancelSpotOrderResponse defines the Msg/CancelSpotOrder response type. */
export interface MsgCancelSpotOrderResponseSDKType {}
/** MsgBatchCancelSpotOrders defines the Msg/BatchCancelSpotOrders response type. */
export interface MsgBatchCancelSpotOrders {
  sender: string;
  data: OrderData[];
}
export interface MsgBatchCancelSpotOrdersProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgBatchCancelSpotOrders';
  value: Uint8Array;
}
/** MsgBatchCancelSpotOrders defines the Msg/BatchCancelSpotOrders response type. */
export interface MsgBatchCancelSpotOrdersAmino {
  sender?: string;
  data?: OrderDataAmino[];
}
export interface MsgBatchCancelSpotOrdersAminoMsg {
  type: 'exchange/MsgBatchCancelSpotOrders';
  value: MsgBatchCancelSpotOrdersAmino;
}
/** MsgBatchCancelSpotOrders defines the Msg/BatchCancelSpotOrders response type. */
export interface MsgBatchCancelSpotOrdersSDKType {
  sender: string;
  data: OrderDataSDKType[];
}
/**
 * MsgBatchCancelSpotOrdersResponse defines the Msg/BatchCancelSpotOrders
 * response type.
 */
export interface MsgBatchCancelSpotOrdersResponse {
  success: boolean[];
}
export interface MsgBatchCancelSpotOrdersResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgBatchCancelSpotOrdersResponse';
  value: Uint8Array;
}
/**
 * MsgBatchCancelSpotOrdersResponse defines the Msg/BatchCancelSpotOrders
 * response type.
 */
export interface MsgBatchCancelSpotOrdersResponseAmino {
  success?: boolean[];
}
export interface MsgBatchCancelSpotOrdersResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgBatchCancelSpotOrdersResponse';
  value: MsgBatchCancelSpotOrdersResponseAmino;
}
/**
 * MsgBatchCancelSpotOrdersResponse defines the Msg/BatchCancelSpotOrders
 * response type.
 */
export interface MsgBatchCancelSpotOrdersResponseSDKType {
  success: boolean[];
}
/**
 * MsgBatchCancelBinaryOptionsOrders defines the
 * Msg/BatchCancelBinaryOptionsOrders response type.
 */
export interface MsgBatchCancelBinaryOptionsOrders {
  sender: string;
  data: OrderData[];
}
export interface MsgBatchCancelBinaryOptionsOrdersProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgBatchCancelBinaryOptionsOrders';
  value: Uint8Array;
}
/**
 * MsgBatchCancelBinaryOptionsOrders defines the
 * Msg/BatchCancelBinaryOptionsOrders response type.
 */
export interface MsgBatchCancelBinaryOptionsOrdersAmino {
  sender?: string;
  data?: OrderDataAmino[];
}
export interface MsgBatchCancelBinaryOptionsOrdersAminoMsg {
  type: 'exchange/MsgBatchCancelBinaryOptionsOrders';
  value: MsgBatchCancelBinaryOptionsOrdersAmino;
}
/**
 * MsgBatchCancelBinaryOptionsOrders defines the
 * Msg/BatchCancelBinaryOptionsOrders response type.
 */
export interface MsgBatchCancelBinaryOptionsOrdersSDKType {
  sender: string;
  data: OrderDataSDKType[];
}
/**
 * BatchCancelBinaryOptionsOrdersResponse defines the
 * Msg/BatchCancelBinaryOptionsOrders response type.
 */
export interface MsgBatchCancelBinaryOptionsOrdersResponse {
  success: boolean[];
}
export interface MsgBatchCancelBinaryOptionsOrdersResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgBatchCancelBinaryOptionsOrdersResponse';
  value: Uint8Array;
}
/**
 * BatchCancelBinaryOptionsOrdersResponse defines the
 * Msg/BatchCancelBinaryOptionsOrders response type.
 */
export interface MsgBatchCancelBinaryOptionsOrdersResponseAmino {
  success?: boolean[];
}
export interface MsgBatchCancelBinaryOptionsOrdersResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgBatchCancelBinaryOptionsOrdersResponse';
  value: MsgBatchCancelBinaryOptionsOrdersResponseAmino;
}
/**
 * BatchCancelBinaryOptionsOrdersResponse defines the
 * Msg/BatchCancelBinaryOptionsOrders response type.
 */
export interface MsgBatchCancelBinaryOptionsOrdersResponseSDKType {
  success: boolean[];
}
/** MsgBatchUpdateOrders defines the Msg/BatchUpdateOrders response type. */
export interface MsgBatchUpdateOrders {
  sender: string;
  /**
   * subaccount_id only used for the spot_market_ids_to_cancel_all and
   * derivative_market_ids_to_cancel_all.
   */
  subaccountId: string;
  spotMarketIdsToCancelAll: string[];
  derivativeMarketIdsToCancelAll: string[];
  spotOrdersToCancel?: OrderData[];
  derivativeOrdersToCancel?: OrderData[];
  spotOrdersToCreate?: SpotOrder[];
  derivativeOrdersToCreate?: DerivativeOrder[];
  binaryOptionsOrdersToCancel?: OrderData[];
  binaryOptionsMarketIdsToCancelAll: string[];
  binaryOptionsOrdersToCreate?: DerivativeOrder[];
}
export interface MsgBatchUpdateOrdersProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgBatchUpdateOrders';
  value: Uint8Array;
}
/** MsgBatchUpdateOrders defines the Msg/BatchUpdateOrders response type. */
export interface MsgBatchUpdateOrdersAmino {
  sender?: string;
  /**
   * subaccount_id only used for the spot_market_ids_to_cancel_all and
   * derivative_market_ids_to_cancel_all.
   */
  subaccount_id?: string;
  spot_market_ids_to_cancel_all?: string[];
  derivative_market_ids_to_cancel_all?: string[];
  spot_orders_to_cancel?: OrderDataAmino[];
  derivative_orders_to_cancel?: OrderDataAmino[];
  spot_orders_to_create?: SpotOrderAmino[];
  derivative_orders_to_create?: DerivativeOrderAmino[];
  binary_options_orders_to_cancel?: OrderDataAmino[];
  binary_options_market_ids_to_cancel_all?: string[];
  binary_options_orders_to_create?: DerivativeOrderAmino[];
}
export interface MsgBatchUpdateOrdersAminoMsg {
  type: 'exchange/MsgBatchUpdateOrders';
  value: MsgBatchUpdateOrdersAmino;
}
/** MsgBatchUpdateOrders defines the Msg/BatchUpdateOrders response type. */
export interface MsgBatchUpdateOrdersSDKType {
  sender: string;
  subaccount_id: string;
  spot_market_ids_to_cancel_all: string[];
  derivative_market_ids_to_cancel_all: string[];
  spot_orders_to_cancel?: OrderDataSDKType[];
  derivative_orders_to_cancel?: OrderDataSDKType[];
  spot_orders_to_create?: SpotOrderSDKType[];
  derivative_orders_to_create?: DerivativeOrderSDKType[];
  binary_options_orders_to_cancel?: OrderDataSDKType[];
  binary_options_market_ids_to_cancel_all: string[];
  binary_options_orders_to_create?: DerivativeOrderSDKType[];
}
/** MsgBatchUpdateOrdersResponse defines the Msg/BatchUpdateOrders response type. */
export interface MsgBatchUpdateOrdersResponse {
  spotCancelSuccess: boolean[];
  derivativeCancelSuccess: boolean[];
  spotOrderHashes: string[];
  derivativeOrderHashes: string[];
  binaryOptionsCancelSuccess: boolean[];
  binaryOptionsOrderHashes: string[];
  createdSpotOrdersCids: string[];
  failedSpotOrdersCids: string[];
  createdDerivativeOrdersCids: string[];
  failedDerivativeOrdersCids: string[];
  createdBinaryOptionsOrdersCids: string[];
  failedBinaryOptionsOrdersCids: string[];
}
export interface MsgBatchUpdateOrdersResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgBatchUpdateOrdersResponse';
  value: Uint8Array;
}
/** MsgBatchUpdateOrdersResponse defines the Msg/BatchUpdateOrders response type. */
export interface MsgBatchUpdateOrdersResponseAmino {
  spot_cancel_success?: boolean[];
  derivative_cancel_success?: boolean[];
  spot_order_hashes?: string[];
  derivative_order_hashes?: string[];
  binary_options_cancel_success?: boolean[];
  binary_options_order_hashes?: string[];
  created_spot_orders_cids?: string[];
  failed_spot_orders_cids?: string[];
  created_derivative_orders_cids?: string[];
  failed_derivative_orders_cids?: string[];
  created_binary_options_orders_cids?: string[];
  failed_binary_options_orders_cids?: string[];
}
export interface MsgBatchUpdateOrdersResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgBatchUpdateOrdersResponse';
  value: MsgBatchUpdateOrdersResponseAmino;
}
/** MsgBatchUpdateOrdersResponse defines the Msg/BatchUpdateOrders response type. */
export interface MsgBatchUpdateOrdersResponseSDKType {
  spot_cancel_success: boolean[];
  derivative_cancel_success: boolean[];
  spot_order_hashes: string[];
  derivative_order_hashes: string[];
  binary_options_cancel_success: boolean[];
  binary_options_order_hashes: string[];
  created_spot_orders_cids: string[];
  failed_spot_orders_cids: string[];
  created_derivative_orders_cids: string[];
  failed_derivative_orders_cids: string[];
  created_binary_options_orders_cids: string[];
  failed_binary_options_orders_cids: string[];
}
/** A Cosmos-SDK MsgCreateDerivativeMarketOrder */
export interface MsgCreateDerivativeMarketOrder {
  sender: string;
  order: DerivativeOrder;
}
export interface MsgCreateDerivativeMarketOrderProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgCreateDerivativeMarketOrder';
  value: Uint8Array;
}
/** A Cosmos-SDK MsgCreateDerivativeMarketOrder */
export interface MsgCreateDerivativeMarketOrderAmino {
  sender?: string;
  order?: DerivativeOrderAmino;
}
export interface MsgCreateDerivativeMarketOrderAminoMsg {
  type: 'exchange/MsgCreateDerivativeMarketOrder';
  value: MsgCreateDerivativeMarketOrderAmino;
}
/** A Cosmos-SDK MsgCreateDerivativeMarketOrder */
export interface MsgCreateDerivativeMarketOrderSDKType {
  sender: string;
  order: DerivativeOrderSDKType;
}
/**
 * MsgCreateDerivativeMarketOrderResponse defines the
 * Msg/CreateDerivativeMarketOrder response type.
 */
export interface MsgCreateDerivativeMarketOrderResponse {
  orderHash: string;
  results?: DerivativeMarketOrderResults;
  cid: string;
}
export interface MsgCreateDerivativeMarketOrderResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgCreateDerivativeMarketOrderResponse';
  value: Uint8Array;
}
/**
 * MsgCreateDerivativeMarketOrderResponse defines the
 * Msg/CreateDerivativeMarketOrder response type.
 */
export interface MsgCreateDerivativeMarketOrderResponseAmino {
  order_hash?: string;
  results?: DerivativeMarketOrderResultsAmino;
  cid?: string;
}
export interface MsgCreateDerivativeMarketOrderResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgCreateDerivativeMarketOrderResponse';
  value: MsgCreateDerivativeMarketOrderResponseAmino;
}
/**
 * MsgCreateDerivativeMarketOrderResponse defines the
 * Msg/CreateDerivativeMarketOrder response type.
 */
export interface MsgCreateDerivativeMarketOrderResponseSDKType {
  order_hash: string;
  results?: DerivativeMarketOrderResultsSDKType;
  cid: string;
}
export interface DerivativeMarketOrderResults {
  quantity: string;
  price: string;
  fee: string;
  positionDelta: PositionDelta;
  payout: string;
}
export interface DerivativeMarketOrderResultsProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.DerivativeMarketOrderResults';
  value: Uint8Array;
}
export interface DerivativeMarketOrderResultsAmino {
  quantity?: string;
  price?: string;
  fee?: string;
  position_delta?: PositionDeltaAmino;
  payout?: string;
}
export interface DerivativeMarketOrderResultsAminoMsg {
  type: '/injective.exchange.v1beta1.DerivativeMarketOrderResults';
  value: DerivativeMarketOrderResultsAmino;
}
export interface DerivativeMarketOrderResultsSDKType {
  quantity: string;
  price: string;
  fee: string;
  position_delta: PositionDeltaSDKType;
  payout: string;
}
/** A Cosmos-SDK MsgCreateBinaryOptionsMarketOrder */
export interface MsgCreateBinaryOptionsMarketOrder {
  sender: string;
  order: DerivativeOrder;
}
export interface MsgCreateBinaryOptionsMarketOrderProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgCreateBinaryOptionsMarketOrder';
  value: Uint8Array;
}
/** A Cosmos-SDK MsgCreateBinaryOptionsMarketOrder */
export interface MsgCreateBinaryOptionsMarketOrderAmino {
  sender?: string;
  order?: DerivativeOrderAmino;
}
export interface MsgCreateBinaryOptionsMarketOrderAminoMsg {
  type: 'exchange/MsgCreateBinaryOptionsMarketOrder';
  value: MsgCreateBinaryOptionsMarketOrderAmino;
}
/** A Cosmos-SDK MsgCreateBinaryOptionsMarketOrder */
export interface MsgCreateBinaryOptionsMarketOrderSDKType {
  sender: string;
  order: DerivativeOrderSDKType;
}
/**
 * MsgCreateBinaryOptionsMarketOrderResponse defines the
 * Msg/CreateBinaryOptionsMarketOrder response type.
 */
export interface MsgCreateBinaryOptionsMarketOrderResponse {
  orderHash: string;
  results?: DerivativeMarketOrderResults;
  cid: string;
}
export interface MsgCreateBinaryOptionsMarketOrderResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgCreateBinaryOptionsMarketOrderResponse';
  value: Uint8Array;
}
/**
 * MsgCreateBinaryOptionsMarketOrderResponse defines the
 * Msg/CreateBinaryOptionsMarketOrder response type.
 */
export interface MsgCreateBinaryOptionsMarketOrderResponseAmino {
  order_hash?: string;
  results?: DerivativeMarketOrderResultsAmino;
  cid?: string;
}
export interface MsgCreateBinaryOptionsMarketOrderResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgCreateBinaryOptionsMarketOrderResponse';
  value: MsgCreateBinaryOptionsMarketOrderResponseAmino;
}
/**
 * MsgCreateBinaryOptionsMarketOrderResponse defines the
 * Msg/CreateBinaryOptionsMarketOrder response type.
 */
export interface MsgCreateBinaryOptionsMarketOrderResponseSDKType {
  order_hash: string;
  results?: DerivativeMarketOrderResultsSDKType;
  cid: string;
}
/** MsgCancelDerivativeOrder defines the Msg/CancelDerivativeOrder response type. */
export interface MsgCancelDerivativeOrder {
  sender: string;
  marketId: string;
  subaccountId: string;
  orderHash: string;
  /** bitwise combination of OrderMask enum values */
  orderMask: number;
  cid: string;
}
export interface MsgCancelDerivativeOrderProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgCancelDerivativeOrder';
  value: Uint8Array;
}
/** MsgCancelDerivativeOrder defines the Msg/CancelDerivativeOrder response type. */
export interface MsgCancelDerivativeOrderAmino {
  sender?: string;
  market_id?: string;
  subaccount_id?: string;
  order_hash?: string;
  /** bitwise combination of OrderMask enum values */
  order_mask?: number;
  cid?: string;
}
export interface MsgCancelDerivativeOrderAminoMsg {
  type: 'exchange/MsgCancelDerivativeOrder';
  value: MsgCancelDerivativeOrderAmino;
}
/** MsgCancelDerivativeOrder defines the Msg/CancelDerivativeOrder response type. */
export interface MsgCancelDerivativeOrderSDKType {
  sender: string;
  market_id: string;
  subaccount_id: string;
  order_hash: string;
  order_mask: number;
  cid: string;
}
/**
 * MsgCancelDerivativeOrderResponse defines the
 * Msg/CancelDerivativeOrderResponse response type.
 */
export interface MsgCancelDerivativeOrderResponse {}
export interface MsgCancelDerivativeOrderResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgCancelDerivativeOrderResponse';
  value: Uint8Array;
}
/**
 * MsgCancelDerivativeOrderResponse defines the
 * Msg/CancelDerivativeOrderResponse response type.
 */
export interface MsgCancelDerivativeOrderResponseAmino {}
export interface MsgCancelDerivativeOrderResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgCancelDerivativeOrderResponse';
  value: MsgCancelDerivativeOrderResponseAmino;
}
/**
 * MsgCancelDerivativeOrderResponse defines the
 * Msg/CancelDerivativeOrderResponse response type.
 */
export interface MsgCancelDerivativeOrderResponseSDKType {}
/**
 * MsgCancelBinaryOptionsOrder defines the Msg/CancelBinaryOptionsOrder response
 * type.
 */
export interface MsgCancelBinaryOptionsOrder {
  sender: string;
  marketId: string;
  subaccountId: string;
  orderHash: string;
  /** bitwise combination of OrderMask enum values */
  orderMask: number;
  cid: string;
}
export interface MsgCancelBinaryOptionsOrderProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgCancelBinaryOptionsOrder';
  value: Uint8Array;
}
/**
 * MsgCancelBinaryOptionsOrder defines the Msg/CancelBinaryOptionsOrder response
 * type.
 */
export interface MsgCancelBinaryOptionsOrderAmino {
  sender?: string;
  market_id?: string;
  subaccount_id?: string;
  order_hash?: string;
  /** bitwise combination of OrderMask enum values */
  order_mask?: number;
  cid?: string;
}
export interface MsgCancelBinaryOptionsOrderAminoMsg {
  type: 'exchange/MsgCancelBinaryOptionsOrder';
  value: MsgCancelBinaryOptionsOrderAmino;
}
/**
 * MsgCancelBinaryOptionsOrder defines the Msg/CancelBinaryOptionsOrder response
 * type.
 */
export interface MsgCancelBinaryOptionsOrderSDKType {
  sender: string;
  market_id: string;
  subaccount_id: string;
  order_hash: string;
  order_mask: number;
  cid: string;
}
/**
 * MsgCancelBinaryOptionsOrderResponse defines the
 * Msg/CancelBinaryOptionsOrderResponse response type.
 */
export interface MsgCancelBinaryOptionsOrderResponse {}
export interface MsgCancelBinaryOptionsOrderResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgCancelBinaryOptionsOrderResponse';
  value: Uint8Array;
}
/**
 * MsgCancelBinaryOptionsOrderResponse defines the
 * Msg/CancelBinaryOptionsOrderResponse response type.
 */
export interface MsgCancelBinaryOptionsOrderResponseAmino {}
export interface MsgCancelBinaryOptionsOrderResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgCancelBinaryOptionsOrderResponse';
  value: MsgCancelBinaryOptionsOrderResponseAmino;
}
/**
 * MsgCancelBinaryOptionsOrderResponse defines the
 * Msg/CancelBinaryOptionsOrderResponse response type.
 */
export interface MsgCancelBinaryOptionsOrderResponseSDKType {}
export interface OrderData {
  marketId: string;
  subaccountId: string;
  orderHash: string;
  /** bitwise combination of OrderMask enum values */
  orderMask: number;
  cid: string;
}
export interface OrderDataProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.OrderData';
  value: Uint8Array;
}
export interface OrderDataAmino {
  market_id?: string;
  subaccount_id?: string;
  order_hash?: string;
  /** bitwise combination of OrderMask enum values */
  order_mask?: number;
  cid?: string;
}
export interface OrderDataAminoMsg {
  type: '/injective.exchange.v1beta1.OrderData';
  value: OrderDataAmino;
}
export interface OrderDataSDKType {
  market_id: string;
  subaccount_id: string;
  order_hash: string;
  order_mask: number;
  cid: string;
}
/**
 * MsgBatchCancelDerivativeOrders defines the Msg/CancelDerivativeOrders
 * response type.
 */
export interface MsgBatchCancelDerivativeOrders {
  sender: string;
  data: OrderData[];
}
export interface MsgBatchCancelDerivativeOrdersProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgBatchCancelDerivativeOrders';
  value: Uint8Array;
}
/**
 * MsgBatchCancelDerivativeOrders defines the Msg/CancelDerivativeOrders
 * response type.
 */
export interface MsgBatchCancelDerivativeOrdersAmino {
  sender?: string;
  data?: OrderDataAmino[];
}
export interface MsgBatchCancelDerivativeOrdersAminoMsg {
  type: 'exchange/MsgBatchCancelDerivativeOrders';
  value: MsgBatchCancelDerivativeOrdersAmino;
}
/**
 * MsgBatchCancelDerivativeOrders defines the Msg/CancelDerivativeOrders
 * response type.
 */
export interface MsgBatchCancelDerivativeOrdersSDKType {
  sender: string;
  data: OrderDataSDKType[];
}
/**
 * MsgBatchCancelDerivativeOrdersResponse defines the
 * Msg/CancelDerivativeOrderResponse response type.
 */
export interface MsgBatchCancelDerivativeOrdersResponse {
  success: boolean[];
}
export interface MsgBatchCancelDerivativeOrdersResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgBatchCancelDerivativeOrdersResponse';
  value: Uint8Array;
}
/**
 * MsgBatchCancelDerivativeOrdersResponse defines the
 * Msg/CancelDerivativeOrderResponse response type.
 */
export interface MsgBatchCancelDerivativeOrdersResponseAmino {
  success?: boolean[];
}
export interface MsgBatchCancelDerivativeOrdersResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgBatchCancelDerivativeOrdersResponse';
  value: MsgBatchCancelDerivativeOrdersResponseAmino;
}
/**
 * MsgBatchCancelDerivativeOrdersResponse defines the
 * Msg/CancelDerivativeOrderResponse response type.
 */
export interface MsgBatchCancelDerivativeOrdersResponseSDKType {
  success: boolean[];
}
/** A Cosmos-SDK MsgSubaccountTransfer */
export interface MsgSubaccountTransfer {
  sender: string;
  sourceSubaccountId: string;
  destinationSubaccountId: string;
  amount: Coin;
}
export interface MsgSubaccountTransferProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgSubaccountTransfer';
  value: Uint8Array;
}
/** A Cosmos-SDK MsgSubaccountTransfer */
export interface MsgSubaccountTransferAmino {
  sender?: string;
  source_subaccount_id?: string;
  destination_subaccount_id?: string;
  amount?: CoinAmino;
}
export interface MsgSubaccountTransferAminoMsg {
  type: 'exchange/MsgSubaccountTransfer';
  value: MsgSubaccountTransferAmino;
}
/** A Cosmos-SDK MsgSubaccountTransfer */
export interface MsgSubaccountTransferSDKType {
  sender: string;
  source_subaccount_id: string;
  destination_subaccount_id: string;
  amount: CoinSDKType;
}
/**
 * MsgSubaccountTransferResponse defines the Msg/SubaccountTransfer response
 * type.
 */
export interface MsgSubaccountTransferResponse {}
export interface MsgSubaccountTransferResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgSubaccountTransferResponse';
  value: Uint8Array;
}
/**
 * MsgSubaccountTransferResponse defines the Msg/SubaccountTransfer response
 * type.
 */
export interface MsgSubaccountTransferResponseAmino {}
export interface MsgSubaccountTransferResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgSubaccountTransferResponse';
  value: MsgSubaccountTransferResponseAmino;
}
/**
 * MsgSubaccountTransferResponse defines the Msg/SubaccountTransfer response
 * type.
 */
export interface MsgSubaccountTransferResponseSDKType {}
/** A Cosmos-SDK MsgExternalTransfer */
export interface MsgExternalTransfer {
  sender: string;
  sourceSubaccountId: string;
  destinationSubaccountId: string;
  amount: Coin;
}
export interface MsgExternalTransferProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgExternalTransfer';
  value: Uint8Array;
}
/** A Cosmos-SDK MsgExternalTransfer */
export interface MsgExternalTransferAmino {
  sender?: string;
  source_subaccount_id?: string;
  destination_subaccount_id?: string;
  amount?: CoinAmino;
}
export interface MsgExternalTransferAminoMsg {
  type: 'exchange/MsgExternalTransfer';
  value: MsgExternalTransferAmino;
}
/** A Cosmos-SDK MsgExternalTransfer */
export interface MsgExternalTransferSDKType {
  sender: string;
  source_subaccount_id: string;
  destination_subaccount_id: string;
  amount: CoinSDKType;
}
/** MsgExternalTransferResponse defines the Msg/ExternalTransfer response type. */
export interface MsgExternalTransferResponse {}
export interface MsgExternalTransferResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgExternalTransferResponse';
  value: Uint8Array;
}
/** MsgExternalTransferResponse defines the Msg/ExternalTransfer response type. */
export interface MsgExternalTransferResponseAmino {}
export interface MsgExternalTransferResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgExternalTransferResponse';
  value: MsgExternalTransferResponseAmino;
}
/** MsgExternalTransferResponse defines the Msg/ExternalTransfer response type. */
export interface MsgExternalTransferResponseSDKType {}
/** A Cosmos-SDK MsgLiquidatePosition */
export interface MsgLiquidatePosition {
  sender: string;
  subaccountId: string;
  marketId: string;
  /** optional order to provide for liquidation */
  order?: DerivativeOrder;
}
export interface MsgLiquidatePositionProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgLiquidatePosition';
  value: Uint8Array;
}
/** A Cosmos-SDK MsgLiquidatePosition */
export interface MsgLiquidatePositionAmino {
  sender?: string;
  subaccount_id?: string;
  market_id?: string;
  /** optional order to provide for liquidation */
  order?: DerivativeOrderAmino;
}
export interface MsgLiquidatePositionAminoMsg {
  type: 'exchange/MsgLiquidatePosition';
  value: MsgLiquidatePositionAmino;
}
/** A Cosmos-SDK MsgLiquidatePosition */
export interface MsgLiquidatePositionSDKType {
  sender: string;
  subaccount_id: string;
  market_id: string;
  order?: DerivativeOrderSDKType;
}
/** MsgLiquidatePositionResponse defines the Msg/LiquidatePosition response type. */
export interface MsgLiquidatePositionResponse {}
export interface MsgLiquidatePositionResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgLiquidatePositionResponse';
  value: Uint8Array;
}
/** MsgLiquidatePositionResponse defines the Msg/LiquidatePosition response type. */
export interface MsgLiquidatePositionResponseAmino {}
export interface MsgLiquidatePositionResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgLiquidatePositionResponse';
  value: MsgLiquidatePositionResponseAmino;
}
/** MsgLiquidatePositionResponse defines the Msg/LiquidatePosition response type. */
export interface MsgLiquidatePositionResponseSDKType {}
/** A Cosmos-SDK MsgEmergencySettleMarket */
export interface MsgEmergencySettleMarket {
  sender: string;
  subaccountId: string;
  marketId: string;
}
export interface MsgEmergencySettleMarketProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgEmergencySettleMarket';
  value: Uint8Array;
}
/** A Cosmos-SDK MsgEmergencySettleMarket */
export interface MsgEmergencySettleMarketAmino {
  sender?: string;
  subaccount_id?: string;
  market_id?: string;
}
export interface MsgEmergencySettleMarketAminoMsg {
  type: 'exchange/MsgEmergencySettleMarket';
  value: MsgEmergencySettleMarketAmino;
}
/** A Cosmos-SDK MsgEmergencySettleMarket */
export interface MsgEmergencySettleMarketSDKType {
  sender: string;
  subaccount_id: string;
  market_id: string;
}
/**
 * MsgEmergencySettleMarketResponse defines the Msg/EmergencySettleMarket
 * response type.
 */
export interface MsgEmergencySettleMarketResponse {}
export interface MsgEmergencySettleMarketResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgEmergencySettleMarketResponse';
  value: Uint8Array;
}
/**
 * MsgEmergencySettleMarketResponse defines the Msg/EmergencySettleMarket
 * response type.
 */
export interface MsgEmergencySettleMarketResponseAmino {}
export interface MsgEmergencySettleMarketResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgEmergencySettleMarketResponse';
  value: MsgEmergencySettleMarketResponseAmino;
}
/**
 * MsgEmergencySettleMarketResponse defines the Msg/EmergencySettleMarket
 * response type.
 */
export interface MsgEmergencySettleMarketResponseSDKType {}
/** A Cosmos-SDK MsgIncreasePositionMargin */
export interface MsgIncreasePositionMargin {
  sender: string;
  sourceSubaccountId: string;
  destinationSubaccountId: string;
  marketId: string;
  /** amount defines the amount of margin to add to the position */
  amount: string;
}
export interface MsgIncreasePositionMarginProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgIncreasePositionMargin';
  value: Uint8Array;
}
/** A Cosmos-SDK MsgIncreasePositionMargin */
export interface MsgIncreasePositionMarginAmino {
  sender?: string;
  source_subaccount_id?: string;
  destination_subaccount_id?: string;
  market_id?: string;
  /** amount defines the amount of margin to add to the position */
  amount?: string;
}
export interface MsgIncreasePositionMarginAminoMsg {
  type: 'exchange/MsgIncreasePositionMargin';
  value: MsgIncreasePositionMarginAmino;
}
/** A Cosmos-SDK MsgIncreasePositionMargin */
export interface MsgIncreasePositionMarginSDKType {
  sender: string;
  source_subaccount_id: string;
  destination_subaccount_id: string;
  market_id: string;
  amount: string;
}
/**
 * MsgIncreasePositionMarginResponse defines the Msg/IncreasePositionMargin
 * response type.
 */
export interface MsgIncreasePositionMarginResponse {}
export interface MsgIncreasePositionMarginResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgIncreasePositionMarginResponse';
  value: Uint8Array;
}
/**
 * MsgIncreasePositionMarginResponse defines the Msg/IncreasePositionMargin
 * response type.
 */
export interface MsgIncreasePositionMarginResponseAmino {}
export interface MsgIncreasePositionMarginResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgIncreasePositionMarginResponse';
  value: MsgIncreasePositionMarginResponseAmino;
}
/**
 * MsgIncreasePositionMarginResponse defines the Msg/IncreasePositionMargin
 * response type.
 */
export interface MsgIncreasePositionMarginResponseSDKType {}
/** A Cosmos-SDK MsgDecreasePositionMargin */
export interface MsgDecreasePositionMargin {
  sender: string;
  sourceSubaccountId: string;
  destinationSubaccountId: string;
  marketId: string;
  /** amount defines the amount of margin to withdraw from the position */
  amount: string;
}
export interface MsgDecreasePositionMarginProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgDecreasePositionMargin';
  value: Uint8Array;
}
/** A Cosmos-SDK MsgDecreasePositionMargin */
export interface MsgDecreasePositionMarginAmino {
  sender?: string;
  source_subaccount_id?: string;
  destination_subaccount_id?: string;
  market_id?: string;
  /** amount defines the amount of margin to withdraw from the position */
  amount?: string;
}
export interface MsgDecreasePositionMarginAminoMsg {
  type: 'exchange/MsgDecreasePositionMargin';
  value: MsgDecreasePositionMarginAmino;
}
/** A Cosmos-SDK MsgDecreasePositionMargin */
export interface MsgDecreasePositionMarginSDKType {
  sender: string;
  source_subaccount_id: string;
  destination_subaccount_id: string;
  market_id: string;
  amount: string;
}
/**
 * MsgDecreasePositionMarginResponse defines the Msg/MsgDecreasePositionMargin
 * response type.
 */
export interface MsgDecreasePositionMarginResponse {}
export interface MsgDecreasePositionMarginResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgDecreasePositionMarginResponse';
  value: Uint8Array;
}
/**
 * MsgDecreasePositionMarginResponse defines the Msg/MsgDecreasePositionMargin
 * response type.
 */
export interface MsgDecreasePositionMarginResponseAmino {}
export interface MsgDecreasePositionMarginResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgDecreasePositionMarginResponse';
  value: MsgDecreasePositionMarginResponseAmino;
}
/**
 * MsgDecreasePositionMarginResponse defines the Msg/MsgDecreasePositionMargin
 * response type.
 */
export interface MsgDecreasePositionMarginResponseSDKType {}
/** MsgPrivilegedExecuteContract defines the Msg/Exec message type */
export interface MsgPrivilegedExecuteContract {
  sender: string;
  /**
   * funds defines the user's bank coins used to fund the execution (e.g.
   * 100inj).
   */
  funds: string;
  /** contract_address defines the contract address to execute */
  contractAddress: string;
  /** data defines the call data used when executing the contract */
  data: string;
}
export interface MsgPrivilegedExecuteContractProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgPrivilegedExecuteContract';
  value: Uint8Array;
}
/** MsgPrivilegedExecuteContract defines the Msg/Exec message type */
export interface MsgPrivilegedExecuteContractAmino {
  sender?: string;
  /**
   * funds defines the user's bank coins used to fund the execution (e.g.
   * 100inj).
   */
  funds?: string;
  /** contract_address defines the contract address to execute */
  contract_address?: string;
  /** data defines the call data used when executing the contract */
  data?: string;
}
export interface MsgPrivilegedExecuteContractAminoMsg {
  type: 'exchange/MsgPrivilegedExecuteContract';
  value: MsgPrivilegedExecuteContractAmino;
}
/** MsgPrivilegedExecuteContract defines the Msg/Exec message type */
export interface MsgPrivilegedExecuteContractSDKType {
  sender: string;
  funds: string;
  contract_address: string;
  data: string;
}
/** MsgPrivilegedExecuteContractResponse defines the Msg/Exec response type. */
export interface MsgPrivilegedExecuteContractResponse {
  fundsDiff: Coin[];
}
export interface MsgPrivilegedExecuteContractResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgPrivilegedExecuteContractResponse';
  value: Uint8Array;
}
/** MsgPrivilegedExecuteContractResponse defines the Msg/Exec response type. */
export interface MsgPrivilegedExecuteContractResponseAmino {
  funds_diff?: CoinAmino[];
}
export interface MsgPrivilegedExecuteContractResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgPrivilegedExecuteContractResponse';
  value: MsgPrivilegedExecuteContractResponseAmino;
}
/** MsgPrivilegedExecuteContractResponse defines the Msg/Exec response type. */
export interface MsgPrivilegedExecuteContractResponseSDKType {
  funds_diff: CoinSDKType[];
}
/** A Cosmos-SDK MsgRewardsOptOut */
export interface MsgRewardsOptOut {
  sender: string;
}
export interface MsgRewardsOptOutProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgRewardsOptOut';
  value: Uint8Array;
}
/** A Cosmos-SDK MsgRewardsOptOut */
export interface MsgRewardsOptOutAmino {
  sender?: string;
}
export interface MsgRewardsOptOutAminoMsg {
  type: 'exchange/MsgRewardsOptOut';
  value: MsgRewardsOptOutAmino;
}
/** A Cosmos-SDK MsgRewardsOptOut */
export interface MsgRewardsOptOutSDKType {
  sender: string;
}
/** MsgRewardsOptOutResponse defines the Msg/RewardsOptOut response type. */
export interface MsgRewardsOptOutResponse {}
export interface MsgRewardsOptOutResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgRewardsOptOutResponse';
  value: Uint8Array;
}
/** MsgRewardsOptOutResponse defines the Msg/RewardsOptOut response type. */
export interface MsgRewardsOptOutResponseAmino {}
export interface MsgRewardsOptOutResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgRewardsOptOutResponse';
  value: MsgRewardsOptOutResponseAmino;
}
/** MsgRewardsOptOutResponse defines the Msg/RewardsOptOut response type. */
export interface MsgRewardsOptOutResponseSDKType {}
/** A Cosmos-SDK MsgReclaimLockedFunds */
export interface MsgReclaimLockedFunds {
  sender: string;
  lockedAccountPubKey: Uint8Array;
  signature: Uint8Array;
}
export interface MsgReclaimLockedFundsProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgReclaimLockedFunds';
  value: Uint8Array;
}
/** A Cosmos-SDK MsgReclaimLockedFunds */
export interface MsgReclaimLockedFundsAmino {
  sender?: string;
  lockedAccountPubKey?: string;
  signature?: string;
}
export interface MsgReclaimLockedFundsAminoMsg {
  type: 'exchange/MsgReclaimLockedFunds';
  value: MsgReclaimLockedFundsAmino;
}
/** A Cosmos-SDK MsgReclaimLockedFunds */
export interface MsgReclaimLockedFundsSDKType {
  sender: string;
  lockedAccountPubKey: Uint8Array;
  signature: Uint8Array;
}
/**
 * MsgReclaimLockedFundsResponse defines the Msg/ReclaimLockedFunds response
 * type.
 */
export interface MsgReclaimLockedFundsResponse {}
export interface MsgReclaimLockedFundsResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgReclaimLockedFundsResponse';
  value: Uint8Array;
}
/**
 * MsgReclaimLockedFundsResponse defines the Msg/ReclaimLockedFunds response
 * type.
 */
export interface MsgReclaimLockedFundsResponseAmino {}
export interface MsgReclaimLockedFundsResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgReclaimLockedFundsResponse';
  value: MsgReclaimLockedFundsResponseAmino;
}
/**
 * MsgReclaimLockedFundsResponse defines the Msg/ReclaimLockedFunds response
 * type.
 */
export interface MsgReclaimLockedFundsResponseSDKType {}
/** MsgSignData defines an arbitrary, general-purpose, off-chain message */
export interface MsgSignData {
  /** Signer is the sdk.AccAddress of the message signer */
  signer: Uint8Array;
  /**
   * Data represents the raw bytes of the content that is signed (text, json,
   * etc)
   */
  data: Uint8Array;
}
export interface MsgSignDataProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgSignData';
  value: Uint8Array;
}
/** MsgSignData defines an arbitrary, general-purpose, off-chain message */
export interface MsgSignDataAmino {
  /** Signer is the sdk.AccAddress of the message signer */
  Signer: string;
  /**
   * Data represents the raw bytes of the content that is signed (text, json,
   * etc)
   */
  Data: string;
}
export interface MsgSignDataAminoMsg {
  type: '/injective.exchange.v1beta1.MsgSignData';
  value: MsgSignDataAmino;
}
/** MsgSignData defines an arbitrary, general-purpose, off-chain message */
export interface MsgSignDataSDKType {
  Signer: Uint8Array;
  Data: Uint8Array;
}
/** MsgSignDoc defines an arbitrary, general-purpose, off-chain message */
export interface MsgSignDoc {
  signType: string;
  value: MsgSignData;
}
export interface MsgSignDocProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgSignDoc';
  value: Uint8Array;
}
/** MsgSignDoc defines an arbitrary, general-purpose, off-chain message */
export interface MsgSignDocAmino {
  sign_type: string;
  value?: MsgSignDataAmino;
}
export interface MsgSignDocAminoMsg {
  type: '/injective.exchange.v1beta1.MsgSignDoc';
  value: MsgSignDocAmino;
}
/** MsgSignDoc defines an arbitrary, general-purpose, off-chain message */
export interface MsgSignDocSDKType {
  sign_type: string;
  value: MsgSignDataSDKType;
}
/**
 * MsgAdminUpdateBinaryOptionsMarket is used by the market Admin to operate the
 * market
 */
export interface MsgAdminUpdateBinaryOptionsMarket {
  sender: string;
  marketId: string;
  /** new price at which market will be settled */
  settlementPrice?: string;
  /** expiration timestamp */
  expirationTimestamp: bigint;
  /** expiration timestamp */
  settlementTimestamp: bigint;
  /** Status of the market */
  status: MarketStatus;
}
export interface MsgAdminUpdateBinaryOptionsMarketProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgAdminUpdateBinaryOptionsMarket';
  value: Uint8Array;
}
/**
 * MsgAdminUpdateBinaryOptionsMarket is used by the market Admin to operate the
 * market
 */
export interface MsgAdminUpdateBinaryOptionsMarketAmino {
  sender?: string;
  market_id?: string;
  /** new price at which market will be settled */
  settlement_price?: string;
  /** expiration timestamp */
  expiration_timestamp?: string;
  /** expiration timestamp */
  settlement_timestamp?: string;
  /** Status of the market */
  status?: MarketStatus;
}
export interface MsgAdminUpdateBinaryOptionsMarketAminoMsg {
  type: 'exchange/MsgAdminUpdateBinaryOptionsMarket';
  value: MsgAdminUpdateBinaryOptionsMarketAmino;
}
/**
 * MsgAdminUpdateBinaryOptionsMarket is used by the market Admin to operate the
 * market
 */
export interface MsgAdminUpdateBinaryOptionsMarketSDKType {
  sender: string;
  market_id: string;
  settlement_price?: string;
  expiration_timestamp: bigint;
  settlement_timestamp: bigint;
  status: MarketStatus;
}
/**
 * MsgAdminUpdateBinaryOptionsMarketResponse is the response for
 * AdminUpdateBinaryOptionsMarket rpc method
 */
export interface MsgAdminUpdateBinaryOptionsMarketResponse {}
export interface MsgAdminUpdateBinaryOptionsMarketResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgAdminUpdateBinaryOptionsMarketResponse';
  value: Uint8Array;
}
/**
 * MsgAdminUpdateBinaryOptionsMarketResponse is the response for
 * AdminUpdateBinaryOptionsMarket rpc method
 */
export interface MsgAdminUpdateBinaryOptionsMarketResponseAmino {}
export interface MsgAdminUpdateBinaryOptionsMarketResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgAdminUpdateBinaryOptionsMarketResponse';
  value: MsgAdminUpdateBinaryOptionsMarketResponseAmino;
}
/**
 * MsgAdminUpdateBinaryOptionsMarketResponse is the response for
 * AdminUpdateBinaryOptionsMarket rpc method
 */
export interface MsgAdminUpdateBinaryOptionsMarketResponseSDKType {}
/** MsgAuthorizeStakeGrants grants stakes to grantees. */
export interface MsgAuthorizeStakeGrants {
  sender: string;
  grants: GrantAuthorization[];
}
export interface MsgAuthorizeStakeGrantsProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgAuthorizeStakeGrants';
  value: Uint8Array;
}
/** MsgAuthorizeStakeGrants grants stakes to grantees. */
export interface MsgAuthorizeStakeGrantsAmino {
  sender?: string;
  grants?: GrantAuthorizationAmino[];
}
export interface MsgAuthorizeStakeGrantsAminoMsg {
  type: 'exchange/MsgAuthorizeStakeGrants';
  value: MsgAuthorizeStakeGrantsAmino;
}
/** MsgAuthorizeStakeGrants grants stakes to grantees. */
export interface MsgAuthorizeStakeGrantsSDKType {
  sender: string;
  grants: GrantAuthorizationSDKType[];
}
export interface MsgAuthorizeStakeGrantsResponse {}
export interface MsgAuthorizeStakeGrantsResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgAuthorizeStakeGrantsResponse';
  value: Uint8Array;
}
export interface MsgAuthorizeStakeGrantsResponseAmino {}
export interface MsgAuthorizeStakeGrantsResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgAuthorizeStakeGrantsResponse';
  value: MsgAuthorizeStakeGrantsResponseAmino;
}
export interface MsgAuthorizeStakeGrantsResponseSDKType {}
/** MsgActivateStakeGrant allows a grantee to activate a stake grant. */
export interface MsgActivateStakeGrant {
  sender: string;
  granter: string;
}
export interface MsgActivateStakeGrantProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgActivateStakeGrant';
  value: Uint8Array;
}
/** MsgActivateStakeGrant allows a grantee to activate a stake grant. */
export interface MsgActivateStakeGrantAmino {
  sender?: string;
  granter?: string;
}
export interface MsgActivateStakeGrantAminoMsg {
  type: 'exchange/MsgActivateStakeGrant';
  value: MsgActivateStakeGrantAmino;
}
/** MsgActivateStakeGrant allows a grantee to activate a stake grant. */
export interface MsgActivateStakeGrantSDKType {
  sender: string;
  granter: string;
}
export interface MsgActivateStakeGrantResponse {}
export interface MsgActivateStakeGrantResponseProtoMsg {
  typeUrl: '/injective.exchange.v1beta1.MsgActivateStakeGrantResponse';
  value: Uint8Array;
}
export interface MsgActivateStakeGrantResponseAmino {}
export interface MsgActivateStakeGrantResponseAminoMsg {
  type: '/injective.exchange.v1beta1.MsgActivateStakeGrantResponse';
  value: MsgActivateStakeGrantResponseAmino;
}
export interface MsgActivateStakeGrantResponseSDKType {}
function createBaseMsgUpdateSpotMarket(): MsgUpdateSpotMarket {
  return {
    admin: '',
    marketId: '',
    newTicker: '',
    newMinPriceTickSize: '',
    newMinQuantityTickSize: '',
    newMinNotional: '',
  };
}
export const MsgUpdateSpotMarket = {
  typeUrl: '/injective.exchange.v1beta1.MsgUpdateSpotMarket',
  encode(message: MsgUpdateSpotMarket, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.admin !== '') {
      writer.uint32(10).string(message.admin);
    }
    if (message.marketId !== '') {
      writer.uint32(18).string(message.marketId);
    }
    if (message.newTicker !== '') {
      writer.uint32(26).string(message.newTicker);
    }
    if (message.newMinPriceTickSize !== '') {
      writer.uint32(34).string(Decimal.fromUserInput(message.newMinPriceTickSize, 18).atomics);
    }
    if (message.newMinQuantityTickSize !== '') {
      writer.uint32(42).string(Decimal.fromUserInput(message.newMinQuantityTickSize, 18).atomics);
    }
    if (message.newMinNotional !== '') {
      writer.uint32(50).string(Decimal.fromUserInput(message.newMinNotional, 18).atomics);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateSpotMarket {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateSpotMarket();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.admin = reader.string();
          break;
        case 2:
          message.marketId = reader.string();
          break;
        case 3:
          message.newTicker = reader.string();
          break;
        case 4:
          message.newMinPriceTickSize = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 5:
          message.newMinQuantityTickSize = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 6:
          message.newMinNotional = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgUpdateSpotMarket>): MsgUpdateSpotMarket {
    const message = createBaseMsgUpdateSpotMarket();
    message.admin = object.admin ?? '';
    message.marketId = object.marketId ?? '';
    message.newTicker = object.newTicker ?? '';
    message.newMinPriceTickSize = object.newMinPriceTickSize ?? '';
    message.newMinQuantityTickSize = object.newMinQuantityTickSize ?? '';
    message.newMinNotional = object.newMinNotional ?? '';
    return message;
  },
  fromAmino(object: MsgUpdateSpotMarketAmino): MsgUpdateSpotMarket {
    const message = createBaseMsgUpdateSpotMarket();
    if (object.admin !== undefined && object.admin !== null) {
      message.admin = object.admin;
    }
    if (object.market_id !== undefined && object.market_id !== null) {
      message.marketId = object.market_id;
    }
    if (object.new_ticker !== undefined && object.new_ticker !== null) {
      message.newTicker = object.new_ticker;
    }
    if (object.new_min_price_tick_size !== undefined && object.new_min_price_tick_size !== null) {
      message.newMinPriceTickSize = object.new_min_price_tick_size;
    }
    if (object.new_min_quantity_tick_size !== undefined && object.new_min_quantity_tick_size !== null) {
      message.newMinQuantityTickSize = object.new_min_quantity_tick_size;
    }
    if (object.new_min_notional !== undefined && object.new_min_notional !== null) {
      message.newMinNotional = object.new_min_notional;
    }
    return message;
  },
  toAmino(message: MsgUpdateSpotMarket): MsgUpdateSpotMarketAmino {
    const obj: any = {};
    obj.admin = message.admin === '' ? undefined : message.admin;
    obj.market_id = message.marketId === '' ? undefined : message.marketId;
    obj.new_ticker = message.newTicker === '' ? undefined : message.newTicker;
    obj.new_min_price_tick_size = message.newMinPriceTickSize === '' ? undefined : message.newMinPriceTickSize;
    obj.new_min_quantity_tick_size = message.newMinQuantityTickSize === '' ? undefined : message.newMinQuantityTickSize;
    obj.new_min_notional = message.newMinNotional === '' ? undefined : message.newMinNotional;
    return obj;
  },
  fromAminoMsg(object: MsgUpdateSpotMarketAminoMsg): MsgUpdateSpotMarket {
    return MsgUpdateSpotMarket.fromAmino(object.value);
  },
  toAminoMsg(message: MsgUpdateSpotMarket): MsgUpdateSpotMarketAminoMsg {
    return {
      type: 'exchange/MsgUpdateSpotMarket',
      value: MsgUpdateSpotMarket.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgUpdateSpotMarketProtoMsg): MsgUpdateSpotMarket {
    return MsgUpdateSpotMarket.decode(message.value);
  },
  toProto(message: MsgUpdateSpotMarket): Uint8Array {
    return MsgUpdateSpotMarket.encode(message).finish();
  },
  toProtoMsg(message: MsgUpdateSpotMarket): MsgUpdateSpotMarketProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgUpdateSpotMarket',
      value: MsgUpdateSpotMarket.encode(message).finish(),
    };
  },
};
function createBaseMsgUpdateSpotMarketResponse(): MsgUpdateSpotMarketResponse {
  return {};
}
export const MsgUpdateSpotMarketResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgUpdateSpotMarketResponse',
  encode(_: MsgUpdateSpotMarketResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateSpotMarketResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateSpotMarketResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgUpdateSpotMarketResponse>): MsgUpdateSpotMarketResponse {
    const message = createBaseMsgUpdateSpotMarketResponse();
    return message;
  },
  fromAmino(_: MsgUpdateSpotMarketResponseAmino): MsgUpdateSpotMarketResponse {
    const message = createBaseMsgUpdateSpotMarketResponse();
    return message;
  },
  toAmino(_: MsgUpdateSpotMarketResponse): MsgUpdateSpotMarketResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgUpdateSpotMarketResponseAminoMsg): MsgUpdateSpotMarketResponse {
    return MsgUpdateSpotMarketResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgUpdateSpotMarketResponseProtoMsg): MsgUpdateSpotMarketResponse {
    return MsgUpdateSpotMarketResponse.decode(message.value);
  },
  toProto(message: MsgUpdateSpotMarketResponse): Uint8Array {
    return MsgUpdateSpotMarketResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgUpdateSpotMarketResponse): MsgUpdateSpotMarketResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgUpdateSpotMarketResponse',
      value: MsgUpdateSpotMarketResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgUpdateDerivativeMarket(): MsgUpdateDerivativeMarket {
  return {
    admin: '',
    marketId: '',
    newTicker: '',
    newMinPriceTickSize: '',
    newMinQuantityTickSize: '',
    newMinNotional: '',
    newInitialMarginRatio: '',
    newMaintenanceMarginRatio: '',
  };
}
export const MsgUpdateDerivativeMarket = {
  typeUrl: '/injective.exchange.v1beta1.MsgUpdateDerivativeMarket',
  encode(message: MsgUpdateDerivativeMarket, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.admin !== '') {
      writer.uint32(10).string(message.admin);
    }
    if (message.marketId !== '') {
      writer.uint32(18).string(message.marketId);
    }
    if (message.newTicker !== '') {
      writer.uint32(26).string(message.newTicker);
    }
    if (message.newMinPriceTickSize !== '') {
      writer.uint32(34).string(Decimal.fromUserInput(message.newMinPriceTickSize, 18).atomics);
    }
    if (message.newMinQuantityTickSize !== '') {
      writer.uint32(42).string(Decimal.fromUserInput(message.newMinQuantityTickSize, 18).atomics);
    }
    if (message.newMinNotional !== '') {
      writer.uint32(50).string(Decimal.fromUserInput(message.newMinNotional, 18).atomics);
    }
    if (message.newInitialMarginRatio !== '') {
      writer.uint32(58).string(Decimal.fromUserInput(message.newInitialMarginRatio, 18).atomics);
    }
    if (message.newMaintenanceMarginRatio !== '') {
      writer.uint32(66).string(Decimal.fromUserInput(message.newMaintenanceMarginRatio, 18).atomics);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateDerivativeMarket {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateDerivativeMarket();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.admin = reader.string();
          break;
        case 2:
          message.marketId = reader.string();
          break;
        case 3:
          message.newTicker = reader.string();
          break;
        case 4:
          message.newMinPriceTickSize = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 5:
          message.newMinQuantityTickSize = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 6:
          message.newMinNotional = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 7:
          message.newInitialMarginRatio = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 8:
          message.newMaintenanceMarginRatio = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgUpdateDerivativeMarket>): MsgUpdateDerivativeMarket {
    const message = createBaseMsgUpdateDerivativeMarket();
    message.admin = object.admin ?? '';
    message.marketId = object.marketId ?? '';
    message.newTicker = object.newTicker ?? '';
    message.newMinPriceTickSize = object.newMinPriceTickSize ?? '';
    message.newMinQuantityTickSize = object.newMinQuantityTickSize ?? '';
    message.newMinNotional = object.newMinNotional ?? '';
    message.newInitialMarginRatio = object.newInitialMarginRatio ?? '';
    message.newMaintenanceMarginRatio = object.newMaintenanceMarginRatio ?? '';
    return message;
  },
  fromAmino(object: MsgUpdateDerivativeMarketAmino): MsgUpdateDerivativeMarket {
    const message = createBaseMsgUpdateDerivativeMarket();
    if (object.admin !== undefined && object.admin !== null) {
      message.admin = object.admin;
    }
    if (object.market_id !== undefined && object.market_id !== null) {
      message.marketId = object.market_id;
    }
    if (object.new_ticker !== undefined && object.new_ticker !== null) {
      message.newTicker = object.new_ticker;
    }
    if (object.new_min_price_tick_size !== undefined && object.new_min_price_tick_size !== null) {
      message.newMinPriceTickSize = object.new_min_price_tick_size;
    }
    if (object.new_min_quantity_tick_size !== undefined && object.new_min_quantity_tick_size !== null) {
      message.newMinQuantityTickSize = object.new_min_quantity_tick_size;
    }
    if (object.new_min_notional !== undefined && object.new_min_notional !== null) {
      message.newMinNotional = object.new_min_notional;
    }
    if (object.new_initial_margin_ratio !== undefined && object.new_initial_margin_ratio !== null) {
      message.newInitialMarginRatio = object.new_initial_margin_ratio;
    }
    if (object.new_maintenance_margin_ratio !== undefined && object.new_maintenance_margin_ratio !== null) {
      message.newMaintenanceMarginRatio = object.new_maintenance_margin_ratio;
    }
    return message;
  },
  toAmino(message: MsgUpdateDerivativeMarket): MsgUpdateDerivativeMarketAmino {
    const obj: any = {};
    obj.admin = message.admin === '' ? undefined : message.admin;
    obj.market_id = message.marketId === '' ? undefined : message.marketId;
    obj.new_ticker = message.newTicker === '' ? undefined : message.newTicker;
    obj.new_min_price_tick_size = message.newMinPriceTickSize === '' ? undefined : message.newMinPriceTickSize;
    obj.new_min_quantity_tick_size = message.newMinQuantityTickSize === '' ? undefined : message.newMinQuantityTickSize;
    obj.new_min_notional = message.newMinNotional === '' ? undefined : message.newMinNotional;
    obj.new_initial_margin_ratio = message.newInitialMarginRatio === '' ? undefined : message.newInitialMarginRatio;
    obj.new_maintenance_margin_ratio =
      message.newMaintenanceMarginRatio === '' ? undefined : message.newMaintenanceMarginRatio;
    return obj;
  },
  fromAminoMsg(object: MsgUpdateDerivativeMarketAminoMsg): MsgUpdateDerivativeMarket {
    return MsgUpdateDerivativeMarket.fromAmino(object.value);
  },
  toAminoMsg(message: MsgUpdateDerivativeMarket): MsgUpdateDerivativeMarketAminoMsg {
    return {
      type: 'exchange/MsgUpdateDerivativeMarket',
      value: MsgUpdateDerivativeMarket.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgUpdateDerivativeMarketProtoMsg): MsgUpdateDerivativeMarket {
    return MsgUpdateDerivativeMarket.decode(message.value);
  },
  toProto(message: MsgUpdateDerivativeMarket): Uint8Array {
    return MsgUpdateDerivativeMarket.encode(message).finish();
  },
  toProtoMsg(message: MsgUpdateDerivativeMarket): MsgUpdateDerivativeMarketProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgUpdateDerivativeMarket',
      value: MsgUpdateDerivativeMarket.encode(message).finish(),
    };
  },
};
function createBaseMsgUpdateDerivativeMarketResponse(): MsgUpdateDerivativeMarketResponse {
  return {};
}
export const MsgUpdateDerivativeMarketResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgUpdateDerivativeMarketResponse',
  encode(_: MsgUpdateDerivativeMarketResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateDerivativeMarketResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateDerivativeMarketResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgUpdateDerivativeMarketResponse>): MsgUpdateDerivativeMarketResponse {
    const message = createBaseMsgUpdateDerivativeMarketResponse();
    return message;
  },
  fromAmino(_: MsgUpdateDerivativeMarketResponseAmino): MsgUpdateDerivativeMarketResponse {
    const message = createBaseMsgUpdateDerivativeMarketResponse();
    return message;
  },
  toAmino(_: MsgUpdateDerivativeMarketResponse): MsgUpdateDerivativeMarketResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgUpdateDerivativeMarketResponseAminoMsg): MsgUpdateDerivativeMarketResponse {
    return MsgUpdateDerivativeMarketResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgUpdateDerivativeMarketResponseProtoMsg): MsgUpdateDerivativeMarketResponse {
    return MsgUpdateDerivativeMarketResponse.decode(message.value);
  },
  toProto(message: MsgUpdateDerivativeMarketResponse): Uint8Array {
    return MsgUpdateDerivativeMarketResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgUpdateDerivativeMarketResponse): MsgUpdateDerivativeMarketResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgUpdateDerivativeMarketResponse',
      value: MsgUpdateDerivativeMarketResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgUpdateParams(): MsgUpdateParams {
  return {
    authority: '',
    params: Params.fromPartial({}),
  };
}
export const MsgUpdateParams = {
  typeUrl: '/injective.exchange.v1beta1.MsgUpdateParams',
  encode(message: MsgUpdateParams, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.authority !== '') {
      writer.uint32(10).string(message.authority);
    }
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateParams {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.authority = reader.string();
          break;
        case 2:
          message.params = Params.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgUpdateParams>): MsgUpdateParams {
    const message = createBaseMsgUpdateParams();
    message.authority = object.authority ?? '';
    message.params =
      object.params !== undefined && object.params !== null ? Params.fromPartial(object.params) : undefined;
    return message;
  },
  fromAmino(object: MsgUpdateParamsAmino): MsgUpdateParams {
    const message = createBaseMsgUpdateParams();
    if (object.authority !== undefined && object.authority !== null) {
      message.authority = object.authority;
    }
    if (object.params !== undefined && object.params !== null) {
      message.params = Params.fromAmino(object.params);
    }
    return message;
  },
  toAmino(message: MsgUpdateParams): MsgUpdateParamsAmino {
    const obj: any = {};
    obj.authority = message.authority === '' ? undefined : message.authority;
    obj.params = message.params ? Params.toAmino(message.params) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgUpdateParamsAminoMsg): MsgUpdateParams {
    return MsgUpdateParams.fromAmino(object.value);
  },
  toAminoMsg(message: MsgUpdateParams): MsgUpdateParamsAminoMsg {
    return {
      type: 'exchange/MsgUpdateParams',
      value: MsgUpdateParams.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgUpdateParamsProtoMsg): MsgUpdateParams {
    return MsgUpdateParams.decode(message.value);
  },
  toProto(message: MsgUpdateParams): Uint8Array {
    return MsgUpdateParams.encode(message).finish();
  },
  toProtoMsg(message: MsgUpdateParams): MsgUpdateParamsProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgUpdateParams',
      value: MsgUpdateParams.encode(message).finish(),
    };
  },
};
function createBaseMsgUpdateParamsResponse(): MsgUpdateParamsResponse {
  return {};
}
export const MsgUpdateParamsResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgUpdateParamsResponse',
  encode(_: MsgUpdateParamsResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateParamsResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateParamsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgUpdateParamsResponse>): MsgUpdateParamsResponse {
    const message = createBaseMsgUpdateParamsResponse();
    return message;
  },
  fromAmino(_: MsgUpdateParamsResponseAmino): MsgUpdateParamsResponse {
    const message = createBaseMsgUpdateParamsResponse();
    return message;
  },
  toAmino(_: MsgUpdateParamsResponse): MsgUpdateParamsResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgUpdateParamsResponseAminoMsg): MsgUpdateParamsResponse {
    return MsgUpdateParamsResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgUpdateParamsResponseProtoMsg): MsgUpdateParamsResponse {
    return MsgUpdateParamsResponse.decode(message.value);
  },
  toProto(message: MsgUpdateParamsResponse): Uint8Array {
    return MsgUpdateParamsResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgUpdateParamsResponse): MsgUpdateParamsResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgUpdateParamsResponse',
      value: MsgUpdateParamsResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgDeposit(): MsgDeposit {
  return {
    sender: '',
    subaccountId: '',
    amount: Coin.fromPartial({}),
  };
}
export const MsgDeposit = {
  typeUrl: '/injective.exchange.v1beta1.MsgDeposit',
  encode(message: MsgDeposit, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.subaccountId !== '') {
      writer.uint32(18).string(message.subaccountId);
    }
    if (message.amount !== undefined) {
      Coin.encode(message.amount, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgDeposit {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDeposit();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.subaccountId = reader.string();
          break;
        case 3:
          message.amount = Coin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgDeposit>): MsgDeposit {
    const message = createBaseMsgDeposit();
    message.sender = object.sender ?? '';
    message.subaccountId = object.subaccountId ?? '';
    message.amount =
      object.amount !== undefined && object.amount !== null ? Coin.fromPartial(object.amount) : undefined;
    return message;
  },
  fromAmino(object: MsgDepositAmino): MsgDeposit {
    const message = createBaseMsgDeposit();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.subaccount_id !== undefined && object.subaccount_id !== null) {
      message.subaccountId = object.subaccount_id;
    }
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = Coin.fromAmino(object.amount);
    }
    return message;
  },
  toAmino(message: MsgDeposit): MsgDepositAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.subaccount_id = message.subaccountId === '' ? undefined : message.subaccountId;
    obj.amount = message.amount ? Coin.toAmino(message.amount) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgDepositAminoMsg): MsgDeposit {
    return MsgDeposit.fromAmino(object.value);
  },
  toAminoMsg(message: MsgDeposit): MsgDepositAminoMsg {
    return {
      type: 'exchange/MsgDeposit',
      value: MsgDeposit.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgDepositProtoMsg): MsgDeposit {
    return MsgDeposit.decode(message.value);
  },
  toProto(message: MsgDeposit): Uint8Array {
    return MsgDeposit.encode(message).finish();
  },
  toProtoMsg(message: MsgDeposit): MsgDepositProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgDeposit',
      value: MsgDeposit.encode(message).finish(),
    };
  },
};
function createBaseMsgDepositResponse(): MsgDepositResponse {
  return {};
}
export const MsgDepositResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgDepositResponse',
  encode(_: MsgDepositResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgDepositResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDepositResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgDepositResponse>): MsgDepositResponse {
    const message = createBaseMsgDepositResponse();
    return message;
  },
  fromAmino(_: MsgDepositResponseAmino): MsgDepositResponse {
    const message = createBaseMsgDepositResponse();
    return message;
  },
  toAmino(_: MsgDepositResponse): MsgDepositResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgDepositResponseAminoMsg): MsgDepositResponse {
    return MsgDepositResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgDepositResponseProtoMsg): MsgDepositResponse {
    return MsgDepositResponse.decode(message.value);
  },
  toProto(message: MsgDepositResponse): Uint8Array {
    return MsgDepositResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgDepositResponse): MsgDepositResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgDepositResponse',
      value: MsgDepositResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgWithdraw(): MsgWithdraw {
  return {
    sender: '',
    subaccountId: '',
    amount: Coin.fromPartial({}),
  };
}
export const MsgWithdraw = {
  typeUrl: '/injective.exchange.v1beta1.MsgWithdraw',
  encode(message: MsgWithdraw, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.subaccountId !== '') {
      writer.uint32(18).string(message.subaccountId);
    }
    if (message.amount !== undefined) {
      Coin.encode(message.amount, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgWithdraw {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgWithdraw();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.subaccountId = reader.string();
          break;
        case 3:
          message.amount = Coin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgWithdraw>): MsgWithdraw {
    const message = createBaseMsgWithdraw();
    message.sender = object.sender ?? '';
    message.subaccountId = object.subaccountId ?? '';
    message.amount =
      object.amount !== undefined && object.amount !== null ? Coin.fromPartial(object.amount) : undefined;
    return message;
  },
  fromAmino(object: MsgWithdrawAmino): MsgWithdraw {
    const message = createBaseMsgWithdraw();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.subaccount_id !== undefined && object.subaccount_id !== null) {
      message.subaccountId = object.subaccount_id;
    }
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = Coin.fromAmino(object.amount);
    }
    return message;
  },
  toAmino(message: MsgWithdraw): MsgWithdrawAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.subaccount_id = message.subaccountId === '' ? undefined : message.subaccountId;
    obj.amount = message.amount ? Coin.toAmino(message.amount) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgWithdrawAminoMsg): MsgWithdraw {
    return MsgWithdraw.fromAmino(object.value);
  },
  toAminoMsg(message: MsgWithdraw): MsgWithdrawAminoMsg {
    return {
      type: 'exchange/MsgWithdraw',
      value: MsgWithdraw.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgWithdrawProtoMsg): MsgWithdraw {
    return MsgWithdraw.decode(message.value);
  },
  toProto(message: MsgWithdraw): Uint8Array {
    return MsgWithdraw.encode(message).finish();
  },
  toProtoMsg(message: MsgWithdraw): MsgWithdrawProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgWithdraw',
      value: MsgWithdraw.encode(message).finish(),
    };
  },
};
function createBaseMsgWithdrawResponse(): MsgWithdrawResponse {
  return {};
}
export const MsgWithdrawResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgWithdrawResponse',
  encode(_: MsgWithdrawResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgWithdrawResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgWithdrawResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgWithdrawResponse>): MsgWithdrawResponse {
    const message = createBaseMsgWithdrawResponse();
    return message;
  },
  fromAmino(_: MsgWithdrawResponseAmino): MsgWithdrawResponse {
    const message = createBaseMsgWithdrawResponse();
    return message;
  },
  toAmino(_: MsgWithdrawResponse): MsgWithdrawResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgWithdrawResponseAminoMsg): MsgWithdrawResponse {
    return MsgWithdrawResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgWithdrawResponseProtoMsg): MsgWithdrawResponse {
    return MsgWithdrawResponse.decode(message.value);
  },
  toProto(message: MsgWithdrawResponse): Uint8Array {
    return MsgWithdrawResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgWithdrawResponse): MsgWithdrawResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgWithdrawResponse',
      value: MsgWithdrawResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateSpotLimitOrder(): MsgCreateSpotLimitOrder {
  return {
    sender: '',
    order: SpotOrder.fromPartial({}),
  };
}
export const MsgCreateSpotLimitOrder = {
  typeUrl: '/injective.exchange.v1beta1.MsgCreateSpotLimitOrder',
  encode(message: MsgCreateSpotLimitOrder, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.order !== undefined) {
      SpotOrder.encode(message.order, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateSpotLimitOrder {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateSpotLimitOrder();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.order = SpotOrder.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCreateSpotLimitOrder>): MsgCreateSpotLimitOrder {
    const message = createBaseMsgCreateSpotLimitOrder();
    message.sender = object.sender ?? '';
    message.order =
      object.order !== undefined && object.order !== null ? SpotOrder.fromPartial(object.order) : undefined;
    return message;
  },
  fromAmino(object: MsgCreateSpotLimitOrderAmino): MsgCreateSpotLimitOrder {
    const message = createBaseMsgCreateSpotLimitOrder();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.order !== undefined && object.order !== null) {
      message.order = SpotOrder.fromAmino(object.order);
    }
    return message;
  },
  toAmino(message: MsgCreateSpotLimitOrder): MsgCreateSpotLimitOrderAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.order = message.order ? SpotOrder.toAmino(message.order) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgCreateSpotLimitOrderAminoMsg): MsgCreateSpotLimitOrder {
    return MsgCreateSpotLimitOrder.fromAmino(object.value);
  },
  toAminoMsg(message: MsgCreateSpotLimitOrder): MsgCreateSpotLimitOrderAminoMsg {
    return {
      type: 'exchange/MsgCreateSpotLimitOrder',
      value: MsgCreateSpotLimitOrder.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgCreateSpotLimitOrderProtoMsg): MsgCreateSpotLimitOrder {
    return MsgCreateSpotLimitOrder.decode(message.value);
  },
  toProto(message: MsgCreateSpotLimitOrder): Uint8Array {
    return MsgCreateSpotLimitOrder.encode(message).finish();
  },
  toProtoMsg(message: MsgCreateSpotLimitOrder): MsgCreateSpotLimitOrderProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgCreateSpotLimitOrder',
      value: MsgCreateSpotLimitOrder.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateSpotLimitOrderResponse(): MsgCreateSpotLimitOrderResponse {
  return {
    orderHash: '',
    cid: '',
  };
}
export const MsgCreateSpotLimitOrderResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgCreateSpotLimitOrderResponse',
  encode(message: MsgCreateSpotLimitOrderResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.orderHash !== '') {
      writer.uint32(10).string(message.orderHash);
    }
    if (message.cid !== '') {
      writer.uint32(18).string(message.cid);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateSpotLimitOrderResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateSpotLimitOrderResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.orderHash = reader.string();
          break;
        case 2:
          message.cid = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCreateSpotLimitOrderResponse>): MsgCreateSpotLimitOrderResponse {
    const message = createBaseMsgCreateSpotLimitOrderResponse();
    message.orderHash = object.orderHash ?? '';
    message.cid = object.cid ?? '';
    return message;
  },
  fromAmino(object: MsgCreateSpotLimitOrderResponseAmino): MsgCreateSpotLimitOrderResponse {
    const message = createBaseMsgCreateSpotLimitOrderResponse();
    if (object.order_hash !== undefined && object.order_hash !== null) {
      message.orderHash = object.order_hash;
    }
    if (object.cid !== undefined && object.cid !== null) {
      message.cid = object.cid;
    }
    return message;
  },
  toAmino(message: MsgCreateSpotLimitOrderResponse): MsgCreateSpotLimitOrderResponseAmino {
    const obj: any = {};
    obj.order_hash = message.orderHash === '' ? undefined : message.orderHash;
    obj.cid = message.cid === '' ? undefined : message.cid;
    return obj;
  },
  fromAminoMsg(object: MsgCreateSpotLimitOrderResponseAminoMsg): MsgCreateSpotLimitOrderResponse {
    return MsgCreateSpotLimitOrderResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgCreateSpotLimitOrderResponseProtoMsg): MsgCreateSpotLimitOrderResponse {
    return MsgCreateSpotLimitOrderResponse.decode(message.value);
  },
  toProto(message: MsgCreateSpotLimitOrderResponse): Uint8Array {
    return MsgCreateSpotLimitOrderResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgCreateSpotLimitOrderResponse): MsgCreateSpotLimitOrderResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgCreateSpotLimitOrderResponse',
      value: MsgCreateSpotLimitOrderResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgBatchCreateSpotLimitOrders(): MsgBatchCreateSpotLimitOrders {
  return {
    sender: '',
    orders: [],
  };
}
export const MsgBatchCreateSpotLimitOrders = {
  typeUrl: '/injective.exchange.v1beta1.MsgBatchCreateSpotLimitOrders',
  encode(message: MsgBatchCreateSpotLimitOrders, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    for (const v of message.orders) {
      SpotOrder.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgBatchCreateSpotLimitOrders {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBatchCreateSpotLimitOrders();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.orders.push(SpotOrder.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgBatchCreateSpotLimitOrders>): MsgBatchCreateSpotLimitOrders {
    const message = createBaseMsgBatchCreateSpotLimitOrders();
    message.sender = object.sender ?? '';
    message.orders = object.orders?.map((e) => SpotOrder.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: MsgBatchCreateSpotLimitOrdersAmino): MsgBatchCreateSpotLimitOrders {
    const message = createBaseMsgBatchCreateSpotLimitOrders();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    message.orders = object.orders?.map((e) => SpotOrder.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: MsgBatchCreateSpotLimitOrders): MsgBatchCreateSpotLimitOrdersAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    if (message.orders) {
      obj.orders = message.orders.map((e) => (e ? SpotOrder.toAmino(e) : undefined));
    } else {
      obj.orders = message.orders;
    }
    return obj;
  },
  fromAminoMsg(object: MsgBatchCreateSpotLimitOrdersAminoMsg): MsgBatchCreateSpotLimitOrders {
    return MsgBatchCreateSpotLimitOrders.fromAmino(object.value);
  },
  toAminoMsg(message: MsgBatchCreateSpotLimitOrders): MsgBatchCreateSpotLimitOrdersAminoMsg {
    return {
      type: 'exchange/MsgBatchCreateSpotLimitOrders',
      value: MsgBatchCreateSpotLimitOrders.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgBatchCreateSpotLimitOrdersProtoMsg): MsgBatchCreateSpotLimitOrders {
    return MsgBatchCreateSpotLimitOrders.decode(message.value);
  },
  toProto(message: MsgBatchCreateSpotLimitOrders): Uint8Array {
    return MsgBatchCreateSpotLimitOrders.encode(message).finish();
  },
  toProtoMsg(message: MsgBatchCreateSpotLimitOrders): MsgBatchCreateSpotLimitOrdersProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgBatchCreateSpotLimitOrders',
      value: MsgBatchCreateSpotLimitOrders.encode(message).finish(),
    };
  },
};
function createBaseMsgBatchCreateSpotLimitOrdersResponse(): MsgBatchCreateSpotLimitOrdersResponse {
  return {
    orderHashes: [],
    createdOrdersCids: [],
    failedOrdersCids: [],
  };
}
export const MsgBatchCreateSpotLimitOrdersResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgBatchCreateSpotLimitOrdersResponse',
  encode(message: MsgBatchCreateSpotLimitOrdersResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.orderHashes) {
      writer.uint32(10).string(v!);
    }
    for (const v of message.createdOrdersCids) {
      writer.uint32(18).string(v!);
    }
    for (const v of message.failedOrdersCids) {
      writer.uint32(26).string(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgBatchCreateSpotLimitOrdersResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBatchCreateSpotLimitOrdersResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.orderHashes.push(reader.string());
          break;
        case 2:
          message.createdOrdersCids.push(reader.string());
          break;
        case 3:
          message.failedOrdersCids.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgBatchCreateSpotLimitOrdersResponse>): MsgBatchCreateSpotLimitOrdersResponse {
    const message = createBaseMsgBatchCreateSpotLimitOrdersResponse();
    message.orderHashes = object.orderHashes?.map((e) => e) || [];
    message.createdOrdersCids = object.createdOrdersCids?.map((e) => e) || [];
    message.failedOrdersCids = object.failedOrdersCids?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: MsgBatchCreateSpotLimitOrdersResponseAmino): MsgBatchCreateSpotLimitOrdersResponse {
    const message = createBaseMsgBatchCreateSpotLimitOrdersResponse();
    message.orderHashes = object.order_hashes?.map((e) => e) || [];
    message.createdOrdersCids = object.created_orders_cids?.map((e) => e) || [];
    message.failedOrdersCids = object.failed_orders_cids?.map((e) => e) || [];
    return message;
  },
  toAmino(message: MsgBatchCreateSpotLimitOrdersResponse): MsgBatchCreateSpotLimitOrdersResponseAmino {
    const obj: any = {};
    if (message.orderHashes) {
      obj.order_hashes = message.orderHashes.map((e) => e);
    } else {
      obj.order_hashes = message.orderHashes;
    }
    if (message.createdOrdersCids) {
      obj.created_orders_cids = message.createdOrdersCids.map((e) => e);
    } else {
      obj.created_orders_cids = message.createdOrdersCids;
    }
    if (message.failedOrdersCids) {
      obj.failed_orders_cids = message.failedOrdersCids.map((e) => e);
    } else {
      obj.failed_orders_cids = message.failedOrdersCids;
    }
    return obj;
  },
  fromAminoMsg(object: MsgBatchCreateSpotLimitOrdersResponseAminoMsg): MsgBatchCreateSpotLimitOrdersResponse {
    return MsgBatchCreateSpotLimitOrdersResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgBatchCreateSpotLimitOrdersResponseProtoMsg): MsgBatchCreateSpotLimitOrdersResponse {
    return MsgBatchCreateSpotLimitOrdersResponse.decode(message.value);
  },
  toProto(message: MsgBatchCreateSpotLimitOrdersResponse): Uint8Array {
    return MsgBatchCreateSpotLimitOrdersResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgBatchCreateSpotLimitOrdersResponse): MsgBatchCreateSpotLimitOrdersResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgBatchCreateSpotLimitOrdersResponse',
      value: MsgBatchCreateSpotLimitOrdersResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgInstantSpotMarketLaunch(): MsgInstantSpotMarketLaunch {
  return {
    sender: '',
    ticker: '',
    baseDenom: '',
    quoteDenom: '',
    minPriceTickSize: '',
    minQuantityTickSize: '',
    minNotional: '',
  };
}
export const MsgInstantSpotMarketLaunch = {
  typeUrl: '/injective.exchange.v1beta1.MsgInstantSpotMarketLaunch',
  encode(message: MsgInstantSpotMarketLaunch, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.ticker !== '') {
      writer.uint32(18).string(message.ticker);
    }
    if (message.baseDenom !== '') {
      writer.uint32(26).string(message.baseDenom);
    }
    if (message.quoteDenom !== '') {
      writer.uint32(34).string(message.quoteDenom);
    }
    if (message.minPriceTickSize !== '') {
      writer.uint32(42).string(Decimal.fromUserInput(message.minPriceTickSize, 18).atomics);
    }
    if (message.minQuantityTickSize !== '') {
      writer.uint32(50).string(Decimal.fromUserInput(message.minQuantityTickSize, 18).atomics);
    }
    if (message.minNotional !== '') {
      writer.uint32(58).string(Decimal.fromUserInput(message.minNotional, 18).atomics);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgInstantSpotMarketLaunch {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgInstantSpotMarketLaunch();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.ticker = reader.string();
          break;
        case 3:
          message.baseDenom = reader.string();
          break;
        case 4:
          message.quoteDenom = reader.string();
          break;
        case 5:
          message.minPriceTickSize = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 6:
          message.minQuantityTickSize = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 7:
          message.minNotional = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgInstantSpotMarketLaunch>): MsgInstantSpotMarketLaunch {
    const message = createBaseMsgInstantSpotMarketLaunch();
    message.sender = object.sender ?? '';
    message.ticker = object.ticker ?? '';
    message.baseDenom = object.baseDenom ?? '';
    message.quoteDenom = object.quoteDenom ?? '';
    message.minPriceTickSize = object.minPriceTickSize ?? '';
    message.minQuantityTickSize = object.minQuantityTickSize ?? '';
    message.minNotional = object.minNotional ?? '';
    return message;
  },
  fromAmino(object: MsgInstantSpotMarketLaunchAmino): MsgInstantSpotMarketLaunch {
    const message = createBaseMsgInstantSpotMarketLaunch();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.ticker !== undefined && object.ticker !== null) {
      message.ticker = object.ticker;
    }
    if (object.base_denom !== undefined && object.base_denom !== null) {
      message.baseDenom = object.base_denom;
    }
    if (object.quote_denom !== undefined && object.quote_denom !== null) {
      message.quoteDenom = object.quote_denom;
    }
    if (object.min_price_tick_size !== undefined && object.min_price_tick_size !== null) {
      message.minPriceTickSize = object.min_price_tick_size;
    }
    if (object.min_quantity_tick_size !== undefined && object.min_quantity_tick_size !== null) {
      message.minQuantityTickSize = object.min_quantity_tick_size;
    }
    if (object.min_notional !== undefined && object.min_notional !== null) {
      message.minNotional = object.min_notional;
    }
    return message;
  },
  toAmino(message: MsgInstantSpotMarketLaunch): MsgInstantSpotMarketLaunchAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.ticker = message.ticker === '' ? undefined : message.ticker;
    obj.base_denom = message.baseDenom === '' ? undefined : message.baseDenom;
    obj.quote_denom = message.quoteDenom === '' ? undefined : message.quoteDenom;
    obj.min_price_tick_size = message.minPriceTickSize === '' ? undefined : message.minPriceTickSize;
    obj.min_quantity_tick_size = message.minQuantityTickSize === '' ? undefined : message.minQuantityTickSize;
    obj.min_notional = message.minNotional === '' ? undefined : message.minNotional;
    return obj;
  },
  fromAminoMsg(object: MsgInstantSpotMarketLaunchAminoMsg): MsgInstantSpotMarketLaunch {
    return MsgInstantSpotMarketLaunch.fromAmino(object.value);
  },
  toAminoMsg(message: MsgInstantSpotMarketLaunch): MsgInstantSpotMarketLaunchAminoMsg {
    return {
      type: 'exchange/MsgInstantSpotMarketLaunch',
      value: MsgInstantSpotMarketLaunch.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgInstantSpotMarketLaunchProtoMsg): MsgInstantSpotMarketLaunch {
    return MsgInstantSpotMarketLaunch.decode(message.value);
  },
  toProto(message: MsgInstantSpotMarketLaunch): Uint8Array {
    return MsgInstantSpotMarketLaunch.encode(message).finish();
  },
  toProtoMsg(message: MsgInstantSpotMarketLaunch): MsgInstantSpotMarketLaunchProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgInstantSpotMarketLaunch',
      value: MsgInstantSpotMarketLaunch.encode(message).finish(),
    };
  },
};
function createBaseMsgInstantSpotMarketLaunchResponse(): MsgInstantSpotMarketLaunchResponse {
  return {};
}
export const MsgInstantSpotMarketLaunchResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgInstantSpotMarketLaunchResponse',
  encode(_: MsgInstantSpotMarketLaunchResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgInstantSpotMarketLaunchResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgInstantSpotMarketLaunchResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgInstantSpotMarketLaunchResponse>): MsgInstantSpotMarketLaunchResponse {
    const message = createBaseMsgInstantSpotMarketLaunchResponse();
    return message;
  },
  fromAmino(_: MsgInstantSpotMarketLaunchResponseAmino): MsgInstantSpotMarketLaunchResponse {
    const message = createBaseMsgInstantSpotMarketLaunchResponse();
    return message;
  },
  toAmino(_: MsgInstantSpotMarketLaunchResponse): MsgInstantSpotMarketLaunchResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgInstantSpotMarketLaunchResponseAminoMsg): MsgInstantSpotMarketLaunchResponse {
    return MsgInstantSpotMarketLaunchResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgInstantSpotMarketLaunchResponseProtoMsg): MsgInstantSpotMarketLaunchResponse {
    return MsgInstantSpotMarketLaunchResponse.decode(message.value);
  },
  toProto(message: MsgInstantSpotMarketLaunchResponse): Uint8Array {
    return MsgInstantSpotMarketLaunchResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgInstantSpotMarketLaunchResponse): MsgInstantSpotMarketLaunchResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgInstantSpotMarketLaunchResponse',
      value: MsgInstantSpotMarketLaunchResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgInstantPerpetualMarketLaunch(): MsgInstantPerpetualMarketLaunch {
  return {
    sender: '',
    ticker: '',
    quoteDenom: '',
    oracleBase: '',
    oracleQuote: '',
    oracleScaleFactor: 0,
    oracleType: 0,
    makerFeeRate: '',
    takerFeeRate: '',
    initialMarginRatio: '',
    maintenanceMarginRatio: '',
    minPriceTickSize: '',
    minQuantityTickSize: '',
    minNotional: '',
  };
}
export const MsgInstantPerpetualMarketLaunch = {
  typeUrl: '/injective.exchange.v1beta1.MsgInstantPerpetualMarketLaunch',
  encode(message: MsgInstantPerpetualMarketLaunch, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.ticker !== '') {
      writer.uint32(18).string(message.ticker);
    }
    if (message.quoteDenom !== '') {
      writer.uint32(26).string(message.quoteDenom);
    }
    if (message.oracleBase !== '') {
      writer.uint32(34).string(message.oracleBase);
    }
    if (message.oracleQuote !== '') {
      writer.uint32(42).string(message.oracleQuote);
    }
    if (message.oracleScaleFactor !== 0) {
      writer.uint32(48).uint32(message.oracleScaleFactor);
    }
    if (message.oracleType !== 0) {
      writer.uint32(56).int32(message.oracleType);
    }
    if (message.makerFeeRate !== '') {
      writer.uint32(66).string(Decimal.fromUserInput(message.makerFeeRate, 18).atomics);
    }
    if (message.takerFeeRate !== '') {
      writer.uint32(74).string(Decimal.fromUserInput(message.takerFeeRate, 18).atomics);
    }
    if (message.initialMarginRatio !== '') {
      writer.uint32(82).string(Decimal.fromUserInput(message.initialMarginRatio, 18).atomics);
    }
    if (message.maintenanceMarginRatio !== '') {
      writer.uint32(90).string(Decimal.fromUserInput(message.maintenanceMarginRatio, 18).atomics);
    }
    if (message.minPriceTickSize !== '') {
      writer.uint32(98).string(Decimal.fromUserInput(message.minPriceTickSize, 18).atomics);
    }
    if (message.minQuantityTickSize !== '') {
      writer.uint32(106).string(Decimal.fromUserInput(message.minQuantityTickSize, 18).atomics);
    }
    if (message.minNotional !== '') {
      writer.uint32(114).string(Decimal.fromUserInput(message.minNotional, 18).atomics);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgInstantPerpetualMarketLaunch {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgInstantPerpetualMarketLaunch();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.ticker = reader.string();
          break;
        case 3:
          message.quoteDenom = reader.string();
          break;
        case 4:
          message.oracleBase = reader.string();
          break;
        case 5:
          message.oracleQuote = reader.string();
          break;
        case 6:
          message.oracleScaleFactor = reader.uint32();
          break;
        case 7:
          message.oracleType = reader.int32() as any;
          break;
        case 8:
          message.makerFeeRate = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 9:
          message.takerFeeRate = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 10:
          message.initialMarginRatio = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 11:
          message.maintenanceMarginRatio = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 12:
          message.minPriceTickSize = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 13:
          message.minQuantityTickSize = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 14:
          message.minNotional = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgInstantPerpetualMarketLaunch>): MsgInstantPerpetualMarketLaunch {
    const message = createBaseMsgInstantPerpetualMarketLaunch();
    message.sender = object.sender ?? '';
    message.ticker = object.ticker ?? '';
    message.quoteDenom = object.quoteDenom ?? '';
    message.oracleBase = object.oracleBase ?? '';
    message.oracleQuote = object.oracleQuote ?? '';
    message.oracleScaleFactor = object.oracleScaleFactor ?? 0;
    message.oracleType = object.oracleType ?? 0;
    message.makerFeeRate = object.makerFeeRate ?? '';
    message.takerFeeRate = object.takerFeeRate ?? '';
    message.initialMarginRatio = object.initialMarginRatio ?? '';
    message.maintenanceMarginRatio = object.maintenanceMarginRatio ?? '';
    message.minPriceTickSize = object.minPriceTickSize ?? '';
    message.minQuantityTickSize = object.minQuantityTickSize ?? '';
    message.minNotional = object.minNotional ?? '';
    return message;
  },
  fromAmino(object: MsgInstantPerpetualMarketLaunchAmino): MsgInstantPerpetualMarketLaunch {
    const message = createBaseMsgInstantPerpetualMarketLaunch();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.ticker !== undefined && object.ticker !== null) {
      message.ticker = object.ticker;
    }
    if (object.quote_denom !== undefined && object.quote_denom !== null) {
      message.quoteDenom = object.quote_denom;
    }
    if (object.oracle_base !== undefined && object.oracle_base !== null) {
      message.oracleBase = object.oracle_base;
    }
    if (object.oracle_quote !== undefined && object.oracle_quote !== null) {
      message.oracleQuote = object.oracle_quote;
    }
    if (object.oracle_scale_factor !== undefined && object.oracle_scale_factor !== null) {
      message.oracleScaleFactor = object.oracle_scale_factor;
    }
    if (object.oracle_type !== undefined && object.oracle_type !== null) {
      message.oracleType = object.oracle_type;
    }
    if (object.maker_fee_rate !== undefined && object.maker_fee_rate !== null) {
      message.makerFeeRate = object.maker_fee_rate;
    }
    if (object.taker_fee_rate !== undefined && object.taker_fee_rate !== null) {
      message.takerFeeRate = object.taker_fee_rate;
    }
    if (object.initial_margin_ratio !== undefined && object.initial_margin_ratio !== null) {
      message.initialMarginRatio = object.initial_margin_ratio;
    }
    if (object.maintenance_margin_ratio !== undefined && object.maintenance_margin_ratio !== null) {
      message.maintenanceMarginRatio = object.maintenance_margin_ratio;
    }
    if (object.min_price_tick_size !== undefined && object.min_price_tick_size !== null) {
      message.minPriceTickSize = object.min_price_tick_size;
    }
    if (object.min_quantity_tick_size !== undefined && object.min_quantity_tick_size !== null) {
      message.minQuantityTickSize = object.min_quantity_tick_size;
    }
    if (object.min_notional !== undefined && object.min_notional !== null) {
      message.minNotional = object.min_notional;
    }
    return message;
  },
  toAmino(message: MsgInstantPerpetualMarketLaunch): MsgInstantPerpetualMarketLaunchAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.ticker = message.ticker === '' ? undefined : message.ticker;
    obj.quote_denom = message.quoteDenom === '' ? undefined : message.quoteDenom;
    obj.oracle_base = message.oracleBase === '' ? undefined : message.oracleBase;
    obj.oracle_quote = message.oracleQuote === '' ? undefined : message.oracleQuote;
    obj.oracle_scale_factor = message.oracleScaleFactor === 0 ? undefined : message.oracleScaleFactor;
    obj.oracle_type = message.oracleType === 0 ? undefined : message.oracleType;
    obj.maker_fee_rate = message.makerFeeRate === '' ? undefined : message.makerFeeRate;
    obj.taker_fee_rate = message.takerFeeRate === '' ? undefined : message.takerFeeRate;
    obj.initial_margin_ratio = message.initialMarginRatio === '' ? undefined : message.initialMarginRatio;
    obj.maintenance_margin_ratio = message.maintenanceMarginRatio === '' ? undefined : message.maintenanceMarginRatio;
    obj.min_price_tick_size = message.minPriceTickSize === '' ? undefined : message.minPriceTickSize;
    obj.min_quantity_tick_size = message.minQuantityTickSize === '' ? undefined : message.minQuantityTickSize;
    obj.min_notional = message.minNotional === '' ? undefined : message.minNotional;
    return obj;
  },
  fromAminoMsg(object: MsgInstantPerpetualMarketLaunchAminoMsg): MsgInstantPerpetualMarketLaunch {
    return MsgInstantPerpetualMarketLaunch.fromAmino(object.value);
  },
  toAminoMsg(message: MsgInstantPerpetualMarketLaunch): MsgInstantPerpetualMarketLaunchAminoMsg {
    return {
      type: 'exchange/MsgInstantPerpetualMarketLaunch',
      value: MsgInstantPerpetualMarketLaunch.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgInstantPerpetualMarketLaunchProtoMsg): MsgInstantPerpetualMarketLaunch {
    return MsgInstantPerpetualMarketLaunch.decode(message.value);
  },
  toProto(message: MsgInstantPerpetualMarketLaunch): Uint8Array {
    return MsgInstantPerpetualMarketLaunch.encode(message).finish();
  },
  toProtoMsg(message: MsgInstantPerpetualMarketLaunch): MsgInstantPerpetualMarketLaunchProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgInstantPerpetualMarketLaunch',
      value: MsgInstantPerpetualMarketLaunch.encode(message).finish(),
    };
  },
};
function createBaseMsgInstantPerpetualMarketLaunchResponse(): MsgInstantPerpetualMarketLaunchResponse {
  return {};
}
export const MsgInstantPerpetualMarketLaunchResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgInstantPerpetualMarketLaunchResponse',
  encode(_: MsgInstantPerpetualMarketLaunchResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgInstantPerpetualMarketLaunchResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgInstantPerpetualMarketLaunchResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgInstantPerpetualMarketLaunchResponse>): MsgInstantPerpetualMarketLaunchResponse {
    const message = createBaseMsgInstantPerpetualMarketLaunchResponse();
    return message;
  },
  fromAmino(_: MsgInstantPerpetualMarketLaunchResponseAmino): MsgInstantPerpetualMarketLaunchResponse {
    const message = createBaseMsgInstantPerpetualMarketLaunchResponse();
    return message;
  },
  toAmino(_: MsgInstantPerpetualMarketLaunchResponse): MsgInstantPerpetualMarketLaunchResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgInstantPerpetualMarketLaunchResponseAminoMsg): MsgInstantPerpetualMarketLaunchResponse {
    return MsgInstantPerpetualMarketLaunchResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgInstantPerpetualMarketLaunchResponseProtoMsg): MsgInstantPerpetualMarketLaunchResponse {
    return MsgInstantPerpetualMarketLaunchResponse.decode(message.value);
  },
  toProto(message: MsgInstantPerpetualMarketLaunchResponse): Uint8Array {
    return MsgInstantPerpetualMarketLaunchResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgInstantPerpetualMarketLaunchResponse): MsgInstantPerpetualMarketLaunchResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgInstantPerpetualMarketLaunchResponse',
      value: MsgInstantPerpetualMarketLaunchResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgInstantBinaryOptionsMarketLaunch(): MsgInstantBinaryOptionsMarketLaunch {
  return {
    sender: '',
    ticker: '',
    oracleSymbol: '',
    oracleProvider: '',
    oracleType: 0,
    oracleScaleFactor: 0,
    makerFeeRate: '',
    takerFeeRate: '',
    expirationTimestamp: BigInt(0),
    settlementTimestamp: BigInt(0),
    admin: '',
    quoteDenom: '',
    minPriceTickSize: '',
    minQuantityTickSize: '',
    minNotional: '',
  };
}
export const MsgInstantBinaryOptionsMarketLaunch = {
  typeUrl: '/injective.exchange.v1beta1.MsgInstantBinaryOptionsMarketLaunch',
  encode(message: MsgInstantBinaryOptionsMarketLaunch, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.ticker !== '') {
      writer.uint32(18).string(message.ticker);
    }
    if (message.oracleSymbol !== '') {
      writer.uint32(26).string(message.oracleSymbol);
    }
    if (message.oracleProvider !== '') {
      writer.uint32(34).string(message.oracleProvider);
    }
    if (message.oracleType !== 0) {
      writer.uint32(40).int32(message.oracleType);
    }
    if (message.oracleScaleFactor !== 0) {
      writer.uint32(48).uint32(message.oracleScaleFactor);
    }
    if (message.makerFeeRate !== '') {
      writer.uint32(58).string(Decimal.fromUserInput(message.makerFeeRate, 18).atomics);
    }
    if (message.takerFeeRate !== '') {
      writer.uint32(66).string(Decimal.fromUserInput(message.takerFeeRate, 18).atomics);
    }
    if (message.expirationTimestamp !== BigInt(0)) {
      writer.uint32(72).int64(message.expirationTimestamp);
    }
    if (message.settlementTimestamp !== BigInt(0)) {
      writer.uint32(80).int64(message.settlementTimestamp);
    }
    if (message.admin !== '') {
      writer.uint32(90).string(message.admin);
    }
    if (message.quoteDenom !== '') {
      writer.uint32(98).string(message.quoteDenom);
    }
    if (message.minPriceTickSize !== '') {
      writer.uint32(106).string(Decimal.fromUserInput(message.minPriceTickSize, 18).atomics);
    }
    if (message.minQuantityTickSize !== '') {
      writer.uint32(114).string(Decimal.fromUserInput(message.minQuantityTickSize, 18).atomics);
    }
    if (message.minNotional !== '') {
      writer.uint32(122).string(Decimal.fromUserInput(message.minNotional, 18).atomics);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgInstantBinaryOptionsMarketLaunch {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgInstantBinaryOptionsMarketLaunch();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.ticker = reader.string();
          break;
        case 3:
          message.oracleSymbol = reader.string();
          break;
        case 4:
          message.oracleProvider = reader.string();
          break;
        case 5:
          message.oracleType = reader.int32() as any;
          break;
        case 6:
          message.oracleScaleFactor = reader.uint32();
          break;
        case 7:
          message.makerFeeRate = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 8:
          message.takerFeeRate = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 9:
          message.expirationTimestamp = reader.int64();
          break;
        case 10:
          message.settlementTimestamp = reader.int64();
          break;
        case 11:
          message.admin = reader.string();
          break;
        case 12:
          message.quoteDenom = reader.string();
          break;
        case 13:
          message.minPriceTickSize = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 14:
          message.minQuantityTickSize = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 15:
          message.minNotional = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgInstantBinaryOptionsMarketLaunch>): MsgInstantBinaryOptionsMarketLaunch {
    const message = createBaseMsgInstantBinaryOptionsMarketLaunch();
    message.sender = object.sender ?? '';
    message.ticker = object.ticker ?? '';
    message.oracleSymbol = object.oracleSymbol ?? '';
    message.oracleProvider = object.oracleProvider ?? '';
    message.oracleType = object.oracleType ?? 0;
    message.oracleScaleFactor = object.oracleScaleFactor ?? 0;
    message.makerFeeRate = object.makerFeeRate ?? '';
    message.takerFeeRate = object.takerFeeRate ?? '';
    message.expirationTimestamp =
      object.expirationTimestamp !== undefined && object.expirationTimestamp !== null
        ? BigInt(object.expirationTimestamp.toString())
        : BigInt(0);
    message.settlementTimestamp =
      object.settlementTimestamp !== undefined && object.settlementTimestamp !== null
        ? BigInt(object.settlementTimestamp.toString())
        : BigInt(0);
    message.admin = object.admin ?? '';
    message.quoteDenom = object.quoteDenom ?? '';
    message.minPriceTickSize = object.minPriceTickSize ?? '';
    message.minQuantityTickSize = object.minQuantityTickSize ?? '';
    message.minNotional = object.minNotional ?? '';
    return message;
  },
  fromAmino(object: MsgInstantBinaryOptionsMarketLaunchAmino): MsgInstantBinaryOptionsMarketLaunch {
    const message = createBaseMsgInstantBinaryOptionsMarketLaunch();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.ticker !== undefined && object.ticker !== null) {
      message.ticker = object.ticker;
    }
    if (object.oracle_symbol !== undefined && object.oracle_symbol !== null) {
      message.oracleSymbol = object.oracle_symbol;
    }
    if (object.oracle_provider !== undefined && object.oracle_provider !== null) {
      message.oracleProvider = object.oracle_provider;
    }
    if (object.oracle_type !== undefined && object.oracle_type !== null) {
      message.oracleType = object.oracle_type;
    }
    if (object.oracle_scale_factor !== undefined && object.oracle_scale_factor !== null) {
      message.oracleScaleFactor = object.oracle_scale_factor;
    }
    if (object.maker_fee_rate !== undefined && object.maker_fee_rate !== null) {
      message.makerFeeRate = object.maker_fee_rate;
    }
    if (object.taker_fee_rate !== undefined && object.taker_fee_rate !== null) {
      message.takerFeeRate = object.taker_fee_rate;
    }
    if (object.expiration_timestamp !== undefined && object.expiration_timestamp !== null) {
      message.expirationTimestamp = BigInt(object.expiration_timestamp);
    }
    if (object.settlement_timestamp !== undefined && object.settlement_timestamp !== null) {
      message.settlementTimestamp = BigInt(object.settlement_timestamp);
    }
    if (object.admin !== undefined && object.admin !== null) {
      message.admin = object.admin;
    }
    if (object.quote_denom !== undefined && object.quote_denom !== null) {
      message.quoteDenom = object.quote_denom;
    }
    if (object.min_price_tick_size !== undefined && object.min_price_tick_size !== null) {
      message.minPriceTickSize = object.min_price_tick_size;
    }
    if (object.min_quantity_tick_size !== undefined && object.min_quantity_tick_size !== null) {
      message.minQuantityTickSize = object.min_quantity_tick_size;
    }
    if (object.min_notional !== undefined && object.min_notional !== null) {
      message.minNotional = object.min_notional;
    }
    return message;
  },
  toAmino(message: MsgInstantBinaryOptionsMarketLaunch): MsgInstantBinaryOptionsMarketLaunchAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.ticker = message.ticker === '' ? undefined : message.ticker;
    obj.oracle_symbol = message.oracleSymbol === '' ? undefined : message.oracleSymbol;
    obj.oracle_provider = message.oracleProvider === '' ? undefined : message.oracleProvider;
    obj.oracle_type = message.oracleType === 0 ? undefined : message.oracleType;
    obj.oracle_scale_factor = message.oracleScaleFactor === 0 ? undefined : message.oracleScaleFactor;
    obj.maker_fee_rate = message.makerFeeRate === '' ? undefined : message.makerFeeRate;
    obj.taker_fee_rate = message.takerFeeRate === '' ? undefined : message.takerFeeRate;
    obj.expiration_timestamp =
      message.expirationTimestamp !== BigInt(0) ? (message.expirationTimestamp?.toString)() : undefined;
    obj.settlement_timestamp =
      message.settlementTimestamp !== BigInt(0) ? (message.settlementTimestamp?.toString)() : undefined;
    obj.admin = message.admin === '' ? undefined : message.admin;
    obj.quote_denom = message.quoteDenom === '' ? undefined : message.quoteDenom;
    obj.min_price_tick_size = message.minPriceTickSize === '' ? undefined : message.minPriceTickSize;
    obj.min_quantity_tick_size = message.minQuantityTickSize === '' ? undefined : message.minQuantityTickSize;
    obj.min_notional = message.minNotional === '' ? undefined : message.minNotional;
    return obj;
  },
  fromAminoMsg(object: MsgInstantBinaryOptionsMarketLaunchAminoMsg): MsgInstantBinaryOptionsMarketLaunch {
    return MsgInstantBinaryOptionsMarketLaunch.fromAmino(object.value);
  },
  toAminoMsg(message: MsgInstantBinaryOptionsMarketLaunch): MsgInstantBinaryOptionsMarketLaunchAminoMsg {
    return {
      type: 'exchange/MsgInstantBinaryOptionsMarketLaunch',
      value: MsgInstantBinaryOptionsMarketLaunch.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgInstantBinaryOptionsMarketLaunchProtoMsg): MsgInstantBinaryOptionsMarketLaunch {
    return MsgInstantBinaryOptionsMarketLaunch.decode(message.value);
  },
  toProto(message: MsgInstantBinaryOptionsMarketLaunch): Uint8Array {
    return MsgInstantBinaryOptionsMarketLaunch.encode(message).finish();
  },
  toProtoMsg(message: MsgInstantBinaryOptionsMarketLaunch): MsgInstantBinaryOptionsMarketLaunchProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgInstantBinaryOptionsMarketLaunch',
      value: MsgInstantBinaryOptionsMarketLaunch.encode(message).finish(),
    };
  },
};
function createBaseMsgInstantBinaryOptionsMarketLaunchResponse(): MsgInstantBinaryOptionsMarketLaunchResponse {
  return {};
}
export const MsgInstantBinaryOptionsMarketLaunchResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgInstantBinaryOptionsMarketLaunchResponse',
  encode(_: MsgInstantBinaryOptionsMarketLaunchResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgInstantBinaryOptionsMarketLaunchResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgInstantBinaryOptionsMarketLaunchResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgInstantBinaryOptionsMarketLaunchResponse>): MsgInstantBinaryOptionsMarketLaunchResponse {
    const message = createBaseMsgInstantBinaryOptionsMarketLaunchResponse();
    return message;
  },
  fromAmino(_: MsgInstantBinaryOptionsMarketLaunchResponseAmino): MsgInstantBinaryOptionsMarketLaunchResponse {
    const message = createBaseMsgInstantBinaryOptionsMarketLaunchResponse();
    return message;
  },
  toAmino(_: MsgInstantBinaryOptionsMarketLaunchResponse): MsgInstantBinaryOptionsMarketLaunchResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: MsgInstantBinaryOptionsMarketLaunchResponseAminoMsg,
  ): MsgInstantBinaryOptionsMarketLaunchResponse {
    return MsgInstantBinaryOptionsMarketLaunchResponse.fromAmino(object.value);
  },
  fromProtoMsg(
    message: MsgInstantBinaryOptionsMarketLaunchResponseProtoMsg,
  ): MsgInstantBinaryOptionsMarketLaunchResponse {
    return MsgInstantBinaryOptionsMarketLaunchResponse.decode(message.value);
  },
  toProto(message: MsgInstantBinaryOptionsMarketLaunchResponse): Uint8Array {
    return MsgInstantBinaryOptionsMarketLaunchResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgInstantBinaryOptionsMarketLaunchResponse,
  ): MsgInstantBinaryOptionsMarketLaunchResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgInstantBinaryOptionsMarketLaunchResponse',
      value: MsgInstantBinaryOptionsMarketLaunchResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgInstantExpiryFuturesMarketLaunch(): MsgInstantExpiryFuturesMarketLaunch {
  return {
    sender: '',
    ticker: '',
    quoteDenom: '',
    oracleBase: '',
    oracleQuote: '',
    oracleType: 0,
    oracleScaleFactor: 0,
    expiry: BigInt(0),
    makerFeeRate: '',
    takerFeeRate: '',
    initialMarginRatio: '',
    maintenanceMarginRatio: '',
    minPriceTickSize: '',
    minQuantityTickSize: '',
    minNotional: '',
  };
}
export const MsgInstantExpiryFuturesMarketLaunch = {
  typeUrl: '/injective.exchange.v1beta1.MsgInstantExpiryFuturesMarketLaunch',
  encode(message: MsgInstantExpiryFuturesMarketLaunch, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.ticker !== '') {
      writer.uint32(18).string(message.ticker);
    }
    if (message.quoteDenom !== '') {
      writer.uint32(26).string(message.quoteDenom);
    }
    if (message.oracleBase !== '') {
      writer.uint32(34).string(message.oracleBase);
    }
    if (message.oracleQuote !== '') {
      writer.uint32(42).string(message.oracleQuote);
    }
    if (message.oracleType !== 0) {
      writer.uint32(48).int32(message.oracleType);
    }
    if (message.oracleScaleFactor !== 0) {
      writer.uint32(56).uint32(message.oracleScaleFactor);
    }
    if (message.expiry !== BigInt(0)) {
      writer.uint32(64).int64(message.expiry);
    }
    if (message.makerFeeRate !== '') {
      writer.uint32(74).string(Decimal.fromUserInput(message.makerFeeRate, 18).atomics);
    }
    if (message.takerFeeRate !== '') {
      writer.uint32(82).string(Decimal.fromUserInput(message.takerFeeRate, 18).atomics);
    }
    if (message.initialMarginRatio !== '') {
      writer.uint32(90).string(Decimal.fromUserInput(message.initialMarginRatio, 18).atomics);
    }
    if (message.maintenanceMarginRatio !== '') {
      writer.uint32(98).string(Decimal.fromUserInput(message.maintenanceMarginRatio, 18).atomics);
    }
    if (message.minPriceTickSize !== '') {
      writer.uint32(106).string(Decimal.fromUserInput(message.minPriceTickSize, 18).atomics);
    }
    if (message.minQuantityTickSize !== '') {
      writer.uint32(114).string(Decimal.fromUserInput(message.minQuantityTickSize, 18).atomics);
    }
    if (message.minNotional !== '') {
      writer.uint32(122).string(Decimal.fromUserInput(message.minNotional, 18).atomics);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgInstantExpiryFuturesMarketLaunch {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgInstantExpiryFuturesMarketLaunch();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.ticker = reader.string();
          break;
        case 3:
          message.quoteDenom = reader.string();
          break;
        case 4:
          message.oracleBase = reader.string();
          break;
        case 5:
          message.oracleQuote = reader.string();
          break;
        case 6:
          message.oracleType = reader.int32() as any;
          break;
        case 7:
          message.oracleScaleFactor = reader.uint32();
          break;
        case 8:
          message.expiry = reader.int64();
          break;
        case 9:
          message.makerFeeRate = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 10:
          message.takerFeeRate = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 11:
          message.initialMarginRatio = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 12:
          message.maintenanceMarginRatio = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 13:
          message.minPriceTickSize = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 14:
          message.minQuantityTickSize = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 15:
          message.minNotional = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgInstantExpiryFuturesMarketLaunch>): MsgInstantExpiryFuturesMarketLaunch {
    const message = createBaseMsgInstantExpiryFuturesMarketLaunch();
    message.sender = object.sender ?? '';
    message.ticker = object.ticker ?? '';
    message.quoteDenom = object.quoteDenom ?? '';
    message.oracleBase = object.oracleBase ?? '';
    message.oracleQuote = object.oracleQuote ?? '';
    message.oracleType = object.oracleType ?? 0;
    message.oracleScaleFactor = object.oracleScaleFactor ?? 0;
    message.expiry =
      object.expiry !== undefined && object.expiry !== null ? BigInt(object.expiry.toString()) : BigInt(0);
    message.makerFeeRate = object.makerFeeRate ?? '';
    message.takerFeeRate = object.takerFeeRate ?? '';
    message.initialMarginRatio = object.initialMarginRatio ?? '';
    message.maintenanceMarginRatio = object.maintenanceMarginRatio ?? '';
    message.minPriceTickSize = object.minPriceTickSize ?? '';
    message.minQuantityTickSize = object.minQuantityTickSize ?? '';
    message.minNotional = object.minNotional ?? '';
    return message;
  },
  fromAmino(object: MsgInstantExpiryFuturesMarketLaunchAmino): MsgInstantExpiryFuturesMarketLaunch {
    const message = createBaseMsgInstantExpiryFuturesMarketLaunch();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.ticker !== undefined && object.ticker !== null) {
      message.ticker = object.ticker;
    }
    if (object.quote_denom !== undefined && object.quote_denom !== null) {
      message.quoteDenom = object.quote_denom;
    }
    if (object.oracle_base !== undefined && object.oracle_base !== null) {
      message.oracleBase = object.oracle_base;
    }
    if (object.oracle_quote !== undefined && object.oracle_quote !== null) {
      message.oracleQuote = object.oracle_quote;
    }
    if (object.oracle_type !== undefined && object.oracle_type !== null) {
      message.oracleType = object.oracle_type;
    }
    if (object.oracle_scale_factor !== undefined && object.oracle_scale_factor !== null) {
      message.oracleScaleFactor = object.oracle_scale_factor;
    }
    if (object.expiry !== undefined && object.expiry !== null) {
      message.expiry = BigInt(object.expiry);
    }
    if (object.maker_fee_rate !== undefined && object.maker_fee_rate !== null) {
      message.makerFeeRate = object.maker_fee_rate;
    }
    if (object.taker_fee_rate !== undefined && object.taker_fee_rate !== null) {
      message.takerFeeRate = object.taker_fee_rate;
    }
    if (object.initial_margin_ratio !== undefined && object.initial_margin_ratio !== null) {
      message.initialMarginRatio = object.initial_margin_ratio;
    }
    if (object.maintenance_margin_ratio !== undefined && object.maintenance_margin_ratio !== null) {
      message.maintenanceMarginRatio = object.maintenance_margin_ratio;
    }
    if (object.min_price_tick_size !== undefined && object.min_price_tick_size !== null) {
      message.minPriceTickSize = object.min_price_tick_size;
    }
    if (object.min_quantity_tick_size !== undefined && object.min_quantity_tick_size !== null) {
      message.minQuantityTickSize = object.min_quantity_tick_size;
    }
    if (object.min_notional !== undefined && object.min_notional !== null) {
      message.minNotional = object.min_notional;
    }
    return message;
  },
  toAmino(message: MsgInstantExpiryFuturesMarketLaunch): MsgInstantExpiryFuturesMarketLaunchAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.ticker = message.ticker === '' ? undefined : message.ticker;
    obj.quote_denom = message.quoteDenom === '' ? undefined : message.quoteDenom;
    obj.oracle_base = message.oracleBase === '' ? undefined : message.oracleBase;
    obj.oracle_quote = message.oracleQuote === '' ? undefined : message.oracleQuote;
    obj.oracle_type = message.oracleType === 0 ? undefined : message.oracleType;
    obj.oracle_scale_factor = message.oracleScaleFactor === 0 ? undefined : message.oracleScaleFactor;
    obj.expiry = message.expiry !== BigInt(0) ? (message.expiry?.toString)() : undefined;
    obj.maker_fee_rate = message.makerFeeRate === '' ? undefined : message.makerFeeRate;
    obj.taker_fee_rate = message.takerFeeRate === '' ? undefined : message.takerFeeRate;
    obj.initial_margin_ratio = message.initialMarginRatio === '' ? undefined : message.initialMarginRatio;
    obj.maintenance_margin_ratio = message.maintenanceMarginRatio === '' ? undefined : message.maintenanceMarginRatio;
    obj.min_price_tick_size = message.minPriceTickSize === '' ? undefined : message.minPriceTickSize;
    obj.min_quantity_tick_size = message.minQuantityTickSize === '' ? undefined : message.minQuantityTickSize;
    obj.min_notional = message.minNotional === '' ? undefined : message.minNotional;
    return obj;
  },
  fromAminoMsg(object: MsgInstantExpiryFuturesMarketLaunchAminoMsg): MsgInstantExpiryFuturesMarketLaunch {
    return MsgInstantExpiryFuturesMarketLaunch.fromAmino(object.value);
  },
  toAminoMsg(message: MsgInstantExpiryFuturesMarketLaunch): MsgInstantExpiryFuturesMarketLaunchAminoMsg {
    return {
      type: 'exchange/MsgInstantExpiryFuturesMarketLaunch',
      value: MsgInstantExpiryFuturesMarketLaunch.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgInstantExpiryFuturesMarketLaunchProtoMsg): MsgInstantExpiryFuturesMarketLaunch {
    return MsgInstantExpiryFuturesMarketLaunch.decode(message.value);
  },
  toProto(message: MsgInstantExpiryFuturesMarketLaunch): Uint8Array {
    return MsgInstantExpiryFuturesMarketLaunch.encode(message).finish();
  },
  toProtoMsg(message: MsgInstantExpiryFuturesMarketLaunch): MsgInstantExpiryFuturesMarketLaunchProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgInstantExpiryFuturesMarketLaunch',
      value: MsgInstantExpiryFuturesMarketLaunch.encode(message).finish(),
    };
  },
};
function createBaseMsgInstantExpiryFuturesMarketLaunchResponse(): MsgInstantExpiryFuturesMarketLaunchResponse {
  return {};
}
export const MsgInstantExpiryFuturesMarketLaunchResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgInstantExpiryFuturesMarketLaunchResponse',
  encode(_: MsgInstantExpiryFuturesMarketLaunchResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgInstantExpiryFuturesMarketLaunchResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgInstantExpiryFuturesMarketLaunchResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgInstantExpiryFuturesMarketLaunchResponse>): MsgInstantExpiryFuturesMarketLaunchResponse {
    const message = createBaseMsgInstantExpiryFuturesMarketLaunchResponse();
    return message;
  },
  fromAmino(_: MsgInstantExpiryFuturesMarketLaunchResponseAmino): MsgInstantExpiryFuturesMarketLaunchResponse {
    const message = createBaseMsgInstantExpiryFuturesMarketLaunchResponse();
    return message;
  },
  toAmino(_: MsgInstantExpiryFuturesMarketLaunchResponse): MsgInstantExpiryFuturesMarketLaunchResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: MsgInstantExpiryFuturesMarketLaunchResponseAminoMsg,
  ): MsgInstantExpiryFuturesMarketLaunchResponse {
    return MsgInstantExpiryFuturesMarketLaunchResponse.fromAmino(object.value);
  },
  fromProtoMsg(
    message: MsgInstantExpiryFuturesMarketLaunchResponseProtoMsg,
  ): MsgInstantExpiryFuturesMarketLaunchResponse {
    return MsgInstantExpiryFuturesMarketLaunchResponse.decode(message.value);
  },
  toProto(message: MsgInstantExpiryFuturesMarketLaunchResponse): Uint8Array {
    return MsgInstantExpiryFuturesMarketLaunchResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgInstantExpiryFuturesMarketLaunchResponse,
  ): MsgInstantExpiryFuturesMarketLaunchResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgInstantExpiryFuturesMarketLaunchResponse',
      value: MsgInstantExpiryFuturesMarketLaunchResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateSpotMarketOrder(): MsgCreateSpotMarketOrder {
  return {
    sender: '',
    order: SpotOrder.fromPartial({}),
  };
}
export const MsgCreateSpotMarketOrder = {
  typeUrl: '/injective.exchange.v1beta1.MsgCreateSpotMarketOrder',
  encode(message: MsgCreateSpotMarketOrder, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.order !== undefined) {
      SpotOrder.encode(message.order, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateSpotMarketOrder {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateSpotMarketOrder();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.order = SpotOrder.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCreateSpotMarketOrder>): MsgCreateSpotMarketOrder {
    const message = createBaseMsgCreateSpotMarketOrder();
    message.sender = object.sender ?? '';
    message.order =
      object.order !== undefined && object.order !== null ? SpotOrder.fromPartial(object.order) : undefined;
    return message;
  },
  fromAmino(object: MsgCreateSpotMarketOrderAmino): MsgCreateSpotMarketOrder {
    const message = createBaseMsgCreateSpotMarketOrder();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.order !== undefined && object.order !== null) {
      message.order = SpotOrder.fromAmino(object.order);
    }
    return message;
  },
  toAmino(message: MsgCreateSpotMarketOrder): MsgCreateSpotMarketOrderAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.order = message.order ? SpotOrder.toAmino(message.order) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgCreateSpotMarketOrderAminoMsg): MsgCreateSpotMarketOrder {
    return MsgCreateSpotMarketOrder.fromAmino(object.value);
  },
  toAminoMsg(message: MsgCreateSpotMarketOrder): MsgCreateSpotMarketOrderAminoMsg {
    return {
      type: 'exchange/MsgCreateSpotMarketOrder',
      value: MsgCreateSpotMarketOrder.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgCreateSpotMarketOrderProtoMsg): MsgCreateSpotMarketOrder {
    return MsgCreateSpotMarketOrder.decode(message.value);
  },
  toProto(message: MsgCreateSpotMarketOrder): Uint8Array {
    return MsgCreateSpotMarketOrder.encode(message).finish();
  },
  toProtoMsg(message: MsgCreateSpotMarketOrder): MsgCreateSpotMarketOrderProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgCreateSpotMarketOrder',
      value: MsgCreateSpotMarketOrder.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateSpotMarketOrderResponse(): MsgCreateSpotMarketOrderResponse {
  return {
    orderHash: '',
    results: undefined,
    cid: '',
  };
}
export const MsgCreateSpotMarketOrderResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgCreateSpotMarketOrderResponse',
  encode(message: MsgCreateSpotMarketOrderResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.orderHash !== '') {
      writer.uint32(10).string(message.orderHash);
    }
    if (message.results !== undefined) {
      SpotMarketOrderResults.encode(message.results, writer.uint32(18).fork()).ldelim();
    }
    if (message.cid !== '') {
      writer.uint32(26).string(message.cid);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateSpotMarketOrderResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateSpotMarketOrderResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.orderHash = reader.string();
          break;
        case 2:
          message.results = SpotMarketOrderResults.decode(reader, reader.uint32());
          break;
        case 3:
          message.cid = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCreateSpotMarketOrderResponse>): MsgCreateSpotMarketOrderResponse {
    const message = createBaseMsgCreateSpotMarketOrderResponse();
    message.orderHash = object.orderHash ?? '';
    message.results =
      object.results !== undefined && object.results !== null
        ? SpotMarketOrderResults.fromPartial(object.results)
        : undefined;
    message.cid = object.cid ?? '';
    return message;
  },
  fromAmino(object: MsgCreateSpotMarketOrderResponseAmino): MsgCreateSpotMarketOrderResponse {
    const message = createBaseMsgCreateSpotMarketOrderResponse();
    if (object.order_hash !== undefined && object.order_hash !== null) {
      message.orderHash = object.order_hash;
    }
    if (object.results !== undefined && object.results !== null) {
      message.results = SpotMarketOrderResults.fromAmino(object.results);
    }
    if (object.cid !== undefined && object.cid !== null) {
      message.cid = object.cid;
    }
    return message;
  },
  toAmino(message: MsgCreateSpotMarketOrderResponse): MsgCreateSpotMarketOrderResponseAmino {
    const obj: any = {};
    obj.order_hash = message.orderHash === '' ? undefined : message.orderHash;
    obj.results = message.results ? SpotMarketOrderResults.toAmino(message.results) : undefined;
    obj.cid = message.cid === '' ? undefined : message.cid;
    return obj;
  },
  fromAminoMsg(object: MsgCreateSpotMarketOrderResponseAminoMsg): MsgCreateSpotMarketOrderResponse {
    return MsgCreateSpotMarketOrderResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgCreateSpotMarketOrderResponseProtoMsg): MsgCreateSpotMarketOrderResponse {
    return MsgCreateSpotMarketOrderResponse.decode(message.value);
  },
  toProto(message: MsgCreateSpotMarketOrderResponse): Uint8Array {
    return MsgCreateSpotMarketOrderResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgCreateSpotMarketOrderResponse): MsgCreateSpotMarketOrderResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgCreateSpotMarketOrderResponse',
      value: MsgCreateSpotMarketOrderResponse.encode(message).finish(),
    };
  },
};
function createBaseSpotMarketOrderResults(): SpotMarketOrderResults {
  return {
    quantity: '',
    price: '',
    fee: '',
  };
}
export const SpotMarketOrderResults = {
  typeUrl: '/injective.exchange.v1beta1.SpotMarketOrderResults',
  encode(message: SpotMarketOrderResults, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.quantity !== '') {
      writer.uint32(10).string(Decimal.fromUserInput(message.quantity, 18).atomics);
    }
    if (message.price !== '') {
      writer.uint32(18).string(Decimal.fromUserInput(message.price, 18).atomics);
    }
    if (message.fee !== '') {
      writer.uint32(26).string(Decimal.fromUserInput(message.fee, 18).atomics);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): SpotMarketOrderResults {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSpotMarketOrderResults();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.quantity = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 2:
          message.price = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 3:
          message.fee = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<SpotMarketOrderResults>): SpotMarketOrderResults {
    const message = createBaseSpotMarketOrderResults();
    message.quantity = object.quantity ?? '';
    message.price = object.price ?? '';
    message.fee = object.fee ?? '';
    return message;
  },
  fromAmino(object: SpotMarketOrderResultsAmino): SpotMarketOrderResults {
    const message = createBaseSpotMarketOrderResults();
    if (object.quantity !== undefined && object.quantity !== null) {
      message.quantity = object.quantity;
    }
    if (object.price !== undefined && object.price !== null) {
      message.price = object.price;
    }
    if (object.fee !== undefined && object.fee !== null) {
      message.fee = object.fee;
    }
    return message;
  },
  toAmino(message: SpotMarketOrderResults): SpotMarketOrderResultsAmino {
    const obj: any = {};
    obj.quantity = message.quantity === '' ? undefined : message.quantity;
    obj.price = message.price === '' ? undefined : message.price;
    obj.fee = message.fee === '' ? undefined : message.fee;
    return obj;
  },
  fromAminoMsg(object: SpotMarketOrderResultsAminoMsg): SpotMarketOrderResults {
    return SpotMarketOrderResults.fromAmino(object.value);
  },
  fromProtoMsg(message: SpotMarketOrderResultsProtoMsg): SpotMarketOrderResults {
    return SpotMarketOrderResults.decode(message.value);
  },
  toProto(message: SpotMarketOrderResults): Uint8Array {
    return SpotMarketOrderResults.encode(message).finish();
  },
  toProtoMsg(message: SpotMarketOrderResults): SpotMarketOrderResultsProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.SpotMarketOrderResults',
      value: SpotMarketOrderResults.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateDerivativeLimitOrder(): MsgCreateDerivativeLimitOrder {
  return {
    sender: '',
    order: DerivativeOrder.fromPartial({}),
  };
}
export const MsgCreateDerivativeLimitOrder = {
  typeUrl: '/injective.exchange.v1beta1.MsgCreateDerivativeLimitOrder',
  encode(message: MsgCreateDerivativeLimitOrder, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.order !== undefined) {
      DerivativeOrder.encode(message.order, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateDerivativeLimitOrder {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateDerivativeLimitOrder();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.order = DerivativeOrder.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCreateDerivativeLimitOrder>): MsgCreateDerivativeLimitOrder {
    const message = createBaseMsgCreateDerivativeLimitOrder();
    message.sender = object.sender ?? '';
    message.order =
      object.order !== undefined && object.order !== null ? DerivativeOrder.fromPartial(object.order) : undefined;
    return message;
  },
  fromAmino(object: MsgCreateDerivativeLimitOrderAmino): MsgCreateDerivativeLimitOrder {
    const message = createBaseMsgCreateDerivativeLimitOrder();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.order !== undefined && object.order !== null) {
      message.order = DerivativeOrder.fromAmino(object.order);
    }
    return message;
  },
  toAmino(message: MsgCreateDerivativeLimitOrder): MsgCreateDerivativeLimitOrderAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.order = message.order ? DerivativeOrder.toAmino(message.order) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgCreateDerivativeLimitOrderAminoMsg): MsgCreateDerivativeLimitOrder {
    return MsgCreateDerivativeLimitOrder.fromAmino(object.value);
  },
  toAminoMsg(message: MsgCreateDerivativeLimitOrder): MsgCreateDerivativeLimitOrderAminoMsg {
    return {
      type: 'exchange/MsgCreateDerivativeLimitOrder',
      value: MsgCreateDerivativeLimitOrder.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgCreateDerivativeLimitOrderProtoMsg): MsgCreateDerivativeLimitOrder {
    return MsgCreateDerivativeLimitOrder.decode(message.value);
  },
  toProto(message: MsgCreateDerivativeLimitOrder): Uint8Array {
    return MsgCreateDerivativeLimitOrder.encode(message).finish();
  },
  toProtoMsg(message: MsgCreateDerivativeLimitOrder): MsgCreateDerivativeLimitOrderProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgCreateDerivativeLimitOrder',
      value: MsgCreateDerivativeLimitOrder.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateDerivativeLimitOrderResponse(): MsgCreateDerivativeLimitOrderResponse {
  return {
    orderHash: '',
    cid: '',
  };
}
export const MsgCreateDerivativeLimitOrderResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgCreateDerivativeLimitOrderResponse',
  encode(message: MsgCreateDerivativeLimitOrderResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.orderHash !== '') {
      writer.uint32(10).string(message.orderHash);
    }
    if (message.cid !== '') {
      writer.uint32(18).string(message.cid);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateDerivativeLimitOrderResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateDerivativeLimitOrderResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.orderHash = reader.string();
          break;
        case 2:
          message.cid = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCreateDerivativeLimitOrderResponse>): MsgCreateDerivativeLimitOrderResponse {
    const message = createBaseMsgCreateDerivativeLimitOrderResponse();
    message.orderHash = object.orderHash ?? '';
    message.cid = object.cid ?? '';
    return message;
  },
  fromAmino(object: MsgCreateDerivativeLimitOrderResponseAmino): MsgCreateDerivativeLimitOrderResponse {
    const message = createBaseMsgCreateDerivativeLimitOrderResponse();
    if (object.order_hash !== undefined && object.order_hash !== null) {
      message.orderHash = object.order_hash;
    }
    if (object.cid !== undefined && object.cid !== null) {
      message.cid = object.cid;
    }
    return message;
  },
  toAmino(message: MsgCreateDerivativeLimitOrderResponse): MsgCreateDerivativeLimitOrderResponseAmino {
    const obj: any = {};
    obj.order_hash = message.orderHash === '' ? undefined : message.orderHash;
    obj.cid = message.cid === '' ? undefined : message.cid;
    return obj;
  },
  fromAminoMsg(object: MsgCreateDerivativeLimitOrderResponseAminoMsg): MsgCreateDerivativeLimitOrderResponse {
    return MsgCreateDerivativeLimitOrderResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgCreateDerivativeLimitOrderResponseProtoMsg): MsgCreateDerivativeLimitOrderResponse {
    return MsgCreateDerivativeLimitOrderResponse.decode(message.value);
  },
  toProto(message: MsgCreateDerivativeLimitOrderResponse): Uint8Array {
    return MsgCreateDerivativeLimitOrderResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgCreateDerivativeLimitOrderResponse): MsgCreateDerivativeLimitOrderResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgCreateDerivativeLimitOrderResponse',
      value: MsgCreateDerivativeLimitOrderResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateBinaryOptionsLimitOrder(): MsgCreateBinaryOptionsLimitOrder {
  return {
    sender: '',
    order: DerivativeOrder.fromPartial({}),
  };
}
export const MsgCreateBinaryOptionsLimitOrder = {
  typeUrl: '/injective.exchange.v1beta1.MsgCreateBinaryOptionsLimitOrder',
  encode(message: MsgCreateBinaryOptionsLimitOrder, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.order !== undefined) {
      DerivativeOrder.encode(message.order, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateBinaryOptionsLimitOrder {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateBinaryOptionsLimitOrder();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.order = DerivativeOrder.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCreateBinaryOptionsLimitOrder>): MsgCreateBinaryOptionsLimitOrder {
    const message = createBaseMsgCreateBinaryOptionsLimitOrder();
    message.sender = object.sender ?? '';
    message.order =
      object.order !== undefined && object.order !== null ? DerivativeOrder.fromPartial(object.order) : undefined;
    return message;
  },
  fromAmino(object: MsgCreateBinaryOptionsLimitOrderAmino): MsgCreateBinaryOptionsLimitOrder {
    const message = createBaseMsgCreateBinaryOptionsLimitOrder();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.order !== undefined && object.order !== null) {
      message.order = DerivativeOrder.fromAmino(object.order);
    }
    return message;
  },
  toAmino(message: MsgCreateBinaryOptionsLimitOrder): MsgCreateBinaryOptionsLimitOrderAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.order = message.order ? DerivativeOrder.toAmino(message.order) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgCreateBinaryOptionsLimitOrderAminoMsg): MsgCreateBinaryOptionsLimitOrder {
    return MsgCreateBinaryOptionsLimitOrder.fromAmino(object.value);
  },
  toAminoMsg(message: MsgCreateBinaryOptionsLimitOrder): MsgCreateBinaryOptionsLimitOrderAminoMsg {
    return {
      type: 'exchange/MsgCreateBinaryOptionsLimitOrder',
      value: MsgCreateBinaryOptionsLimitOrder.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgCreateBinaryOptionsLimitOrderProtoMsg): MsgCreateBinaryOptionsLimitOrder {
    return MsgCreateBinaryOptionsLimitOrder.decode(message.value);
  },
  toProto(message: MsgCreateBinaryOptionsLimitOrder): Uint8Array {
    return MsgCreateBinaryOptionsLimitOrder.encode(message).finish();
  },
  toProtoMsg(message: MsgCreateBinaryOptionsLimitOrder): MsgCreateBinaryOptionsLimitOrderProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgCreateBinaryOptionsLimitOrder',
      value: MsgCreateBinaryOptionsLimitOrder.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateBinaryOptionsLimitOrderResponse(): MsgCreateBinaryOptionsLimitOrderResponse {
  return {
    orderHash: '',
    cid: '',
  };
}
export const MsgCreateBinaryOptionsLimitOrderResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgCreateBinaryOptionsLimitOrderResponse',
  encode(
    message: MsgCreateBinaryOptionsLimitOrderResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.orderHash !== '') {
      writer.uint32(10).string(message.orderHash);
    }
    if (message.cid !== '') {
      writer.uint32(18).string(message.cid);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateBinaryOptionsLimitOrderResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateBinaryOptionsLimitOrderResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.orderHash = reader.string();
          break;
        case 2:
          message.cid = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCreateBinaryOptionsLimitOrderResponse>): MsgCreateBinaryOptionsLimitOrderResponse {
    const message = createBaseMsgCreateBinaryOptionsLimitOrderResponse();
    message.orderHash = object.orderHash ?? '';
    message.cid = object.cid ?? '';
    return message;
  },
  fromAmino(object: MsgCreateBinaryOptionsLimitOrderResponseAmino): MsgCreateBinaryOptionsLimitOrderResponse {
    const message = createBaseMsgCreateBinaryOptionsLimitOrderResponse();
    if (object.order_hash !== undefined && object.order_hash !== null) {
      message.orderHash = object.order_hash;
    }
    if (object.cid !== undefined && object.cid !== null) {
      message.cid = object.cid;
    }
    return message;
  },
  toAmino(message: MsgCreateBinaryOptionsLimitOrderResponse): MsgCreateBinaryOptionsLimitOrderResponseAmino {
    const obj: any = {};
    obj.order_hash = message.orderHash === '' ? undefined : message.orderHash;
    obj.cid = message.cid === '' ? undefined : message.cid;
    return obj;
  },
  fromAminoMsg(object: MsgCreateBinaryOptionsLimitOrderResponseAminoMsg): MsgCreateBinaryOptionsLimitOrderResponse {
    return MsgCreateBinaryOptionsLimitOrderResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgCreateBinaryOptionsLimitOrderResponseProtoMsg): MsgCreateBinaryOptionsLimitOrderResponse {
    return MsgCreateBinaryOptionsLimitOrderResponse.decode(message.value);
  },
  toProto(message: MsgCreateBinaryOptionsLimitOrderResponse): Uint8Array {
    return MsgCreateBinaryOptionsLimitOrderResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgCreateBinaryOptionsLimitOrderResponse): MsgCreateBinaryOptionsLimitOrderResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgCreateBinaryOptionsLimitOrderResponse',
      value: MsgCreateBinaryOptionsLimitOrderResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgBatchCreateDerivativeLimitOrders(): MsgBatchCreateDerivativeLimitOrders {
  return {
    sender: '',
    orders: [],
  };
}
export const MsgBatchCreateDerivativeLimitOrders = {
  typeUrl: '/injective.exchange.v1beta1.MsgBatchCreateDerivativeLimitOrders',
  encode(message: MsgBatchCreateDerivativeLimitOrders, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    for (const v of message.orders) {
      DerivativeOrder.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgBatchCreateDerivativeLimitOrders {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBatchCreateDerivativeLimitOrders();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.orders.push(DerivativeOrder.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgBatchCreateDerivativeLimitOrders>): MsgBatchCreateDerivativeLimitOrders {
    const message = createBaseMsgBatchCreateDerivativeLimitOrders();
    message.sender = object.sender ?? '';
    message.orders = object.orders?.map((e) => DerivativeOrder.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: MsgBatchCreateDerivativeLimitOrdersAmino): MsgBatchCreateDerivativeLimitOrders {
    const message = createBaseMsgBatchCreateDerivativeLimitOrders();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    message.orders = object.orders?.map((e) => DerivativeOrder.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: MsgBatchCreateDerivativeLimitOrders): MsgBatchCreateDerivativeLimitOrdersAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    if (message.orders) {
      obj.orders = message.orders.map((e) => (e ? DerivativeOrder.toAmino(e) : undefined));
    } else {
      obj.orders = message.orders;
    }
    return obj;
  },
  fromAminoMsg(object: MsgBatchCreateDerivativeLimitOrdersAminoMsg): MsgBatchCreateDerivativeLimitOrders {
    return MsgBatchCreateDerivativeLimitOrders.fromAmino(object.value);
  },
  toAminoMsg(message: MsgBatchCreateDerivativeLimitOrders): MsgBatchCreateDerivativeLimitOrdersAminoMsg {
    return {
      type: 'exchange/MsgBatchCreateDerivativeLimitOrders',
      value: MsgBatchCreateDerivativeLimitOrders.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgBatchCreateDerivativeLimitOrdersProtoMsg): MsgBatchCreateDerivativeLimitOrders {
    return MsgBatchCreateDerivativeLimitOrders.decode(message.value);
  },
  toProto(message: MsgBatchCreateDerivativeLimitOrders): Uint8Array {
    return MsgBatchCreateDerivativeLimitOrders.encode(message).finish();
  },
  toProtoMsg(message: MsgBatchCreateDerivativeLimitOrders): MsgBatchCreateDerivativeLimitOrdersProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgBatchCreateDerivativeLimitOrders',
      value: MsgBatchCreateDerivativeLimitOrders.encode(message).finish(),
    };
  },
};
function createBaseMsgBatchCreateDerivativeLimitOrdersResponse(): MsgBatchCreateDerivativeLimitOrdersResponse {
  return {
    orderHashes: [],
    createdOrdersCids: [],
    failedOrdersCids: [],
  };
}
export const MsgBatchCreateDerivativeLimitOrdersResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgBatchCreateDerivativeLimitOrdersResponse',
  encode(
    message: MsgBatchCreateDerivativeLimitOrdersResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.orderHashes) {
      writer.uint32(10).string(v!);
    }
    for (const v of message.createdOrdersCids) {
      writer.uint32(18).string(v!);
    }
    for (const v of message.failedOrdersCids) {
      writer.uint32(26).string(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgBatchCreateDerivativeLimitOrdersResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBatchCreateDerivativeLimitOrdersResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.orderHashes.push(reader.string());
          break;
        case 2:
          message.createdOrdersCids.push(reader.string());
          break;
        case 3:
          message.failedOrdersCids.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgBatchCreateDerivativeLimitOrdersResponse>,
  ): MsgBatchCreateDerivativeLimitOrdersResponse {
    const message = createBaseMsgBatchCreateDerivativeLimitOrdersResponse();
    message.orderHashes = object.orderHashes?.map((e) => e) || [];
    message.createdOrdersCids = object.createdOrdersCids?.map((e) => e) || [];
    message.failedOrdersCids = object.failedOrdersCids?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: MsgBatchCreateDerivativeLimitOrdersResponseAmino): MsgBatchCreateDerivativeLimitOrdersResponse {
    const message = createBaseMsgBatchCreateDerivativeLimitOrdersResponse();
    message.orderHashes = object.order_hashes?.map((e) => e) || [];
    message.createdOrdersCids = object.created_orders_cids?.map((e) => e) || [];
    message.failedOrdersCids = object.failed_orders_cids?.map((e) => e) || [];
    return message;
  },
  toAmino(message: MsgBatchCreateDerivativeLimitOrdersResponse): MsgBatchCreateDerivativeLimitOrdersResponseAmino {
    const obj: any = {};
    if (message.orderHashes) {
      obj.order_hashes = message.orderHashes.map((e) => e);
    } else {
      obj.order_hashes = message.orderHashes;
    }
    if (message.createdOrdersCids) {
      obj.created_orders_cids = message.createdOrdersCids.map((e) => e);
    } else {
      obj.created_orders_cids = message.createdOrdersCids;
    }
    if (message.failedOrdersCids) {
      obj.failed_orders_cids = message.failedOrdersCids.map((e) => e);
    } else {
      obj.failed_orders_cids = message.failedOrdersCids;
    }
    return obj;
  },
  fromAminoMsg(
    object: MsgBatchCreateDerivativeLimitOrdersResponseAminoMsg,
  ): MsgBatchCreateDerivativeLimitOrdersResponse {
    return MsgBatchCreateDerivativeLimitOrdersResponse.fromAmino(object.value);
  },
  fromProtoMsg(
    message: MsgBatchCreateDerivativeLimitOrdersResponseProtoMsg,
  ): MsgBatchCreateDerivativeLimitOrdersResponse {
    return MsgBatchCreateDerivativeLimitOrdersResponse.decode(message.value);
  },
  toProto(message: MsgBatchCreateDerivativeLimitOrdersResponse): Uint8Array {
    return MsgBatchCreateDerivativeLimitOrdersResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgBatchCreateDerivativeLimitOrdersResponse,
  ): MsgBatchCreateDerivativeLimitOrdersResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgBatchCreateDerivativeLimitOrdersResponse',
      value: MsgBatchCreateDerivativeLimitOrdersResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgCancelSpotOrder(): MsgCancelSpotOrder {
  return {
    sender: '',
    marketId: '',
    subaccountId: '',
    orderHash: '',
    cid: '',
  };
}
export const MsgCancelSpotOrder = {
  typeUrl: '/injective.exchange.v1beta1.MsgCancelSpotOrder',
  encode(message: MsgCancelSpotOrder, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.marketId !== '') {
      writer.uint32(18).string(message.marketId);
    }
    if (message.subaccountId !== '') {
      writer.uint32(26).string(message.subaccountId);
    }
    if (message.orderHash !== '') {
      writer.uint32(34).string(message.orderHash);
    }
    if (message.cid !== '') {
      writer.uint32(42).string(message.cid);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCancelSpotOrder {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCancelSpotOrder();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.marketId = reader.string();
          break;
        case 3:
          message.subaccountId = reader.string();
          break;
        case 4:
          message.orderHash = reader.string();
          break;
        case 5:
          message.cid = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCancelSpotOrder>): MsgCancelSpotOrder {
    const message = createBaseMsgCancelSpotOrder();
    message.sender = object.sender ?? '';
    message.marketId = object.marketId ?? '';
    message.subaccountId = object.subaccountId ?? '';
    message.orderHash = object.orderHash ?? '';
    message.cid = object.cid ?? '';
    return message;
  },
  fromAmino(object: MsgCancelSpotOrderAmino): MsgCancelSpotOrder {
    const message = createBaseMsgCancelSpotOrder();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.market_id !== undefined && object.market_id !== null) {
      message.marketId = object.market_id;
    }
    if (object.subaccount_id !== undefined && object.subaccount_id !== null) {
      message.subaccountId = object.subaccount_id;
    }
    if (object.order_hash !== undefined && object.order_hash !== null) {
      message.orderHash = object.order_hash;
    }
    if (object.cid !== undefined && object.cid !== null) {
      message.cid = object.cid;
    }
    return message;
  },
  toAmino(message: MsgCancelSpotOrder): MsgCancelSpotOrderAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.market_id = message.marketId === '' ? undefined : message.marketId;
    obj.subaccount_id = message.subaccountId === '' ? undefined : message.subaccountId;
    obj.order_hash = message.orderHash === '' ? undefined : message.orderHash;
    obj.cid = message.cid === '' ? undefined : message.cid;
    return obj;
  },
  fromAminoMsg(object: MsgCancelSpotOrderAminoMsg): MsgCancelSpotOrder {
    return MsgCancelSpotOrder.fromAmino(object.value);
  },
  toAminoMsg(message: MsgCancelSpotOrder): MsgCancelSpotOrderAminoMsg {
    return {
      type: 'exchange/MsgCancelSpotOrder',
      value: MsgCancelSpotOrder.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgCancelSpotOrderProtoMsg): MsgCancelSpotOrder {
    return MsgCancelSpotOrder.decode(message.value);
  },
  toProto(message: MsgCancelSpotOrder): Uint8Array {
    return MsgCancelSpotOrder.encode(message).finish();
  },
  toProtoMsg(message: MsgCancelSpotOrder): MsgCancelSpotOrderProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgCancelSpotOrder',
      value: MsgCancelSpotOrder.encode(message).finish(),
    };
  },
};
function createBaseMsgCancelSpotOrderResponse(): MsgCancelSpotOrderResponse {
  return {};
}
export const MsgCancelSpotOrderResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgCancelSpotOrderResponse',
  encode(_: MsgCancelSpotOrderResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCancelSpotOrderResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCancelSpotOrderResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgCancelSpotOrderResponse>): MsgCancelSpotOrderResponse {
    const message = createBaseMsgCancelSpotOrderResponse();
    return message;
  },
  fromAmino(_: MsgCancelSpotOrderResponseAmino): MsgCancelSpotOrderResponse {
    const message = createBaseMsgCancelSpotOrderResponse();
    return message;
  },
  toAmino(_: MsgCancelSpotOrderResponse): MsgCancelSpotOrderResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgCancelSpotOrderResponseAminoMsg): MsgCancelSpotOrderResponse {
    return MsgCancelSpotOrderResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgCancelSpotOrderResponseProtoMsg): MsgCancelSpotOrderResponse {
    return MsgCancelSpotOrderResponse.decode(message.value);
  },
  toProto(message: MsgCancelSpotOrderResponse): Uint8Array {
    return MsgCancelSpotOrderResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgCancelSpotOrderResponse): MsgCancelSpotOrderResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgCancelSpotOrderResponse',
      value: MsgCancelSpotOrderResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgBatchCancelSpotOrders(): MsgBatchCancelSpotOrders {
  return {
    sender: '',
    data: [],
  };
}
export const MsgBatchCancelSpotOrders = {
  typeUrl: '/injective.exchange.v1beta1.MsgBatchCancelSpotOrders',
  encode(message: MsgBatchCancelSpotOrders, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    for (const v of message.data) {
      OrderData.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgBatchCancelSpotOrders {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBatchCancelSpotOrders();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.data.push(OrderData.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgBatchCancelSpotOrders>): MsgBatchCancelSpotOrders {
    const message = createBaseMsgBatchCancelSpotOrders();
    message.sender = object.sender ?? '';
    message.data = object.data?.map((e) => OrderData.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: MsgBatchCancelSpotOrdersAmino): MsgBatchCancelSpotOrders {
    const message = createBaseMsgBatchCancelSpotOrders();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    message.data = object.data?.map((e) => OrderData.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: MsgBatchCancelSpotOrders): MsgBatchCancelSpotOrdersAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    if (message.data) {
      obj.data = message.data.map((e) => (e ? OrderData.toAmino(e) : undefined));
    } else {
      obj.data = message.data;
    }
    return obj;
  },
  fromAminoMsg(object: MsgBatchCancelSpotOrdersAminoMsg): MsgBatchCancelSpotOrders {
    return MsgBatchCancelSpotOrders.fromAmino(object.value);
  },
  toAminoMsg(message: MsgBatchCancelSpotOrders): MsgBatchCancelSpotOrdersAminoMsg {
    return {
      type: 'exchange/MsgBatchCancelSpotOrders',
      value: MsgBatchCancelSpotOrders.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgBatchCancelSpotOrdersProtoMsg): MsgBatchCancelSpotOrders {
    return MsgBatchCancelSpotOrders.decode(message.value);
  },
  toProto(message: MsgBatchCancelSpotOrders): Uint8Array {
    return MsgBatchCancelSpotOrders.encode(message).finish();
  },
  toProtoMsg(message: MsgBatchCancelSpotOrders): MsgBatchCancelSpotOrdersProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgBatchCancelSpotOrders',
      value: MsgBatchCancelSpotOrders.encode(message).finish(),
    };
  },
};
function createBaseMsgBatchCancelSpotOrdersResponse(): MsgBatchCancelSpotOrdersResponse {
  return {
    success: [],
  };
}
export const MsgBatchCancelSpotOrdersResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgBatchCancelSpotOrdersResponse',
  encode(message: MsgBatchCancelSpotOrdersResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    writer.uint32(10).fork();
    for (const v of message.success) {
      writer.bool(v);
    }
    writer.ldelim();
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgBatchCancelSpotOrdersResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBatchCancelSpotOrdersResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.success.push(reader.bool());
            }
          } else {
            message.success.push(reader.bool());
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgBatchCancelSpotOrdersResponse>): MsgBatchCancelSpotOrdersResponse {
    const message = createBaseMsgBatchCancelSpotOrdersResponse();
    message.success = object.success?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: MsgBatchCancelSpotOrdersResponseAmino): MsgBatchCancelSpotOrdersResponse {
    const message = createBaseMsgBatchCancelSpotOrdersResponse();
    message.success = object.success?.map((e) => e) || [];
    return message;
  },
  toAmino(message: MsgBatchCancelSpotOrdersResponse): MsgBatchCancelSpotOrdersResponseAmino {
    const obj: any = {};
    if (message.success) {
      obj.success = message.success.map((e) => e);
    } else {
      obj.success = message.success;
    }
    return obj;
  },
  fromAminoMsg(object: MsgBatchCancelSpotOrdersResponseAminoMsg): MsgBatchCancelSpotOrdersResponse {
    return MsgBatchCancelSpotOrdersResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgBatchCancelSpotOrdersResponseProtoMsg): MsgBatchCancelSpotOrdersResponse {
    return MsgBatchCancelSpotOrdersResponse.decode(message.value);
  },
  toProto(message: MsgBatchCancelSpotOrdersResponse): Uint8Array {
    return MsgBatchCancelSpotOrdersResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgBatchCancelSpotOrdersResponse): MsgBatchCancelSpotOrdersResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgBatchCancelSpotOrdersResponse',
      value: MsgBatchCancelSpotOrdersResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgBatchCancelBinaryOptionsOrders(): MsgBatchCancelBinaryOptionsOrders {
  return {
    sender: '',
    data: [],
  };
}
export const MsgBatchCancelBinaryOptionsOrders = {
  typeUrl: '/injective.exchange.v1beta1.MsgBatchCancelBinaryOptionsOrders',
  encode(message: MsgBatchCancelBinaryOptionsOrders, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    for (const v of message.data) {
      OrderData.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgBatchCancelBinaryOptionsOrders {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBatchCancelBinaryOptionsOrders();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.data.push(OrderData.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgBatchCancelBinaryOptionsOrders>): MsgBatchCancelBinaryOptionsOrders {
    const message = createBaseMsgBatchCancelBinaryOptionsOrders();
    message.sender = object.sender ?? '';
    message.data = object.data?.map((e) => OrderData.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: MsgBatchCancelBinaryOptionsOrdersAmino): MsgBatchCancelBinaryOptionsOrders {
    const message = createBaseMsgBatchCancelBinaryOptionsOrders();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    message.data = object.data?.map((e) => OrderData.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: MsgBatchCancelBinaryOptionsOrders): MsgBatchCancelBinaryOptionsOrdersAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    if (message.data) {
      obj.data = message.data.map((e) => (e ? OrderData.toAmino(e) : undefined));
    } else {
      obj.data = message.data;
    }
    return obj;
  },
  fromAminoMsg(object: MsgBatchCancelBinaryOptionsOrdersAminoMsg): MsgBatchCancelBinaryOptionsOrders {
    return MsgBatchCancelBinaryOptionsOrders.fromAmino(object.value);
  },
  toAminoMsg(message: MsgBatchCancelBinaryOptionsOrders): MsgBatchCancelBinaryOptionsOrdersAminoMsg {
    return {
      type: 'exchange/MsgBatchCancelBinaryOptionsOrders',
      value: MsgBatchCancelBinaryOptionsOrders.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgBatchCancelBinaryOptionsOrdersProtoMsg): MsgBatchCancelBinaryOptionsOrders {
    return MsgBatchCancelBinaryOptionsOrders.decode(message.value);
  },
  toProto(message: MsgBatchCancelBinaryOptionsOrders): Uint8Array {
    return MsgBatchCancelBinaryOptionsOrders.encode(message).finish();
  },
  toProtoMsg(message: MsgBatchCancelBinaryOptionsOrders): MsgBatchCancelBinaryOptionsOrdersProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgBatchCancelBinaryOptionsOrders',
      value: MsgBatchCancelBinaryOptionsOrders.encode(message).finish(),
    };
  },
};
function createBaseMsgBatchCancelBinaryOptionsOrdersResponse(): MsgBatchCancelBinaryOptionsOrdersResponse {
  return {
    success: [],
  };
}
export const MsgBatchCancelBinaryOptionsOrdersResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgBatchCancelBinaryOptionsOrdersResponse',
  encode(
    message: MsgBatchCancelBinaryOptionsOrdersResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    writer.uint32(10).fork();
    for (const v of message.success) {
      writer.bool(v);
    }
    writer.ldelim();
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgBatchCancelBinaryOptionsOrdersResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBatchCancelBinaryOptionsOrdersResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.success.push(reader.bool());
            }
          } else {
            message.success.push(reader.bool());
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgBatchCancelBinaryOptionsOrdersResponse>): MsgBatchCancelBinaryOptionsOrdersResponse {
    const message = createBaseMsgBatchCancelBinaryOptionsOrdersResponse();
    message.success = object.success?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: MsgBatchCancelBinaryOptionsOrdersResponseAmino): MsgBatchCancelBinaryOptionsOrdersResponse {
    const message = createBaseMsgBatchCancelBinaryOptionsOrdersResponse();
    message.success = object.success?.map((e) => e) || [];
    return message;
  },
  toAmino(message: MsgBatchCancelBinaryOptionsOrdersResponse): MsgBatchCancelBinaryOptionsOrdersResponseAmino {
    const obj: any = {};
    if (message.success) {
      obj.success = message.success.map((e) => e);
    } else {
      obj.success = message.success;
    }
    return obj;
  },
  fromAminoMsg(object: MsgBatchCancelBinaryOptionsOrdersResponseAminoMsg): MsgBatchCancelBinaryOptionsOrdersResponse {
    return MsgBatchCancelBinaryOptionsOrdersResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgBatchCancelBinaryOptionsOrdersResponseProtoMsg): MsgBatchCancelBinaryOptionsOrdersResponse {
    return MsgBatchCancelBinaryOptionsOrdersResponse.decode(message.value);
  },
  toProto(message: MsgBatchCancelBinaryOptionsOrdersResponse): Uint8Array {
    return MsgBatchCancelBinaryOptionsOrdersResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgBatchCancelBinaryOptionsOrdersResponse): MsgBatchCancelBinaryOptionsOrdersResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgBatchCancelBinaryOptionsOrdersResponse',
      value: MsgBatchCancelBinaryOptionsOrdersResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgBatchUpdateOrders(): MsgBatchUpdateOrders {
  return {
    sender: '',
    subaccountId: '',
    spotMarketIdsToCancelAll: [],
    derivativeMarketIdsToCancelAll: [],
    spotOrdersToCancel: [],
    derivativeOrdersToCancel: [],
    spotOrdersToCreate: [],
    derivativeOrdersToCreate: [],
    binaryOptionsOrdersToCancel: [],
    binaryOptionsMarketIdsToCancelAll: [],
    binaryOptionsOrdersToCreate: [],
  };
}
export const MsgBatchUpdateOrders = {
  typeUrl: '/injective.exchange.v1beta1.MsgBatchUpdateOrders',
  encode(message: MsgBatchUpdateOrders, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.subaccountId !== '') {
      writer.uint32(18).string(message.subaccountId);
    }
    for (const v of message.spotMarketIdsToCancelAll) {
      writer.uint32(26).string(v!);
    }
    for (const v of message.derivativeMarketIdsToCancelAll) {
      writer.uint32(34).string(v!);
    }
    for (const v of message.spotOrdersToCancel) {
      OrderData.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    for (const v of message.derivativeOrdersToCancel) {
      OrderData.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    for (const v of message.spotOrdersToCreate) {
      SpotOrder.encode(v!, writer.uint32(58).fork()).ldelim();
    }
    for (const v of message.derivativeOrdersToCreate) {
      DerivativeOrder.encode(v!, writer.uint32(66).fork()).ldelim();
    }
    for (const v of message.binaryOptionsOrdersToCancel) {
      OrderData.encode(v!, writer.uint32(74).fork()).ldelim();
    }
    for (const v of message.binaryOptionsMarketIdsToCancelAll) {
      writer.uint32(82).string(v!);
    }
    for (const v of message.binaryOptionsOrdersToCreate) {
      DerivativeOrder.encode(v!, writer.uint32(90).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgBatchUpdateOrders {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBatchUpdateOrders();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.subaccountId = reader.string();
          break;
        case 3:
          message.spotMarketIdsToCancelAll.push(reader.string());
          break;
        case 4:
          message.derivativeMarketIdsToCancelAll.push(reader.string());
          break;
        case 5:
          message.spotOrdersToCancel.push(OrderData.decode(reader, reader.uint32()));
          break;
        case 6:
          message.derivativeOrdersToCancel.push(OrderData.decode(reader, reader.uint32()));
          break;
        case 7:
          message.spotOrdersToCreate.push(SpotOrder.decode(reader, reader.uint32()));
          break;
        case 8:
          message.derivativeOrdersToCreate.push(DerivativeOrder.decode(reader, reader.uint32()));
          break;
        case 9:
          message.binaryOptionsOrdersToCancel.push(OrderData.decode(reader, reader.uint32()));
          break;
        case 10:
          message.binaryOptionsMarketIdsToCancelAll.push(reader.string());
          break;
        case 11:
          message.binaryOptionsOrdersToCreate.push(DerivativeOrder.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgBatchUpdateOrders>): MsgBatchUpdateOrders {
    const message = createBaseMsgBatchUpdateOrders();
    message.sender = object.sender ?? '';
    message.subaccountId = object.subaccountId ?? '';
    message.spotMarketIdsToCancelAll = object.spotMarketIdsToCancelAll?.map((e) => e) || [];
    message.derivativeMarketIdsToCancelAll = object.derivativeMarketIdsToCancelAll?.map((e) => e) || [];
    message.spotOrdersToCancel = object.spotOrdersToCancel?.map((e) => OrderData.fromPartial(e)) || [];
    message.derivativeOrdersToCancel = object.derivativeOrdersToCancel?.map((e) => OrderData.fromPartial(e)) || [];
    message.spotOrdersToCreate = object.spotOrdersToCreate?.map((e) => SpotOrder.fromPartial(e)) || [];
    message.derivativeOrdersToCreate =
      object.derivativeOrdersToCreate?.map((e) => DerivativeOrder.fromPartial(e)) || [];
    message.binaryOptionsOrdersToCancel =
      object.binaryOptionsOrdersToCancel?.map((e) => OrderData.fromPartial(e)) || [];
    message.binaryOptionsMarketIdsToCancelAll = object.binaryOptionsMarketIdsToCancelAll?.map((e) => e) || [];
    message.binaryOptionsOrdersToCreate =
      object.binaryOptionsOrdersToCreate?.map((e) => DerivativeOrder.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: MsgBatchUpdateOrdersAmino): MsgBatchUpdateOrders {
    const message = createBaseMsgBatchUpdateOrders();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.subaccount_id !== undefined && object.subaccount_id !== null) {
      message.subaccountId = object.subaccount_id;
    }
    message.spotMarketIdsToCancelAll = object.spot_market_ids_to_cancel_all?.map((e) => e) || [];
    message.derivativeMarketIdsToCancelAll = object.derivative_market_ids_to_cancel_all?.map((e) => e) || [];
    message.spotOrdersToCancel = object.spot_orders_to_cancel?.map((e) => OrderData.fromAmino(e)) || [];
    message.derivativeOrdersToCancel = object.derivative_orders_to_cancel?.map((e) => OrderData.fromAmino(e)) || [];
    message.spotOrdersToCreate = object.spot_orders_to_create?.map((e) => SpotOrder.fromAmino(e)) || [];
    message.derivativeOrdersToCreate =
      object.derivative_orders_to_create?.map((e) => DerivativeOrder.fromAmino(e)) || [];
    message.binaryOptionsOrdersToCancel =
      object.binary_options_orders_to_cancel?.map((e) => OrderData.fromAmino(e)) || [];
    message.binaryOptionsMarketIdsToCancelAll = object.binary_options_market_ids_to_cancel_all?.map((e) => e) || [];
    message.binaryOptionsOrdersToCreate =
      object.binary_options_orders_to_create?.map((e) => DerivativeOrder.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: MsgBatchUpdateOrders): MsgBatchUpdateOrdersAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.subaccount_id = message.subaccountId === '' ? undefined : message.subaccountId;
    if (message.spotMarketIdsToCancelAll) {
      obj.spot_market_ids_to_cancel_all = message.spotMarketIdsToCancelAll.map((e) => e);
    } else {
      obj.spot_market_ids_to_cancel_all = message.spotMarketIdsToCancelAll;
    }
    if (message.derivativeMarketIdsToCancelAll) {
      obj.derivative_market_ids_to_cancel_all = message.derivativeMarketIdsToCancelAll.map((e) => e);
    } else {
      obj.derivative_market_ids_to_cancel_all = message.derivativeMarketIdsToCancelAll;
    }
    if (message.spotOrdersToCancel) {
      obj.spot_orders_to_cancel = message.spotOrdersToCancel.map((e) => (e ? OrderData.toAmino(e) : undefined));
    } else {
      obj.spot_orders_to_cancel = message.spotOrdersToCancel;
    }
    if (message.derivativeOrdersToCancel) {
      obj.derivative_orders_to_cancel = message.derivativeOrdersToCancel.map((e) =>
        e ? OrderData.toAmino(e) : undefined,
      );
    } else {
      obj.derivative_orders_to_cancel = message.derivativeOrdersToCancel;
    }
    if (message.spotOrdersToCreate) {
      obj.spot_orders_to_create = message.spotOrdersToCreate.map((e) => (e ? SpotOrder.toAmino(e) : undefined));
    } else {
      obj.spot_orders_to_create = message.spotOrdersToCreate;
    }
    if (message.derivativeOrdersToCreate) {
      obj.derivative_orders_to_create = message.derivativeOrdersToCreate.map((e) =>
        e ? DerivativeOrder.toAmino(e) : undefined,
      );
    } else {
      obj.derivative_orders_to_create = message.derivativeOrdersToCreate;
    }
    if (message.binaryOptionsOrdersToCancel) {
      obj.binary_options_orders_to_cancel = message.binaryOptionsOrdersToCancel.map((e) =>
        e ? OrderData.toAmino(e) : undefined,
      );
    } else {
      obj.binary_options_orders_to_cancel = message.binaryOptionsOrdersToCancel;
    }
    if (message.binaryOptionsMarketIdsToCancelAll) {
      obj.binary_options_market_ids_to_cancel_all = message.binaryOptionsMarketIdsToCancelAll.map((e) => e);
    } else {
      obj.binary_options_market_ids_to_cancel_all = message.binaryOptionsMarketIdsToCancelAll;
    }
    if (message.binaryOptionsOrdersToCreate) {
      obj.binary_options_orders_to_create = message.binaryOptionsOrdersToCreate.map((e) =>
        e ? DerivativeOrder.toAmino(e) : undefined,
      );
    } else {
      obj.binary_options_orders_to_create = message.binaryOptionsOrdersToCreate;
    }
    return obj;
  },
  fromAminoMsg(object: MsgBatchUpdateOrdersAminoMsg): MsgBatchUpdateOrders {
    return MsgBatchUpdateOrders.fromAmino(object.value);
  },
  toAminoMsg(message: MsgBatchUpdateOrders): MsgBatchUpdateOrdersAminoMsg {
    return {
      type: 'exchange/MsgBatchUpdateOrders',
      value: MsgBatchUpdateOrders.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgBatchUpdateOrdersProtoMsg): MsgBatchUpdateOrders {
    return MsgBatchUpdateOrders.decode(message.value);
  },
  toProto(message: MsgBatchUpdateOrders): Uint8Array {
    return MsgBatchUpdateOrders.encode(message).finish();
  },
  toProtoMsg(message: MsgBatchUpdateOrders): MsgBatchUpdateOrdersProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgBatchUpdateOrders',
      value: MsgBatchUpdateOrders.encode(message).finish(),
    };
  },
};
function createBaseMsgBatchUpdateOrdersResponse(): MsgBatchUpdateOrdersResponse {
  return {
    spotCancelSuccess: [],
    derivativeCancelSuccess: [],
    spotOrderHashes: [],
    derivativeOrderHashes: [],
    binaryOptionsCancelSuccess: [],
    binaryOptionsOrderHashes: [],
    createdSpotOrdersCids: [],
    failedSpotOrdersCids: [],
    createdDerivativeOrdersCids: [],
    failedDerivativeOrdersCids: [],
    createdBinaryOptionsOrdersCids: [],
    failedBinaryOptionsOrdersCids: [],
  };
}
export const MsgBatchUpdateOrdersResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgBatchUpdateOrdersResponse',
  encode(message: MsgBatchUpdateOrdersResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    writer.uint32(10).fork();
    for (const v of message.spotCancelSuccess) {
      writer.bool(v);
    }
    writer.ldelim();
    writer.uint32(18).fork();
    for (const v of message.derivativeCancelSuccess) {
      writer.bool(v);
    }
    writer.ldelim();
    for (const v of message.spotOrderHashes) {
      writer.uint32(26).string(v!);
    }
    for (const v of message.derivativeOrderHashes) {
      writer.uint32(34).string(v!);
    }
    writer.uint32(42).fork();
    for (const v of message.binaryOptionsCancelSuccess) {
      writer.bool(v);
    }
    writer.ldelim();
    for (const v of message.binaryOptionsOrderHashes) {
      writer.uint32(50).string(v!);
    }
    for (const v of message.createdSpotOrdersCids) {
      writer.uint32(58).string(v!);
    }
    for (const v of message.failedSpotOrdersCids) {
      writer.uint32(66).string(v!);
    }
    for (const v of message.createdDerivativeOrdersCids) {
      writer.uint32(74).string(v!);
    }
    for (const v of message.failedDerivativeOrdersCids) {
      writer.uint32(82).string(v!);
    }
    for (const v of message.createdBinaryOptionsOrdersCids) {
      writer.uint32(90).string(v!);
    }
    for (const v of message.failedBinaryOptionsOrdersCids) {
      writer.uint32(98).string(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgBatchUpdateOrdersResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBatchUpdateOrdersResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.spotCancelSuccess.push(reader.bool());
            }
          } else {
            message.spotCancelSuccess.push(reader.bool());
          }
          break;
        case 2:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.derivativeCancelSuccess.push(reader.bool());
            }
          } else {
            message.derivativeCancelSuccess.push(reader.bool());
          }
          break;
        case 3:
          message.spotOrderHashes.push(reader.string());
          break;
        case 4:
          message.derivativeOrderHashes.push(reader.string());
          break;
        case 5:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.binaryOptionsCancelSuccess.push(reader.bool());
            }
          } else {
            message.binaryOptionsCancelSuccess.push(reader.bool());
          }
          break;
        case 6:
          message.binaryOptionsOrderHashes.push(reader.string());
          break;
        case 7:
          message.createdSpotOrdersCids.push(reader.string());
          break;
        case 8:
          message.failedSpotOrdersCids.push(reader.string());
          break;
        case 9:
          message.createdDerivativeOrdersCids.push(reader.string());
          break;
        case 10:
          message.failedDerivativeOrdersCids.push(reader.string());
          break;
        case 11:
          message.createdBinaryOptionsOrdersCids.push(reader.string());
          break;
        case 12:
          message.failedBinaryOptionsOrdersCids.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgBatchUpdateOrdersResponse>): MsgBatchUpdateOrdersResponse {
    const message = createBaseMsgBatchUpdateOrdersResponse();
    message.spotCancelSuccess = object.spotCancelSuccess?.map((e) => e) || [];
    message.derivativeCancelSuccess = object.derivativeCancelSuccess?.map((e) => e) || [];
    message.spotOrderHashes = object.spotOrderHashes?.map((e) => e) || [];
    message.derivativeOrderHashes = object.derivativeOrderHashes?.map((e) => e) || [];
    message.binaryOptionsCancelSuccess = object.binaryOptionsCancelSuccess?.map((e) => e) || [];
    message.binaryOptionsOrderHashes = object.binaryOptionsOrderHashes?.map((e) => e) || [];
    message.createdSpotOrdersCids = object.createdSpotOrdersCids?.map((e) => e) || [];
    message.failedSpotOrdersCids = object.failedSpotOrdersCids?.map((e) => e) || [];
    message.createdDerivativeOrdersCids = object.createdDerivativeOrdersCids?.map((e) => e) || [];
    message.failedDerivativeOrdersCids = object.failedDerivativeOrdersCids?.map((e) => e) || [];
    message.createdBinaryOptionsOrdersCids = object.createdBinaryOptionsOrdersCids?.map((e) => e) || [];
    message.failedBinaryOptionsOrdersCids = object.failedBinaryOptionsOrdersCids?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: MsgBatchUpdateOrdersResponseAmino): MsgBatchUpdateOrdersResponse {
    const message = createBaseMsgBatchUpdateOrdersResponse();
    message.spotCancelSuccess = object.spot_cancel_success?.map((e) => e) || [];
    message.derivativeCancelSuccess = object.derivative_cancel_success?.map((e) => e) || [];
    message.spotOrderHashes = object.spot_order_hashes?.map((e) => e) || [];
    message.derivativeOrderHashes = object.derivative_order_hashes?.map((e) => e) || [];
    message.binaryOptionsCancelSuccess = object.binary_options_cancel_success?.map((e) => e) || [];
    message.binaryOptionsOrderHashes = object.binary_options_order_hashes?.map((e) => e) || [];
    message.createdSpotOrdersCids = object.created_spot_orders_cids?.map((e) => e) || [];
    message.failedSpotOrdersCids = object.failed_spot_orders_cids?.map((e) => e) || [];
    message.createdDerivativeOrdersCids = object.created_derivative_orders_cids?.map((e) => e) || [];
    message.failedDerivativeOrdersCids = object.failed_derivative_orders_cids?.map((e) => e) || [];
    message.createdBinaryOptionsOrdersCids = object.created_binary_options_orders_cids?.map((e) => e) || [];
    message.failedBinaryOptionsOrdersCids = object.failed_binary_options_orders_cids?.map((e) => e) || [];
    return message;
  },
  toAmino(message: MsgBatchUpdateOrdersResponse): MsgBatchUpdateOrdersResponseAmino {
    const obj: any = {};
    if (message.spotCancelSuccess) {
      obj.spot_cancel_success = message.spotCancelSuccess.map((e) => e);
    } else {
      obj.spot_cancel_success = message.spotCancelSuccess;
    }
    if (message.derivativeCancelSuccess) {
      obj.derivative_cancel_success = message.derivativeCancelSuccess.map((e) => e);
    } else {
      obj.derivative_cancel_success = message.derivativeCancelSuccess;
    }
    if (message.spotOrderHashes) {
      obj.spot_order_hashes = message.spotOrderHashes.map((e) => e);
    } else {
      obj.spot_order_hashes = message.spotOrderHashes;
    }
    if (message.derivativeOrderHashes) {
      obj.derivative_order_hashes = message.derivativeOrderHashes.map((e) => e);
    } else {
      obj.derivative_order_hashes = message.derivativeOrderHashes;
    }
    if (message.binaryOptionsCancelSuccess) {
      obj.binary_options_cancel_success = message.binaryOptionsCancelSuccess.map((e) => e);
    } else {
      obj.binary_options_cancel_success = message.binaryOptionsCancelSuccess;
    }
    if (message.binaryOptionsOrderHashes) {
      obj.binary_options_order_hashes = message.binaryOptionsOrderHashes.map((e) => e);
    } else {
      obj.binary_options_order_hashes = message.binaryOptionsOrderHashes;
    }
    if (message.createdSpotOrdersCids) {
      obj.created_spot_orders_cids = message.createdSpotOrdersCids.map((e) => e);
    } else {
      obj.created_spot_orders_cids = message.createdSpotOrdersCids;
    }
    if (message.failedSpotOrdersCids) {
      obj.failed_spot_orders_cids = message.failedSpotOrdersCids.map((e) => e);
    } else {
      obj.failed_spot_orders_cids = message.failedSpotOrdersCids;
    }
    if (message.createdDerivativeOrdersCids) {
      obj.created_derivative_orders_cids = message.createdDerivativeOrdersCids.map((e) => e);
    } else {
      obj.created_derivative_orders_cids = message.createdDerivativeOrdersCids;
    }
    if (message.failedDerivativeOrdersCids) {
      obj.failed_derivative_orders_cids = message.failedDerivativeOrdersCids.map((e) => e);
    } else {
      obj.failed_derivative_orders_cids = message.failedDerivativeOrdersCids;
    }
    if (message.createdBinaryOptionsOrdersCids) {
      obj.created_binary_options_orders_cids = message.createdBinaryOptionsOrdersCids.map((e) => e);
    } else {
      obj.created_binary_options_orders_cids = message.createdBinaryOptionsOrdersCids;
    }
    if (message.failedBinaryOptionsOrdersCids) {
      obj.failed_binary_options_orders_cids = message.failedBinaryOptionsOrdersCids.map((e) => e);
    } else {
      obj.failed_binary_options_orders_cids = message.failedBinaryOptionsOrdersCids;
    }
    return obj;
  },
  fromAminoMsg(object: MsgBatchUpdateOrdersResponseAminoMsg): MsgBatchUpdateOrdersResponse {
    return MsgBatchUpdateOrdersResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgBatchUpdateOrdersResponseProtoMsg): MsgBatchUpdateOrdersResponse {
    return MsgBatchUpdateOrdersResponse.decode(message.value);
  },
  toProto(message: MsgBatchUpdateOrdersResponse): Uint8Array {
    return MsgBatchUpdateOrdersResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgBatchUpdateOrdersResponse): MsgBatchUpdateOrdersResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgBatchUpdateOrdersResponse',
      value: MsgBatchUpdateOrdersResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateDerivativeMarketOrder(): MsgCreateDerivativeMarketOrder {
  return {
    sender: '',
    order: DerivativeOrder.fromPartial({}),
  };
}
export const MsgCreateDerivativeMarketOrder = {
  typeUrl: '/injective.exchange.v1beta1.MsgCreateDerivativeMarketOrder',
  encode(message: MsgCreateDerivativeMarketOrder, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.order !== undefined) {
      DerivativeOrder.encode(message.order, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateDerivativeMarketOrder {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateDerivativeMarketOrder();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.order = DerivativeOrder.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCreateDerivativeMarketOrder>): MsgCreateDerivativeMarketOrder {
    const message = createBaseMsgCreateDerivativeMarketOrder();
    message.sender = object.sender ?? '';
    message.order =
      object.order !== undefined && object.order !== null ? DerivativeOrder.fromPartial(object.order) : undefined;
    return message;
  },
  fromAmino(object: MsgCreateDerivativeMarketOrderAmino): MsgCreateDerivativeMarketOrder {
    const message = createBaseMsgCreateDerivativeMarketOrder();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.order !== undefined && object.order !== null) {
      message.order = DerivativeOrder.fromAmino(object.order);
    }
    return message;
  },
  toAmino(message: MsgCreateDerivativeMarketOrder): MsgCreateDerivativeMarketOrderAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.order = message.order ? DerivativeOrder.toAmino(message.order) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgCreateDerivativeMarketOrderAminoMsg): MsgCreateDerivativeMarketOrder {
    return MsgCreateDerivativeMarketOrder.fromAmino(object.value);
  },
  toAminoMsg(message: MsgCreateDerivativeMarketOrder): MsgCreateDerivativeMarketOrderAminoMsg {
    return {
      type: 'exchange/MsgCreateDerivativeMarketOrder',
      value: MsgCreateDerivativeMarketOrder.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgCreateDerivativeMarketOrderProtoMsg): MsgCreateDerivativeMarketOrder {
    return MsgCreateDerivativeMarketOrder.decode(message.value);
  },
  toProto(message: MsgCreateDerivativeMarketOrder): Uint8Array {
    return MsgCreateDerivativeMarketOrder.encode(message).finish();
  },
  toProtoMsg(message: MsgCreateDerivativeMarketOrder): MsgCreateDerivativeMarketOrderProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgCreateDerivativeMarketOrder',
      value: MsgCreateDerivativeMarketOrder.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateDerivativeMarketOrderResponse(): MsgCreateDerivativeMarketOrderResponse {
  return {
    orderHash: '',
    results: undefined,
    cid: '',
  };
}
export const MsgCreateDerivativeMarketOrderResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgCreateDerivativeMarketOrderResponse',
  encode(message: MsgCreateDerivativeMarketOrderResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.orderHash !== '') {
      writer.uint32(10).string(message.orderHash);
    }
    if (message.results !== undefined) {
      DerivativeMarketOrderResults.encode(message.results, writer.uint32(18).fork()).ldelim();
    }
    if (message.cid !== '') {
      writer.uint32(26).string(message.cid);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateDerivativeMarketOrderResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateDerivativeMarketOrderResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.orderHash = reader.string();
          break;
        case 2:
          message.results = DerivativeMarketOrderResults.decode(reader, reader.uint32());
          break;
        case 3:
          message.cid = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCreateDerivativeMarketOrderResponse>): MsgCreateDerivativeMarketOrderResponse {
    const message = createBaseMsgCreateDerivativeMarketOrderResponse();
    message.orderHash = object.orderHash ?? '';
    message.results =
      object.results !== undefined && object.results !== null
        ? DerivativeMarketOrderResults.fromPartial(object.results)
        : undefined;
    message.cid = object.cid ?? '';
    return message;
  },
  fromAmino(object: MsgCreateDerivativeMarketOrderResponseAmino): MsgCreateDerivativeMarketOrderResponse {
    const message = createBaseMsgCreateDerivativeMarketOrderResponse();
    if (object.order_hash !== undefined && object.order_hash !== null) {
      message.orderHash = object.order_hash;
    }
    if (object.results !== undefined && object.results !== null) {
      message.results = DerivativeMarketOrderResults.fromAmino(object.results);
    }
    if (object.cid !== undefined && object.cid !== null) {
      message.cid = object.cid;
    }
    return message;
  },
  toAmino(message: MsgCreateDerivativeMarketOrderResponse): MsgCreateDerivativeMarketOrderResponseAmino {
    const obj: any = {};
    obj.order_hash = message.orderHash === '' ? undefined : message.orderHash;
    obj.results = message.results ? DerivativeMarketOrderResults.toAmino(message.results) : undefined;
    obj.cid = message.cid === '' ? undefined : message.cid;
    return obj;
  },
  fromAminoMsg(object: MsgCreateDerivativeMarketOrderResponseAminoMsg): MsgCreateDerivativeMarketOrderResponse {
    return MsgCreateDerivativeMarketOrderResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgCreateDerivativeMarketOrderResponseProtoMsg): MsgCreateDerivativeMarketOrderResponse {
    return MsgCreateDerivativeMarketOrderResponse.decode(message.value);
  },
  toProto(message: MsgCreateDerivativeMarketOrderResponse): Uint8Array {
    return MsgCreateDerivativeMarketOrderResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgCreateDerivativeMarketOrderResponse): MsgCreateDerivativeMarketOrderResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgCreateDerivativeMarketOrderResponse',
      value: MsgCreateDerivativeMarketOrderResponse.encode(message).finish(),
    };
  },
};
function createBaseDerivativeMarketOrderResults(): DerivativeMarketOrderResults {
  return {
    quantity: '',
    price: '',
    fee: '',
    positionDelta: PositionDelta.fromPartial({}),
    payout: '',
  };
}
export const DerivativeMarketOrderResults = {
  typeUrl: '/injective.exchange.v1beta1.DerivativeMarketOrderResults',
  encode(message: DerivativeMarketOrderResults, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.quantity !== '') {
      writer.uint32(10).string(Decimal.fromUserInput(message.quantity, 18).atomics);
    }
    if (message.price !== '') {
      writer.uint32(18).string(Decimal.fromUserInput(message.price, 18).atomics);
    }
    if (message.fee !== '') {
      writer.uint32(26).string(Decimal.fromUserInput(message.fee, 18).atomics);
    }
    if (message.positionDelta !== undefined) {
      PositionDelta.encode(message.positionDelta, writer.uint32(34).fork()).ldelim();
    }
    if (message.payout !== '') {
      writer.uint32(42).string(Decimal.fromUserInput(message.payout, 18).atomics);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): DerivativeMarketOrderResults {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDerivativeMarketOrderResults();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.quantity = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 2:
          message.price = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 3:
          message.fee = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 4:
          message.positionDelta = PositionDelta.decode(reader, reader.uint32());
          break;
        case 5:
          message.payout = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<DerivativeMarketOrderResults>): DerivativeMarketOrderResults {
    const message = createBaseDerivativeMarketOrderResults();
    message.quantity = object.quantity ?? '';
    message.price = object.price ?? '';
    message.fee = object.fee ?? '';
    message.positionDelta =
      object.positionDelta !== undefined && object.positionDelta !== null
        ? PositionDelta.fromPartial(object.positionDelta)
        : undefined;
    message.payout = object.payout ?? '';
    return message;
  },
  fromAmino(object: DerivativeMarketOrderResultsAmino): DerivativeMarketOrderResults {
    const message = createBaseDerivativeMarketOrderResults();
    if (object.quantity !== undefined && object.quantity !== null) {
      message.quantity = object.quantity;
    }
    if (object.price !== undefined && object.price !== null) {
      message.price = object.price;
    }
    if (object.fee !== undefined && object.fee !== null) {
      message.fee = object.fee;
    }
    if (object.position_delta !== undefined && object.position_delta !== null) {
      message.positionDelta = PositionDelta.fromAmino(object.position_delta);
    }
    if (object.payout !== undefined && object.payout !== null) {
      message.payout = object.payout;
    }
    return message;
  },
  toAmino(message: DerivativeMarketOrderResults): DerivativeMarketOrderResultsAmino {
    const obj: any = {};
    obj.quantity = message.quantity === '' ? undefined : message.quantity;
    obj.price = message.price === '' ? undefined : message.price;
    obj.fee = message.fee === '' ? undefined : message.fee;
    obj.position_delta = message.positionDelta ? PositionDelta.toAmino(message.positionDelta) : undefined;
    obj.payout = message.payout === '' ? undefined : message.payout;
    return obj;
  },
  fromAminoMsg(object: DerivativeMarketOrderResultsAminoMsg): DerivativeMarketOrderResults {
    return DerivativeMarketOrderResults.fromAmino(object.value);
  },
  fromProtoMsg(message: DerivativeMarketOrderResultsProtoMsg): DerivativeMarketOrderResults {
    return DerivativeMarketOrderResults.decode(message.value);
  },
  toProto(message: DerivativeMarketOrderResults): Uint8Array {
    return DerivativeMarketOrderResults.encode(message).finish();
  },
  toProtoMsg(message: DerivativeMarketOrderResults): DerivativeMarketOrderResultsProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.DerivativeMarketOrderResults',
      value: DerivativeMarketOrderResults.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateBinaryOptionsMarketOrder(): MsgCreateBinaryOptionsMarketOrder {
  return {
    sender: '',
    order: DerivativeOrder.fromPartial({}),
  };
}
export const MsgCreateBinaryOptionsMarketOrder = {
  typeUrl: '/injective.exchange.v1beta1.MsgCreateBinaryOptionsMarketOrder',
  encode(message: MsgCreateBinaryOptionsMarketOrder, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.order !== undefined) {
      DerivativeOrder.encode(message.order, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateBinaryOptionsMarketOrder {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateBinaryOptionsMarketOrder();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.order = DerivativeOrder.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCreateBinaryOptionsMarketOrder>): MsgCreateBinaryOptionsMarketOrder {
    const message = createBaseMsgCreateBinaryOptionsMarketOrder();
    message.sender = object.sender ?? '';
    message.order =
      object.order !== undefined && object.order !== null ? DerivativeOrder.fromPartial(object.order) : undefined;
    return message;
  },
  fromAmino(object: MsgCreateBinaryOptionsMarketOrderAmino): MsgCreateBinaryOptionsMarketOrder {
    const message = createBaseMsgCreateBinaryOptionsMarketOrder();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.order !== undefined && object.order !== null) {
      message.order = DerivativeOrder.fromAmino(object.order);
    }
    return message;
  },
  toAmino(message: MsgCreateBinaryOptionsMarketOrder): MsgCreateBinaryOptionsMarketOrderAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.order = message.order ? DerivativeOrder.toAmino(message.order) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgCreateBinaryOptionsMarketOrderAminoMsg): MsgCreateBinaryOptionsMarketOrder {
    return MsgCreateBinaryOptionsMarketOrder.fromAmino(object.value);
  },
  toAminoMsg(message: MsgCreateBinaryOptionsMarketOrder): MsgCreateBinaryOptionsMarketOrderAminoMsg {
    return {
      type: 'exchange/MsgCreateBinaryOptionsMarketOrder',
      value: MsgCreateBinaryOptionsMarketOrder.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgCreateBinaryOptionsMarketOrderProtoMsg): MsgCreateBinaryOptionsMarketOrder {
    return MsgCreateBinaryOptionsMarketOrder.decode(message.value);
  },
  toProto(message: MsgCreateBinaryOptionsMarketOrder): Uint8Array {
    return MsgCreateBinaryOptionsMarketOrder.encode(message).finish();
  },
  toProtoMsg(message: MsgCreateBinaryOptionsMarketOrder): MsgCreateBinaryOptionsMarketOrderProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgCreateBinaryOptionsMarketOrder',
      value: MsgCreateBinaryOptionsMarketOrder.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateBinaryOptionsMarketOrderResponse(): MsgCreateBinaryOptionsMarketOrderResponse {
  return {
    orderHash: '',
    results: undefined,
    cid: '',
  };
}
export const MsgCreateBinaryOptionsMarketOrderResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgCreateBinaryOptionsMarketOrderResponse',
  encode(
    message: MsgCreateBinaryOptionsMarketOrderResponse,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.orderHash !== '') {
      writer.uint32(10).string(message.orderHash);
    }
    if (message.results !== undefined) {
      DerivativeMarketOrderResults.encode(message.results, writer.uint32(18).fork()).ldelim();
    }
    if (message.cid !== '') {
      writer.uint32(26).string(message.cid);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateBinaryOptionsMarketOrderResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateBinaryOptionsMarketOrderResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.orderHash = reader.string();
          break;
        case 2:
          message.results = DerivativeMarketOrderResults.decode(reader, reader.uint32());
          break;
        case 3:
          message.cid = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCreateBinaryOptionsMarketOrderResponse>): MsgCreateBinaryOptionsMarketOrderResponse {
    const message = createBaseMsgCreateBinaryOptionsMarketOrderResponse();
    message.orderHash = object.orderHash ?? '';
    message.results =
      object.results !== undefined && object.results !== null
        ? DerivativeMarketOrderResults.fromPartial(object.results)
        : undefined;
    message.cid = object.cid ?? '';
    return message;
  },
  fromAmino(object: MsgCreateBinaryOptionsMarketOrderResponseAmino): MsgCreateBinaryOptionsMarketOrderResponse {
    const message = createBaseMsgCreateBinaryOptionsMarketOrderResponse();
    if (object.order_hash !== undefined && object.order_hash !== null) {
      message.orderHash = object.order_hash;
    }
    if (object.results !== undefined && object.results !== null) {
      message.results = DerivativeMarketOrderResults.fromAmino(object.results);
    }
    if (object.cid !== undefined && object.cid !== null) {
      message.cid = object.cid;
    }
    return message;
  },
  toAmino(message: MsgCreateBinaryOptionsMarketOrderResponse): MsgCreateBinaryOptionsMarketOrderResponseAmino {
    const obj: any = {};
    obj.order_hash = message.orderHash === '' ? undefined : message.orderHash;
    obj.results = message.results ? DerivativeMarketOrderResults.toAmino(message.results) : undefined;
    obj.cid = message.cid === '' ? undefined : message.cid;
    return obj;
  },
  fromAminoMsg(object: MsgCreateBinaryOptionsMarketOrderResponseAminoMsg): MsgCreateBinaryOptionsMarketOrderResponse {
    return MsgCreateBinaryOptionsMarketOrderResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgCreateBinaryOptionsMarketOrderResponseProtoMsg): MsgCreateBinaryOptionsMarketOrderResponse {
    return MsgCreateBinaryOptionsMarketOrderResponse.decode(message.value);
  },
  toProto(message: MsgCreateBinaryOptionsMarketOrderResponse): Uint8Array {
    return MsgCreateBinaryOptionsMarketOrderResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgCreateBinaryOptionsMarketOrderResponse): MsgCreateBinaryOptionsMarketOrderResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgCreateBinaryOptionsMarketOrderResponse',
      value: MsgCreateBinaryOptionsMarketOrderResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgCancelDerivativeOrder(): MsgCancelDerivativeOrder {
  return {
    sender: '',
    marketId: '',
    subaccountId: '',
    orderHash: '',
    orderMask: 0,
    cid: '',
  };
}
export const MsgCancelDerivativeOrder = {
  typeUrl: '/injective.exchange.v1beta1.MsgCancelDerivativeOrder',
  encode(message: MsgCancelDerivativeOrder, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.marketId !== '') {
      writer.uint32(18).string(message.marketId);
    }
    if (message.subaccountId !== '') {
      writer.uint32(26).string(message.subaccountId);
    }
    if (message.orderHash !== '') {
      writer.uint32(34).string(message.orderHash);
    }
    if (message.orderMask !== 0) {
      writer.uint32(40).int32(message.orderMask);
    }
    if (message.cid !== '') {
      writer.uint32(50).string(message.cid);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCancelDerivativeOrder {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCancelDerivativeOrder();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.marketId = reader.string();
          break;
        case 3:
          message.subaccountId = reader.string();
          break;
        case 4:
          message.orderHash = reader.string();
          break;
        case 5:
          message.orderMask = reader.int32();
          break;
        case 6:
          message.cid = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCancelDerivativeOrder>): MsgCancelDerivativeOrder {
    const message = createBaseMsgCancelDerivativeOrder();
    message.sender = object.sender ?? '';
    message.marketId = object.marketId ?? '';
    message.subaccountId = object.subaccountId ?? '';
    message.orderHash = object.orderHash ?? '';
    message.orderMask = object.orderMask ?? 0;
    message.cid = object.cid ?? '';
    return message;
  },
  fromAmino(object: MsgCancelDerivativeOrderAmino): MsgCancelDerivativeOrder {
    const message = createBaseMsgCancelDerivativeOrder();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.market_id !== undefined && object.market_id !== null) {
      message.marketId = object.market_id;
    }
    if (object.subaccount_id !== undefined && object.subaccount_id !== null) {
      message.subaccountId = object.subaccount_id;
    }
    if (object.order_hash !== undefined && object.order_hash !== null) {
      message.orderHash = object.order_hash;
    }
    if (object.order_mask !== undefined && object.order_mask !== null) {
      message.orderMask = object.order_mask;
    }
    if (object.cid !== undefined && object.cid !== null) {
      message.cid = object.cid;
    }
    return message;
  },
  toAmino(message: MsgCancelDerivativeOrder): MsgCancelDerivativeOrderAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.market_id = message.marketId === '' ? undefined : message.marketId;
    obj.subaccount_id = message.subaccountId === '' ? undefined : message.subaccountId;
    obj.order_hash = message.orderHash === '' ? undefined : message.orderHash;
    obj.order_mask = message.orderMask === 0 ? undefined : message.orderMask;
    obj.cid = message.cid === '' ? undefined : message.cid;
    return obj;
  },
  fromAminoMsg(object: MsgCancelDerivativeOrderAminoMsg): MsgCancelDerivativeOrder {
    return MsgCancelDerivativeOrder.fromAmino(object.value);
  },
  toAminoMsg(message: MsgCancelDerivativeOrder): MsgCancelDerivativeOrderAminoMsg {
    return {
      type: 'exchange/MsgCancelDerivativeOrder',
      value: MsgCancelDerivativeOrder.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgCancelDerivativeOrderProtoMsg): MsgCancelDerivativeOrder {
    return MsgCancelDerivativeOrder.decode(message.value);
  },
  toProto(message: MsgCancelDerivativeOrder): Uint8Array {
    return MsgCancelDerivativeOrder.encode(message).finish();
  },
  toProtoMsg(message: MsgCancelDerivativeOrder): MsgCancelDerivativeOrderProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgCancelDerivativeOrder',
      value: MsgCancelDerivativeOrder.encode(message).finish(),
    };
  },
};
function createBaseMsgCancelDerivativeOrderResponse(): MsgCancelDerivativeOrderResponse {
  return {};
}
export const MsgCancelDerivativeOrderResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgCancelDerivativeOrderResponse',
  encode(_: MsgCancelDerivativeOrderResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCancelDerivativeOrderResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCancelDerivativeOrderResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgCancelDerivativeOrderResponse>): MsgCancelDerivativeOrderResponse {
    const message = createBaseMsgCancelDerivativeOrderResponse();
    return message;
  },
  fromAmino(_: MsgCancelDerivativeOrderResponseAmino): MsgCancelDerivativeOrderResponse {
    const message = createBaseMsgCancelDerivativeOrderResponse();
    return message;
  },
  toAmino(_: MsgCancelDerivativeOrderResponse): MsgCancelDerivativeOrderResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgCancelDerivativeOrderResponseAminoMsg): MsgCancelDerivativeOrderResponse {
    return MsgCancelDerivativeOrderResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgCancelDerivativeOrderResponseProtoMsg): MsgCancelDerivativeOrderResponse {
    return MsgCancelDerivativeOrderResponse.decode(message.value);
  },
  toProto(message: MsgCancelDerivativeOrderResponse): Uint8Array {
    return MsgCancelDerivativeOrderResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgCancelDerivativeOrderResponse): MsgCancelDerivativeOrderResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgCancelDerivativeOrderResponse',
      value: MsgCancelDerivativeOrderResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgCancelBinaryOptionsOrder(): MsgCancelBinaryOptionsOrder {
  return {
    sender: '',
    marketId: '',
    subaccountId: '',
    orderHash: '',
    orderMask: 0,
    cid: '',
  };
}
export const MsgCancelBinaryOptionsOrder = {
  typeUrl: '/injective.exchange.v1beta1.MsgCancelBinaryOptionsOrder',
  encode(message: MsgCancelBinaryOptionsOrder, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.marketId !== '') {
      writer.uint32(18).string(message.marketId);
    }
    if (message.subaccountId !== '') {
      writer.uint32(26).string(message.subaccountId);
    }
    if (message.orderHash !== '') {
      writer.uint32(34).string(message.orderHash);
    }
    if (message.orderMask !== 0) {
      writer.uint32(40).int32(message.orderMask);
    }
    if (message.cid !== '') {
      writer.uint32(50).string(message.cid);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCancelBinaryOptionsOrder {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCancelBinaryOptionsOrder();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.marketId = reader.string();
          break;
        case 3:
          message.subaccountId = reader.string();
          break;
        case 4:
          message.orderHash = reader.string();
          break;
        case 5:
          message.orderMask = reader.int32();
          break;
        case 6:
          message.cid = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCancelBinaryOptionsOrder>): MsgCancelBinaryOptionsOrder {
    const message = createBaseMsgCancelBinaryOptionsOrder();
    message.sender = object.sender ?? '';
    message.marketId = object.marketId ?? '';
    message.subaccountId = object.subaccountId ?? '';
    message.orderHash = object.orderHash ?? '';
    message.orderMask = object.orderMask ?? 0;
    message.cid = object.cid ?? '';
    return message;
  },
  fromAmino(object: MsgCancelBinaryOptionsOrderAmino): MsgCancelBinaryOptionsOrder {
    const message = createBaseMsgCancelBinaryOptionsOrder();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.market_id !== undefined && object.market_id !== null) {
      message.marketId = object.market_id;
    }
    if (object.subaccount_id !== undefined && object.subaccount_id !== null) {
      message.subaccountId = object.subaccount_id;
    }
    if (object.order_hash !== undefined && object.order_hash !== null) {
      message.orderHash = object.order_hash;
    }
    if (object.order_mask !== undefined && object.order_mask !== null) {
      message.orderMask = object.order_mask;
    }
    if (object.cid !== undefined && object.cid !== null) {
      message.cid = object.cid;
    }
    return message;
  },
  toAmino(message: MsgCancelBinaryOptionsOrder): MsgCancelBinaryOptionsOrderAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.market_id = message.marketId === '' ? undefined : message.marketId;
    obj.subaccount_id = message.subaccountId === '' ? undefined : message.subaccountId;
    obj.order_hash = message.orderHash === '' ? undefined : message.orderHash;
    obj.order_mask = message.orderMask === 0 ? undefined : message.orderMask;
    obj.cid = message.cid === '' ? undefined : message.cid;
    return obj;
  },
  fromAminoMsg(object: MsgCancelBinaryOptionsOrderAminoMsg): MsgCancelBinaryOptionsOrder {
    return MsgCancelBinaryOptionsOrder.fromAmino(object.value);
  },
  toAminoMsg(message: MsgCancelBinaryOptionsOrder): MsgCancelBinaryOptionsOrderAminoMsg {
    return {
      type: 'exchange/MsgCancelBinaryOptionsOrder',
      value: MsgCancelBinaryOptionsOrder.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgCancelBinaryOptionsOrderProtoMsg): MsgCancelBinaryOptionsOrder {
    return MsgCancelBinaryOptionsOrder.decode(message.value);
  },
  toProto(message: MsgCancelBinaryOptionsOrder): Uint8Array {
    return MsgCancelBinaryOptionsOrder.encode(message).finish();
  },
  toProtoMsg(message: MsgCancelBinaryOptionsOrder): MsgCancelBinaryOptionsOrderProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgCancelBinaryOptionsOrder',
      value: MsgCancelBinaryOptionsOrder.encode(message).finish(),
    };
  },
};
function createBaseMsgCancelBinaryOptionsOrderResponse(): MsgCancelBinaryOptionsOrderResponse {
  return {};
}
export const MsgCancelBinaryOptionsOrderResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgCancelBinaryOptionsOrderResponse',
  encode(_: MsgCancelBinaryOptionsOrderResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCancelBinaryOptionsOrderResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCancelBinaryOptionsOrderResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgCancelBinaryOptionsOrderResponse>): MsgCancelBinaryOptionsOrderResponse {
    const message = createBaseMsgCancelBinaryOptionsOrderResponse();
    return message;
  },
  fromAmino(_: MsgCancelBinaryOptionsOrderResponseAmino): MsgCancelBinaryOptionsOrderResponse {
    const message = createBaseMsgCancelBinaryOptionsOrderResponse();
    return message;
  },
  toAmino(_: MsgCancelBinaryOptionsOrderResponse): MsgCancelBinaryOptionsOrderResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgCancelBinaryOptionsOrderResponseAminoMsg): MsgCancelBinaryOptionsOrderResponse {
    return MsgCancelBinaryOptionsOrderResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgCancelBinaryOptionsOrderResponseProtoMsg): MsgCancelBinaryOptionsOrderResponse {
    return MsgCancelBinaryOptionsOrderResponse.decode(message.value);
  },
  toProto(message: MsgCancelBinaryOptionsOrderResponse): Uint8Array {
    return MsgCancelBinaryOptionsOrderResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgCancelBinaryOptionsOrderResponse): MsgCancelBinaryOptionsOrderResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgCancelBinaryOptionsOrderResponse',
      value: MsgCancelBinaryOptionsOrderResponse.encode(message).finish(),
    };
  },
};
function createBaseOrderData(): OrderData {
  return {
    marketId: '',
    subaccountId: '',
    orderHash: '',
    orderMask: 0,
    cid: '',
  };
}
export const OrderData = {
  typeUrl: '/injective.exchange.v1beta1.OrderData',
  encode(message: OrderData, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.marketId !== '') {
      writer.uint32(10).string(message.marketId);
    }
    if (message.subaccountId !== '') {
      writer.uint32(18).string(message.subaccountId);
    }
    if (message.orderHash !== '') {
      writer.uint32(26).string(message.orderHash);
    }
    if (message.orderMask !== 0) {
      writer.uint32(32).int32(message.orderMask);
    }
    if (message.cid !== '') {
      writer.uint32(42).string(message.cid);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): OrderData {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOrderData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.marketId = reader.string();
          break;
        case 2:
          message.subaccountId = reader.string();
          break;
        case 3:
          message.orderHash = reader.string();
          break;
        case 4:
          message.orderMask = reader.int32();
          break;
        case 5:
          message.cid = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<OrderData>): OrderData {
    const message = createBaseOrderData();
    message.marketId = object.marketId ?? '';
    message.subaccountId = object.subaccountId ?? '';
    message.orderHash = object.orderHash ?? '';
    message.orderMask = object.orderMask ?? 0;
    message.cid = object.cid ?? '';
    return message;
  },
  fromAmino(object: OrderDataAmino): OrderData {
    const message = createBaseOrderData();
    if (object.market_id !== undefined && object.market_id !== null) {
      message.marketId = object.market_id;
    }
    if (object.subaccount_id !== undefined && object.subaccount_id !== null) {
      message.subaccountId = object.subaccount_id;
    }
    if (object.order_hash !== undefined && object.order_hash !== null) {
      message.orderHash = object.order_hash;
    }
    if (object.order_mask !== undefined && object.order_mask !== null) {
      message.orderMask = object.order_mask;
    }
    if (object.cid !== undefined && object.cid !== null) {
      message.cid = object.cid;
    }
    return message;
  },
  toAmino(message: OrderData): OrderDataAmino {
    const obj: any = {};
    obj.market_id = message.marketId === '' ? undefined : message.marketId;
    obj.subaccount_id = message.subaccountId === '' ? undefined : message.subaccountId;
    obj.order_hash = message.orderHash === '' ? undefined : message.orderHash;
    obj.order_mask = message.orderMask === 0 ? undefined : message.orderMask;
    obj.cid = message.cid === '' ? undefined : message.cid;
    return obj;
  },
  fromAminoMsg(object: OrderDataAminoMsg): OrderData {
    return OrderData.fromAmino(object.value);
  },
  fromProtoMsg(message: OrderDataProtoMsg): OrderData {
    return OrderData.decode(message.value);
  },
  toProto(message: OrderData): Uint8Array {
    return OrderData.encode(message).finish();
  },
  toProtoMsg(message: OrderData): OrderDataProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.OrderData',
      value: OrderData.encode(message).finish(),
    };
  },
};
function createBaseMsgBatchCancelDerivativeOrders(): MsgBatchCancelDerivativeOrders {
  return {
    sender: '',
    data: [],
  };
}
export const MsgBatchCancelDerivativeOrders = {
  typeUrl: '/injective.exchange.v1beta1.MsgBatchCancelDerivativeOrders',
  encode(message: MsgBatchCancelDerivativeOrders, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    for (const v of message.data) {
      OrderData.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgBatchCancelDerivativeOrders {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBatchCancelDerivativeOrders();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.data.push(OrderData.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgBatchCancelDerivativeOrders>): MsgBatchCancelDerivativeOrders {
    const message = createBaseMsgBatchCancelDerivativeOrders();
    message.sender = object.sender ?? '';
    message.data = object.data?.map((e) => OrderData.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: MsgBatchCancelDerivativeOrdersAmino): MsgBatchCancelDerivativeOrders {
    const message = createBaseMsgBatchCancelDerivativeOrders();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    message.data = object.data?.map((e) => OrderData.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: MsgBatchCancelDerivativeOrders): MsgBatchCancelDerivativeOrdersAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    if (message.data) {
      obj.data = message.data.map((e) => (e ? OrderData.toAmino(e) : undefined));
    } else {
      obj.data = message.data;
    }
    return obj;
  },
  fromAminoMsg(object: MsgBatchCancelDerivativeOrdersAminoMsg): MsgBatchCancelDerivativeOrders {
    return MsgBatchCancelDerivativeOrders.fromAmino(object.value);
  },
  toAminoMsg(message: MsgBatchCancelDerivativeOrders): MsgBatchCancelDerivativeOrdersAminoMsg {
    return {
      type: 'exchange/MsgBatchCancelDerivativeOrders',
      value: MsgBatchCancelDerivativeOrders.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgBatchCancelDerivativeOrdersProtoMsg): MsgBatchCancelDerivativeOrders {
    return MsgBatchCancelDerivativeOrders.decode(message.value);
  },
  toProto(message: MsgBatchCancelDerivativeOrders): Uint8Array {
    return MsgBatchCancelDerivativeOrders.encode(message).finish();
  },
  toProtoMsg(message: MsgBatchCancelDerivativeOrders): MsgBatchCancelDerivativeOrdersProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgBatchCancelDerivativeOrders',
      value: MsgBatchCancelDerivativeOrders.encode(message).finish(),
    };
  },
};
function createBaseMsgBatchCancelDerivativeOrdersResponse(): MsgBatchCancelDerivativeOrdersResponse {
  return {
    success: [],
  };
}
export const MsgBatchCancelDerivativeOrdersResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgBatchCancelDerivativeOrdersResponse',
  encode(message: MsgBatchCancelDerivativeOrdersResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    writer.uint32(10).fork();
    for (const v of message.success) {
      writer.bool(v);
    }
    writer.ldelim();
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgBatchCancelDerivativeOrdersResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBatchCancelDerivativeOrdersResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.success.push(reader.bool());
            }
          } else {
            message.success.push(reader.bool());
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgBatchCancelDerivativeOrdersResponse>): MsgBatchCancelDerivativeOrdersResponse {
    const message = createBaseMsgBatchCancelDerivativeOrdersResponse();
    message.success = object.success?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: MsgBatchCancelDerivativeOrdersResponseAmino): MsgBatchCancelDerivativeOrdersResponse {
    const message = createBaseMsgBatchCancelDerivativeOrdersResponse();
    message.success = object.success?.map((e) => e) || [];
    return message;
  },
  toAmino(message: MsgBatchCancelDerivativeOrdersResponse): MsgBatchCancelDerivativeOrdersResponseAmino {
    const obj: any = {};
    if (message.success) {
      obj.success = message.success.map((e) => e);
    } else {
      obj.success = message.success;
    }
    return obj;
  },
  fromAminoMsg(object: MsgBatchCancelDerivativeOrdersResponseAminoMsg): MsgBatchCancelDerivativeOrdersResponse {
    return MsgBatchCancelDerivativeOrdersResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgBatchCancelDerivativeOrdersResponseProtoMsg): MsgBatchCancelDerivativeOrdersResponse {
    return MsgBatchCancelDerivativeOrdersResponse.decode(message.value);
  },
  toProto(message: MsgBatchCancelDerivativeOrdersResponse): Uint8Array {
    return MsgBatchCancelDerivativeOrdersResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgBatchCancelDerivativeOrdersResponse): MsgBatchCancelDerivativeOrdersResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgBatchCancelDerivativeOrdersResponse',
      value: MsgBatchCancelDerivativeOrdersResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgSubaccountTransfer(): MsgSubaccountTransfer {
  return {
    sender: '',
    sourceSubaccountId: '',
    destinationSubaccountId: '',
    amount: Coin.fromPartial({}),
  };
}
export const MsgSubaccountTransfer = {
  typeUrl: '/injective.exchange.v1beta1.MsgSubaccountTransfer',
  encode(message: MsgSubaccountTransfer, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.sourceSubaccountId !== '') {
      writer.uint32(18).string(message.sourceSubaccountId);
    }
    if (message.destinationSubaccountId !== '') {
      writer.uint32(26).string(message.destinationSubaccountId);
    }
    if (message.amount !== undefined) {
      Coin.encode(message.amount, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgSubaccountTransfer {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSubaccountTransfer();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.sourceSubaccountId = reader.string();
          break;
        case 3:
          message.destinationSubaccountId = reader.string();
          break;
        case 4:
          message.amount = Coin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgSubaccountTransfer>): MsgSubaccountTransfer {
    const message = createBaseMsgSubaccountTransfer();
    message.sender = object.sender ?? '';
    message.sourceSubaccountId = object.sourceSubaccountId ?? '';
    message.destinationSubaccountId = object.destinationSubaccountId ?? '';
    message.amount =
      object.amount !== undefined && object.amount !== null ? Coin.fromPartial(object.amount) : undefined;
    return message;
  },
  fromAmino(object: MsgSubaccountTransferAmino): MsgSubaccountTransfer {
    const message = createBaseMsgSubaccountTransfer();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.source_subaccount_id !== undefined && object.source_subaccount_id !== null) {
      message.sourceSubaccountId = object.source_subaccount_id;
    }
    if (object.destination_subaccount_id !== undefined && object.destination_subaccount_id !== null) {
      message.destinationSubaccountId = object.destination_subaccount_id;
    }
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = Coin.fromAmino(object.amount);
    }
    return message;
  },
  toAmino(message: MsgSubaccountTransfer): MsgSubaccountTransferAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.source_subaccount_id = message.sourceSubaccountId === '' ? undefined : message.sourceSubaccountId;
    obj.destination_subaccount_id =
      message.destinationSubaccountId === '' ? undefined : message.destinationSubaccountId;
    obj.amount = message.amount ? Coin.toAmino(message.amount) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgSubaccountTransferAminoMsg): MsgSubaccountTransfer {
    return MsgSubaccountTransfer.fromAmino(object.value);
  },
  toAminoMsg(message: MsgSubaccountTransfer): MsgSubaccountTransferAminoMsg {
    return {
      type: 'exchange/MsgSubaccountTransfer',
      value: MsgSubaccountTransfer.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgSubaccountTransferProtoMsg): MsgSubaccountTransfer {
    return MsgSubaccountTransfer.decode(message.value);
  },
  toProto(message: MsgSubaccountTransfer): Uint8Array {
    return MsgSubaccountTransfer.encode(message).finish();
  },
  toProtoMsg(message: MsgSubaccountTransfer): MsgSubaccountTransferProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgSubaccountTransfer',
      value: MsgSubaccountTransfer.encode(message).finish(),
    };
  },
};
function createBaseMsgSubaccountTransferResponse(): MsgSubaccountTransferResponse {
  return {};
}
export const MsgSubaccountTransferResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgSubaccountTransferResponse',
  encode(_: MsgSubaccountTransferResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgSubaccountTransferResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSubaccountTransferResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgSubaccountTransferResponse>): MsgSubaccountTransferResponse {
    const message = createBaseMsgSubaccountTransferResponse();
    return message;
  },
  fromAmino(_: MsgSubaccountTransferResponseAmino): MsgSubaccountTransferResponse {
    const message = createBaseMsgSubaccountTransferResponse();
    return message;
  },
  toAmino(_: MsgSubaccountTransferResponse): MsgSubaccountTransferResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgSubaccountTransferResponseAminoMsg): MsgSubaccountTransferResponse {
    return MsgSubaccountTransferResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgSubaccountTransferResponseProtoMsg): MsgSubaccountTransferResponse {
    return MsgSubaccountTransferResponse.decode(message.value);
  },
  toProto(message: MsgSubaccountTransferResponse): Uint8Array {
    return MsgSubaccountTransferResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgSubaccountTransferResponse): MsgSubaccountTransferResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgSubaccountTransferResponse',
      value: MsgSubaccountTransferResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgExternalTransfer(): MsgExternalTransfer {
  return {
    sender: '',
    sourceSubaccountId: '',
    destinationSubaccountId: '',
    amount: Coin.fromPartial({}),
  };
}
export const MsgExternalTransfer = {
  typeUrl: '/injective.exchange.v1beta1.MsgExternalTransfer',
  encode(message: MsgExternalTransfer, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.sourceSubaccountId !== '') {
      writer.uint32(18).string(message.sourceSubaccountId);
    }
    if (message.destinationSubaccountId !== '') {
      writer.uint32(26).string(message.destinationSubaccountId);
    }
    if (message.amount !== undefined) {
      Coin.encode(message.amount, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgExternalTransfer {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgExternalTransfer();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.sourceSubaccountId = reader.string();
          break;
        case 3:
          message.destinationSubaccountId = reader.string();
          break;
        case 4:
          message.amount = Coin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgExternalTransfer>): MsgExternalTransfer {
    const message = createBaseMsgExternalTransfer();
    message.sender = object.sender ?? '';
    message.sourceSubaccountId = object.sourceSubaccountId ?? '';
    message.destinationSubaccountId = object.destinationSubaccountId ?? '';
    message.amount =
      object.amount !== undefined && object.amount !== null ? Coin.fromPartial(object.amount) : undefined;
    return message;
  },
  fromAmino(object: MsgExternalTransferAmino): MsgExternalTransfer {
    const message = createBaseMsgExternalTransfer();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.source_subaccount_id !== undefined && object.source_subaccount_id !== null) {
      message.sourceSubaccountId = object.source_subaccount_id;
    }
    if (object.destination_subaccount_id !== undefined && object.destination_subaccount_id !== null) {
      message.destinationSubaccountId = object.destination_subaccount_id;
    }
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = Coin.fromAmino(object.amount);
    }
    return message;
  },
  toAmino(message: MsgExternalTransfer): MsgExternalTransferAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.source_subaccount_id = message.sourceSubaccountId === '' ? undefined : message.sourceSubaccountId;
    obj.destination_subaccount_id =
      message.destinationSubaccountId === '' ? undefined : message.destinationSubaccountId;
    obj.amount = message.amount ? Coin.toAmino(message.amount) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgExternalTransferAminoMsg): MsgExternalTransfer {
    return MsgExternalTransfer.fromAmino(object.value);
  },
  toAminoMsg(message: MsgExternalTransfer): MsgExternalTransferAminoMsg {
    return {
      type: 'exchange/MsgExternalTransfer',
      value: MsgExternalTransfer.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgExternalTransferProtoMsg): MsgExternalTransfer {
    return MsgExternalTransfer.decode(message.value);
  },
  toProto(message: MsgExternalTransfer): Uint8Array {
    return MsgExternalTransfer.encode(message).finish();
  },
  toProtoMsg(message: MsgExternalTransfer): MsgExternalTransferProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgExternalTransfer',
      value: MsgExternalTransfer.encode(message).finish(),
    };
  },
};
function createBaseMsgExternalTransferResponse(): MsgExternalTransferResponse {
  return {};
}
export const MsgExternalTransferResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgExternalTransferResponse',
  encode(_: MsgExternalTransferResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgExternalTransferResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgExternalTransferResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgExternalTransferResponse>): MsgExternalTransferResponse {
    const message = createBaseMsgExternalTransferResponse();
    return message;
  },
  fromAmino(_: MsgExternalTransferResponseAmino): MsgExternalTransferResponse {
    const message = createBaseMsgExternalTransferResponse();
    return message;
  },
  toAmino(_: MsgExternalTransferResponse): MsgExternalTransferResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgExternalTransferResponseAminoMsg): MsgExternalTransferResponse {
    return MsgExternalTransferResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgExternalTransferResponseProtoMsg): MsgExternalTransferResponse {
    return MsgExternalTransferResponse.decode(message.value);
  },
  toProto(message: MsgExternalTransferResponse): Uint8Array {
    return MsgExternalTransferResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgExternalTransferResponse): MsgExternalTransferResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgExternalTransferResponse',
      value: MsgExternalTransferResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgLiquidatePosition(): MsgLiquidatePosition {
  return {
    sender: '',
    subaccountId: '',
    marketId: '',
    order: undefined,
  };
}
export const MsgLiquidatePosition = {
  typeUrl: '/injective.exchange.v1beta1.MsgLiquidatePosition',
  encode(message: MsgLiquidatePosition, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.subaccountId !== '') {
      writer.uint32(18).string(message.subaccountId);
    }
    if (message.marketId !== '') {
      writer.uint32(26).string(message.marketId);
    }
    if (message.order !== undefined) {
      DerivativeOrder.encode(message.order, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgLiquidatePosition {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgLiquidatePosition();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.subaccountId = reader.string();
          break;
        case 3:
          message.marketId = reader.string();
          break;
        case 4:
          message.order = DerivativeOrder.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgLiquidatePosition>): MsgLiquidatePosition {
    const message = createBaseMsgLiquidatePosition();
    message.sender = object.sender ?? '';
    message.subaccountId = object.subaccountId ?? '';
    message.marketId = object.marketId ?? '';
    message.order =
      object.order !== undefined && object.order !== null ? DerivativeOrder.fromPartial(object.order) : undefined;
    return message;
  },
  fromAmino(object: MsgLiquidatePositionAmino): MsgLiquidatePosition {
    const message = createBaseMsgLiquidatePosition();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.subaccount_id !== undefined && object.subaccount_id !== null) {
      message.subaccountId = object.subaccount_id;
    }
    if (object.market_id !== undefined && object.market_id !== null) {
      message.marketId = object.market_id;
    }
    if (object.order !== undefined && object.order !== null) {
      message.order = DerivativeOrder.fromAmino(object.order);
    }
    return message;
  },
  toAmino(message: MsgLiquidatePosition): MsgLiquidatePositionAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.subaccount_id = message.subaccountId === '' ? undefined : message.subaccountId;
    obj.market_id = message.marketId === '' ? undefined : message.marketId;
    obj.order = message.order ? DerivativeOrder.toAmino(message.order) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgLiquidatePositionAminoMsg): MsgLiquidatePosition {
    return MsgLiquidatePosition.fromAmino(object.value);
  },
  toAminoMsg(message: MsgLiquidatePosition): MsgLiquidatePositionAminoMsg {
    return {
      type: 'exchange/MsgLiquidatePosition',
      value: MsgLiquidatePosition.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgLiquidatePositionProtoMsg): MsgLiquidatePosition {
    return MsgLiquidatePosition.decode(message.value);
  },
  toProto(message: MsgLiquidatePosition): Uint8Array {
    return MsgLiquidatePosition.encode(message).finish();
  },
  toProtoMsg(message: MsgLiquidatePosition): MsgLiquidatePositionProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgLiquidatePosition',
      value: MsgLiquidatePosition.encode(message).finish(),
    };
  },
};
function createBaseMsgLiquidatePositionResponse(): MsgLiquidatePositionResponse {
  return {};
}
export const MsgLiquidatePositionResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgLiquidatePositionResponse',
  encode(_: MsgLiquidatePositionResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgLiquidatePositionResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgLiquidatePositionResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgLiquidatePositionResponse>): MsgLiquidatePositionResponse {
    const message = createBaseMsgLiquidatePositionResponse();
    return message;
  },
  fromAmino(_: MsgLiquidatePositionResponseAmino): MsgLiquidatePositionResponse {
    const message = createBaseMsgLiquidatePositionResponse();
    return message;
  },
  toAmino(_: MsgLiquidatePositionResponse): MsgLiquidatePositionResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgLiquidatePositionResponseAminoMsg): MsgLiquidatePositionResponse {
    return MsgLiquidatePositionResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgLiquidatePositionResponseProtoMsg): MsgLiquidatePositionResponse {
    return MsgLiquidatePositionResponse.decode(message.value);
  },
  toProto(message: MsgLiquidatePositionResponse): Uint8Array {
    return MsgLiquidatePositionResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgLiquidatePositionResponse): MsgLiquidatePositionResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgLiquidatePositionResponse',
      value: MsgLiquidatePositionResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgEmergencySettleMarket(): MsgEmergencySettleMarket {
  return {
    sender: '',
    subaccountId: '',
    marketId: '',
  };
}
export const MsgEmergencySettleMarket = {
  typeUrl: '/injective.exchange.v1beta1.MsgEmergencySettleMarket',
  encode(message: MsgEmergencySettleMarket, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.subaccountId !== '') {
      writer.uint32(18).string(message.subaccountId);
    }
    if (message.marketId !== '') {
      writer.uint32(26).string(message.marketId);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgEmergencySettleMarket {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgEmergencySettleMarket();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.subaccountId = reader.string();
          break;
        case 3:
          message.marketId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgEmergencySettleMarket>): MsgEmergencySettleMarket {
    const message = createBaseMsgEmergencySettleMarket();
    message.sender = object.sender ?? '';
    message.subaccountId = object.subaccountId ?? '';
    message.marketId = object.marketId ?? '';
    return message;
  },
  fromAmino(object: MsgEmergencySettleMarketAmino): MsgEmergencySettleMarket {
    const message = createBaseMsgEmergencySettleMarket();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.subaccount_id !== undefined && object.subaccount_id !== null) {
      message.subaccountId = object.subaccount_id;
    }
    if (object.market_id !== undefined && object.market_id !== null) {
      message.marketId = object.market_id;
    }
    return message;
  },
  toAmino(message: MsgEmergencySettleMarket): MsgEmergencySettleMarketAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.subaccount_id = message.subaccountId === '' ? undefined : message.subaccountId;
    obj.market_id = message.marketId === '' ? undefined : message.marketId;
    return obj;
  },
  fromAminoMsg(object: MsgEmergencySettleMarketAminoMsg): MsgEmergencySettleMarket {
    return MsgEmergencySettleMarket.fromAmino(object.value);
  },
  toAminoMsg(message: MsgEmergencySettleMarket): MsgEmergencySettleMarketAminoMsg {
    return {
      type: 'exchange/MsgEmergencySettleMarket',
      value: MsgEmergencySettleMarket.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgEmergencySettleMarketProtoMsg): MsgEmergencySettleMarket {
    return MsgEmergencySettleMarket.decode(message.value);
  },
  toProto(message: MsgEmergencySettleMarket): Uint8Array {
    return MsgEmergencySettleMarket.encode(message).finish();
  },
  toProtoMsg(message: MsgEmergencySettleMarket): MsgEmergencySettleMarketProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgEmergencySettleMarket',
      value: MsgEmergencySettleMarket.encode(message).finish(),
    };
  },
};
function createBaseMsgEmergencySettleMarketResponse(): MsgEmergencySettleMarketResponse {
  return {};
}
export const MsgEmergencySettleMarketResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgEmergencySettleMarketResponse',
  encode(_: MsgEmergencySettleMarketResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgEmergencySettleMarketResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgEmergencySettleMarketResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgEmergencySettleMarketResponse>): MsgEmergencySettleMarketResponse {
    const message = createBaseMsgEmergencySettleMarketResponse();
    return message;
  },
  fromAmino(_: MsgEmergencySettleMarketResponseAmino): MsgEmergencySettleMarketResponse {
    const message = createBaseMsgEmergencySettleMarketResponse();
    return message;
  },
  toAmino(_: MsgEmergencySettleMarketResponse): MsgEmergencySettleMarketResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgEmergencySettleMarketResponseAminoMsg): MsgEmergencySettleMarketResponse {
    return MsgEmergencySettleMarketResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgEmergencySettleMarketResponseProtoMsg): MsgEmergencySettleMarketResponse {
    return MsgEmergencySettleMarketResponse.decode(message.value);
  },
  toProto(message: MsgEmergencySettleMarketResponse): Uint8Array {
    return MsgEmergencySettleMarketResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgEmergencySettleMarketResponse): MsgEmergencySettleMarketResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgEmergencySettleMarketResponse',
      value: MsgEmergencySettleMarketResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgIncreasePositionMargin(): MsgIncreasePositionMargin {
  return {
    sender: '',
    sourceSubaccountId: '',
    destinationSubaccountId: '',
    marketId: '',
    amount: '',
  };
}
export const MsgIncreasePositionMargin = {
  typeUrl: '/injective.exchange.v1beta1.MsgIncreasePositionMargin',
  encode(message: MsgIncreasePositionMargin, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.sourceSubaccountId !== '') {
      writer.uint32(18).string(message.sourceSubaccountId);
    }
    if (message.destinationSubaccountId !== '') {
      writer.uint32(26).string(message.destinationSubaccountId);
    }
    if (message.marketId !== '') {
      writer.uint32(34).string(message.marketId);
    }
    if (message.amount !== '') {
      writer.uint32(42).string(Decimal.fromUserInput(message.amount, 18).atomics);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgIncreasePositionMargin {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgIncreasePositionMargin();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.sourceSubaccountId = reader.string();
          break;
        case 3:
          message.destinationSubaccountId = reader.string();
          break;
        case 4:
          message.marketId = reader.string();
          break;
        case 5:
          message.amount = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgIncreasePositionMargin>): MsgIncreasePositionMargin {
    const message = createBaseMsgIncreasePositionMargin();
    message.sender = object.sender ?? '';
    message.sourceSubaccountId = object.sourceSubaccountId ?? '';
    message.destinationSubaccountId = object.destinationSubaccountId ?? '';
    message.marketId = object.marketId ?? '';
    message.amount = object.amount ?? '';
    return message;
  },
  fromAmino(object: MsgIncreasePositionMarginAmino): MsgIncreasePositionMargin {
    const message = createBaseMsgIncreasePositionMargin();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.source_subaccount_id !== undefined && object.source_subaccount_id !== null) {
      message.sourceSubaccountId = object.source_subaccount_id;
    }
    if (object.destination_subaccount_id !== undefined && object.destination_subaccount_id !== null) {
      message.destinationSubaccountId = object.destination_subaccount_id;
    }
    if (object.market_id !== undefined && object.market_id !== null) {
      message.marketId = object.market_id;
    }
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = object.amount;
    }
    return message;
  },
  toAmino(message: MsgIncreasePositionMargin): MsgIncreasePositionMarginAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.source_subaccount_id = message.sourceSubaccountId === '' ? undefined : message.sourceSubaccountId;
    obj.destination_subaccount_id =
      message.destinationSubaccountId === '' ? undefined : message.destinationSubaccountId;
    obj.market_id = message.marketId === '' ? undefined : message.marketId;
    obj.amount = message.amount === '' ? undefined : message.amount;
    return obj;
  },
  fromAminoMsg(object: MsgIncreasePositionMarginAminoMsg): MsgIncreasePositionMargin {
    return MsgIncreasePositionMargin.fromAmino(object.value);
  },
  toAminoMsg(message: MsgIncreasePositionMargin): MsgIncreasePositionMarginAminoMsg {
    return {
      type: 'exchange/MsgIncreasePositionMargin',
      value: MsgIncreasePositionMargin.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgIncreasePositionMarginProtoMsg): MsgIncreasePositionMargin {
    return MsgIncreasePositionMargin.decode(message.value);
  },
  toProto(message: MsgIncreasePositionMargin): Uint8Array {
    return MsgIncreasePositionMargin.encode(message).finish();
  },
  toProtoMsg(message: MsgIncreasePositionMargin): MsgIncreasePositionMarginProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgIncreasePositionMargin',
      value: MsgIncreasePositionMargin.encode(message).finish(),
    };
  },
};
function createBaseMsgIncreasePositionMarginResponse(): MsgIncreasePositionMarginResponse {
  return {};
}
export const MsgIncreasePositionMarginResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgIncreasePositionMarginResponse',
  encode(_: MsgIncreasePositionMarginResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgIncreasePositionMarginResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgIncreasePositionMarginResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgIncreasePositionMarginResponse>): MsgIncreasePositionMarginResponse {
    const message = createBaseMsgIncreasePositionMarginResponse();
    return message;
  },
  fromAmino(_: MsgIncreasePositionMarginResponseAmino): MsgIncreasePositionMarginResponse {
    const message = createBaseMsgIncreasePositionMarginResponse();
    return message;
  },
  toAmino(_: MsgIncreasePositionMarginResponse): MsgIncreasePositionMarginResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgIncreasePositionMarginResponseAminoMsg): MsgIncreasePositionMarginResponse {
    return MsgIncreasePositionMarginResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgIncreasePositionMarginResponseProtoMsg): MsgIncreasePositionMarginResponse {
    return MsgIncreasePositionMarginResponse.decode(message.value);
  },
  toProto(message: MsgIncreasePositionMarginResponse): Uint8Array {
    return MsgIncreasePositionMarginResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgIncreasePositionMarginResponse): MsgIncreasePositionMarginResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgIncreasePositionMarginResponse',
      value: MsgIncreasePositionMarginResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgDecreasePositionMargin(): MsgDecreasePositionMargin {
  return {
    sender: '',
    sourceSubaccountId: '',
    destinationSubaccountId: '',
    marketId: '',
    amount: '',
  };
}
export const MsgDecreasePositionMargin = {
  typeUrl: '/injective.exchange.v1beta1.MsgDecreasePositionMargin',
  encode(message: MsgDecreasePositionMargin, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.sourceSubaccountId !== '') {
      writer.uint32(18).string(message.sourceSubaccountId);
    }
    if (message.destinationSubaccountId !== '') {
      writer.uint32(26).string(message.destinationSubaccountId);
    }
    if (message.marketId !== '') {
      writer.uint32(34).string(message.marketId);
    }
    if (message.amount !== '') {
      writer.uint32(42).string(Decimal.fromUserInput(message.amount, 18).atomics);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgDecreasePositionMargin {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDecreasePositionMargin();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.sourceSubaccountId = reader.string();
          break;
        case 3:
          message.destinationSubaccountId = reader.string();
          break;
        case 4:
          message.marketId = reader.string();
          break;
        case 5:
          message.amount = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgDecreasePositionMargin>): MsgDecreasePositionMargin {
    const message = createBaseMsgDecreasePositionMargin();
    message.sender = object.sender ?? '';
    message.sourceSubaccountId = object.sourceSubaccountId ?? '';
    message.destinationSubaccountId = object.destinationSubaccountId ?? '';
    message.marketId = object.marketId ?? '';
    message.amount = object.amount ?? '';
    return message;
  },
  fromAmino(object: MsgDecreasePositionMarginAmino): MsgDecreasePositionMargin {
    const message = createBaseMsgDecreasePositionMargin();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.source_subaccount_id !== undefined && object.source_subaccount_id !== null) {
      message.sourceSubaccountId = object.source_subaccount_id;
    }
    if (object.destination_subaccount_id !== undefined && object.destination_subaccount_id !== null) {
      message.destinationSubaccountId = object.destination_subaccount_id;
    }
    if (object.market_id !== undefined && object.market_id !== null) {
      message.marketId = object.market_id;
    }
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = object.amount;
    }
    return message;
  },
  toAmino(message: MsgDecreasePositionMargin): MsgDecreasePositionMarginAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.source_subaccount_id = message.sourceSubaccountId === '' ? undefined : message.sourceSubaccountId;
    obj.destination_subaccount_id =
      message.destinationSubaccountId === '' ? undefined : message.destinationSubaccountId;
    obj.market_id = message.marketId === '' ? undefined : message.marketId;
    obj.amount = message.amount === '' ? undefined : message.amount;
    return obj;
  },
  fromAminoMsg(object: MsgDecreasePositionMarginAminoMsg): MsgDecreasePositionMargin {
    return MsgDecreasePositionMargin.fromAmino(object.value);
  },
  toAminoMsg(message: MsgDecreasePositionMargin): MsgDecreasePositionMarginAminoMsg {
    return {
      type: 'exchange/MsgDecreasePositionMargin',
      value: MsgDecreasePositionMargin.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgDecreasePositionMarginProtoMsg): MsgDecreasePositionMargin {
    return MsgDecreasePositionMargin.decode(message.value);
  },
  toProto(message: MsgDecreasePositionMargin): Uint8Array {
    return MsgDecreasePositionMargin.encode(message).finish();
  },
  toProtoMsg(message: MsgDecreasePositionMargin): MsgDecreasePositionMarginProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgDecreasePositionMargin',
      value: MsgDecreasePositionMargin.encode(message).finish(),
    };
  },
};
function createBaseMsgDecreasePositionMarginResponse(): MsgDecreasePositionMarginResponse {
  return {};
}
export const MsgDecreasePositionMarginResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgDecreasePositionMarginResponse',
  encode(_: MsgDecreasePositionMarginResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgDecreasePositionMarginResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDecreasePositionMarginResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgDecreasePositionMarginResponse>): MsgDecreasePositionMarginResponse {
    const message = createBaseMsgDecreasePositionMarginResponse();
    return message;
  },
  fromAmino(_: MsgDecreasePositionMarginResponseAmino): MsgDecreasePositionMarginResponse {
    const message = createBaseMsgDecreasePositionMarginResponse();
    return message;
  },
  toAmino(_: MsgDecreasePositionMarginResponse): MsgDecreasePositionMarginResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgDecreasePositionMarginResponseAminoMsg): MsgDecreasePositionMarginResponse {
    return MsgDecreasePositionMarginResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgDecreasePositionMarginResponseProtoMsg): MsgDecreasePositionMarginResponse {
    return MsgDecreasePositionMarginResponse.decode(message.value);
  },
  toProto(message: MsgDecreasePositionMarginResponse): Uint8Array {
    return MsgDecreasePositionMarginResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgDecreasePositionMarginResponse): MsgDecreasePositionMarginResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgDecreasePositionMarginResponse',
      value: MsgDecreasePositionMarginResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgPrivilegedExecuteContract(): MsgPrivilegedExecuteContract {
  return {
    sender: '',
    funds: '',
    contractAddress: '',
    data: '',
  };
}
export const MsgPrivilegedExecuteContract = {
  typeUrl: '/injective.exchange.v1beta1.MsgPrivilegedExecuteContract',
  encode(message: MsgPrivilegedExecuteContract, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.funds !== '') {
      writer.uint32(18).string(message.funds);
    }
    if (message.contractAddress !== '') {
      writer.uint32(26).string(message.contractAddress);
    }
    if (message.data !== '') {
      writer.uint32(34).string(message.data);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgPrivilegedExecuteContract {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgPrivilegedExecuteContract();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.funds = reader.string();
          break;
        case 3:
          message.contractAddress = reader.string();
          break;
        case 4:
          message.data = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgPrivilegedExecuteContract>): MsgPrivilegedExecuteContract {
    const message = createBaseMsgPrivilegedExecuteContract();
    message.sender = object.sender ?? '';
    message.funds = object.funds ?? '';
    message.contractAddress = object.contractAddress ?? '';
    message.data = object.data ?? '';
    return message;
  },
  fromAmino(object: MsgPrivilegedExecuteContractAmino): MsgPrivilegedExecuteContract {
    const message = createBaseMsgPrivilegedExecuteContract();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.funds !== undefined && object.funds !== null) {
      message.funds = object.funds;
    }
    if (object.contract_address !== undefined && object.contract_address !== null) {
      message.contractAddress = object.contract_address;
    }
    if (object.data !== undefined && object.data !== null) {
      message.data = object.data;
    }
    return message;
  },
  toAmino(message: MsgPrivilegedExecuteContract): MsgPrivilegedExecuteContractAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.funds = message.funds === '' ? undefined : message.funds;
    obj.contract_address = message.contractAddress === '' ? undefined : message.contractAddress;
    obj.data = message.data === '' ? undefined : message.data;
    return obj;
  },
  fromAminoMsg(object: MsgPrivilegedExecuteContractAminoMsg): MsgPrivilegedExecuteContract {
    return MsgPrivilegedExecuteContract.fromAmino(object.value);
  },
  toAminoMsg(message: MsgPrivilegedExecuteContract): MsgPrivilegedExecuteContractAminoMsg {
    return {
      type: 'exchange/MsgPrivilegedExecuteContract',
      value: MsgPrivilegedExecuteContract.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgPrivilegedExecuteContractProtoMsg): MsgPrivilegedExecuteContract {
    return MsgPrivilegedExecuteContract.decode(message.value);
  },
  toProto(message: MsgPrivilegedExecuteContract): Uint8Array {
    return MsgPrivilegedExecuteContract.encode(message).finish();
  },
  toProtoMsg(message: MsgPrivilegedExecuteContract): MsgPrivilegedExecuteContractProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgPrivilegedExecuteContract',
      value: MsgPrivilegedExecuteContract.encode(message).finish(),
    };
  },
};
function createBaseMsgPrivilegedExecuteContractResponse(): MsgPrivilegedExecuteContractResponse {
  return {
    fundsDiff: [],
  };
}
export const MsgPrivilegedExecuteContractResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgPrivilegedExecuteContractResponse',
  encode(message: MsgPrivilegedExecuteContractResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.fundsDiff) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgPrivilegedExecuteContractResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgPrivilegedExecuteContractResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.fundsDiff.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgPrivilegedExecuteContractResponse>): MsgPrivilegedExecuteContractResponse {
    const message = createBaseMsgPrivilegedExecuteContractResponse();
    message.fundsDiff = object.fundsDiff?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: MsgPrivilegedExecuteContractResponseAmino): MsgPrivilegedExecuteContractResponse {
    const message = createBaseMsgPrivilegedExecuteContractResponse();
    message.fundsDiff = object.funds_diff?.map((e) => Coin.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: MsgPrivilegedExecuteContractResponse): MsgPrivilegedExecuteContractResponseAmino {
    const obj: any = {};
    if (message.fundsDiff) {
      obj.funds_diff = message.fundsDiff.map((e) => (e ? Coin.toAmino(e) : undefined));
    } else {
      obj.funds_diff = message.fundsDiff;
    }
    return obj;
  },
  fromAminoMsg(object: MsgPrivilegedExecuteContractResponseAminoMsg): MsgPrivilegedExecuteContractResponse {
    return MsgPrivilegedExecuteContractResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgPrivilegedExecuteContractResponseProtoMsg): MsgPrivilegedExecuteContractResponse {
    return MsgPrivilegedExecuteContractResponse.decode(message.value);
  },
  toProto(message: MsgPrivilegedExecuteContractResponse): Uint8Array {
    return MsgPrivilegedExecuteContractResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgPrivilegedExecuteContractResponse): MsgPrivilegedExecuteContractResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgPrivilegedExecuteContractResponse',
      value: MsgPrivilegedExecuteContractResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgRewardsOptOut(): MsgRewardsOptOut {
  return {
    sender: '',
  };
}
export const MsgRewardsOptOut = {
  typeUrl: '/injective.exchange.v1beta1.MsgRewardsOptOut',
  encode(message: MsgRewardsOptOut, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgRewardsOptOut {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRewardsOptOut();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgRewardsOptOut>): MsgRewardsOptOut {
    const message = createBaseMsgRewardsOptOut();
    message.sender = object.sender ?? '';
    return message;
  },
  fromAmino(object: MsgRewardsOptOutAmino): MsgRewardsOptOut {
    const message = createBaseMsgRewardsOptOut();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    return message;
  },
  toAmino(message: MsgRewardsOptOut): MsgRewardsOptOutAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    return obj;
  },
  fromAminoMsg(object: MsgRewardsOptOutAminoMsg): MsgRewardsOptOut {
    return MsgRewardsOptOut.fromAmino(object.value);
  },
  toAminoMsg(message: MsgRewardsOptOut): MsgRewardsOptOutAminoMsg {
    return {
      type: 'exchange/MsgRewardsOptOut',
      value: MsgRewardsOptOut.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgRewardsOptOutProtoMsg): MsgRewardsOptOut {
    return MsgRewardsOptOut.decode(message.value);
  },
  toProto(message: MsgRewardsOptOut): Uint8Array {
    return MsgRewardsOptOut.encode(message).finish();
  },
  toProtoMsg(message: MsgRewardsOptOut): MsgRewardsOptOutProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgRewardsOptOut',
      value: MsgRewardsOptOut.encode(message).finish(),
    };
  },
};
function createBaseMsgRewardsOptOutResponse(): MsgRewardsOptOutResponse {
  return {};
}
export const MsgRewardsOptOutResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgRewardsOptOutResponse',
  encode(_: MsgRewardsOptOutResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgRewardsOptOutResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRewardsOptOutResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgRewardsOptOutResponse>): MsgRewardsOptOutResponse {
    const message = createBaseMsgRewardsOptOutResponse();
    return message;
  },
  fromAmino(_: MsgRewardsOptOutResponseAmino): MsgRewardsOptOutResponse {
    const message = createBaseMsgRewardsOptOutResponse();
    return message;
  },
  toAmino(_: MsgRewardsOptOutResponse): MsgRewardsOptOutResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgRewardsOptOutResponseAminoMsg): MsgRewardsOptOutResponse {
    return MsgRewardsOptOutResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgRewardsOptOutResponseProtoMsg): MsgRewardsOptOutResponse {
    return MsgRewardsOptOutResponse.decode(message.value);
  },
  toProto(message: MsgRewardsOptOutResponse): Uint8Array {
    return MsgRewardsOptOutResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgRewardsOptOutResponse): MsgRewardsOptOutResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgRewardsOptOutResponse',
      value: MsgRewardsOptOutResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgReclaimLockedFunds(): MsgReclaimLockedFunds {
  return {
    sender: '',
    lockedAccountPubKey: new Uint8Array(),
    signature: new Uint8Array(),
  };
}
export const MsgReclaimLockedFunds = {
  typeUrl: '/injective.exchange.v1beta1.MsgReclaimLockedFunds',
  encode(message: MsgReclaimLockedFunds, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.lockedAccountPubKey.length !== 0) {
      writer.uint32(18).bytes(message.lockedAccountPubKey);
    }
    if (message.signature.length !== 0) {
      writer.uint32(26).bytes(message.signature);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgReclaimLockedFunds {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgReclaimLockedFunds();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.lockedAccountPubKey = reader.bytes();
          break;
        case 3:
          message.signature = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgReclaimLockedFunds>): MsgReclaimLockedFunds {
    const message = createBaseMsgReclaimLockedFunds();
    message.sender = object.sender ?? '';
    message.lockedAccountPubKey = object.lockedAccountPubKey ?? new Uint8Array();
    message.signature = object.signature ?? new Uint8Array();
    return message;
  },
  fromAmino(object: MsgReclaimLockedFundsAmino): MsgReclaimLockedFunds {
    const message = createBaseMsgReclaimLockedFunds();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.lockedAccountPubKey !== undefined && object.lockedAccountPubKey !== null) {
      message.lockedAccountPubKey = bytesFromBase64(object.lockedAccountPubKey);
    }
    if (object.signature !== undefined && object.signature !== null) {
      message.signature = bytesFromBase64(object.signature);
    }
    return message;
  },
  toAmino(message: MsgReclaimLockedFunds): MsgReclaimLockedFundsAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.lockedAccountPubKey = message.lockedAccountPubKey ? base64FromBytes(message.lockedAccountPubKey) : undefined;
    obj.signature = message.signature ? base64FromBytes(message.signature) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgReclaimLockedFundsAminoMsg): MsgReclaimLockedFunds {
    return MsgReclaimLockedFunds.fromAmino(object.value);
  },
  toAminoMsg(message: MsgReclaimLockedFunds): MsgReclaimLockedFundsAminoMsg {
    return {
      type: 'exchange/MsgReclaimLockedFunds',
      value: MsgReclaimLockedFunds.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgReclaimLockedFundsProtoMsg): MsgReclaimLockedFunds {
    return MsgReclaimLockedFunds.decode(message.value);
  },
  toProto(message: MsgReclaimLockedFunds): Uint8Array {
    return MsgReclaimLockedFunds.encode(message).finish();
  },
  toProtoMsg(message: MsgReclaimLockedFunds): MsgReclaimLockedFundsProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgReclaimLockedFunds',
      value: MsgReclaimLockedFunds.encode(message).finish(),
    };
  },
};
function createBaseMsgReclaimLockedFundsResponse(): MsgReclaimLockedFundsResponse {
  return {};
}
export const MsgReclaimLockedFundsResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgReclaimLockedFundsResponse',
  encode(_: MsgReclaimLockedFundsResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgReclaimLockedFundsResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgReclaimLockedFundsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgReclaimLockedFundsResponse>): MsgReclaimLockedFundsResponse {
    const message = createBaseMsgReclaimLockedFundsResponse();
    return message;
  },
  fromAmino(_: MsgReclaimLockedFundsResponseAmino): MsgReclaimLockedFundsResponse {
    const message = createBaseMsgReclaimLockedFundsResponse();
    return message;
  },
  toAmino(_: MsgReclaimLockedFundsResponse): MsgReclaimLockedFundsResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgReclaimLockedFundsResponseAminoMsg): MsgReclaimLockedFundsResponse {
    return MsgReclaimLockedFundsResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgReclaimLockedFundsResponseProtoMsg): MsgReclaimLockedFundsResponse {
    return MsgReclaimLockedFundsResponse.decode(message.value);
  },
  toProto(message: MsgReclaimLockedFundsResponse): Uint8Array {
    return MsgReclaimLockedFundsResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgReclaimLockedFundsResponse): MsgReclaimLockedFundsResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgReclaimLockedFundsResponse',
      value: MsgReclaimLockedFundsResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgSignData(): MsgSignData {
  return {
    signer: new Uint8Array(),
    data: new Uint8Array(),
  };
}
export const MsgSignData = {
  typeUrl: '/injective.exchange.v1beta1.MsgSignData',
  encode(message: MsgSignData, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.signer.length !== 0) {
      writer.uint32(10).bytes(message.signer);
    }
    if (message.data.length !== 0) {
      writer.uint32(18).bytes(message.data);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgSignData {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSignData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signer = reader.bytes();
          break;
        case 2:
          message.data = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgSignData>): MsgSignData {
    const message = createBaseMsgSignData();
    message.signer = object.signer ?? new Uint8Array();
    message.data = object.data ?? new Uint8Array();
    return message;
  },
  fromAmino(object: MsgSignDataAmino): MsgSignData {
    const message = createBaseMsgSignData();
    if (object.Signer !== undefined && object.Signer !== null) {
      message.signer = bytesFromBase64(object.Signer);
    }
    if (object.Data !== undefined && object.Data !== null) {
      message.data = bytesFromBase64(object.Data);
    }
    return message;
  },
  toAmino(message: MsgSignData): MsgSignDataAmino {
    const obj: any = {};
    obj.Signer = message.signer ? base64FromBytes(message.signer) : '';
    obj.Data = message.data ? base64FromBytes(message.data) : '';
    return obj;
  },
  fromAminoMsg(object: MsgSignDataAminoMsg): MsgSignData {
    return MsgSignData.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgSignDataProtoMsg): MsgSignData {
    return MsgSignData.decode(message.value);
  },
  toProto(message: MsgSignData): Uint8Array {
    return MsgSignData.encode(message).finish();
  },
  toProtoMsg(message: MsgSignData): MsgSignDataProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgSignData',
      value: MsgSignData.encode(message).finish(),
    };
  },
};
function createBaseMsgSignDoc(): MsgSignDoc {
  return {
    signType: '',
    value: MsgSignData.fromPartial({}),
  };
}
export const MsgSignDoc = {
  typeUrl: '/injective.exchange.v1beta1.MsgSignDoc',
  encode(message: MsgSignDoc, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.signType !== '') {
      writer.uint32(10).string(message.signType);
    }
    if (message.value !== undefined) {
      MsgSignData.encode(message.value, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgSignDoc {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSignDoc();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signType = reader.string();
          break;
        case 2:
          message.value = MsgSignData.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgSignDoc>): MsgSignDoc {
    const message = createBaseMsgSignDoc();
    message.signType = object.signType ?? '';
    message.value =
      object.value !== undefined && object.value !== null ? MsgSignData.fromPartial(object.value) : undefined;
    return message;
  },
  fromAmino(object: MsgSignDocAmino): MsgSignDoc {
    const message = createBaseMsgSignDoc();
    if (object.sign_type !== undefined && object.sign_type !== null) {
      message.signType = object.sign_type;
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = MsgSignData.fromAmino(object.value);
    }
    return message;
  },
  toAmino(message: MsgSignDoc): MsgSignDocAmino {
    const obj: any = {};
    obj.sign_type = message.signType ?? '';
    obj.value = message.value ? MsgSignData.toAmino(message.value) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgSignDocAminoMsg): MsgSignDoc {
    return MsgSignDoc.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgSignDocProtoMsg): MsgSignDoc {
    return MsgSignDoc.decode(message.value);
  },
  toProto(message: MsgSignDoc): Uint8Array {
    return MsgSignDoc.encode(message).finish();
  },
  toProtoMsg(message: MsgSignDoc): MsgSignDocProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgSignDoc',
      value: MsgSignDoc.encode(message).finish(),
    };
  },
};
function createBaseMsgAdminUpdateBinaryOptionsMarket(): MsgAdminUpdateBinaryOptionsMarket {
  return {
    sender: '',
    marketId: '',
    settlementPrice: undefined,
    expirationTimestamp: BigInt(0),
    settlementTimestamp: BigInt(0),
    status: 0,
  };
}
export const MsgAdminUpdateBinaryOptionsMarket = {
  typeUrl: '/injective.exchange.v1beta1.MsgAdminUpdateBinaryOptionsMarket',
  encode(message: MsgAdminUpdateBinaryOptionsMarket, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.marketId !== '') {
      writer.uint32(18).string(message.marketId);
    }
    if (message.settlementPrice !== undefined) {
      writer.uint32(26).string(Decimal.fromUserInput(message.settlementPrice, 18).atomics);
    }
    if (message.expirationTimestamp !== BigInt(0)) {
      writer.uint32(32).int64(message.expirationTimestamp);
    }
    if (message.settlementTimestamp !== BigInt(0)) {
      writer.uint32(40).int64(message.settlementTimestamp);
    }
    if (message.status !== 0) {
      writer.uint32(48).int32(message.status);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgAdminUpdateBinaryOptionsMarket {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAdminUpdateBinaryOptionsMarket();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.marketId = reader.string();
          break;
        case 3:
          message.settlementPrice = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 4:
          message.expirationTimestamp = reader.int64();
          break;
        case 5:
          message.settlementTimestamp = reader.int64();
          break;
        case 6:
          message.status = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgAdminUpdateBinaryOptionsMarket>): MsgAdminUpdateBinaryOptionsMarket {
    const message = createBaseMsgAdminUpdateBinaryOptionsMarket();
    message.sender = object.sender ?? '';
    message.marketId = object.marketId ?? '';
    message.settlementPrice = object.settlementPrice ?? undefined;
    message.expirationTimestamp =
      object.expirationTimestamp !== undefined && object.expirationTimestamp !== null
        ? BigInt(object.expirationTimestamp.toString())
        : BigInt(0);
    message.settlementTimestamp =
      object.settlementTimestamp !== undefined && object.settlementTimestamp !== null
        ? BigInt(object.settlementTimestamp.toString())
        : BigInt(0);
    message.status = object.status ?? 0;
    return message;
  },
  fromAmino(object: MsgAdminUpdateBinaryOptionsMarketAmino): MsgAdminUpdateBinaryOptionsMarket {
    const message = createBaseMsgAdminUpdateBinaryOptionsMarket();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.market_id !== undefined && object.market_id !== null) {
      message.marketId = object.market_id;
    }
    if (object.settlement_price !== undefined && object.settlement_price !== null) {
      message.settlementPrice = object.settlement_price;
    }
    if (object.expiration_timestamp !== undefined && object.expiration_timestamp !== null) {
      message.expirationTimestamp = BigInt(object.expiration_timestamp);
    }
    if (object.settlement_timestamp !== undefined && object.settlement_timestamp !== null) {
      message.settlementTimestamp = BigInt(object.settlement_timestamp);
    }
    if (object.status !== undefined && object.status !== null) {
      message.status = object.status;
    }
    return message;
  },
  toAmino(message: MsgAdminUpdateBinaryOptionsMarket): MsgAdminUpdateBinaryOptionsMarketAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.market_id = message.marketId === '' ? undefined : message.marketId;
    obj.settlement_price = message.settlementPrice === null ? undefined : message.settlementPrice;
    obj.expiration_timestamp =
      message.expirationTimestamp !== BigInt(0) ? (message.expirationTimestamp?.toString)() : undefined;
    obj.settlement_timestamp =
      message.settlementTimestamp !== BigInt(0) ? (message.settlementTimestamp?.toString)() : undefined;
    obj.status = message.status === 0 ? undefined : message.status;
    return obj;
  },
  fromAminoMsg(object: MsgAdminUpdateBinaryOptionsMarketAminoMsg): MsgAdminUpdateBinaryOptionsMarket {
    return MsgAdminUpdateBinaryOptionsMarket.fromAmino(object.value);
  },
  toAminoMsg(message: MsgAdminUpdateBinaryOptionsMarket): MsgAdminUpdateBinaryOptionsMarketAminoMsg {
    return {
      type: 'exchange/MsgAdminUpdateBinaryOptionsMarket',
      value: MsgAdminUpdateBinaryOptionsMarket.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgAdminUpdateBinaryOptionsMarketProtoMsg): MsgAdminUpdateBinaryOptionsMarket {
    return MsgAdminUpdateBinaryOptionsMarket.decode(message.value);
  },
  toProto(message: MsgAdminUpdateBinaryOptionsMarket): Uint8Array {
    return MsgAdminUpdateBinaryOptionsMarket.encode(message).finish();
  },
  toProtoMsg(message: MsgAdminUpdateBinaryOptionsMarket): MsgAdminUpdateBinaryOptionsMarketProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgAdminUpdateBinaryOptionsMarket',
      value: MsgAdminUpdateBinaryOptionsMarket.encode(message).finish(),
    };
  },
};
function createBaseMsgAdminUpdateBinaryOptionsMarketResponse(): MsgAdminUpdateBinaryOptionsMarketResponse {
  return {};
}
export const MsgAdminUpdateBinaryOptionsMarketResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgAdminUpdateBinaryOptionsMarketResponse',
  encode(_: MsgAdminUpdateBinaryOptionsMarketResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgAdminUpdateBinaryOptionsMarketResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAdminUpdateBinaryOptionsMarketResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgAdminUpdateBinaryOptionsMarketResponse>): MsgAdminUpdateBinaryOptionsMarketResponse {
    const message = createBaseMsgAdminUpdateBinaryOptionsMarketResponse();
    return message;
  },
  fromAmino(_: MsgAdminUpdateBinaryOptionsMarketResponseAmino): MsgAdminUpdateBinaryOptionsMarketResponse {
    const message = createBaseMsgAdminUpdateBinaryOptionsMarketResponse();
    return message;
  },
  toAmino(_: MsgAdminUpdateBinaryOptionsMarketResponse): MsgAdminUpdateBinaryOptionsMarketResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgAdminUpdateBinaryOptionsMarketResponseAminoMsg): MsgAdminUpdateBinaryOptionsMarketResponse {
    return MsgAdminUpdateBinaryOptionsMarketResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgAdminUpdateBinaryOptionsMarketResponseProtoMsg): MsgAdminUpdateBinaryOptionsMarketResponse {
    return MsgAdminUpdateBinaryOptionsMarketResponse.decode(message.value);
  },
  toProto(message: MsgAdminUpdateBinaryOptionsMarketResponse): Uint8Array {
    return MsgAdminUpdateBinaryOptionsMarketResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgAdminUpdateBinaryOptionsMarketResponse): MsgAdminUpdateBinaryOptionsMarketResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgAdminUpdateBinaryOptionsMarketResponse',
      value: MsgAdminUpdateBinaryOptionsMarketResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgAuthorizeStakeGrants(): MsgAuthorizeStakeGrants {
  return {
    sender: '',
    grants: [],
  };
}
export const MsgAuthorizeStakeGrants = {
  typeUrl: '/injective.exchange.v1beta1.MsgAuthorizeStakeGrants',
  encode(message: MsgAuthorizeStakeGrants, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    for (const v of message.grants) {
      GrantAuthorization.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgAuthorizeStakeGrants {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAuthorizeStakeGrants();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.grants.push(GrantAuthorization.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgAuthorizeStakeGrants>): MsgAuthorizeStakeGrants {
    const message = createBaseMsgAuthorizeStakeGrants();
    message.sender = object.sender ?? '';
    message.grants = object.grants?.map((e) => GrantAuthorization.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: MsgAuthorizeStakeGrantsAmino): MsgAuthorizeStakeGrants {
    const message = createBaseMsgAuthorizeStakeGrants();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    message.grants = object.grants?.map((e) => GrantAuthorization.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: MsgAuthorizeStakeGrants): MsgAuthorizeStakeGrantsAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    if (message.grants) {
      obj.grants = message.grants.map((e) => (e ? GrantAuthorization.toAmino(e) : undefined));
    } else {
      obj.grants = message.grants;
    }
    return obj;
  },
  fromAminoMsg(object: MsgAuthorizeStakeGrantsAminoMsg): MsgAuthorizeStakeGrants {
    return MsgAuthorizeStakeGrants.fromAmino(object.value);
  },
  toAminoMsg(message: MsgAuthorizeStakeGrants): MsgAuthorizeStakeGrantsAminoMsg {
    return {
      type: 'exchange/MsgAuthorizeStakeGrants',
      value: MsgAuthorizeStakeGrants.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgAuthorizeStakeGrantsProtoMsg): MsgAuthorizeStakeGrants {
    return MsgAuthorizeStakeGrants.decode(message.value);
  },
  toProto(message: MsgAuthorizeStakeGrants): Uint8Array {
    return MsgAuthorizeStakeGrants.encode(message).finish();
  },
  toProtoMsg(message: MsgAuthorizeStakeGrants): MsgAuthorizeStakeGrantsProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgAuthorizeStakeGrants',
      value: MsgAuthorizeStakeGrants.encode(message).finish(),
    };
  },
};
function createBaseMsgAuthorizeStakeGrantsResponse(): MsgAuthorizeStakeGrantsResponse {
  return {};
}
export const MsgAuthorizeStakeGrantsResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgAuthorizeStakeGrantsResponse',
  encode(_: MsgAuthorizeStakeGrantsResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgAuthorizeStakeGrantsResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAuthorizeStakeGrantsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgAuthorizeStakeGrantsResponse>): MsgAuthorizeStakeGrantsResponse {
    const message = createBaseMsgAuthorizeStakeGrantsResponse();
    return message;
  },
  fromAmino(_: MsgAuthorizeStakeGrantsResponseAmino): MsgAuthorizeStakeGrantsResponse {
    const message = createBaseMsgAuthorizeStakeGrantsResponse();
    return message;
  },
  toAmino(_: MsgAuthorizeStakeGrantsResponse): MsgAuthorizeStakeGrantsResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgAuthorizeStakeGrantsResponseAminoMsg): MsgAuthorizeStakeGrantsResponse {
    return MsgAuthorizeStakeGrantsResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgAuthorizeStakeGrantsResponseProtoMsg): MsgAuthorizeStakeGrantsResponse {
    return MsgAuthorizeStakeGrantsResponse.decode(message.value);
  },
  toProto(message: MsgAuthorizeStakeGrantsResponse): Uint8Array {
    return MsgAuthorizeStakeGrantsResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgAuthorizeStakeGrantsResponse): MsgAuthorizeStakeGrantsResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgAuthorizeStakeGrantsResponse',
      value: MsgAuthorizeStakeGrantsResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgActivateStakeGrant(): MsgActivateStakeGrant {
  return {
    sender: '',
    granter: '',
  };
}
export const MsgActivateStakeGrant = {
  typeUrl: '/injective.exchange.v1beta1.MsgActivateStakeGrant',
  encode(message: MsgActivateStakeGrant, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.granter !== '') {
      writer.uint32(18).string(message.granter);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgActivateStakeGrant {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgActivateStakeGrant();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.granter = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgActivateStakeGrant>): MsgActivateStakeGrant {
    const message = createBaseMsgActivateStakeGrant();
    message.sender = object.sender ?? '';
    message.granter = object.granter ?? '';
    return message;
  },
  fromAmino(object: MsgActivateStakeGrantAmino): MsgActivateStakeGrant {
    const message = createBaseMsgActivateStakeGrant();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.granter !== undefined && object.granter !== null) {
      message.granter = object.granter;
    }
    return message;
  },
  toAmino(message: MsgActivateStakeGrant): MsgActivateStakeGrantAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.granter = message.granter === '' ? undefined : message.granter;
    return obj;
  },
  fromAminoMsg(object: MsgActivateStakeGrantAminoMsg): MsgActivateStakeGrant {
    return MsgActivateStakeGrant.fromAmino(object.value);
  },
  toAminoMsg(message: MsgActivateStakeGrant): MsgActivateStakeGrantAminoMsg {
    return {
      type: 'exchange/MsgActivateStakeGrant',
      value: MsgActivateStakeGrant.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgActivateStakeGrantProtoMsg): MsgActivateStakeGrant {
    return MsgActivateStakeGrant.decode(message.value);
  },
  toProto(message: MsgActivateStakeGrant): Uint8Array {
    return MsgActivateStakeGrant.encode(message).finish();
  },
  toProtoMsg(message: MsgActivateStakeGrant): MsgActivateStakeGrantProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgActivateStakeGrant',
      value: MsgActivateStakeGrant.encode(message).finish(),
    };
  },
};
function createBaseMsgActivateStakeGrantResponse(): MsgActivateStakeGrantResponse {
  return {};
}
export const MsgActivateStakeGrantResponse = {
  typeUrl: '/injective.exchange.v1beta1.MsgActivateStakeGrantResponse',
  encode(_: MsgActivateStakeGrantResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgActivateStakeGrantResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgActivateStakeGrantResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgActivateStakeGrantResponse>): MsgActivateStakeGrantResponse {
    const message = createBaseMsgActivateStakeGrantResponse();
    return message;
  },
  fromAmino(_: MsgActivateStakeGrantResponseAmino): MsgActivateStakeGrantResponse {
    const message = createBaseMsgActivateStakeGrantResponse();
    return message;
  },
  toAmino(_: MsgActivateStakeGrantResponse): MsgActivateStakeGrantResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgActivateStakeGrantResponseAminoMsg): MsgActivateStakeGrantResponse {
    return MsgActivateStakeGrantResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgActivateStakeGrantResponseProtoMsg): MsgActivateStakeGrantResponse {
    return MsgActivateStakeGrantResponse.decode(message.value);
  },
  toProto(message: MsgActivateStakeGrantResponse): Uint8Array {
    return MsgActivateStakeGrantResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgActivateStakeGrantResponse): MsgActivateStakeGrantResponseProtoMsg {
    return {
      typeUrl: '/injective.exchange.v1beta1.MsgActivateStakeGrantResponse',
      value: MsgActivateStakeGrantResponse.encode(message).finish(),
    };
  },
};
