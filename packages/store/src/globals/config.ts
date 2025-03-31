import {
  setAppType as setAppTypeSdk,
  setBaseURL as setBaseURLSdk,
  setIsCompass as setIsCompassSdk,
} from '@leapwallet/cosmos-wallet-sdk';

let LEAP_API_BASE_URL: string;
let IS_COMPASS: boolean;
let APP_TYPE: 'extension' | 'mobile';

export function setBaseURL(baseUrl: string) {
  setBaseURLSdk(baseUrl);
  LEAP_API_BASE_URL = baseUrl;
}

export function setIsCompass(isCompass: boolean) {
  setIsCompassSdk(isCompass);
  IS_COMPASS = isCompass;
}

export function setAppType(appType: 'extension' | 'mobile') {
  setAppTypeSdk(appType);
  APP_TYPE = appType;
}

export function getBaseURL() {
  return LEAP_API_BASE_URL;
}

export function getIsCompass() {
  return IS_COMPASS;
}

export function getAppType() {
  return APP_TYPE;
}
