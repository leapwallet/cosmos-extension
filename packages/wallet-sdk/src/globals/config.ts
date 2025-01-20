let LEAP_API_BASE_URL: string;
let IS_COMPASS: boolean;

export function setBaseURL(baseUrl: string) {
  LEAP_API_BASE_URL = baseUrl;
}

export function setIsCompass(isCompass: boolean) {
  IS_COMPASS = isCompass;
}

export function getBaseURL() {
  return LEAP_API_BASE_URL;
}

export function getIsCompass() {
  return IS_COMPASS;
}
