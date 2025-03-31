import { removeTrailingSlash, useChainApis } from '@leapwallet/cosmos-wallet-hooks'
import { initiateNodeUrls, NODE_URLS, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, GenericCard, Header, HeaderActionType } from '@leapwallet/leap-ui'
import { captureException } from '@sentry/react'
import axios from 'axios'
import classNames from 'classnames'
import { AlertStrip } from 'components/alert-strip'
import BottomModal from 'components/bottom-modal'
import Text from 'components/text'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { CUSTOM_ENDPOINTS } from 'config/storage-keys'
import { useChainPageInfo } from 'hooks'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { useChainInfos } from 'hooks/useChainInfos'
import { useDebounceCallback } from 'hooks/useDebounceCallback'
import { useDontShowSelectChain } from 'hooks/useDontShowSelectChain'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo, useState } from 'react'
import { manageChainsStore } from 'stores/manage-chains-store'
import { Colors } from 'theme/colors'
import { AggregatedSupportedChain } from 'types/utility'
import { imgOnError } from 'utils/imgOnError'
import { isSidePanel } from 'utils/isSidePanel'
import { uiErrorTags } from 'utils/sentry'
import Browser from 'webextension-polyfill'

import { ListChains, ListChainsProps } from '../SelectChain'

type SelectChainSheetProps = ListChainsProps & {
  readonly isVisible: boolean
  readonly onClose: VoidFunction
}

export const SelectChainSheet = observer(
  ({
    isVisible,
    onClose,
    onChainSelect,
    selectedChain,
    onPage,
    chainsToShow,
  }: SelectChainSheetProps) => {
    return (
      <BottomModal title='Select Chain' onClose={onClose} isOpen={isVisible}>
        <ListChains
          selectedChain={selectedChain}
          onChainSelect={onChainSelect}
          onPage={onPage}
          chainsToShow={chainsToShow}
        />
      </BottomModal>
    )
  },
)

type CustomEndpointInputProps = {
  label: string
  inputValue: string
  // eslint-disable-next-line no-unused-vars
  inputOnChange: (value: string) => void
  crossOnClick: VoidFunction
  name: string
  error: string
}

function CustomEndpointInput({
  label,
  inputValue,
  inputOnChange,
  crossOnClick,
  name,
  error,
}: CustomEndpointInputProps) {
  return (
    <label
      htmlFor={name}
      className='rounded-2xl bg-white-100 dark:bg-gray-900 p-4 block mt-3 w-full'
    >
      <span className='text-gray-300 text-sm'>{label}</span>

      <div className='flex mt-2 border border-[0.5px] p-[2px] border-gray-300 dark:border-gray-50 rounded-lg overflow-hidden'>
        <input
          type='url'
          id={name}
          name={name}
          className='flex-1 h-[32px] pl-[8px] bg-transparent text-gray-900 dark:text-white-100 outline-none'
          value={inputValue}
          onChange={(event) => inputOnChange(event.target.value)}
        />
        <button
          className={classNames('w-[30px] flex items-center justify-center', {
            'cursor-pointer': inputValue.length,
            'cursor-default': inputValue.length === 0,
          })}
          onClick={inputValue.length ? crossOnClick : undefined}
        >
          <img src={inputValue.length ? Images.Misc.CrossFilled : Images.Misc.FilledPen} />
        </button>
      </div>

      {error && (
        <Text size='sm' color='text-red-300 mt-2'>
          {error}
        </Text>
      )}
    </label>
  )
}

