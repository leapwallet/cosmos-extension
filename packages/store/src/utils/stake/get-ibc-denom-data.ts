import axios from 'axios';

export async function getIbcDenomData(ibcDenom: string, lcdUrl: string, chainId: string) {
  const data = await axios.post(
    'https://api.leapwallet.io/denom-trace',
    {
      ibcDenom: ibcDenom,
      lcdUrl: lcdUrl,
      chainId: chainId,
    },
    {
      timeout: 10000,
    },
  );

  return data.data.ibcDenomData;
}
