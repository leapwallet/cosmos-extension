// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { Decimal } from '@cosmjs/math';

import { BinaryReader, BinaryWriter } from '../../binary';
import { base64FromBytes, bytesFromBase64 } from '../../helpers';
/** UpgradePolicy is the policy for upgrading a move module. */
export enum UpgradePolicy {
  /** UNSPECIFIED - UNSPECIFIED: a placeholder for an unspecified upgrade policy. */
  UNSPECIFIED = 0,
  /**
   * COMPATIBLE - COMPATBILE: Whether a compatibility check should be performed for upgrades. The check only passes if
   * a new module has (a) the same public functions (b) for existing resources, no layout change.
   */
  COMPATIBLE = 1,
  /** IMMUTABLE - IMMUTABLE: Whether the modules in the package are immutable and cannot be upgraded. */
  IMMUTABLE = 2,
  UNRECOGNIZED = -1,
}
export const UpgradePolicySDKType = UpgradePolicy;
export const UpgradePolicyAmino = UpgradePolicy;
export function upgradePolicyFromJSON(object: any): UpgradePolicy {
  switch (object) {
    case 0:
    case 'UNSPECIFIED':
      return UpgradePolicy.UNSPECIFIED;
    case 1:
    case 'COMPATIBLE':
      return UpgradePolicy.COMPATIBLE;
    case 2:
    case 'IMMUTABLE':
      return UpgradePolicy.IMMUTABLE;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return UpgradePolicy.UNRECOGNIZED;
  }
}
export function upgradePolicyToJSON(object: UpgradePolicy): string {
  switch (object) {
    case UpgradePolicy.UNSPECIFIED:
      return 'UNSPECIFIED';
    case UpgradePolicy.COMPATIBLE:
      return 'COMPATIBLE';
    case UpgradePolicy.IMMUTABLE:
      return 'IMMUTABLE';
    case UpgradePolicy.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}
/** Params defines the set of move parameters. */
export interface Params {
  baseDenom: string;
  baseMinGasPrice: string;
  /** CSR: Percentage of fees distributed to developers */
  contractSharedRevenueRatio: string;
  /**
   * It is a list of addresses with permission to distribute contracts,
   * and an empty list is interpreted as allowing anyone to distribute.
   */
  allowedPublishers: string[];
}
export interface ParamsProtoMsg {
  typeUrl: '/initia.move.v1.Params';
  value: Uint8Array;
}
/** Params defines the set of move parameters. */
export interface ParamsAmino {
  base_denom?: string;
  base_min_gas_price: string;
  /** CSR: Percentage of fees distributed to developers */
  contract_shared_revenue_ratio: string;
  /**
   * It is a list of addresses with permission to distribute contracts,
   * and an empty list is interpreted as allowing anyone to distribute.
   */
  allowed_publishers: string[];
}
export interface ParamsAminoMsg {
  type: 'move/Params';
  value: ParamsAmino;
}
/** Params defines the set of move parameters. */
export interface ParamsSDKType {
  base_denom: string;
  base_min_gas_price: string;
  contract_shared_revenue_ratio: string;
  allowed_publishers: string[];
}
/** RawParams defines the raw params to store. */
export interface RawParams {
  baseDenom: string;
  baseMinGasPrice: string;
  /** CSR: Percentage of fees distributed to developers */
  contractSharedRevenueRatio: string;
}
export interface RawParamsProtoMsg {
  typeUrl: '/initia.move.v1.RawParams';
  value: Uint8Array;
}
/** RawParams defines the raw params to store. */
export interface RawParamsAmino {
  base_denom?: string;
  base_min_gas_price: string;
  /** CSR: Percentage of fees distributed to developers */
  contract_shared_revenue_ratio: string;
}
export interface RawParamsAminoMsg {
  type: '/initia.move.v1.RawParams';
  value: RawParamsAmino;
}
/** RawParams defines the raw params to store. */
export interface RawParamsSDKType {
  base_denom: string;
  base_min_gas_price: string;
  contract_shared_revenue_ratio: string;
}
/**
 * Module is data for the uploaded contract move code
 * ex) 0000000000000000000000000000000000000001/0/BasicCoin
 */
export interface Module {
  address: string;
  moduleName: string;
  abi: string;
  rawBytes: Uint8Array;
  upgradePolicy: UpgradePolicy;
}
export interface ModuleProtoMsg {
  typeUrl: '/initia.move.v1.Module';
  value: Uint8Array;
}
/**
 * Module is data for the uploaded contract move code
 * ex) 0000000000000000000000000000000000000001/0/BasicCoin
 */
export interface ModuleAmino {
  address?: string;
  module_name?: string;
  abi?: string;
  raw_bytes?: string;
  upgrade_policy?: UpgradePolicy;
}
export interface ModuleAminoMsg {
  type: '/initia.move.v1.Module';
  value: ModuleAmino;
}
/**
 * Module is data for the uploaded contract move code
 * ex) 0000000000000000000000000000000000000001/0/BasicCoin
 */
export interface ModuleSDKType {
  address: string;
  module_name: string;
  abi: string;
  raw_bytes: Uint8Array;
  upgrade_policy: UpgradePolicy;
}
/**
 * Resource is data for the stored move resource
 * ex) 0000000000000000000000000000000000000002/2/0x1::BasicCoin::Coin<0x1::BasicCoin::Initia>
 */
export interface Resource {
  address: string;
  structTag: string;
  moveResource: string;
  rawBytes: Uint8Array;
}
export interface ResourceProtoMsg {
  typeUrl: '/initia.move.v1.Resource';
  value: Uint8Array;
}
/**
 * Resource is data for the stored move resource
 * ex) 0000000000000000000000000000000000000002/2/0x1::BasicCoin::Coin<0x1::BasicCoin::Initia>
 */
export interface ResourceAmino {
  address?: string;
  struct_tag?: string;
  move_resource?: string;
  raw_bytes?: string;
}
export interface ResourceAminoMsg {
  type: '/initia.move.v1.Resource';
  value: ResourceAmino;
}
/**
 * Resource is data for the stored move resource
 * ex) 0000000000000000000000000000000000000002/2/0x1::BasicCoin::Coin<0x1::BasicCoin::Initia>
 */
export interface ResourceSDKType {
  address: string;
  struct_tag: string;
  move_resource: string;
  raw_bytes: Uint8Array;
}
/** TableInfo is data stored under Table address */
export interface TableInfo {
  address: string;
  keyType: string;
  valueType: string;
}
export interface TableInfoProtoMsg {
  typeUrl: '/initia.move.v1.TableInfo';
  value: Uint8Array;
}
/** TableInfo is data stored under Table address */
export interface TableInfoAmino {
  address?: string;
  key_type?: string;
  value_type?: string;
}
export interface TableInfoAminoMsg {
  type: '/initia.move.v1.TableInfo';
  value: TableInfoAmino;
}
/** TableInfo is data stored under Table address */
export interface TableInfoSDKType {
  address: string;
  key_type: string;
  value_type: string;
}
/** TableEntry is data stored under Table address and the key bytes */
export interface TableEntry {
  address: string;
  key: string;
  value: string;
  keyBytes: Uint8Array;
  valueBytes: Uint8Array;
}
export interface TableEntryProtoMsg {
  typeUrl: '/initia.move.v1.TableEntry';
  value: Uint8Array;
}
/** TableEntry is data stored under Table address and the key bytes */
export interface TableEntryAmino {
  address?: string;
  key?: string;
  value?: string;
  key_bytes?: string;
  value_bytes?: string;
}
export interface TableEntryAminoMsg {
  type: '/initia.move.v1.TableEntry';
  value: TableEntryAmino;
}
/** TableEntry is data stored under Table address and the key bytes */
export interface TableEntrySDKType {
  address: string;
  key: string;
  value: string;
  key_bytes: Uint8Array;
  value_bytes: Uint8Array;
}
/** proto wrapper to store the value */
export interface UpgradePolicyProto {
  policy: UpgradePolicy;
}
export interface UpgradePolicyProtoProtoMsg {
  typeUrl: '/initia.move.v1.UpgradePolicyProto';
  value: Uint8Array;
}
/** proto wrapper to store the value */
export interface UpgradePolicyProtoAmino {
  policy?: UpgradePolicy;
}
export interface UpgradePolicyProtoAminoMsg {
  type: '/initia.move.v1.UpgradePolicyProto';
  value: UpgradePolicyProtoAmino;
}
/** proto wrapper to store the value */
export interface UpgradePolicyProtoSDKType {
  policy: UpgradePolicy;
}
/**
 * DexPair contains coin metdata address
 * std::dex::Pool and std::dex::Config resources.
 */
export interface DexPair {
  metadataQuote: string;
  metadataLp: string;
}
export interface DexPairProtoMsg {
  typeUrl: '/initia.move.v1.DexPair';
  value: Uint8Array;
}
/**
 * DexPair contains coin metdata address
 * std::dex::Pool and std::dex::Config resources.
 */
export interface DexPairAmino {
  metadata_quote?: string;
  metadata_lp?: string;
}
export interface DexPairAminoMsg {
  type: '/initia.move.v1.DexPair';
  value: DexPairAmino;
}
/**
 * DexPair contains coin metdata address
 * std::dex::Pool and std::dex::Config resources.
 */
export interface DexPairSDKType {
  metadata_quote: string;
  metadata_lp: string;
}
/** ExecuteAuthorizationItem is the information for granting module execution */
export interface ExecuteAuthorizationItem {
  /** ModuleAddr is the address of the module deployer */
  moduleAddress: string;
  /** ModuleName is the names of module to execute */
  moduleName: string;
  /** FunctionName is the name of function to execute with wildcard '*' support */
  functionNames?: string[];
}
export interface ExecuteAuthorizationItemProtoMsg {
  typeUrl: '/initia.move.v1.ExecuteAuthorizationItem';
  value: Uint8Array;
}
/** ExecuteAuthorizationItem is the information for granting module execution */
export interface ExecuteAuthorizationItemAmino {
  /** ModuleAddr is the address of the module deployer */
  module_address?: string;
  /** ModuleName is the names of module to execute */
  module_name?: string;
  /** FunctionName is the name of function to execute with wildcard '*' support */
  function_names?: string[];
}
export interface ExecuteAuthorizationItemAminoMsg {
  type: '/initia.move.v1.ExecuteAuthorizationItem';
  value: ExecuteAuthorizationItemAmino;
}
/** ExecuteAuthorizationItem is the information for granting module execution */
export interface ExecuteAuthorizationItemSDKType {
  module_address: string;
  module_name: string;
  function_names?: string[];
}
function createBaseParams(): Params {
  return {
    baseDenom: '',
    baseMinGasPrice: '',
    contractSharedRevenueRatio: '',
    allowedPublishers: [],
  };
}
export const Params = {
  typeUrl: '/initia.move.v1.Params',
  encode(message: Params, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.baseDenom !== '') {
      writer.uint32(10).string(message.baseDenom);
    }
    if (message.baseMinGasPrice !== '') {
      writer.uint32(18).string(Decimal.fromUserInput(message.baseMinGasPrice, 18).atomics);
    }
    if (message.contractSharedRevenueRatio !== '') {
      writer.uint32(26).string(Decimal.fromUserInput(message.contractSharedRevenueRatio, 18).atomics);
    }
    for (const v of message.allowedPublishers) {
      writer.uint32(34).string(v!);
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
          message.baseDenom = reader.string();
          break;
        case 2:
          message.baseMinGasPrice = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 3:
          message.contractSharedRevenueRatio = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 4:
          message.allowedPublishers.push(reader.string());
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
    message.baseDenom = object.baseDenom ?? '';
    message.baseMinGasPrice = object.baseMinGasPrice ?? '';
    message.contractSharedRevenueRatio = object.contractSharedRevenueRatio ?? '';
    message.allowedPublishers = object.allowedPublishers?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: ParamsAmino): Params {
    const message = createBaseParams();
    if (object.base_denom !== undefined && object.base_denom !== null) {
      message.baseDenom = object.base_denom;
    }
    if (object.base_min_gas_price !== undefined && object.base_min_gas_price !== null) {
      message.baseMinGasPrice = object.base_min_gas_price;
    }
    if (object.contract_shared_revenue_ratio !== undefined && object.contract_shared_revenue_ratio !== null) {
      message.contractSharedRevenueRatio = object.contract_shared_revenue_ratio;
    }
    message.allowedPublishers = object.allowed_publishers?.map((e) => e) || [];
    return message;
  },
  toAmino(message: Params): ParamsAmino {
    const obj: any = {};
    obj.base_denom = message.baseDenom === '' ? undefined : message.baseDenom;
    obj.base_min_gas_price = message.baseMinGasPrice ?? '';
    obj.contract_shared_revenue_ratio = message.contractSharedRevenueRatio ?? '';
    if (message.allowedPublishers) {
      obj.allowed_publishers = message.allowedPublishers.map((e) => e);
    } else {
      obj.allowed_publishers = message.allowedPublishers;
    }
    return obj;
  },
  fromAminoMsg(object: ParamsAminoMsg): Params {
    return Params.fromAmino(object.value);
  },
  toAminoMsg(message: Params): ParamsAminoMsg {
    return {
      type: 'move/Params',
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
      typeUrl: '/initia.move.v1.Params',
      value: Params.encode(message).finish(),
    };
  },
};
function createBaseRawParams(): RawParams {
  return {
    baseDenom: '',
    baseMinGasPrice: '',
    contractSharedRevenueRatio: '',
  };
}
export const RawParams = {
  typeUrl: '/initia.move.v1.RawParams',
  encode(message: RawParams, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.baseDenom !== '') {
      writer.uint32(10).string(message.baseDenom);
    }
    if (message.baseMinGasPrice !== '') {
      writer.uint32(18).string(Decimal.fromUserInput(message.baseMinGasPrice, 18).atomics);
    }
    if (message.contractSharedRevenueRatio !== '') {
      writer.uint32(26).string(Decimal.fromUserInput(message.contractSharedRevenueRatio, 18).atomics);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): RawParams {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRawParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.baseDenom = reader.string();
          break;
        case 2:
          message.baseMinGasPrice = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 3:
          message.contractSharedRevenueRatio = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<RawParams>): RawParams {
    const message = createBaseRawParams();
    message.baseDenom = object.baseDenom ?? '';
    message.baseMinGasPrice = object.baseMinGasPrice ?? '';
    message.contractSharedRevenueRatio = object.contractSharedRevenueRatio ?? '';
    return message;
  },
  fromAmino(object: RawParamsAmino): RawParams {
    const message = createBaseRawParams();
    if (object.base_denom !== undefined && object.base_denom !== null) {
      message.baseDenom = object.base_denom;
    }
    if (object.base_min_gas_price !== undefined && object.base_min_gas_price !== null) {
      message.baseMinGasPrice = object.base_min_gas_price;
    }
    if (object.contract_shared_revenue_ratio !== undefined && object.contract_shared_revenue_ratio !== null) {
      message.contractSharedRevenueRatio = object.contract_shared_revenue_ratio;
    }
    return message;
  },
  toAmino(message: RawParams): RawParamsAmino {
    const obj: any = {};
    obj.base_denom = message.baseDenom === '' ? undefined : message.baseDenom;
    obj.base_min_gas_price = message.baseMinGasPrice ?? '';
    obj.contract_shared_revenue_ratio = message.contractSharedRevenueRatio ?? '';
    return obj;
  },
  fromAminoMsg(object: RawParamsAminoMsg): RawParams {
    return RawParams.fromAmino(object.value);
  },
  fromProtoMsg(message: RawParamsProtoMsg): RawParams {
    return RawParams.decode(message.value);
  },
  toProto(message: RawParams): Uint8Array {
    return RawParams.encode(message).finish();
  },
  toProtoMsg(message: RawParams): RawParamsProtoMsg {
    return {
      typeUrl: '/initia.move.v1.RawParams',
      value: RawParams.encode(message).finish(),
    };
  },
};
function createBaseModule(): Module {
  return {
    address: '',
    moduleName: '',
    abi: '',
    rawBytes: new Uint8Array(),
    upgradePolicy: 0,
  };
}
export const Module = {
  typeUrl: '/initia.move.v1.Module',
  encode(message: Module, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.address !== '') {
      writer.uint32(10).string(message.address);
    }
    if (message.moduleName !== '') {
      writer.uint32(18).string(message.moduleName);
    }
    if (message.abi !== '') {
      writer.uint32(26).string(message.abi);
    }
    if (message.rawBytes.length !== 0) {
      writer.uint32(34).bytes(message.rawBytes);
    }
    if (message.upgradePolicy !== 0) {
      writer.uint32(40).int32(message.upgradePolicy);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Module {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseModule();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        case 2:
          message.moduleName = reader.string();
          break;
        case 3:
          message.abi = reader.string();
          break;
        case 4:
          message.rawBytes = reader.bytes();
          break;
        case 5:
          message.upgradePolicy = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Module>): Module {
    const message = createBaseModule();
    message.address = object.address ?? '';
    message.moduleName = object.moduleName ?? '';
    message.abi = object.abi ?? '';
    message.rawBytes = object.rawBytes ?? new Uint8Array();
    message.upgradePolicy = object.upgradePolicy ?? 0;
    return message;
  },
  fromAmino(object: ModuleAmino): Module {
    const message = createBaseModule();
    if (object.address !== undefined && object.address !== null) {
      message.address = object.address;
    }
    if (object.module_name !== undefined && object.module_name !== null) {
      message.moduleName = object.module_name;
    }
    if (object.abi !== undefined && object.abi !== null) {
      message.abi = object.abi;
    }
    if (object.raw_bytes !== undefined && object.raw_bytes !== null) {
      message.rawBytes = bytesFromBase64(object.raw_bytes);
    }
    if (object.upgrade_policy !== undefined && object.upgrade_policy !== null) {
      message.upgradePolicy = object.upgrade_policy;
    }
    return message;
  },
  toAmino(message: Module): ModuleAmino {
    const obj: any = {};
    obj.address = message.address === '' ? undefined : message.address;
    obj.module_name = message.moduleName === '' ? undefined : message.moduleName;
    obj.abi = message.abi === '' ? undefined : message.abi;
    obj.raw_bytes = message.rawBytes ? base64FromBytes(message.rawBytes) : undefined;
    obj.upgrade_policy = message.upgradePolicy === 0 ? undefined : message.upgradePolicy;
    return obj;
  },
  fromAminoMsg(object: ModuleAminoMsg): Module {
    return Module.fromAmino(object.value);
  },
  fromProtoMsg(message: ModuleProtoMsg): Module {
    return Module.decode(message.value);
  },
  toProto(message: Module): Uint8Array {
    return Module.encode(message).finish();
  },
  toProtoMsg(message: Module): ModuleProtoMsg {
    return {
      typeUrl: '/initia.move.v1.Module',
      value: Module.encode(message).finish(),
    };
  },
};
function createBaseResource(): Resource {
  return {
    address: '',
    structTag: '',
    moveResource: '',
    rawBytes: new Uint8Array(),
  };
}
export const Resource = {
  typeUrl: '/initia.move.v1.Resource',
  encode(message: Resource, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.address !== '') {
      writer.uint32(10).string(message.address);
    }
    if (message.structTag !== '') {
      writer.uint32(18).string(message.structTag);
    }
    if (message.moveResource !== '') {
      writer.uint32(26).string(message.moveResource);
    }
    if (message.rawBytes.length !== 0) {
      writer.uint32(34).bytes(message.rawBytes);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Resource {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResource();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        case 2:
          message.structTag = reader.string();
          break;
        case 3:
          message.moveResource = reader.string();
          break;
        case 4:
          message.rawBytes = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Resource>): Resource {
    const message = createBaseResource();
    message.address = object.address ?? '';
    message.structTag = object.structTag ?? '';
    message.moveResource = object.moveResource ?? '';
    message.rawBytes = object.rawBytes ?? new Uint8Array();
    return message;
  },
  fromAmino(object: ResourceAmino): Resource {
    const message = createBaseResource();
    if (object.address !== undefined && object.address !== null) {
      message.address = object.address;
    }
    if (object.struct_tag !== undefined && object.struct_tag !== null) {
      message.structTag = object.struct_tag;
    }
    if (object.move_resource !== undefined && object.move_resource !== null) {
      message.moveResource = object.move_resource;
    }
    if (object.raw_bytes !== undefined && object.raw_bytes !== null) {
      message.rawBytes = bytesFromBase64(object.raw_bytes);
    }
    return message;
  },
  toAmino(message: Resource): ResourceAmino {
    const obj: any = {};
    obj.address = message.address === '' ? undefined : message.address;
    obj.struct_tag = message.structTag === '' ? undefined : message.structTag;
    obj.move_resource = message.moveResource === '' ? undefined : message.moveResource;
    obj.raw_bytes = message.rawBytes ? base64FromBytes(message.rawBytes) : undefined;
    return obj;
  },
  fromAminoMsg(object: ResourceAminoMsg): Resource {
    return Resource.fromAmino(object.value);
  },
  fromProtoMsg(message: ResourceProtoMsg): Resource {
    return Resource.decode(message.value);
  },
  toProto(message: Resource): Uint8Array {
    return Resource.encode(message).finish();
  },
  toProtoMsg(message: Resource): ResourceProtoMsg {
    return {
      typeUrl: '/initia.move.v1.Resource',
      value: Resource.encode(message).finish(),
    };
  },
};
function createBaseTableInfo(): TableInfo {
  return {
    address: '',
    keyType: '',
    valueType: '',
  };
}
export const TableInfo = {
  typeUrl: '/initia.move.v1.TableInfo',
  encode(message: TableInfo, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.address !== '') {
      writer.uint32(10).string(message.address);
    }
    if (message.keyType !== '') {
      writer.uint32(18).string(message.keyType);
    }
    if (message.valueType !== '') {
      writer.uint32(26).string(message.valueType);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): TableInfo {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTableInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        case 2:
          message.keyType = reader.string();
          break;
        case 3:
          message.valueType = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<TableInfo>): TableInfo {
    const message = createBaseTableInfo();
    message.address = object.address ?? '';
    message.keyType = object.keyType ?? '';
    message.valueType = object.valueType ?? '';
    return message;
  },
  fromAmino(object: TableInfoAmino): TableInfo {
    const message = createBaseTableInfo();
    if (object.address !== undefined && object.address !== null) {
      message.address = object.address;
    }
    if (object.key_type !== undefined && object.key_type !== null) {
      message.keyType = object.key_type;
    }
    if (object.value_type !== undefined && object.value_type !== null) {
      message.valueType = object.value_type;
    }
    return message;
  },
  toAmino(message: TableInfo): TableInfoAmino {
    const obj: any = {};
    obj.address = message.address === '' ? undefined : message.address;
    obj.key_type = message.keyType === '' ? undefined : message.keyType;
    obj.value_type = message.valueType === '' ? undefined : message.valueType;
    return obj;
  },
  fromAminoMsg(object: TableInfoAminoMsg): TableInfo {
    return TableInfo.fromAmino(object.value);
  },
  fromProtoMsg(message: TableInfoProtoMsg): TableInfo {
    return TableInfo.decode(message.value);
  },
  toProto(message: TableInfo): Uint8Array {
    return TableInfo.encode(message).finish();
  },
  toProtoMsg(message: TableInfo): TableInfoProtoMsg {
    return {
      typeUrl: '/initia.move.v1.TableInfo',
      value: TableInfo.encode(message).finish(),
    };
  },
};
function createBaseTableEntry(): TableEntry {
  return {
    address: '',
    key: '',
    value: '',
    keyBytes: new Uint8Array(),
    valueBytes: new Uint8Array(),
  };
}
export const TableEntry = {
  typeUrl: '/initia.move.v1.TableEntry',
  encode(message: TableEntry, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.address !== '') {
      writer.uint32(10).string(message.address);
    }
    if (message.key !== '') {
      writer.uint32(18).string(message.key);
    }
    if (message.value !== '') {
      writer.uint32(26).string(message.value);
    }
    if (message.keyBytes.length !== 0) {
      writer.uint32(34).bytes(message.keyBytes);
    }
    if (message.valueBytes.length !== 0) {
      writer.uint32(42).bytes(message.valueBytes);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): TableEntry {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTableEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        case 2:
          message.key = reader.string();
          break;
        case 3:
          message.value = reader.string();
          break;
        case 4:
          message.keyBytes = reader.bytes();
          break;
        case 5:
          message.valueBytes = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<TableEntry>): TableEntry {
    const message = createBaseTableEntry();
    message.address = object.address ?? '';
    message.key = object.key ?? '';
    message.value = object.value ?? '';
    message.keyBytes = object.keyBytes ?? new Uint8Array();
    message.valueBytes = object.valueBytes ?? new Uint8Array();
    return message;
  },
  fromAmino(object: TableEntryAmino): TableEntry {
    const message = createBaseTableEntry();
    if (object.address !== undefined && object.address !== null) {
      message.address = object.address;
    }
    if (object.key !== undefined && object.key !== null) {
      message.key = object.key;
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = object.value;
    }
    if (object.key_bytes !== undefined && object.key_bytes !== null) {
      message.keyBytes = bytesFromBase64(object.key_bytes);
    }
    if (object.value_bytes !== undefined && object.value_bytes !== null) {
      message.valueBytes = bytesFromBase64(object.value_bytes);
    }
    return message;
  },
  toAmino(message: TableEntry): TableEntryAmino {
    const obj: any = {};
    obj.address = message.address === '' ? undefined : message.address;
    obj.key = message.key === '' ? undefined : message.key;
    obj.value = message.value === '' ? undefined : message.value;
    obj.key_bytes = message.keyBytes ? base64FromBytes(message.keyBytes) : undefined;
    obj.value_bytes = message.valueBytes ? base64FromBytes(message.valueBytes) : undefined;
    return obj;
  },
  fromAminoMsg(object: TableEntryAminoMsg): TableEntry {
    return TableEntry.fromAmino(object.value);
  },
  fromProtoMsg(message: TableEntryProtoMsg): TableEntry {
    return TableEntry.decode(message.value);
  },
  toProto(message: TableEntry): Uint8Array {
    return TableEntry.encode(message).finish();
  },
  toProtoMsg(message: TableEntry): TableEntryProtoMsg {
    return {
      typeUrl: '/initia.move.v1.TableEntry',
      value: TableEntry.encode(message).finish(),
    };
  },
};
function createBaseUpgradePolicyProto(): UpgradePolicyProto {
  return {
    policy: 0,
  };
}
export const UpgradePolicyProto = {
  typeUrl: '/initia.move.v1.UpgradePolicyProto',
  encode(message: UpgradePolicyProto, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.policy !== 0) {
      writer.uint32(8).int32(message.policy);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): UpgradePolicyProto {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpgradePolicyProto();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.policy = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<UpgradePolicyProto>): UpgradePolicyProto {
    const message = createBaseUpgradePolicyProto();
    message.policy = object.policy ?? 0;
    return message;
  },
  fromAmino(object: UpgradePolicyProtoAmino): UpgradePolicyProto {
    const message = createBaseUpgradePolicyProto();
    if (object.policy !== undefined && object.policy !== null) {
      message.policy = object.policy;
    }
    return message;
  },
  toAmino(message: UpgradePolicyProto): UpgradePolicyProtoAmino {
    const obj: any = {};
    obj.policy = message.policy === 0 ? undefined : message.policy;
    return obj;
  },
  fromAminoMsg(object: UpgradePolicyProtoAminoMsg): UpgradePolicyProto {
    return UpgradePolicyProto.fromAmino(object.value);
  },
  fromProtoMsg(message: UpgradePolicyProtoProtoMsg): UpgradePolicyProto {
    return UpgradePolicyProto.decode(message.value);
  },
  toProto(message: UpgradePolicyProto): Uint8Array {
    return UpgradePolicyProto.encode(message).finish();
  },
  toProtoMsg(message: UpgradePolicyProto): UpgradePolicyProtoProtoMsg {
    return {
      typeUrl: '/initia.move.v1.UpgradePolicyProto',
      value: UpgradePolicyProto.encode(message).finish(),
    };
  },
};
function createBaseDexPair(): DexPair {
  return {
    metadataQuote: '',
    metadataLp: '',
  };
}
export const DexPair = {
  typeUrl: '/initia.move.v1.DexPair',
  encode(message: DexPair, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.metadataQuote !== '') {
      writer.uint32(10).string(message.metadataQuote);
    }
    if (message.metadataLp !== '') {
      writer.uint32(18).string(message.metadataLp);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): DexPair {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDexPair();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.metadataQuote = reader.string();
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
  fromPartial(object: Partial<DexPair>): DexPair {
    const message = createBaseDexPair();
    message.metadataQuote = object.metadataQuote ?? '';
    message.metadataLp = object.metadataLp ?? '';
    return message;
  },
  fromAmino(object: DexPairAmino): DexPair {
    const message = createBaseDexPair();
    if (object.metadata_quote !== undefined && object.metadata_quote !== null) {
      message.metadataQuote = object.metadata_quote;
    }
    if (object.metadata_lp !== undefined && object.metadata_lp !== null) {
      message.metadataLp = object.metadata_lp;
    }
    return message;
  },
  toAmino(message: DexPair): DexPairAmino {
    const obj: any = {};
    obj.metadata_quote = message.metadataQuote === '' ? undefined : message.metadataQuote;
    obj.metadata_lp = message.metadataLp === '' ? undefined : message.metadataLp;
    return obj;
  },
  fromAminoMsg(object: DexPairAminoMsg): DexPair {
    return DexPair.fromAmino(object.value);
  },
  fromProtoMsg(message: DexPairProtoMsg): DexPair {
    return DexPair.decode(message.value);
  },
  toProto(message: DexPair): Uint8Array {
    return DexPair.encode(message).finish();
  },
  toProtoMsg(message: DexPair): DexPairProtoMsg {
    return {
      typeUrl: '/initia.move.v1.DexPair',
      value: DexPair.encode(message).finish(),
    };
  },
};
function createBaseExecuteAuthorizationItem(): ExecuteAuthorizationItem {
  return {
    moduleAddress: '',
    moduleName: '',
    functionNames: [],
  };
}
export const ExecuteAuthorizationItem = {
  typeUrl: '/initia.move.v1.ExecuteAuthorizationItem',
  encode(message: ExecuteAuthorizationItem, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.moduleAddress !== '') {
      writer.uint32(10).string(message.moduleAddress);
    }
    if (message.moduleName !== '') {
      writer.uint32(18).string(message.moduleName);
    }
    for (const v of message.functionNames) {
      writer.uint32(26).string(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ExecuteAuthorizationItem {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseExecuteAuthorizationItem();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.moduleAddress = reader.string();
          break;
        case 2:
          message.moduleName = reader.string();
          break;
        case 3:
          message.functionNames.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<ExecuteAuthorizationItem>): ExecuteAuthorizationItem {
    const message = createBaseExecuteAuthorizationItem();
    message.moduleAddress = object.moduleAddress ?? '';
    message.moduleName = object.moduleName ?? '';
    message.functionNames = object.functionNames?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: ExecuteAuthorizationItemAmino): ExecuteAuthorizationItem {
    const message = createBaseExecuteAuthorizationItem();
    if (object.module_address !== undefined && object.module_address !== null) {
      message.moduleAddress = object.module_address;
    }
    if (object.module_name !== undefined && object.module_name !== null) {
      message.moduleName = object.module_name;
    }
    message.functionNames = object.function_names?.map((e) => e) || [];
    return message;
  },
  toAmino(message: ExecuteAuthorizationItem): ExecuteAuthorizationItemAmino {
    const obj: any = {};
    obj.module_address = message.moduleAddress === '' ? undefined : message.moduleAddress;
    obj.module_name = message.moduleName === '' ? undefined : message.moduleName;
    if (message.functionNames) {
      obj.function_names = message.functionNames.map((e) => e);
    } else {
      obj.function_names = message.functionNames;
    }
    return obj;
  },
  fromAminoMsg(object: ExecuteAuthorizationItemAminoMsg): ExecuteAuthorizationItem {
    return ExecuteAuthorizationItem.fromAmino(object.value);
  },
  fromProtoMsg(message: ExecuteAuthorizationItemProtoMsg): ExecuteAuthorizationItem {
    return ExecuteAuthorizationItem.decode(message.value);
  },
  toProto(message: ExecuteAuthorizationItem): Uint8Array {
    return ExecuteAuthorizationItem.encode(message).finish();
  },
  toProtoMsg(message: ExecuteAuthorizationItem): ExecuteAuthorizationItemProtoMsg {
    return {
      typeUrl: '/initia.move.v1.ExecuteAuthorizationItem',
      value: ExecuteAuthorizationItem.encode(message).finish(),
    };
  },
};
