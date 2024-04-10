/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  GasOptions,
  useActiveChain,
  useActiveWallet,
  useChainInfo,
  useDefaultGasEstimates,
  useGasAdjustmentForChain,
} from '@leapwallet/cosmos-wallet-hooks'
import { GasPrice, SeiEvmTx } from '@leapwallet/cosmos-wallet-sdk'
import { EthWallet } from '@leapwallet/leap-keychain'
import { Avatar, Buttons, Header } from '@leapwallet/leap-ui'
import Tooltip from 'components/better-tooltip'
import { ErrorCard } from 'components/ErrorCard'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import PopupLayout from 'components/layout/popup-layout'
import { LoaderAnimation } from 'components/loader/Loader'
import { Tabs } from 'components/tabs'
import { MessageTypes } from 'config/message-types'
import { useSiteLogo } from 'hooks/utility/useSiteLogo'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import { GenericLight } from 'images/logos'
import React, { useEffect, useMemo, useState } from 'react'
import { Colors } from 'theme/colors'
import { TransactionStatus } from 'types/utility'
import { assert } from 'utils/assert'
import { formatWalletName } from 'utils/formatWalletName'
import { imgOnError } from 'utils/imgOnError'
import { isCompassWallet } from 'utils/isCompassWallet'
import { trim } from 'utils/strings'
import Browser from 'webextension-polyfill'

import { handleRejectClick } from '../utils'

const useGetWallet = Wallet.useGetWallet

export type SignTransactionProps = {
  txnData: Record<string, any>
}

