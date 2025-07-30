import { formatTokenAmount, useAddress, useDebounce } from '@leapwallet/cosmos-wallet-hooks'
import { pubKeyToEvmAddressToShow, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { ArrowLeft, ArrowSquareOut, CaretDown } from '@phosphor-icons/react'
import { captureException } from '@sentry/react'
import axios from 'axios'
import BigNumber from 'bignumber.js'
import { WalletButtonV2 } from 'components/button/WalletButtonV2'
import { PageHeader } from 'components/header/PageHeaderV2'
import { LoaderAnimation } from 'components/loader/Loader'
import Text from 'components/text'
import { Button } from 'components/ui/button'
import { PageName } from 'config/analytics'
import { LEAP_API_BASEURL } from 'config/config'
import CryptoJS from 'crypto-js'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { AssetProps } from 'hooks/swapped/useGetSupportedAssets'
import { useChainInfos } from 'hooks/useChainInfos'
import {
  getDefaultsOnramper,
  getPaymentMethodsOnramper,
  getProvidersOnramper,
  getQuoteOnramper,
  PaymentMethod,
  Provider,
  ProviderQuote,
} from 'hooks/useGetOnramperDetails'
import { getConversionRateKado } from 'hooks/useGetSwappedDetails'
import useQuery from 'hooks/useQuery'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { isString } from 'markdown-it/lib/common/utils'
import SelectWallet from 'pages/home/SelectWallet/v2'
import { convertObjInQueryParams } from 'pages/home/utils'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from 'utils/cn'
import { getCountryLogo } from 'utils/getCountryLogo'
import { imgOnError } from 'utils/imgOnError'
import { uiErrorTags } from 'utils/sentry'
import { removeLeadingZeroes, sliceWord } from 'utils/strings'

import SelectAssetSheet from './components/SelectAssetSheet'
import SelectCurrencySheet, { countryToCurrencyMap } from './components/SelectCurrencySheet'
import SelectPaymentSheet from './components/SelectPaymentSheet'
import SelectProviderSheet from './components/SelectProviderSheet'

export enum ServiceProviderEnum {
  ONRAMPER = 'onramper',
}

export enum ServiceProviderBaseUrlEnum {
  ONRAMPER = 'https://buy.onramper.com',
}

function generateSignature(secretKey: string, data: string): string {
  const hmac = CryptoJS.HmacSHA256(data, secretKey)
  return hmac.toString(CryptoJS.enc.Hex)
}

const Buy = () => {
  const { walletAvatar, walletName } = useWalletInfo()
  const [showSelectWallet, setShowSelectWallet] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[] | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)
  const [providers, setProviders] = useState<Provider[] | null>(null)
  const [availableProviders, setAvailableProviders] = useState<ProviderQuote[] | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<ProviderQuote | null>(null)
  const [showSelectPaymentMethodSheet, setShowSelectPaymentMethodSheet] = useState(false)
  const [showSelectProviderSheet, setShowSelectProviderSheet] = useState(false)
  const pageViewSource = useQuery().get('pageSource') ?? undefined
  const quoteRequestIdRef = useRef(0)
  const pageViewAdditionalProperties = useMemo(
    () => ({
      pageViewSource,
    }),
    [pageViewSource],
  )
  // usePageView(PageName.OnRampQuotePreview, true, pageViewAdditionalProperties)
  const defaultTokenLogo = useDefaultTokenLogo()

  const navigate = useNavigate()
  const location = useLocation()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const asset: any = location.state

  const [showSelectCurrencySheet, setShowSelectCurrencySheet] = useState(false)
  const [showSelectTokenSheet, setShowSelectTokenSheet] = useState(false)

  const [selectedCurrency, setSelectedCurrency] = useState('')
  const [selectedAsset, setSelectedAsset] = useState<AssetProps | undefined>(undefined)
  const selectedAddress = useAddress(selectedAsset?.chainKey)

  const [payFiatAmount, setPayFiatAmount] = useState<string>('0')
  const debouncedPayAmount = useDebounce<string>(payFiatAmount, 500)
  const [fiatAmountInUsd, setFiatAmountInUsd] = useState('0')
  const [getAssetAmount, setGetAssetAmount] = useState<string>('0')
  const [loadingQuote, setLoadingQuote] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputAmountRef = useRef(null)
  const chains = useChainInfos()

  const handleOpenWalletSheet = useCallback(() => setShowSelectWallet(true), [])

  useEffect(() => {
    async function getPaymentMethods() {
      const paymentMethods = await getPaymentMethodsOnramper({
        fiat_currency: selectedCurrency.toLowerCase(),
        crypto_currency: selectedAsset?.id ?? 'atom_cosmos',
      })
      setPaymentMethods(paymentMethods.message)
      setSelectedPaymentMethod(paymentMethods.message.length > 0 ? paymentMethods.message[0] : null)
    }
    getPaymentMethods()
  }, [selectedCurrency, selectedAsset])

  useEffect(() => {
    async function getProviders() {
      const providers = await getProvidersOnramper()
      setProviders(providers.message)
    }
    getProviders()
  }, [])

  useEffect(() => {
    async function getQuote() {
      const fetchId = ++quoteRequestIdRef.current
      try {
        setError(null)
        setLoadingQuote(true)
        const quote = await getQuoteOnramper({
          payment_method: selectedPaymentMethod?.paymentTypeId ?? '',
          fiat_amount: new BigNumber(debouncedPayAmount).toNumber(),
          fiat_currency: selectedCurrency.toLowerCase(),
          crypto_currency: selectedAsset?.id ?? 'atom_cosmos',
          network: selectedAsset?.origin ?? 'cosmos',
        })

        const availableQuotes = quote.filter((q) => (q.payout ?? 0) > 0)
        const ramps = availableQuotes.reduce((acc, q) => {
          const provider = providers?.find((item) => item.id === q.ramp)
          if (provider) {
            acc.push({ provider, quote: q })
          }
          return acc
        }, [] as ProviderQuote[])

        if (fetchId !== quoteRequestIdRef.current) return

        if (availableQuotes.length > 0) {
          setGetAssetAmount((availableQuotes[0].payout ?? 0).toString())
          setAvailableProviders(ramps)
          setSelectedProvider(ramps[0])
        } else {
          setGetAssetAmount('0')
          setError(
            'No onramp available for these details. Please select a different payment method, fiat or crypto',
          )
        }
      } catch (error) {
        if (fetchId !== quoteRequestIdRef.current) return
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
        if (fetchId === quoteRequestIdRef.current) {
          setLoadingQuote(false)
        }
      }
    }
    if (
      debouncedPayAmount &&
      selectedPaymentMethod?.paymentTypeId &&
      new BigNumber(debouncedPayAmount).isGreaterThan('0')
    ) {
      getQuote()
    } else {
      setGetAssetAmount('0')
    }
  }, [
    debouncedPayAmount,
    providers,
    selectedAsset,
    selectedCurrency,
    selectedPaymentMethod?.paymentTypeId,
  ])

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
        chainName: chain.chainName,
        chainId: chain.chainId,
        chainSymbolImageUrl: chain.chainSymbolImageUrl,
        assetImg: asset.img,
        origin: chain.chainName,
        chainKey: chain.key,
        tags: asset?.tags,
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
    async function getDefaults() {
      try {
        const res = await getDefaultsOnramper()
        setSelectedCurrency(res.message.source.toUpperCase())
        setPayFiatAmount(res.message.amount.toString())
      } catch (error) {
        setSelectedCurrency('USD')
        setPayFiatAmount('300')
      }
    }
    if (!selectedCurrency) {
      getDefaults()
    }
  }, [selectedCurrency])

  const handleBuyClick = useCallback(() => {
    const params = {
      apiKey: process.env.ONRAMPER_API_KEY,
      wallets: selectedAsset?.id + ':' + selectedAddress,
      skipTransactionScreen: true,
      txnType: 'buy',
      txnAmount: payFiatAmount,
      txnFiat: selectedCurrency,
      txnCrypto: selectedAsset?.id ?? '',
      txnPaymentMethod: selectedPaymentMethod?.paymentTypeId,
      txnOnramp: selectedProvider?.provider.id,
      txnRedirect: true,
    }
    const signature = generateSignature(
      process.env.ONRAMPER_SIGNING_SECRET ?? '',
      `wallets=${params.wallets}`,
    )
    const queryParams = convertObjInQueryParams(params)
    const url = `${ServiceProviderBaseUrlEnum.ONRAMPER}?${queryParams}&signature=${signature}`
    window.open(url, '_blank')
  }, [
    payFiatAmount,
    selectedAddress,
    selectedAsset?.id,
    selectedCurrency,
    selectedPaymentMethod?.paymentTypeId,
    selectedProvider?.provider.id,
  ])

  return (
    <>
      {selectedAsset ? (
        <>
          <PageHeader>
            <ArrowLeft
              size={36}
              className='text-monochrome cursor-pointer p-2'
              onClick={() => navigate(-1)}
            />

            <WalletButtonV2
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
                  className={cn(
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
                  className={cn(
                    'flex justify-end items-center gap-2 shrink-0 py-1 px-1.5 rounded-[40px] bg-secondary-300 hover:bg-secondary-400',
                  )}
                  onClick={() => setShowSelectCurrencySheet(true)}
                >
                  <img
                    src={getCountryLogo(selectedCurrency)}
                    className='w-[24px] h-[24px] rounded-full'
                  />

                  <p className={cn('dark:text-white-100 text-sm font-medium')}>
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
                      parseFloat(getAssetAmount) * 1000000 > 0
                        ? formatTokenAmount(getAssetAmount, undefined, 6)
                        : getAssetAmount
                    }
                    placeholder='0'
                    className={cn(
                      'bg-transparent outline-none w-full text-left placeholder:font-bold placeholder:text-[24px] placeholder:text-monochrome font-bold !leading-[32.4px] caret-accent-blue text-[24px] text-monochrome',
                    )}
                    readOnly={true}
                  />
                )}
                <button
                  className={cn(
                    'flex justify-end items-center gap-2 shrink-0 py-1 px-1.5 rounded-[40px] bg-secondary-300 hover:bg-secondary-400',
                  )}
                  onClick={() => setShowSelectTokenSheet(true)}
                >
                  <img
                    src={selectedAsset?.assetImg}
                    onError={imgOnError(defaultTokenLogo)}
                    className='w-[24px] h-[24px] rounded-full'
                  />

                  <p className={cn('dark:text-white-100 text-sm font-medium')}>
                    {selectedAsset?.symbol}
                  </p>
                  <CaretDown size={14} className='dark:text-white-100' />
                </button>
              </div>
            </div>

            {selectedPaymentMethod && (
              <div className='w-full flex justify-between mt-2'>
                <Text size='sm' color='text-muted-foreground' className='font-medium'>
                  Pay using
                </Text>
                <div
                  className={cn('flex items-center gap-1', {
                    'cursor-pointer': paymentMethods && paymentMethods.length > 1,
                  })}
                  onClick={() => {
                    if (paymentMethods && paymentMethods.length > 1) {
                      setShowSelectPaymentMethodSheet(true)
                    }
                  }}
                >
                  <img src={selectedPaymentMethod.icon} className='w-5 h-5' />
                  <Text size='sm' color='text-monochrome' className='font-medium'>
                    {sliceWord(selectedPaymentMethod.name, 15, 3)}
                  </Text>
                  {paymentMethods && paymentMethods.length > 1 && (
                    <CaretDown size={14} className='text-secondary-600' />
                  )}
                </div>
              </div>
            )}

            {selectedProvider && !error && (
              <div className='w-full flex justify-between mt-1'>
                <Text size='sm' color='text-muted-foreground' className='font-medium'>
                  Provider
                </Text>
                {loadingQuote ? (
                  <div className='flex items-center gap-0.5'>
                    <LoaderAnimation color='text-green-600' className='h-7 w-7' />
                    <Text size='sm' color='text-monochrome' className='font-medium'>
                      Fetching best quote...
                    </Text>
                  </div>
                ) : (
                  <div
                    className={cn('flex items-center gap-1', {
                      'cursor-pointer': availableProviders && availableProviders.length > 1,
                    })}
                    onClick={() => {
                      if (availableProviders && availableProviders.length > 1) {
                        setShowSelectProviderSheet(true)
                      }
                    }}
                  >
                    <img src={selectedProvider.provider.icon} className='w-5 h-5' />
                    <Text size='sm' color='text-monochrome' className='font-medium'>
                      {selectedProvider.provider.displayName}
                    </Text>
                    {availableProviders && availableProviders.length > 1 && (
                      <CaretDown size={14} className='text-secondary-600' />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className='w-full p-4 mt-auto sticky bottom-0 bg-secondary-100 '>
            <Button
              className={cn('w-full', {
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
        selectedCurrency={selectedCurrency}
        onClose={() => setShowSelectCurrencySheet(false)}
        onCurrencySelect={(currency) => {
          setSelectedCurrency(currency)
          setShowSelectCurrencySheet(false)
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
        title='Your Wallets'
      />
      <SelectAssetSheet
        isVisible={showSelectTokenSheet}
        selectedAsset={selectedAsset}
        onClose={() => {
          if (!selectedAsset) {
            navigate(-1)
          } else {
            setShowSelectTokenSheet(false)
          }
        }}
        onAssetSelect={(asset) => {
          setSelectedAsset(asset)
          setSelectedPaymentMethod(null)
          setShowSelectTokenSheet(false)
          if (inputAmountRef.current) {
            ;(inputAmountRef.current as HTMLElement).focus()
          }
        }}
      />
      {paymentMethods && selectedPaymentMethod && (
        <SelectPaymentSheet
          isVisible={showSelectPaymentMethodSheet}
          onClose={() => setShowSelectPaymentMethodSheet(false)}
          onPaymentSelect={(paymentMethod) => {
            setSelectedPaymentMethod(paymentMethod)
            setShowSelectPaymentMethodSheet(false)
          }}
          paymentMethods={paymentMethods}
          selectedPaymentMethod={selectedPaymentMethod}
        />
      )}
      {availableProviders && selectedProvider && (
        <SelectProviderSheet
          isVisible={showSelectProviderSheet}
          onClose={() => setShowSelectProviderSheet(false)}
          onProviderSelect={(provider) => {
            setSelectedProvider(provider)
            setGetAssetAmount(provider.quote.payout?.toString() ?? '0')
            setShowSelectProviderSheet(false)
          }}
          providers={availableProviders}
          selectedProvider={selectedProvider}
          asset={selectedAsset}
        />
      )}
    </>
  )
}

export default Buy
