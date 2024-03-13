import HCaptcha from '@hcaptcha/react-hcaptcha'
import {
  Faucet,
  useActiveChain,
  useChainInfo,
  useGetFaucet,
  useInvalidateTokenBalances,
} from '@leapwallet/cosmos-wallet-hooks'
import { getBlockChainFromAddress } from '@leapwallet/cosmos-wallet-sdk'
import { useMutation } from '@tanstack/react-query'
import CssLoader from 'components/css-loader/CssLoader'
import { Recaptcha } from 'components/re-captcha'
import Text from 'components/text'
import { RECAPTCHA_CHAINS } from 'config/config'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import React, { useEffect, useRef } from 'react'
import { Colors } from 'theme/colors'
import { isCompassWallet } from 'utils/isCompassWallet'

dayjs.extend(utc)

type RequestFaucetProps = {
  address: string
  // eslint-disable-next-line no-unused-vars
  setShowFaucetResp: (data: { msg: string; status: 'success' | 'fail' | null }) => void
}

export default function RequestFaucet({ address, setShowFaucetResp }: RequestFaucetProps) {
  const chain = useChainInfo()
  const activeChain = useActiveChain()
  const invalidateBalances = useInvalidateTokenBalances()
  const hCaptchaRef = useRef<HCaptcha>(null)
  const reCaptchaRef = useRef<Recaptcha>(null)

  let faucetDetails: Faucet = useGetFaucet(chain?.testnetChainId ?? chain?.chainId ?? '')

  faucetDetails = RECAPTCHA_CHAINS.includes(activeChain)
    ? {
        title: 'Pryzm Testnet Faucet',
        description: 'Claim Pryzm testnet tokens directly from Leap Wallet',
        url: 'https://testnet-pryzmatics.pryzm.zone/pryzmatics/faucet/claim',
        network: 'testnet',
        security: {
          type: 'recaptcha',
          key: process.env.PRYZM_RECAPTCHA_KEY ?? '',
        },
        method: 'GET',
        payloadResolution: {
          address: '${walletAddress}',
          recaptcha_response: '${captchaKey}',
        },
      }
    : faucetDetails

  const {
    data: faucetResponse,
    mutate: requestTokens,
    isLoading,
  } = useMutation(
    async (args: Record<string, string>) => {
      const { method } = faucetDetails
      // Resolve payload
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let payload: Record<string, any> = {}
      if (faucetDetails.payloadResolution) {
        payload = Object.entries(faucetDetails.payloadResolution).reduce((acc, val) => {
          let resolve
          switch (val[1]) {
            case '${walletAddress}':
              resolve = address
              break
            case '${captchaKey}':
              resolve = args['captchaKey']
              break
            default:
              resolve = val[1]
              break
          }
          return { ...acc, [val[0]]: resolve }
        }, {})
      }
      if (method === 'POST') {
        if (faucetDetails.payloadSchema?.type === 'form-data') {
          const body = new FormData()
          Object.keys(args).forEach((field: string) => {
            body.append(field, payload[field])
          })
          return fetch(faucetDetails.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            body: body,
          })
        } else {
          const headers: { 'Content-Type': string; Authorization?: string } = {
            'Content-Type': 'application/json',
          }

          if (chain.chainId === 'constantine-3') {
            headers['Authorization'] = `Basic ${Buffer.from(
              `${process.env.ARCHWAY_FAUCET_USERNAME}:${process.env.ARCHWAY_FAUCET_PASSWORD}`,
            ).toString('base64')}`
          }

          return fetch(faucetDetails.url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
          })
        }
      } else {
        const url = new URL(faucetDetails.url)
        Object.keys(args).forEach((field: string) =>
          url.searchParams.set(field, encodeURIComponent(args[field])),
        )
        return fetch(url.toString())
      }
    },
    {
      cacheTime: 0,
    },
  )

  // TODO:- handle the case where there are more properties on faucetDetails.payloadSchema.schema
  // TODO:- in future when we have configuration for multiple faucets, add a responseSchema to the faucet config
  const handleSubmit = async () => {
    try {
      if (getBlockChainFromAddress(address) === 'sei') {
        window.open('https://atlantic-2.app.sei.io/faucet', '_blank')
        return
      }

      if (RECAPTCHA_CHAINS.includes(activeChain)) {
        reCaptchaRef.current?.execute()
        return
      }

      const result = await hCaptchaRef.current?.execute({ async: true })
      if (!result) {
        throw new Error('could not get hCaptcha response')
      }

      requestTokens({
        address,
        captchaKey: result.response,
      })
    } catch (error) {
      setShowFaucetResp({
        status: 'fail',
        msg: 'Failed to verify captcha. Please try again.',
      })
    }
  }

  const handleRecaptchaVerify = (token: string) => {
    requestTokens({
      address,
      recaptcha_response: token,
    })
  }

  useEffect(() => {
    const fn = async () => {
      if (faucetResponse?.ok || faucetResponse?.status) {
        let data: Record<string, unknown> | null = {}
        try {
          data = await faucetResponse.json()
        } catch (e) {
          setShowFaucetResp({
            status: 'fail',
            msg: 'Something went wrong. Please try again.',
          })
        }

        if (faucetResponse.status === 200 && data?.status !== 'fail') {
          invalidateBalances(activeChain)
          setShowFaucetResp({
            status: 'success',
            msg: 'Your wallet will receive the tokens shortly',
          })
        } else {
          setShowFaucetResp({
            status: 'fail',
            msg: (data?.message ?? data?.error) as string,
          })
        }
      }
    }

    fn()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faucetResponse, invalidateBalances])

  if (!faucetDetails) return null

  return (
    <>
      <div className='h-captcha' data-sitekey={faucetDetails.security?.key} data-theme='dark' />
      <button
        className='relative rounded-2xl w-[344px] m-auto mb-4 p-4 flex items-center overflow-hidden'
        style={{
          background: isCompassWallet() ? Colors.compassGradient : chain.theme.gradient,
          backgroundSize: 'contain',
        }}
        onClick={handleSubmit}
      >
        <img
          src={chain.chainSymbolImageUrl}
          alt='chain logo'
          className='absolute z-0 right-0 opacity-20 h-full w-fit'
        />
        {isLoading ? (
          <>
            <div
              className='w-10 m-w-10 h-10 rounded-full relative flex items-center justify-center mr-4'
              style={{
                backgroundColor: Colors.getChainColor(activeChain),
              }}
            >
              <CssLoader className='absolute mt-0' loaderClass='white' style={{ marginTop: 0 }} />
            </div>
            <Text size='sm' color='dark:text-white-100 text-gray-800 font-black'>
              Claim in progress
            </Text>
          </>
        ) : (
          <>
            <img
              src={chain.chainSymbolImageUrl}
              alt='chain logo'
              width='24'
              height='24'
              className='object-contain rounded-full h-10 w-10 mr-4 m-w-10'
              style={{
                border: `8px solid ${Colors.getChainColor(activeChain)}`,
              }}
            />
            <div>
              <Text size='sm' color='dark:text-white-100 text-gray-800 font-black'>
                {faucetDetails.title}
              </Text>
              <Text
                size='xs'
                color='dark:text-gray-400 text-gray-700 font-medium mt-[2px] text-left'
              >
                {faucetDetails.description.includes('Leap')
                  ? faucetDetails.description.replace('Leap', () => {
                      if (isCompassWallet()) {
                        return 'Compass'
                      } else {
                        return 'Leap'
                      }
                    })
                  : faucetDetails.description}
              </Text>
            </div>
          </>
        )}
      </button>

      <form>
        {RECAPTCHA_CHAINS.includes(activeChain) ? (
          <Recaptcha
            elementID='g-recaptcha'
            className='g-recaptcha'
            ref={reCaptchaRef}
            sitekey={faucetDetails.security?.key ?? ''}
            size='invisible'
            theme='dark'
            render='explicit'
            verifyCallback={handleRecaptchaVerify}
            badge='none'
            type='image'
            tabindex='0'
            onloadCallbackName='onloadCallback'
            verifyCallbackName='verifyCallback'
            expiredCallbackName='expiredCallback'
            action='faucet'
          />
        ) : (
          <HCaptcha
            ref={hCaptchaRef}
            sitekey={faucetDetails.security?.key ?? ''}
            size='invisible'
            theme='dark'
          />
        )}
      </form>
    </>
  )
}
