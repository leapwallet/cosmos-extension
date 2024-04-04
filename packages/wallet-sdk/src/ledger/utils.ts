import Transport from '@ledgerhq/hw-transport';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';

import { sleep } from '../utils';
import { ledgerLockedError } from './ledger-errors';
const ERROR_DESCRIPTION: any = {
  1: 'U2F: Unknown',
  2: 'U2F: Bad request',
  3: 'U2F: Configuration unsupported',
  4: 'U2F: Device Ineligible',
  5: 'U2F: Timeout',
  14: 'Timeout',
  0x9000: 'No errors',
  0x9001: 'Device is busy',
  0x6802: 'Error deriving keys',
  0x6400: 'Execution Error',
  0x6700: 'Wrong Length',
  0x6982: 'Empty Buffer',
  0x6983: 'Output buffer too small',
  0x6984: 'Data is invalid',
  0x6985: 'Conditions not satisfied',
  0x6986: 'Transaction rejected',
  0x6a80: 'Bad key handle',
  0x6b00: 'Invalid P1/P2',
  0x6d00: 'Instruction not supported',
  0x6e00: 'App does not seem to be open',
  0x6f00: 'Unknown error',
  0x6f01: 'Sign/verify error',
};

function isDict(v: any) {
  return typeof v === 'object' && v !== null && !(v instanceof Array) && !(v instanceof Date);
}

export function processErrorResponse(response: any) {
  if (response) {
    if (isDict(response)) {
      if (Object.prototype.hasOwnProperty.call(response, 'statusCode')) {
        return {
          return_code: response.statusCode,
          error_message: errorCodeToString(response.statusCode),
        };
      }

      if (
        Object.prototype.hasOwnProperty.call(response, 'return_code') &&
        Object.prototype.hasOwnProperty.call(response, 'error_message')
      ) {
        return response;
      }
    }
    return {
      return_code: 0xffff,
      error_message: response.toString(),
    };
  }

  return {
    return_code: 0xffff,
    error_message: response.toString(),
  };
}

export function errorCodeToString(statusCode: number) {
  if (statusCode in ERROR_DESCRIPTION) return ERROR_DESCRIPTION[statusCode];
  return `Unknown Status Code: ${statusCode}`;
}

export async function getAppInfo(transport: Transport) {
  try {
    const response = await transport.send(0xb0, 0x01, 0, 0);
    const errorCodeData = response.slice(-2);
    const returnCode = (errorCodeData[0] << 8) | errorCodeData[1];
    if (response[0] !== 1) {
      return {
        return_code: 0x9001,
        error_message: 'Response format ID not recognized',
      };
    }

    // Parsing app name
    const appNameLength = response[1];
    const appName = response.slice(2, 2 + appNameLength).toString('ascii');

    let index = 2 + appNameLength; // Moving index past app name

    // Parsing app version
    const appVersionLength = response[index];
    index += 1; // Moving index to app version
    const appVersion = response.slice(index, index + appVersionLength).toString('ascii');

    index += appVersionLength; // Moving index past app version

    // Parsing app flags
    const appFlagsLength = response[index];
    index += 1; // Moving index to flags
    const flagsValue = response[index];

    // Interpreting flags
    const flagRecovery = (flagsValue & 1) !== 0;
    const flagSignedMcuCode = (flagsValue & 2) !== 0;
    const flagOnboarded = (flagsValue & 4) !== 0;
    const flagPinValidated = (flagsValue & 128) !== 0;

    return {
      return_code: returnCode,
      error_message: errorCodeToString(returnCode),
      appName,
      appVersion,
      flagLen: appFlagsLength,
      flagsValue,
      flag_recovery: flagRecovery,
      flag_signed_mcu_code: flagSignedMcuCode,
      flag_onboarded: flagOnboarded,
      flag_pin_validated: flagPinValidated,
    };
  } catch (error) {
    return processErrorResponse(error);
  }
}

export async function openApp(transport: Transport, name: string, retry = 30) {
  await transport.send(0xe0, 0xd8, 0x00, 0x00, Buffer.from(name, 'ascii'));
  let newTransport = transport;
  let i = 0;
  while (i < retry) {
    if (transport instanceof TransportWebHID) {
      newTransport = await TransportWebHID.create();
    } else {
      newTransport = await TransportWebUSB.create();
    }

    const appInfo = await getAppInfo(newTransport);

    if (appInfo.error_message === 'No errors' && appInfo.appName === name) {
      break;
    }
    await sleep(100);
    i++;
  }
  return newTransport;
}

export async function isAppOpen(transport: Transport, name: string) {
  let isAppOpened = false;
  const appInfo = await getAppInfo(transport);
  if (appInfo.error_message === 'No errors' && appInfo.appName === name) {
    isAppOpened = true;
  } else if (appInfo.appName && appInfo.appName !== name && appInfo.appName !== 'BOLOS') {
    throw new Error(`Incorrect app: Please close the ${appInfo.appName} app and open the ${name} app on your ledger`);
  } else if (appInfo.return_code === 21781) {
    throw new Error(ledgerLockedError);
  }
  return isAppOpened;
}

export async function attemptAppOpen(transport: Transport, name: string, retry = 30) {
  let isAppOpened = false;
  try {
    isAppOpened = await isAppOpen(transport, name);
  } catch {
    //
  }
  try {
    if (!isAppOpened) {
      return await openApp(transport, name, retry);
    }
  } catch (e) {
    //
  }
}
