import { Provider, TransactionRequest } from '@ethersproject/providers';
import EthereumApp from '@ledgerhq/hw-app-eth';
import { SeiApp } from '@zondax/ledger-sei';
import { BigNumber, Signer, utils } from 'ethers';

import { getEthereumAddress } from '../utils';

export abstract class EthSigner {
  abstract getAccounts(): any;
}

export class LedgerSignerEthers extends Signer {
  constructor(
    private readonly signer: EthSigner,
    private eth: EthereumApp | SeiApp,
    public path: string,
    public provider?: Provider,
  ) {
    super();
  }

  async getAddress() {
    const accounts = await this.signer.getAccounts();
    return getEthereumAddress(accounts[0].address);
  }

  async signMessage(message: utils.Bytes | string) {
    if (typeof message === 'string') {
      message = utils.toUtf8Bytes(message);
    }

    const messageHex = utils.hexlify(message).substring(2);

    const sig = await this.eth.signPersonalMessage(this.path, messageHex);

    sig.r = '0x' + sig.r;
    sig.s = '0x' + sig.s;
    return utils.joinSignature(sig);
  }

  async signTransaction(transaction: TransactionRequest): Promise<string> {
    const tx = await utils.resolveProperties(transaction);
    const baseTx: utils.UnsignedTransaction = {
      chainId: tx.chainId || undefined,
      data: tx.data || undefined,
      gasLimit: tx.gasLimit || undefined,
      gasPrice: tx.maxPriorityFeePerGas || undefined,
      nonce: tx.nonce ? BigNumber.from(tx.nonce).toNumber() : undefined,
      to: tx.to || undefined,
      value: tx.value || undefined,
    };
    const unsignedTx = utils.serializeTransaction(baseTx).substring(2);
    const resolution = {
      domains: [],
      plugin: [],
      externalPlugin: [],
      nfts: [],
      erc20Tokens: [],
    };

    let signature;

    if (this.eth instanceof SeiApp) {
      signature = await this.eth.signEVM(this.path, unsignedTx, resolution);
    } else {
      signature = await this.eth.signTransaction(this.path, unsignedTx, resolution);
    }
    return utils.serializeTransaction(baseTx, {
      v: BigNumber.from('0x' + signature.v).toNumber(),
      r: '0x' + signature.r,
      s: '0x' + signature.s,
    });
  }

  connect(provider: Provider): Signer {
    return new LedgerSignerEthers(this.signer, this.eth, this.path, provider);
  }
}
