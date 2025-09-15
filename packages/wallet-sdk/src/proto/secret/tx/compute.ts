import { toBase64 } from '@cosmjs/encoding';
import { bech32 } from 'bech32';

interface EncryptionUtils {
  getPubkey: () => Promise<Uint8Array>;
  decrypt: (ciphertext: Uint8Array, nonce: Uint8Array) => Promise<Uint8Array>;
  encrypt: (contractCodeHash: string, msg: object) => Promise<Uint8Array>;
  getTxEncryptionKey: (nonce: Uint8Array) => Promise<Uint8Array>;
}

function addressToBytes(address: string): Uint8Array {
  if (address === '') {
    return new Uint8Array(0);
  }
  return Uint8Array.from(bech32.fromWords(bech32.decode(address).words));
}

export interface ProtoMsg {
  type_url: string;
  // value is used in x/compute
  value: any;
  encode(): Promise<Uint8Array>;
}

export type AminoMsg = {
  type: string;
  value: any;
};

export type Coin = {
  denom: string;
  amount: string;
};

export interface Msg {
  toProto(utils: EncryptionUtils): Promise<ProtoMsg>;
  toAmino(utils: EncryptionUtils): Promise<AminoMsg>;
}

export interface MsgInstantiateContractParams {
  /** The actor that signed the messages */
  sender: string;
  /** The id of the contract's WASM code */
  code_id: number | string;
  /** A unique label across all contracts */
  label: string;
  /** The input message to the contract's constructor */
  init_msg: any;
  /** Funds to send to the contract */
  init_funds?: Coin[];
  /** The SHA256 hash value of the contract's WASM bytecode, represented as case-insensitive 64
   * character hex string.
   * This is used to make sure only the contract that's being invoked can decrypt the query data.
   *
   * codeHash is an optional parameter but using it will result in way faster execution time (otherwise secret.js will make an query to get the code_hash from the chain).
   *
   * Valid examples:
   * - "af74387e276be8874f07bec3a87023ee49b0e7ebe08178c49d0a49c3c98ed60e"
   * - "0xaf74387e276be8874f07bec3a87023ee49b0e7ebe08178c49d0a49c3c98ed60e"
   * - "AF74387E276BE8874F07BEC3A87023EE49B0E7EBE08178C49D0A49C3C98ED60E"
   * - "0xAF74387E276BE8874F07BEC3A87023EE49B0E7EBE08178C49D0A49C3C98ED60E"
   */
  code_hash?: string;
  /** Admin is an optional address that can execute migrations */
  admin?: string;
}

export function getMissingCodeHashWarning(method: string): string {
  return `${new Date().toISOString()} WARNING: ${method} was used without the "code_hash" parameter. This is discouraged and will result in much slower execution times for your app.`;
}

/** Instantiate a contract from code id */
export class MsgInstantiateContract implements Msg {
  public sender: string;
  public codeId: string;
  public label: string;
  public initMsg: object;
  private initMsgEncrypted: Uint8Array | null;
  public initFunds: Coin[];
  public codeHash: string;
  private warnCodeHash: boolean = false;
  public admin: string;

  constructor({ sender, code_id, label, init_msg, init_funds, code_hash, admin }: MsgInstantiateContractParams) {
    this.sender = sender;
    this.codeId = String(code_id);
    this.label = label;
    this.initMsg = init_msg;
    this.initMsgEncrypted = null;
    this.initFunds = init_funds ?? [];
    this.admin = admin ?? '';

    if (code_hash) {
      this.codeHash = code_hash.replace(/^0x/, '').toLowerCase();
    } else {
      // codeHash will be set in SecretNetworkClient before invoking toProto() & toAimno()
      this.codeHash = '';
      this.warnCodeHash = true;
      console.warn(getMissingCodeHashWarning('MsgInstantiateContract'));
    }
  }

  async toProto(utils: EncryptionUtils): Promise<ProtoMsg> {
    if (this.warnCodeHash) {
      console.warn(getMissingCodeHashWarning('MsgInstantiateContract'));
    }

    if (!this.initMsgEncrypted) {
      // The encryption uses a random nonce
      // toProto() & toAmino() are called multiple times during signing
      // so to keep the msg consistant across calls we encrypt the msg only once
      this.initMsgEncrypted = await utils.encrypt(this.codeHash, this.initMsg);
    }

    const msgContent = {
      sender: addressToBytes(this.sender),
      code_id: this.codeId,
      label: this.label,
      init_msg: this.initMsgEncrypted,
      init_funds: this.initFunds,
      // callback_sig & callback_code_hash are internal stuff that doesn't matter here
      callback_sig: new Uint8Array(0),
      callback_code_hash: '',
      admin: this.admin,
    };

    return {
      type_url: '/secret.compute.v1beta1.MsgInstantiateContract',
      value: msgContent,
      encode: async () =>
        (await import('../protobuf/secret/compute/v1beta1/msg')).MsgInstantiateContract.encode(msgContent).finish(),
    };
  }

