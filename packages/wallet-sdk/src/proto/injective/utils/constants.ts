import BigNumber from 'bignumber.js';
export const BECH32_ADDR_ACC_PREFIX = 'inj';
export const BECH32_ADDR_CONS_PREFIX = 'injvalcons';
export const BECH32_ADDR_VAL_PREFIX = 'injvaloper';
export const DEFAULT_DERIVATION_PATH = "m/44'/60'/0'/0/0";
export const DEFAULT_BLOCK_TIMEOUT_HEIGHT = 90;
export const DEFAULT_BLOCK_TIME_IN_SECONDS = 2;
export const DEFAULT_TX_BLOCK_INCLUSION_TIMEOUT_IN_MS =
  DEFAULT_BLOCK_TIMEOUT_HEIGHT * DEFAULT_BLOCK_TIME_IN_SECONDS * 1000;
export const DEFAULT_GAS_LIMIT = 400000;
export const DEFAULT_GAS_PRICE = 160000000;

export const BECH32_PUBKEY_ACC_PREFIX = 'injpub';
export const BECH32_PUBKEY_VAL_PREFIX = 'injvaloperpub';
export const BECH32_PUBKEY_CONS_PREFIX = 'injvalconspub';

export const DEFAULT_STD_FEE = {
  amount: [
    {
      amount: new BigNumber(DEFAULT_GAS_LIMIT).times(DEFAULT_GAS_PRICE).toString(),
      denom: 'inj',
    },
  ],
  gas: DEFAULT_GAS_LIMIT.toString(),
  payer: '',
  granter: '',
  feePayer: '',
};
