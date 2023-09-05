import { axiosWrapper } from '@leapwallet/cosmos-wallet-sdk';

export async function getCoreumHybridTokenInfo(lcdUrl: string, coinMinimalDenom: string) {
  const { data } = await axiosWrapper({
    baseURL: lcdUrl,
    method: 'get',
    url: `/coreum/asset/ft/v1/tokens/${coinMinimalDenom}`,
  });

  const { symbol, precision } = data.token;
  return { symbol, precision };
}
