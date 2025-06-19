import { calculateFee, StdFee } from '@cosmjs/stargate'
import { GasPrice, NativeDenom } from '@leapwallet/cosmos-wallet-sdk'
import {
  AddressLookupTableAccount,
  ComputeBudgetProgram,
  Connection,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js'
import BigNumber from 'bignumber.js'
import { getStdFee } from 'pages/sign-aptos/utils/get-fee'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getOriginalSignDoc(signRequestData: any, isDisplay: boolean = false) {
  const transaction = VersionedTransaction.deserialize(signRequestData)
  if (isDisplay) {
    const tsxBytes = new Uint8Array(Buffer.from(signRequestData, 'base64'))
    const transaction = VersionedTransaction.deserialize(tsxBytes)
    return {
      signDoc: transaction,
      signOptions: {},
    }
  }
  return {
    signDoc: transaction,
    signOptions: {},
  }
}

function getDefaultFee(nativeFeeDenom: NativeDenom) {
  return calculateFee(Number(5000), GasPrice.fromString(`${0}${nativeFeeDenom.coinMinimalDenom}`))
}

function getUpdatedFee(
  defaultFee: StdFee,
  gasLimit: string,
  gasPrice: GasPrice,
  isGasOptionSelected: boolean,
  signOptions?: { preferNoSetFee?: boolean },
) {
  const customGasLimit = new BigNumber(gasLimit)

  const fee =
    signOptions?.preferNoSetFee && !isGasOptionSelected
      ? defaultFee
      : getStdFee(
          !customGasLimit.isNaN() && customGasLimit.isGreaterThan(0)
            ? customGasLimit.toString()
            : defaultFee.gas,
          gasPrice,
        )

  //@ts-ignore
  fee.amount[0].amount = new BigNumber(fee.amount[0].amount).plus(5000).toString()

  return fee
}

export async function getUpdatedSignDoc(
  originalSignDocBase64: string,
  updatedFee: StdFee,
): Promise<Uint8Array> {
  const originalBuffer = Buffer.from(originalSignDocBase64, 'base64')
  const transaction = VersionedTransaction.deserialize(originalBuffer)

  const altLookups = transaction.message.addressTableLookups
  const lookupTableAccounts: AddressLookupTableAccount[] = []
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed')
  for (const lookup of altLookups) {
    const altAccountInfo = await connection.getAddressLookupTable(lookup.accountKey)
    if (altAccountInfo.value) {
      lookupTableAccounts.push(altAccountInfo.value)
    } else {
      throw new Error(`Failed to resolve Address Lookup Table: ${lookup.accountKey.toBase58()}`)
    }
  }

  const message = TransactionMessage.decompile(transaction.message, {
    addressLookupTableAccounts: lookupTableAccounts,
  })

  const computeUnitLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
    units: updatedFee && Number(updatedFee.gas) < 20_000 ? 20_000 : Number(updatedFee.gas),
  })

  const computeUnitPriceIx = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: updatedFee
      ? Math.floor((Number(updatedFee.amount[0].amount) / Number(updatedFee.gas)) * 1_000_000)
      : 0,
  })

  message.instructions.unshift(computeUnitPriceIx, computeUnitLimitIx)

  const compiledMessage = message.compileToV0Message(lookupTableAccounts)
  const newTx = new VersionedTransaction(compiledMessage)

  return newTx.serialize()
}

export function getSolanaSignDoc({
  signRequestData,
  gasPrice,
  gasLimit,
  isGasOptionSelected,
  nativeFeeDenom,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signRequestData: Record<string, any>
  gasPrice: GasPrice
  gasLimit: string
  isGasOptionSelected: boolean
  nativeFeeDenom: NativeDenom
}) {
  const { signOptions } = getOriginalSignDoc(signRequestData.signDoc)
  const defaultFee = getDefaultFee(nativeFeeDenom)
  const updatedFee = getUpdatedFee(defaultFee, gasLimit, gasPrice, isGasOptionSelected, signOptions)

  return {
    updatedSignDoc: signRequestData.signDoc,
    updatedFee,
    allowSetFee: false,
    defaultFee: updatedFee,
    defaultMemo: '',
  }
}
