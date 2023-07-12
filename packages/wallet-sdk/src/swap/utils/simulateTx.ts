import { toUtf8 } from '@cosmjs/encoding';
import { coin } from '@cosmjs/stargate';
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx';

import { simulateTx } from '../../tx';
import { DirectTokenSwapArgs, PassThroughTokenSwapArgs } from '../../types/swap';
import {
  createExecuteMessage,
  getDirectTokenSwapMessage,
  getPassthroughSwapMessage,
} from './messages/createExecuteMessage';

export async function simulateDirectTokenSwap(
  lcd: string,
  { tokenA, swapDirection, swapAddress, senderAddress, slippage, price, tokenAmount }: Omit<DirectTokenSwapArgs, 'fee'>,
) {
  const swapMessage = getDirectTokenSwapMessage(price, slippage, swapDirection, tokenAmount);
  const encodedMsg = {
    typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
    value: MsgExecuteContract.encode({
      sender: senderAddress,
      contract: swapAddress,
      msg: toUtf8(JSON.stringify(swapMessage)),
      funds: tokenA.native ? [coin(tokenAmount, tokenA.denom)] : [],
    }).finish(),
  };
  return simulateTx(lcd, senderAddress, [encodedMsg]);
}

export async function simulatePassThroughTokenSwap(
  lcd: string,
  {
    tokenAmount,
    tokenA,
    outputSwapAddress,
    swapAddress,
    senderAddress,
    slippage,
    price,
  }: Omit<PassThroughTokenSwapArgs, 'fee'>,
) {
  const swapMessage = getPassthroughSwapMessage(price, slippage, tokenAmount, outputSwapAddress);
  const encodedMsg = {
    typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
    value: MsgExecuteContract.encode({
      sender: senderAddress,
      contract: swapAddress,
      msg: toUtf8(JSON.stringify(swapMessage)),
      funds: tokenA.native ? [coin(tokenAmount, tokenA.denom)] : [],
    }).finish(),
  };
  return simulateTx(lcd, senderAddress, [encodedMsg]);
}
