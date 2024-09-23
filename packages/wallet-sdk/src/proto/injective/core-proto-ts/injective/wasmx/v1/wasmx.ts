/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../../../../binary';
import { AccessConfig, AccessConfigAmino, AccessConfigSDKType } from '../../../cosmwasm/wasm/v1/types';
import { FundingMode } from './proposal';
export interface Params {
  /**
   * Set the status to active to indicate that contracts can be executed in
   * begin blocker.
   */
  isExecutionEnabled: boolean;
  /**
   * Maximum aggregate total gas to be used for the contract executions in the
   * BeginBlocker.
   */
  maxBeginBlockTotalGas: bigint;
  /**
   * the maximum gas limit each individual contract can consume in the
   * BeginBlocker.
   */
  maxContractGasLimit: bigint;
  /**
   * min_gas_price defines the minimum gas price the contracts must pay to be
   * executed in the BeginBlocker.
   */
  minGasPrice: bigint;
  registerContractAccess: AccessConfig;
}
export interface ParamsProtoMsg {
  typeUrl: '/injective.wasmx.v1.Params';
  value: Uint8Array;
}
export interface ParamsAmino {
  /**
   * Set the status to active to indicate that contracts can be executed in
   * begin blocker.
   */
  is_execution_enabled?: boolean;
  /**
   * Maximum aggregate total gas to be used for the contract executions in the
   * BeginBlocker.
   */
  max_begin_block_total_gas?: string;
  /**
   * the maximum gas limit each individual contract can consume in the
   * BeginBlocker.
   */
  max_contract_gas_limit?: string;
  /**
   * min_gas_price defines the minimum gas price the contracts must pay to be
   * executed in the BeginBlocker.
   */
  min_gas_price?: string;
  register_contract_access: AccessConfigAmino;
}
export interface ParamsAminoMsg {
  type: 'wasmx/Params';
  value: ParamsAmino;
}
export interface ParamsSDKType {
  is_execution_enabled: boolean;
  max_begin_block_total_gas: bigint;
  max_contract_gas_limit: bigint;
  min_gas_price: bigint;
  register_contract_access: AccessConfigSDKType;
}
export interface RegisteredContract {
  /** limit of gas per BB execution */
  gasLimit: bigint;
  /** gas price that contract is willing to pay for execution in BeginBlocker */
  gasPrice: bigint;
  /** is contract currently active */
  isExecutable: boolean;
  /**
   * code_id that is allowed to be executed (to prevent malicious updates) - if
   * nil/0 any code_id can be executed
   */
  codeId?: bigint;
  /** optional - admin addr that is allowed to update contract data */
  adminAddress?: string;
  /**
   * Optional: address of the contract granting fee
   * Must be set if fund_mode is GrantOnly
   */
  granterAddress?: string;
  /** funding mode */
  fundMode: FundingMode;
}
export interface RegisteredContractProtoMsg {
  typeUrl: '/injective.wasmx.v1.RegisteredContract';
  value: Uint8Array;
}
export interface RegisteredContractAmino {
  /** limit of gas per BB execution */
  gas_limit?: string;
  /** gas price that contract is willing to pay for execution in BeginBlocker */
  gas_price?: string;
  /** is contract currently active */
  is_executable?: boolean;
  /**
   * code_id that is allowed to be executed (to prevent malicious updates) - if
   * nil/0 any code_id can be executed
   */
  code_id?: string;
  /** optional - admin addr that is allowed to update contract data */
  admin_address?: string;
  /**
   * Optional: address of the contract granting fee
   * Must be set if fund_mode is GrantOnly
   */
  granter_address?: string;
  /** funding mode */
  fund_mode?: FundingMode;
}
export interface RegisteredContractAminoMsg {
  type: '/injective.wasmx.v1.RegisteredContract';
  value: RegisteredContractAmino;
}
export interface RegisteredContractSDKType {
  gas_limit: bigint;
  gas_price: bigint;
  is_executable: boolean;
  code_id?: bigint;
  admin_address?: string;
  granter_address?: string;
  fund_mode: FundingMode;
}
function createBaseParams(): Params {
  return {
    isExecutionEnabled: false,
    maxBeginBlockTotalGas: BigInt(0),
    maxContractGasLimit: BigInt(0),
    minGasPrice: BigInt(0),
    registerContractAccess: AccessConfig.fromPartial({}),
  };
}
export const Params = {
  typeUrl: '/injective.wasmx.v1.Params',
  encode(message: Params, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.isExecutionEnabled === true) {
      writer.uint32(8).bool(message.isExecutionEnabled);
    }
    if (message.maxBeginBlockTotalGas !== BigInt(0)) {
      writer.uint32(16).uint64(message.maxBeginBlockTotalGas);
    }
    if (message.maxContractGasLimit !== BigInt(0)) {
      writer.uint32(24).uint64(message.maxContractGasLimit);
    }
    if (message.minGasPrice !== BigInt(0)) {
      writer.uint32(32).uint64(message.minGasPrice);
    }
    if (message.registerContractAccess !== undefined) {
      AccessConfig.encode(message.registerContractAccess, writer.uint32(42).fork()).ldelim();
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
          message.isExecutionEnabled = reader.bool();
          break;
        case 2:
          message.maxBeginBlockTotalGas = reader.uint64();
          break;
        case 3:
          message.maxContractGasLimit = reader.uint64();
          break;
        case 4:
          message.minGasPrice = reader.uint64();
          break;
        case 5:
          message.registerContractAccess = AccessConfig.decode(reader, reader.uint32());
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
    message.isExecutionEnabled = object.isExecutionEnabled ?? false;
    message.maxBeginBlockTotalGas =
      object.maxBeginBlockTotalGas !== undefined && object.maxBeginBlockTotalGas !== null
        ? BigInt(object.maxBeginBlockTotalGas.toString())
        : BigInt(0);
    message.maxContractGasLimit =
      object.maxContractGasLimit !== undefined && object.maxContractGasLimit !== null
        ? BigInt(object.maxContractGasLimit.toString())
        : BigInt(0);
    message.minGasPrice =
      object.minGasPrice !== undefined && object.minGasPrice !== null
        ? BigInt(object.minGasPrice.toString())
        : BigInt(0);
    message.registerContractAccess =
      object.registerContractAccess !== undefined && object.registerContractAccess !== null
        ? AccessConfig.fromPartial(object.registerContractAccess)
        : undefined;
    return message;
  },
  fromAmino(object: ParamsAmino): Params {
    const message = createBaseParams();
    if (object.is_execution_enabled !== undefined && object.is_execution_enabled !== null) {
      message.isExecutionEnabled = object.is_execution_enabled;
    }
    if (object.max_begin_block_total_gas !== undefined && object.max_begin_block_total_gas !== null) {
      message.maxBeginBlockTotalGas = BigInt(object.max_begin_block_total_gas);
    }
    if (object.max_contract_gas_limit !== undefined && object.max_contract_gas_limit !== null) {
      message.maxContractGasLimit = BigInt(object.max_contract_gas_limit);
    }
    if (object.min_gas_price !== undefined && object.min_gas_price !== null) {
      message.minGasPrice = BigInt(object.min_gas_price);
    }
    if (object.register_contract_access !== undefined && object.register_contract_access !== null) {
      message.registerContractAccess = AccessConfig.fromAmino(object.register_contract_access);
    }
    return message;
  },
  toAmino(message: Params): ParamsAmino {
    const obj: any = {};
    obj.is_execution_enabled = message.isExecutionEnabled === false ? undefined : message.isExecutionEnabled;
    obj.max_begin_block_total_gas =
      message.maxBeginBlockTotalGas !== BigInt(0) ? (message.maxBeginBlockTotalGas?.toString)() : undefined;
    obj.max_contract_gas_limit =
      message.maxContractGasLimit !== BigInt(0) ? (message.maxContractGasLimit?.toString)() : undefined;
    obj.min_gas_price = message.minGasPrice !== BigInt(0) ? (message.minGasPrice?.toString)() : undefined;
    obj.register_contract_access = message.registerContractAccess
      ? AccessConfig.toAmino(message.registerContractAccess)
      : AccessConfig.toAmino(AccessConfig.fromPartial({}));
    return obj;
  },
  fromAminoMsg(object: ParamsAminoMsg): Params {
    return Params.fromAmino(object.value);
  },
  toAminoMsg(message: Params): ParamsAminoMsg {
    return {
      type: 'wasmx/Params',
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
      typeUrl: '/injective.wasmx.v1.Params',
      value: Params.encode(message).finish(),
    };
  },
};
function createBaseRegisteredContract(): RegisteredContract {
  return {
    gasLimit: BigInt(0),
    gasPrice: BigInt(0),
    isExecutable: false,
    codeId: undefined,
    adminAddress: undefined,
    granterAddress: undefined,
    fundMode: 0,
  };
}
export const RegisteredContract = {
  typeUrl: '/injective.wasmx.v1.RegisteredContract',
  encode(message: RegisteredContract, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.gasLimit !== BigInt(0)) {
      writer.uint32(8).uint64(message.gasLimit);
    }
    if (message.gasPrice !== BigInt(0)) {
      writer.uint32(16).uint64(message.gasPrice);
    }
    if (message.isExecutable === true) {
      writer.uint32(24).bool(message.isExecutable);
    }
    if (message.codeId !== undefined) {
      writer.uint32(32).uint64(message.codeId);
    }
    if (message.adminAddress !== undefined) {
      writer.uint32(42).string(message.adminAddress);
    }
    if (message.granterAddress !== undefined) {
      writer.uint32(50).string(message.granterAddress);
    }
    if (message.fundMode !== 0) {
      writer.uint32(56).int32(message.fundMode);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): RegisteredContract {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRegisteredContract();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.gasLimit = reader.uint64();
          break;
        case 2:
          message.gasPrice = reader.uint64();
          break;
        case 3:
          message.isExecutable = reader.bool();
          break;
        case 4:
          message.codeId = reader.uint64();
          break;
        case 5:
          message.adminAddress = reader.string();
          break;
        case 6:
          message.granterAddress = reader.string();
          break;
        case 7:
          message.fundMode = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<RegisteredContract>): RegisteredContract {
    const message = createBaseRegisteredContract();
    message.gasLimit =
      object.gasLimit !== undefined && object.gasLimit !== null ? BigInt(object.gasLimit.toString()) : BigInt(0);
    message.gasPrice =
      object.gasPrice !== undefined && object.gasPrice !== null ? BigInt(object.gasPrice.toString()) : BigInt(0);
    message.isExecutable = object.isExecutable ?? false;
    message.codeId =
      object.codeId !== undefined && object.codeId !== null ? BigInt(object.codeId.toString()) : undefined;
    message.adminAddress = object.adminAddress ?? undefined;
    message.granterAddress = object.granterAddress ?? undefined;
    message.fundMode = object.fundMode ?? 0;
    return message;
  },
  fromAmino(object: RegisteredContractAmino): RegisteredContract {
    const message = createBaseRegisteredContract();
    if (object.gas_limit !== undefined && object.gas_limit !== null) {
      message.gasLimit = BigInt(object.gas_limit);
    }
    if (object.gas_price !== undefined && object.gas_price !== null) {
      message.gasPrice = BigInt(object.gas_price);
    }
    if (object.is_executable !== undefined && object.is_executable !== null) {
      message.isExecutable = object.is_executable;
    }
    if (object.code_id !== undefined && object.code_id !== null) {
      message.codeId = BigInt(object.code_id);
    }
    if (object.admin_address !== undefined && object.admin_address !== null) {
      message.adminAddress = object.admin_address;
    }
    if (object.granter_address !== undefined && object.granter_address !== null) {
      message.granterAddress = object.granter_address;
    }
    if (object.fund_mode !== undefined && object.fund_mode !== null) {
      message.fundMode = object.fund_mode;
    }
    return message;
  },
  toAmino(message: RegisteredContract): RegisteredContractAmino {
    const obj: any = {};
    obj.gas_limit = message.gasLimit !== BigInt(0) ? (message.gasLimit?.toString)() : undefined;
    obj.gas_price = message.gasPrice !== BigInt(0) ? (message.gasPrice?.toString)() : undefined;
    obj.is_executable = message.isExecutable === false ? undefined : message.isExecutable;
    obj.code_id = message.codeId !== BigInt(0) ? (message.codeId?.toString)() : undefined;
    obj.admin_address = message.adminAddress === null ? undefined : message.adminAddress;
    obj.granter_address = message.granterAddress === null ? undefined : message.granterAddress;
    obj.fund_mode = message.fundMode === 0 ? undefined : message.fundMode;
    return obj;
  },
  fromAminoMsg(object: RegisteredContractAminoMsg): RegisteredContract {
    return RegisteredContract.fromAmino(object.value);
  },
  fromProtoMsg(message: RegisteredContractProtoMsg): RegisteredContract {
    return RegisteredContract.decode(message.value);
  },
  toProto(message: RegisteredContract): Uint8Array {
    return RegisteredContract.encode(message).finish();
  },
  toProtoMsg(message: RegisteredContract): RegisteredContractProtoMsg {
    return {
      typeUrl: '/injective.wasmx.v1.RegisteredContract',
      value: RegisteredContract.encode(message).finish(),
    };
  },
};
