import { Activity, ActivityCardContent } from '@leapwallet/cosmos-wallet-hooks'
import { ParsedTransaction } from '@leapwallet/parser-parfait'
import dayjs from 'dayjs'

export function reduceActivityInSections(
  acc: Record<string, { parsedTx: ParsedTransaction; content: ActivityCardContent }[]>,
  tx: Activity,
) {
  if (!tx.parsedTx) return acc

  const date = dayjs(tx.parsedTx.timestamp).format('MMMM DD')
  if (acc[date]) {
    acc[date].push(tx)
  } else {
    acc = { ...acc, [date]: [tx] }
  }

  return acc
}
