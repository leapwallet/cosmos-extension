/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../../../../binary';
import {
  StoreCodeProposal,
  StoreCodeProposalAmino,
  StoreCodeProposalSDKType,
} from '../../../cosmwasm/wasm/v1/proposal_legacy';
export enum FundingMode {
  Unspecified = 0,
  SelfFunded = 1,
  GrantOnly = 2,
  Dual = 3,
  UNRECOGNIZED = -1,
}
export const FundingModeSDKType = FundingMode;
export const FundingModeAmino = FundingMode;
export function fundingModeFromJSON(object: any): FundingMode {
  switch (object) {
    case 0:
    case 'Unspecified':
      return FundingMode.Unspecified;
    case 1:
    case 'SelfFunded':
      return FundingMode.SelfFunded;
    case 2:
    case 'GrantOnly':
      return FundingMode.GrantOnly;
    case 3:
    case 'Dual':
      return FundingMode.Dual;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return FundingMode.UNRECOGNIZED;
  }
}
export function fundingModeToJSON(object: FundingMode): string {
  switch (object) {
    case FundingMode.Unspecified:
      return 'Unspecified';
    case FundingMode.SelfFunded:
      return 'SelfFunded';
    case FundingMode.GrantOnly:
      return 'GrantOnly';
    case FundingMode.Dual:
      return 'Dual';
    case FundingMode.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}
export interface ContractRegistrationRequestProposal {
  $typeUrl?: '/injective.wasmx.v1.ContractRegistrationRequestProposal';
  title: string;
  description: string;
  contractRegistrationRequest: ContractRegistrationRequest;
}
export interface ContractRegistrationRequestProposalProtoMsg {
  typeUrl: '/injective.wasmx.v1.ContractRegistrationRequestProposal';
  value: Uint8Array;
}
export interface ContractRegistrationRequestProposalAmino {
  title?: string;
  description?: string;
  contract_registration_request?: ContractRegistrationRequestAmino;
}
export interface ContractRegistrationRequestProposalAminoMsg {
  type: 'wasmx/ContractRegistrationRequestProposal';
  value: ContractRegistrationRequestProposalAmino;
}
export interface ContractRegistrationRequestProposalSDKType {
  $typeUrl?: '/injective.wasmx.v1.ContractRegistrationRequestProposal';
  title: string;
  description: string;
  contract_registration_request: ContractRegistrationRequestSDKType;
}
export interface BatchContractRegistrationRequestProposal {
  $typeUrl?: '/injective.wasmx.v1.BatchContractRegistrationRequestProposal';
  title: string;
  description: string;
  contractRegistrationRequests: ContractRegistrationRequest[];
}
export interface BatchContractRegistrationRequestProposalProtoMsg {
  typeUrl: '/injective.wasmx.v1.BatchContractRegistrationRequestProposal';
  value: Uint8Array;
}
export interface BatchContractRegistrationRequestProposalAmino {
  title?: string;
  description?: string;
  contract_registration_requests?: ContractRegistrationRequestAmino[];
}
export interface BatchContractRegistrationRequestProposalAminoMsg {
  type: 'wasmx/BatchContractRegistrationRequestProposal';
  value: BatchContractRegistrationRequestProposalAmino;
}
export interface BatchContractRegistrationRequestProposalSDKType {
  $typeUrl?: '/injective.wasmx.v1.BatchContractRegistrationRequestProposal';
  title: string;
  description: string;
  contract_registration_requests: ContractRegistrationRequestSDKType[];
}
export interface BatchContractDeregistrationProposal {
  $typeUrl?: '/injective.wasmx.v1.BatchContractDeregistrationProposal';
  title: string;
  description: string;
  contracts: string[];
}
export interface BatchContractDeregistrationProposalProtoMsg {
  typeUrl: '/injective.wasmx.v1.BatchContractDeregistrationProposal';
  value: Uint8Array;
}
export interface BatchContractDeregistrationProposalAmino {
  title?: string;
  description?: string;
  contracts?: string[];
}
export interface BatchContractDeregistrationProposalAminoMsg {
  type: 'wasmx/BatchContractDeregistrationProposal';
  value: BatchContractDeregistrationProposalAmino;
}
export interface BatchContractDeregistrationProposalSDKType {
  $typeUrl?: '/injective.wasmx.v1.BatchContractDeregistrationProposal';
  title: string;
  description: string;
  contracts: string[];
}
export interface ContractRegistrationRequest {
  $typeUrl?: '/injective.wasmx.v1.ContractRegistrationRequest';
  /** Unique Identifier for contract instance to be registered. */
  contractAddress: string;
  /** Maximum gas to be used for the smart contract execution. */
  gasLimit: bigint;
  /** gas price to be used for the smart contract execution. */
  gasPrice: bigint;
  shouldPinContract: boolean;
  /**
   * if true contract owner can update it, if false only current code_id will be
   * allowed to be executed
   */
  isMigrationAllowed: boolean;
  /**
   * code_id of the contract being registered - will be verified upon every
   * execution but only if is_migration_allowed is false
   */
  codeId: bigint;
  /**
   * Optional address of admin account (that will be allowed to pause or update
   * contract params)
   */
  adminAddress: string;
  /**
   * Optional address of the contract that grants fees. Must be set if
   * funding_mode is other than SelfFunded
   */
  granterAddress: string;
  /** Specifies how the contract will fund its execution */
  fundingMode: FundingMode;
}
export interface ContractRegistrationRequestProtoMsg {
  typeUrl: '/injective.wasmx.v1.ContractRegistrationRequest';
  value: Uint8Array;
}
export interface ContractRegistrationRequestAmino {
  /** Unique Identifier for contract instance to be registered. */
  contract_address?: string;
  /** Maximum gas to be used for the smart contract execution. */
  gas_limit?: string;
  /** gas price to be used for the smart contract execution. */
  gas_price?: string;
  should_pin_contract?: boolean;
  /**
   * if true contract owner can update it, if false only current code_id will be
   * allowed to be executed
   */
  is_migration_allowed?: boolean;
  /**
   * code_id of the contract being registered - will be verified upon every
   * execution but only if is_migration_allowed is false
   */
  code_id?: string;
  /**
   * Optional address of admin account (that will be allowed to pause or update
   * contract params)
   */
  admin_address?: string;
  /**
   * Optional address of the contract that grants fees. Must be set if
   * funding_mode is other than SelfFunded
   */
  granter_address?: string;
  /** Specifies how the contract will fund its execution */
  funding_mode?: FundingMode;
}
export interface ContractRegistrationRequestAminoMsg {
  type: '/injective.wasmx.v1.ContractRegistrationRequest';
  value: ContractRegistrationRequestAmino;
}
export interface ContractRegistrationRequestSDKType {
  $typeUrl?: '/injective.wasmx.v1.ContractRegistrationRequest';
  contract_address: string;
  gas_limit: bigint;
  gas_price: bigint;
  should_pin_contract: boolean;
  is_migration_allowed: boolean;
  code_id: bigint;
  admin_address: string;
  granter_address: string;
  funding_mode: FundingMode;
}
export interface BatchStoreCodeProposal {
  $typeUrl?: '/injective.wasmx.v1.BatchStoreCodeProposal';
  title: string;
  description: string;
  proposals: StoreCodeProposal[];
}
export interface BatchStoreCodeProposalProtoMsg {
  typeUrl: '/injective.wasmx.v1.BatchStoreCodeProposal';
  value: Uint8Array;
}
export interface BatchStoreCodeProposalAmino {
  title?: string;
  description?: string;
  proposals?: StoreCodeProposalAmino[];
}
export interface BatchStoreCodeProposalAminoMsg {
  type: 'wasmx/BatchStoreCodeProposal';
  value: BatchStoreCodeProposalAmino;
}
export interface BatchStoreCodeProposalSDKType {
  $typeUrl?: '/injective.wasmx.v1.BatchStoreCodeProposal';
  title: string;
  description: string;
  proposals: StoreCodeProposalSDKType[];
}
function createBaseContractRegistrationRequestProposal(): ContractRegistrationRequestProposal {
  return {
    $typeUrl: '/injective.wasmx.v1.ContractRegistrationRequestProposal',
    title: '',
    description: '',
    contractRegistrationRequest: ContractRegistrationRequest.fromPartial({}),
  };
}
export const ContractRegistrationRequestProposal = {
  typeUrl: '/injective.wasmx.v1.ContractRegistrationRequestProposal',
  encode(message: ContractRegistrationRequestProposal, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.title !== '') {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== '') {
      writer.uint32(18).string(message.description);
    }
    if (message.contractRegistrationRequest !== undefined) {
      ContractRegistrationRequest.encode(message.contractRegistrationRequest, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ContractRegistrationRequestProposal {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseContractRegistrationRequestProposal();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.title = reader.string();
          break;
        case 2:
          message.description = reader.string();
          break;
        case 3:
          message.contractRegistrationRequest = ContractRegistrationRequest.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<ContractRegistrationRequestProposal>): ContractRegistrationRequestProposal {
    const message = createBaseContractRegistrationRequestProposal();
    message.title = object.title ?? '';
    message.description = object.description ?? '';
    message.contractRegistrationRequest =
      object.contractRegistrationRequest !== undefined && object.contractRegistrationRequest !== null
        ? ContractRegistrationRequest.fromPartial(object.contractRegistrationRequest)
        : undefined;
    return message;
  },
  fromAmino(object: ContractRegistrationRequestProposalAmino): ContractRegistrationRequestProposal {
    const message = createBaseContractRegistrationRequestProposal();
    if (object.title !== undefined && object.title !== null) {
      message.title = object.title;
    }
    if (object.description !== undefined && object.description !== null) {
      message.description = object.description;
    }
    if (object.contract_registration_request !== undefined && object.contract_registration_request !== null) {
      message.contractRegistrationRequest = ContractRegistrationRequest.fromAmino(object.contract_registration_request);
    }
    return message;
  },
  toAmino(message: ContractRegistrationRequestProposal): ContractRegistrationRequestProposalAmino {
    const obj: any = {};
    obj.title = message.title === '' ? undefined : message.title;
    obj.description = message.description === '' ? undefined : message.description;
    obj.contract_registration_request = message.contractRegistrationRequest
      ? ContractRegistrationRequest.toAmino(message.contractRegistrationRequest)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: ContractRegistrationRequestProposalAminoMsg): ContractRegistrationRequestProposal {
    return ContractRegistrationRequestProposal.fromAmino(object.value);
  },
  toAminoMsg(message: ContractRegistrationRequestProposal): ContractRegistrationRequestProposalAminoMsg {
    return {
      type: 'wasmx/ContractRegistrationRequestProposal',
      value: ContractRegistrationRequestProposal.toAmino(message),
    };
  },
  fromProtoMsg(message: ContractRegistrationRequestProposalProtoMsg): ContractRegistrationRequestProposal {
    return ContractRegistrationRequestProposal.decode(message.value);
  },
  toProto(message: ContractRegistrationRequestProposal): Uint8Array {
    return ContractRegistrationRequestProposal.encode(message).finish();
  },
  toProtoMsg(message: ContractRegistrationRequestProposal): ContractRegistrationRequestProposalProtoMsg {
    return {
      typeUrl: '/injective.wasmx.v1.ContractRegistrationRequestProposal',
      value: ContractRegistrationRequestProposal.encode(message).finish(),
    };
  },
};
function createBaseBatchContractRegistrationRequestProposal(): BatchContractRegistrationRequestProposal {
  return {
    $typeUrl: '/injective.wasmx.v1.BatchContractRegistrationRequestProposal',
    title: '',
    description: '',
    contractRegistrationRequests: [],
  };
}
export const BatchContractRegistrationRequestProposal = {
  typeUrl: '/injective.wasmx.v1.BatchContractRegistrationRequestProposal',
  encode(
    message: BatchContractRegistrationRequestProposal,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.title !== '') {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== '') {
      writer.uint32(18).string(message.description);
    }
    for (const v of message.contractRegistrationRequests) {
      ContractRegistrationRequest.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): BatchContractRegistrationRequestProposal {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBatchContractRegistrationRequestProposal();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.title = reader.string();
          break;
        case 2:
          message.description = reader.string();
          break;
        case 3:
          message.contractRegistrationRequests.push(ContractRegistrationRequest.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<BatchContractRegistrationRequestProposal>): BatchContractRegistrationRequestProposal {
    const message = createBaseBatchContractRegistrationRequestProposal();
    message.title = object.title ?? '';
    message.description = object.description ?? '';
    message.contractRegistrationRequests =
      object.contractRegistrationRequests?.map((e) => ContractRegistrationRequest.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: BatchContractRegistrationRequestProposalAmino): BatchContractRegistrationRequestProposal {
    const message = createBaseBatchContractRegistrationRequestProposal();
    if (object.title !== undefined && object.title !== null) {
      message.title = object.title;
    }
    if (object.description !== undefined && object.description !== null) {
      message.description = object.description;
    }
    message.contractRegistrationRequests =
      object.contract_registration_requests?.map((e) => ContractRegistrationRequest.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: BatchContractRegistrationRequestProposal): BatchContractRegistrationRequestProposalAmino {
    const obj: any = {};
    obj.title = message.title === '' ? undefined : message.title;
    obj.description = message.description === '' ? undefined : message.description;
    if (message.contractRegistrationRequests) {
      obj.contract_registration_requests = message.contractRegistrationRequests.map((e) =>
        e ? ContractRegistrationRequest.toAmino(e) : undefined,
      );
    } else {
      obj.contract_registration_requests = message.contractRegistrationRequests;
    }
    return obj;
  },
  fromAminoMsg(object: BatchContractRegistrationRequestProposalAminoMsg): BatchContractRegistrationRequestProposal {
    return BatchContractRegistrationRequestProposal.fromAmino(object.value);
  },
  toAminoMsg(message: BatchContractRegistrationRequestProposal): BatchContractRegistrationRequestProposalAminoMsg {
    return {
      type: 'wasmx/BatchContractRegistrationRequestProposal',
      value: BatchContractRegistrationRequestProposal.toAmino(message),
    };
  },
  fromProtoMsg(message: BatchContractRegistrationRequestProposalProtoMsg): BatchContractRegistrationRequestProposal {
    return BatchContractRegistrationRequestProposal.decode(message.value);
  },
  toProto(message: BatchContractRegistrationRequestProposal): Uint8Array {
    return BatchContractRegistrationRequestProposal.encode(message).finish();
  },
  toProtoMsg(message: BatchContractRegistrationRequestProposal): BatchContractRegistrationRequestProposalProtoMsg {
    return {
      typeUrl: '/injective.wasmx.v1.BatchContractRegistrationRequestProposal',
      value: BatchContractRegistrationRequestProposal.encode(message).finish(),
    };
  },
};
function createBaseBatchContractDeregistrationProposal(): BatchContractDeregistrationProposal {
  return {
    $typeUrl: '/injective.wasmx.v1.BatchContractDeregistrationProposal',
    title: '',
    description: '',
    contracts: [],
  };
}
export const BatchContractDeregistrationProposal = {
  typeUrl: '/injective.wasmx.v1.BatchContractDeregistrationProposal',
  encode(message: BatchContractDeregistrationProposal, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.title !== '') {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== '') {
      writer.uint32(18).string(message.description);
    }
    for (const v of message.contracts) {
      writer.uint32(26).string(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): BatchContractDeregistrationProposal {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBatchContractDeregistrationProposal();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.title = reader.string();
          break;
        case 2:
          message.description = reader.string();
          break;
        case 3:
          message.contracts.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<BatchContractDeregistrationProposal>): BatchContractDeregistrationProposal {
    const message = createBaseBatchContractDeregistrationProposal();
    message.title = object.title ?? '';
    message.description = object.description ?? '';
    message.contracts = object.contracts?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: BatchContractDeregistrationProposalAmino): BatchContractDeregistrationProposal {
    const message = createBaseBatchContractDeregistrationProposal();
    if (object.title !== undefined && object.title !== null) {
      message.title = object.title;
    }
    if (object.description !== undefined && object.description !== null) {
      message.description = object.description;
    }
    message.contracts = object.contracts?.map((e) => e) || [];
    return message;
  },
  toAmino(message: BatchContractDeregistrationProposal): BatchContractDeregistrationProposalAmino {
    const obj: any = {};
    obj.title = message.title === '' ? undefined : message.title;
    obj.description = message.description === '' ? undefined : message.description;
    if (message.contracts) {
      obj.contracts = message.contracts.map((e) => e);
    } else {
      obj.contracts = message.contracts;
    }
    return obj;
  },
  fromAminoMsg(object: BatchContractDeregistrationProposalAminoMsg): BatchContractDeregistrationProposal {
    return BatchContractDeregistrationProposal.fromAmino(object.value);
  },
  toAminoMsg(message: BatchContractDeregistrationProposal): BatchContractDeregistrationProposalAminoMsg {
    return {
      type: 'wasmx/BatchContractDeregistrationProposal',
      value: BatchContractDeregistrationProposal.toAmino(message),
    };
  },
  fromProtoMsg(message: BatchContractDeregistrationProposalProtoMsg): BatchContractDeregistrationProposal {
    return BatchContractDeregistrationProposal.decode(message.value);
  },
  toProto(message: BatchContractDeregistrationProposal): Uint8Array {
    return BatchContractDeregistrationProposal.encode(message).finish();
  },
  toProtoMsg(message: BatchContractDeregistrationProposal): BatchContractDeregistrationProposalProtoMsg {
    return {
      typeUrl: '/injective.wasmx.v1.BatchContractDeregistrationProposal',
      value: BatchContractDeregistrationProposal.encode(message).finish(),
    };
  },
};
function createBaseContractRegistrationRequest(): ContractRegistrationRequest {
  return {
    $typeUrl: '/injective.wasmx.v1.ContractRegistrationRequest',
    contractAddress: '',
    gasLimit: BigInt(0),
    gasPrice: BigInt(0),
    shouldPinContract: false,
    isMigrationAllowed: false,
    codeId: BigInt(0),
    adminAddress: '',
    granterAddress: '',
    fundingMode: 0,
  };
}
export const ContractRegistrationRequest = {
  typeUrl: '/injective.wasmx.v1.ContractRegistrationRequest',
  encode(message: ContractRegistrationRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.contractAddress !== '') {
      writer.uint32(10).string(message.contractAddress);
    }
    if (message.gasLimit !== BigInt(0)) {
      writer.uint32(16).uint64(message.gasLimit);
    }
    if (message.gasPrice !== BigInt(0)) {
      writer.uint32(24).uint64(message.gasPrice);
    }
    if (message.shouldPinContract === true) {
      writer.uint32(32).bool(message.shouldPinContract);
    }
    if (message.isMigrationAllowed === true) {
      writer.uint32(40).bool(message.isMigrationAllowed);
    }
    if (message.codeId !== BigInt(0)) {
      writer.uint32(48).uint64(message.codeId);
    }
    if (message.adminAddress !== '') {
      writer.uint32(58).string(message.adminAddress);
    }
    if (message.granterAddress !== '') {
      writer.uint32(66).string(message.granterAddress);
    }
    if (message.fundingMode !== 0) {
      writer.uint32(72).int32(message.fundingMode);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ContractRegistrationRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseContractRegistrationRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.contractAddress = reader.string();
          break;
        case 2:
          message.gasLimit = reader.uint64();
          break;
        case 3:
          message.gasPrice = reader.uint64();
          break;
        case 4:
          message.shouldPinContract = reader.bool();
          break;
        case 5:
          message.isMigrationAllowed = reader.bool();
          break;
        case 6:
          message.codeId = reader.uint64();
          break;
        case 7:
          message.adminAddress = reader.string();
          break;
        case 8:
          message.granterAddress = reader.string();
          break;
        case 9:
          message.fundingMode = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<ContractRegistrationRequest>): ContractRegistrationRequest {
    const message = createBaseContractRegistrationRequest();
    message.contractAddress = object.contractAddress ?? '';
    message.gasLimit =
      object.gasLimit !== undefined && object.gasLimit !== null ? BigInt(object.gasLimit.toString()) : BigInt(0);
    message.gasPrice =
      object.gasPrice !== undefined && object.gasPrice !== null ? BigInt(object.gasPrice.toString()) : BigInt(0);
    message.shouldPinContract = object.shouldPinContract ?? false;
    message.isMigrationAllowed = object.isMigrationAllowed ?? false;
    message.codeId =
      object.codeId !== undefined && object.codeId !== null ? BigInt(object.codeId.toString()) : BigInt(0);
    message.adminAddress = object.adminAddress ?? '';
    message.granterAddress = object.granterAddress ?? '';
    message.fundingMode = object.fundingMode ?? 0;
    return message;
  },
  fromAmino(object: ContractRegistrationRequestAmino): ContractRegistrationRequest {
    const message = createBaseContractRegistrationRequest();
    if (object.contract_address !== undefined && object.contract_address !== null) {
      message.contractAddress = object.contract_address;
    }
    if (object.gas_limit !== undefined && object.gas_limit !== null) {
      message.gasLimit = BigInt(object.gas_limit);
    }
    if (object.gas_price !== undefined && object.gas_price !== null) {
      message.gasPrice = BigInt(object.gas_price);
    }
    if (object.should_pin_contract !== undefined && object.should_pin_contract !== null) {
      message.shouldPinContract = object.should_pin_contract;
    }
    if (object.is_migration_allowed !== undefined && object.is_migration_allowed !== null) {
      message.isMigrationAllowed = object.is_migration_allowed;
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
    if (object.funding_mode !== undefined && object.funding_mode !== null) {
      message.fundingMode = object.funding_mode;
    }
    return message;
  },
  toAmino(message: ContractRegistrationRequest): ContractRegistrationRequestAmino {
    const obj: any = {};
    obj.contract_address = message.contractAddress === '' ? undefined : message.contractAddress;
    obj.gas_limit = message.gasLimit !== BigInt(0) ? (message.gasLimit?.toString)() : undefined;
    obj.gas_price = message.gasPrice !== BigInt(0) ? (message.gasPrice?.toString)() : undefined;
    obj.should_pin_contract = message.shouldPinContract === false ? undefined : message.shouldPinContract;
    obj.is_migration_allowed = message.isMigrationAllowed === false ? undefined : message.isMigrationAllowed;
    obj.code_id = message.codeId !== BigInt(0) ? (message.codeId?.toString)() : undefined;
    obj.admin_address = message.adminAddress === '' ? undefined : message.adminAddress;
    obj.granter_address = message.granterAddress === '' ? undefined : message.granterAddress;
    obj.funding_mode = message.fundingMode === 0 ? undefined : message.fundingMode;
    return obj;
  },
  fromAminoMsg(object: ContractRegistrationRequestAminoMsg): ContractRegistrationRequest {
    return ContractRegistrationRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: ContractRegistrationRequestProtoMsg): ContractRegistrationRequest {
    return ContractRegistrationRequest.decode(message.value);
  },
  toProto(message: ContractRegistrationRequest): Uint8Array {
    return ContractRegistrationRequest.encode(message).finish();
  },
  toProtoMsg(message: ContractRegistrationRequest): ContractRegistrationRequestProtoMsg {
    return {
      typeUrl: '/injective.wasmx.v1.ContractRegistrationRequest',
      value: ContractRegistrationRequest.encode(message).finish(),
    };
  },
};
function createBaseBatchStoreCodeProposal(): BatchStoreCodeProposal {
  return {
    $typeUrl: '/injective.wasmx.v1.BatchStoreCodeProposal',
    title: '',
    description: '',
    proposals: [],
  };
}
export const BatchStoreCodeProposal = {
  typeUrl: '/injective.wasmx.v1.BatchStoreCodeProposal',
  encode(message: BatchStoreCodeProposal, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.title !== '') {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== '') {
      writer.uint32(18).string(message.description);
    }
    for (const v of message.proposals) {
      StoreCodeProposal.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): BatchStoreCodeProposal {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBatchStoreCodeProposal();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.title = reader.string();
          break;
        case 2:
          message.description = reader.string();
          break;
        case 3:
          message.proposals.push(StoreCodeProposal.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<BatchStoreCodeProposal>): BatchStoreCodeProposal {
    const message = createBaseBatchStoreCodeProposal();
    message.title = object.title ?? '';
    message.description = object.description ?? '';
    message.proposals = object.proposals?.map((e) => StoreCodeProposal.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: BatchStoreCodeProposalAmino): BatchStoreCodeProposal {
    const message = createBaseBatchStoreCodeProposal();
    if (object.title !== undefined && object.title !== null) {
      message.title = object.title;
    }
    if (object.description !== undefined && object.description !== null) {
      message.description = object.description;
    }
    message.proposals = object.proposals?.map((e) => StoreCodeProposal.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: BatchStoreCodeProposal): BatchStoreCodeProposalAmino {
    const obj: any = {};
    obj.title = message.title === '' ? undefined : message.title;
    obj.description = message.description === '' ? undefined : message.description;
    if (message.proposals) {
      obj.proposals = message.proposals.map((e) => (e ? StoreCodeProposal.toAmino(e) : undefined));
    } else {
      obj.proposals = message.proposals;
    }
    return obj;
  },
  fromAminoMsg(object: BatchStoreCodeProposalAminoMsg): BatchStoreCodeProposal {
    return BatchStoreCodeProposal.fromAmino(object.value);
  },
  toAminoMsg(message: BatchStoreCodeProposal): BatchStoreCodeProposalAminoMsg {
    return {
      type: 'wasmx/BatchStoreCodeProposal',
      value: BatchStoreCodeProposal.toAmino(message),
    };
  },
  fromProtoMsg(message: BatchStoreCodeProposalProtoMsg): BatchStoreCodeProposal {
    return BatchStoreCodeProposal.decode(message.value);
  },
  toProto(message: BatchStoreCodeProposal): Uint8Array {
    return BatchStoreCodeProposal.encode(message).finish();
  },
  toProtoMsg(message: BatchStoreCodeProposal): BatchStoreCodeProposalProtoMsg {
    return {
      typeUrl: '/injective.wasmx.v1.BatchStoreCodeProposal',
      value: BatchStoreCodeProposal.encode(message).finish(),
    };
  },
};