export const CustomEndpoints = observer(({ goBack }: { goBack: () => void }) => {
  const _activeChain = useActiveChain() as AggregatedSupportedChain
  const activeChain = useMemo(() => {
    if (_activeChain === AGGREGATED_CHAIN_KEY) {
      return 'cosmos'
    }

    return _activeChain
  }, [_activeChain])

  const chainInfos = useChainInfos()
  const defaultTokenLogo = useDefaultTokenLogo()
  const { topChainColor } = useChainPageInfo()

  const [showSelectChain, setShowSelectChain] = useState(false)
  const [selectedChain, setSelectedChain] = useState(activeChain)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const selectedNetwork = useSelectedNetwork()
  const { rpcUrl, lcdUrl } = useChainApis(selectedChain, selectedNetwork)

  const { debounce } = useDebounceCallback()
  const dontShowSelectChain = useDontShowSelectChain(manageChainsStore)
  const [validating, setValidating] = useState(false)
  const [showAlertMsg, setShowAlertMsg] = useState(false)
  const [customEndpoints, setCustomEndpoints] = useState({
    rpc: rpcUrl ?? '',
    lcd: lcdUrl ?? '',
  })

  useEffect(() => {
    setCustomEndpoints({
      rpc: rpcUrl ?? '',
      lcd: lcdUrl ?? '',
    })
  }, [rpcUrl, lcdUrl])

  const validateEndpoints = async (name: string, value: string) => {
    let error = ''
    const selectedChainInfo = chainInfos[selectedChain]

    if (name === 'rpc') {
      try {
        const { data } = await axios.get(`${value}/status`)
        const { node_info: nodeInfo } = data.result ?? data

        if (
          nodeInfo.network.trim() !==
          (selectedNetwork === 'mainnet'
            ? selectedChainInfo.chainId
            : selectedChainInfo.testnetChainId)
        ) {
          error = `RPC endpoint has different chain id (expected: ${
            selectedNetwork === 'mainnet'
              ? selectedChainInfo.chainId
              : selectedChainInfo.testnetChainId
          }, actual: ${nodeInfo.network})`
        }
      } catch (_) {
        error = 'Invalid RPC url. Failed to get /status response.'
      } finally {
        setValidating(false)
      }
    }

    if (name === 'lcd') {
      try {
        const { data } = await axios.get(`${value}/cosmos/base/tendermint/v1beta1/node_info`)
        const { default_node_info: nodeInfo } = data

        if (
          nodeInfo.network.trim() !==
          (selectedNetwork === 'mainnet'
            ? selectedChainInfo.chainId
            : selectedChainInfo.testnetChainId)
        ) {
          error = `LCD endpoint has different chain id (expected: ${
            selectedNetwork === 'mainnet'
              ? selectedChainInfo.chainId
              : selectedChainInfo.testnetChainId
          }, actual: ${nodeInfo.network})`
        }
      } catch (_) {
        error = 'Invalid LCD url. Failed to get /cosmos/base/tendermint/v1beta1/node_info response.'
      } finally {
        setValidating(false)
      }
    }

    if (error) {
      setErrors((prevValue) => ({ ...prevValue, [name]: error }))
      captureException(error, {
        tags: uiErrorTags,
      })
    } else {
      delete errors[name]
      setErrors(errors)
    }
  }

  const debouncedValidateEndpoints = debounce((name: string, value: string) => {
    validateEndpoints(name, value)
  }, 750)

  const handleInputChange = (name: string, value: string) => {
    value = value.trim()
    setCustomEndpoints((prevValue) => ({ ...prevValue, [name]: value }))

    if (value) {
      setValidating(true)
      debouncedValidateEndpoints(name, removeTrailingSlash(value))
    } else {
      delete errors[name]
      setErrors(errors)
    }
  }

  const handleResetClick = async () => {
    const storage = await Browser.storage.local.get([CUSTOM_ENDPOINTS])
    if (storage[CUSTOM_ENDPOINTS]) {
      await initiateNodeUrls()

      const _customEndpoints = JSON.parse(storage[CUSTOM_ENDPOINTS])
      delete _customEndpoints[selectedChain]
      await Browser.storage.local.set({
        [CUSTOM_ENDPOINTS]: JSON.stringify(_customEndpoints),
      })

      const selectedChainInfo = chainInfos[selectedChain]
      setCustomEndpoints({
        rpc: NODE_URLS.rpc?.[selectedChainInfo.chainId]?.[0].nodeUrl ?? rpcUrl ?? '',
        lcd: NODE_URLS.rest?.[selectedChainInfo.chainId]?.[0].nodeUrl ?? lcdUrl ?? '',
      })
    } else {
      setCustomEndpoints({ rpc: rpcUrl ?? '', lcd: lcdUrl ?? '' })
    }

    setErrors({})
  }

  const handleSaveClick = async () => {
    const storage = await Browser.storage.local.get([CUSTOM_ENDPOINTS])
    const customNewRpcURL = removeTrailingSlash(customEndpoints.rpc)
    const customNewLcdURL = removeTrailingSlash(customEndpoints.lcd)

    const newRpcURL = customNewRpcURL !== rpcUrl ? customNewRpcURL : undefined
    const newLcdURL = customNewLcdURL !== lcdUrl ? customNewLcdURL : undefined

    if (storage[CUSTOM_ENDPOINTS]) {
      await Browser.storage.local.set({
        [CUSTOM_ENDPOINTS]: JSON.stringify({
          ...JSON.parse(storage[CUSTOM_ENDPOINTS]),
          [selectedChain]: {
            ...JSON.parse(storage[CUSTOM_ENDPOINTS])[selectedChain],
            [selectedNetwork === 'mainnet' ? 'rpc' : 'rpcTest']: newRpcURL,
            [selectedNetwork === 'mainnet' ? 'lcd' : 'lcdTest']: newLcdURL,
          },
        }),
      })
    } else {
      await Browser.storage.local.set({
        [CUSTOM_ENDPOINTS]: JSON.stringify({
          [selectedChain]: {
            [selectedNetwork === 'mainnet' ? 'rpc' : 'rpcTest']: newRpcURL,
            [selectedNetwork === 'mainnet' ? 'lcd' : 'lcdTest']: newLcdURL,
          },
        }),
      })
    }

    setShowAlertMsg(true)
  }

  const isSaveDisabled =
    validating ||
    !!errors.rpc ||
    !!errors.lcd ||
    customEndpoints.rpc === '' ||
    customEndpoints.lcd === '' ||
    (rpcUrl === removeTrailingSlash(customEndpoints.rpc) &&
      lcdUrl === removeTrailingSlash(customEndpoints.lcd))

  return (
    <>
      <div
        className={classNames('panel-height panel-width enclosing-panel', {
          'pb-5': !isSidePanel(),
        })}
      >
        <Header
          title='Custom Endpoints'
          action={{ type: HeaderActionType.BACK, onClick: goBack }}
        />
        <div className='flex flex-col items-center p-[28px] h-[calc(100%-70px)] relative'>
          {showAlertMsg && (
            <AlertStrip
              message='Saved changes successfully'
              bgColor={Colors.green600}
              alwaysShow={false}
              onHide={() => setShowAlertMsg(false)}
              className='absolute top-[2px] left-[40px] z-10 rounded-2xl w-80 h-auto p-2'
              timeOut={1000}
            />
          )}

          <GenericCard
            title={chainInfos[selectedChain].chainName ?? ''}
            img={
              <img
                src={chainInfos[selectedChain].chainSymbolImageUrl ?? defaultTokenLogo}
                className='w-[28px] h-[28px] mr-2 border rounded-full dark:border-[#333333] border-[#cccccc]'
                onError={imgOnError(defaultTokenLogo)}
              />
            }
            isRounded={true}
            title2='Chain'
            icon={
              dontShowSelectChain ? undefined : (
                <img className='w-[10px] h-[10px] ml-2' src={Images.Misc.RightArrow} />
              )
            }
            className={classNames({ '!cursor-default': dontShowSelectChain })}
            onClick={dontShowSelectChain ? undefined : () => setShowSelectChain(true)}
          />

          <CustomEndpointInput
            label='RPC'
            inputValue={customEndpoints.rpc}
            crossOnClick={() => handleInputChange('rpc', '')}
            inputOnChange={(value) => handleInputChange('rpc', value)}
            name='rpc-endpoint'
            error={errors.rpc}
          />

          <CustomEndpointInput
            label='LCD'
            inputValue={customEndpoints.lcd}
            crossOnClick={() => handleInputChange('lcd', '')}
            inputOnChange={(value) => handleInputChange('lcd', value)}
            name='lcd-endpoint'
            error={errors.lcd}
          />

          <div className='flex flex-col w-full mt-auto'>
            {validating && (
              <p className='font-bold text-gray-900 dark:text-gray-50 text-center mb-2'>
                Validating endpoints..
              </p>
            )}

            <div className='flex flex-row justify-between'>
              <Buttons.Generic
                style={{ height: '48px', background: Colors.gray900, color: Colors.white100 }}
                onClick={handleResetClick}
              >
                Reset
              </Buttons.Generic>

              <Buttons.Generic
                style={{ background: topChainColor }}
                className='ml-3 h-[48px] cursor-pointer text-white-100'
                onClick={handleSaveClick}
                disabled={isSaveDisabled}
              >
                Save
              </Buttons.Generic>
            </div>
          </div>
        </div>
      </div>
      <SelectChainSheet
        isVisible={showSelectChain}
        onClose={() => setShowSelectChain(false)}
        selectedChain={selectedChain}
        onChainSelect={(chaiName: SupportedChain) => {
          setSelectedChain(chaiName)
          setShowSelectChain(false)
        }}
      />
    </>
  )
})
