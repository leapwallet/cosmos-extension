import { FeeTokenData, Grant, useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons, Header, HeaderActionType } from '@leapwallet/leap-ui'
import { ErrorCard } from 'components/ErrorCard'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import { GasPriceOptionValue } from 'components/gas-price-options/context'
import { DisplayFee } from 'components/gas-price-options/display-fee'
import { FeesSettingsSheet } from 'components/gas-price-options/fees-settings-sheet'
import { LoaderAnimation } from 'components/loader/Loader'
import { Images } from 'images'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Colors } from 'theme/colors'
import { UserClipboard } from 'utils/clipboard'

import { useAuthZContext } from './ManageAuthZ'

function FeesView() {
  const [showFeesSettingSheet, setShowFeesSettingSheet] = useState(false)
  const {
    selectedChain,
    setFeeDenom,
    setGasOption,
    feeDenom,
    gasOption,
    gasEstimate,
    userPreferredGasPrice,
    userPreferredGasLimit,
    setUserPreferredGasLimit,
    setUserPreferredGasPrice,
    gasError,
    setGasError,
    selectedChainHasMainnetOnly,
  } = useAuthZContext()

  const defaultGasPrice = useDefaultGasPrice({
    activeChain: selectedChain,
    selectedNetwork: selectedChainHasMainnetOnly ? 'mainnet' : undefined,
    feeDenom,
  })

  const [gasPriceOption, setGasPriceOption] = useState<GasPriceOptionValue>({
    option: gasOption,
    gasPrice: userPreferredGasPrice ?? defaultGasPrice.gasPrice,
  })

  const onClose = useCallback(() => {
    setShowFeesSettingSheet(false)
  }, [])

  const handleGasPriceOptionChange = useCallback(
    (value: GasPriceOptionValue, feeTokenData: FeeTokenData) => {
      setGasPriceOption(value)
      setFeeDenom({ ...feeTokenData.denom, ibcDenom: feeTokenData.ibcDenom })
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useEffect(() => {
    setGasPriceOption({
      option: gasOption,
      gasPrice: defaultGasPrice.gasPrice,
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChain])

  useEffect(() => {
    setGasOption(gasPriceOption.option)
    setUserPreferredGasPrice(gasPriceOption.gasPrice)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gasPriceOption])

  return (
    <div>
      <GasPriceOptions
        recommendedGasLimit={gasEstimate.toString()}
        gasLimit={userPreferredGasLimit?.toString() ?? gasEstimate.toString()}
        setGasLimit={(value) => setUserPreferredGasLimit(Number(value.toString()))}
        gasPriceOption={gasPriceOption}
        onGasPriceOptionChange={handleGasPriceOptionChange}
        error={gasError}
        setError={setGasError}
        chain={selectedChain}
        network={selectedChainHasMainnetOnly ? 'mainnet' : undefined}
      >
        <DisplayFee setShowFeesSettingSheet={setShowFeesSettingSheet} />

        {gasError && !showFeesSettingSheet ? (
          <p className='text-red-300 text-sm font-medium text-center'>{gasError}</p>
        ) : null}

        <FeesSettingsSheet
          showFeesSettingSheet={showFeesSettingSheet}
          onClose={onClose}
          gasError={gasError}
        />
      </GasPriceOptions>
    </div>
  )
}

export function AuthzDetails({ goBack, grant }: { goBack: () => void; grant: Grant }) {
  const activeChain = useActiveChain()
  const [isGranteeAddressCopied, setIsGranteeAddressCopied] = useState(false)
  const { onReviewRevokeTx, isLoading, error, gasError } = useAuthZContext()

  const date = useMemo(() => {
    let _date = ''

    if (grant.expiration) {
      const dateNtime = new Date(grant.expiration)
      const todayDate = new Date()

      if (todayDate > dateNtime) {
        _date = 'Expired'
      } else {
        _date = `Expiration Date: ${dateNtime.toLocaleDateString('en-US', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })}, ${
          dateNtime.getHours() === 0
            ? 24
            : (dateNtime.getHours() < 10 ? '0' : '') + dateNtime.getHours()
        }:${(dateNtime.getMinutes() < 10 ? '0' : '') + dateNtime.getMinutes()}`
      }
    }

    return _date
  }, [grant.expiration])

  const handleCopyGranteeAddress = () => {
    setIsGranteeAddressCopied(true)
    UserClipboard.copyText(grant.grantee)

    setTimeout(() => {
      setIsGranteeAddressCopied(false)
    }, 500)
  }

  return (
    <div className='pb-5 h-[600px]'>
      <Header
        topColor={Colors.getChainColor(activeChain)}
        title='AuthZ Details'
        action={{ type: HeaderActionType.BACK, onClick: goBack }}
      />

      <div className='overflow-y-auto w-full'>
        <div className='flex flex-col items-center gap-4 p-[28px] h-[530px] relative'>
          <h1 className='text-gray-700 dark:text-gray-300 text-base w-full font-bold'>Delegate</h1>

          <div
            className='overflow-auto min-h-[40px] rounded-2xl w-full p-4 bg-white-100 dark:bg-gray-900 cursor-pointer'
            onClick={handleCopyGranteeAddress}
          >
            <h2 className='w-full pb-1 font-bold text-xs text-gray-600 dark:text-gray-400 flex gap-1'>
              Grantee Address
              {isGranteeAddressCopied ? (
                <span>copied</span>
              ) : (
                <img className='w-[16px] h-[16px]' src={Images.Activity.Copy} alt='' />
              )}
            </h2>

            <p className='dark:text-white-100 text-base font-bold break-all'>{grant.grantee}</p>
          </div>

          {grant.expiration && (
            <div className='overflow-auto min-h-[30px] rounded-2xl w-full p-4 bg-white-100 dark:bg-gray-900'>
              <h2 className='w-full pb-1 font-bold text-xs text-gray-600 dark:text-gray-400'>
                Expiration Date
              </h2>
              <p className='dark:text-white-100 text-base font-bold'>{date}</p>
            </div>
          )}

          <pre className='max-h-[150px] text-xs rounded-2xl w-full bg-white-100 dark:bg-gray-900 p-4 dark:text-white-100 overflow-auto'>
            {JSON.stringify(grant.authorization, null, 2)}
          </pre>

          <div className='mt-auto w-full'>
            <FeesView />

            <Buttons.Generic
              style={{
                background: Colors.getChainColor(activeChain),
              }}
              className='w-full h-[48px] cursor-pointer text-white-100'
              onClick={onReviewRevokeTx}
              disabled={isLoading || !!error || !!gasError}
            >
              {isLoading ? <LoaderAnimation color={Colors.white100} /> : 'Revoke'}
            </Buttons.Generic>
          </div>
        </div>
        {error ? <ErrorCard text={error} className='mx-auto -mt-[15px] mb-[15px]' /> : null}{' '}
      </div>
    </div>
  )
}
