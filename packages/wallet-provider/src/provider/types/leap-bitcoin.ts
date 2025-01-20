// supported networks
export enum Network {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
  SIGNET = 'signet',
}

export interface ILeapBitcoin {
  getAccounts: () => Promise<string[]>;
  getNetwork: () => Promise<Network>;
  getPublicKey: () => Promise<string>;
  off: (eventName: string, callBack: () => void) => void;
  on: (eventName: string, callBack: () => void) => void;
  requestAccounts: () => Promise<string[]>;
  sendBitcoin: (to: string, amount: number) => Promise<string>;
  signMessage: (message: string, type?: 'ecdsa' | 'bip322-simple') => Promise<string>;
  signPsbt: (psbtHex: string) => Promise<string>;
  signPsbts: (psbtsHexes: string[]) => Promise<string[]>;
  switchNetwork: (network: Network) => Promise<void>;
}