export function SignTransaction({ txnData }: SignTransactionProps) {
  const chainInfo = useChainInfo()
  const activeWallet = useActiveWallet()
  const activeChain = useActiveChain()

  assert(activeWallet !== null, 'activeWallet is null')
  const walletName = useMemo(() => {
    return formatWalletName(activeWallet.name)
  }, [activeWallet.name])

  const defaultGasPrice = useDefaultGasPrice({ activeChain })
  const getWallet = useGetWallet()

  const [txStatus, setTxStatus] = useState<TransactionStatus>('idle')
  const [userPreferredGasLimit, setUserPreferredGasLimit] = useState<string>('')
  const [gasPriceError, setGasPriceError] = useState<string | null>(null)
  const [signingError, setSigningError] = useState<string | null>(null)

  const [isLoadingGasLimit, setIsLoadingGasLimit] = useState<boolean>(false)
  const defaultGasEstimates = useDefaultGasEstimates()
  const gasAdjustment = useGasAdjustmentForChain(activeChain)
  const [recommendedGasLimit, setRecommendedGasLimit] = useState<number>(
    defaultGasEstimates[activeChain].DEFAULT_GAS_IBC,
  )

  const [gasPriceOption, setGasPriceOption] = useState<{
    option: GasOptions
    gasPrice: GasPrice
  }>({ gasPrice: defaultGasPrice.gasPrice, option: GasOptions.LOW })

  const siteOrigin = txnData?.origin as string | undefined
  const siteName = siteOrigin?.split('//')?.at(-1)?.split('.')?.at(-2)
  const siteLogo = useSiteLogo(siteOrigin)

  useEffect(() => {
    ;(async function fetchGasEstimate() {
      try {
        setIsLoadingGasLimit(true)
        const gasUsed = await SeiEvmTx.SimulateTransaction(
          txnData.signTxnData.to,
          txnData.signTxnData.value,
          '',
          txnData.signTxnData.data,
          gasAdjustment,
        )

        setRecommendedGasLimit(gasUsed)
      } catch (_) {
        setRecommendedGasLimit(defaultGasEstimates[activeChain].DEFAULT_GAS_IBC)
      } finally {
        setIsLoadingGasLimit(false)
      }
    })()
  }, [
    activeChain,
    defaultGasEstimates,
    gasAdjustment,
    txnData.signTxnData.data,
    txnData.signTxnData.to,
    txnData.signTxnData.value,
  ])

  const handleApproveClick = async () => {
    try {
      setSigningError(null)
      setTxStatus('loading')

      const wallet = (await getWallet(activeChain, true)) as unknown as EthWallet
      const seiEvmTx = SeiEvmTx.GetSeiEvmClient(wallet)

      const result = await seiEvmTx.sendTransaction(
        '',
        txnData.signTxnData.to,
        txnData.signTxnData.value,
        Number(userPreferredGasLimit || recommendedGasLimit),
        undefined,
        txnData.signTxnData.data,
      )

      setTxStatus('success')

      try {
        Browser.runtime.sendMessage({
          type: MessageTypes.signSeiEvmResponse,
          payload: { status: 'success', data: result.hash },
        })
      } catch {
        throw new Error('Could not send transaction to the dApp')
      }

      setTimeout(async () => {
        window.close()
      }, 1000)
    } catch (error) {
      setTxStatus('error')
      setSigningError((error as Error).message)
    }
  }

  const isApproveBtnDisabled =
    !!signingError || txStatus === 'loading' || !!gasPriceError || isLoadingGasLimit

  return (
    <div className='w-[400px] h-full relative self-center justify-self-center flex justify-center items-center mt-2'>
      <div className='relative w-[400px] overflow-clip rounded-md border border-gray-300 dark:border-gray-900'>
        <PopupLayout
          header={
            <div className='w-[396px]'>
              <Header
                imgSrc={chainInfo.chainSymbolImageUrl ?? GenericLight}
                title={
                  <Buttons.Wallet
                    brandLogo={
                      isCompassWallet() ? (
                        <img className='w-[24px] h-[24px] mr-1' src={Images.Logos.CompassCircle} />
                      ) : undefined
                    }
                    title={trim(walletName, 10)}
                    className='pr-4 cursor-default'
                  />
                }
                topColor={Colors.getChainColor(activeChain, chainInfo)}
              />
            </div>
          }
        >
          <div className='px-7 py-3 overflow-y-auto relative h-[450px]'>
            <h2 className='text-center text-lg font-bold dark:text-white-100 text-gray-900 w-full'>
              Approve Transaction
            </h2>
            <div className='flex items-center mt-3 rounded-2xl dark:bg-gray-900 bg-white-100 p-4'>
              <Avatar
                avatarImage={siteLogo}
                avatarOnError={imgOnError(Images.Misc.Globe)}
                size='sm'
                className='rounded-full overflow-hidden'
              />
              <div className='ml-3'>
                <p className='capitalize text-gray-900 dark:text-white-100 text-base font-bold'>
                  {siteName}
                </p>
                <p className='lowercase text-gray-500 dark:text-gray-400 text-xs font-medium'>
                  {siteOrigin}
                </p>
              </div>
            </div>

            <GasPriceOptions
              gasLimit={userPreferredGasLimit || recommendedGasLimit}
              setGasLimit={(value: string) => setUserPreferredGasLimit(value.toString())}
              recommendedGasLimit={recommendedGasLimit}
              gasPriceOption={gasPriceOption}
              onGasPriceOptionChange={(value: any) => setGasPriceOption(value)}
              error={gasPriceError}
              setError={setGasPriceError}
              considerGasAdjustment={false}
              chain={activeChain}
            >
              <Tabs
                className='mt-3'
                tabsList={[
                  { id: 'fees', label: 'Fees' },
                  { id: 'details', label: 'Details' },
                ]}
                tabsContent={{
                  fees: (
                    <div className='rounded-2xl p-4 mt-3 dark:bg-gray-900 bg-white-100'>
                      <div className='flex items-center'>
                        <p className='text-gray-500 dark:text-gray-100 text-sm font-medium tracking-wide'>
                          Gas Fees <span className='capitalize'>({gasPriceOption.option})</span>
                        </p>
                        <Tooltip
                          content={
                            <p className='text-gray-500 dark:text-gray-100 text-sm'>
                              You can choose higher gas fees for faster transaction processing.
                            </p>
                          }
                        >
                          <div className='relative ml-2'>
                            <img src={Images.Misc.InfoCircle} alt='Hint' />
                          </div>
                        </Tooltip>
                      </div>

                      <GasPriceOptions.Selector className='mt-2' />
                      <div className='flex items-center justify-end'>
                        <GasPriceOptions.AdditionalSettingsToggle className='p-0 mt-3' />
                      </div>
                      <GasPriceOptions.AdditionalSettings
                        className='mt-2'
                        showGasLimitWarning={true}
                      />

                      {gasPriceError ? (
                        <p className='text-red-300 text-sm font-medium mt-2 px-1'>
                          {gasPriceError}
                        </p>
                      ) : null}
                    </div>
                  ),
                  details: (
                    <pre className='text-xs text-gray-900 dark:text-white-100 dark:bg-gray-900 bg-white-100 p-4 w-full overflow-x-auto mt-3 rounded-2xl'>
                      {JSON.stringify(
                        txnData.signTxnData.details,
                        (_, value) => (typeof value === 'bigint' ? value.toString() : value),
                        2,
                      )}
                    </pre>
                  ),
                }}
              />
            </GasPriceOptions>

            {signingError && txStatus === 'error' ? (
              <ErrorCard text={signingError} className='mt-3' />
            ) : null}
          </div>

          <div className='absolute bottom-0 left-0 py-3 px-7 dark:bg-black-100 bg-gray-50 w-full'>
            <div className='flex items-center justify-center w-full space-x-3'>
              <Buttons.Generic
                title='Reject Button'
                color={Colors.gray900}
                onClick={handleRejectClick}
                disabled={txStatus === 'loading'}
              >
                Reject
              </Buttons.Generic>

              <Buttons.Generic
                title='Approve Button'
                color={Colors.getChainColor(activeChain)}
                onClick={handleApproveClick}
                disabled={isApproveBtnDisabled}
                className={`${isApproveBtnDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {txStatus === 'loading' ? <LoaderAnimation color='white' /> : 'Approve'}
              </Buttons.Generic>
            </div>
          </div>
        </PopupLayout>
      </div>
    </div>
  )
}
