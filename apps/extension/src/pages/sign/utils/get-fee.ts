import { calculateFee, GasPrice, StdFee } from '@cosmjs/stargate'
import { Fee } from 'cosmjs-types/cosmos/tx/v1beta1/tx'

export function getStdFee(gasLimit: string, gasPrice: GasPrice) {
  return calculateFee(Number(gasLimit), gasPrice)
}

export function getFee(rawFee: Fee | StdFee, gasPrice: GasPrice, gasLimit: string) {
  const stdFee = calculateFee(
    Number(gasLimit || ('gasLimit' in rawFee ? rawFee.gasLimit : rawFee.gas)),
    gasPrice,
  )

  return Fee.fromPartial({
    gasLimit: stdFee.gas,
    amount:
      stdFee?.amount.map((fee) => {
        return {
          amount: fee.amount,
          denom: fee.denom,
        }
      }) ?? [],
    granter: (rawFee as Fee)?.granter,
    payer: (rawFee as Fee)?.payer,
  })
}
