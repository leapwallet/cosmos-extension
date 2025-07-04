import {
  getCoreumHybridTokenInfo,
  useChainApis,
  useChainId,
  useGetChains,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  getChainInfo,
  getErc20TokenDetails,
  isEthAddress,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import {
  ActiveChainStore,
  BetaCW20DenomsStore,
  BetaERC20DenomsStore,
  BetaNativeDenomsStore,
  EnabledCW20DenomsStore,
  RootBalanceStore,
  RootDenomsStore,
  SelectedNetworkStore,
} from '@leapwallet/cosmos-wallet-store'
import { ExclamationMark } from '@phosphor-icons/react'
import { InputComponent } from 'components/input-component/InputComponent'
import Loader from 'components/loader/Loader'
import Text from 'components/text'
import { Button } from 'components/ui/button'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import ManageTokensHeader from 'pages/manage-tokens/components/ManageTokensHeader'
import React, { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { activeChainStore } from 'stores/active-chain-store'
import {
  betaCW20DenomsStore,
  betaERC20DenomsStore,
  betaNativeDenomsStore,
  enabledCW20DenomsStore,
  rootDenomsStore,
} from 'stores/denoms-store-instance'
import { rootBalanceStore } from 'stores/root-store'
import { selectedNetworkStore } from 'stores/selected-network-store'
import { getContractInfo } from 'utils/getContractInfo'
import { isNotValidNumber, isNotValidURL } from 'utils/regex'

const AddTokenForm = observer(
  ({
    betaCW20DenomsStore,
    betaERC20DenomsStore,
    betaNativeDenomsStore,
    activeChainStore,
    rootDenomsStore,
    selectedNetworkStore,
    rootBalanceStore,
    enabledCW20DenomsStore,
  }: {
    betaCW20DenomsStore: BetaCW20DenomsStore
    betaERC20DenomsStore: BetaERC20DenomsStore
    betaNativeDenomsStore: BetaNativeDenomsStore
    activeChainStore: ActiveChainStore
    rootDenomsStore: RootDenomsStore
    selectedNetworkStore: SelectedNetworkStore
    rootBalanceStore: RootBalanceStore
    enabledCW20DenomsStore: EnabledCW20DenomsStore
  }) => {
    const navigate = useNavigate()
    const locationState = useLocation().state as null | { coinMinimalDenom: string }
    const chains = useGetChains()

    const activeChain = activeChainStore.activeChain as SupportedChain
    const denoms = rootDenomsStore.allDenoms
    const selectedNetwork = selectedNetworkStore.selectedNetwork

    const [tokenInfo, setTokenInfo] = useState({
      name: '',
      coinDenom: '',
      coinMinimalDenom: '',
      coinDecimals: '',
      coinGeckoId: '',
      icon: '',
      chain: activeChain,
    })
    const [isAddingCw20Token, setIsAddingCw20Token] = useState(false)
    const [isAddingErc20Token, setIsAddingErc20Token] = useState(false)
    const [foundAsset, setFoundAsset] = useState(false)
    const [fetchingTokenInfo, setFetchingTokenInfo] = useState(false)

    const [errors, setErrors] = useState<{ [key: string]: string }>({})
    const [loading, setLoading] = useState(false)
    const { name, coinDenom, coinMinimalDenom, coinDecimals, coinGeckoId, icon, chain } = tokenInfo
    const { lcdUrl, evmJsonRpc } = useChainApis()
    const evmChainId = useChainId(activeChain, selectedNetwork, true)
    const coinMinimalDenomRef = useRef<HTMLInputElement>(null)

    const enabledCW20Tokens = enabledCW20DenomsStore.getEnabledCW20DenomsForChain(activeChain)

    const fetchTokenInfo = useCallback(
      async (event: ChangeEvent<HTMLInputElement>) => {
        let coinMinimalDenom = event.currentTarget.value.trim()
        if (!coinMinimalDenom && coinMinimalDenom.toLowerCase().startsWith('ibc/')) {
          return
        }

        setFetchingTokenInfo(true)
        setIsAddingCw20Token(false)
        setIsAddingErc20Token(false)
        let foundAsset = false

        try {
          const chain = await getChainInfo(activeChain, selectedNetwork === 'testnet')

          if (chain && chain.assets) {
            for (const asset of chain.assets) {
              let _denom = asset.denom.trim()
              let isCw20 = false

              if (!_denom) {
                continue
              }

              if (_denom.startsWith('cw20:')) {
                isCw20 = true
                _denom = _denom.slice(5)
              }

              if (coinMinimalDenom.startsWith('cw20:')) {
                coinMinimalDenom = coinMinimalDenom.slice(5)
              }

              if (_denom.toLowerCase() === coinMinimalDenom.toLowerCase()) {
                const { name, symbol, image, decimals, coingecko_id } = asset
                foundAsset = true

                if (isCw20) {
                  setIsAddingCw20Token(true)
                } else {
                  setIsAddingCw20Token(false)
                }

                setTokenInfo((prevValue) => ({
                  ...prevValue,
                  name: name,
                  coinDenom: symbol,
                  coinMinimalDenom: _denom,
                  coinDecimals: String(decimals),
                  coinGeckoId: coingecko_id,
                  icon: image,
                }))

                break
              }
            }
          }
        } catch (_) {
          //
        }

        if (foundAsset === false) {
          try {
            const result = await getContractInfo(lcdUrl ?? '', coinMinimalDenom)

            if (typeof result !== 'string' && result.symbol) {
              foundAsset = true
              setIsAddingCw20Token(true)

              setTokenInfo((prevValue) => ({
                ...prevValue,
                name: result.name,
                coinDenom: result.symbol,
                coinDecimals: result.decimals,
                coinMinimalDenom,
              }))
            } else {
              setIsAddingCw20Token(false)
            }
          } catch (_) {
            setIsAddingCw20Token(false)
          }
        }

        if (foundAsset === false && chains[activeChain]?.evmOnlyChain) {
          try {
            const details = await getErc20TokenDetails(
              coinMinimalDenom,
              evmJsonRpc ?? '',
              Number(evmChainId),
            )
            foundAsset = true
            setIsAddingErc20Token(true)

            setTokenInfo((prevValue) => ({
              ...prevValue,
              name: details.name,
              coinDenom: details.symbol,
              coinDecimals: String(details.decimals),
              coinMinimalDenom,
            }))
          } catch (_) {
            setIsAddingErc20Token(false)
          }
        }

        if (foundAsset === false && ['mainCoreum', 'coreum'].includes(chain)) {
          try {
            const { symbol, precision } = await getCoreumHybridTokenInfo(
              lcdUrl ?? '',
              coinMinimalDenom,
            )
            foundAsset = true

            setTokenInfo((prevValue) => ({
              ...prevValue,
              coinDenom: symbol,
              coinMinimalDenom,
              coinDecimals: precision,
            }))
          } catch (_) {
            //
          }
        }

        setFoundAsset(foundAsset)
        setFetchingTokenInfo(false)
      },
      [chains, activeChain, chain, selectedNetwork, lcdUrl, evmJsonRpc, evmChainId],
    )

    const handleChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.currentTarget

        let error = ''
        if (value) {
          if (name === 'coinMinimalDenom') {
            const _value = value.trim().toLowerCase()
            const combinedDenomsKey = Object.keys(denoms).map((key) => key.toLowerCase())

            if (combinedDenomsKey.includes(_value)) {
              error = 'Token with same minimal denom already exists'
            } else if (chains[activeChain]?.evmOnlyChain && !isEthAddress(_value)) {
              error = 'Invalid contract address'
            } else if (
              !chains[activeChain]?.evmOnlyChain &&
              (_value.startsWith('erc20/') || isEthAddress(_value))
            ) {
              error = "We don't support adding erc20 token yet."
            } else if (_value.startsWith('ibc/')) {
              error = "We don't support adding ibc token yet."
            }
          } else if (name === 'coinDecimals' && isNotValidNumber(value)) {
            error = 'Incorrect decimal value'
          } else if (name === 'icon' && isNotValidURL(value)) {
            error = 'Invalid Icon URL'
          }
        }

        if (error) {
          setErrors((prevValue) => ({ ...prevValue, [name]: error }))
        } else if (errors[name]) {
          delete errors[name]
          setErrors(errors)
        }

        setTokenInfo((prevValue) => ({ ...prevValue, [name]: value.trim() }))
      },
      [activeChain, chains, denoms, errors],
    )

    useEffect(() => {
      if (locationState && locationState.coinMinimalDenom) {
        handleChange({
          currentTarget: {
            name: 'coinMinimalDenom',
            value: locationState.coinMinimalDenom,
          },
        } as ChangeEvent<HTMLInputElement>)
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locationState])

    useEffect(() => {
      if (coinMinimalDenomRef.current) coinMinimalDenomRef.current.focus()
    }, [])

    const handleSubmit = useCallback(async () => {
      setLoading(true)
      const _tokenInfo = { ...tokenInfo, coinDecimals: Number(tokenInfo.coinDecimals) }

      if (!_tokenInfo.name) {
        _tokenInfo.name = undefined as unknown as string
      }

      if (isAddingCw20Token) {
        await betaCW20DenomsStore.setBetaCW20Denoms(tokenInfo.coinMinimalDenom, _tokenInfo, chain)
      } else if (isAddingErc20Token) {
        await betaERC20DenomsStore.setBetaERC20Denoms(tokenInfo.coinMinimalDenom, _tokenInfo, chain)
      } else {
        await betaNativeDenomsStore.setBetaNativeDenoms(
          tokenInfo.coinMinimalDenom,
          _tokenInfo,
          chain,
        )
      }

      const _enabledCW20Tokens = [...enabledCW20Tokens, tokenInfo.coinMinimalDenom]
      await enabledCW20DenomsStore.setEnabledCW20Denoms(_enabledCW20Tokens, activeChain)

      rootBalanceStore.refetchBalances()
      setLoading(false)
      navigate('/')
    }, [
      activeChain,
      betaCW20DenomsStore,
      betaERC20DenomsStore,
      betaNativeDenomsStore,
      chain,
      enabledCW20DenomsStore,
      enabledCW20Tokens,
      isAddingCw20Token,
      isAddingErc20Token,
      navigate,
      rootBalanceStore,
      tokenInfo,
    ])

    const showWarning = useMemo(
      () => !fetchingTokenInfo && !foundAsset && coinMinimalDenom && !errors.coinMinimalDenom,
      [fetchingTokenInfo, foundAsset, coinMinimalDenom, errors],
    )

    const disableAddToken = useMemo(
      () =>
        !coinDenom ||
        !coinMinimalDenom ||
        !coinDecimals ||
        loading ||
        fetchingTokenInfo ||
        !!errors.coinMinimalDenom ||
        !!errors.coinDenom ||
        !!errors.coinDecimals ||
        !!errors.coinGeckoId ||
        !!errors.name ||
        !!errors.icon,
      [coinDenom, coinMinimalDenom, coinDecimals, loading, fetchingTokenInfo, errors],
    )

    const { coinMinimalDenomPlaceholder, coinDenomPlaceholder } = useMemo(() => {
      let coinMinimalDenomPlaceholder = 'Coin minimal denom (ex: juno1...5awr)'
      let coinDenomPlaceholder = 'Coin denom (ex: NETA)'

      if (chains[activeChain]?.evmOnlyChain) {
        coinMinimalDenomPlaceholder = 'Contract address (ex: 0x...)'
        coinDenomPlaceholder = 'Symbol (ex: PYTH)'
      }

      return {
        coinMinimalDenomPlaceholder,
        coinDenomPlaceholder,
      }
    }, [activeChain, chains])

    return (
      <>
        <form className='mx-auto w-[344px] mb-5 pb-6 overflow-y-auto h-[calc(100%-66px)]'>
          <div className='rounded-lg w-full flex items-center h-[56px] p-4 bg-secondary-100 my-6 gap-x-[10px]'>
            <ExclamationMark className='text-secondary-100 bg-accent-yellow rounded-full h-5 w-5 p-[2px]' />
            <div className='font-medium text-foreground text-sm !leading-[22px]'>
              Only add tokens you trust.
            </div>
          </div>

          <InputComponent
            placeholder={coinMinimalDenomPlaceholder}
            value={coinMinimalDenom}
            name='coinMinimalDenom'
            onChange={handleChange}
            error={errors.coinMinimalDenom}
            warning={
              showWarning
                ? `Make sure the coin minimal denom is correct and it belongs to ${
                    chains[activeChain as SupportedChain]?.chainName
                  } chain`
                : ''
            }
            onBlur={fetchTokenInfo}
            ref={coinMinimalDenomRef}
          />

          <InputComponent
            placeholder={coinDenomPlaceholder}
            value={coinDenom}
            name='coinDenom'
            onChange={handleChange}
            error={errors.coinDenom}
          />

          <InputComponent
            placeholder='Coin decimals (ex: 6)'
            value={coinDecimals}
            name='coinDecimals'
            onChange={handleChange}
            error={errors.coinDecimals}
          />

          <InputComponent
            placeholder='Token name (optional)'
            value={name}
            name='name'
            onChange={handleChange}
            error={errors.name}
          />

          <InputComponent
            placeholder='Coin gecko id (optional)'
            value={coinGeckoId}
            name='coinGeckoId'
            onChange={handleChange}
            error={errors.coinGeckoId}
          />

          <InputComponent
            placeholder='Icon url (optional)'
            value={icon}
            name='icon'
            onChange={handleChange}
            error={errors.icon}
          />
        </form>

        <div className='absolute bottom-0 left-0 right-0 p-4 bg-secondary-100 backdrop-blur-xl'>
          {fetchingTokenInfo || loading ? (
            <div className='h-[44px]'>
              <Loader />
            </div>
          ) : (
            <Button
              className='rounded-full w-full font-bold text-sm !leading-5 text-gray-900 dark:text-white-100 h-11 !bg-primary'
              type='submit'
              disabled={disableAddToken}
              onClick={handleSubmit}
            >
              Add token
            </Button>
          )}
        </div>
      </>
    )
  },
)

export default function AddToken() {
  return (
    <div className='bg-secondary-50 flex flex-col h-full'>
      <ManageTokensHeader title='Add Token' />
      <div className='panel-width px-6 flex-1 overflow-y-hidden relative'>
        <AddTokenForm
          selectedNetworkStore={selectedNetworkStore}
          betaCW20DenomsStore={betaCW20DenomsStore}
          betaERC20DenomsStore={betaERC20DenomsStore}
          betaNativeDenomsStore={betaNativeDenomsStore}
          activeChainStore={activeChainStore}
          rootDenomsStore={rootDenomsStore}
          rootBalanceStore={rootBalanceStore}
          enabledCW20DenomsStore={enabledCW20DenomsStore}
        />
      </div>
    </div>
  )
}
