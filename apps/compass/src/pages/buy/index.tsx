import { formatTokenAmount, useDebounce } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { ArrowLeft, ArrowSquareOut, CaretDown } from '@phosphor-icons/react'
import { captureException } from '@sentry/react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { WalletButton } from 'components/button'
import { PageHeader } from 'components/header'
import Text from 'components/text'
import { Button } from 'components/ui/button'
import { PageName } from 'config/analytics'
import { useWalletInfo } from 'hooks'
import { AssetProps } from 'hooks/kado/useGetSupportedAssets'
import { useChainInfos } from 'hooks/useChainInfos'
import { getConversionRateKado, getQuoteKado } from 'hooks/useGetKadoDetails'
import { getQuoteMoonpay } from 'hooks/useGetMoonpayDetails'
import { getQuoteTransak } from 'hooks/useGetTransakDetails'
import useQuery from 'hooks/useQuery'
import { useAddress } from 'hooks/wallet/useAddress'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import { isString } from 'markdown-it/lib/common/utils'
import SelectWallet from 'pages/home/SelectWallet'
import { convertObjInQueryParams } from 'pages/home/utils'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from 'utils/cn'
import { getCountryLogo } from 'utils/getCountryLogo'
import { uiErrorTags } from 'utils/sentry'
import { removeLeadingZeroes } from 'utils/strings'

import SelectAssetSheet from './components/SelectAssetSheet'
import SelectCurrencySheet from './components/SelectCurrencySheet'
import useWallets = Wallet.useWallets

import SelectProvider from './components/SelectProvider'

export enum ServiceProviderEnum {
  KADO = 'kado',
  MOONPAY = 'moonpay',
  TRANSAK = 'transak',
}

export type ProviderQuote = {
  [key in ServiceProviderEnum]?: {
    crypto?: string | null
    fiat?: string | null
  }
}

export type ProviderDetailsType = {
  [key in ServiceProviderEnum]: {
    name: string
    image: string
    url: string
  }
}

export const ProviderDetails: ProviderDetailsType = {
  [ServiceProviderEnum.KADO]: {
    name: 'Kado',
    image: 'https://assets.leapwallet.io/kado.svg',
    url: 'https://app.kado.money',
  },
  [ServiceProviderEnum.MOONPAY]: {
    name: 'MoonPay',
    image: 'https://assets.leapwallet.io/moonpay.svg',
    url: 'https://buy.moonpay.com',
  },
  [ServiceProviderEnum.TRANSAK]: {
    name: 'Transak',
    image: 'https://assets.leapwallet.io/transak.svg',
    url: 'https://global.transak.com',
  },
}

