import { calculateFee, GasPrice } from '@cosmjs/stargate'

export function getStdFee(gasLimit: string, gasPrice: GasPrice) {
  return calculateFee(parseInt(gasLimit), gasPrice)
}
