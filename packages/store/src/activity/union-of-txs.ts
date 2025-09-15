import { type ParsedTransaction } from '@leapwallet/parser-parfait';

export function unionOfTxs(_txs1: ParsedTransaction[], _txs2: ParsedTransaction[]): ParsedTransaction[] {
  if (!_txs1 || _txs1.length === 0) return _txs2;
  if (!_txs2 || _txs2.length === 0) return _txs1;

  const txs = new Map();

  _txs1.forEach((tx) => txs.set(tx.txHash, tx));
  _txs2.forEach((tx) => txs.set(tx.txHash, tx));

  return Array.from(txs.values()).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
