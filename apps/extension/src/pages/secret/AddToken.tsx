import {
  getCoreumHybridTokenInfo,
  useActiveChain,
  useChainApis,
  useDenoms,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import { getChainInfo } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, Header, HeaderActionType } from '@leapwallet/leap-ui'
import { InputComponent } from 'components/input-component/InputComponent'
import PopupLayout from 'components/layout/popup-layout'
import Text from 'components/text'
import { useSetBetaCW20Tokens } from 'hooks/useSetBetaCW20Tokens'
import { Images } from 'images'
import React, { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Colors } from 'theme/colors'
import { getContractInfo } from 'utils/getContractInfo'
import { isCompassWallet } from 'utils/isCompassWallet'
import { isNotValidNumber, isNotValidURL } from 'utils/regex'

function AddTokenForm() {
  const navigate = useNavigate()
  const locationState = useLocation().state as null | { coinMinimalDenom: string }
  const activeChain = useActiveChain()

  const denoms = useDenoms()
  const selectedNetwork = useSelectedNetwork()
  const setBetaCW20Tokens = useSetBetaCW20Tokens()

  const [tokenInfo, setTokenInfo] = useState({
    name: '',
    coinDenom: '',
    coinMinimalDenom: '',
    coinDecimals: '',
    coinGeckoId: '',
    icon: '',
    chain: activeChain,
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(false)
  const { name, coinDenom, coinMinimalDenom, coinDecimals, coinGeckoId, icon, chain } = tokenInfo
  const { lcdUrl } = useChainApis()
  const coinMinimalDenomRef = useRef<HTMLInputElement>(null)

  const fetchTokenInfo = async (event: ChangeEvent<HTMLInputElement>) => {
    const coinMinimalDenom = event.currentTarget.value.trim()
    if (!coinMinimalDenom) {
      return
    }

    let foundAsset = false
    try {
      const chain = await getChainInfo(activeChain, selectedNetwork === 'testnet')

      if (chain && chain.assets) {
        for (const asset of chain.assets) {
          let _denom = asset.denom
          let _coinMinimalDenom = coinMinimalDenom

          if (!_denom) {
            continue
          }

          if (_denom.includes('cw20:')) {
            _denom = _denom.slice(5)
          }

          if (_coinMinimalDenom.includes('cw20:')) {
            _coinMinimalDenom = _coinMinimalDenom.slice(5)
          }

          if (_denom === _coinMinimalDenom) {
            const { name, symbol, image, decimals, coingecko_id } = asset

            foundAsset = true
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
          setTokenInfo((prevValue) => ({
            ...prevValue,
            name: result.name,
            coinDenom: result.symbol,
            coinDecimals: result.decimals,
            coinMinimalDenom,
          }))
        }
      } catch (_) {
        //
      }
    }

    if (foundAsset === false && chain === 'mainCoreum') {
      try {
        const { symbol, precision } = await getCoreumHybridTokenInfo(lcdUrl ?? '', coinMinimalDenom)
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
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget

    let error = ''
    if (value) {
      if (name === 'coinMinimalDenom' && Object.keys(denoms).includes(value.trim().toLowerCase())) {
        error = 'Token with same minimal denom already exists'
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
  }

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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    setLoading(true)
    const _tokenInfo = { ...tokenInfo, coinDecimals: Number(tokenInfo.coinDecimals) }

    if (!_tokenInfo.name) {
      _tokenInfo.name = undefined as unknown as string
    }

    await setBetaCW20Tokens(tokenInfo.coinMinimalDenom, _tokenInfo, chain)
    setLoading(false)
    navigate('/')
  }

  const disableSubmit = !coinDenom || !coinMinimalDenom || !coinDecimals

  return (
    <form className='mx-auto w-[344px] mb-5' onSubmit={handleSubmit}>
      <InputComponent
        placeholder={`Coin Minimal Denom (Ex: ${
          isCompassWallet() ? 'sei16...xx00' : 'juno1...5awr'
        })`}
        value={coinMinimalDenom}
        name='coinMinimalDenom'
        onChange={handleChange}
        error={errors.coinMinimalDenom}
        onBlur={fetchTokenInfo}
        ref={coinMinimalDenomRef}
      />

      <InputComponent
        placeholder={`Coin Denom (Ex: ${isCompassWallet() ? 'ECLIP' : 'NETA'})`}
        value={coinDenom}
        name='coinDenom'
        onChange={handleChange}
        error={errors.coinDenom}
      />

      <InputComponent
        placeholder='Coin Decimals (Ex: 6)'
        value={coinDecimals}
        name='coinDecimals'
        onChange={handleChange}
        error={errors.coinDecimals}
      />

      <InputComponent
        placeholder='Token Name (Optional)'
        value={name}
        name='name'
        onChange={handleChange}
        error={errors.name}
      />

      <InputComponent
        placeholder='Coin Gecko ID (Optional)'
        value={coinGeckoId}
        name='coinGeckoId'
        onChange={handleChange}
        error={errors.coinGeckoId}
      />

      <InputComponent
        placeholder='Icon URL (Optional)'
        value={icon}
        name='icon'
        onChange={handleChange}
        error={errors.icon}
      />

      <div className='flex gap-x-4 mt-3'>
        <Buttons.Generic
          className='rounded-2xl w-full font-bold py-3 dark:bg-gray-900 bg-gray-900 text-gray-900 dark:text-white-100 h-12'
          type='reset'
          onClick={() => navigate('/')}
          style={{ boxShadow: 'none' }}
        >
          Cancel
        </Buttons.Generic>

        <Buttons.Generic
          className='rounded-2xl w-full font-bold py-3 text-gray-900 dark:text-white-100 relative h-12'
          style={{ backgroundColor: Colors.getChainColor(activeChain), boxShadow: 'none' }}
          type='submit'
          disabled={loading || disableSubmit}
        >
          Add Token
        </Buttons.Generic>
      </div>
    </form>
  )
}

export function AddToken() {
  const activeChain = useActiveChain()
  const navigate = useNavigate()

  return (
    <div className='relative overflow-clip m-auto'>
      <PopupLayout
        header={
          <Header
            title='Add Token'
            action={{
              onClick: () => {
                navigate('/home')
              },
              type: HeaderActionType.BACK,
            }}
            topColor={Colors.getChainColor(activeChain)}
          />
        }
      >
        <div className='w-[400px] h-[600px] max-h-[600px] overflow-y-auto bg-gray-50 dark:bg-black-100'>
          <div className='rounded-xl mx-auto w-[344px] flex items-center h-[68px] bg-white-100 dark:bg-gray-900 py-2 pl-5 pr-[10px] mt-7 mb-4'>
            <img className='mr-[16px]' src={Images.Misc.Warning} width='40' height='40' />
            <div className='flex flex-col gap-y-[2px]'>
              <Text size='sm' color='text-gray-400 font-medium'>
                Caution:
              </Text>
              <Text size='sm' color='font-bold dark:text-white-100 text-gray-900'>
                Only add custom token you trust.
              </Text>
            </div>
          </div>
          <AddTokenForm />
        </div>
      </PopupLayout>
    </div>
  )
}
