import {
  useActiveChain,
  useIsSeiEvmChain,
  useSendNft,
  UseSendNftReturnType,
} from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfos, getSeiEvmAddressToShow } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons } from '@leapwallet/leap-ui'
import { useQueryClient } from '@tanstack/react-query'
import assert from 'assert'
import { useGetWalletAddresses } from 'hooks/useGetWalletAddresses'
import { useThemeColor } from 'hooks/utility/useThemeColor'
import { Wallet } from 'hooks/wallet/useWallet'
import { SelectedAddress } from 'pages/send-v2/types'
import React, { createContext, useContext, useMemo, useState } from 'react'
import { useEffect } from 'react'
import { isCompassWallet } from 'utils/isCompassWallet'
import { useTxCallBack } from 'utils/txCallback'

import { NftDetailsType } from '../../context'
import { FeesView } from '../fees-view'
import { RecipientCard } from '../recipient-card'
import { ReviewNFTTransferSheet } from './review-transfer-sheet'

const SendNftCardContext = createContext<UseSendNftReturnType | null>(null)

export function useSendNftCardContext() {
  const context = useContext(SendNftCardContext)
  assert(context !== null, 'SendNftCardContext must be used within SendNftCard')
  return context
}

export function SendNftCard({ nftDetails }: { nftDetails: NftDetailsType }) {
  const themeColor = useThemeColor()
  const [showReviewSheet, setShowReviewSheet] = useState(false)
  const [addressError, setAddressError] = useState<string>()
  const queryClient = useQueryClient()

  const isSeiEvmChain = useIsSeiEvmChain()
  const walletAddresses = useGetWalletAddresses(nftDetails?.chain)
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null)
  const [associatedSeiAddress, setAssociatedSeiAddress] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)

  const [txError, setTxError] = useState('')
  const [memo, setMemo] = useState('')
  const txCallback = useTxCallBack()
  const activeChain = useActiveChain()
  const getWallet = Wallet.useGetWallet()

  const collectionAddress = useMemo(() => {
    return nftDetails?.collection.address ?? nftDetails?.collection.contractAddress ?? ''
  }, [nftDetails?.collection.address, nftDetails?.collection.contractAddress])

  const fromAddress = useMemo(() => {
    let address = walletAddresses[0]
    if (isSeiEvmChain && !collectionAddress.toLowerCase().startsWith('0x')) {
      address = walletAddresses[1]
    }

    return address
  }, [collectionAddress, isSeiEvmChain, walletAddresses])

  const sendNftReturn = useSendNft(collectionAddress)
  const {
    isSending,
    fee,
    transferNFTContract,
    showLedgerPopup,
    simulateTransferNFTContract,
    fetchAccountDetailsStatus,
    fetchAccountDetailsData,
  } = sendNftReturn

  useEffect(() => {
    ;(async function () {
      if (
        isSending ||
        isProcessing ||
        !nftDetails ||
        !collectionAddress ||
        !selectedAddress?.address ||
        !walletAddresses.length
      ) {
        return
      }

      let wallet
      let toAddress = selectedAddress?.address

      if (collectionAddress.toLowerCase().startsWith('0x')) {
        wallet = await getWallet(nftDetails.chain, true)

        if (
          toAddress.toLowerCase().startsWith(ChainInfos[activeChain].addressPrefix) &&
          fetchAccountDetailsData?.pubKey.key
        ) {
          toAddress = getSeiEvmAddressToShow(fetchAccountDetailsData.pubKey.key)
        }
      } else {
        wallet = await getWallet()

        if (
          selectedAddress?.address.toLowerCase().startsWith('0x') &&
          !collectionAddress.toLowerCase().startsWith('0x') &&
          associatedSeiAddress
        ) {
          toAddress = associatedSeiAddress
        }
      }

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
  }, [
    fromAddress,
    collectionAddress,
    isProcessing,
    isSending,
    memo,
    nftDetails,
    selectedAddress,
    walletAddresses.length,
  ])

  const handleSendNft = async () => {
    if (!nftDetails || !collectionAddress || !selectedAddress?.address || !fromAddress || !fee) {
      return
    }

    let wallet
    let toAddress = selectedAddress?.address

    if (collectionAddress.toLowerCase().startsWith('0x')) {
      wallet = await getWallet(nftDetails.chain, true)

      if (
        toAddress.toLowerCase().startsWith(ChainInfos[activeChain].addressPrefix) &&
        fetchAccountDetailsData?.pubKey.key
      ) {
        toAddress = getSeiEvmAddressToShow(fetchAccountDetailsData.pubKey.key)
      }
    } else {
      wallet = await getWallet()

      if (
        selectedAddress?.address.toLowerCase().startsWith('0x') &&
        !collectionAddress.toLowerCase().startsWith('0x') &&
        associatedSeiAddress
      ) {
        toAddress = associatedSeiAddress
      }
    }

    const res = await transferNFTContract({
      wallet: wallet,
      collectionId: collectionAddress,
      fromAddress,
      toAddress,
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
    } else {
      setIsProcessing(false)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      setTxError(res?.errors?.[0])
    }
  }

  const isReviewDisabled =
    !selectedAddress || !!addressError || ['loading', 'error'].includes(fetchAccountDetailsStatus)
  const handleReviewTransferClick = () => {
    setShowReviewSheet(true)
  }

  return (
    <SendNftCardContext.Provider value={sendNftReturn}>
      <div className='my-2 flex'></div>
      <RecipientCard
        themeColor={themeColor}
        selectedAddress={selectedAddress}
        setSelectedAddress={setSelectedAddress}
        addressError={addressError}
        setAddressError={setAddressError}
        collectionAddress={collectionAddress}
        associatedSeiAddress={associatedSeiAddress}
        setAssociatedSeiAddress={setAssociatedSeiAddress}
      />

      <div className='my-2 flex'></div>
      {!!fee && <FeesView fee={fee} nftDetails={nftDetails} />}
      <div className='my-2 flex'></div>

      <Buttons.Generic
        size='normal'
        color={themeColor}
        onClick={handleReviewTransferClick}
        className='w-[344px]'
        disabled={isReviewDisabled}
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
          showMemo={!collectionAddress.toLowerCase().startsWith('0x')}
          txError={txError}
        />
      )}
    </SendNftCardContext.Provider>
  )
}
