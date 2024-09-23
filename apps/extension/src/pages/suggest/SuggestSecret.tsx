import {
  useGetChainApis,
  useGetChains,
  useSetBetaCW20Tokens,
  useSetBetaSnip20Tokens,
  useSnipDenoms,
} from '@leapwallet/cosmos-wallet-hooks'
import { SUPPORTED_METHODS } from '@leapwallet/cosmos-wallet-provider/dist/provider/messaging/requester'
import { Sscrt, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { captureException } from '@sentry/react'
import { AxiosError } from 'axios'
import { LoaderAnimation } from 'components/loader/Loader'
import Text from 'components/text'
import { BG_RESPONSE, SUGGEST_TOKEN } from 'config/storage-keys'
import { decodeChainIdToChain } from 'extension-scripts/utils'
import { useCreateViewingKey, verifyViewingKey } from 'hooks/secret/useCreateViewingKey'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { betaCW20DenomsStore, enabledCW20DenomsStore } from 'stores/denoms-store-instance'
import { rootBalanceStore } from 'stores/root-store'
import { Colors } from 'theme/colors'
import { getContractInfo } from 'utils/getContractInfo'
import { isCompassWallet } from 'utils/isCompassWallet'
import { isSidePanel } from 'utils/isSidePanel'
import Browser from 'webextension-polyfill'

import {
  ChildrenParams,
  Footer,
  FooterAction,
  Heading,
  SubHeading,
  SuggestContainer,
  TokenContractAddress,
  TokenContractInfo,
} from './components'

const SuggestSecret = observer(({ handleRejectBtnClick }: ChildrenParams) => {
  const chains = useGetChains()
  const createViewingKey = useCreateViewingKey()
  const secretTokens = useSnipDenoms()
  const navigate = useNavigate()
  const getChainApis = useGetChainApis('secret', 'mainnet', chains)
  const setBetaCW20Tokens = useSetBetaCW20Tokens()
  const setSnip20Tokens = useSetBetaSnip20Tokens()

  const [customKey, setCustomKey] = useState('')
  const [advancedFeature, setAdvancedFeature] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isCustomKeyError, setIsCustomKeyError] = useState(false)

  const [isFetching, setIsFetching] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [contractInfo, setContractInfo] = useState({
    decimals: 0,
    name: '',
    symbol: '',
  })

  const [payload, setPayload] = useState({
    contractAddress: '',
    address: '',
    viewingKey: '',
    type: '',
    chainId: 'secret-4',
  })
  const isUpdateSecret20Type = payload.type !== SUPPORTED_METHODS.SUGGEST_CW20_TOKEN

  useEffect(() => {
    Browser.storage.local.get([SUGGEST_TOKEN]).then(async (res) => {
      const _payload = res[SUGGEST_TOKEN]
      const chainIdToChain = await decodeChainIdToChain()
      const chain = chainIdToChain[_payload.chainId]
      const { lcdUrl } = getChainApis(false, chain as SupportedChain, 'mainnet')

      if (_payload && lcdUrl) {
        try {
          setIsFetching(true)
          setPayload(_payload)
          setError('')

          if (_payload.type !== SUPPORTED_METHODS.SUGGEST_CW20_TOKEN) {
            if (secretTokens?.[_payload.contractAddress]) {
              const denom = secretTokens[_payload.contractAddress]
              setContractInfo({
                name: denom.name,
                symbol: denom.symbol,
                decimals: denom.decimals,
              })
            } else {
              const sscrt = Sscrt.create(lcdUrl, _payload.chainId, _payload.address)
              const resp = await sscrt.getTokenParams(_payload.contractAddress)

              if (resp.token_info) {
                setContractInfo(resp.token_info)
              }
            }
          } else {
            const result = await getContractInfo(lcdUrl, _payload.contractAddress)

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
        } catch (e) {
          if (e instanceof AxiosError) {
            setError(e.response?.data?.message ?? e.message)
          } else {
            setError((e as Error).message)
          }

          captureException(e)
        } finally {
          setIsFetching(false)
        }
      }
    })
  }, [getChainApis, secretTokens])

  const verifyViewingKeyOnChange = useCallback(async () => {
    setIsVerifying(true)
    const chainIdToChain = await decodeChainIdToChain()
    const chain = chainIdToChain[payload.chainId]
    const { lcdUrl = '' } = getChainApis(false, chain as SupportedChain, 'mainnet')

    const validKey = await verifyViewingKey(
      lcdUrl,
      customKey,
      payload.contractAddress,
      payload.address,
    )

    setIsCustomKeyError(!validKey)
    setIsVerifying(false)
    return validKey
  }, [customKey, getChainApis, payload.address, payload.chainId, payload.contractAddress])

  const approveNewToken = useCallback(async () => {
    if (isUpdateSecret20Type) {
      if (customKey) {
        const validKey = await verifyViewingKeyOnChange()
        if (!validKey) return
      }

      setIsLoading(true)
      const chainIdToChain = await decodeChainIdToChain()
      const chain = chainIdToChain[payload.chainId]
      const { lcdUrl = '' } = getChainApis(false, chain as SupportedChain, 'mainnet')

      await createViewingKey(
        lcdUrl,
        payload.chainId,
        payload.address,
        payload.contractAddress,
        payload.type === SUPPORTED_METHODS.UPDATE_SECRET20_VIEWING_KEY ||
          (advancedFeature && !!customKey),
        { key: payload.viewingKey || customKey },
      )

      if (!secretTokens[payload.contractAddress]) {
        const newSnipToken = {
          name: contractInfo.symbol,
          symbol: payload.contractAddress,
          decimals: contractInfo.decimals,
          coinGeckoId: '',
          icon: '',
        }

        await setSnip20Tokens(payload.contractAddress, newSnipToken, chain)
      }
    } else {
      setIsLoading(true)
      const chainIdToChain = await decodeChainIdToChain()
      const chain = chainIdToChain[payload.chainId] as SupportedChain

      const cw20Token = {
        coinDenom: contractInfo.symbol,
        coinMinimalDenom: payload.contractAddress,
        coinDecimals: contractInfo.decimals,
        coinGeckoId: '',
        icon: '',
        chain,
      }

      window.removeEventListener('beforeunload', handleRejectBtnClick)
      await betaCW20DenomsStore.setBetaCW20Denoms(payload.contractAddress, cw20Token, chain)

      const enabledCW20Tokens = enabledCW20DenomsStore.getEnabledCW20DenomsForChain(chain)
      const _enabledCW20Tokens = [...enabledCW20Tokens, payload.contractAddress]
      await enabledCW20DenomsStore.setEnabledCW20Denoms(_enabledCW20Tokens, chain)
      rootBalanceStore.loadBalances()
    }
    window.removeEventListener('beforeunload', handleRejectBtnClick)
    await Browser.storage.local.set({
      [BG_RESPONSE]: { data: 'Approved' },
    })

    setTimeout(async () => {
      await Browser.storage.local.remove([SUGGEST_TOKEN])
      await Browser.storage.local.remove(BG_RESPONSE)
      setIsLoading(false)
      if (isSidePanel()) {
        navigate('/home')
      } else {
        window.close()
      }
    }, 50)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    advancedFeature,
    contractInfo.decimals,
    contractInfo.symbol,
    createViewingKey,
    customKey,
    getChainApis,
    isUpdateSecret20Type,
    payload.address,
    payload.chainId,
    payload.contractAddress,
    payload.type,
    payload.viewingKey,
    secretTokens,
    navigate,
    setBetaCW20Tokens,
    setSnip20Tokens,
    verifyViewingKeyOnChange,
  ])

  return (
    <>
      <div className='flex flex-col items-center'>
        <Heading text='Adding token' />
        <SubHeading
          text={`This will allow this token to be viewed within ${
            isCompassWallet() ? 'Compass' : 'Leap'
          } Wallet`}
        />

        <TokenContractAddress address={payload.contractAddress ?? ''} />
        {contractInfo && !isFetching && (
          <TokenContractInfo
            name={contractInfo.name ?? ''}
            symbol={contractInfo.symbol ?? ''}
            decimals={contractInfo.decimals ?? 0}
          />
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

              {isVerifying ? <LoaderAnimation color={Colors.white100} className='h-6 y-6' /> : null}
            </div>
          )}

          {isCustomKeyError && customKey && (
            <Text size='sm' className='mt-1' color='text-red-300'>
              Invalid Viewing key provided
            </Text>
          )}
        </div>
      )}

      <Footer error={error} isFetching={isFetching}>
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

        <FooterAction
          error={error}
          rejectBtnClick={handleRejectBtnClick}
          rejectBtnText='Reject'
          confirmBtnClick={approveNewToken}
          confirmBtnText={
            isLoading || isVerifying ? <LoaderAnimation color={Colors.white100} /> : 'Approve'
          }
          isConfirmBtnDisabled={
            error?.length !== 0 || (isCustomKeyError && customKey?.length > 0) || !contractInfo.name
          }
        />
      </Footer>
    </>
  )
})

export default function SuggestSecretWrapper() {
  return (
    <SuggestContainer suggestKey={SUGGEST_TOKEN}>
      {({ handleRejectBtnClick }) => <SuggestSecret handleRejectBtnClick={handleRejectBtnClick} />}
    </SuggestContainer>
  )
}
