import { ChainInfos } from '../src/constants/chain-infos';
import { generatePrivateKeyFromHdPath, generateWalletFromMnemonic, generateWalletFromPrivateKey } from '../src/key/key';
import CONSTANTS from './constants';

const { ADDRESSES, PRIVATE_KEY, PRIVATE_KEY_ADDRESS, MNEMONIC12 } = CONSTANTS;

describe('Key', () => {
  test('should generate correct wallet address', async () => {
    const mnemonic = 'humble patch void reunion inside size sun crack grab key arrest wolf';
    const chainsData = Object.entries(ChainInfos);

    for (const [chainName, chainInfo] of chainsData) {
      const account = '0';
      const chain = '0';
      const hdPath = `m/44'/${chainInfo.bip44.coinType}'/${account}'/${chain}/0`;
      const wallet = await generateWalletFromMnemonic(mnemonic, hdPath, chainInfo.addressPrefix);
      const [firstAccount] = await wallet.getAccounts();
      expect(firstAccount.address).toBeTruthy();

      expect(firstAccount.address).toEqual(ADDRESSES[chainName]);
    }
  });

  test('should recover wallet from private key and password', async () => {
    const wallet = await generateWalletFromPrivateKey(PRIVATE_KEY);

    const [firstAccount] = await wallet.getAccounts();
    expect(firstAccount.address).toEqual(PRIVATE_KEY_ADDRESS);
  });

  test('should generate privKey and recover wallet from it', async () => {
    const chainsData = Object.entries(ChainInfos);

    for (const [chainName, chainInfo] of chainsData) {
      const account = '0';
      const chain = '0';
      const hdPath = `m/44'/${chainInfo.bip44.coinType}'/${account}'/${chain}/0`;

      const privKey = await generatePrivateKeyFromHdPath(MNEMONIC12, hdPath);

      const wallet = await generateWalletFromPrivateKey(privKey, chainInfo.addressPrefix);

      const [firstAccount] = await wallet.getAccounts();
      expect(firstAccount.address).toEqual(ADDRESSES[chainName]);
    }
  });
});
