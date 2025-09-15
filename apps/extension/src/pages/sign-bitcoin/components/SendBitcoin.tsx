/* eslint-disable @typescript-eslint/no-explicit-any */
import { calculateFee } from '@cosmjs/stargate'
import {
  CosmosTxType,
  GasOptions,
  LeapWalletApi,
  useActiveWallet,
  useAddress,
  useChainApis,
  useChainInfo,
  useDefaultGasEstimates,
  useGasAdjustmentForChain,
  useTxMetadata,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  BtcTx,
  DefaultGasEstimates,
  estimateVSize,
  fetchUtxos,
  GasPrice,
} from '@leapwallet/cosmos-wallet-sdk'
import { RootBalanceStore, RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import { BtcWallet } from '@leapwallet/leap-keychain/dist/browser/key/btc-wallet'
import { Avatar, Buttons, Header, ThemeName, useTheme } from '@leapwallet/leap-ui'
import { captureException } from '@sentry/react'
import assert from 'assert'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import Tooltip from 'components/better-tooltip'
import { ErrorCard } from 'components/ErrorCard'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import PopupLayout from 'components/layout/popup-layout'
import { LoaderAnimation } from 'components/loader/Loader'
import { Tabs } from 'components/tabs'
import { MessageTypes } from 'config/message-types'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useSiteLogo } from 'hooks/utility/useSiteLogo'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import { GenericDark, GenericLight } from 'images/logos'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Colors } from 'theme/colors'
import { TransactionStatus } from 'types/utility'
import { formatWalletName } from 'utils/formatWalletName'
import { imgOnError } from 'utils/imgOnError'
import { isSidePanel } from 'utils/isSidePanel'
import { trim } from 'utils/strings'
import Browser from 'webextension-polyfill'

import { handleRejectClick } from '../utils'

const useGetWallet = Wallet.useGetWallet

type SendBitcoinProps = {
  txnData: Record<string, any>
  rootDenomsStore: RootDenomsStore
  rootBalanceStore: RootBalanceStore
}

