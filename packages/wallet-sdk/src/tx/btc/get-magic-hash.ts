import { sha256 } from '@noble/hashes/sha256';

const MAGIC_BYTES = new TextEncoder().encode('Bitcoin Signed Message:\n');

function varintNum(n: number): Uint8Array {
  let arr: Uint8Array;
  let view: DataView;
  if (n < 253) {
    arr = new Uint8Array(1);
    arr[0] = n;
  } else if (n < 0x10000) {
    arr = new Uint8Array(3);
    arr[0] = 253;
    view = new DataView(arr.buffer);
  } else if (n < 0x100000000) {
    arr = new Uint8Array(5);
    arr[0] = 254;
    view = new DataView(arr.buffer);
    view.setUint32(1, n, true);
  } else {
    arr = new Uint8Array(9);
    arr[0] = 255;
    view = new DataView(arr.buffer);
    view.setInt32(1, n & -1, true);
    view.setUint32(5, Math.floor(n / 0x100000000), true);
  }
  return arr;
}

export function magicHash(message: string) {
  const prefix1 = varintNum(MAGIC_BYTES.length);
  const messageBytes = new TextEncoder().encode(message);
  const prefix2 = varintNum(messageBytes.length);
  const arr = Uint8Array.from([...prefix1, ...MAGIC_BYTES, ...prefix2, ...messageBytes]);
  return sha256(sha256(arr));
}
