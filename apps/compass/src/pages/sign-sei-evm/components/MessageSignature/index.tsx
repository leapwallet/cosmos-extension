import {
  useActiveChain,
  useActiveWallet,
  useChainsStore,
  useLastEvmActiveChain,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import { ETHEREUM_METHOD_TYPE } from '@leapwallet/cosmos-wallet-provider/dist/provider/types'
import { LeapLedgerSignerEth, personalSign, signTypedData } from '@leapwallet/cosmos-wallet-sdk'
import { EthWallet } from '@leapwallet/leap-keychain'
import assert from 'assert'
import { ErrorCard } from 'components/ErrorCard'
import LedgerConfirmationModal from 'components/ledger-confirmation/confirmation-modal'
import { Button } from 'components/ui/button'
import { SEI_EVM_LEDGER_ERROR_MESSAGE } from 'config/constants'
import { MessageTypes } from 'config/message-types'
import { Wallet } from 'hooks/wallet/useWallet'
import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { TransactionStatus } from 'types/utility'
import { isCompassWallet } from 'utils/isCompassWallet'
import { isSidePanel } from 'utils/isSidePanel'
import Browser from 'webextension-polyfill'

import { handleRejectClick } from '../../utils'
import { SignTransactionProps } from '../index'
import { MessageSignatureWrapper } from './wrapper'

const useGetWallet = Wallet.useGetWallet

export type MessageSignatureProps = {
  txnData: SignTransactionProps['txnData']
  donotClose: SignTransactionProps['donotClose']
  handleTxnListUpdate: SignTransactionProps['handleTxnListUpdate']
}

export function MessageSignature({
  txnData,
  donotClose,
  handleTxnListUpdate,
}: MessageSignatureProps) {
  const lastEvmActiveChain = useLastEvmActiveChain()
  const _activeChain = useActiveChain()
  const activeChain = isCompassWallet() ? _activeChain : lastEvmActiveChain

  const activeWallet = useActiveWallet()
  const navigate = useNavigate()

  assert(activeWallet !== null, 'activeWallet is null')

  const siteOrigin = txnData?.origin as string | undefined

  const getWallet = useGetWallet()
  const [txStatus, setTxStatus] = useState<TransactionStatus>('idle')
  const [signingError, setSigningError] = useState<string | null>(null)
  const [showLedgerPopup, setShowLedgerPopup] = useState(false)

  const { chains } = useChainsStore()
  const chainInfo = chains[activeChain]

  const handleSignClick = async () => {
    try {
      if (activeWallet.walletType === WALLETTYPE.LEDGER) {
        if (chainInfo?.evmOnlyChain === true) {
          setShowLedgerPopup(true)
        } else {
          throw new Error(SEI_EVM_LEDGER_ERROR_MESSAGE)
        }
      }

      setSigningError(null)
      setTxStatus('loading')

      const wallet = (await getWallet(activeChain, true)) as unknown as
        | EthWallet
        | LeapLedgerSignerEth
      let signature: string

      if (txnData.signTxnData.methodType === ETHEREUM_METHOD_TYPE.ETH__SIGN_TYPED_DATA_V4) {
        signature = await signTypedData(
          txnData.signTxnData.data,
          activeWallet.addresses[activeChain],
          wallet,
        )
      } else {
        signature = await personalSign(
          txnData.signTxnData.data,
          activeWallet.addresses[activeChain],
          wallet,
        )
      }

      try {
        Browser.runtime.sendMessage({
          type: MessageTypes.signSeiEvmResponse,
          payloadId: txnData?.payloadId,
          payload: { status: 'success', data: signature },
        })
      } catch {
        throw new Error('Could not send transaction to the dApp')
      }

      if (!donotClose) {
        if (isSidePanel()) {
          navigate('/home')
        } else {
          window.close()
        }
      } else {
        handleTxnListUpdate()
      }
    } catch (error) {
      setTxStatus('error')
      setSigningError((error as Error).message)
    }
  }

  const isApproveBtnDisabled = !!signingError || txStatus === 'loading'

  return (
    <MessageSignatureWrapper chainName={chainInfo.chainName} origin={siteOrigin || 'Unknown site'}>
      <div className='bg-secondary-100 p-4 w-full overflow-x-auto mt-3 rounded-xl flex flex-col gap-4'>
        <p className='text-center text-sm font-medium w-full text-muted-foreground'>
          Only sign this message if you fully understand the content and trust the requesting site
        </p>

        <div className='my-1 border-[0.05px] border-solid border-secondary-250 opacity-50' />

        {txnData.signTxnData.details.Message &&
        typeof txnData.signTxnData.details.Message !== 'object' ? (
          <p className='text-sm break-words whitespace-break-spaces'>
            {txnData.signTxnData.details.Message}
          </p>
        ) : (
          <pre className='text-xs'>
            {JSON.stringify(
              txnData.signTxnData.details,
              (_, value) => (typeof value === 'bigint' ? value.toString() : value),
              2,
            )}
          </pre>
        )}
      </div>

      {signingError && txStatus === 'error' ? (
        <ErrorCard text={signingError} className='mt-3' />
      ) : null}

      {txStatus !== 'error' && showLedgerPopup ? (
        <LedgerConfirmationModal
          showLedgerPopup={showLedgerPopup}
          onClose={() => setShowLedgerPopup(false)}
        />
      ) : null}

      <div className='shrink-0 flex items-center justify-center w-full gap-3 mt-auto'>
        <Button
          variant={'mono'}
          className='flex-1'
          title='Reject Button'
          disabled={txStatus === 'loading'}
          onClick={() => {
            handleRejectClick(navigate, txnData?.payloadId, donotClose)

            if (donotClose) {
              handleTxnListUpdate()
            }
          }}
        >
          Reject
        </Button>

        <Button
          title='Approve Button'
          onClick={handleSignClick}
          disabled={isApproveBtnDisabled}
          className={'flex-1'}
        >
          {txStatus === 'loading' ? 'Signing...' : 'Sign'}
        </Button>
      </div>
    </MessageSignatureWrapper>
  )
}
