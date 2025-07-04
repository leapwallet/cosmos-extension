import { removeTrailingSlash, useChainApis } from '@leapwallet/cosmos-wallet-hooks'
import { initiateNodeUrls, NODE_URLS, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { ChainTagsStore } from '@leapwallet/cosmos-wallet-store'
import { CaretRight } from '@phosphor-icons/react'
import { captureException } from '@sentry/react'
import axios from 'axios'
import classNames from 'classnames'
import { AlertStrip } from 'components/alert-strip'
import BottomModal from 'components/new-bottom-modal'
import Text from 'components/text'
import { Button } from 'components/ui/button'
import { Input } from 'components/ui/input'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { CUSTOM_ENDPOINTS } from 'config/storage-keys'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { useChainInfos } from 'hooks/useChainInfos'
import { useDebounceCallback } from 'hooks/useDebounceCallback'
import { useDontShowSelectChain } from 'hooks/useDontShowSelectChain'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo, useState } from 'react'
import { chainTagsStore } from 'stores/chain-infos-store'
import { manageChainsStore } from 'stores/manage-chains-store'
import { Colors } from 'theme/colors'
import { AggregatedSupportedChain } from 'types/utility'
import { imgOnError } from 'utils/imgOnError'
import { uiErrorTags } from 'utils/sentry'
import Browser from 'webextension-polyfill'

import SelectChain, { ListChains, ListChainsProps } from '../SelectChain'

type SelectChainSheetProps = ListChainsProps & {
  readonly isVisible: boolean
  readonly onClose: VoidFunction
  readonly chainTagsStore: ChainTagsStore
}

export const SelectChainSheet = observer(
  ({
    isVisible,
    onClose,
    onChainSelect,
    selectedChain,
    onPage,
    chainsToShow,
    chainTagsStore,
  }: SelectChainSheetProps) => {
    return (
      <BottomModal fullScreen title='Select Chain' onClose={onClose} isOpen={isVisible}>
        <ListChains
          selectedChain={selectedChain}
          onChainSelect={onChainSelect}
          onPage={onPage}
          chainsToShow={chainsToShow}
          chainTagsStore={chainTagsStore}
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

const CustomEndpointsView = ({ goBack, isVisible }: { goBack: () => void; isVisible: boolean }) => {
  const _activeChain = useActiveChain() as AggregatedSupportedChain
  const activeChain = useMemo(() => {
    if (_activeChain === AGGREGATED_CHAIN_KEY) {
      return 'cosmos'
    }

    return _activeChain
  }, [_activeChain])

  const chainInfos = useChainInfos()
  const defaultTokenLogo = useDefaultTokenLogo()

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
    <BottomModal
      fullScreen
      isOpen={isVisible}
      onClose={() => {
        goBack()
        setShowAlertMsg(false)
        setValidating(false)
        setErrors({})
      }}
      title='Custom Endpoints'
      className='relative flex flex-col gap-4 flex-1'
    >
      <button
        onClick={dontShowSelectChain ? undefined : () => setShowSelectChain(true)}
        className='flex items-center gap-3 py-3 px-4 w-full rounded-xl bg-secondary-100 hover:bg-secondary-200 transition-colors'
      >
        <img
          src={chainInfos[selectedChain].chainSymbolImageUrl ?? defaultTokenLogo}
          className='w-[28px] h-[28px] mr-2 border rounded-full dark:border-[#333333] border-[#cccccc]'
          onError={imgOnError(defaultTokenLogo)}
        />

        <span className='mr-auto font-semibold'>{chainInfos[selectedChain].chainName ?? ''}</span>

        {!dontShowSelectChain && <CaretRight size={14} className='text-muted-foreground' />}
      </button>

      <Input
        className='bg-transparent border border-border-bottom'
        value={customEndpoints.rpc}
        onChange={(e) => handleInputChange('rpc', e.target.value)}
        placeholder='RPC'
      />

      <Input
        className='bg-transparent border border-border-bottom'
        value={customEndpoints.lcd}
        onChange={(e) => handleInputChange('lcd', e.target.value)}
        placeholder='LCD'
      />

      <div className='flex flex-col w-full mt-auto gap-4'>
        {showAlertMsg && (
          <AlertStrip
            message='Saved changes successfully'
            bgColor={Colors.green600}
            alwaysShow={false}
            onHide={() => setShowAlertMsg(false)}
            className='rounded-2xl w-80 mx-auto h-auto p-2'
            timeOut={1000}
          />
        )}

        {validating && (
          <p className='font-medium text-muted-foreground text-sm text-center animate-pulse'>
            Validating endpoints
          </p>
        )}

        <div className='flex justify-between mt-auto [&>button]:flex-1 gap-4'>
          <Button onClick={handleResetClick} variant='mono'>
            Reset
          </Button>

          <Button onClick={handleSaveClick} disabled={isSaveDisabled}>
            Save
          </Button>
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
        chainTagsStore={chainTagsStore}
      />
    </BottomModal>
  )
}

export const CustomEndpoints = observer(CustomEndpointsView)
