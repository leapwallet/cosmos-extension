import { formatTokenAmount, useDebounce } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, Header, HeaderActionType, ThemeName, useTheme } from '@leapwallet/leap-ui'
import { ArrowSquareOut } from '@phosphor-icons/react'
import { captureException } from '@sentry/react'
import BigNumber from 'bignumber.js'
import PopupLayout from 'components/layout/popup-layout'
import Text from 'components/text'
import { ButtonName, ButtonType, EventName, OnRampProvider, PageName } from 'config/analytics'
import { motion } from 'framer-motion'
import { usePageView } from 'hooks/analytics/usePageView'
import { AssetProps } from 'hooks/kado/useGetSupportedAssets'
import { useChainInfos } from 'hooks/useChainInfos'
import { getConversionRateKado, getQuoteKado } from 'hooks/useGetKadoDetails'
import useQuery from 'hooks/useQuery'
import { useThemeColor } from 'hooks/utility/useThemeColor'
import { useAddress } from 'hooks/wallet/useAddress'
import kadoDarkLogo from 'images/logos/Kado-dark.svg'
import kadoLightLogo from 'images/logos/Kado-light.svg'
import { isString } from 'markdown-it/lib/common/utils'
import mixpanel from 'mixpanel-browser'
import { convertObjInQueryParams } from 'pages/home/utils'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useLocation, useNavigate } from 'react-router'
import { Colors } from 'theme/colors'
import { getCountryLogo } from 'utils/getCountryLogo'
import { isCompassWallet } from 'utils/isCompassWallet'
import { removeLeadingZeroes } from 'utils/strings'

import SelectAssetSheet from './components/SelectAssetSheet'
import { SelectAssetButton, SelectCurrencyButton } from './components/SelectButton'
import SelectCurrencySheet from './components/SelectCurrencySheet'
import useWallets = Wallet.useWallets
import { Wallet } from 'hooks/wallet/useWallet'

export enum ServiceProviderEnum {
  KADO = 'kado',
}

export enum ServiceProviderBaseUrlEnum {
  KADO = 'https://app.kado.money',
}

