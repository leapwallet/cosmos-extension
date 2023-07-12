// import { coin } from '@cosmjs/stargate'
// import { DirectTokenSwapArgs } from "types/swap"

// import {
//   createExecuteMessage,
//   createIncreaseAllowanceMessage,
//   validateTransactionSuccess,
// } from './utils/messages'

// export const directTokenSwap = async ({
//   tokenA,
//   swapDirection,
//   swapAddress,
//   senderAddress,
//   slippage,
//   price,
//   tokenAmount,
// }: DirectTokenSwapArgs) => {
//   const minToken = Math.floor(price * (1 - slippage))

//   const swapMessage = {
//     swap: {
//       input_token: swapDirection === 'tokenAtoTokenB' ? 'Token1' : 'Token2',
//       input_amount: `${tokenAmount}`,
//       min_output: `${minToken}`,
//     },
//   }

//   if (!tokenA.native) {
//     const increaseAllowanceMessage = createIncreaseAllowanceMessage({
//       senderAddress,
//       tokenAmount,
//       tokenAddress: tokenA.token_address,
//       swapAddress,
//     })

//     const executeMessage = createExecuteMessage({
//       senderAddress,
//       contractAddress: swapAddress,
//       message: swapMessage,
//     })

//     return validateTransactionSuccess(
//       await client.signAndBroadcast(
//         senderAddress,
//         [increaseAllowanceMessage, executeMessage],
//         'auto'
//       )
//     )
//   }

//   return await client.execute(
//     senderAddress,
//     swapAddress,
//     swapMessage,
//     'auto',
//     undefined,
//     [coin(tokenAmount, tokenA.denom)]
//   )
// }
export {};
