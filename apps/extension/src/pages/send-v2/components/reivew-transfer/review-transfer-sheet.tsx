import {
  formatTokenAmount,
  isERC20Token,
  sliceAddress,
  useformatCurrency,
  useGetChains,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  LeapLedgerSignerEth,
  LedgerError,
  pubKeyToEvmAddressToShow,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { RootERC20DenomsStore } from '@leapwallet/cosmos-wallet-store'
import { EthWallet } from '@leapwallet/leap-keychain'
import { Avatar, Buttons } from '@leapwallet/leap-ui'
import { ArrowRight } from '@phosphor-icons/react'
import { captureException } from '@sentry/react'
import BigNumber from 'bignumber.js'
import BottomModal from 'components/bottom-modal'
import { ErrorCard } from 'components/ErrorCard'
import LedgerConfirmationPopup from 'components/ledger-confirmation/LedgerConfirmationPopup'
import { TokenImageWithFallback } from 'components/token-image-with-fallback'
import { useCaptureTxError } from 'hooks/utility/useCaptureTxError'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Wallet } from 'hooks/wallet/useWallet'
import { observer } from 'mobx-react-lite'
import { useSendContext } from 'pages/send-v2/context'
import React, { useCallback, useMemo, useState } from 'react'
import { Colors } from 'theme/colors'
import { imgOnError } from 'utils/imgOnError'

import { useExecuteSkipTx } from './executeSkipTx'

type ReviewTransactionSheetProps = {
  isOpen: boolean
  onClose: () => void
  rootERC20DenomsStore: RootERC20DenomsStore
}