  async toAmino(utils: EncryptionUtils): Promise<AminoMsg> {
    if (this.warnCodeHash) {
      console.warn(getMissingCodeHashWarning('MsgInstantiateContract'));
    }

    if (!this.initMsgEncrypted) {
      // The encryption uses a random nonce
      // toProto() & toAmino() are called multiple times during signing
      // so to keep the msg consistant across calls we encrypt the msg only once
      this.initMsgEncrypted = await utils.encrypt(this.codeHash, this.initMsg);
    }

    return {
      type: 'wasm/MsgInstantiateContract',
      value: {
        sender: this.sender,
        code_id: this.codeId,
        label: this.label,
        init_msg: toBase64(this.initMsgEncrypted),
        init_funds: this.initFunds,
        admin: this.admin.length > 0 ? this.admin : undefined,
      },
    };
  }
}

export interface MsgExecuteContractParams<T> {
  /** The actor that signed the messages */
  sender: string;
  /** The contract's address */
  contract_address: string;
  /** The input message */
  msg: T;
  /** Funds to send to the contract */
  sent_funds?: Coin[];
  /** The SHA256 hash value of the contract's WASM bytecode, represented as case-insensitive 64
   * character hex string.
   * This is used to make sure only the contract that's being invoked can decrypt the query data.
   *
   * codeHash is an optional parameter but using it will result in way faster execution time (otherwise secret.js will make an query to get the code_hash from the chain).
   *
   * Valid examples:
   * - "af74387e276be8874f07bec3a87023ee49b0e7ebe08178c49d0a49c3c98ed60e"
   * - "0xaf74387e276be8874f07bec3a87023ee49b0e7ebe08178c49d0a49c3c98ed60e"
   * - "AF74387E276BE8874F07BEC3A87023EE49B0E7EBE08178C49D0A49C3C98ED60E"
   * - "0xAF74387E276BE8874F07BEC3A87023EE49B0E7EBE08178C49D0A49C3C98ED60E"
   */
  code_hash?: string;
}

/** Execute a function on a contract */
export class MsgExecuteContract<T extends object> implements Msg {
  public sender: string;
  public contractAddress: string;
  public msg: T;
  private msgEncrypted: Uint8Array | null;
  public sentFunds: Coin[];
  public codeHash: string;
  private warnCodeHash: boolean = false;

  constructor({
    sender,
    contract_address: contractAddress,
    msg,
    sent_funds: sentFunds,
    code_hash: codeHash,
  }: MsgExecuteContractParams<T>) {
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.msg = msg;
    this.msgEncrypted = null;
    this.sentFunds = sentFunds ?? [];

    if (codeHash) {
      this.codeHash = codeHash.replace(/^0x/, '').toLowerCase();
    } else {
      // codeHash will be set in SecretNetworkClient before invoking toProto() & toAimno()
      this.codeHash = '';
      this.warnCodeHash = true;
      console.warn(getMissingCodeHashWarning('MsgExecuteContract'));
    }
  }

  async toProto(utils: EncryptionUtils): Promise<ProtoMsg> {
    if (this.warnCodeHash) {
      console.warn(getMissingCodeHashWarning('MsgExecuteContract'));
    }

    if (!this.msgEncrypted) {
      // The encryption uses a random nonce
      // toProto() & toAmino() are called multiple times during signing
      // so to keep the msg consistant across calls we encrypt the msg only once
      this.msgEncrypted = await utils.encrypt(this.codeHash, this.msg);
    }

    const msgContent = {
      sender: addressToBytes(this.sender),
      contract: addressToBytes(this.contractAddress),
      msg: this.msgEncrypted,
      sent_funds: this.sentFunds,
      // callback_sig & callback_code_hash are internal stuff that doesn't matter here
      callback_sig: new Uint8Array(),
      callback_code_hash: '',
    };

    return {
      type_url: '/secret.compute.v1beta1.MsgExecuteContract',
      value: msgContent,
      encode: async () =>
        (await import('../protobuf/secret/compute/v1beta1/msg')).MsgExecuteContract.encode(msgContent).finish(),
    };
  }
  async toAmino(utils: EncryptionUtils): Promise<AminoMsg> {
    if (this.warnCodeHash) {
      console.warn(getMissingCodeHashWarning('MsgExecuteContract'));
    }

    if (!this.msgEncrypted) {
      // The encryption uses a random nonce
      // toProto() & toAmino() are called multiple times during signing
      // so to keep the msg consistant across calls we encrypt the msg only once
      this.msgEncrypted = await utils.encrypt(this.codeHash, this.msg);
    }

    return {
      type: 'wasm/MsgExecuteContract',
      value: {
        sender: this.sender,
        contract: this.contractAddress,
        msg: toBase64(this.msgEncrypted),
        sent_funds: this.sentFunds,
      },
    };
  }
}

