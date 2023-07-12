import { SigningSscrt, Sscrt, SscrtWallet } from '../src/secret/sscrt';

const mainnetGrpc = 'https://secret-4.api.trivium.network:9091';
const addr = 'secret1kg950qfdyhd3vltp5ega20agmg2ax5g4m9hd6y';
const secondaryAddr = 'secret17fkn6q0y03zfplpvwdtr97x79h0wtecj7tpnzq';

const contractAddress = 'secret12rcvz0umvk875kd6a803txhtlu7y0pnd73kcej';

const mnemonic = '';

describe('secret test', () => {
  test('create viewing key', async () => {
    const wallet = await SscrtWallet.create(mnemonic, { hdAccountIndex: 0 });
    const sscrt = await SigningSscrt.create(mainnetGrpc, 'secret-4', wallet);

    const { txStatus, viewingKey } = await sscrt.createViewingKey(addr, contractAddress, {
      secret: { low: 0.15, average: 0.25, high: 0.3 },
    });
    console.log(txStatus);
    expect(txStatus.code === 0).toBe(true);
    expect(viewingKey).not.toBe('');
  }, 30000);

  // test('get balance', async () => {
  //   const sscrt = await Sscrt.create(mainnetGrpc, 'secret-4', addr);
  //   const balance = await sscrt.getBalance(
  //     addr,
  //     contractAddress,
  //     'f11b8b2807fba27c0c0196ce1c2ece6d7824ce08bc0ea018b6e823f5224f5026',
  //   );
  //   expect(balance).not.toBe('');
  // });
  //
  // test('transfer', async () => {
  //   const wallet = await SscrtWallet.create(mnemonic, { hdAccountIndex: 0 });
  //   const sscrt = await SigningSscrt.create(mainnetGrpc, 'secret-4', wallet);
  //   const { tx } = await sscrt.transfer(addr, contractAddress, { transfer: { recipient: secondaryAddr, amount: '1' } });
  //   expect(tx).toBeDefined();
  // });
  //
  // test('dry run', () => {
  //   expect(true).toBe(true);
  // });
});
