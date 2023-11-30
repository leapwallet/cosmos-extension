import { useChainApis } from '@leapwallet/cosmos-wallet-hooks'
import { SUPPORTED_METHODS } from '@leapwallet/cosmos-wallet-provider/dist/provider/messaging/requester'
import { ChainInfo, Sscrt, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, GenericCard } from '@leapwallet/leap-ui'
import { captureException } from '@sentry/react'
import { AxiosError } from 'axios'
import classNames from 'classnames'
import { Divider, Key, Value } from 'components/dapp'
import { ErrorCard } from 'components/ErrorCard'
import { LoaderAnimation } from 'components/loader/Loader'
import Text from 'components/text'
import { BG_RESPONSE, SUGGEST_TOKEN } from 'config/storage-keys'
import { decodeChainIdToChain } from 'extension-scripts/utils'
import { useCreateViewingKey, verifyViewingKey } from 'hooks/secret/useCreateViewingKey'
import { useChainInfos } from 'hooks/useChainInfos'
import { useSetBetaCW20Tokens, useSetBetaSnip20Tokens } from 'hooks/useSetBetaCW20Tokens'
import React, { useEffect, useRef, useState } from 'react'
import { Colors } from 'theme/colors'
import { getContractInfo } from 'utils/getContractInfo'
import { isCompassWallet } from 'utils/isCompassWallet'
import browser from 'webextension-polyfill'

