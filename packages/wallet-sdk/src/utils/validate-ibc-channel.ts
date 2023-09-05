import { ChainInfos, SupportedChain } from '../constants';
import { axiosWrapper } from '../healthy-nodes';
import { ClientStateData } from '../types/ibc';
import { getRestUrl } from './getRestURL';

export async function getClientState(lcd: string, channelId: string, port: string, timeout = 3_000) {
  const channelIdData = await axiosWrapper<ClientStateData>({
    baseURL: lcd,
    method: 'get',
    url: `/ibc/core/channel/v1/channels/${channelId}/ports/${port}/client_state`,
    timeout,
  });

  return channelIdData;
}

export async function getChannelIdData(lcdUrl: string, lastChannelId: string) {
  const channelIdData = await getClientState(lcdUrl, lastChannelId, 'transfer');
  return channelIdData.data.identified_client_state.client_state.chain_id;
}

export default async function isValidChannelId(
  channelId: string,
  sourceChain: SupportedChain,
  recipientChain: SupportedChain,
  port = 'transfer',
  timeout = 3_000,
) {
  const lcd = getRestUrl(ChainInfos, sourceChain, false);

  try {
    const channelIdData = await getClientState(lcd, channelId, port, timeout);

    const recipientChainId = ChainInfos[recipientChain].chainId;
    return channelIdData.data.identified_client_state.client_state.chain_id === recipientChainId;
  } catch (e) {
    throw new Error('Could not find channel Id.');
  }
}
