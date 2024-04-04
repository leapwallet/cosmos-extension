import { useSendNft } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons } from '@leapwallet/leap-ui'
import { useQueryClient } from '@tanstack/react-query'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useThemeColor } from 'hooks/utility/useThemeColor'
import { Wallet } from 'hooks/wallet/useWallet'
import { SelectedAddress } from 'pages/send-v2/types'
import React, { useState } from 'react'
import { useEffect } from 'react'
import { isCompassWallet } from 'utils/isCompassWallet'
import { useTxCallBack } from 'utils/txCallback'

import { NftDetailsType } from '../../context'
import { FeesView } from '../fees-view'
import { RecipientCard } from '../recipient-card'
import { ReviewNFTTransferSheet } from './review-transfer-sheet'

export function SendNftCard({ nftDetails }: { nftDetails: NftDetailsType }) {
  const themeColor = useThemeColor()
  const [showReviewSheet, setShowReviewSheet] = useState(false)
  const [addressError, setAddressError] = useState<string>()
  const { activeWallet } = useActiveWallet()
  const address = nftDetails?.chain ? activeWallet?.addresses[nftDetails?.chain] : undefined
  const queryClient = useQueryClient()

  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null)

  const { isSending, transferNFTContract, fee, simulateTransferNFTContract } = useSendNft()
  const [isProcessing, setIsProcessing] = useState(false)
  const [memo, setMemo] = useState('')

  const showLedgerPopup = false

  const txCallback = useTxCallBack()
  const getWallet = Wallet.useGetWallet()

  const simulate = async () => {
    if (
      !nftDetails ||
      !(nftDetails?.collection.address ?? nftDetails.collection.contractAddress) ||
      !selectedAddress?.address ||
      !address
    ) {
      return
    }
    const wallet = await getWallet()
    await simulateTransferNFTContract({
      wallet: wallet,
      collectionId: nftDetails?.collection.address ?? nftDetails.collection.contractAddress,
      fromAddress: address,
      toAddress: selectedAddress?.address,
      tokenId: nftDetails?.tokenId ?? '',
      memo: memo,
    })
  }

  useEffect(() => {
    if (isSending || isProcessing) return
    simulate()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddress])

  const handleSendNft = async () => {
    if (
      !nftDetails ||
      !(nftDetails?.collection.address ?? nftDetails.collection.contractAddress) ||
      !selectedAddress?.address ||
      !address ||
      !fee
    ) {
      return
    }
    setIsProcessing(true)
    const wallet = await getWallet()

    const res = await transferNFTContract({
      wallet: wallet,
      collectionId: nftDetails?.collection.address ?? nftDetails.collection.contractAddress,
      fromAddress: address,
      toAddress: selectedAddress?.address,
      tokenId: nftDetails?.tokenId ?? '',
      memo: memo,
      fees: fee,
    })
    await queryClient.invalidateQueries([
      'nft-records',
      'nft-contracts-list',
      'get-owned-collection',
      'get-ten-owned-collection',
    ])
    await queryClient.resetQueries([
      'nft-records',
      'nft-contracts-list',
      'get-owned-collection',
      'get-ten-owned-collection',
    ])

    if (res?.success) {
      txCallback(res.success ? 'success' : 'txDeclined')
    }
  }

  return (
    <>
      <div className='my-2 flex'></div>
      <RecipientCard
        themeColor={themeColor}
        selectedAddress={selectedAddress}
        setSelectedAddress={setSelectedAddress}
        addressError={addressError}
        setAddressError={setAddressError}
      />

      <div className='my-2 flex'></div>
      {!!fee && <FeesView fee={fee} nftDetails={nftDetails} />}
      <div className='my-2 flex'></div>
      <Buttons.Generic
        size='normal'
        color={themeColor}
        onClick={() => {
          setShowReviewSheet(true)
        }}
        className='w-[344px]'
        disabled={!selectedAddress || !!addressError}
        data-testing-id='send-review-transfer-btn'
      >
        Review Transfer
      </Buttons.Generic>

      <div className='my-2 flex'></div>

      {selectedAddress && isCompassWallet() && (
        <ReviewNFTTransferSheet
          memo={memo}
          setMemo={setMemo}
          nftDetails={nftDetails}
          selectedAddress={selectedAddress}
          themeColor={themeColor}
          isOpen={showReviewSheet}
          loading={isProcessing || isSending}
          fee={fee}
          onConfirm={handleSendNft}
          showLedgerPopup={showLedgerPopup}
          onClose={() => {
            setShowReviewSheet(false)
          }}
        />
      )}
    </>
  )
}
