import { compressSignature, NETWORK, TEST_NETWORK, Transaction } from '@leapwallet/leap-keychain';
import { BtcWallet } from '@leapwallet/leap-keychain/dist/browser/key/btc-wallet';
import { sha256 } from '@noble/hashes/sha256';
import { hex } from '@scure/base';
import { Address, OutScript, p2wpkh, Script } from '@scure/btc-signer';
import axios from 'axios';
import { encode } from 'varuint-bitcoin';

import { getAppType } from '../globals';
import { sleep } from '../utils';
import { magicHash } from './btc/get-magic-hash';

export type NetworkType = 'mainnet' | 'testnet';
type AddressType = 'p2wpkh' | 'p2pkh';
type FeePriority = 'high' | 'medium' | 'low';

interface RecommendedFees {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
}

interface UTXO {
  txid: string;
  vout: number;
  value: number;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
}

interface Transactionparams {
  sourceAddress: string;
  pubkey: Uint8Array;
  addressType: AddressType;
  destinationAddress: string;
  amount: number;
  feeRate: number;
}

export interface TransactionInfo {
  txid: string;
  version: number;
  locktime: number;
  vin: Vin[];
  vout: Vout[];
  size: number;
  weight: number;
  fee: number;
  status: BtcTxStatus;
}

export interface Vin {
  txid: string;
  vout: number;
  prevout: Prevout;
  scriptsig: string;
  scriptsig_asm: string;
  witness: string[];
  is_coinbase: boolean;
  sequence: number;
}

export interface Prevout {
  scriptpubkey: string;
  scriptpubkey_asm: string;
  scriptpubkey_type: string;
  scriptpubkey_address: string;
  value: number;
}

export interface Vout {
  scriptpubkey: string;
  scriptpubkey_asm: string;
  scriptpubkey_type: string;
  scriptpubkey_address: string;
  value: number;
}

export interface BtcTxStatus {
  confirmed: boolean;
}

export interface PsbtDetails {
  tx: Transaction;
  txAmount: any;
  fee: bigint;
  inputs: any[];
  outputs: any[];
}

export async function fetchUtxos(address: string, rpcUrl: string) {
  const utxos = await axios.get<UTXO[]>(`${rpcUrl}/address/${address}/utxo`);
  return utxos.data;
}

export function estimateVSize(inputCount: number, outputCount: number, addressType: AddressType): number {
  const overhead = 10;
  const outputSize = 31 * outputCount;

  let inputSize: number;
  switch (addressType) {
    case 'p2wpkh': {
      inputSize = inputCount * (107 / 4 + 41);
      break;
    }
    default: {
      throw new Error('Unknown address type: ${addressType}');
    }
  }
  return Math.ceil(overhead + inputSize + outputSize);
}

export class BtcTx {
  private readonly network: typeof NETWORK;
  private readonly rpcUrl: string;
  private readonly signer: BtcWallet;
  private readonly broadcastApi: string = 'https://bitcoin-rpc.publicnode.com';
  private readonly networkType: NetworkType;
  private static mainnetFeesUrl = 'https://mempool.space/api/v1/fees/recommended';
  private static signetFeesUrl = 'https://mempool.space/signet/api/v1/fees/recommended';

  constructor(networkType: NetworkType = 'mainnet', signer: BtcWallet, rpcUrl?: string) {
    this.networkType = networkType;
    this.network = networkType === 'mainnet' ? NETWORK : TEST_NETWORK;
    this.rpcUrl = rpcUrl ?? 'https://blockstream.info/api';
    this.signer = signer;
    this.broadcastApi =
      networkType === 'mainnet'
        ? 'https://api.leapwallet.io/proxy/ankr/btc'
        : 'https://api.leapwallet.io/proxy/ankr/btc_signet';
  }

