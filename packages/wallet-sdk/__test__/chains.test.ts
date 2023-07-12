import { getChannelIds } from '../src';

describe('ibc', () => {
  test('should fetch correct channel ids', async () => {
    const channelIds = await getChannelIds('cosmoshub', 'osmosis');
    expect(channelIds).toContain('channel-141');
  });
});
