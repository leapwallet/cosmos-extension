import axios from 'axios';

export async function getCoreumHybridTokenInfo(lcdUrl: string, coinMinimalDenom: string) {
  const url = `${lcdUrl}/coreum/asset/ft/v1/tokens/${coinMinimalDenom}`;
  const { data } = await axios.get(url);

  const { symbol, precision } = data.token;
  return { symbol, precision };
}