export const SendBitcoin = observer(
  ({ txnData, rootDenomsStore, rootBalanceStore }: SendBitcoinProps) => {
    const getWallet = useGetWallet()
    const globalTxMeta = useTxMetadata()
    const navigate = useNavigate()
    const activeChain = useActiveChain()
    const chainInfo = useChainInfo(activeChain)
    const activeWallet = useActiveWallet()
    const { theme } = useTheme()

    assert(activeWallet !== null, 'activeWallet is null')
    const walletName = useMemo(() => {
      return formatWalletName(activeWallet.name)
    }, [activeWallet.name])
    const address = useAddress()

    const siteOrigin = txnData?.origin as string | undefined
    const siteName = siteOrigin?.split('//')?.at(-1)?.split('.')?.at(-2)
    const siteLogo = useSiteLogo(siteOrigin)

    const { rpcUrl } = useChainApis(activeChain)
    const [userPreferredGasLimit, setUserPreferredGasLimit] = useState<string>('')
    const defaultGasEstimates = useDefaultGasEstimates()
    const gasAdjustment = useGasAdjustmentForChain(activeChain)
    const defaultGasLimit = useMemo(
      () =>
        parseInt(
          (
            (defaultGasEstimates[activeChain]?.DEFAULT_GAS_IBC ??
              DefaultGasEstimates.DEFAULT_GAS_IBC) * gasAdjustment
          ).toString(),
        ),
      [activeChain, defaultGasEstimates, gasAdjustment],
    )

    const [recommendedGasLimit, setRecommendedGasLimit] = useState<number>(defaultGasLimit)
    const [gasPriceError, setGasPriceError] = useState<string | null>(null)
    const defaultGasPrice = useDefaultGasPrice(rootDenomsStore.allDenoms, {
      activeChain,
    })
    const [gasPriceOption, setGasPriceOption] = useState<{
      option: GasOptions
      gasPrice: GasPrice
    }>({ gasPrice: defaultGasPrice.gasPrice, option: GasOptions.LOW })

    const [txStatus, setTxStatus] = useState<TransactionStatus>('idle')
    const [signingError, setSigningError] = useState<string | null>(null)
    const [isLoadingGasLimit, setIsLoadingGasLimit] = useState<boolean>(false)

    const txPostToDB = LeapWalletApi.useLogCosmosDappTx()

    // This is the fee used in the transaction.
    const fee = useMemo(() => {
      const gasLimit = userPreferredGasLimit ?? recommendedGasLimit
      if (!gasPriceOption.gasPrice) return
      return calculateFee(Math.ceil(Number(gasLimit)), gasPriceOption.gasPrice)
    }, [userPreferredGasLimit, recommendedGasLimit, gasPriceOption.gasPrice])

    useEffect(() => {
      ;(async function fetchGasEstimate() {
        if (rpcUrl) {
          setIsLoadingGasLimit(true)
          const utxos = await fetchUtxos(address, rpcUrl)
          const estimatedVSize = estimateVSize(utxos.length, 2, 'p2wpkh')

          setRecommendedGasLimit(estimatedVSize)
          setIsLoadingGasLimit(false)
        }
      })()
    }, [address, rpcUrl])

    const refetchData = useCallback(() => {
      setTimeout(() => {
        rootBalanceStore.refetchBalances(activeChain)
      }, 3000)
    }, [activeChain, rootBalanceStore])

    const handleApproveClick = async () => {
      try {
        if (activeWallet.walletType === WALLETTYPE.LEDGER) {
          throw new Error('Ledger transactions are not supported yet')
        }

        if (fee) {
          setSigningError(null)
          setTxStatus('loading')

          const wallet = (await getWallet(activeChain)) as unknown as BtcWallet

          const network = activeChain === 'bitcoin' ? 'mainnet' : 'testnet'
          const btcTx = new BtcTx(network, wallet, rpcUrl)
          const feeRate = parseInt(fee.amount[0].amount) / parseInt(fee.gas)
          const accounts = wallet.getAccounts()

          if (!accounts[0].pubkey) {
            throw new Error('No public key found')
          }

          const result = await btcTx.createTransaction({
            sourceAddress: address,
            addressType: 'p2wpkh',
            destinationAddress: txnData.signTxnData.to,
            amount: Number(txnData.signTxnData.amount),
            feeRate: feeRate,
            pubkey: accounts[0].pubkey,
          })

          try {
            await txPostToDB({
              txHash: result.txHex,
              txType: CosmosTxType.Dapp,
              metadata: { ...globalTxMeta, dapp_url: siteOrigin ?? origin },
              feeQuantity: fee.amount[0].amount,
              feeDenomination: fee.amount[0].denom,
              address,
              chain: activeChain,
            })
          } catch (e) {
            captureException(e, {
              extra: {
                extra_info: 'Bitcoin dApp sendBitcoin Error -- txPostToDB: ',
              },
            })
          }

          setTxStatus('success')
          try {
            Browser.runtime.sendMessage({
              type: MessageTypes.signBitcoinResponse,
              payloadId: txnData?.payloadId,
              payload: { status: 'success', data: result.txId },
            })
          } catch {
            throw new Error('Could not send transaction to the dApp')
          }

          if (isSidePanel()) {
            refetchData()
            navigate('/home')
          } else {
            window.close()
          }
        }
      } catch (error) {
        setTxStatus('error')
        setSigningError((error as Error).message)
      }
    }

    const isApproveBtnDisabled =
      !!signingError || txStatus === 'loading' || !!gasPriceError || isLoadingGasLimit

    return (
      <div
        className={classNames(
          'panel-width enclosing-panel h-full relative self-center justify-self-center flex justify-center items-center',
          { 'mt-2': !isSidePanel() },
        )}
      >
        <div
          className={classNames(
            'relative w-full overflow-clip rounded-md border border-gray-300 dark:border-gray-900',
            { 'panel-height': isSidePanel() },
          )}
        >
          <PopupLayout
            className='flex flex-col'
            header={
              <div className='w-[396px]'>
                <Header
                  imgSrc={
                    chainInfo.chainSymbolImageUrl ??
                    (theme === ThemeName.DARK ? GenericDark : GenericLight)
                  }
                  imgOnError={imgOnError(theme === ThemeName.DARK ? GenericDark : GenericLight)}
                  title={
                    <Buttons.Wallet title={trim(walletName, 10)} className='pr-4 cursor-default' />
                  }
                />
              </div>
            }
          >
            <div className='px-7 py-3 overflow-y-auto relative max-h-[calc(100%-150px)]'>
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
                gasLimit={userPreferredGasLimit || recommendedGasLimit?.toString()}
                setGasLimit={(value: string | number | BigNumber) =>
                  setUserPreferredGasLimit(value.toString())
                }
                recommendedGasLimit={recommendedGasLimit?.toString()}
                gasPriceOption={gasPriceOption}
                onGasPriceOptionChange={(value: any) => setGasPriceOption(value)}
                error={gasPriceError}
                setError={setGasPriceError}
                considerGasAdjustment={false}
                chain={activeChain}
                rootDenomsStore={rootDenomsStore}
                rootBalanceStore={rootBalanceStore}
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
                          rootDenomsStore={rootDenomsStore}
                          rootBalanceStore={rootBalanceStore}
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

            <div className='py-3 px-7 dark:bg-black-100 bg-gray-50 w-full mt-auto'>
              <div className='flex items-center justify-center w-full space-x-3'>
                <Buttons.Generic
                  title='Reject Button'
                  color={Colors.gray900}
                  onClick={() => handleRejectClick(navigate, txnData?.payloadId)}
                  disabled={txStatus === 'loading'}
                >
                  Reject
                </Buttons.Generic>

                <Buttons.Generic
                  title='Approve Button'
                  color={Colors.green600}
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
  },
)
