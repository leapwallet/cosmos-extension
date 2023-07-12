import { getBlockChainFromAddress } from '../src/utils';
import getHDPath from '../src/utils/get-hdpath';
import isValidChannelId from '../src/utils/validate-ibc-channel';

describe('Utils', () => {
  test('getHdpath should return correct hd path', () => {
    const path = getHDPath('118');
    expect(path).toEqual("m/44'/118'/0'/0/0");
  });

  test('should validate channels correctly', async () => {
    const isValidChannel1 = await isValidChannelId('channel-141', 'cosmos', 'osmosis');
    const isValidChannel2 = await isValidChannelId('channel-141', 'cosmos', 'juno');
    expect(isValidChannel1).toBeTruthy();
    expect(isValidChannel2).toBeFalsy();
  });
  test('should return the address prefix', () => {
    const prefix = getBlockChainFromAddress('cheqdvaloper19yhr89l8c3gcxaylnenx3tetjfl5m4dvp06cct');
    expect(prefix).toEqual('cheqdvaloper');
  });
});
