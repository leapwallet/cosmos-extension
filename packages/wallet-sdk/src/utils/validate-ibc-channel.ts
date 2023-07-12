import axios from 'axios';

import { ChainInfos, SupportedChain } from '../constants';
import { ClientStateData } from '../types/ibc';

export async function getClientState(lcd: string, channelId: string, port: string, timeout = 3_000) {
  const url = `${lcd}/ibc/core/channel/v1/channels/${channelId}/ports/${port}/client_state`;
  const channelIdData = await axios.get<ClientStateData>(url, { timeout });
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
  const lcd = ChainInfos[sourceChain].apis.rest ?? '';

  try {
    const channelIdData = await getClientState(lcd, channelId, port, timeout);

    const recipientChainId = ChainInfos[recipientChain].chainId;
    return channelIdData.data.identified_client_state.client_state.chain_id === recipientChainId;
  } catch (e) {
    throw new Error('Could not find channel Id.');
  }
}
