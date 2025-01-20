import { BinaryReader, BinaryWriter } from '../../../binary';
import { base64FromBytes, bytesFromBase64 } from '../../../helpers';
/** BtcStatus is an enum describing the current btc status of the checkpoint */
export enum BtcStatus {
  /**
   * EPOCH_STATUS_SUBMITTED - SUBMITTED Epoch has Submitted btc status if there ever was at least one
   * known submission on btc main chain
   */
  EPOCH_STATUS_SUBMITTED = 0,
  /**
   * EPOCH_STATUS_CONFIRMED - CONFIRMED Epoch has Confirmed btc status if there ever was at least one
   * known submission on btc main chain which was k-deep
   */
  EPOCH_STATUS_CONFIRMED = 1,
  /**
   * EPOCH_STATUS_FINALIZED - CONFIRMED Epoch has Finalized btc status if there is was at exactly one
   * knon submission on btc main chain which is w-deep
   */
  EPOCH_STATUS_FINALIZED = 2,
  UNRECOGNIZED = -1,
}
export const BtcStatusSDKType = BtcStatus;
export const BtcStatusAmino = BtcStatus;
export function btcStatusFromJSON(object: any): BtcStatus {
  switch (object) {
    case 0:
    case 'EPOCH_STATUS_SUBMITTED':
      return BtcStatus.EPOCH_STATUS_SUBMITTED;
    case 1:
    case 'EPOCH_STATUS_CONFIRMED':
      return BtcStatus.EPOCH_STATUS_CONFIRMED;
    case 2:
    case 'EPOCH_STATUS_FINALIZED':
      return BtcStatus.EPOCH_STATUS_FINALIZED;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return BtcStatus.UNRECOGNIZED;
  }
}
export function btcStatusToJSON(object: BtcStatus): string {
  switch (object) {
    case BtcStatus.EPOCH_STATUS_SUBMITTED:
      return 'EPOCH_STATUS_SUBMITTED';
    case BtcStatus.EPOCH_STATUS_CONFIRMED:
      return 'EPOCH_STATUS_CONFIRMED';
    case BtcStatus.EPOCH_STATUS_FINALIZED:
      return 'EPOCH_STATUS_FINALIZED';
    case BtcStatus.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}
/**
 * Consider we have a Merkle tree with following structure:
 *            ROOT
 *           /    \
 *      H1234      H5555
 *     /     \       \
 *   H12     H34      H55
 *  /  \    /  \     /
 * H1  H2  H3  H4  H5
 * L1  L2  L3  L4  L5
 * To prove L3 was part of ROOT we need:
 * - btc_transaction_index = 2 which in binary is 010
 * (where 0 means going left, 1 means going right in the tree)
 * - merkle_nodes we'd have H4 || H12 || H5555
 * By looking at 010 we would know that H4 is a right sibling,
 * H12 is left, H5555 is right again.
 */
export interface BTCSpvProof {
  /** Valid bitcoin transaction containing OP_RETURN opcode. */
  btcTransaction: Uint8Array;
  /**
   * Index of transaction within the block. Index is needed to determine if
   * currently hashed node is left or right.
   */
  btcTransactionIndex: number;
  /**
   * List of concatenated intermediate merkle tree nodes, without root node and
   * leaf node against which we calculate the proof. Each node has 32 byte
   * length. Example proof can look like: 32_bytes_of_node1 || 32_bytes_of_node2
   * ||  32_bytes_of_node3 so the length of the proof will always be divisible
   * by 32.
   */
  merkleNodes: Uint8Array;
  /**
   * Valid btc header which confirms btc_transaction.
   * Should have exactly 80 bytes
   */
  confirmingBtcHeader: Uint8Array;
}
export interface BTCSpvProofProtoMsg {
  typeUrl: '/babylon.btccheckpoint.v1.BTCSpvProof';
  value: Uint8Array;
}
/**
 * Consider we have a Merkle tree with following structure:
 *            ROOT
 *           /    \
 *      H1234      H5555
 *     /     \       \
 *   H12     H34      H55
 *  /  \    /  \     /
 * H1  H2  H3  H4  H5
 * L1  L2  L3  L4  L5
 * To prove L3 was part of ROOT we need:
 * - btc_transaction_index = 2 which in binary is 010
 * (where 0 means going left, 1 means going right in the tree)
 * - merkle_nodes we'd have H4 || H12 || H5555
 * By looking at 010 we would know that H4 is a right sibling,
 * H12 is left, H5555 is right again.
 */
export interface BTCSpvProofAmino {
  /** Valid bitcoin transaction containing OP_RETURN opcode. */
  btc_transaction?: string;
  /**
   * Index of transaction within the block. Index is needed to determine if
   * currently hashed node is left or right.
   */
  btc_transaction_index?: number;
  /**
   * List of concatenated intermediate merkle tree nodes, without root node and
   * leaf node against which we calculate the proof. Each node has 32 byte
   * length. Example proof can look like: 32_bytes_of_node1 || 32_bytes_of_node2
   * ||  32_bytes_of_node3 so the length of the proof will always be divisible
   * by 32.
   */
  merkle_nodes?: string;
  /**
   * Valid btc header which confirms btc_transaction.
   * Should have exactly 80 bytes
   */
  confirming_btc_header?: string;
}
export interface BTCSpvProofAminoMsg {
  type: '/babylon.btccheckpoint.v1.BTCSpvProof';
  value: BTCSpvProofAmino;
}
/**
 * Consider we have a Merkle tree with following structure:
 *            ROOT
 *           /    \
 *      H1234      H5555
 *     /     \       \
 *   H12     H34      H55
 *  /  \    /  \     /
 * H1  H2  H3  H4  H5
 * L1  L2  L3  L4  L5
 * To prove L3 was part of ROOT we need:
 * - btc_transaction_index = 2 which in binary is 010
 * (where 0 means going left, 1 means going right in the tree)
 * - merkle_nodes we'd have H4 || H12 || H5555
 * By looking at 010 we would know that H4 is a right sibling,
 * H12 is left, H5555 is right again.
 */
export interface BTCSpvProofSDKType {
  btc_transaction: Uint8Array;
  btc_transaction_index: number;
  merkle_nodes: Uint8Array;
  confirming_btc_header: Uint8Array;
}
/**
 * Each provided OP_RETURN transaction can be identified by hash of block in
 * which transaction was included and transaction index in the block
 */
export interface TransactionKey {
  index: number;
  hash: Uint8Array;
}
export interface TransactionKeyProtoMsg {
  typeUrl: '/babylon.btccheckpoint.v1.TransactionKey';
  value: Uint8Array;
}
/**
 * Each provided OP_RETURN transaction can be identified by hash of block in
 * which transaction was included and transaction index in the block
 */
export interface TransactionKeyAmino {
  index?: number;
  hash?: string;
}
export interface TransactionKeyAminoMsg {
  type: '/babylon.btccheckpoint.v1.TransactionKey';
  value: TransactionKeyAmino;
}
/**
 * Each provided OP_RETURN transaction can be identified by hash of block in
 * which transaction was included and transaction index in the block
 */
export interface TransactionKeySDKType {
  index: number;
  hash: Uint8Array;
}
/**
 * Checkpoint can be composed from multiple transactions, so to identify whole
 * submission we need list of transaction keys.
 * Each submission can generally be identified by this list of (txIdx,
 * blockHash) tuples. Note: this could possibly be optimized as if transactions
 * were in one block they would have the same block hash and different indexes,
 * but each blockhash is only 33 (1  byte for prefix encoding and 32 byte hash),
 * so there should be other strong arguments for this optimization
 */
export interface SubmissionKey {
  key: TransactionKey[];
}
export interface SubmissionKeyProtoMsg {
  typeUrl: '/babylon.btccheckpoint.v1.SubmissionKey';
  value: Uint8Array;
}
/**
 * Checkpoint can be composed from multiple transactions, so to identify whole
 * submission we need list of transaction keys.
 * Each submission can generally be identified by this list of (txIdx,
 * blockHash) tuples. Note: this could possibly be optimized as if transactions
 * were in one block they would have the same block hash and different indexes,
 * but each blockhash is only 33 (1  byte for prefix encoding and 32 byte hash),
 * so there should be other strong arguments for this optimization
 */
export interface SubmissionKeyAmino {
  key?: TransactionKeyAmino[];
}
export interface SubmissionKeyAminoMsg {
  type: '/babylon.btccheckpoint.v1.SubmissionKey';
  value: SubmissionKeyAmino;
}
/**
 * Checkpoint can be composed from multiple transactions, so to identify whole
 * submission we need list of transaction keys.
 * Each submission can generally be identified by this list of (txIdx,
 * blockHash) tuples. Note: this could possibly be optimized as if transactions
 * were in one block they would have the same block hash and different indexes,
 * but each blockhash is only 33 (1  byte for prefix encoding and 32 byte hash),
 * so there should be other strong arguments for this optimization
 */
export interface SubmissionKeySDKType {
  key: TransactionKeySDKType[];
}
/**
 * TransactionInfo is the info of a tx on Bitcoin,
 * including
 * - the position of the tx on BTC blockchain
 * - the full tx content
 * - the Merkle proof that this tx is on the above position
 */
export interface TransactionInfo {
  /**
   * key is the position (txIdx, blockHash) of this tx on BTC blockchain
   * Although it is already a part of SubmissionKey, we store it here again
   * to make TransactionInfo self-contained.
   * For example, storing the key allows TransactionInfo to not relay on
   * the fact that TransactionInfo will be ordered in the same order as
   * TransactionKeys in SubmissionKey.
   */
  key?: TransactionKey;
  /** transaction is the full transaction in bytes */
  transaction: Uint8Array;
  /**
   * proof is the Merkle proof that this tx is included in the position in `key`
   * TODO: maybe it could use here better format as we already processed and
   * validated the proof?
   */
  proof: Uint8Array;
}
export interface TransactionInfoProtoMsg {
  typeUrl: '/babylon.btccheckpoint.v1.TransactionInfo';
  value: Uint8Array;
}
/**
 * TransactionInfo is the info of a tx on Bitcoin,
 * including
 * - the position of the tx on BTC blockchain
 * - the full tx content
 * - the Merkle proof that this tx is on the above position
 */
export interface TransactionInfoAmino {
  /**
   * key is the position (txIdx, blockHash) of this tx on BTC blockchain
   * Although it is already a part of SubmissionKey, we store it here again
   * to make TransactionInfo self-contained.
   * For example, storing the key allows TransactionInfo to not relay on
   * the fact that TransactionInfo will be ordered in the same order as
   * TransactionKeys in SubmissionKey.
   */
  key?: TransactionKeyAmino;
  /** transaction is the full transaction in bytes */
  transaction?: string;
  /**
   * proof is the Merkle proof that this tx is included in the position in `key`
   * TODO: maybe it could use here better format as we already processed and
   * validated the proof?
   */
  proof?: string;
}
export interface TransactionInfoAminoMsg {
  type: '/babylon.btccheckpoint.v1.TransactionInfo';
  value: TransactionInfoAmino;
}
/**
 * TransactionInfo is the info of a tx on Bitcoin,
 * including
 * - the position of the tx on BTC blockchain
 * - the full tx content
 * - the Merkle proof that this tx is on the above position
 */
export interface TransactionInfoSDKType {
  key?: TransactionKeySDKType;
  transaction: Uint8Array;
  proof: Uint8Array;
}
/**
 * TODO: Determine if we should keep any block number or depth info.
 * On one hand it may be useful to determine if block is stable or not, on
 * other depth/block number info, without context (i.e info about chain) is
 * pretty useless and blockhash in enough to retrieve is from lightclient
 */
export interface SubmissionData {
  /** address of the submitter and reporter */
  vigilanteAddresses?: CheckpointAddresses;
  /**
   * txs_info is the two `TransactionInfo`s corresponding to the submission
   * It is used for
   * - recovering address of sender of btc transaction to payup the reward.
   * - allowing the ZoneConcierge module to prove the checkpoint is submitted to
   * BTC
   */
  txsInfo: TransactionInfo[];
  epoch: bigint;
}
export interface SubmissionDataProtoMsg {
  typeUrl: '/babylon.btccheckpoint.v1.SubmissionData';
  value: Uint8Array;
}
/**
 * TODO: Determine if we should keep any block number or depth info.
 * On one hand it may be useful to determine if block is stable or not, on
 * other depth/block number info, without context (i.e info about chain) is
 * pretty useless and blockhash in enough to retrieve is from lightclient
 */
export interface SubmissionDataAmino {
  /** address of the submitter and reporter */
  vigilante_addresses?: CheckpointAddressesAmino;
  /**
   * txs_info is the two `TransactionInfo`s corresponding to the submission
   * It is used for
   * - recovering address of sender of btc transaction to payup the reward.
   * - allowing the ZoneConcierge module to prove the checkpoint is submitted to
   * BTC
   */
  txs_info?: TransactionInfoAmino[];
  epoch?: string;
}
export interface SubmissionDataAminoMsg {
  type: '/babylon.btccheckpoint.v1.SubmissionData';
  value: SubmissionDataAmino;
}
/**
 * TODO: Determine if we should keep any block number or depth info.
 * On one hand it may be useful to determine if block is stable or not, on
 * other depth/block number info, without context (i.e info about chain) is
 * pretty useless and blockhash in enough to retrieve is from lightclient
 */
export interface SubmissionDataSDKType {
  vigilante_addresses?: CheckpointAddressesSDKType;
  txs_info: TransactionInfoSDKType[];
  epoch: bigint;
}
/**
 * Data stored in db and indexed by epoch number
 * TODO: Add btc blockheight at epoch end, when adding handling of epoching
 * callbacks
 */
export interface EpochData {
  /**
   * keys is the list of all received checkpoints during this epoch, sorted by
   * order of submission.
   */
  keys: SubmissionKey[];
  /** status is the current btc status of the epoch */
  status: BtcStatus;
}
export interface EpochDataProtoMsg {
  typeUrl: '/babylon.btccheckpoint.v1.EpochData';
  value: Uint8Array;
}
/**
 * Data stored in db and indexed by epoch number
 * TODO: Add btc blockheight at epoch end, when adding handling of epoching
 * callbacks
 */
export interface EpochDataAmino {
  /**
   * keys is the list of all received checkpoints during this epoch, sorted by
   * order of submission.
   */
  keys?: SubmissionKeyAmino[];
  /** status is the current btc status of the epoch */
  status?: BtcStatus;
}
export interface EpochDataAminoMsg {
  type: '/babylon.btccheckpoint.v1.EpochData';
  value: EpochDataAmino;
}
/**
 * Data stored in db and indexed by epoch number
 * TODO: Add btc blockheight at epoch end, when adding handling of epoching
 * callbacks
 */
export interface EpochDataSDKType {
  keys: SubmissionKeySDKType[];
  status: BtcStatus;
}
/**
 * CheckpointAddresses contains the addresses of the submitter and reporter of a
 * given checkpoint
 */
export interface CheckpointAddresses {
  /**
   * TODO: this could probably be better typed
   * submitter is the address of the checkpoint submitter to BTC, extracted from
   * the checkpoint itself.
   */
  submitter: Uint8Array;
  /**
   * reporter is the address of the reporter who reported the submissions,
   * calculated from submission message MsgInsertBTCSpvProof itself
   */
  reporter: Uint8Array;
}
export interface CheckpointAddressesProtoMsg {
  typeUrl: '/babylon.btccheckpoint.v1.CheckpointAddresses';
  value: Uint8Array;
}
/**
 * CheckpointAddresses contains the addresses of the submitter and reporter of a
 * given checkpoint
 */
export interface CheckpointAddressesAmino {
  /**
   * TODO: this could probably be better typed
   * submitter is the address of the checkpoint submitter to BTC, extracted from
   * the checkpoint itself.
   */
  submitter?: string;
  /**
   * reporter is the address of the reporter who reported the submissions,
   * calculated from submission message MsgInsertBTCSpvProof itself
   */
  reporter?: string;
}
export interface CheckpointAddressesAminoMsg {
  type: '/babylon.btccheckpoint.v1.CheckpointAddresses';
  value: CheckpointAddressesAmino;
}
/**
 * CheckpointAddresses contains the addresses of the submitter and reporter of a
 * given checkpoint
 */
export interface CheckpointAddressesSDKType {
  submitter: Uint8Array;
  reporter: Uint8Array;
}
/**
 * BTCCheckpointInfo contains all data about best submission of checkpoint for
 * given epoch. Best submission is the submission which is deeper in btc ledger
 */
export interface BTCCheckpointInfo {
  /** epoch number of this checkpoint */
  epochNumber: bigint;
  /** btc height of the best submission of the epoch */
  bestSubmissionBtcBlockHeight: bigint;
  /**
   * hash of the btc block which determines checkpoint btc block height i.e.
   * youngest block of best submission
   */
  bestSubmissionBtcBlockHash: Uint8Array;
  /** the BTC checkpoint transactions of the best submission */
  bestSubmissionTransactions: TransactionInfo[];
  /** list of vigilantes' addresses of the best submission */
  bestSubmissionVigilanteAddressList: CheckpointAddresses[];
}
export interface BTCCheckpointInfoProtoMsg {
  typeUrl: '/babylon.btccheckpoint.v1.BTCCheckpointInfo';
  value: Uint8Array;
}
/**
 * BTCCheckpointInfo contains all data about best submission of checkpoint for
 * given epoch. Best submission is the submission which is deeper in btc ledger
 */
export interface BTCCheckpointInfoAmino {
  /** epoch number of this checkpoint */
  epoch_number?: string;
  /** btc height of the best submission of the epoch */
  best_submission_btc_block_height?: string;
  /**
   * hash of the btc block which determines checkpoint btc block height i.e.
   * youngest block of best submission
   */
  best_submission_btc_block_hash?: string;
  /** the BTC checkpoint transactions of the best submission */
  best_submission_transactions?: TransactionInfoAmino[];
  /** list of vigilantes' addresses of the best submission */
  best_submission_vigilante_address_list?: CheckpointAddressesAmino[];
}
export interface BTCCheckpointInfoAminoMsg {
  type: '/babylon.btccheckpoint.v1.BTCCheckpointInfo';
  value: BTCCheckpointInfoAmino;
}
/**
 * BTCCheckpointInfo contains all data about best submission of checkpoint for
 * given epoch. Best submission is the submission which is deeper in btc ledger
 */
export interface BTCCheckpointInfoSDKType {
  epoch_number: bigint;
  best_submission_btc_block_height: bigint;
  best_submission_btc_block_hash: Uint8Array;
  best_submission_transactions: TransactionInfoSDKType[];
  best_submission_vigilante_address_list: CheckpointAddressesSDKType[];
}
function createBaseBTCSpvProof(): BTCSpvProof {
  return {
    btcTransaction: new Uint8Array(),
    btcTransactionIndex: 0,
    merkleNodes: new Uint8Array(),
    confirmingBtcHeader: new Uint8Array(),
  };
}
export const BTCSpvProof = {
  typeUrl: '/babylon.btccheckpoint.v1.BTCSpvProof',
  encode(message: BTCSpvProof, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.btcTransaction.length !== 0) {
      writer.uint32(10).bytes(message.btcTransaction);
    }
    if (message.btcTransactionIndex !== 0) {
      writer.uint32(16).uint32(message.btcTransactionIndex);
    }
    if (message.merkleNodes.length !== 0) {
      writer.uint32(26).bytes(message.merkleNodes);
    }
    if (message.confirmingBtcHeader.length !== 0) {
      writer.uint32(34).bytes(message.confirmingBtcHeader);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): BTCSpvProof {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBTCSpvProof();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.btcTransaction = reader.bytes();
          break;
        case 2:
          message.btcTransactionIndex = reader.uint32();
          break;
        case 3:
          message.merkleNodes = reader.bytes();
          break;
        case 4:
          message.confirmingBtcHeader = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<BTCSpvProof>): BTCSpvProof {
    const message = createBaseBTCSpvProof();
    message.btcTransaction = object.btcTransaction ?? new Uint8Array();
    message.btcTransactionIndex = object.btcTransactionIndex ?? 0;
    message.merkleNodes = object.merkleNodes ?? new Uint8Array();
    message.confirmingBtcHeader = object.confirmingBtcHeader ?? new Uint8Array();
    return message;
  },
  fromAmino(object: BTCSpvProofAmino): BTCSpvProof {
    const message = createBaseBTCSpvProof();
    if (object.btc_transaction !== undefined && object.btc_transaction !== null) {
      message.btcTransaction = bytesFromBase64(object.btc_transaction);
    }
    if (object.btc_transaction_index !== undefined && object.btc_transaction_index !== null) {
      message.btcTransactionIndex = object.btc_transaction_index;
    }
    if (object.merkle_nodes !== undefined && object.merkle_nodes !== null) {
      message.merkleNodes = bytesFromBase64(object.merkle_nodes);
    }
    if (object.confirming_btc_header !== undefined && object.confirming_btc_header !== null) {
      message.confirmingBtcHeader = bytesFromBase64(object.confirming_btc_header);
    }
    return message;
  },
  toAmino(message: BTCSpvProof): BTCSpvProofAmino {
    const obj: any = {};
    obj.btc_transaction = message.btcTransaction ? base64FromBytes(message.btcTransaction) : undefined;
    obj.btc_transaction_index = message.btcTransactionIndex === 0 ? undefined : message.btcTransactionIndex;
    obj.merkle_nodes = message.merkleNodes ? base64FromBytes(message.merkleNodes) : undefined;
    obj.confirming_btc_header = message.confirmingBtcHeader ? base64FromBytes(message.confirmingBtcHeader) : undefined;
    return obj;
  },
  fromAminoMsg(object: BTCSpvProofAminoMsg): BTCSpvProof {
    return BTCSpvProof.fromAmino(object.value);
  },
  fromProtoMsg(message: BTCSpvProofProtoMsg): BTCSpvProof {
    return BTCSpvProof.decode(message.value);
  },
  toProto(message: BTCSpvProof): Uint8Array {
    return BTCSpvProof.encode(message).finish();
  },
  toProtoMsg(message: BTCSpvProof): BTCSpvProofProtoMsg {
    return {
      typeUrl: '/babylon.btccheckpoint.v1.BTCSpvProof',
      value: BTCSpvProof.encode(message).finish(),
    };
  },
};
function createBaseTransactionKey(): TransactionKey {
  return {
    index: 0,
    hash: new Uint8Array(),
  };
}
export const TransactionKey = {
  typeUrl: '/babylon.btccheckpoint.v1.TransactionKey',
  encode(message: TransactionKey, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.index !== 0) {
      writer.uint32(8).uint32(message.index);
    }
    if (message.hash.length !== 0) {
      writer.uint32(18).bytes(message.hash);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): TransactionKey {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTransactionKey();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.index = reader.uint32();
          break;
        case 2:
          message.hash = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<TransactionKey>): TransactionKey {
    const message = createBaseTransactionKey();
    message.index = object.index ?? 0;
    message.hash = object.hash ?? new Uint8Array();
    return message;
  },
  fromAmino(object: TransactionKeyAmino): TransactionKey {
    const message = createBaseTransactionKey();
    if (object.index !== undefined && object.index !== null) {
      message.index = object.index;
    }
    if (object.hash !== undefined && object.hash !== null) {
      message.hash = bytesFromBase64(object.hash);
    }
    return message;
  },
  toAmino(message: TransactionKey): TransactionKeyAmino {
    const obj: any = {};
    obj.index = message.index === 0 ? undefined : message.index;
    obj.hash = message.hash ? base64FromBytes(message.hash) : undefined;
    return obj;
  },
  fromAminoMsg(object: TransactionKeyAminoMsg): TransactionKey {
    return TransactionKey.fromAmino(object.value);
  },
  fromProtoMsg(message: TransactionKeyProtoMsg): TransactionKey {
    return TransactionKey.decode(message.value);
  },
  toProto(message: TransactionKey): Uint8Array {
    return TransactionKey.encode(message).finish();
  },
  toProtoMsg(message: TransactionKey): TransactionKeyProtoMsg {
    return {
      typeUrl: '/babylon.btccheckpoint.v1.TransactionKey',
      value: TransactionKey.encode(message).finish(),
    };
  },
};
function createBaseSubmissionKey(): SubmissionKey {
  return {
    key: [],
  };
}
export const SubmissionKey = {
  typeUrl: '/babylon.btccheckpoint.v1.SubmissionKey',
  encode(message: SubmissionKey, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.key) {
      TransactionKey.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): SubmissionKey {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSubmissionKey();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key.push(TransactionKey.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<SubmissionKey>): SubmissionKey {
    const message = createBaseSubmissionKey();
    message.key = object.key?.map((e) => TransactionKey.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: SubmissionKeyAmino): SubmissionKey {
    const message = createBaseSubmissionKey();
    message.key = object.key?.map((e) => TransactionKey.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: SubmissionKey): SubmissionKeyAmino {
    const obj: any = {};
    if (message.key) {
      obj.key = message.key.map((e) => (e ? TransactionKey.toAmino(e) : undefined));
    } else {
      obj.key = message.key;
    }
    return obj;
  },
  fromAminoMsg(object: SubmissionKeyAminoMsg): SubmissionKey {
    return SubmissionKey.fromAmino(object.value);
  },
  fromProtoMsg(message: SubmissionKeyProtoMsg): SubmissionKey {
    return SubmissionKey.decode(message.value);
  },
  toProto(message: SubmissionKey): Uint8Array {
    return SubmissionKey.encode(message).finish();
  },
  toProtoMsg(message: SubmissionKey): SubmissionKeyProtoMsg {
    return {
      typeUrl: '/babylon.btccheckpoint.v1.SubmissionKey',
      value: SubmissionKey.encode(message).finish(),
    };
  },
};
function createBaseTransactionInfo(): TransactionInfo {
  return {
    key: undefined,
    transaction: new Uint8Array(),
    proof: new Uint8Array(),
  };
}
export const TransactionInfo = {
  typeUrl: '/babylon.btccheckpoint.v1.TransactionInfo',
  encode(message: TransactionInfo, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.key !== undefined) {
      TransactionKey.encode(message.key, writer.uint32(10).fork()).ldelim();
    }
    if (message.transaction.length !== 0) {
      writer.uint32(18).bytes(message.transaction);
    }
    if (message.proof.length !== 0) {
      writer.uint32(26).bytes(message.proof);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): TransactionInfo {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTransactionInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = TransactionKey.decode(reader, reader.uint32());
          break;
        case 2:
          message.transaction = reader.bytes();
          break;
        case 3:
          message.proof = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<TransactionInfo>): TransactionInfo {
    const message = createBaseTransactionInfo();
    message.key = object.key !== undefined && object.key !== null ? TransactionKey.fromPartial(object.key) : undefined;
    message.transaction = object.transaction ?? new Uint8Array();
    message.proof = object.proof ?? new Uint8Array();
    return message;
  },
  fromAmino(object: TransactionInfoAmino): TransactionInfo {
    const message = createBaseTransactionInfo();
    if (object.key !== undefined && object.key !== null) {
      message.key = TransactionKey.fromAmino(object.key);
    }
    if (object.transaction !== undefined && object.transaction !== null) {
      message.transaction = bytesFromBase64(object.transaction);
    }
    if (object.proof !== undefined && object.proof !== null) {
      message.proof = bytesFromBase64(object.proof);
    }
    return message;
  },
  toAmino(message: TransactionInfo): TransactionInfoAmino {
    const obj: any = {};
    obj.key = message.key ? TransactionKey.toAmino(message.key) : undefined;
    obj.transaction = message.transaction ? base64FromBytes(message.transaction) : undefined;
    obj.proof = message.proof ? base64FromBytes(message.proof) : undefined;
    return obj;
  },
  fromAminoMsg(object: TransactionInfoAminoMsg): TransactionInfo {
    return TransactionInfo.fromAmino(object.value);
  },
  fromProtoMsg(message: TransactionInfoProtoMsg): TransactionInfo {
    return TransactionInfo.decode(message.value);
  },
  toProto(message: TransactionInfo): Uint8Array {
    return TransactionInfo.encode(message).finish();
  },
  toProtoMsg(message: TransactionInfo): TransactionInfoProtoMsg {
    return {
      typeUrl: '/babylon.btccheckpoint.v1.TransactionInfo',
      value: TransactionInfo.encode(message).finish(),
    };
  },
};
function createBaseSubmissionData(): SubmissionData {
  return {
    vigilanteAddresses: undefined,
    txsInfo: [],
    epoch: BigInt(0),
  };
}
export const SubmissionData = {
  typeUrl: '/babylon.btccheckpoint.v1.SubmissionData',
  encode(message: SubmissionData, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.vigilanteAddresses !== undefined) {
      CheckpointAddresses.encode(message.vigilanteAddresses, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.txsInfo) {
      TransactionInfo.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.epoch !== BigInt(0)) {
      writer.uint32(24).uint64(message.epoch);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): SubmissionData {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSubmissionData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.vigilanteAddresses = CheckpointAddresses.decode(reader, reader.uint32());
          break;
        case 2:
          message.txsInfo.push(TransactionInfo.decode(reader, reader.uint32()));
          break;
        case 3:
          message.epoch = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<SubmissionData>): SubmissionData {
    const message = createBaseSubmissionData();
    message.vigilanteAddresses =
      object.vigilanteAddresses !== undefined && object.vigilanteAddresses !== null
        ? CheckpointAddresses.fromPartial(object.vigilanteAddresses)
        : undefined;
    message.txsInfo = object.txsInfo?.map((e) => TransactionInfo.fromPartial(e)) || [];
    message.epoch = object.epoch !== undefined && object.epoch !== null ? BigInt(object.epoch.toString()) : BigInt(0);
    return message;
  },
  fromAmino(object: SubmissionDataAmino): SubmissionData {
    const message = createBaseSubmissionData();
    if (object.vigilante_addresses !== undefined && object.vigilante_addresses !== null) {
      message.vigilanteAddresses = CheckpointAddresses.fromAmino(object.vigilante_addresses);
    }
    message.txsInfo = object.txs_info?.map((e) => TransactionInfo.fromAmino(e)) || [];
    if (object.epoch !== undefined && object.epoch !== null) {
      message.epoch = BigInt(object.epoch);
    }
    return message;
  },
  toAmino(message: SubmissionData): SubmissionDataAmino {
    const obj: any = {};
    obj.vigilante_addresses = message.vigilanteAddresses
      ? CheckpointAddresses.toAmino(message.vigilanteAddresses)
      : undefined;
    if (message.txsInfo) {
      obj.txs_info = message.txsInfo.map((e) => (e ? TransactionInfo.toAmino(e) : undefined));
    } else {
      obj.txs_info = message.txsInfo;
    }
    obj.epoch = message.epoch !== BigInt(0) ? message.epoch?.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: SubmissionDataAminoMsg): SubmissionData {
    return SubmissionData.fromAmino(object.value);
  },
  fromProtoMsg(message: SubmissionDataProtoMsg): SubmissionData {
    return SubmissionData.decode(message.value);
  },
  toProto(message: SubmissionData): Uint8Array {
    return SubmissionData.encode(message).finish();
  },
  toProtoMsg(message: SubmissionData): SubmissionDataProtoMsg {
    return {
      typeUrl: '/babylon.btccheckpoint.v1.SubmissionData',
      value: SubmissionData.encode(message).finish(),
    };
  },
};
function createBaseEpochData(): EpochData {
  return {
    keys: [],
    status: 0,
  };
}
export const EpochData = {
  typeUrl: '/babylon.btccheckpoint.v1.EpochData',
  encode(message: EpochData, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.keys) {
      SubmissionKey.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.status !== 0) {
      writer.uint32(16).int32(message.status);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): EpochData {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEpochData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.keys.push(SubmissionKey.decode(reader, reader.uint32()));
          break;
        case 2:
          message.status = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<EpochData>): EpochData {
    const message = createBaseEpochData();
    message.keys = object.keys?.map((e) => SubmissionKey.fromPartial(e)) || [];
    message.status = object.status ?? 0;
    return message;
  },
  fromAmino(object: EpochDataAmino): EpochData {
    const message = createBaseEpochData();
    message.keys = object.keys?.map((e) => SubmissionKey.fromAmino(e)) || [];
    if (object.status !== undefined && object.status !== null) {
      message.status = object.status;
    }
    return message;
  },
  toAmino(message: EpochData): EpochDataAmino {
    const obj: any = {};
    if (message.keys) {
      obj.keys = message.keys.map((e) => (e ? SubmissionKey.toAmino(e) : undefined));
    } else {
      obj.keys = message.keys;
    }
    obj.status = message.status === 0 ? undefined : message.status;
    return obj;
  },
  fromAminoMsg(object: EpochDataAminoMsg): EpochData {
    return EpochData.fromAmino(object.value);
  },
  fromProtoMsg(message: EpochDataProtoMsg): EpochData {
    return EpochData.decode(message.value);
  },
  toProto(message: EpochData): Uint8Array {
    return EpochData.encode(message).finish();
  },
  toProtoMsg(message: EpochData): EpochDataProtoMsg {
    return {
      typeUrl: '/babylon.btccheckpoint.v1.EpochData',
      value: EpochData.encode(message).finish(),
    };
  },
};
function createBaseCheckpointAddresses(): CheckpointAddresses {
  return {
    submitter: new Uint8Array(),
    reporter: new Uint8Array(),
  };
}
export const CheckpointAddresses = {
  typeUrl: '/babylon.btccheckpoint.v1.CheckpointAddresses',
  encode(message: CheckpointAddresses, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.submitter.length !== 0) {
      writer.uint32(10).bytes(message.submitter);
    }
    if (message.reporter.length !== 0) {
      writer.uint32(18).bytes(message.reporter);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): CheckpointAddresses {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCheckpointAddresses();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.submitter = reader.bytes();
          break;
        case 2:
          message.reporter = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<CheckpointAddresses>): CheckpointAddresses {
    const message = createBaseCheckpointAddresses();
    message.submitter = object.submitter ?? new Uint8Array();
    message.reporter = object.reporter ?? new Uint8Array();
    return message;
  },
  fromAmino(object: CheckpointAddressesAmino): CheckpointAddresses {
    const message = createBaseCheckpointAddresses();
    if (object.submitter !== undefined && object.submitter !== null) {
      message.submitter = bytesFromBase64(object.submitter);
    }
    if (object.reporter !== undefined && object.reporter !== null) {
      message.reporter = bytesFromBase64(object.reporter);
    }
    return message;
  },
  toAmino(message: CheckpointAddresses): CheckpointAddressesAmino {
    const obj: any = {};
    obj.submitter = message.submitter ? base64FromBytes(message.submitter) : undefined;
    obj.reporter = message.reporter ? base64FromBytes(message.reporter) : undefined;
    return obj;
  },
  fromAminoMsg(object: CheckpointAddressesAminoMsg): CheckpointAddresses {
    return CheckpointAddresses.fromAmino(object.value);
  },
  fromProtoMsg(message: CheckpointAddressesProtoMsg): CheckpointAddresses {
    return CheckpointAddresses.decode(message.value);
  },
  toProto(message: CheckpointAddresses): Uint8Array {
    return CheckpointAddresses.encode(message).finish();
  },
  toProtoMsg(message: CheckpointAddresses): CheckpointAddressesProtoMsg {
    return {
      typeUrl: '/babylon.btccheckpoint.v1.CheckpointAddresses',
      value: CheckpointAddresses.encode(message).finish(),
    };
  },
};
function createBaseBTCCheckpointInfo(): BTCCheckpointInfo {
  return {
    epochNumber: BigInt(0),
    bestSubmissionBtcBlockHeight: BigInt(0),
    bestSubmissionBtcBlockHash: new Uint8Array(),
    bestSubmissionTransactions: [],
    bestSubmissionVigilanteAddressList: [],
  };
}
export const BTCCheckpointInfo = {
  typeUrl: '/babylon.btccheckpoint.v1.BTCCheckpointInfo',
  encode(message: BTCCheckpointInfo, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.epochNumber !== BigInt(0)) {
      writer.uint32(8).uint64(message.epochNumber);
    }
    if (message.bestSubmissionBtcBlockHeight !== BigInt(0)) {
      writer.uint32(16).uint64(message.bestSubmissionBtcBlockHeight);
    }
    if (message.bestSubmissionBtcBlockHash.length !== 0) {
      writer.uint32(26).bytes(message.bestSubmissionBtcBlockHash);
    }
    for (const v of message.bestSubmissionTransactions) {
      TransactionInfo.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    for (const v of message.bestSubmissionVigilanteAddressList) {
      CheckpointAddresses.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): BTCCheckpointInfo {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBTCCheckpointInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epochNumber = reader.uint64();
          break;
        case 2:
          message.bestSubmissionBtcBlockHeight = reader.uint64();
          break;
        case 3:
          message.bestSubmissionBtcBlockHash = reader.bytes();
          break;
        case 4:
          message.bestSubmissionTransactions.push(TransactionInfo.decode(reader, reader.uint32()));
          break;
        case 5:
          message.bestSubmissionVigilanteAddressList.push(CheckpointAddresses.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<BTCCheckpointInfo>): BTCCheckpointInfo {
    const message = createBaseBTCCheckpointInfo();
    message.epochNumber =
      object.epochNumber !== undefined && object.epochNumber !== null
        ? BigInt(object.epochNumber.toString())
        : BigInt(0);
    message.bestSubmissionBtcBlockHeight =
      object.bestSubmissionBtcBlockHeight !== undefined && object.bestSubmissionBtcBlockHeight !== null
        ? BigInt(object.bestSubmissionBtcBlockHeight.toString())
        : BigInt(0);
    message.bestSubmissionBtcBlockHash = object.bestSubmissionBtcBlockHash ?? new Uint8Array();
    message.bestSubmissionTransactions =
      object.bestSubmissionTransactions?.map((e) => TransactionInfo.fromPartial(e)) || [];
    message.bestSubmissionVigilanteAddressList =
      object.bestSubmissionVigilanteAddressList?.map((e) => CheckpointAddresses.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: BTCCheckpointInfoAmino): BTCCheckpointInfo {
    const message = createBaseBTCCheckpointInfo();
    if (object.epoch_number !== undefined && object.epoch_number !== null) {
      message.epochNumber = BigInt(object.epoch_number);
    }
    if (object.best_submission_btc_block_height !== undefined && object.best_submission_btc_block_height !== null) {
      message.bestSubmissionBtcBlockHeight = BigInt(object.best_submission_btc_block_height);
    }
    if (object.best_submission_btc_block_hash !== undefined && object.best_submission_btc_block_hash !== null) {
      message.bestSubmissionBtcBlockHash = bytesFromBase64(object.best_submission_btc_block_hash);
    }
    message.bestSubmissionTransactions =
      object.best_submission_transactions?.map((e) => TransactionInfo.fromAmino(e)) || [];
    message.bestSubmissionVigilanteAddressList =
      object.best_submission_vigilante_address_list?.map((e) => CheckpointAddresses.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: BTCCheckpointInfo): BTCCheckpointInfoAmino {
    const obj: any = {};
    obj.epoch_number = message.epochNumber !== BigInt(0) ? message.epochNumber?.toString() : undefined;
    obj.best_submission_btc_block_height =
      message.bestSubmissionBtcBlockHeight !== BigInt(0) ? message.bestSubmissionBtcBlockHeight?.toString() : undefined;
    obj.best_submission_btc_block_hash = message.bestSubmissionBtcBlockHash
      ? base64FromBytes(message.bestSubmissionBtcBlockHash)
      : undefined;
    if (message.bestSubmissionTransactions) {
      obj.best_submission_transactions = message.bestSubmissionTransactions.map((e) =>
        e ? TransactionInfo.toAmino(e) : undefined,
      );
    } else {
      obj.best_submission_transactions = message.bestSubmissionTransactions;
    }
    if (message.bestSubmissionVigilanteAddressList) {
      obj.best_submission_vigilante_address_list = message.bestSubmissionVigilanteAddressList.map((e) =>
        e ? CheckpointAddresses.toAmino(e) : undefined,
      );
    } else {
      obj.best_submission_vigilante_address_list = message.bestSubmissionVigilanteAddressList;
    }
    return obj;
  },
  fromAminoMsg(object: BTCCheckpointInfoAminoMsg): BTCCheckpointInfo {
    return BTCCheckpointInfo.fromAmino(object.value);
  },
  fromProtoMsg(message: BTCCheckpointInfoProtoMsg): BTCCheckpointInfo {
    return BTCCheckpointInfo.decode(message.value);
  },
  toProto(message: BTCCheckpointInfo): Uint8Array {
    return BTCCheckpointInfo.encode(message).finish();
  },
  toProtoMsg(message: BTCCheckpointInfo): BTCCheckpointInfoProtoMsg {
    return {
      typeUrl: '/babylon.btccheckpoint.v1.BTCCheckpointInfo',
      value: BTCCheckpointInfo.encode(message).finish(),
    };
  },
};
