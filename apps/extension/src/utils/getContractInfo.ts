import axios from 'axios'

export async function getContractInfo(lcdUrl: string, coinMinimalDenom: string) {
  const url = `${lcdUrl}/wasm/contract/${coinMinimalDenom}/smart/${Buffer.from(
    '{"token_info":{}}',
  ).toString('hex')}?encoding=utf-8`

  const { data } = await axios.get(url)
  if (data.error && data.error.toLowerCase().includes('decoding bech32 failed')) {
    return 'Invalid Contract Address'
  } else {
    return JSON.parse(Buffer.from(data.result.smart, 'base64').toString('utf-8'))
  }
}
