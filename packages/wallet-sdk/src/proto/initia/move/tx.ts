// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { Decimal } from '@cosmjs/math';

import { BinaryReader, BinaryWriter } from '../../binary';
import { base64FromBytes, bytesFromBase64 } from '../../helpers';
import { Params, ParamsAmino, ParamsSDKType, UpgradePolicy } from './types';
/** MsgPublish is the message to store compiled Move module */
export interface MsgPublish {
  /** Sender is the that actor that signed the messages */
  sender: string;
  /** CodeBytes is raw move module bytes code */
  codeBytes: Uint8Array[];
  /**
   * UpgradePolicy defines upgrade rules which will be applied
   * at next publish message.
   * Upgrades in the direction of enhancing security are permitted.
   * `ARBITRARY` => `COMPATIBLE`
   * `ARBITRARY` => `IMMUTABLE`
   * `COMPATIBLE` => `IMMUTABLE`
   * but reverse ways are not allowed (ignored).
   */
  upgradePolicy?: UpgradePolicy;
}
export interface MsgPublishProtoMsg {
  typeUrl: '/initia.move.v1.MsgPublish';
  value: Uint8Array;
}
/** MsgPublish is the message to store compiled Move module */
export interface MsgPublishAmino {
  /** Sender is the that actor that signed the messages */
  sender?: string;
  /** CodeBytes is raw move module bytes code */
  code_bytes?: string[];
  /**
   * UpgradePolicy defines upgrade rules which will be applied
   * at next publish message.
   * Upgrades in the direction of enhancing security are permitted.
   * `ARBITRARY` => `COMPATIBLE`
   * `ARBITRARY` => `IMMUTABLE`
   * `COMPATIBLE` => `IMMUTABLE`
   * but reverse ways are not allowed (ignored).
   */
  upgrade_policy?: UpgradePolicy;
}
export interface MsgPublishAminoMsg {
  type: 'move/MsgPublish';
  value: MsgPublishAmino;
}
/** MsgPublish is the message to store compiled Move module */
export interface MsgPublishSDKType {
  sender: string;
  code_bytes: Uint8Array[];
  upgrade_policy?: UpgradePolicy;
}
/** MsgPublishResponse returns store result data. */
export interface MsgPublishResponse {}
export interface MsgPublishResponseProtoMsg {
  typeUrl: '/initia.move.v1.MsgPublishResponse';
  value: Uint8Array;
}
/** MsgPublishResponse returns store result data. */
export interface MsgPublishResponseAmino {}
export interface MsgPublishResponseAminoMsg {
  type: '/initia.move.v1.MsgPublishResponse';
  value: MsgPublishResponseAmino;
}
/** MsgPublishResponse returns store result data. */
export interface MsgPublishResponseSDKType {}
/** MsgExecute is the message to execute the given module function */
export interface MsgExecute {
  /** Sender is the that actor that signed the messages */
  sender: string;
  /** ModuleAddr is the address of the module deployer */
  moduleAddress: string;
  /** ModuleName is the name of module to execute */
  moduleName: string;
  /** FunctionName is the name of a function to execute */
  functionName: string;
  /**
   * TypeArgs is the type arguments of a function to execute
   * ex) "0x1::BasicCoin::Initia", "bool", "u8", "u64"
   */
  typeArgs: string[];
  /**
   * Args is the arguments of a function to execute
   * - number: little endian
   * - string: base64 bytes
   */
  args: Uint8Array[];
}
export interface MsgExecuteProtoMsg {
  typeUrl: '/initia.move.v1.MsgExecute';
  value: Uint8Array;
}
/** MsgExecute is the message to execute the given module function */
export interface MsgExecuteAmino {
  /** Sender is the that actor that signed the messages */
  sender?: string;
  /** ModuleAddr is the address of the module deployer */
  module_address?: string;
  /** ModuleName is the name of module to execute */
  module_name?: string;
  /** FunctionName is the name of a function to execute */
  function_name?: string;
  /**
   * TypeArgs is the type arguments of a function to execute
   * ex) "0x1::BasicCoin::Initia", "bool", "u8", "u64"
   */
  type_args?: string[];
  /**
   * Args is the arguments of a function to execute
   * - number: little endian
   * - string: base64 bytes
   */
  args?: string[];
}
export interface MsgExecuteAminoMsg {
  type: 'move/MsgExecute';
  value: MsgExecuteAmino;
}
/** MsgExecute is the message to execute the given module function */
export interface MsgExecuteSDKType {
  sender: string;
  module_address: string;
  module_name: string;
  function_name: string;
  type_args: string[];
  args: Uint8Array[];
}
/** MsgExecuteResponse returns execution result data. */
export interface MsgExecuteResponse {}
export interface MsgExecuteResponseProtoMsg {
  typeUrl: '/initia.move.v1.MsgExecuteResponse';
  value: Uint8Array;
}
/** MsgExecuteResponse returns execution result data. */
export interface MsgExecuteResponseAmino {}
export interface MsgExecuteResponseAminoMsg {
  type: '/initia.move.v1.MsgExecuteResponse';
  value: MsgExecuteResponseAmino;
}
/** MsgExecuteResponse returns execution result data. */
export interface MsgExecuteResponseSDKType {}
/** MsgExecuteJSON is the message to execute the given module function */
export interface MsgExecuteJSON {
  /** Sender is the that actor that signed the messages */
  sender: string;
  /** ModuleAddr is the address of the module deployer */
  moduleAddress: string;
  /** ModuleName is the name of module to execute */
  moduleName: string;
  /** FunctionName is the name of a function to execute */
  functionName: string;
  /**
   * TypeArgs is the type arguments of a function to execute
   * ex) "0x1::BasicCoin::Initia", "bool", "u8", "u64"
   */
  typeArgs: string[];
  /** Args is the arguments of a function to execute in json stringify format */
  args: string[];
}
export interface MsgExecuteJSONProtoMsg {
  typeUrl: '/initia.move.v1.MsgExecuteJSON';
  value: Uint8Array;
}
/** MsgExecuteJSON is the message to execute the given module function */
export interface MsgExecuteJSONAmino {
  /** Sender is the that actor that signed the messages */
  sender?: string;
  /** ModuleAddr is the address of the module deployer */
  module_address?: string;
  /** ModuleName is the name of module to execute */
  module_name?: string;
  /** FunctionName is the name of a function to execute */
  function_name?: string;
  /**
   * TypeArgs is the type arguments of a function to execute
   * ex) "0x1::BasicCoin::Initia", "bool", "u8", "u64"
   */
  type_args?: string[];
  /** Args is the arguments of a function to execute in json stringify format */
  args?: string[];
}
export interface MsgExecuteJSONAminoMsg {
  type: 'move/MsgExecuteJSON';
  value: MsgExecuteJSONAmino;
}
/** MsgExecuteJSON is the message to execute the given module function */
export interface MsgExecuteJSONSDKType {
  sender: string;
  module_address: string;
  module_name: string;
  function_name: string;
  type_args: string[];
  args: string[];
}
/** MsgExecuteJSONResponse returns execution result data. */
export interface MsgExecuteJSONResponse {}
export interface MsgExecuteJSONResponseProtoMsg {
  typeUrl: '/initia.move.v1.MsgExecuteJSONResponse';
  value: Uint8Array;
}
/** MsgExecuteJSONResponse returns execution result data. */
export interface MsgExecuteJSONResponseAmino {}
export interface MsgExecuteJSONResponseAminoMsg {
  type: '/initia.move.v1.MsgExecuteJSONResponse';
  value: MsgExecuteJSONResponseAmino;
}
/** MsgExecuteJSONResponse returns execution result data. */
export interface MsgExecuteJSONResponseSDKType {}
/** MsgScript is the message to execute script code with sender as signer */
export interface MsgScript {
  /** Sender is the that actor that signed the messages */
  sender: string;
  /** CodeBytes is the script bytes code to execute */
  codeBytes: Uint8Array;
  /**
   * TypeArgs is the type arguments of a function to execute
   * ex) "0x1::BasicCoin::Initia", "bool", "u8", "u64"
   */
  typeArgs: string[];
  /**
   * Args is the arguments of a function to execute
   * - number: little endian
   * - string: base64 bytes
   */
  args: Uint8Array[];
}
export interface MsgScriptProtoMsg {
  typeUrl: '/initia.move.v1.MsgScript';
  value: Uint8Array;
}
/** MsgScript is the message to execute script code with sender as signer */
export interface MsgScriptAmino {
  /** Sender is the that actor that signed the messages */
  sender?: string;
  /** CodeBytes is the script bytes code to execute */
  code_bytes?: string;
  /**
   * TypeArgs is the type arguments of a function to execute
   * ex) "0x1::BasicCoin::Initia", "bool", "u8", "u64"
   */
  type_args?: string[];
  /**
   * Args is the arguments of a function to execute
   * - number: little endian
   * - string: base64 bytes
   */
  args?: string[];
}
export interface MsgScriptAminoMsg {
  type: 'move/MsgScript';
  value: MsgScriptAmino;
}
/** MsgScript is the message to execute script code with sender as signer */
export interface MsgScriptSDKType {
  sender: string;
  code_bytes: Uint8Array;
  type_args: string[];
  args: Uint8Array[];
}
/** MsgScriptResponse returns execution result data. */
export interface MsgScriptResponse {}
export interface MsgScriptResponseProtoMsg {
  typeUrl: '/initia.move.v1.MsgScriptResponse';
  value: Uint8Array;
}
/** MsgScriptResponse returns execution result data. */
export interface MsgScriptResponseAmino {}
export interface MsgScriptResponseAminoMsg {
  type: '/initia.move.v1.MsgScriptResponse';
  value: MsgScriptResponseAmino;
}
/** MsgScriptResponse returns execution result data. */
export interface MsgScriptResponseSDKType {}
/** MsgScriptJSON is the message to execute script code with sender as signer */
export interface MsgScriptJSON {
  /** Sender is the that actor that signed the messages */
  sender: string;
  /** CodeBytes is the script bytes code to execute */
  codeBytes: Uint8Array;
  /**
   * TypeArgs is the type arguments of a function to execute
   * ex) "0x1::BasicCoin::Initia", "bool", "u8", "u64"
   */
  typeArgs: string[];
  /** Args is the arguments of a function to execute in json stringify format */
  args: string[];
}
export interface MsgScriptJSONProtoMsg {
  typeUrl: '/initia.move.v1.MsgScriptJSON';
  value: Uint8Array;
}
/** MsgScriptJSON is the message to execute script code with sender as signer */
export interface MsgScriptJSONAmino {
  /** Sender is the that actor that signed the messages */
  sender?: string;
  /** CodeBytes is the script bytes code to execute */
  code_bytes?: string;
  /**
   * TypeArgs is the type arguments of a function to execute
   * ex) "0x1::BasicCoin::Initia", "bool", "u8", "u64"
   */
  type_args?: string[];
  /** Args is the arguments of a function to execute in json stringify format */
  args?: string[];
}
export interface MsgScriptJSONAminoMsg {
  type: 'move/MsgScriptJSON';
  value: MsgScriptJSONAmino;
}
/** MsgScriptJSON is the message to execute script code with sender as signer */
export interface MsgScriptJSONSDKType {
  sender: string;
  code_bytes: Uint8Array;
  type_args: string[];
  args: string[];
}
/** MsgScriptJSONResponse returns execution result data. */
export interface MsgScriptJSONResponse {}
export interface MsgScriptJSONResponseProtoMsg {
  typeUrl: '/initia.move.v1.MsgScriptJSONResponse';
  value: Uint8Array;
}
/** MsgScriptJSONResponse returns execution result data. */
export interface MsgScriptJSONResponseAmino {}
export interface MsgScriptJSONResponseAminoMsg {
  type: '/initia.move.v1.MsgScriptJSONResponse';
  value: MsgScriptJSONResponseAmino;
}
/** MsgScriptJSONResponse returns execution result data. */
export interface MsgScriptJSONResponseSDKType {}
/** MsgGovPublish is the message to store compiled Move module via gov proposal */
export interface MsgGovPublish {
  /**
   * authority is the address that controls the module
   * (defaults to x/gov unless overwritten).
   */
  authority: string;
  /** Sender is the that actor that signed the messages */
  sender: string;
  /** CodeBytes is raw move module bytes code */
  codeBytes: Uint8Array[];
  /**
   * UpgradePolicy defines upgrade rules which will be applied
   * at next publish message.
   * Upgrades in the direction of enhancing security are permitted.
   * `ARBITRARY` => `COMPATIBLE`
   * `ARBITRARY` => `IMMUTABLE`
   * `COMPATIBLE` => `IMMUTABLE`
   * but reverse ways are not allowed (ignored).
   */
  upgradePolicy?: UpgradePolicy;
}
export interface MsgGovPublishProtoMsg {
  typeUrl: '/initia.move.v1.MsgGovPublish';
  value: Uint8Array;
}
/** MsgGovPublish is the message to store compiled Move module via gov proposal */
export interface MsgGovPublishAmino {
  /**
   * authority is the address that controls the module
   * (defaults to x/gov unless overwritten).
   */
  authority?: string;
  /** Sender is the that actor that signed the messages */
  sender?: string;
  /** CodeBytes is raw move module bytes code */
  code_bytes?: string[];
  /**
   * UpgradePolicy defines upgrade rules which will be applied
   * at next publish message.
   * Upgrades in the direction of enhancing security are permitted.
   * `ARBITRARY` => `COMPATIBLE`
   * `ARBITRARY` => `IMMUTABLE`
   * `COMPATIBLE` => `IMMUTABLE`
   * but reverse ways are not allowed (ignored).
   */
  upgrade_policy?: UpgradePolicy;
}
export interface MsgGovPublishAminoMsg {
  type: 'move/MsgGovPublish';
  value: MsgGovPublishAmino;
}
/** MsgGovPublish is the message to store compiled Move module via gov proposal */
export interface MsgGovPublishSDKType {
  authority: string;
  sender: string;
  code_bytes: Uint8Array[];
  upgrade_policy?: UpgradePolicy;
}
/** MsgGovPublishResponse returns execution result data. */
export interface MsgGovPublishResponse {}
export interface MsgGovPublishResponseProtoMsg {
  typeUrl: '/initia.move.v1.MsgGovPublishResponse';
  value: Uint8Array;
}
/** MsgGovPublishResponse returns execution result data. */
export interface MsgGovPublishResponseAmino {}
export interface MsgGovPublishResponseAminoMsg {
  type: '/initia.move.v1.MsgGovPublishResponse';
  value: MsgGovPublishResponseAmino;
}
/** MsgGovPublishResponse returns execution result data. */
export interface MsgGovPublishResponseSDKType {}
/**
 * MsgGovExecute is the message to execute the given module
 * function via gov proposal
 */
