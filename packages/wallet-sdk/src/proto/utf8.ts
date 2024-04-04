'use strict';

/**
 * Calculates the UTF8 byte length of a string.
 * @param {string} string String
 * @returns {number} Byte length
 */
export function utf8Length(str: string) {
  let len = 0,
    c = 0;
  for (let i = 0; i < str.length; ++i) {
    c = str.charCodeAt(i);
    if (c < 128) len += 1;
    else if (c < 2048) len += 2;
    else if ((c & 0xfc00) === 0xd800 && (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
      ++i;
      len += 4;
    } else len += 3;
  }
  return len;
}

/**
 * Reads UTF8 bytes as a string.
 * @param {Uint8Array} buffer Source buffer
 * @param {number} start Source start
 * @param {number} end Source end
 * @returns {string} String read
 */
export function utf8Read(buffer: ArrayLike<number>, start: number, end: number) {
  const len = end - start;
  if (len < 1) return '';
  const chunk = [];
  let parts: string[] = [],
    i = 0, // char offset
    t; // temporary
  while (start < end) {
    t = buffer[start++];
    if (t < 128) chunk[i++] = t;
    else if (t > 191 && t < 224) chunk[i++] = ((t & 31) << 6) | (buffer[start++] & 63);
    else if (t > 239 && t < 365) {
      t =
        (((t & 7) << 18) | ((buffer[start++] & 63) << 12) | ((buffer[start++] & 63) << 6) | (buffer[start++] & 63)) -
        0x10000;
      chunk[i++] = 0xd800 + (t >> 10);
      chunk[i++] = 0xdc00 + (t & 1023);
    } else chunk[i++] = ((t & 15) << 12) | ((buffer[start++] & 63) << 6) | (buffer[start++] & 63);
    if (i > 8191) {
      (parts || (parts = [])).push(String.fromCharCode(...chunk));
      i = 0;
    }
  }
  if (parts) {
    if (i) parts.push(String.fromCharCode(...chunk.slice(0, i)));
    return parts.join('');
  }
  return String.fromCharCode(...chunk.slice(0, i));
}

/**
 * Writes a string as UTF8 bytes.
 * @param {string} string Source string
 * @param {Uint8Array} buffer Destination buffer
 * @param {number} offset Destination offset
 * @returns {number} Bytes written
 */
export function utf8Write(str: string, buffer: Uint8Array | Array<number>, offset: number) {
  const start = offset;
  let c1, // character 1
    c2; // character 2
  for (let i = 0; i < str.length; ++i) {
    c1 = str.charCodeAt(i);
    if (c1 < 128) {
      buffer[offset++] = c1;
    } else if (c1 < 2048) {
      buffer[offset++] = (c1 >> 6) | 192;
      buffer[offset++] = (c1 & 63) | 128;
    } else if ((c1 & 0xfc00) === 0xd800 && ((c2 = str.charCodeAt(i + 1)) & 0xfc00) === 0xdc00) {
      c1 = 0x10000 + ((c1 & 0x03ff) << 10) + (c2 & 0x03ff);
      ++i;
      buffer[offset++] = (c1 >> 18) | 240;
      buffer[offset++] = ((c1 >> 12) & 63) | 128;
      buffer[offset++] = ((c1 >> 6) & 63) | 128;
      buffer[offset++] = (c1 & 63) | 128;
    } else {
      buffer[offset++] = (c1 >> 12) | 224;
      buffer[offset++] = ((c1 >> 6) & 63) | 128;
      buffer[offset++] = (c1 & 63) | 128;
    }
  }
  return offset - start;
}
