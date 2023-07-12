import axios, { AxiosError } from 'axios';

import { IBCData } from '../types/ibc-data';

const baseUrl = 'https://assets.leapwallet.io/ibc-support-db/pairs';
const backupUrl = 'https://proxy.atomscan.com/directory/_IBC';

async function getIbcData(
  url: string,
  sourceChain: string,
  recipientChain: string,
): Promise<{ chain1: string; chain2: string; ibcData: IBCData }> {
  const chainOrder = [sourceChain, recipientChain].sort().sort((a, b) => a.localeCompare(b));
  const filePath = chainOrder.join('-');
  try {
    const response = await axios(`${url}/${filePath}.json`);
    const ibcData: IBCData = await response.data;
    const [chain1, chain2] = chainOrder;
    return { chain1, chain2, ibcData };
  } catch (e) {
    if (e instanceof AxiosError && (e.response?.status === 404 || e.response?.status === 403)) {
      throw new Error('not-supported');
    }
    if (url !== backupUrl) {
      return getIbcData(backupUrl, sourceChain, recipientChain);
    } else {
      throw e;
    }
  }
}

/**
 * Get the source chain channel ID for IBC
 *
 * @param sourceChain chain registry path of the source chain
 * @param recipientChain chain registry path of the recipient chain
 */
export async function getSourceChainChannelId(sourceChain: string, recipientChain: string) {
  const { chain1, ibcData } = await getIbcData(baseUrl, sourceChain, recipientChain);
  const [channel] = ibcData.channels;
  return chain1 === sourceChain ? channel['chain_1']['channel_id'] : channel['chain_2']['channel_id'];
}

export async function getChannelIds(sourceChain: string, recipientChain: string): Promise<string[]> {
  const { chain1, chain2, ibcData } = await getIbcData(baseUrl, sourceChain, recipientChain);

  return ibcData.channels.reduce((channels: Array<string>, channel) => {
    if (chain1 === sourceChain) {
      channels.push(channel['chain_1']['channel_id']);
    } else if (chain2 === sourceChain) {
      channels.push(channel['chain_2']['channel_id']);
    }
    return channels;
  }, []);
}