  static SignBIP322SimpleMessage(message: string, signer: BtcWallet) {
    function bip0322Hash(message: string) {
      const tag = 'BIP0322-signed-message';
      const tagHash = sha256(Buffer.from(tag));
      const result = sha256(Buffer.concat([tagHash, tagHash, Buffer.from(message)]));
      return Buffer.from(result).toString('hex');
    }

    function getSignatureFromPsbtOfBIP322Simple(witness: any[]) {
      function encodeVarString(b: any) {
        return Buffer.concat([encode(b.byteLength), b]);
      }

      const len = encode(witness.length);
      const result = Buffer.concat([len, ...witness.map((w) => encodeVarString(w))]);
      const signature = result.toString('base64');
      return signature;
    }

    try {
      const accounts = signer.getAccounts();
      if (!accounts[0].pubkey) {
        throw new Error('No public key found');
      }

      const pubkey = accounts[0].pubkey;
      const outputScript = p2wpkh(pubkey).script;

      const inputHash = hex.decode('0000000000000000000000000000000000000000000000000000000000000000');
      const inputIndex = 4294967295;
      const txVersion = 0;
      const sequence = 0;
      const scriptSig = Script.encode(['OP_0', hex.decode(bip0322Hash(message))]);

      const txToSpend = new Transaction({
        allowUnknownOutputs: true,
        version: txVersion,
      });

      txToSpend.addOutput({
        amount: BigInt(0),
        script: outputScript,
      });

      txToSpend.addInput({
        txid: inputHash,
        index: inputIndex,
        sequence,
        finalScriptSig: scriptSig,
      });

      const txToSign = new Transaction({
        allowUnknownOutputs: true,
        version: txVersion,
      });

      txToSign.addInput({
        txid: txToSpend.id,
        index: 0,
        sequence,
        witnessUtxo: {
          script: outputScript,
          amount: BigInt(0),
        },
        nonWitnessUtxo: undefined,
      });

      txToSign.addOutput({ script: Script.encode(['RETURN']), amount: BigInt(0) });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      signer.signIdx(accounts[0].address, txToSign, 0);

      txToSign.finalizeIdx(0);
      const signature = getSignatureFromPsbtOfBIP322Simple(txToSign.getInput(0).finalScriptWitness ?? []);

      return signature;
    } catch (_) {
      console.log('error', _);
      throw new Error('Unable to sign bip-332 simple message');
    }
  }

  static GetPsbtHexDetails(psbtHex: string, network: typeof NETWORK): PsbtDetails {
    const tx = Transaction.fromPSBT(hex.decode(psbtHex), { allowUnknownInputs: true });
    const fee = tx.fee;
    const inputs = [];
    const outputs = [];

    let tapScriptInfo = null; // Store tap script info

    for (let index = 0; index < tx.inputsLength; index++) {
      const input = tx.getInput(index);
      const amount = input.witnessUtxo?.amount;
      let address = '';

      if (input.witnessUtxo?.script) {
        const decodedInput = OutScript.decode(input.witnessUtxo?.script);

        if (decodedInput.type === 'tr' || decodedInput.type === 'tr_ms' || decodedInput.type === 'tr_ns') {
          tapScriptInfo = {
            internalKey: input.tapInternalKey,
            merklePath: input.tapMerkleRoot,
            scriptTree: input.tapLeafScript,
            controlBlock: input.tapScriptSig,
          };
        }

        if (decodedInput.type === 'tr') {
          address = Address(network).encode({ type: 'tr', pubkey: decodedInput.pubkey });
        } else if (decodedInput.type === 'wpkh') {
          address = Address(network).encode({ type: 'wpkh', hash: decodedInput.hash });
        } else {
          //@ts-expect-error type is not definedj
          address = Address(network).encode({ type: decodedInput.type, hash: decodedInput.hash });
        }
      }
      inputs.push({
        address,
        amount,
        tapScriptInfo,
      });
    }

    for (let index = 0; index < tx.outputsLength; index++) {
      const output = tx.getOutput(index);
      const amount = output.amount;
      let address = '';

      if (output.script) {
        const decodedOutput = OutScript.decode(output.script);

        if (decodedOutput.type === 'tr') {
          address = Address(network).encode({ type: 'tr', pubkey: decodedOutput.pubkey });
        } else if (decodedOutput.type === 'tr_ns') {
          address = Address(network).encode({ type: 'tr_ns', pubkeys: decodedOutput.pubkeys });
        } else if (decodedOutput.type === 'tr_ms') {
          address = Address(network).encode({ type: 'tr_ms', pubkeys: decodedOutput.pubkeys, m: decodedOutput.m });
        } else if (decodedOutput.type === 'wpkh') {
          address = Address(network).encode({ type: 'wpkh', hash: decodedOutput.hash });
        } else if (decodedOutput.type === 'wsh') {
          address = Address(network).encode({ type: 'wsh', hash: decodedOutput.hash });
        } else if (decodedOutput.type === 'sh') {
          address = Address(network).encode({ type: 'sh', hash: decodedOutput.hash });
        } else if (decodedOutput.type === 'pkh') {
          address = Address(network).encode({ type: 'pkh', hash: decodedOutput.hash });
        } else if (decodedOutput.type === 'pk') {
          address = Address(network).encode({ type: 'pk', pubkey: decodedOutput.pubkey });
        } else if (decodedOutput.type === 'ms') {
          address = Address(network).encode({ type: 'ms', pubkeys: decodedOutput.pubkeys, m: decodedOutput.m });
        }
      }

      outputs.push({
        address,
        amount,
      });
    }

    let txAmount;
    for (const input of inputs) {
      const equivalentOutput = outputs.find((output) => output.address.toLowerCase() === input.address.toLowerCase());
      if (equivalentOutput && input.amount && equivalentOutput.amount) {
        txAmount = input.amount - equivalentOutput.amount;
      }
    }

    return {
      tx,
      txAmount,
      fee,
      inputs,
      outputs,
    };
  }