export const ReviewTransferSheet = observer(
  ({ isOpen, onClose, rootERC20DenomsStore }: ReviewTransactionSheetProps) => {
    const [formatCurrency] = useformatCurrency()
    const defaultTokenLogo = useDefaultTokenLogo()
    const [useChainImgFallback, setUseChainImgFallback] = useState(false)
    const chains = useGetChains()
    const getWallet = Wallet.useGetWallet()
    const allERC20Denoms = rootERC20DenomsStore.allERC20Denoms

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
      associatedSeiAddress,
      sendActiveChain,
      associated0xAddress,
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

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleSend = useCallback(async () => {
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

        if (selectedAddress.address.toLowerCase().startsWith('0x') && associatedSeiAddress) {
          toAddress = associatedSeiAddress
        }

        if (associated0xAddress) {
          toAddress = associated0xAddress
        }

        if (chains[sendActiveChain]?.evmOnlyChain) {
          const wallet = await getWallet(sendActiveChain, true)
          const nativeTokenKey = Object.keys(chains[sendActiveChain]?.nativeDenoms ?? {})?.[0]

          await confirmSendEth(
            toAddress,
            inputAmount,
            userPreferredGasLimit ?? gasEstimate,
            wallet as unknown as EthWallet,
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
            await confirmSend({
              selectedToken: selectedToken,
              toAddress: associatedSeiAddress || selectedAddress?.address || '',
              amount: new BigNumber(inputAmount),
              memo: memo,
              fees: fee,
            })
          } else {
            confirmSkipTx()
          }
        } else {
          await confirmSend({
            selectedToken: selectedToken,
            toAddress: associatedSeiAddress || selectedAddress?.address || '',
            amount: new BigNumber(inputAmount),
            memo: memo,
            fees: fee,
          })
        }
      } catch (err: unknown) {
        if (err instanceof LedgerError) {
          setTxError(err.message)
          setShowLedgerPopup(false)
          setShowLedgerPopupSkipTx(false)
        }
        setIsSending(false)
        captureException(err)
      }
    }, [
      clearTxError,
      setShowLedgerPopup,
      setTxError,
      setShowLedgerPopupSkipTx,
      fee,
      selectedAddress?.address,
      selectedToken,
      allERC20Denoms,
      chains,
      sendActiveChain,
      fetchAccountDetailsData?.pubKey?.key,
      associatedSeiAddress,
      associated0xAddress,
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
      confirmSkipTx,
      setIsSending,
    ])

    useCaptureTxError(txError)

    const onCloseLedgerPopup = useCallback(() => {
      setShowLedgerPopup(false)
      setShowLedgerPopupSkipTx(false)
    }, [setShowLedgerPopup, setShowLedgerPopupSkipTx])

    return (
      <>
        <BottomModal
          isOpen={isOpen}
          closeOnBackdropClick={true}
          onClose={handleClose}
          title='Review Transaction'
          contentClassName='!bg-white-100 dark:!bg-gray-950'
          className='p-6'
        >
          <div className='flex flex-col items-center w-full gap-y-4'>
            <div className='w-full flex items-center gap-2 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900'>
              <div className='flex flex-col flex-1 items-center'>
                <div className='w-11 h-11 rounded-full relative bg-gray-100 p-2 mb-4 dark:bg-gray-850 shrink-0 flex items-center justify-center'>
                  <TokenImageWithFallback
                    assetImg={selectedToken?.img}
                    text={selectedToken?.symbol ?? ''}
                    altText={selectedToken?.symbol ?? ''}
                    imageClassName='w-full h-full rounded-full bg-gray-200 dark:bg-gray-800'
                    containerClassName='w-full h-full rounded-full bg-gray-200 dark:bg-gray-800'
                    textClassName='text-[8px] !leading-[11px]'
                  />
                  {chains?.[sendActiveChain]?.chainSymbolImageUrl && !useChainImgFallback ? (
                    <img
                      src={chains?.[sendActiveChain]?.chainSymbolImageUrl}
                      alt={chains?.[sendActiveChain]?.chainName ?? ''}
                      onError={() => {
                        setUseChainImgFallback(true)
                      }}
                      className='absolute bottom-0 right-0 h-4 w-4'
                    />
                  ) : null}
                </div>

                <p
                  className='text-sm text-black-100 dark:text-white-100 font-bold mb-1'
                  data-testing-id='send-review-sheet-inputAmount-ele'
                >
                  {formatTokenAmount(inputAmount, selectedToken?.symbol ?? '')}
                </p>

                <p className='text-xs text-gray-800 dark:text-gray-200 font-medium'>
                  {fiatValue} &middot; on {chains?.[sendActiveChain]?.chainName}
                </p>
              </div>

              <ArrowRight
                size={24}
                className='text-black-100 shrink-0 dark:text-white-100 bg-gray-100 dark:bg-gray-850 rounded-full p-1.5'
              />
              <div className='flex flex-col flex-1 items-center'>
                <Avatar
                  avatarImage={selectedAddress?.avatarIcon}
                  emoji={selectedAddress?.emoji}
                  chainIcon={selectedAddress?.chainIcon}
                  size='sm'
                  avatarOnError={imgOnError(defaultTokenLogo)}
                  className='mb-4 bg-gray-100 dark:bg-gray-850 rounded-full p-2 !h-11 !w-11'
                />

                <p
                  className='text-sm text-black-100 dark:text-white-100 font-bold mb-1 text-center'
                  data-testing-id='send-review-sheet-to-ele'
                >
                  {selectedAddress?.ethAddress && selectedAddress?.chainName !== 'injective'
                    ? sliceAddress(selectedAddress.ethAddress)
                    : selectedAddress?.selectionType === 'currentWallet'
                    ? selectedAddress?.name?.split('-')[0]
                    : selectedAddress?.name}
                </p>

                {receiverChainName ? (
                  <p className='text-xs text-gray-800 dark:text-gray-200 font-medium'>
                    on {receiverChainName} <br />
                  </p>
                ) : null}
              </div>
            </div>

            {memo ? (
              <div className='w-full flex items-baseline gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900'>
                <p className='text-sm text-gray-800 dark:text-gray-200 font-bold'>Memo</p>
                <p className='font-medium text-md text-black-100 dark:text-white-100'>{memo}</p>
              </div>
            ) : null}

            <Buttons.Generic
              color={Colors.green600}
              size='normal'
              title='Send'
              className='w-full mt-2'
              onClick={handleSend}
              disabled={showLedgerPopup || isSending || sendDisabled || txnProcessing}
              data-testing-id='send-review-sheet-send-btn'
            >
              {isSending || txnProcessing ? 'Sending...' : 'Confirm Send'}
            </Buttons.Generic>
            {txError || error ? <ErrorCard text={txError || error} /> : null}
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
