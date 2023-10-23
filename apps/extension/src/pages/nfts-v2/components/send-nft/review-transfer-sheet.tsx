import { StdFee } from '@cosmjs/stargate'
import { sliceAddress } from '@leapwallet/cosmos-wallet-hooks'
import { Avatar, Buttons, Card, CardDivider, Memo } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import { ErrorCard } from 'components/ErrorCard'
import LedgerConfirmationPopup from 'components/ledger-confirmation/LedgerConfirmationPopup'
import { LoaderAnimation } from 'components/loader/Loader'
import Text from 'components/text'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { SelectedAddress } from 'pages/send-v2/types'
import React, { useState } from 'react'
import { Colors } from 'theme/colors'
import { imgOnError } from 'utils/imgOnError'
import { normalizeImageSrc } from 'utils/normalizeImageSrc'

import { NftDetailsType } from '../../context'
import { FeesView } from '../fees-view'

type ReviewNFTTransactionSheetProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  themeColor: string
  selectedAddress: SelectedAddress
  nftDetails: NftDetailsType
  fee?: StdFee
  showLedgerPopup: boolean
  loading: boolean
}

export const ReviewNFTTransferSheet: React.FC<ReviewNFTTransactionSheetProps> = ({
  isOpen,
  onClose,
  themeColor,
  selectedAddress,
  nftDetails,
  fee,
  showLedgerPopup,
  onConfirm,
  loading,
}) => {
  const defaultTokenLogo = useDefaultTokenLogo()
  const [txError, setTxError] = useState('')
  const [memo, setMemo] = useState('')

  if (showLedgerPopup && txError) {
    return <LedgerConfirmationPopup showLedgerPopup />
  }

  return (
    <BottomModal
      isOpen={isOpen}
      closeOnBackdropClick={true}
      onClose={onClose}
      title='Review Transaction'
      className='p-0'
    >
      <>
        <div className='flex flex-col items-center w-full gap-y-4 my-7'>
          <div className='rounded-2xl dark:bg-gray-900 bg-white-100 rounded-4 items-center'>
            <Text size='xs' className='pl-4 pr-4 pt-4 font-bold' color='text-gray-200'>
              Sending
            </Text>
            <div className='relative'>
              {
                <div className='absolute flex top-4 left-[68px] items-center'>
                  <p className='mr-1 invisible font-bold'>
                    {`${nftDetails?.name ?? nftDetails?.domain ?? 'NFT'}`}
                  </p>
                </div>
              }
              <Card
                avatar={
                  <Avatar
                    avatarImage={normalizeImageSrc(nftDetails?.image ?? '') ?? defaultTokenLogo}
                    size='sm'
                    avatarOnError={imgOnError(defaultTokenLogo)}
                  />
                }
                isRounded
                size='md'
                subtitle={<p>{nftDetails?.tokenId}</p>}
                title={
                  <p data-testing-id='send-review-sheet-inputAmount-ele'>
                    {`${
                      nftDetails?.name ?? nftDetails?.domain ?? nftDetails?.collection?.name + 'NFT'
                    }`}
                  </p>
                }
              />
            </div>
            <CardDivider />
            <Card
              avatar={
                <Avatar
                  avatarImage={selectedAddress?.avatarIcon}
                  emoji={selectedAddress?.emoji}
                  chainIcon={selectedAddress?.chainIcon}
                  size='sm'
                />
              }
              isRounded
              size='md'
              subtitle={
                <>
                  {sliceAddress(selectedAddress?.address)}
                  {selectedAddress?.information?.nameService ? (
                    <> &middot; {selectedAddress.information.nameService}</>
                  ) : null}
                </>
              }
              title={
                <p data-testing-id='send-review-sheet-to-ele'>{'To ' + selectedAddress?.name}</p>
              }
            />
          </div>
          <Memo
            value={memo}
            onChange={(e) => {
              setMemo(e.target.value)
            }}
          />

          {!!fee && <FeesView fee={fee} nftDetails={nftDetails} />}
          <Buttons.Generic
            color={themeColor}
            size='normal'
            className='w-[344px]'
            title='Send'
            onClick={onConfirm}
            disabled={showLedgerPopup || loading}
            data-testing-id='send-review-sheet-send-btn'
          >
            {loading ? <LoaderAnimation color={Colors.white100} /> : 'Send'}
          </Buttons.Generic>
          {txError ? <ErrorCard text={txError} /> : null}
        </div>
      </>
    </BottomModal>
  )
}