export interface MsgGovExecute {
  /**
   * authority is the address that controls the module
   * (defaults to x/gov unless overwritten).
   */
  authority: string;
  /** Sender is the that actor that signed the messages */
  sender: string;
  /** ModuleAddr is the address of the module deployer */
  moduleAddress: string;
  /** ModuleName is the name of module to execute */
  moduleName: string;
  /** FunctionName is the name of a function to execute */
  functionName: string;
  /**
   * TypeArgs is the type arguments of a function to execute
   * ex) "0x1::BasicCoin::Initia", "bool", "u8", "u64"
   */
  typeArgs: string[];
  /**
   * Args is the arguments of a function to execute
   * - number: little endian
   * - string: base64 bytes
   */
  args: Uint8Array[];
}
export interface MsgGovExecuteProtoMsg {
  typeUrl: '/initia.move.v1.MsgGovExecute';
  value: Uint8Array;
}
/**
 * MsgGovExecute is the message to execute the given module
 * function via gov proposal
 */
export interface MsgGovExecuteAmino {
  /**
   * authority is the address that controls the module
   * (defaults to x/gov unless overwritten).
   */
  authority?: string;
  /** Sender is the that actor that signed the messages */
  sender?: string;
  /** ModuleAddr is the address of the module deployer */
  module_address?: string;
  /** ModuleName is the name of module to execute */
  module_name?: string;
  /** FunctionName is the name of a function to execute */
  function_name?: string;
  /**
   * TypeArgs is the type arguments of a function to execute
   * ex) "0x1::BasicCoin::Initia", "bool", "u8", "u64"
   */
  type_args?: string[];
  /**
   * Args is the arguments of a function to execute
   * - number: little endian
   * - string: base64 bytes
   */
  args?: string[];
}
export interface MsgGovExecuteAminoMsg {
  type: 'move/MsgGovExecute';
  value: MsgGovExecuteAmino;
}
/**
 * MsgGovExecute is the message to execute the given module
 * function via gov proposal
 */
export interface MsgGovExecuteSDKType {
  authority: string;
  sender: string;
  module_address: string;
  module_name: string;
  function_name: string;
  type_args: string[];
  args: Uint8Array[];
}
/** MsgGovExecuteResponse returns execution result data. */
export interface MsgGovExecuteResponse {}
export interface MsgGovExecuteResponseProtoMsg {
  typeUrl: '/initia.move.v1.MsgGovExecuteResponse';
  value: Uint8Array;
}
/** MsgGovExecuteResponse returns execution result data. */
export interface MsgGovExecuteResponseAmino {}
export interface MsgGovExecuteResponseAminoMsg {
  type: '/initia.move.v1.MsgGovExecuteResponse';
  value: MsgGovExecuteResponseAmino;
}
/** MsgGovExecuteResponse returns execution result data. */
export interface MsgGovExecuteResponseSDKType {}
/**
 * MsgGovExecuteJSON is the message to execute the given module
 * function via gov proposal
 */
export interface MsgGovExecuteJSON {
  /**
   * authority is the address that controls the module
   * (defaults to x/gov unless overwritten).
   */
  authority: string;
  /** Sender is the that actor that signed the messages */
  sender: string;
  /** ModuleAddr is the address of the module deployer */
  moduleAddress: string;
  /** ModuleName is the name of module to execute */
  moduleName: string;
  /** FunctionName is the name of a function to execute */
  functionName: string;
  /**
   * TypeArgs is the type arguments of a function to execute
   * ex) "0x1::BasicCoin::Initia", "bool", "u8", "u64"
   */
  typeArgs: string[];
  /** Args is the arguments of a function to execute in json stringify format */
  args: string[];
}
export interface MsgGovExecuteJSONProtoMsg {
  typeUrl: '/initia.move.v1.MsgGovExecuteJSON';
  value: Uint8Array;
}
/**
 * MsgGovExecuteJSON is the message to execute the given module
 * function via gov proposal
 */
export interface MsgGovExecuteJSONAmino {
  /**
   * authority is the address that controls the module
   * (defaults to x/gov unless overwritten).
   */
  authority?: string;
  /** Sender is the that actor that signed the messages */
  sender?: string;
  /** ModuleAddr is the address of the module deployer */
  module_address?: string;
  /** ModuleName is the name of module to execute */
  module_name?: string;
  /** FunctionName is the name of a function to execute */
  function_name?: string;
  /**
   * TypeArgs is the type arguments of a function to execute
   * ex) "0x1::BasicCoin::Initia", "bool", "u8", "u64"
   */
  type_args?: string[];
  /** Args is the arguments of a function to execute in json stringify format */
  args?: string[];
}
export interface MsgGovExecuteJSONAminoMsg {
  type: 'move/MsgGovExecuteJSON';
  value: MsgGovExecuteJSONAmino;
}
/**
 * MsgGovExecuteJSON is the message to execute the given module
 * function via gov proposal
 */
