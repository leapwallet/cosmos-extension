import { Images } from 'images'

export enum Countries {
  USD = 'USD',
  CAD = 'CAD',
  EUR = 'EUR',
  GBP = 'GBP',
  MXN = 'MXN',
  COP = 'COP',
  INR = 'INR',
  CHF = 'CHF',
  AUD = 'AUD',
  ARS = 'ARS',
  BRL = 'BRL',
  CLP = 'CLP',
  JPY = 'JPY',
  KRW = 'KRW',
  PEN = 'PEN',
  PHP = 'PHP',
  SGD = 'SGD',
  TRY = 'TRY',
  UYU = 'UYU',
  TWD = 'TWD',
  VND = 'VND',
  CRC = 'CRC',
  SEK = 'SEK',
  PLN = 'PLN',
  DKK = 'DKK',
  NOK = 'NOK',
  NZD = 'NZD',
}

export const getCountryLogo = (country: string) => {
  const countryCode = country?.toUpperCase() as keyof typeof Countries
  return Images.Countries[countryCode] ?? Images.Logos.GenericDark
}
