import { MsgExecuteContractEncodeObject } from '@cosmjs/cosmwasm-stargate';
import { toUtf8 } from '@cosmjs/encoding';
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx';
import { CreateExecuteMessageArgs } from 'types/swap';

export const createExecuteMessage = ({
  senderAddress,
  contractAddress,
  message,
  funds,
}: CreateExecuteMessageArgs): MsgExecuteContractEncodeObject => ({
  typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
  value: MsgExecuteContract.fromPartial({
    sender: senderAddress,
    contract: contractAddress,
    msg: toUtf8(JSON.stringify(message)),
    funds: funds || [],
  }),
});

export function getDirectTokenSwapMessage(
  price: number,
  slippage: number,
  swapDirection: 'tokenAtoTokenB' | 'tokenBtoTokenA',
  tokenAmount: number,
) {
  const minToken = Math.floor(price * (1 - slippage));

  const swapMessage = {
    swap: {
      input_token: swapDirection === 'tokenAtoTokenB' ? 'Token1' : 'Token2',
      input_amount: `${tokenAmount}`,
      min_output: `${minToken}`,
    },
  };
  return swapMessage;
}

export function getPassthroughSwapMessage(
  price: number,
  slippage: number,
  tokenAmount: number,
  outputSwapAddress: string,
) {
  const minOutputToken = Math.floor(price * (1 - slippage));
  const swapMessage = {
    pass_through_swap: {
      output_min_token: `${minOutputToken}`,
      input_token: 'Token2',
      input_token_amount: `${tokenAmount}`,
      output_amm_address: outputSwapAddress,
    },
  };
  return swapMessage;
}
