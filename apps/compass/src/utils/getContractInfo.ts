import axios from 'axios'

export async function getContractInfo(lcdUrl: string, coinMinimalDenom: string) {
  const url = `${lcdUrl}/cosmwasm/wasm/v1/contract/${coinMinimalDenom}/smart/${Buffer.from(
    '{"token_info":{}}',
  ).toString('base64')}`

  const { data } = await axios.get(url)
  if (data.error && data.error.toLowerCase().includes('decoding bech32 failed')) {
    return 'Invalid Contract Address'
  } else {
    return data.data
  }
}
