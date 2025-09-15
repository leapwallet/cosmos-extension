import {
  formatTokenAmount,
  isERC20Token,
  sliceAddress,
  TxCallback,
  useformatCurrency,
  useGetChains,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  getBech32Address,
  isAptosChain,
  isSolanaChain,
  isSuiChain,
  LeapLedgerSignerEth,
  LedgerError,
  pubKeyToEvmAddressToShow,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { RootERC20DenomsStore } from '@leapwallet/cosmos-wallet-store'
import { EthWallet } from '@leapwallet/leap-keychain'
import { ArrowDown, Check } from '@phosphor-icons/react'
import { captureException } from '@sentry/react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { ErrorCard } from 'components/ErrorCard'
import { LedgerDisconnectError } from 'components/ErrorCard/LedgerDisconnectError'
import LedgerConfirmationPopup from 'components/ledger-confirmation/LedgerConfirmationPopup'
import BottomModal from 'components/new-bottom-modal'
import { Button } from 'components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'
import { useOpenLedgerReconnect } from 'hooks/useOpenLedgerReconnect'
import { useCaptureTxError } from 'hooks/utility/useCaptureTxError'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Wallet } from 'hooks/wallet/useWallet'
import { CopyIcon } from 'icons/copy-icon'
import { Images } from 'images'
import loadingImage from 'lottie-files/swaps-btn-loading.json'
import Lottie from 'lottie-react'
import { observer } from 'mobx-react-lite'
import { useExecuteSkipTx } from 'pages/send/components/review-transfer/executeSkipTx'
import { useSendContext } from 'pages/send/context'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ibcDataStore } from 'stores/chains-api-store'
import { UserClipboard } from 'utils/clipboard'
import { isLedgerDisconnected } from 'utils/isLedgerDisconnectedError'
import { opacityFadeInOut, transition150 } from 'utils/motion-variants'

type ReviewTransactionSheetProps = {
  isOpen: boolean
  onClose: () => void
  setShowTxPage: (val: boolean) => void
  rootERC20DenomsStore: RootERC20DenomsStore
}

