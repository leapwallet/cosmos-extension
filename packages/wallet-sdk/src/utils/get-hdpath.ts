import { CoinType } from '../constants';

export default function getHDPath(coinType: CoinType, index = '0', account = '0', chain = '0') {
  return `m/44'/${coinType}'/${account}'/${chain}/${index}`;
}