export default function AddSecretToken() {
  const [advancedFeature, setAdvancedFeature] = useState(false)
  const [customKey, setCustomKey] = useState('')
  const { lcdUrl = '' } = useChainApis()

  const [isVerifying, setIsVerifying] = useState(false)
  const [isCustomKeyError, setIsCustomKeyError] = useState(false)
  const [contractInfo, setContractInfo] = useState({
    decimals: 0,
    name: '',
    symbol: '',
  })

  const createViewingKey = useCreateViewingKey()
  const [payload, setPayload] = useState({
    contractAddress: '',
    address: '',
    viewingKey: '',
    type: '',
    chainId: 'secret-4',
  })
  const isUpdateSecret20Type = payload.type !== SUPPORTED_METHODS.SUGGEST_CW20_TOKEN

  const chainInfos = useChainInfos()
  const [isFetching, setIsFetching] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const chainInfoRef = useRef<ChainInfo>()
  const setBetaCW20Tokens = useSetBetaCW20Tokens()
  const setSnip20Tokens = useSetBetaSnip20Tokens()

  const handleCancel = async () => {
    await browser.storage.local.set({ [BG_RESPONSE]: { error: 'Rejected by the user.' } })
    setTimeout(async () => {
      await browser.storage.local.remove([SUGGEST_TOKEN])
      await browser.storage.local.remove(BG_RESPONSE)
      window.close()
    }, 10)
  }

  useEffect(() => {
    window.addEventListener('beforeunload', handleCancel)
    browser.storage.local.remove(BG_RESPONSE)
    return () => {
      window.removeEventListener('beforeunload', handleCancel)
    }
  }, [])

  useEffect(() => {
    browser.storage.local.get([SUGGEST_TOKEN]).then(async (res) => {
      const _payload = res[SUGGEST_TOKEN]
      const chainIdToChain = await decodeChainIdToChain()
      const chain = chainIdToChain[_payload.chainId]
      const chainInfo = chainInfos[chain as SupportedChain]
      chainInfoRef.current = chainInfo

      if (_payload && chainInfo.apis.rest) {
        try {
          setIsFetching(true)
          setPayload(_payload)
          setError('')

          if (_payload.type !== SUPPORTED_METHODS.SUGGEST_CW20_TOKEN) {
            const sscrt = Sscrt.create(chainInfo.apis.rest, _payload.chainId, _payload.address)
            const resp = await sscrt.getTokenParams(_payload.contractAddress)

            if (resp.token_info) {
              setContractInfo(resp.token_info)
            }
          } else {
            const result = await getContractInfo(chainInfo.apis.rest, _payload.contractAddress)

            if (typeof result === 'string' && result.includes('Invalid')) {
              setError('Invalid Contract Address')
              return
            }

            setContractInfo({
              name: result.name,
              symbol: result.symbol,
              decimals: result.decimals,
            })
          }

          setIsFetching(false)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          setIsFetching(false)

          if (e instanceof AxiosError) {
            setError(e.response?.data?.message ?? e.message)
          } else {
            setError(e.message)
          }

          captureException(e)
        }
      }
    })
  }, [chainInfos])

  const verifyViewingKeyOnChange = async () => {
    setIsVerifying(true)
    const validKey = await verifyViewingKey(
      lcdUrl,
      customKey,
      payload.contractAddress,
      payload.address,
    )
    setIsCustomKeyError(!validKey)
    setIsVerifying(false)
    return validKey
  }

  const approveNewToken = async () => {
    if (isUpdateSecret20Type) {
      if (customKey) {
        const validKey = await verifyViewingKeyOnChange()
        if (!validKey) return
      }
      setIsLoading(true)

      await createViewingKey(
        chainInfoRef.current?.apis.rest ?? '',
        chainInfoRef.current?.chainId ?? '',
        payload.address,
        payload.contractAddress,
        payload.type === SUPPORTED_METHODS.UPDATE_SECRET20_VIEWING_KEY ||
          (advancedFeature && !!customKey),
        payload.viewingKey || customKey,
      )

      const newSnipToken = {
        name: contractInfo.symbol,
        symbol: payload.contractAddress,
        decimals: contractInfo.decimals,
        coinGeckoId: '',
        icon: '',
      }
      await setSnip20Tokens(payload.contractAddress, newSnipToken, chainInfos.secret.key)
    } else {
      setIsLoading(true)

      const chainIdToChain = await decodeChainIdToChain()
      const chain = chainIdToChain[payload.chainId]

      const cw20Token = {
        coinDenom: contractInfo.symbol,
        coinMinimalDenom: payload.contractAddress,
        coinDecimals: contractInfo.decimals,
        coinGeckoId: '',
        icon: '',
        chain,
      }

      window.removeEventListener('beforeunload', handleCancel)
      await setBetaCW20Tokens(payload.contractAddress, cw20Token, chain)
    }

    window.removeEventListener('beforeunload', handleCancel)
    await browser.storage.local.set({
      [BG_RESPONSE]: { data: 'Approved' },
    })
    setTimeout(async () => {
      await browser.storage.local.remove([SUGGEST_TOKEN])
      await browser.storage.local.remove(BG_RESPONSE)
      setIsLoading(false)
      window.close()
    }, 50)
  }

  return (
    <div className='flex justify-center items-center h-screen'>
      <div className='w-[400px] h-[600px] max-h-[600px]'>
        <div
          className='w-full h-1 rounded-t-2xl'
          style={{ backgroundColor: Colors.cosmosPrimary }}
        />
        <div className='relative h-full flex flex-col justify-between items-center pt-4 pb-10 px-7'>
          <div className='flex flex-col items-center'>
            <Text size='lg' className='font-bold mt-5'>
              Adding token
            </Text>
            <Text
              size='xs'
              className='font-bold text-center mt-[2px] max-w-[250px]'
              color='text-gray-800 dark:text-gray-600 mb-2'
            >
              This will allow this token to be viewed within{' '}
              {isCompassWallet() ? 'Compass' : 'Leap'} Wallet.
            </Text>

            <GenericCard
              title={<span className='text-[15px]'>Contract Address</span>}
              subtitle={<span className='break-all'>{payload.contractAddress ?? ''}</span>}
              className='h-[80px] py-8 my-5'
              img={null}
              size='sm'
              isRounded
            />

            {contractInfo && !isFetching && (
              <div className='flex flex-col gap-y-[10px] bg-white-100 dark:bg-gray-900 rounded-2xl p-4 w-full'>
                <Key>Coin Name</Key>
                <Value>{contractInfo.name ?? ''}</Value>
                {Divider}
                <Key>Coin Symbol</Key>
                <Value>{contractInfo.symbol ?? ''}</Value>
                {Divider}
                <Key>Coin Decimals</Key>
                <Value>{contractInfo.decimals ?? ''}</Value>
              </div>
            )}
          </div>

          {contractInfo && !isFetching && (
            <div className='my-4 w-full'>
              {advancedFeature && (
                <div
                  className={`relative w-full flex items-center border rounded-xl flex h-12 bg-white-100 dark:bg-gray-900 py-2 pl-5 pr-[10px] ${
                    isCustomKeyError && customKey ? 'border-red-300' : 'border-gray-500'
                  }`}
                >
                  <input
                    placeholder='viewing key'
                    className='flex flex-grow text-base dark:text-white-100 text-gray-400 outline-none bg-white-0 placeholder-gray-400::placeholder'
                    value={customKey}
                    onChange={(event) => setCustomKey(event.currentTarget.value)}
                    autoComplete='off'
                  />

                  {isVerifying ? (
                    <LoaderAnimation color={Colors.white100} className='h-6 y-6' />
                  ) : null}
                </div>
              )}

              {isCustomKeyError && customKey && (
                <Text size='sm' className='mt-1' color='text-red-300'>
                  Invalid Viewing key provided
                </Text>
              )}
            </div>
          )}

          <div className='w-full flex flex-col flex-1 justify-end items-center box-border'>
            {error ? (
              <div className='my-2'>
                <ErrorCard text={error} />
              </div>
            ) : null}

            {!isFetching ? (
              <>
                {isUpdateSecret20Type && (
                  <div className='flex mb-4 w-full items-center cursor-pointer ml-2'>
                    <input
                      className='h-4 w-4 border border-gray-300 rounded-xl'
                      type='checkbox'
                      value=''
                      checked={advancedFeature}
                      onChange={() => setAdvancedFeature(!advancedFeature)}
                      id='advancedFeature'
                    />
                    <label
                      className='form-check-label inline-block dark:text-white-100 text-gray-900 ml-2 text-md'
                      htmlFor='advancedFeature'
                    >
                      (Advanced) Import my own viewing key
                    </label>
                  </div>
                )}

                <div
                  className={classNames('flex flex-row justify-between w-full', {
                    'mb-6': error,
                  })}
                >
                  <Buttons.Generic
                    style={{ height: '48px', background: Colors.gray900, color: Colors.white100 }}
                    onClick={handleCancel}
                  >
                    Reject
                  </Buttons.Generic>
                  <Buttons.Generic
                    style={{
                      height: '48px',
                      background: Colors.cosmosPrimary,
                      color: Colors.white100,
                      cursor: 'pointer',
                    }}
                    className='ml-3 bg-gray-800'
                    onClick={approveNewToken}
                    disabled={
                      error?.length !== 0 ||
                      (isCustomKeyError && customKey?.length > 0) ||
                      !contractInfo.name
                    }
                  >
                    {isLoading || isVerifying ? (
                      <LoaderAnimation color={Colors.white100} />
                    ) : (
                      'Approve'
                    )}
                  </Buttons.Generic>
                </div>
              </>
            ) : (
              <LoaderAnimation color='#E18881' />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
