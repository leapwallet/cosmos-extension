let LEAP_API_BASE_URL: string;
let IS_COMPASS: boolean;
let APP_TYPE: 'extension' | 'mobile' = 'extension';

export function setBaseURL(baseUrl: string) {
  LEAP_API_BASE_URL = baseUrl;
}

export function setIsCompass(isCompass: boolean) {
  IS_COMPASS = isCompass;
}

export function setAppType(appType: 'extension' | 'mobile') {
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

export function getLeapApiGlobalHeaders() {
  return {
    'x-app-type': `${IS_COMPASS ? 'compass' : 'leap'}-${APP_TYPE}`,
  };
}