export const ReviewTransferSheet = observer(
  ({ isOpen, onClose, setShowTxPage, rootERC20DenomsStore }: ReviewTransactionSheetProps) => {
    const [isCopied, setIsCopied] = useState(false)
    const [formatCurrency] = useformatCurrency()
    const defaultTokenLogo = useDefaultTokenLogo()
    const chains = useGetChains()
    const getWallet = Wallet.useGetWallet()
    const allERC20Denoms = rootERC20DenomsStore.allERC20Denoms

    const [isLedgerDisconnectedError, setIsLedgerDisconnectedError] = useState(false)
    const openLedgerReconnect = useOpenLedgerReconnect()

    const {
      memo,
      selectedToken,
      selectedAddress,
      fee,
      showLedgerPopup,
      inputAmount,
      tokenFiatValue,
      isSending,
      txError,
      isIBCTransfer,
      sendDisabled,
      confirmSend,
      setTxError,
      confirmSendEth,
      clearTxError,
      setShowLedgerPopup,
      userPreferredGasPrice,
      userPreferredGasLimit,
      gasEstimate,
      transferData,
      isIbcUnwindingDisabled,
      fetchAccountDetailsData,
      sendActiveChain,
      setIsSending,
    } = useSendContext()

    const {
      confirmSkipTx,
      txnProcessing,
      error,
      showLedgerPopupSkipTx,
      setShowLedgerPopupSkipTx,
      setError,
    } = useExecuteSkipTx()
    const fiatValue = useMemo(
      () => formatCurrency(new BigNumber(inputAmount).multipliedBy(tokenFiatValue ?? 0)),
      [formatCurrency, inputAmount, tokenFiatValue],
    )

    const receiverChainName = useMemo(() => {
      return chains?.[selectedAddress?.chainName as SupportedChain]?.chainName
    }, [chains, selectedAddress?.chainName])

    const handleClose = useCallback(() => {
      setError('')
      onClose()
      setIsLedgerDisconnectedError(false)

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const modifiedCallback: TxCallback = useCallback(
      (status) => {
        setShowTxPage(true)
        onClose()
      },
      [onClose, setShowTxPage],
    )

    const handleSend = useCallback(async () => {
      if (isLedgerDisconnectedError) {
        setIsLedgerDisconnectedError(false)
        openLedgerReconnect()
        return
      }
      clearTxError()
      if (!fee || !selectedAddress?.address || !selectedToken) {
        return
      }

      try {
        let toAddress = selectedAddress.address
        const _isERC20Token = isERC20Token(
          Object.keys(allERC20Denoms),
          selectedToken?.coinMinimalDenom,
        )

        if (
          chains[sendActiveChain]?.evmOnlyChain &&
          _isERC20Token &&
          toAddress.toLowerCase().startsWith(chains[sendActiveChain].addressPrefix) &&
          fetchAccountDetailsData?.pubKey.key
        ) {
          toAddress = pubKeyToEvmAddressToShow(fetchAccountDetailsData.pubKey.key)
        }

        if (chains[sendActiveChain]?.evmOnlyChain) {
          const wallet = await getWallet(sendActiveChain, true)
          const nativeTokenKey = Object.keys(chains[sendActiveChain]?.nativeDenoms ?? {})?.[0]

          await confirmSendEth(
            toAddress,
            inputAmount,
            userPreferredGasLimit ?? gasEstimate,
            wallet as unknown as EthWallet,
            modifiedCallback,
            parseInt(userPreferredGasPrice?.amount?.toString() ?? ''),
            {
              isERC20Token: _isERC20Token,
              contractAddress: selectedToken.coinMinimalDenom,
              decimals: selectedToken.coinDecimals,
              nativeTokenKey,
            },
          )
        } else if (
          transferData?.isSkipTransfer &&
          !isIbcUnwindingDisabled &&
          (isIBCTransfer || selectedAddress?.address?.startsWith('init'))
        ) {
          // If skiptranfer is supported and ibc unwinding in not disabled and it is ibc transfer
          // we use Skip API for transfer or
          // else we use default Cosmos API

          const wallet = await getWallet(sendActiveChain, true)
          if (sendActiveChain === 'evmos' && wallet instanceof LeapLedgerSignerEth) {
            await confirmSend(
              {
                selectedToken: selectedToken,
                toAddress: selectedAddress?.address || '',
                amount: new BigNumber(inputAmount),
                memo: memo,
                fees: fee,
              },
              modifiedCallback,
            )
          } else {
            confirmSkipTx(modifiedCallback)
          }
        } else {
          const sendChainInfo = chains[sendActiveChain]
          let toAddress = selectedAddress?.address
          if (
            Number(sendChainInfo.bip44.coinType) === 60 &&
            toAddress.toLowerCase().startsWith('0x') &&
            sendChainInfo.key !== 'injective'
          ) {
            toAddress = getBech32Address(sendChainInfo.addressPrefix, toAddress)
          }
          await confirmSend(
            {
              selectedToken: selectedToken,
              toAddress,
              amount: new BigNumber(inputAmount),
              memo: memo,
              fees: fee,
              ibcChannelId: ibcDataStore.getSourceChainChannelId(
                sendActiveChain,
                selectedAddress?.chainName as SupportedChain,
              ),
            },
            modifiedCallback,
          )
        }
      } catch (err: unknown) {
        if (err instanceof LedgerError) {
          if (isLedgerDisconnected(err?.message)) {
            setIsLedgerDisconnectedError(true)
          }
          setTxError(err.message)
          setShowLedgerPopup(false)
          setShowLedgerPopupSkipTx(false)
        }
        setIsSending(false)
        captureException(err)
      }
    }, [
      clearTxError,
      fee,
      selectedAddress?.address,
      selectedToken,
      allERC20Denoms,
      chains,
      sendActiveChain,
      fetchAccountDetailsData?.pubKey?.key,
      transferData?.isSkipTransfer,
      isIbcUnwindingDisabled,
      isIBCTransfer,
      getWallet,
      confirmSendEth,
      inputAmount,
      userPreferredGasLimit,
      gasEstimate,
      userPreferredGasPrice?.amount,
      confirmSend,
      memo,
      modifiedCallback,
      confirmSkipTx,
      setIsSending,
      setTxError,
      setShowLedgerPopup,
      setShowLedgerPopupSkipTx,
      selectedAddress?.chainName,
      openLedgerReconnect,
      isLedgerDisconnectedError,
    ])

    useCaptureTxError(txError)

    const onCloseLedgerPopup = useCallback(() => {
      setShowLedgerPopup(false)
      setShowLedgerPopupSkipTx(false)
    }, [setShowLedgerPopup, setShowLedgerPopupSkipTx])

    useEffect(() => {
      if (isCopied) {
        setTimeout(() => {
          setIsCopied(false)
        }, 2_000)
      }
    }, [isCopied])

    const senderChainIcon = useMemo(() => {
      if (selectedToken?.tokenBalanceOnChain) {
        return chains?.[selectedToken?.tokenBalanceOnChain as SupportedChain]?.chainSymbolImageUrl
      }
      return null
    }, [chains, selectedToken?.tokenBalanceOnChain])

    const receiverChainIcon = useMemo(() => {
      if (
        !!chains?.[sendActiveChain]?.evmOnlyChain ||
        isAptosChain(sendActiveChain) ||
        isSuiChain(sendActiveChain) ||
        isSolanaChain(sendActiveChain)
      ) {
        return chains?.[sendActiveChain]?.chainSymbolImageUrl
      }
      return chains?.[selectedAddress?.chainName as SupportedChain]?.chainSymbolImageUrl
    }, [chains, sendActiveChain, selectedAddress?.chainName])

    return (
      <>
        <BottomModal
          isOpen={isOpen}
          onClose={handleClose}
          title='Review transfer'
          className='p-6 !pt-8'
        >
          <div className='flex flex-col items-center w-full gap-4 relative'>
            <div className='bg-secondary-100 p-6 rounded-xl flex w-full justify-between items-center'>
              <div className='flex flex-col gap-1'>
                <p
                  className='text-lg text-monochrome font-bold !leading-[27px]'
                  data-testing-id='send-review-sheet-inputAmount-ele'
                >
                  {formatTokenAmount(inputAmount, selectedToken?.symbol ?? '')}
                </p>

                <p className='text-sm text-muted-foreground !leading-[18.9px]'>{fiatValue}</p>
              </div>
              <div className='relative flex flex-col items-center justify-center h-[48px] w-[48px] shrink-0'>
                <img src={selectedToken?.img ?? defaultTokenLogo} width={42} height={42} />
                {senderChainIcon ? (
                  <img
                    src={senderChainIcon}
                    width={18}
                    height={18}
                    className='absolute bottom-0 right-0 rounded-full bg-secondary-50'
                  />
                ) : null}
              </div>
            </div>

            <ArrowDown
              size={40}
              className={classNames(
                'absolute top-[108px] rounded-full bg-accent-green-200 flex items-center justify-center border-[5px] border-gray-50 dark:border-black-100 -mt-[18px] -mb-[18px] p-[5px]',
              )}
            />

            <div className='bg-secondary-200 p-6 rounded-xl flex w-full justify-between items-center'>
              <div
                className='flex items-center gap-1.5 cursor-pointer'
                onClick={(e) => {
                  e.stopPropagation()
                  UserClipboard.copyText(
                    selectedAddress?.ethAddress || selectedAddress?.address || '',
                  )
                  setIsCopied(true)
                }}
              >
                <p
                  className='text-lg text-monochrome font-bold !leading-[27px]'
                  data-testing-id='send-review-sheet-to-ele'
                >
                  {selectedAddress?.ethAddress
                    ? sliceAddress(selectedAddress.ethAddress)
                    : selectedAddress?.selectionType === 'currentWallet'
                    ? selectedAddress?.name?.split('-')[0]
                    : sliceAddress(selectedAddress?.address)}
                </p>

                <AnimatePresence mode='wait'>
                  {isCopied ? (
                    <motion.span
                      key='copied'
                      transition={transition150}
                      variants={opacityFadeInOut}
                      initial='hidden'
                      animate='visible'
                      exit='hidden'
                      className='flex items-center gap-1 '
                    >
                      <Check className='size-5 text-accent-green' />
                    </motion.span>
                  ) : (
                    <motion.span
                      key='address'
                      transition={transition150}
                      variants={opacityFadeInOut}
                      initial='hidden'
                      animate='visible'
                      exit='hidden'
                      className='flex items-center gap-1'
                    >
                      <CopyIcon className='size-5 text-muted-foreground' />
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <img
                src={
                  receiverChainIcon ||
                  selectedAddress?.avatarIcon ||
                  Images.Misc.getWalletIconAtIndex(0)
                }
                width={48}
                height={48}
                className='rounded-full'
              />
            </div>

            {memo ? (
              <div className='w-full flex items-baseline gap-2.5 p-5 rounded-xl bg-secondary-100 border border-secondary mt-0.5'>
                <p className='text-sm text-muted-foreground font-medium'>Memo:</p>
                <p className='font-medium text-sm text-monochrome !leading-[22.4px] overflow-auto break-words'>
                  {memo}
                </p>
              </div>
            ) : null}

            {!isLedgerDisconnectedError && (txError || error) ? (
              <ErrorCard text={txError || error} />
            ) : null}

            {isLedgerDisconnectedError ? <LedgerDisconnectError /> : null}

            <Button
              className='w-full mt-4'
              onClick={handleSend}
              disabled={showLedgerPopup || isSending || sendDisabled || txnProcessing}
              data-testing-id='send-review-sheet-send-btn'
            >
              {isLedgerDisconnectedError ? (
                'Connect Ledger'
              ) : isSending || txnProcessing ? (
                <Lottie
                  loop={true}
                  autoplay={true}
                  animationData={loadingImage}
                  rendererSettings={{
                    preserveAspectRatio: 'xMidYMid slice',
                  }}
                  className={'h-[24px] w-[24px]'}
                />
              ) : (
                'Confirm Send'
              )}
            </Button>
          </div>
        </BottomModal>
        <LedgerConfirmationPopup
          showLedgerPopup={(showLedgerPopup || showLedgerPopupSkipTx) && !txError}
          onCloseLedgerPopup={onCloseLedgerPopup}
        />
      </>
    )
  },
)
