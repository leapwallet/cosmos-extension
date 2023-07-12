import { decrypt as keychainDecrypt, encrypt as keychainEncrypt } from '@leapwallet/leap-keychain';

/**
 * @deprecated use encrypt function from @leapwallet/leap-keychain
 * @param msg
 * @param pass
 * @returns
 */
export const encrypt = (msg: string, pass: string): string => {
  return keychainEncrypt(msg, pass);
};

/**
 * @deprecated use decrypt function from @leapwallet/leap-keychain
 * @param transitmessage
 * @param pass
 * @returns
 */
export const decrypt = (transitmessage: string, pass: string): string => {
  return keychainDecrypt(transitmessage, pass);
};