  private async fetchUtxos(address: string): Promise<UTXO[]> {
    try {
      const response = await axios.get<UTXO[]>(`${this.rpcUrl}/address/${address}/utxo`);
      return response.data;
    } catch (e) {
      throw new Error('Unable to fetch utxos');
    }
  }
  private getOutputScript(addressType: AddressType, pubkey: Uint8Array): Uint8Array {
    switch (addressType) {
      case 'p2wpkh': {
        return p2wpkh(pubkey).script;
      }
      default:
        throw new Error('Invalid address type');
    }
  }

  private async fetchTransactionHex(txid: string): Promise<string> {
    try {
      const response = await axios.get<string>(`${this.rpcUrl}/tx/${txid}/hex`);
      return response.data;
    } catch (e) {
      throw new Error('Unable to fetch transaction hex');
    }
  }

  public async getTransactionDetails(txId: string): Promise<TransactionInfo | string> {
    try {
      const res = await fetch(`${this.rpcUrl}/tx/${txId}`);
      if (res.status === 404) return 'Transaction not found';
      const response = await res.json();
      return response;
    } catch (e) {
      throw new Error('Unable to fetch transaction details');
    }
  }

  public async createTransaction(params: Transactionparams) {
    try {
      const utxos = await this.fetchUtxos(params.sourceAddress);
      if (!utxos.length) {
        throw new Error('No utxos found');
      }
      const tx = new Transaction();
      const inputData = await Promise.all(
        utxos.map(async (utxo) => {
          const txHex = await this.fetchTransactionHex(utxo.txid);
          return {
            txid: utxo.txid,
            index: utxo.vout,
            witnessUtxo: {
              script: this.getOutputScript(params.addressType, params.pubkey),
              amount: BigInt(utxo.value),
            },
            nonWitnessUtxo: txHex ? hex.decode(txHex) : undefined,
          };
        }),
      );

      const totalInput = utxos.reduce((sum, utxo) => sum + utxo.value, 0);

      inputData.forEach((input) => {
        tx.addInput(input);
      });

      tx.addOutputAddress(params.destinationAddress, BigInt(params.amount), this.network);

      const estimatedVSize = estimateVSize(utxos.length, 2, params.addressType);
      const fee = estimatedVSize * params.feeRate + 1;
      const change = totalInput - params.amount - fee;
      if (change < 0) {
        throw new Error('Insufficient funds for transaction');
      }

      if (change >= 546) {
        tx.addOutputAddress(params.sourceAddress, BigInt(change), this.network);
      }

      inputData.forEach((_, index) => {
        this.signInput(params.sourceAddress, tx, index, params.addressType);
      });

      for (let i = 0; i < utxos.length; i++) {
        tx.finalizeIdx(i);
      }

      const signedTxHex = hex.encode(tx.extract());
      return {
        txHex: signedTxHex,
        txId: tx.id,
        fee: fee,
        vsize: tx.vsize,
      };
    } catch (e) {
      throw new Error('Unable to create transaction');
    }
  }