export interface MsgGovExecuteJSONSDKType {
  authority: string;
  sender: string;
  module_address: string;
  module_name: string;
  function_name: string;
  type_args: string[];
  args: string[];
}
/** MsgGovExecuteJSONResponse returns execution result data. */
export interface MsgGovExecuteJSONResponse {}
export interface MsgGovExecuteJSONResponseProtoMsg {
  typeUrl: '/initia.move.v1.MsgGovExecuteJSONResponse';
  value: Uint8Array;
}
/** MsgGovExecuteJSONResponse returns execution result data. */
export interface MsgGovExecuteJSONResponseAmino {}
export interface MsgGovExecuteJSONResponseAminoMsg {
  type: '/initia.move.v1.MsgGovExecuteJSONResponse';
  value: MsgGovExecuteJSONResponseAmino;
}
/** MsgGovExecuteJSONResponse returns execution result data. */
export interface MsgGovExecuteJSONResponseSDKType {}
/** MsgGovScript is the message to execute script code with sender as signer via gov */
export interface MsgGovScript {
  /**
   * authority is the address that controls the module
   * (defaults to x/gov unless overwritten).
   */
  authority: string;
  /** Sender is the that actor that signed the messages */
  sender: string;
  /** CodeBytes is the script bytes code to execute */
  codeBytes: Uint8Array;
  /**
   * TypeArgs is the type arguments of a function to execute
   * ex) "0x1::BasicCoin::Initia", "bool", "u8", "u64"
   */
  typeArgs: string[];
  /**
   * Args is the arguments of a function to execute
   * - number: little endian
   * - string: base64 bytes
   */
  args: Uint8Array[];
}
export interface MsgGovScriptProtoMsg {
  typeUrl: '/initia.move.v1.MsgGovScript';
  value: Uint8Array;
}
/** MsgGovScript is the message to execute script code with sender as signer via gov */
export interface MsgGovScriptAmino {
  /**
   * authority is the address that controls the module
   * (defaults to x/gov unless overwritten).
   */
  authority?: string;
  /** Sender is the that actor that signed the messages */
  sender?: string;
  /** CodeBytes is the script bytes code to execute */
  code_bytes?: string;
  /**
   * TypeArgs is the type arguments of a function to execute
   * ex) "0x1::BasicCoin::Initia", "bool", "u8", "u64"
   */
  type_args?: string[];
  /**
   * Args is the arguments of a function to execute
   * - number: little endian
   * - string: base64 bytes
   */
  args?: string[];
}
export interface MsgGovScriptAminoMsg {
  type: 'move/MsgGovScript';
  value: MsgGovScriptAmino;
}
/** MsgGovScript is the message to execute script code with sender as signer via gov */
export interface MsgGovScriptSDKType {
  authority: string;
  sender: string;
  code_bytes: Uint8Array;
  type_args: string[];
  args: Uint8Array[];
}
/** MsgGovScriptResponse returns execution result data. */
export interface MsgGovScriptResponse {}
export interface MsgGovScriptResponseProtoMsg {
  typeUrl: '/initia.move.v1.MsgGovScriptResponse';
  value: Uint8Array;
}
/** MsgGovScriptResponse returns execution result data. */
export interface MsgGovScriptResponseAmino {}
export interface MsgGovScriptResponseAminoMsg {
  type: '/initia.move.v1.MsgGovScriptResponse';
  value: MsgGovScriptResponseAmino;
}
/** MsgGovScriptResponse returns execution result data. */
export interface MsgGovScriptResponseSDKType {}
/** MsgGovScriptJSON is the message to execute script code with sender as signer via gov */
export interface MsgGovScriptJSON {
  /**
   * authority is the address that controls the module
   * (defaults to x/gov unless overwritten).
   */
  authority: string;
  /** Sender is the that actor that signed the messages */
  sender: string;
  /** CodeBytes is the script bytes code to execute */
  codeBytes: Uint8Array;
  /**
   * TypeArgs is the type arguments of a function to execute
   * ex) "0x1::BasicCoin::Initia", "bool", "u8", "u64"
   */
  typeArgs: string[];
  /** Args is the arguments of a function to execute in json stringify format */
  args: string[];
}
export interface MsgGovScriptJSONProtoMsg {
  typeUrl: '/initia.move.v1.MsgGovScriptJSON';
  value: Uint8Array;
}
/** MsgGovScriptJSON is the message to execute script code with sender as signer via gov */
export interface MsgGovScriptJSONAmino {
  /**
   * authority is the address that controls the module
   * (defaults to x/gov unless overwritten).
   */
  authority?: string;
  /** Sender is the that actor that signed the messages */
  sender?: string;
  /** CodeBytes is the script bytes code to execute */
  code_bytes?: string;
  /**
   * TypeArgs is the type arguments of a function to execute
   * ex) "0x1::BasicCoin::Initia", "bool", "u8", "u64"
   */
  type_args?: string[];
  /** Args is the arguments of a function to execute in json stringify format */
  args?: string[];
}
export interface MsgGovScriptJSONAminoMsg {
  type: 'move/MsgGovScriptJSON';
  value: MsgGovScriptJSONAmino;
}
/** MsgGovScriptJSON is the message to execute script code with sender as signer via gov */
export interface MsgGovScriptJSONSDKType {
  authority: string;
  sender: string;
  code_bytes: Uint8Array;
  type_args: string[];
  args: string[];
}
/** MsgGovScriptJSONResponse returns execution result data. */
export interface MsgGovScriptJSONResponse {}
export interface MsgGovScriptJSONResponseProtoMsg {
  typeUrl: '/initia.move.v1.MsgGovScriptJSONResponse';
  value: Uint8Array;
}
/** MsgGovScriptJSONResponse returns execution result data. */
export interface MsgGovScriptJSONResponseAmino {}
export interface MsgGovScriptJSONResponseAminoMsg {
  type: '/initia.move.v1.MsgGovScriptJSONResponse';
  value: MsgGovScriptJSONResponseAmino;
}
/** MsgGovScriptJSONResponse returns execution result data. */
export interface MsgGovScriptJSONResponseSDKType {}
/**
 * MsgWhitelist is a message to register a dex pair to
 * whitelist of various features.
 * - whitelist from coin register operation
 * - allow counter party denom can be used as gas fee
 * - register lp denom as staking denom
 */
export interface MsgWhitelist {
  /**
   * authority is the address that controls the module
   * (defaults to x/gov unless overwritten).
   */
  authority: string;
  /** Dex coin LP metadata address */
  metadataLp: string;
  /** RewardWeight is registered to distribution's Params */
  rewardWeight: string;
}
export interface MsgWhitelistProtoMsg {
  typeUrl: '/initia.move.v1.MsgWhitelist';
  value: Uint8Array;
}
/**
 * MsgWhitelist is a message to register a dex pair to
 * whitelist of various features.
 * - whitelist from coin register operation
 * - allow counter party denom can be used as gas fee
 * - register lp denom as staking denom
 */
export interface MsgWhitelistAmino {
  /**
   * authority is the address that controls the module
   * (defaults to x/gov unless overwritten).
   */
  authority?: string;
  /** Dex coin LP metadata address */
  metadata_lp?: string;
  /** RewardWeight is registered to distribution's Params */
  reward_weight?: string;
}
export interface MsgWhitelistAminoMsg {
  type: 'move/MsgWhitelist';
  value: MsgWhitelistAmino;
}
/**
 * MsgWhitelist is a message to register a dex pair to
 * whitelist of various features.
 * - whitelist from coin register operation
 * - allow counter party denom can be used as gas fee
 * - register lp denom as staking denom
 */
export interface MsgWhitelistSDKType {
  authority: string;
  metadata_lp: string;
  reward_weight: string;
}
/** MsgWhitelistResponse returns result data. */
export interface MsgWhitelistResponse {}
export interface MsgWhitelistResponseProtoMsg {
  typeUrl: '/initia.move.v1.MsgWhitelistResponse';
  value: Uint8Array;
}
/** MsgWhitelistResponse returns result data. */
export interface MsgWhitelistResponseAmino {}
export interface MsgWhitelistResponseAminoMsg {
  type: '/initia.move.v1.MsgWhitelistResponse';
  value: MsgWhitelistResponseAmino;
}
/** MsgWhitelistResponse returns result data. */
export interface MsgWhitelistResponseSDKType {}
/**
 * MsgDelist is a message to unregister a dex pair
 * from the whitelist of various features.
 */
export interface MsgDelist {
  /**
   * authority is the address that controls the module
   * (defaults to x/gov unless overwritten).
   */
  authority: string;
  /** Dex coin LP metadata address */
  metadataLp: string;
}
export interface MsgDelistProtoMsg {
  typeUrl: '/initia.move.v1.MsgDelist';
  value: Uint8Array;
}
/**
 * MsgDelist is a message to unregister a dex pair
 * from the whitelist of various features.
 */
export interface MsgDelistAmino {
  /**
   * authority is the address that controls the module
   * (defaults to x/gov unless overwritten).
   */
  authority?: string;
  /** Dex coin LP metadata address */
  metadata_lp?: string;
}
export interface MsgDelistAminoMsg {
  type: 'move/MsgWhitelist';
  value: MsgDelistAmino;
}
/**
 * MsgDelist is a message to unregister a dex pair
 * from the whitelist of various features.
 */
export interface MsgDelistSDKType {
  authority: string;
  metadata_lp: string;
}
/** MsgDelistResponse returns result data. */
export interface MsgDelistResponse {}
export interface MsgDelistResponseProtoMsg {
  typeUrl: '/initia.move.v1.MsgDelistResponse';
  value: Uint8Array;
}
/** MsgDelistResponse returns result data. */
export interface MsgDelistResponseAmino {}
export interface MsgDelistResponseAminoMsg {
  type: '/initia.move.v1.MsgDelistResponse';
  value: MsgDelistResponseAmino;
}
/** MsgDelistResponse returns result data. */
export interface MsgDelistResponseSDKType {}
/** MsgUpdateParams is the Msg/UpdateParams request type. */
export interface MsgUpdateParams {
  /**
   * authority is the address that controls the module
   * (defaults to x/gov unless overwritten).
   */
  authority: string;
  /**
   * params defines the x/staking parameters to update.
   *
   * NOTE: All parameters must be supplied.
   */
  params: Params;
}
export interface MsgUpdateParamsProtoMsg {
  typeUrl: '/initia.move.v1.MsgUpdateParams';
  value: Uint8Array;
}
/** MsgUpdateParams is the Msg/UpdateParams request type. */
export interface MsgUpdateParamsAmino {
  /**
   * authority is the address that controls the module
   * (defaults to x/gov unless overwritten).
   */
  authority?: string;
  /**
   * params defines the x/staking parameters to update.
   *
   * NOTE: All parameters must be supplied.
   */
  params: ParamsAmino;
}
export interface MsgUpdateParamsAminoMsg {
  type: 'move/MsgUpdateParams';
  value: MsgUpdateParamsAmino;
}
/** MsgUpdateParams is the Msg/UpdateParams request type. */
export interface MsgUpdateParamsSDKType {
  authority: string;
  params: ParamsSDKType;
}
/**
 * MsgUpdateParamsResponse defines the response structure for executing a
 * MsgUpdateParams message.
 */
export interface MsgUpdateParamsResponse {}
export interface MsgUpdateParamsResponseProtoMsg {
  typeUrl: '/initia.move.v1.MsgUpdateParamsResponse';
  value: Uint8Array;
}
/**
 * MsgUpdateParamsResponse defines the response structure for executing a
 * MsgUpdateParams message.
 */
export interface MsgUpdateParamsResponseAmino {}
export interface MsgUpdateParamsResponseAminoMsg {
  type: '/initia.move.v1.MsgUpdateParamsResponse';
  value: MsgUpdateParamsResponseAmino;
}
/**
 * MsgUpdateParamsResponse defines the response structure for executing a
 * MsgUpdateParams message.
 */
