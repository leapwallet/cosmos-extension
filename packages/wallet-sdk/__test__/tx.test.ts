import { calculateFee, coin, coins, GasPrice, isDeliverTxFailure, isDeliverTxSuccess } from '@cosmjs/stargate';

import { ChainInfos } from '../src/constants';
import QueryClient from '../src/stake/queryClient';
import { Tx } from '../src/tx/tx';
import constants from './constants';
import { getWallet } from './testutils';

const { RPC_ENDPOINT_TEST, ADDRESSES, ADDRESSESALT } = constants;

describe('Tx', () => {
  async function getTx(name?: string) {
    const wallet = await getWallet(name ?? 'juno');
    const tx = new Tx(name == 'cosmos' ? RPC_ENDPOINT_TEST.cosmoshub : RPC_ENDPOINT_TEST.juno, wallet);
    await tx.initClient();
    return tx;
  }

  // test('Should Simulate delegate', async () => {
  //   const wallet = await getWallet(
  //     'cosmos',
  //     'tank hello shadow defy demise neglect lava utility collect voice sure rescue valley moral illegal tenant buzz recall nation treat submit ball blue vital',
  //   );
  //   const tx = new Tx(RPC_ENDPOINT_TEST.cosmoshub, wallet);
  //   await tx.initClient();
  //   const amount = coins('1', 'uatom');
  //
  //   const txResult = await tx.simulateDelegate(
  //     'cosmos1yjy5vj2wwc54y79jkfhyx2ze20ahu7544ghxuh',
  //     'cosmosvaloper183aycgtstp67r6s4vd7ts2npp2ckk4xah7rxj6',
  //     amount[0],
  //     '',
  //   );
  //   expect(txResult).toBeTruthy();
  // });

  test('Should send tokens', async () => {
    const tx = await getTx();
    const amount = coins('100', 'ujunox');
    const gasPrice = GasPrice.fromString(`${ChainInfos.juno.gasPriceStep.low.toString()}ujunox`);

    const gasEstimate = await tx.simulateSend(ADDRESSES.juno, ADDRESSESALT.juno, amount);

    const fee = calculateFee(Math.round(gasEstimate * 1.3), gasPrice);

    const txHash = await tx.sendTokens(ADDRESSES.juno, ADDRESSESALT.juno, amount, fee, 'Hello');

    const txResult = await tx.pollForTx(txHash);

    expect(isDeliverTxSuccess(txResult)).toBeTruthy();
  });

  test('Should send tokens over ibc', async () => {
    const tx = await getTx();
    const fee = {
      amount: coins(2000, 'ujunox'),
      gas: '80000', // 80k
    };

    const txHash = await tx.sendIBCTokens(
      ADDRESSES.juno,
      ADDRESSESALT.cosmos,
      coin(100, 'ujunox'),
      'fooPort',
      'fooChannel',
      undefined,
      Math.floor(Date.now() / 1000) + 60,
      fee,
      '',
    );

    const txResult = await tx.pollForTx(txHash);
    // CheckTx must pass but the execution must fail in DeliverTx due to invalid channel/port
    expect(isDeliverTxFailure(txResult)).toBeTruthy();
  });
});