  async pollForTx(txId: string, limit = 20, pollCount = 0) {
    const timedOut = pollCount >= limit;
    const timeoutMs = 2_000 * limit;
    if (timedOut) {
      throw new Error(
        `Transaction with ID ${txId} was submitted but was not yet found on the chain. You might want to check later. There was a wait of ${
          timeoutMs / 1000
        } seconds. TxId: ${txId}`,
      );
    }
    await sleep(2_000);
    const result = await this.getTransactionDetails(txId);
    if (result === 'Transaction not found') {
      this.pollForTx(txId, limit, pollCount + 1);
    }
    return result;
  }

  public static async SignECDSA(message: string, signer: BtcWallet) {
    const accounts = signer.getAccounts();
    const address = accounts[0].address;
    const hash = magicHash(message);
    const { signature, recoveryParam } = await signer.signECDSA(address, hash);
    return compressSignature(recoveryParam, signature);
  }

  private signInput(address: string, tx: Transaction, inputIndex: number, addressType: AddressType) {
    switch (addressType) {
      case 'p2wpkh':
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.signer.signIdx(address, tx, inputIndex);
        break;
      default:
        throw new Error('Unknown address type');
    }
  }

  estimateTransactionSize({
    inputCount,
    outputCount,
    type,
  }: {
    inputCount: number;
    outputCount: number;
    type: string;
  }) {
    const overheadVbytes = 10;
    const outputVbytes = 31 * outputCount;

    let inputVbytes = 0;
    if (type === 'p2wpkh') {
      inputVbytes = inputCount * (107 / 4 + 41);
    } else {
      inputVbytes = inputCount * 148;
    }

    return Math.ceil(overheadVbytes + inputVbytes + outputVbytes);
  }

  public static async GetFeeRates(network: NetworkType) {
    const feesUrl = network === 'mainnet' ? BtcTx.mainnetFeesUrl : BtcTx.signetFeesUrl;
    const response = await axios.get<RecommendedFees>(feesUrl);
    const feeRates: Record<FeePriority, number> = {
      low: response.data.hourFee,
      medium: response.data.halfHourFee,
      high: response.data.fastestFee,
    };
    return feeRates;
  }

  public async getCurrentFeeRate(priority: FeePriority = 'low') {
    try {
      const feeRates = await BtcTx.GetFeeRates(this.networkType);
      return feeRates[priority] || feeRates.medium;
    } catch (e) {
      throw new Error('Unable to fetch fee rate');
    }
  }

  public async testMempoolAccept(txHex: string) {
    // broadcast transaction
    const testTx = await fetch(this.broadcastApi ?? '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-requested-with': 'leap-client',
        'x-app-type': `leap-${getAppType()}`,
      },
      body: JSON.stringify({
        id: 'test',
        method: 'testmempoolaccept',
        params: [[txHex]],
      }),
    });

    const testData = await testTx.json();
    return testData;
  }

  public async broadcastTx(txHex: string) {
    const testData = await this.testMempoolAccept(txHex);
    if (!testData.result[0].allowed) throw new Error(testData.result[0]['reject-reason']);
    const res = await fetch(this.broadcastApi ?? '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-requested-with': 'leap-client',
        'x-app-type': `leap-${getAppType()}`,
      },
      body: JSON.stringify({
        id: 'test',
        method: 'sendrawtransaction',
        params: [txHex],
      }),
    });
    const response = await res.json();
    return response;
  }
}
