import {
  sliceAddress,
  sliceWord,
  TxCallback,
  useAddress,
  useChainInfo,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { ArrowDown, Info } from '@phosphor-icons/react'
import { ErrorCard } from 'components/ErrorCard'
import LedgerConfirmationPopup from 'components/ledger-confirmation/LedgerConfirmationPopup'
import BottomModal from 'components/new-bottom-modal'
import Text from 'components/text'
import { Button } from 'components/ui/button'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Wallet } from 'hooks/wallet/useWallet'
import React, { useCallback, useEffect, useState } from 'react'
import { nftStore } from 'stores/nft-store'
import { cn } from 'utils/cn'

import { NftDetailsType, useNftContext } from '../context'
import { useNFTSendContext } from './context'
import { FeesView } from './fees-view'

type ReviewNFTTransactionSheetProps = {
  isOpen: boolean
  onClose: () => void
  nftDetails: NftDetailsType
}

export const ReviewNFTTransferSheet: React.FC<ReviewNFTTransactionSheetProps> = ({
  isOpen,
  onClose,
  nftDetails,
}) => {
  const defaultTokenLogo = useDefaultTokenLogo()
  const { txError, receiverAddress, collectionAddress, sendNftReturn, setTxError } =
    useNFTSendContext()
  const { chainSymbolImageUrl: chainImage } = useChainInfo('mainCoreum')
  const { setNftDetails, setShowTxPage } = useNftContext()
  const [memo, setMemo] = useState('')
  const activeChain: SupportedChain = 'mainCoreum'
  const [isProcessing, setIsProcessing] = useState(false)
  const getWallet = Wallet.useGetWallet(activeChain)

  const fromAddress = useAddress(activeChain)

  const {
    isSending,
    fee,
    transferNFTContract,
    showLedgerPopup,
    simulateTransferNFTContract,
    fetchAccountDetailsStatus,
    addressWarning,
  } = sendNftReturn

  useEffect(() => {
    ;(async function () {
      if (
        isSending ||
        isProcessing ||
        !nftDetails ||
        !collectionAddress ||
        !receiverAddress?.address ||
        !fromAddress
      ) {
        return
      }

      const wallet = await getWallet(activeChain)
      const toAddress = receiverAddress?.address

      await simulateTransferNFTContract({
        wallet: wallet,
        collectionId: collectionAddress,
        fromAddress,
        toAddress: toAddress,
        tokenId: nftDetails?.tokenId ?? '',
        memo: memo,
      })
    })()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromAddress, collectionAddress, isProcessing, isSending, memo, nftDetails, receiverAddress])

  const modifiedCallback: TxCallback = useCallback(
    (status) => {
      setShowTxPage(true)
      onClose()
      setNftDetails(null)
    },
    [onClose, setNftDetails, setShowTxPage],
  )

  const handleSendNft = async () => {
    if (!nftDetails || !collectionAddress || !receiverAddress?.address || !fromAddress || !fee) {
      return
    }
    setIsProcessing(true)

    const wallet = await getWallet(activeChain)
    const toAddress = receiverAddress?.address

    const res = await transferNFTContract({
      wallet: wallet,
      collectionId: collectionAddress,
      fromAddress,
      toAddress,
      tokenId: nftDetails?.tokenId ?? '',
      memo: memo,
      fees: fee,
    })

    nftStore.loadNfts()
    if (res?.success) {
      modifiedCallback(res.success ? 'success' : 'txDeclined')
    } else {
      setTxError(res?.errors?.[0])
    }
    setIsProcessing(false)
  }

  const isReviewDisabled =
    !receiverAddress || ['loading', 'error'].includes(fetchAccountDetailsStatus)

  if (showLedgerPopup && !txError) {
    return <LedgerConfirmationPopup showLedgerPopup={showLedgerPopup} />
  }

  return (
    <BottomModal isOpen={isOpen} onClose={onClose} title='Review transfer' className='p-6 !pt-8'>
      <div className='flex flex-col items-center w-full gap-4 relative'>
        <div className='bg-secondary-100 p-6 rounded-xl flex w-full justify-between items-center'>
          <div className='flex flex-col gap-1'>
            <p
              className='text-lg text-monochrome font-bold !leading-[27px] break-all'
              data-testing-id='send-review-sheet-inputAmount-ele'
            >
              {sliceWord(nftDetails?.collection.name ?? '', 12, 0)} #
              {sliceWord(nftDetails?.tokenId ?? '', 5, 0)}
            </p>

            <p className='text-sm text-muted-foreground !leading-[18.9px]'>
              {sliceWord(nftDetails?.tokenId ?? '', 5, 0)}
            </p>
          </div>
          <img src={nftDetails.image ?? defaultTokenLogo} width={48} height={48} />
        </div>

        <ArrowDown
          size={40}
          className={cn(
            'absolute top-[108px] rounded-full bg-accent-green-200 flex items-center justify-center border-[5px] border-gray-50 dark:border-black-100 -mt-[18px] -mb-[18px] p-[5px]',
          )}
        />

        <div className='rounded-xl w-full overflow-hidden'>
          <div className='rounded-t-xl bg-secondary-200 p-6 flex w-full justify-between items-center'>
            <p
              className='text-lg text-monochrome font-bold !leading-[27px]'
              data-testing-id='send-review-sheet-to-ele'
            >
              {receiverAddress?.ethAddress
                ? sliceAddress(receiverAddress.ethAddress)
                : receiverAddress?.selectionType === 'currentWallet' ||
                  receiverAddress?.selectionType === 'saved'
                ? receiverAddress?.name?.split('-')[0]
                : sliceAddress(receiverAddress?.address)}
            </p>
            <img src={chainImage} width={48} height={48} />
          </div>
          {addressWarning ? (
            <div className='px-3 py-2.5 rounded-b-xl bg-accent-warning-800 items-center flex gap-1.5'>
              <Info size={16} className='text-accent-warning self-start min-w-4' />
              <Text size='xs' className='font-medium' color='text-accent-warning'>
                {addressWarning}
              </Text>
            </div>
          ) : null}
        </div>

        {memo ? (
          <div className='w-full flex items-baseline gap-2.5 p-5 rounded-xl bg-secondary-50 border border-secondary mt-0.5'>
            <p className='text-sm text-muted-foreground font-medium'>Memo:</p>
            <p className='font-medium text-sm text-monochrome !leading-[22.4px] overflow-auto break-words'>
              {memo}
            </p>
          </div>
        ) : null}

        {!!fee && <FeesView nftDetails={nftDetails} fee={fee} />}

        <Button
          className='w-full mt-4'
          onClick={handleSendNft}
          disabled={isReviewDisabled || showLedgerPopup || isProcessing || isSending}
          data-testing-id='send-review-sheet-send-btn'
        >
          {isProcessing ? 'Sending...' : 'Confirm transfer'}
        </Button>
        {txError ? <ErrorCard text={txError} /> : null}
      </div>
    </BottomModal>
  )
}