const Buy = () => {
  const pageViewSource = useQuery().get('pageSource') ?? undefined
  const { walletAvatar, walletName } = useWalletInfo()

  const navigate = useNavigate()
  const location = useLocation()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const asset: any = location.state

  const [showSelectCurrencySheet, setShowSelectCurrencySheet] = useState(false)
  const [showSelectTokenSheet, setShowSelectTokenSheet] = useState(false)
  const [showSelectProviderSheet, setShowSelectProviderSheet] = useState(false)
  const [showSelectWallet, setShowSelectWallet] = useState(false)
  const [provider, setProvider] = useState<ServiceProviderEnum>()
  const [userSelectedProvider, setUserSelectedProvider] = useState(false)
  const [providersQuote, setProvidersQuote] = useState<ProviderQuote>({})

  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [selectedAsset, setSelectedAsset] = useState<AssetProps | undefined>(undefined)
  const selectedAddress = useAddress()

  const [payFiatAmount, setPayFiatAmount] = useState<string>('0')
  const debouncedPayAmount = useDebounce<string>(payFiatAmount, 500)
  const [fiatAmountInUsd, setFiatAmountInUsd] = useState('0')
  const [getAssetAmount, setGetAssetAmount] = useState<string>('0')
  const [loadingQuote, setLoadingQuote] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputAmountRef = useRef(null)
  const chains = useChainInfos()
  const wallets = useWallets()

  const selectedAddressIsSelf: boolean | null = useMemo(() => {
    const walletAddresses = wallets
      ? Object.values(wallets)
          .map((wallet) => Object.values(wallet.addresses))
          .flat()
      : []
    if (selectedAddress) {
      return walletAddresses.includes(selectedAddress)
    } else {
      return null
    }
  }, [selectedAddress, wallets])

  const handleOpenWalletSheet = useCallback(() => setShowSelectWallet(true), [])

  const multipleProvider = Object.values(providersQuote).length > 1

  useEffect(() => {
    let isCancelled = false
    async function getQuote() {
      try {
        setLoadingQuote(true)
        const allQuotes = await Promise.all([
          getQuoteKado({
            transactionType: 'buy',
            fiatMethod: 'credit_card',
            partner: 'fortress',
            amount: new BigNumber(debouncedPayAmount).toNumber(),
            currency: selectedCurrency,
            asset: selectedAsset?.symbol ?? 'ATOM',
            blockchain: selectedAsset?.origin.toLowerCase() ?? 'cosmos hub',
          }),
          getQuoteTransak({
            partnerApiKey: process.env.TRANSAK_API_KEY ?? '',
            fiatCurrency: selectedCurrency,
            cryptoCurrency: selectedAsset?.symbol ?? '',
            isBuyOrSell: 'BUY',
            network: selectedAsset?.origin ?? '',
            paymentMethod: 'credit_debit_card',
            fiatAmount: new BigNumber(debouncedPayAmount).toNumber(),
          }),
          getQuoteMoonpay({
            apiKey: process.env.MOONPAY_API_KEY ?? '',
            baseCurrencyAmount: new BigNumber(debouncedPayAmount).toNumber(),
            baseCurrencyCode: selectedCurrency.toLowerCase(),
            paymentMethod: 'credit_debit_card',
            symbol: selectedAsset?.symbol?.toLowerCase() ?? '',
          }),
        ])
        if (!isCancelled) {
          if (allQuotes[0].success) {
            setProvidersQuote((prevState) => ({
              ...prevState,
              [ServiceProviderEnum.KADO]: {
                crypto: allQuotes[0]?.data?.quote?.receiveUnitCountAfterFees?.amount,
                fiat: allQuotes[0]?.data?.quote?.receiveAmountAfterFees?.amount,
              },
            }))
          } else {
            setProvidersQuote((prevState) => {
              const newVal = { ...prevState }
              delete newVal[ServiceProviderEnum.KADO]
              return newVal
            })
          }

          if (allQuotes[1].success) {
            setProvidersQuote((prevState) => ({
              ...prevState,
              [ServiceProviderEnum.TRANSAK]: {
                crypto: allQuotes[1]?.response?.cryptoAmount,
                fiat: new BigNumber(allQuotes[1]?.response?.cryptoAmount)
                  .dividedBy(allQuotes[1]?.response?.conversionPrice)
                  .toFixed(2),
              },
            }))
          } else {
            setProvidersQuote((prevState) => {
              const newVal = { ...prevState }
              delete newVal[ServiceProviderEnum.TRANSAK]
              return newVal
            })
          }

          if (allQuotes[2].success) {
            setProvidersQuote((prevState) => ({
              ...prevState,
              [ServiceProviderEnum.MOONPAY]: {
                crypto: allQuotes[2]?.quoteCurrencyAmount,
                fiat: new BigNumber(allQuotes[2]?.quoteCurrencyAmount)
                  .multipliedBy(allQuotes[2]?.quoteCurrencyPrice)
                  .toFixed(2),
              },
            }))
          } else {
            setProvidersQuote((prevState) => {
              const newVal = { ...prevState }
              delete newVal[ServiceProviderEnum.MOONPAY]
              return newVal
            })
          }
        }
      } catch (error) {
        if (isCancelled) return
        captureException(error, {
          tags: uiErrorTags,
        })

        const message = error instanceof Error ? error.message : 'An error occurred'
        if (message.toLowerCase().includes('timeout')) {
          setError('Request timed out. Unable to fetch quote.')
        } else {
          setError(message)
        }
      } finally {
        if (!isCancelled) setLoadingQuote(false)
      }
    }
    if (debouncedPayAmount && new BigNumber(debouncedPayAmount).isGreaterThan('0')) {
      getQuote()
    } else {
      setGetAssetAmount('0')
    }

    return () => {
      isCancelled = true
    }
  }, [debouncedPayAmount, selectedAsset, selectedCurrency])

  useEffect(() => {
    if (inputAmountRef.current) {
      ;(inputAmountRef.current as HTMLElement)?.focus()
    }
  }, [])

  useEffect(() => {
    if (pageViewSource === PageName.AssetDetails) {
      const chain = chains[asset.chain as SupportedChain]
      setSelectedAsset({
        symbol: asset.symbol,
        assetImg: asset.img,
        origin: chain.chainName,
      })
    }
  }, [asset, chains, pageViewSource])

  useEffect(() => {
    if (!selectedAsset) {
      setShowSelectTokenSheet(true)
    }
  }, [selectedAsset])

  useEffect(() => {
    async function currencyToUsd(amount: string, currency: string) {
      if (currency !== 'USD') {
        const conversionRateToUsd = await getConversionRateKado({
          from: currency,
          to: 'USD',
        })
        const usdAmount = new BigNumber(amount).multipliedBy(conversionRateToUsd)
        setFiatAmountInUsd(usdAmount.toString())
      } else {
        setFiatAmountInUsd(amount)
      }
    }
    currencyToUsd(debouncedPayAmount, selectedCurrency)
  }, [debouncedPayAmount, selectedCurrency])

  useEffect(() => {
    async function setLimitError() {
      setError(null)
      if (parseFloat(fiatAmountInUsd) > 0) {
        const conversionRate = await getConversionRateKado({
          from: 'USD',
          to: selectedCurrency,
        })
        if (parseFloat(fiatAmountInUsd) < 10) {
          setError(
            `Amount should be at least ${(10 * conversionRate).toFixed(2)} ${selectedCurrency}`,
          )
        } else if (parseFloat(fiatAmountInUsd) > 10000) {
          setError(
            `Amount exceeds your daily limit of ${(10000 * conversionRate).toFixed(
              2,
            )} ${selectedCurrency}`,
          )
        }
      }
    }
    setLimitError()
  }, [fiatAmountInUsd, selectedCurrency])

  useEffect(() => {
    if (!provider && selectedAsset) {
      if (selectedAsset.symbol === 'SEI') {
        setProvider(ServiceProviderEnum.TRANSAK)
        setProvidersQuote({
          [ServiceProviderEnum.TRANSAK]: {},
          [ServiceProviderEnum.KADO]: {},
          [ServiceProviderEnum.MOONPAY]: {},
        })
      } else {
        setProvider(ServiceProviderEnum.KADO)
        setProvidersQuote({
          [ServiceProviderEnum.KADO]: {},
        })
      }
    }
  }, [provider, selectedAsset])

  useEffect(() => {
    if (!userSelectedProvider) {
      let maxProvider: ServiceProviderEnum | null = null
      let maxCrypto = 0

      for (const key in providersQuote) {
        const provider = key as ServiceProviderEnum
        const cryptoValue = parseFloat(providersQuote[provider]?.crypto || '0')

        if (cryptoValue > maxCrypto) {
          maxCrypto = cryptoValue
          maxProvider = provider
        }
      }

      if (maxProvider) {
        setProvider(maxProvider)
      }
    }
  }, [providersQuote, userSelectedProvider])

  useEffect(() => {
    if (provider) {
      setGetAssetAmount(providersQuote[provider]?.crypto || '0')
    }
  }, [provider, providersQuote])

  const getQueryParams = useCallback(
    (val: ServiceProviderEnum) => {
      switch (val) {
        case ServiceProviderEnum.KADO:
          return {
            apiKey: process.env.KADO_API_KEY,
            onPayAmount: payFiatAmount,
            onPayCurrency: selectedCurrency,
            onRevCurrency: selectedAsset?.symbol,
            onToAddress: selectedAddress,
            network: selectedAsset?.origin,
            product: 'BUY',
            productList: 'BUY',
            mode: 'minimal',
            theme: 'dark',
          }
        case ServiceProviderEnum.TRANSAK:
          return {
            apiKey: process.env.TRANSAK_API_KEY,
            fiatAmount: payFiatAmount,
            fiatCurrency: selectedCurrency,
            isBuyOrSell: 'BUY',
            network: 'sei',
            paymentMethod: 'credit_debit_card',
            cryptoCurrencyCode: selectedAsset?.symbol,
            walletAddress: selectedAddress,
          }
        case ServiceProviderEnum.MOONPAY:
          return {
            apiKey: process.env.MOONPAY_API_KEY,
            currencyCode: `${selectedAsset?.symbol?.toLowerCase()}_sei`,
            walletAddress: selectedAddress,
            baseCurrencyCode: selectedCurrency?.toLowerCase(),
            baseCurrencyAmount: payFiatAmount,
          }
      }
    },
    [
      payFiatAmount,
      selectedAddress,
      selectedAsset?.origin,
      selectedAsset?.symbol,
      selectedCurrency,
    ],
  )

  const handleBuyClick = useCallback(() => {
    if (provider) {
      const params = getQueryParams(provider)

      const queryParams = convertObjInQueryParams(params)
      const url = `${ProviderDetails[provider].url}?${queryParams}`
      window.open(url, '_blank')
    }
  }, [provider, getQueryParams])

  return (
    <>
      {selectedAsset ? (
        <>
          <PageHeader>
            <ArrowLeft
              size={48}
              className='text-monochrome cursor-pointer p-3'
              onClick={() => navigate(-1)}
            />

            <WalletButton
              className='absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2'
              walletName={walletName}
              showWalletAvatar={true}
              walletAvatar={walletAvatar}
              showDropdown={true}
              handleDropdownClick={handleOpenWalletSheet}
            />
          </PageHeader>

          <div className='flex flex-col gap-3 p-6'>
            <div className='w-full bg-secondary-100 rounded-2xl p-5 flex flex-col gap-3'>
              <div className='flex justify-between items-center'>
                <p className='text-muted-foreground text-sm font-medium !leading-[22.4px]'>
                  You pay
                </p>
              </div>

              <div className='flex rounded-2xl justify-between w-full items-center gap-2 h-[34px] p-[2px]'>
                <input
                  value={payFiatAmount}
                  onChange={(e) => {
                    setError(null)
                    const val = e.target.value
                    const amount = removeLeadingZeroes(val)
                    if (parseFloat(amount) < 0) {
                      setError('Please enter a valid positive number.')
                    } else {
                      setPayFiatAmount(amount)
                    }
                  }}
                  type='number'
                  placeholder='0'
                  ref={inputAmountRef}
                  className={classNames(
                    'bg-transparent outline-none w-full text-left placeholder:font-bold placeholder:text-[24px] placeholder:text-monochrome font-bold !leading-[32.4px] caret-accent-blue',
                    {
                      'text-destructive-100': !!error,
                      'text-monochrome': !error,
                      'text-[24px]': payFiatAmount.length < 12,
                      'text-[22px]': payFiatAmount.length >= 12 && payFiatAmount.length < 15,
                      'text-[20px]': payFiatAmount.length >= 15 && payFiatAmount.length < 18,
                      'text-[18px]': payFiatAmount.length >= 18,
                    },
                  )}
                />
                <button
                  className={classNames(
                    'flex justify-end items-center gap-2 shrink-0 py-1 px-1.5 rounded-[40px] bg-secondary-300 hover:bg-secondary-400',
                  )}
                  onClick={() => setShowSelectCurrencySheet(true)}
                >
                  <img
                    src={getCountryLogo(selectedCurrency)}
                    className='w-[24px] h-[24px] rounded-full'
                  />

                  <p className={classNames('dark:text-white-100 text-sm font-medium')}>
                    {selectedCurrency}
                  </p>
                  <CaretDown size={14} className='dark:text-white-100' />
                </button>
              </div>
              {error && (
                <Text size='xs' className='text-red-600 dark:text-red-300 pt-1.5'>
                  {error}
                </Text>
              )}
              <div className='flex gap-1.5 mt-1'>
                {[100, 500, 1000].map((element) => {
                  return (
                    <button
                      key={element}
                      onClick={() => setPayFiatAmount(element.toString())}
                      className='rounded-full bg-secondary-200 px-[6px] py-0.5 font-medium text-xs hover:bg-secondary-300 dark:hover:text-white-100 hover:text-black-100 !leading-[19.2px] text-muted-foreground'
                    >
                      {element}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className='w-full bg-secondary-100 rounded-2xl p-5 flex flex-col gap-3'>
              <div className='flex justify-between items-center'>
                <p className='text-muted-foreground text-sm font-medium !leading-[22.4px]'>
                  You get
                </p>
              </div>

              <div className='flex rounded-2xl justify-between w-full items-center gap-2 h-[34px] p-[2px]'>
                {loadingQuote ? (
                  <div className='w-[50px] h-full z-0'>
                    <Skeleton className='rounded-full bg-gray-50 dark:bg-gray-800' />
                  </div>
                ) : (
                  <input
                    value={
                      parseFloat(getAssetAmount) * 10000 > 0
                        ? formatTokenAmount(getAssetAmount, undefined, 4)
                        : getAssetAmount
                    }
                    placeholder='0'
                    className={classNames(
                      'bg-transparent outline-none w-full text-left placeholder:font-bold placeholder:text-[24px] placeholder:text-monochrome font-bold !leading-[32.4px] caret-accent-blue text-[24px] text-monochrome',
                    )}
                    readOnly={true}
                  />
                )}
                <button
                  className={classNames(
                    'flex justify-end items-center gap-2 shrink-0 py-1 px-1.5 rounded-[40px] bg-secondary-300 hover:bg-secondary-400',
                  )}
                  onClick={() => setShowSelectTokenSheet(true)}
                >
                  <img src={selectedAsset?.assetImg} className='w-[24px] h-[24px] rounded-full' />

                  <p className={classNames('dark:text-white-100 text-sm font-medium')}>
                    {selectedAsset?.symbol}
                  </p>
                  <CaretDown size={14} className='dark:text-white-100' />
                </button>
              </div>
            </div>

            <div className='w-full flex justify-between mt-2'>
              <Text size='sm' color='text-muted-foreground' className='font-medium'>
                Provider
              </Text>
              <div
                className={cn('flex items-center gap-1', {
                  'cursor-pointer': multipleProvider,
                })}
                onClick={() => setShowSelectProviderSheet(true)}
              >
                <img
                  src={provider ? ProviderDetails[provider].image : Images.Logos.GenericDark}
                  className='w-5 h-5'
                />
                <Text size='sm' color='text-monochrome' className='font-medium'>
                  {provider ? ProviderDetails[provider].name : ''}
                </Text>
                {multipleProvider ? <CaretDown size={14} className='text-secondary-600' /> : null}
              </div>
            </div>

            <Button
              className={classNames('w-full mt-3', {
                '!bg-red-300 text-white-100': error,
              })}
              onClick={handleBuyClick}
              disabled={
                !new BigNumber(getAssetAmount).isGreaterThan(0) || loadingQuote || isString(error)
              }
            >
              {!new BigNumber(getAssetAmount).isGreaterThan(0) ? (
                'Enter amount'
              ) : (
                <div className='flex items-center gap-1.5'>
                  <ArrowSquareOut size={20} weight='bold' />
                  <span>Buy</span>
                </div>
              )}
            </Button>
          </div>
        </>
      ) : null}

      <SelectCurrencySheet
        isVisible={showSelectCurrencySheet}
        onClose={() => setShowSelectCurrencySheet(false)}
        onCurrencySelect={(currency) => {
          setSelectedCurrency(currency)
          setUserSelectedProvider(false)
          setProvider(undefined)
          setProvidersQuote({})
          setShowSelectCurrencySheet(false)
          if (inputAmountRef.current) {
            ;(inputAmountRef.current as HTMLElement).focus()
          }
        }}
      />

      <SelectAssetSheet
        isVisible={showSelectTokenSheet}
        onClose={() => {
          if (!selectedAsset) {
            navigate(-1)
          } else {
            setShowSelectTokenSheet(false)
          }
        }}
        onAssetSelect={(asset) => {
          setSelectedAsset(asset)
          setUserSelectedProvider(false)
          setProvider(undefined)
          setProvidersQuote({})
          setShowSelectTokenSheet(false)
          if (inputAmountRef.current) {
            ;(inputAmountRef.current as HTMLElement).focus()
          }
        }}
      />

      <SelectWallet
        isVisible={showSelectWallet}
        onClose={() => {
          setShowSelectWallet(false)
          navigate('/home')
        }}
        title='Wallets'
      />

      <SelectProvider
        isVisible={showSelectProviderSheet}
        onClose={() => setShowSelectProviderSheet(false)}
        onProviderSelect={(val: ServiceProviderEnum) => {
          setProvider(val)
          setUserSelectedProvider(true)
          setShowSelectProviderSheet(false)
        }}
        providersQuote={providersQuote}
        asset={selectedAsset}
      />
    </>
  )
}

export default Buy