const Buy = () => {
  const pageViewSource = useQuery().get('pageSource') ?? undefined
  const pageViewAdditionalProperties = useMemo(
    () => ({
      pageViewSource,
    }),
    [pageViewSource],
  )
  usePageView(PageName.OnRampQuotePreview, true, pageViewAdditionalProperties)
  const themeColor = useThemeColor()
  const { theme } = useTheme()

  const navigate = useNavigate()
  const location = useLocation()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const asset: any = location.state

  const [showSelectCurrencySheet, setShowSelectCurrencySheet] = useState(false)
  const [showSelectTokenSheet, setShowSelectTokenSheet] = useState(false)

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

  useEffect(() => {
    async function getQuote() {
      try {
        setLoadingQuote(true)
        const quote = await getQuoteKado({
          transactionType: 'buy',
          fiatMethod: 'credit_card',
          partner: 'fortress',
          amount: new BigNumber(debouncedPayAmount).toNumber(),
          currency: selectedCurrency,
          asset: selectedAsset?.symbol ?? 'ATOM',
          blockchain: selectedAsset?.origin.toLowerCase() ?? 'cosmos hub',
        })
        if (quote.success) {
          setGetAssetAmount(quote?.data?.quote?.receiveUnitCountAfterFees?.amount ?? '0')
        } else {
          setGetAssetAmount('0')
        }
      } catch (error) {
        captureException(error)

        const message = error instanceof Error ? error.message : 'An error occurred'
        if (message.toLowerCase().includes('timeout')) {
          setError('Request timed out. Unable to fetch quote.')
        } else {
          setError(message)
        }
      } finally {
        setLoadingQuote(false)
      }
    }
    if (debouncedPayAmount && new BigNumber(debouncedPayAmount).isGreaterThan('0')) {
      getQuote()
    } else {
      setGetAssetAmount('0')
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
        chainName: chain.chainName,
        chainId: chain.chainId,
        chainSymbolImageUrl: chain.chainSymbolImageUrl,
        assetImg: asset.img,
        origin: chain.chainName,
      })
    } else {
      setShowSelectTokenSheet(true)
    }
  }, [asset, chains, pageViewSource])

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

  const trackCTAEvent = useCallback(
    (amount: string, asset: AssetProps, currency: string) => {
      mixpanel.track(EventName.ButtonClick, {
        buttonType: ButtonType.ONRAMP,
        buttonName: ButtonName.ONRAMP_PROVIDER_REDIRECTION,
        onRampProvider: OnRampProvider.KADO,
        provider: ServiceProviderEnum.KADO,
        buyToken: asset?.symbol,
        buyTokenNetwork: asset?.origin,
        chainName: asset?.chainName,
        chainId: asset?.chainId,
        fiatCurrency: currency,
        fiatAmountInUSD: new BigNumber(amount).toNumber(),
        fiatAmount: new BigNumber(debouncedPayAmount).toNumber(),
        transferToSelf: selectedAddressIsSelf,
        receiverAddress: selectedAddress,
      })
    },
    [debouncedPayAmount, selectedAddress, selectedAddressIsSelf],
  )

  const handleBuyClick = useCallback(() => {
    const params = {
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

    const queryParams = convertObjInQueryParams(params)
    const url = `${ServiceProviderBaseUrlEnum.KADO}?${queryParams}`
    window.open(url, '_blank')
    if (selectedAsset) {
      trackCTAEvent(fiatAmountInUsd, selectedAsset, selectedCurrency)
    }
  }, [
    fiatAmountInUsd,
    payFiatAmount,
    selectedAddress,
    selectedAsset,
    selectedCurrency,
    trackCTAEvent,
  ])

  return (
    <motion.div className='relative h-full w-full'>
      <PopupLayout
        header={
          <Header
            action={{
              onClick: () => navigate(-1),
              type: HeaderActionType.BACK,
            }}
            imgSrc={undefined}
            title='Buy'
            topColor={themeColor}
          />
        }
      >
        <div className='flex flex-col justify-between' style={{ height: 'calc(100% - 72px)' }}>
          <div>
            <div className='p-4 space-y-4 overflow-y-auto'>
              <motion.div className={`card-container dark:bg-gray-950`}>
                <div className='flex w-full items-center justify-between mb-3'>
                  <Text size='sm' className='text-gray-600 dark:text-gray-200 font-bold'>
                    You Pay
                  </Text>
                </div>

                <div
                  className={`border border-transparent bg-gray-50 dark:bg-gray-900 rounded-lg focus-within:${
                    error ? 'border-red-300' : 'border-green-600'
                  } dark:focus-within:${
                    error ? 'border-red-300' : 'border-green-600'
                  } flex w-full justify-between items-center px-4`}
                >
                  <input
                    className=' bg-gray-50 dark:bg-gray-900 text-md outline-none font-bold text-black-100 dark:text-white-100 py-2'
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
                    placeholder={'Amount'}
                    ref={inputAmountRef}
                  />
                  <SelectCurrencyButton
                    onClick={() => setShowSelectCurrencySheet(true)}
                    logo={getCountryLogo(selectedCurrency)}
                    title={selectedCurrency}
                  />
                </div>
                {error && (
                  <Text size='xs' className='text-red-600 dark:text-red-300 pt-1.5'>
                    {error}
                  </Text>
                )}
              </motion.div>

              <motion.div className={`card-container dark:bg-gray-950`}>
                <div className='flex w-full items-center justify-between mb-3'>
                  <Text size='sm' className='text-gray-600 dark:text-gray-200 font-bold'>
                    You Get
                  </Text>
                </div>

                {selectedAsset && (
                  <div className='border border-gray-50 dark:border-gray-900 bg-gray-50 dark:bg-gray-900 rounded-lg flex w-full justify-between items-center px-4'>
                    {!loadingQuote && (
                      <Text size='md' className='font-bold text-black-100 dark:text-white-100'>
                        {parseFloat(getAssetAmount) * 10000 > 0
                          ? formatTokenAmount(getAssetAmount, undefined, 4)
                          : getAssetAmount}
                      </Text>
                    )}
                    {loadingQuote && (
                      <div className='w-[50px] z-0'>
                        <Skeleton className='rounded-full bg-gray-50 dark:bg-gray-800' />
                      </div>
                    )}
                    <SelectAssetButton
                      onClick={() => setShowSelectTokenSheet(true)}
                      logo={selectedAsset.assetImg}
                      chainImg={selectedAsset.chainSymbolImageUrl}
                      title={selectedAsset.symbol}
                      subtitle={selectedAsset.chainName}
                    />
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          <div className='mx-4 mt-auto mb-4'>
            <div className='flex items-center justify-center'>
              <Text
                size='sm'
                className='text-gray-600 dark:text-gray-200 text-center font-extrabold'
              >
                Powered by Kado
              </Text>
              <img
                src={theme === ThemeName.DARK ? kadoLightLogo : kadoDarkLogo}
                className='w-[28px] h-[28px] rounded-full dark:border-[#333333] border-[#cccccc]'
              />
            </div>
            <div className='flex items-center justify-center mt-auto'>
              <Text size='xs' className='text-gray-600 dark:text-gray-200 text-center mb-2'>
                You&apos;ll be redirected to Kado&apos;s website for this transaction
              </Text>
            </div>
            <div className='flex w-full justify-center'>
              <Buttons.Generic
                size='normal'
                color={error ? '#FF707E' : !isCompassWallet() ? '#29A874' : Colors.compassPrimary}
                onClick={handleBuyClick}
                disabled={
                  !new BigNumber(getAssetAmount).isGreaterThan(0) || loadingQuote || isString(error)
                }
              >
                <div className='flex items-center'>
                  <span>Buy</span>
                  <ArrowSquareOut size={16} weight='bold' className='ml-1.5' />
                </div>
              </Buttons.Generic>
            </div>
          </div>
        </div>
      </PopupLayout>

      <SelectCurrencySheet
        isVisible={showSelectCurrencySheet}
        onClose={() => setShowSelectCurrencySheet(false)}
        onCurrencySelect={(currency) => {
          setSelectedCurrency(currency)
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
          setShowSelectTokenSheet(false)
          if (inputAmountRef.current) {
            ;(inputAmountRef.current as HTMLElement).focus()
          }
        }}
      />
    </motion.div>
  )
}

export default Buy
