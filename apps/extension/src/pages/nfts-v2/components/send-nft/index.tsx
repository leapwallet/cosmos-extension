import {
  SelectedNetworkType,
  useActiveChain,
  useSendNft,
  UseSendNftReturnType,
} from '@leapwallet/cosmos-wallet-hooks'
import { RootBalanceStore, RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import { Buttons } from '@leapwallet/leap-ui'
import assert from 'assert'
import { useGetWalletAddresses } from 'hooks/useGetWalletAddresses'
import { useThemeColor } from 'hooks/utility/useThemeColor'
import { Wallet } from 'hooks/wallet/useWallet'
import { observer } from 'mobx-react-lite'
import { SelectedAddress } from 'pages/send-v2/types'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { nftStore } from 'stores/nft-store'
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

type SendNftCardProps = {
  nftDetails: NftDetailsType
  rootDenomsStore: RootDenomsStore
  rootBalanceStore: RootBalanceStore
  forceNetwork?: SelectedNetworkType
}

export const SendNftCard = observer(
  ({ nftDetails, rootDenomsStore, rootBalanceStore, forceNetwork }: SendNftCardProps) => {
    const themeColor = useThemeColor()
    const [showReviewSheet, setShowReviewSheet] = useState(false)
    const [addressError, setAddressError] = useState<string>()

    const _activeChain = useActiveChain()
    const activeChain = useMemo(() => {
      return nftDetails?.chain ?? _activeChain
    }, [_activeChain, nftDetails?.chain])
    const walletAddresses = useGetWalletAddresses(activeChain)
    const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null)
    const [associatedSeiAddress, setAssociatedSeiAddress] = useState<string>('')
    const [isProcessing, setIsProcessing] = useState(false)

    const [txError, setTxError] = useState('')
    const [memo, setMemo] = useState('')
    const txCallback = useTxCallBack()
    const getWallet = Wallet.useGetWallet(activeChain)

    const collectionAddress = useMemo(() => {
      return nftDetails?.collection.address ?? ''
    }, [nftDetails?.collection.address])

    const fromAddress = walletAddresses[0]
    const denoms = rootDenomsStore.allDenoms

    const sendNftReturn = useSendNft(denoms, collectionAddress, activeChain, forceNetwork)
    const {
      isSending,
      fee,
      transferNFTContract,
      showLedgerPopup,
      simulateTransferNFTContract,
      fetchAccountDetailsStatus,
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

        const toAddress = selectedAddress?.address

        const wallet = await getWallet(activeChain)

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

      const toAddress = selectedAddress?.address
      const wallet = await getWallet(activeChain)
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
        {!!fee && (
          <FeesView
            fee={fee}
            nftDetails={nftDetails}
            rootDenomsStore={rootDenomsStore}
            rootBalanceStore={rootBalanceStore}
          />
        )}
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

        {selectedAddress && (
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
  },
)