export interface MsgMigrateContractParams<T> {
  /** The actor that signed the messages (should be the current admin) */
  sender: string;
  /** The contract's address */
  contract_address: string;
  /** The new code id */
  code_id: number | string;
  /** The input message */
  msg: T;
  /** The SHA256 hash value of the contract's *new* WASM bytecode, represented as case-insensitive 64 character hex string.
   * This is used to make sure only the contract that's being invoked can decrypt the query data.
   *
   * codeHash is an optional parameter but using it will result in way faster execution time (otherwise secret.js will make an query to get the code_hash from the chain).
   *
   * Valid examples:
   * - "af74387e276be8874f07bec3a87023ee49b0e7ebe08178c49d0a49c3c98ed60e"
   * - "0xaf74387e276be8874f07bec3a87023ee49b0e7ebe08178c49d0a49c3c98ed60e"
   * - "AF74387E276BE8874F07BEC3A87023EE49B0E7EBE08178C49D0A49C3C98ED60E"
   * - "0xAF74387E276BE8874F07BEC3A87023EE49B0E7EBE08178C49D0A49C3C98ED60E"
   */
  code_hash?: string;
}

/** Execute a function on a contract */
export class MsgMigrateContract<T extends object> implements Msg {
  public sender: string;
  public contractAddress: string;
  public msg: T;
  private msgEncrypted: Uint8Array | null;
  public codeId: string;
  public codeHash: string;
  private warnCodeHash: boolean = false;

  constructor({
    sender,
    contract_address: contractAddress,
    msg,
    code_id: codeId,
    code_hash: codeHash,
  }: MsgMigrateContractParams<T>) {
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.msg = msg;
    this.msgEncrypted = null;
    this.codeId = String(codeId);

    if (codeHash) {
      this.codeHash = codeHash.replace(/^0x/, '').toLowerCase();
    } else {
      // codeHash will be set in SecretNetworkClient before invoking toProto() & toAimno()
      this.codeHash = '';
      this.warnCodeHash = true;
      console.warn(getMissingCodeHashWarning('MsgMigrateContract'));
    }
  }

  async toProto(utils: EncryptionUtils): Promise<ProtoMsg> {
    if (this.warnCodeHash) {
      console.warn(getMissingCodeHashWarning('MsgMigrateContract'));
    }

    if (!this.msgEncrypted) {
      // The encryption uses a random nonce
      // toProto() & toAmino() are called multiple times during signing
      // so to keep the msg consistant across calls we encrypt the msg only once
      this.msgEncrypted = await utils.encrypt(this.codeHash, this.msg);
    }

    const msgContent = {
      sender: this.sender,
      contract: this.contractAddress,
      msg: this.msgEncrypted,
      code_id: this.codeId,
      // callback_sig & callback_code_hash are internal stuff that doesn't matter here
      callback_sig: new Uint8Array(),
      callback_code_hash: '',
    };

    return {
      type_url: '/secret.compute.v1beta1.MsgMigrateContract',
      value: msgContent,
      encode: async () =>
        (await import('../protobuf/secret/compute/v1beta1/msg')).MsgMigrateContract.encode(msgContent).finish(),
    };
  }
  async toAmino(utils: EncryptionUtils): Promise<AminoMsg> {
    if (this.warnCodeHash) {
      console.warn(getMissingCodeHashWarning('MsgMigrateContract'));
    }

    if (!this.msgEncrypted) {
      // The encryption uses a random nonce
      // toProto() & toAmino() are called multiple times during signing
      // so to keep the msg consistant across calls we encrypt the msg only once
      this.msgEncrypted = await utils.encrypt(this.codeHash, this.msg);
    }

    return {
      type: 'wasm/MsgMigrateContract',
      value: {
        sender: this.sender,
        contract: this.contractAddress,
        msg: toBase64(this.msgEncrypted),
        code_id: this.codeId,
      },
    };
  }
}