export interface MsgUpdateParamsResponseSDKType {}
function createBaseMsgPublish(): MsgPublish {
  return {
    sender: '',
    codeBytes: [],
    upgradePolicy: undefined,
  };
}
export const MsgPublish = {
  typeUrl: '/initia.move.v1.MsgPublish',
  encode(message: MsgPublish, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    for (const v of message.codeBytes) {
      writer.uint32(18).bytes(v!);
    }
    if (message.upgradePolicy !== undefined) {
      writer.uint32(24).int32(message.upgradePolicy);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgPublish {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgPublish();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.codeBytes.push(reader.bytes());
          break;
        case 3:
          message.upgradePolicy = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgPublish>): MsgPublish {
    const message = createBaseMsgPublish();
    message.sender = object.sender ?? '';
    message.codeBytes = object.codeBytes?.map((e) => e) || [];
    message.upgradePolicy = object.upgradePolicy ?? undefined;
    return message;
  },
  fromAmino(object: MsgPublishAmino): MsgPublish {
    const message = createBaseMsgPublish();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    message.codeBytes = object.code_bytes?.map((e) => bytesFromBase64(e)) || [];
    if (object.upgrade_policy !== undefined && object.upgrade_policy !== null) {
      message.upgradePolicy = object.upgrade_policy;
    }
    return message;
  },
  toAmino(message: MsgPublish): MsgPublishAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    if (message.codeBytes) {
      obj.code_bytes = message.codeBytes.map((e) => base64FromBytes(e));
    } else {
      obj.code_bytes = message.codeBytes;
    }
    obj.upgrade_policy = message.upgradePolicy === null ? undefined : message.upgradePolicy;
    return obj;
  },
  fromAminoMsg(object: MsgPublishAminoMsg): MsgPublish {
    return MsgPublish.fromAmino(object.value);
  },
  toAminoMsg(message: MsgPublish): MsgPublishAminoMsg {
    return {
      type: 'move/MsgPublish',
      value: MsgPublish.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgPublishProtoMsg): MsgPublish {
    return MsgPublish.decode(message.value);
  },
  toProto(message: MsgPublish): Uint8Array {
    return MsgPublish.encode(message).finish();
  },
  toProtoMsg(message: MsgPublish): MsgPublishProtoMsg {
    return {
      typeUrl: '/initia.move.v1.MsgPublish',
      value: MsgPublish.encode(message).finish(),
    };
  },
};
function createBaseMsgPublishResponse(): MsgPublishResponse {
  return {};
}
export const MsgPublishResponse = {
  typeUrl: '/initia.move.v1.MsgPublishResponse',
  encode(_: MsgPublishResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgPublishResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgPublishResponse();
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
  fromPartial(_: Partial<MsgPublishResponse>): MsgPublishResponse {
    const message = createBaseMsgPublishResponse();
    return message;
  },
  fromAmino(_: MsgPublishResponseAmino): MsgPublishResponse {
    const message = createBaseMsgPublishResponse();
    return message;
  },
  toAmino(_: MsgPublishResponse): MsgPublishResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgPublishResponseAminoMsg): MsgPublishResponse {
    return MsgPublishResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgPublishResponseProtoMsg): MsgPublishResponse {
    return MsgPublishResponse.decode(message.value);
  },
  toProto(message: MsgPublishResponse): Uint8Array {
    return MsgPublishResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgPublishResponse): MsgPublishResponseProtoMsg {
    return {
      typeUrl: '/initia.move.v1.MsgPublishResponse',
      value: MsgPublishResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgExecute(): MsgExecute {
  return {
    sender: '',
    moduleAddress: '',
    moduleName: '',
    functionName: '',
    typeArgs: [],
    args: [],
  };
}
export const MsgExecute = {
  typeUrl: '/initia.move.v1.MsgExecute',
  encode(message: MsgExecute, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.moduleAddress !== '') {
      writer.uint32(18).string(message.moduleAddress);
    }
    if (message.moduleName !== '') {
      writer.uint32(26).string(message.moduleName);
    }
    if (message.functionName !== '') {
      writer.uint32(34).string(message.functionName);
    }
    for (const v of message.typeArgs) {
      writer.uint32(42).string(v!);
    }
    for (const v of message.args) {
      writer.uint32(50).bytes(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgExecute {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgExecute();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.moduleAddress = reader.string();
          break;
        case 3:
          message.moduleName = reader.string();
          break;
        case 4:
          message.functionName = reader.string();
          break;
        case 5:
          message.typeArgs.push(reader.string());
          break;
        case 6:
          message.args.push(reader.bytes());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgExecute>): MsgExecute {
    const message = createBaseMsgExecute();
    message.sender = object.sender ?? '';
    message.moduleAddress = object.moduleAddress ?? '';
    message.moduleName = object.moduleName ?? '';
    message.functionName = object.functionName ?? '';
    message.typeArgs = object.typeArgs?.map((e) => e) || [];
    message.args = object.args?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: MsgExecuteAmino): MsgExecute {
    const message = createBaseMsgExecute();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.module_address !== undefined && object.module_address !== null) {
      message.moduleAddress = object.module_address;
    }
    if (object.module_name !== undefined && object.module_name !== null) {
      message.moduleName = object.module_name;
    }
    if (object.function_name !== undefined && object.function_name !== null) {
      message.functionName = object.function_name;
    }
    message.typeArgs = object.type_args?.map((e) => e) || [];
    message.args = object.args?.map((e) => bytesFromBase64(e)) || [];
    return message;
  },
  toAmino(message: MsgExecute): MsgExecuteAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.module_address = message.moduleAddress === '' ? undefined : message.moduleAddress;
    obj.module_name = message.moduleName === '' ? undefined : message.moduleName;
    obj.function_name = message.functionName === '' ? undefined : message.functionName;
    if (message.typeArgs) {
      obj.type_args = message.typeArgs.map((e) => e);
    } else {
      obj.type_args = message.typeArgs;
    }
    if (message.args) {
      obj.args = message.args.map((e) => base64FromBytes(e));
    } else {
      obj.args = message.args;
    }
    return obj;
  },
  fromAminoMsg(object: MsgExecuteAminoMsg): MsgExecute {
    return MsgExecute.fromAmino(object.value);
  },
  toAminoMsg(message: MsgExecute): MsgExecuteAminoMsg {
    return {
      type: 'move/MsgExecute',
      value: MsgExecute.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgExecuteProtoMsg): MsgExecute {
    return MsgExecute.decode(message.value);
  },
  toProto(message: MsgExecute): Uint8Array {
    return MsgExecute.encode(message).finish();
  },
  toProtoMsg(message: MsgExecute): MsgExecuteProtoMsg {
    return {
      typeUrl: '/initia.move.v1.MsgExecute',
      value: MsgExecute.encode(message).finish(),
    };
  },
};
function createBaseMsgExecuteResponse(): MsgExecuteResponse {
  return {};
}
export const MsgExecuteResponse = {
  typeUrl: '/initia.move.v1.MsgExecuteResponse',
  encode(_: MsgExecuteResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgExecuteResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgExecuteResponse();
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
  fromPartial(_: Partial<MsgExecuteResponse>): MsgExecuteResponse {
    const message = createBaseMsgExecuteResponse();
    return message;
  },
  fromAmino(_: MsgExecuteResponseAmino): MsgExecuteResponse {
    const message = createBaseMsgExecuteResponse();
    return message;
  },
  toAmino(_: MsgExecuteResponse): MsgExecuteResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgExecuteResponseAminoMsg): MsgExecuteResponse {
    return MsgExecuteResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgExecuteResponseProtoMsg): MsgExecuteResponse {
    return MsgExecuteResponse.decode(message.value);
  },
  toProto(message: MsgExecuteResponse): Uint8Array {
    return MsgExecuteResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgExecuteResponse): MsgExecuteResponseProtoMsg {
    return {
      typeUrl: '/initia.move.v1.MsgExecuteResponse',
      value: MsgExecuteResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgExecuteJSON(): MsgExecuteJSON {
  return {
    sender: '',
    moduleAddress: '',
    moduleName: '',
    functionName: '',
    typeArgs: [],
    args: [],
  };
}
export const MsgExecuteJSON = {
  typeUrl: '/initia.move.v1.MsgExecuteJSON',
  encode(message: MsgExecuteJSON, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.moduleAddress !== '') {
      writer.uint32(18).string(message.moduleAddress);
    }
    if (message.moduleName !== '') {
      writer.uint32(26).string(message.moduleName);
    }
    if (message.functionName !== '') {
      writer.uint32(34).string(message.functionName);
    }
    for (const v of message.typeArgs) {
      writer.uint32(42).string(v!);
    }
    for (const v of message.args) {
      writer.uint32(50).string(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgExecuteJSON {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgExecuteJSON();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.moduleAddress = reader.string();
          break;
        case 3:
          message.moduleName = reader.string();
          break;
        case 4:
          message.functionName = reader.string();
          break;
        case 5:
          message.typeArgs.push(reader.string());
          break;
        case 6:
          message.args.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgExecuteJSON>): MsgExecuteJSON {
    const message = createBaseMsgExecuteJSON();
    message.sender = object.sender ?? '';
    message.moduleAddress = object.moduleAddress ?? '';
    message.moduleName = object.moduleName ?? '';
    message.functionName = object.functionName ?? '';
    message.typeArgs = object.typeArgs?.map((e) => e) || [];
    message.args = object.args?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: MsgExecuteJSONAmino): MsgExecuteJSON {
    const message = createBaseMsgExecuteJSON();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.module_address !== undefined && object.module_address !== null) {
      message.moduleAddress = object.module_address;
    }
    if (object.module_name !== undefined && object.module_name !== null) {
      message.moduleName = object.module_name;
    }
    if (object.function_name !== undefined && object.function_name !== null) {
      message.functionName = object.function_name;
    }
    message.typeArgs = object.type_args?.map((e) => e) || [];
    message.args = object.args?.map((e) => e) || [];
    return message;
  },
  toAmino(message: MsgExecuteJSON): MsgExecuteJSONAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.module_address = message.moduleAddress === '' ? undefined : message.moduleAddress;
    obj.module_name = message.moduleName === '' ? undefined : message.moduleName;
    obj.function_name = message.functionName === '' ? undefined : message.functionName;
    if (message.typeArgs) {
      obj.type_args = message.typeArgs.map((e) => e);
    } else {
      obj.type_args = message.typeArgs;
    }
    if (message.args) {
      obj.args = message.args.map((e) => e);
    } else {
      obj.args = message.args;
    }
    return obj;
  },
  fromAminoMsg(object: MsgExecuteJSONAminoMsg): MsgExecuteJSON {
    return MsgExecuteJSON.fromAmino(object.value);
  },
  toAminoMsg(message: MsgExecuteJSON): MsgExecuteJSONAminoMsg {
    return {
      type: 'move/MsgExecuteJSON',
      value: MsgExecuteJSON.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgExecuteJSONProtoMsg): MsgExecuteJSON {
    return MsgExecuteJSON.decode(message.value);
  },
  toProto(message: MsgExecuteJSON): Uint8Array {
    return MsgExecuteJSON.encode(message).finish();
  },
  toProtoMsg(message: MsgExecuteJSON): MsgExecuteJSONProtoMsg {
    return {
      typeUrl: '/initia.move.v1.MsgExecuteJSON',
      value: MsgExecuteJSON.encode(message).finish(),
    };
  },
};
function createBaseMsgExecuteJSONResponse(): MsgExecuteJSONResponse {
  return {};
}
export const MsgExecuteJSONResponse = {
  typeUrl: '/initia.move.v1.MsgExecuteJSONResponse',
  encode(_: MsgExecuteJSONResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgExecuteJSONResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgExecuteJSONResponse();
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
  fromPartial(_: Partial<MsgExecuteJSONResponse>): MsgExecuteJSONResponse {
    const message = createBaseMsgExecuteJSONResponse();
    return message;
  },
  fromAmino(_: MsgExecuteJSONResponseAmino): MsgExecuteJSONResponse {
    const message = createBaseMsgExecuteJSONResponse();
    return message;
  },
  toAmino(_: MsgExecuteJSONResponse): MsgExecuteJSONResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgExecuteJSONResponseAminoMsg): MsgExecuteJSONResponse {
    return MsgExecuteJSONResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgExecuteJSONResponseProtoMsg): MsgExecuteJSONResponse {
    return MsgExecuteJSONResponse.decode(message.value);
  },
  toProto(message: MsgExecuteJSONResponse): Uint8Array {
    return MsgExecuteJSONResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgExecuteJSONResponse): MsgExecuteJSONResponseProtoMsg {
    return {
      typeUrl: '/initia.move.v1.MsgExecuteJSONResponse',
      value: MsgExecuteJSONResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgScript(): MsgScript {
  return {
    sender: '',
    codeBytes: new Uint8Array(),
    typeArgs: [],
    args: [],
  };
}
export const MsgScript = {
  typeUrl: '/initia.move.v1.MsgScript',
  encode(message: MsgScript, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.codeBytes.length !== 0) {
      writer.uint32(18).bytes(message.codeBytes);
    }
    for (const v of message.typeArgs) {
      writer.uint32(26).string(v!);
    }
    for (const v of message.args) {
      writer.uint32(34).bytes(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgScript {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgScript();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.codeBytes = reader.bytes();
          break;
        case 3:
          message.typeArgs.push(reader.string());
          break;
        case 4:
          message.args.push(reader.bytes());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgScript>): MsgScript {
    const message = createBaseMsgScript();
    message.sender = object.sender ?? '';
    message.codeBytes = object.codeBytes ?? new Uint8Array();
    message.typeArgs = object.typeArgs?.map((e) => e) || [];
    message.args = object.args?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: MsgScriptAmino): MsgScript {
    const message = createBaseMsgScript();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.code_bytes !== undefined && object.code_bytes !== null) {
      message.codeBytes = bytesFromBase64(object.code_bytes);
    }
    message.typeArgs = object.type_args?.map((e) => e) || [];
    message.args = object.args?.map((e) => bytesFromBase64(e)) || [];
    return message;
  },
  toAmino(message: MsgScript): MsgScriptAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.code_bytes = message.codeBytes ? base64FromBytes(message.codeBytes) : undefined;
    if (message.typeArgs) {
      obj.type_args = message.typeArgs.map((e) => e);
    } else {
      obj.type_args = message.typeArgs;
    }
    if (message.args) {
      obj.args = message.args.map((e) => base64FromBytes(e));
    } else {
      obj.args = message.args;
    }
    return obj;
  },
  fromAminoMsg(object: MsgScriptAminoMsg): MsgScript {
    return MsgScript.fromAmino(object.value);
  },
  toAminoMsg(message: MsgScript): MsgScriptAminoMsg {
    return {
      type: 'move/MsgScript',
      value: MsgScript.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgScriptProtoMsg): MsgScript {
    return MsgScript.decode(message.value);
  },
  toProto(message: MsgScript): Uint8Array {
    return MsgScript.encode(message).finish();
  },
  toProtoMsg(message: MsgScript): MsgScriptProtoMsg {
    return {
      typeUrl: '/initia.move.v1.MsgScript',
      value: MsgScript.encode(message).finish(),
    };
  },
};
function createBaseMsgScriptResponse(): MsgScriptResponse {
  return {};
}
export const MsgScriptResponse = {
  typeUrl: '/initia.move.v1.MsgScriptResponse',
  encode(_: MsgScriptResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgScriptResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgScriptResponse();
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
  fromPartial(_: Partial<MsgScriptResponse>): MsgScriptResponse {
    const message = createBaseMsgScriptResponse();
    return message;
  },
  fromAmino(_: MsgScriptResponseAmino): MsgScriptResponse {
    const message = createBaseMsgScriptResponse();
    return message;
  },
  toAmino(_: MsgScriptResponse): MsgScriptResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgScriptResponseAminoMsg): MsgScriptResponse {
    return MsgScriptResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgScriptResponseProtoMsg): MsgScriptResponse {
    return MsgScriptResponse.decode(message.value);
  },
  toProto(message: MsgScriptResponse): Uint8Array {
    return MsgScriptResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgScriptResponse): MsgScriptResponseProtoMsg {
    return {
      typeUrl: '/initia.move.v1.MsgScriptResponse',
      value: MsgScriptResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgScriptJSON(): MsgScriptJSON {
  return {
    sender: '',
    codeBytes: new Uint8Array(),
    typeArgs: [],
    args: [],
  };
}
export const MsgScriptJSON = {
  typeUrl: '/initia.move.v1.MsgScriptJSON',
  encode(message: MsgScriptJSON, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.sender !== '') {
      writer.uint32(10).string(message.sender);
    }
    if (message.codeBytes.length !== 0) {
      writer.uint32(18).bytes(message.codeBytes);
    }
    for (const v of message.typeArgs) {
      writer.uint32(26).string(v!);
    }
    for (const v of message.args) {
      writer.uint32(34).string(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgScriptJSON {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgScriptJSON();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.codeBytes = reader.bytes();
          break;
        case 3:
          message.typeArgs.push(reader.string());
          break;
        case 4:
          message.args.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgScriptJSON>): MsgScriptJSON {
    const message = createBaseMsgScriptJSON();
    message.sender = object.sender ?? '';
    message.codeBytes = object.codeBytes ?? new Uint8Array();
    message.typeArgs = object.typeArgs?.map((e) => e) || [];
    message.args = object.args?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: MsgScriptJSONAmino): MsgScriptJSON {
    const message = createBaseMsgScriptJSON();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.code_bytes !== undefined && object.code_bytes !== null) {
      message.codeBytes = bytesFromBase64(object.code_bytes);
    }
    message.typeArgs = object.type_args?.map((e) => e) || [];
    message.args = object.args?.map((e) => e) || [];
    return message;
  },
  toAmino(message: MsgScriptJSON): MsgScriptJSONAmino {
    const obj: any = {};
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.code_bytes = message.codeBytes ? base64FromBytes(message.codeBytes) : undefined;
    if (message.typeArgs) {
      obj.type_args = message.typeArgs.map((e) => e);
    } else {
      obj.type_args = message.typeArgs;
    }
    if (message.args) {
      obj.args = message.args.map((e) => e);
    } else {
      obj.args = message.args;
    }
    return obj;
  },
  fromAminoMsg(object: MsgScriptJSONAminoMsg): MsgScriptJSON {
    return MsgScriptJSON.fromAmino(object.value);
  },
  toAminoMsg(message: MsgScriptJSON): MsgScriptJSONAminoMsg {
    return {
      type: 'move/MsgScriptJSON',
      value: MsgScriptJSON.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgScriptJSONProtoMsg): MsgScriptJSON {
    return MsgScriptJSON.decode(message.value);
  },
  toProto(message: MsgScriptJSON): Uint8Array {
    return MsgScriptJSON.encode(message).finish();
  },
  toProtoMsg(message: MsgScriptJSON): MsgScriptJSONProtoMsg {
    return {
      typeUrl: '/initia.move.v1.MsgScriptJSON',
      value: MsgScriptJSON.encode(message).finish(),
    };
  },
};
function createBaseMsgScriptJSONResponse(): MsgScriptJSONResponse {
  return {};
}
export const MsgScriptJSONResponse = {
  typeUrl: '/initia.move.v1.MsgScriptJSONResponse',
  encode(_: MsgScriptJSONResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgScriptJSONResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgScriptJSONResponse();
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
  fromPartial(_: Partial<MsgScriptJSONResponse>): MsgScriptJSONResponse {
    const message = createBaseMsgScriptJSONResponse();
    return message;
  },
  fromAmino(_: MsgScriptJSONResponseAmino): MsgScriptJSONResponse {
    const message = createBaseMsgScriptJSONResponse();
    return message;
  },
  toAmino(_: MsgScriptJSONResponse): MsgScriptJSONResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgScriptJSONResponseAminoMsg): MsgScriptJSONResponse {
    return MsgScriptJSONResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgScriptJSONResponseProtoMsg): MsgScriptJSONResponse {
    return MsgScriptJSONResponse.decode(message.value);
  },
  toProto(message: MsgScriptJSONResponse): Uint8Array {
    return MsgScriptJSONResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgScriptJSONResponse): MsgScriptJSONResponseProtoMsg {
    return {
      typeUrl: '/initia.move.v1.MsgScriptJSONResponse',
      value: MsgScriptJSONResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgGovPublish(): MsgGovPublish {
  return {
    authority: '',
    sender: '',
    codeBytes: [],
    upgradePolicy: undefined,
  };
}
export const MsgGovPublish = {
  typeUrl: '/initia.move.v1.MsgGovPublish',
  encode(message: MsgGovPublish, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.authority !== '') {
      writer.uint32(10).string(message.authority);
    }
    if (message.sender !== '') {
      writer.uint32(18).string(message.sender);
    }
    for (const v of message.codeBytes) {
      writer.uint32(26).bytes(v!);
    }
    if (message.upgradePolicy !== undefined) {
      writer.uint32(32).int32(message.upgradePolicy);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgGovPublish {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgGovPublish();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.authority = reader.string();
          break;
        case 2:
          message.sender = reader.string();
          break;
        case 3:
          message.codeBytes.push(reader.bytes());
          break;
        case 4:
          message.upgradePolicy = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgGovPublish>): MsgGovPublish {
    const message = createBaseMsgGovPublish();
    message.authority = object.authority ?? '';
    message.sender = object.sender ?? '';
    message.codeBytes = object.codeBytes?.map((e) => e) || [];
    message.upgradePolicy = object.upgradePolicy ?? undefined;
    return message;
  },
  fromAmino(object: MsgGovPublishAmino): MsgGovPublish {
    const message = createBaseMsgGovPublish();
    if (object.authority !== undefined && object.authority !== null) {
      message.authority = object.authority;
    }
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    message.codeBytes = object.code_bytes?.map((e) => bytesFromBase64(e)) || [];
    if (object.upgrade_policy !== undefined && object.upgrade_policy !== null) {
      message.upgradePolicy = object.upgrade_policy;
    }
    return message;
  },
  toAmino(message: MsgGovPublish): MsgGovPublishAmino {
    const obj: any = {};
    obj.authority = message.authority === '' ? undefined : message.authority;
    obj.sender = message.sender === '' ? undefined : message.sender;
    if (message.codeBytes) {
      obj.code_bytes = message.codeBytes.map((e) => base64FromBytes(e));
    } else {
      obj.code_bytes = message.codeBytes;
    }
    obj.upgrade_policy = message.upgradePolicy === null ? undefined : message.upgradePolicy;
    return obj;
  },
  fromAminoMsg(object: MsgGovPublishAminoMsg): MsgGovPublish {
    return MsgGovPublish.fromAmino(object.value);
  },
  toAminoMsg(message: MsgGovPublish): MsgGovPublishAminoMsg {
    return {
      type: 'move/MsgGovPublish',
      value: MsgGovPublish.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgGovPublishProtoMsg): MsgGovPublish {
    return MsgGovPublish.decode(message.value);
  },
  toProto(message: MsgGovPublish): Uint8Array {
    return MsgGovPublish.encode(message).finish();
  },
  toProtoMsg(message: MsgGovPublish): MsgGovPublishProtoMsg {
    return {
      typeUrl: '/initia.move.v1.MsgGovPublish',
      value: MsgGovPublish.encode(message).finish(),
    };
  },
};
function createBaseMsgGovPublishResponse(): MsgGovPublishResponse {
  return {};
}
export const MsgGovPublishResponse = {
  typeUrl: '/initia.move.v1.MsgGovPublishResponse',
  encode(_: MsgGovPublishResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgGovPublishResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgGovPublishResponse();
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
  fromPartial(_: Partial<MsgGovPublishResponse>): MsgGovPublishResponse {
    const message = createBaseMsgGovPublishResponse();
    return message;
  },
  fromAmino(_: MsgGovPublishResponseAmino): MsgGovPublishResponse {
    const message = createBaseMsgGovPublishResponse();
    return message;
  },
  toAmino(_: MsgGovPublishResponse): MsgGovPublishResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgGovPublishResponseAminoMsg): MsgGovPublishResponse {
    return MsgGovPublishResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgGovPublishResponseProtoMsg): MsgGovPublishResponse {
    return MsgGovPublishResponse.decode(message.value);
  },
  toProto(message: MsgGovPublishResponse): Uint8Array {
    return MsgGovPublishResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgGovPublishResponse): MsgGovPublishResponseProtoMsg {
    return {
      typeUrl: '/initia.move.v1.MsgGovPublishResponse',
      value: MsgGovPublishResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgGovExecute(): MsgGovExecute {
  return {
    authority: '',
    sender: '',
    moduleAddress: '',
    moduleName: '',
    functionName: '',
    typeArgs: [],
    args: [],
  };
}
export const MsgGovExecute = {
  typeUrl: '/initia.move.v1.MsgGovExecute',
  encode(message: MsgGovExecute, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.authority !== '') {
      writer.uint32(10).string(message.authority);
    }
    if (message.sender !== '') {
      writer.uint32(18).string(message.sender);
    }
    if (message.moduleAddress !== '') {
      writer.uint32(26).string(message.moduleAddress);
    }
    if (message.moduleName !== '') {
      writer.uint32(34).string(message.moduleName);
    }
    if (message.functionName !== '') {
      writer.uint32(42).string(message.functionName);
    }
    for (const v of message.typeArgs) {
      writer.uint32(50).string(v!);
    }
    for (const v of message.args) {
      writer.uint32(58).bytes(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgGovExecute {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgGovExecute();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.authority = reader.string();
          break;
        case 2:
          message.sender = reader.string();
          break;
        case 3:
          message.moduleAddress = reader.string();
          break;
        case 4:
          message.moduleName = reader.string();
          break;
        case 5:
          message.functionName = reader.string();
          break;
        case 6:
          message.typeArgs.push(reader.string());
          break;
        case 7:
          message.args.push(reader.bytes());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgGovExecute>): MsgGovExecute {
    const message = createBaseMsgGovExecute();
    message.authority = object.authority ?? '';
    message.sender = object.sender ?? '';
    message.moduleAddress = object.moduleAddress ?? '';
    message.moduleName = object.moduleName ?? '';
    message.functionName = object.functionName ?? '';
    message.typeArgs = object.typeArgs?.map((e) => e) || [];
    message.args = object.args?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: MsgGovExecuteAmino): MsgGovExecute {
    const message = createBaseMsgGovExecute();
    if (object.authority !== undefined && object.authority !== null) {
      message.authority = object.authority;
    }
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.module_address !== undefined && object.module_address !== null) {
      message.moduleAddress = object.module_address;
    }
    if (object.module_name !== undefined && object.module_name !== null) {
      message.moduleName = object.module_name;
    }
    if (object.function_name !== undefined && object.function_name !== null) {
      message.functionName = object.function_name;
    }
    message.typeArgs = object.type_args?.map((e) => e) || [];
    message.args = object.args?.map((e) => bytesFromBase64(e)) || [];
    return message;
  },
  toAmino(message: MsgGovExecute): MsgGovExecuteAmino {
    const obj: any = {};
    obj.authority = message.authority === '' ? undefined : message.authority;
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.module_address = message.moduleAddress === '' ? undefined : message.moduleAddress;
    obj.module_name = message.moduleName === '' ? undefined : message.moduleName;
    obj.function_name = message.functionName === '' ? undefined : message.functionName;
    if (message.typeArgs) {
      obj.type_args = message.typeArgs.map((e) => e);
    } else {
      obj.type_args = message.typeArgs;
    }
    if (message.args) {
      obj.args = message.args.map((e) => base64FromBytes(e));
    } else {
      obj.args = message.args;
    }
    return obj;
  },
  fromAminoMsg(object: MsgGovExecuteAminoMsg): MsgGovExecute {
    return MsgGovExecute.fromAmino(object.value);
  },
  toAminoMsg(message: MsgGovExecute): MsgGovExecuteAminoMsg {
    return {
      type: 'move/MsgGovExecute',
      value: MsgGovExecute.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgGovExecuteProtoMsg): MsgGovExecute {
    return MsgGovExecute.decode(message.value);
  },
  toProto(message: MsgGovExecute): Uint8Array {
    return MsgGovExecute.encode(message).finish();
  },
  toProtoMsg(message: MsgGovExecute): MsgGovExecuteProtoMsg {
    return {
      typeUrl: '/initia.move.v1.MsgGovExecute',
      value: MsgGovExecute.encode(message).finish(),
    };
  },
};
function createBaseMsgGovExecuteResponse(): MsgGovExecuteResponse {
  return {};
}
export const MsgGovExecuteResponse = {
  typeUrl: '/initia.move.v1.MsgGovExecuteResponse',
  encode(_: MsgGovExecuteResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgGovExecuteResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgGovExecuteResponse();
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
  fromPartial(_: Partial<MsgGovExecuteResponse>): MsgGovExecuteResponse {
    const message = createBaseMsgGovExecuteResponse();
    return message;
  },
  fromAmino(_: MsgGovExecuteResponseAmino): MsgGovExecuteResponse {
    const message = createBaseMsgGovExecuteResponse();
    return message;
  },
  toAmino(_: MsgGovExecuteResponse): MsgGovExecuteResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgGovExecuteResponseAminoMsg): MsgGovExecuteResponse {
    return MsgGovExecuteResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgGovExecuteResponseProtoMsg): MsgGovExecuteResponse {
    return MsgGovExecuteResponse.decode(message.value);
  },
  toProto(message: MsgGovExecuteResponse): Uint8Array {
    return MsgGovExecuteResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgGovExecuteResponse): MsgGovExecuteResponseProtoMsg {
    return {
      typeUrl: '/initia.move.v1.MsgGovExecuteResponse',
      value: MsgGovExecuteResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgGovExecuteJSON(): MsgGovExecuteJSON {
  return {
    authority: '',
    sender: '',
    moduleAddress: '',
    moduleName: '',
    functionName: '',
    typeArgs: [],
    args: [],
  };
}
export const MsgGovExecuteJSON = {
  typeUrl: '/initia.move.v1.MsgGovExecuteJSON',
  encode(message: MsgGovExecuteJSON, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.authority !== '') {
      writer.uint32(10).string(message.authority);
    }
    if (message.sender !== '') {
      writer.uint32(18).string(message.sender);
    }
    if (message.moduleAddress !== '') {
      writer.uint32(26).string(message.moduleAddress);
    }
    if (message.moduleName !== '') {
      writer.uint32(34).string(message.moduleName);
    }
    if (message.functionName !== '') {
      writer.uint32(42).string(message.functionName);
    }
    for (const v of message.typeArgs) {
      writer.uint32(50).string(v!);
    }
    for (const v of message.args) {
      writer.uint32(58).string(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgGovExecuteJSON {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgGovExecuteJSON();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.authority = reader.string();
          break;
        case 2:
          message.sender = reader.string();
          break;
        case 3:
          message.moduleAddress = reader.string();
          break;
        case 4:
          message.moduleName = reader.string();
          break;
        case 5:
          message.functionName = reader.string();
          break;
        case 6:
          message.typeArgs.push(reader.string());
          break;
        case 7:
          message.args.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgGovExecuteJSON>): MsgGovExecuteJSON {
    const message = createBaseMsgGovExecuteJSON();
    message.authority = object.authority ?? '';
    message.sender = object.sender ?? '';
    message.moduleAddress = object.moduleAddress ?? '';
    message.moduleName = object.moduleName ?? '';
    message.functionName = object.functionName ?? '';
    message.typeArgs = object.typeArgs?.map((e) => e) || [];
    message.args = object.args?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: MsgGovExecuteJSONAmino): MsgGovExecuteJSON {
    const message = createBaseMsgGovExecuteJSON();
    if (object.authority !== undefined && object.authority !== null) {
      message.authority = object.authority;
    }
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.module_address !== undefined && object.module_address !== null) {
      message.moduleAddress = object.module_address;
    }
    if (object.module_name !== undefined && object.module_name !== null) {
      message.moduleName = object.module_name;
    }
    if (object.function_name !== undefined && object.function_name !== null) {
      message.functionName = object.function_name;
    }
    message.typeArgs = object.type_args?.map((e) => e) || [];
    message.args = object.args?.map((e) => e) || [];
    return message;
  },
  toAmino(message: MsgGovExecuteJSON): MsgGovExecuteJSONAmino {
    const obj: any = {};
    obj.authority = message.authority === '' ? undefined : message.authority;
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.module_address = message.moduleAddress === '' ? undefined : message.moduleAddress;
    obj.module_name = message.moduleName === '' ? undefined : message.moduleName;
    obj.function_name = message.functionName === '' ? undefined : message.functionName;
    if (message.typeArgs) {
      obj.type_args = message.typeArgs.map((e) => e);
    } else {
      obj.type_args = message.typeArgs;
    }
    if (message.args) {
      obj.args = message.args.map((e) => e);
    } else {
      obj.args = message.args;
    }
    return obj;
  },
  fromAminoMsg(object: MsgGovExecuteJSONAminoMsg): MsgGovExecuteJSON {
    return MsgGovExecuteJSON.fromAmino(object.value);
  },
  toAminoMsg(message: MsgGovExecuteJSON): MsgGovExecuteJSONAminoMsg {
    return {
      type: 'move/MsgGovExecuteJSON',
      value: MsgGovExecuteJSON.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgGovExecuteJSONProtoMsg): MsgGovExecuteJSON {
    return MsgGovExecuteJSON.decode(message.value);
  },
  toProto(message: MsgGovExecuteJSON): Uint8Array {
    return MsgGovExecuteJSON.encode(message).finish();
  },
  toProtoMsg(message: MsgGovExecuteJSON): MsgGovExecuteJSONProtoMsg {
    return {
      typeUrl: '/initia.move.v1.MsgGovExecuteJSON',
      value: MsgGovExecuteJSON.encode(message).finish(),
    };
  },
};
function createBaseMsgGovExecuteJSONResponse(): MsgGovExecuteJSONResponse {
  return {};
}
export const MsgGovExecuteJSONResponse = {
  typeUrl: '/initia.move.v1.MsgGovExecuteJSONResponse',
  encode(_: MsgGovExecuteJSONResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgGovExecuteJSONResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgGovExecuteJSONResponse();
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
  fromPartial(_: Partial<MsgGovExecuteJSONResponse>): MsgGovExecuteJSONResponse {
    const message = createBaseMsgGovExecuteJSONResponse();
    return message;
  },
  fromAmino(_: MsgGovExecuteJSONResponseAmino): MsgGovExecuteJSONResponse {
    const message = createBaseMsgGovExecuteJSONResponse();
    return message;
  },
  toAmino(_: MsgGovExecuteJSONResponse): MsgGovExecuteJSONResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgGovExecuteJSONResponseAminoMsg): MsgGovExecuteJSONResponse {
    return MsgGovExecuteJSONResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgGovExecuteJSONResponseProtoMsg): MsgGovExecuteJSONResponse {
    return MsgGovExecuteJSONResponse.decode(message.value);
  },
  toProto(message: MsgGovExecuteJSONResponse): Uint8Array {
    return MsgGovExecuteJSONResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgGovExecuteJSONResponse): MsgGovExecuteJSONResponseProtoMsg {
    return {
      typeUrl: '/initia.move.v1.MsgGovExecuteJSONResponse',
      value: MsgGovExecuteJSONResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgGovScript(): MsgGovScript {
  return {
    authority: '',
    sender: '',
    codeBytes: new Uint8Array(),
    typeArgs: [],
    args: [],
  };
}
export const MsgGovScript = {
  typeUrl: '/initia.move.v1.MsgGovScript',
  encode(message: MsgGovScript, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.authority !== '') {
      writer.uint32(10).string(message.authority);
    }
    if (message.sender !== '') {
      writer.uint32(18).string(message.sender);
    }
    if (message.codeBytes.length !== 0) {
      writer.uint32(26).bytes(message.codeBytes);
    }
    for (const v of message.typeArgs) {
      writer.uint32(34).string(v!);
    }
    for (const v of message.args) {
      writer.uint32(42).bytes(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgGovScript {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgGovScript();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.authority = reader.string();
          break;
        case 2:
          message.sender = reader.string();
          break;
        case 3:
          message.codeBytes = reader.bytes();
          break;
        case 4:
          message.typeArgs.push(reader.string());
          break;
        case 5:
          message.args.push(reader.bytes());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgGovScript>): MsgGovScript {
    const message = createBaseMsgGovScript();
    message.authority = object.authority ?? '';
    message.sender = object.sender ?? '';
    message.codeBytes = object.codeBytes ?? new Uint8Array();
    message.typeArgs = object.typeArgs?.map((e) => e) || [];
    message.args = object.args?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: MsgGovScriptAmino): MsgGovScript {
    const message = createBaseMsgGovScript();
    if (object.authority !== undefined && object.authority !== null) {
      message.authority = object.authority;
    }
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.code_bytes !== undefined && object.code_bytes !== null) {
      message.codeBytes = bytesFromBase64(object.code_bytes);
    }
    message.typeArgs = object.type_args?.map((e) => e) || [];
    message.args = object.args?.map((e) => bytesFromBase64(e)) || [];
    return message;
  },
  toAmino(message: MsgGovScript): MsgGovScriptAmino {
    const obj: any = {};
    obj.authority = message.authority === '' ? undefined : message.authority;
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.code_bytes = message.codeBytes ? base64FromBytes(message.codeBytes) : undefined;
    if (message.typeArgs) {
      obj.type_args = message.typeArgs.map((e) => e);
    } else {
      obj.type_args = message.typeArgs;
    }
    if (message.args) {
      obj.args = message.args.map((e) => base64FromBytes(e));
    } else {
      obj.args = message.args;
    }
    return obj;
  },
  fromAminoMsg(object: MsgGovScriptAminoMsg): MsgGovScript {
    return MsgGovScript.fromAmino(object.value);
  },
  toAminoMsg(message: MsgGovScript): MsgGovScriptAminoMsg {
    return {
      type: 'move/MsgGovScript',
      value: MsgGovScript.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgGovScriptProtoMsg): MsgGovScript {
    return MsgGovScript.decode(message.value);
  },
  toProto(message: MsgGovScript): Uint8Array {
    return MsgGovScript.encode(message).finish();
  },
  toProtoMsg(message: MsgGovScript): MsgGovScriptProtoMsg {
    return {
      typeUrl: '/initia.move.v1.MsgGovScript',
      value: MsgGovScript.encode(message).finish(),
    };
  },
};
function createBaseMsgGovScriptResponse(): MsgGovScriptResponse {
  return {};
}
export const MsgGovScriptResponse = {
  typeUrl: '/initia.move.v1.MsgGovScriptResponse',
  encode(_: MsgGovScriptResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgGovScriptResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgGovScriptResponse();
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
  fromPartial(_: Partial<MsgGovScriptResponse>): MsgGovScriptResponse {
    const message = createBaseMsgGovScriptResponse();
    return message;
  },
  fromAmino(_: MsgGovScriptResponseAmino): MsgGovScriptResponse {
    const message = createBaseMsgGovScriptResponse();
    return message;
  },
  toAmino(_: MsgGovScriptResponse): MsgGovScriptResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgGovScriptResponseAminoMsg): MsgGovScriptResponse {
    return MsgGovScriptResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgGovScriptResponseProtoMsg): MsgGovScriptResponse {
    return MsgGovScriptResponse.decode(message.value);
  },
  toProto(message: MsgGovScriptResponse): Uint8Array {
    return MsgGovScriptResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgGovScriptResponse): MsgGovScriptResponseProtoMsg {
    return {
      typeUrl: '/initia.move.v1.MsgGovScriptResponse',
      value: MsgGovScriptResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgGovScriptJSON(): MsgGovScriptJSON {
  return {
    authority: '',
    sender: '',
    codeBytes: new Uint8Array(),
    typeArgs: [],
    args: [],
  };
}
export const MsgGovScriptJSON = {
  typeUrl: '/initia.move.v1.MsgGovScriptJSON',
  encode(message: MsgGovScriptJSON, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.authority !== '') {
      writer.uint32(10).string(message.authority);
    }
    if (message.sender !== '') {
      writer.uint32(18).string(message.sender);
    }
    if (message.codeBytes.length !== 0) {
      writer.uint32(26).bytes(message.codeBytes);
    }
    for (const v of message.typeArgs) {
      writer.uint32(34).string(v!);
    }
    for (const v of message.args) {
      writer.uint32(42).string(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgGovScriptJSON {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgGovScriptJSON();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.authority = reader.string();
          break;
        case 2:
          message.sender = reader.string();
          break;
        case 3:
          message.codeBytes = reader.bytes();
          break;
        case 4:
          message.typeArgs.push(reader.string());
          break;
        case 5:
          message.args.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgGovScriptJSON>): MsgGovScriptJSON {
    const message = createBaseMsgGovScriptJSON();
    message.authority = object.authority ?? '';
    message.sender = object.sender ?? '';
    message.codeBytes = object.codeBytes ?? new Uint8Array();
    message.typeArgs = object.typeArgs?.map((e) => e) || [];
    message.args = object.args?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: MsgGovScriptJSONAmino): MsgGovScriptJSON {
    const message = createBaseMsgGovScriptJSON();
    if (object.authority !== undefined && object.authority !== null) {
      message.authority = object.authority;
    }
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.code_bytes !== undefined && object.code_bytes !== null) {
      message.codeBytes = bytesFromBase64(object.code_bytes);
    }
    message.typeArgs = object.type_args?.map((e) => e) || [];
    message.args = object.args?.map((e) => e) || [];
    return message;
  },
  toAmino(message: MsgGovScriptJSON): MsgGovScriptJSONAmino {
    const obj: any = {};
    obj.authority = message.authority === '' ? undefined : message.authority;
    obj.sender = message.sender === '' ? undefined : message.sender;
    obj.code_bytes = message.codeBytes ? base64FromBytes(message.codeBytes) : undefined;
    if (message.typeArgs) {
      obj.type_args = message.typeArgs.map((e) => e);
    } else {
      obj.type_args = message.typeArgs;
    }
    if (message.args) {
      obj.args = message.args.map((e) => e);
    } else {
      obj.args = message.args;
    }
    return obj;
  },
  fromAminoMsg(object: MsgGovScriptJSONAminoMsg): MsgGovScriptJSON {
    return MsgGovScriptJSON.fromAmino(object.value);
  },
  toAminoMsg(message: MsgGovScriptJSON): MsgGovScriptJSONAminoMsg {
    return {
      type: 'move/MsgGovScriptJSON',
      value: MsgGovScriptJSON.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgGovScriptJSONProtoMsg): MsgGovScriptJSON {
    return MsgGovScriptJSON.decode(message.value);
  },
  toProto(message: MsgGovScriptJSON): Uint8Array {
    return MsgGovScriptJSON.encode(message).finish();
  },
  toProtoMsg(message: MsgGovScriptJSON): MsgGovScriptJSONProtoMsg {
    return {
      typeUrl: '/initia.move.v1.MsgGovScriptJSON',
      value: MsgGovScriptJSON.encode(message).finish(),
    };
  },
};
function createBaseMsgGovScriptJSONResponse(): MsgGovScriptJSONResponse {
  return {};
}
export const MsgGovScriptJSONResponse = {
  typeUrl: '/initia.move.v1.MsgGovScriptJSONResponse',
  encode(_: MsgGovScriptJSONResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgGovScriptJSONResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgGovScriptJSONResponse();
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
  fromPartial(_: Partial<MsgGovScriptJSONResponse>): MsgGovScriptJSONResponse {
    const message = createBaseMsgGovScriptJSONResponse();
    return message;
  },
  fromAmino(_: MsgGovScriptJSONResponseAmino): MsgGovScriptJSONResponse {
    const message = createBaseMsgGovScriptJSONResponse();
    return message;
  },
  toAmino(_: MsgGovScriptJSONResponse): MsgGovScriptJSONResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgGovScriptJSONResponseAminoMsg): MsgGovScriptJSONResponse {
    return MsgGovScriptJSONResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgGovScriptJSONResponseProtoMsg): MsgGovScriptJSONResponse {
    return MsgGovScriptJSONResponse.decode(message.value);
  },
  toProto(message: MsgGovScriptJSONResponse): Uint8Array {
    return MsgGovScriptJSONResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgGovScriptJSONResponse): MsgGovScriptJSONResponseProtoMsg {
    return {
      typeUrl: '/initia.move.v1.MsgGovScriptJSONResponse',
      value: MsgGovScriptJSONResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgWhitelist(): MsgWhitelist {
  return {
    authority: '',
    metadataLp: '',
    rewardWeight: '',
  };
}
export const MsgWhitelist = {
  typeUrl: '/initia.move.v1.MsgWhitelist',
  encode(message: MsgWhitelist, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.authority !== '') {
      writer.uint32(10).string(message.authority);
    }
    if (message.metadataLp !== '') {
      writer.uint32(18).string(message.metadataLp);
    }
    if (message.rewardWeight !== '') {
      writer.uint32(26).string(Decimal.fromUserInput(message.rewardWeight, 18).atomics);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgWhitelist {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgWhitelist();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.authority = reader.string();
          break;
        case 2:
          message.metadataLp = reader.string();
          break;
        case 3:
          message.rewardWeight = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgWhitelist>): MsgWhitelist {
    const message = createBaseMsgWhitelist();
    message.authority = object.authority ?? '';
    message.metadataLp = object.metadataLp ?? '';
    message.rewardWeight = object.rewardWeight ?? '';
    return message;
  },
  fromAmino(object: MsgWhitelistAmino): MsgWhitelist {
    const message = createBaseMsgWhitelist();
    if (object.authority !== undefined && object.authority !== null) {
      message.authority = object.authority;
    }
    if (object.metadata_lp !== undefined && object.metadata_lp !== null) {
      message.metadataLp = object.metadata_lp;
    }
    if (object.reward_weight !== undefined && object.reward_weight !== null) {
      message.rewardWeight = object.reward_weight;
    }
    return message;
  },
  toAmino(message: MsgWhitelist): MsgWhitelistAmino {
    const obj: any = {};
    obj.authority = message.authority === '' ? undefined : message.authority;
    obj.metadata_lp = message.metadataLp === '' ? undefined : message.metadataLp;
    obj.reward_weight = message.rewardWeight === '' ? undefined : message.rewardWeight;
    return obj;
  },
  fromAminoMsg(object: MsgWhitelistAminoMsg): MsgWhitelist {
    return MsgWhitelist.fromAmino(object.value);
  },
  toAminoMsg(message: MsgWhitelist): MsgWhitelistAminoMsg {
    return {
      type: 'move/MsgWhitelist',
      value: MsgWhitelist.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgWhitelistProtoMsg): MsgWhitelist {
    return MsgWhitelist.decode(message.value);
  },
  toProto(message: MsgWhitelist): Uint8Array {
    return MsgWhitelist.encode(message).finish();
  },
  toProtoMsg(message: MsgWhitelist): MsgWhitelistProtoMsg {
    return {
      typeUrl: '/initia.move.v1.MsgWhitelist',
      value: MsgWhitelist.encode(message).finish(),
    };
  },
};
function createBaseMsgWhitelistResponse(): MsgWhitelistResponse {
  return {};
}
export const MsgWhitelistResponse = {
  typeUrl: '/initia.move.v1.MsgWhitelistResponse',
  encode(_: MsgWhitelistResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgWhitelistResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgWhitelistResponse();
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
  fromPartial(_: Partial<MsgWhitelistResponse>): MsgWhitelistResponse {
    const message = createBaseMsgWhitelistResponse();
    return message;
  },
  fromAmino(_: MsgWhitelistResponseAmino): MsgWhitelistResponse {
    const message = createBaseMsgWhitelistResponse();
    return message;
  },
  toAmino(_: MsgWhitelistResponse): MsgWhitelistResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgWhitelistResponseAminoMsg): MsgWhitelistResponse {
    return MsgWhitelistResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgWhitelistResponseProtoMsg): MsgWhitelistResponse {
    return MsgWhitelistResponse.decode(message.value);
  },
  toProto(message: MsgWhitelistResponse): Uint8Array {
    return MsgWhitelistResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgWhitelistResponse): MsgWhitelistResponseProtoMsg {
    return {
      typeUrl: '/initia.move.v1.MsgWhitelistResponse',
      value: MsgWhitelistResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgDelist(): MsgDelist {
  return {
    authority: '',
    metadataLp: '',
  };
}
export const MsgDelist = {
  typeUrl: '/initia.move.v1.MsgDelist',
  encode(message: MsgDelist, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.authority !== '') {
      writer.uint32(10).string(message.authority);
    }
    if (message.metadataLp !== '') {
      writer.uint32(18).string(message.metadataLp);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgDelist {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDelist();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.authority = reader.string();
          break;
        case 2:
          message.metadataLp = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgDelist>): MsgDelist {
    const message = createBaseMsgDelist();
    message.authority = object.authority ?? '';
    message.metadataLp = object.metadataLp ?? '';
    return message;
  },
  fromAmino(object: MsgDelistAmino): MsgDelist {
    const message = createBaseMsgDelist();
    if (object.authority !== undefined && object.authority !== null) {
      message.authority = object.authority;
    }
    if (object.metadata_lp !== undefined && object.metadata_lp !== null) {
      message.metadataLp = object.metadata_lp;
    }
    return message;
  },
  toAmino(message: MsgDelist): MsgDelistAmino {
    const obj: any = {};
    obj.authority = message.authority === '' ? undefined : message.authority;
    obj.metadata_lp = message.metadataLp === '' ? undefined : message.metadataLp;
    return obj;
  },
  fromAminoMsg(object: MsgDelistAminoMsg): MsgDelist {
    return MsgDelist.fromAmino(object.value);
  },
  toAminoMsg(message: MsgDelist): MsgDelistAminoMsg {
    return {
      type: 'move/MsgWhitelist',
      value: MsgDelist.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgDelistProtoMsg): MsgDelist {
    return MsgDelist.decode(message.value);
  },
  toProto(message: MsgDelist): Uint8Array {
    return MsgDelist.encode(message).finish();
  },
  toProtoMsg(message: MsgDelist): MsgDelistProtoMsg {
    return {
      typeUrl: '/initia.move.v1.MsgDelist',
      value: MsgDelist.encode(message).finish(),
    };
  },
};
function createBaseMsgDelistResponse(): MsgDelistResponse {
  return {};
}
export const MsgDelistResponse = {
  typeUrl: '/initia.move.v1.MsgDelistResponse',
  encode(_: MsgDelistResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgDelistResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDelistResponse();
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
  fromPartial(_: Partial<MsgDelistResponse>): MsgDelistResponse {
    const message = createBaseMsgDelistResponse();
    return message;
  },
  fromAmino(_: MsgDelistResponseAmino): MsgDelistResponse {
    const message = createBaseMsgDelistResponse();
    return message;
  },
  toAmino(_: MsgDelistResponse): MsgDelistResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgDelistResponseAminoMsg): MsgDelistResponse {
    return MsgDelistResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: MsgDelistResponseProtoMsg): MsgDelistResponse {
    return MsgDelistResponse.decode(message.value);
  },
  toProto(message: MsgDelistResponse): Uint8Array {
    return MsgDelistResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgDelistResponse): MsgDelistResponseProtoMsg {
    return {
      typeUrl: '/initia.move.v1.MsgDelistResponse',
      value: MsgDelistResponse.encode(message).finish(),
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
  typeUrl: '/initia.move.v1.MsgUpdateParams',
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
    obj.params = message.params ? Params.toAmino(message.params) : Params.toAmino(Params.fromPartial({}));
    return obj;
  },
  fromAminoMsg(object: MsgUpdateParamsAminoMsg): MsgUpdateParams {
    return MsgUpdateParams.fromAmino(object.value);
  },
  toAminoMsg(message: MsgUpdateParams): MsgUpdateParamsAminoMsg {
    return {
      type: 'move/MsgUpdateParams',
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
      typeUrl: '/initia.move.v1.MsgUpdateParams',
      value: MsgUpdateParams.encode(message).finish(),
    };
  },
};
function createBaseMsgUpdateParamsResponse(): MsgUpdateParamsResponse {
  return {};
}
export const MsgUpdateParamsResponse = {
  typeUrl: '/initia.move.v1.MsgUpdateParamsResponse',
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
      typeUrl: '/initia.move.v1.MsgUpdateParamsResponse',
      value: MsgUpdateParamsResponse.encode(message).finish(),
    };
  },
};
