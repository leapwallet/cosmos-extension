/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useActiveChain,
  useActiveWallet,
  useAddress,
  useChainInfo,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import { BtcTx } from '@leapwallet/cosmos-wallet-sdk'
import { RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import { BtcWallet } from '@leapwallet/leap-keychain/dist/browser/key/btc-wallet'
import { Avatar, Buttons, Header, HeaderActionType } from '@leapwallet/leap-ui'
import { hex } from '@scure/base'
import { NETWORK, TEST_NETWORK } from '@scure/btc-signer'
import assert from 'assert'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { ErrorCard } from 'components/ErrorCard'
import PopupLayout from 'components/layout/popup-layout'
import { LoaderAnimation } from 'components/loader/Loader'
import { MessageTypes } from 'config/message-types'
import { useSiteLogo } from 'hooks/utility/useSiteLogo'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
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

type SignPsbtProps = {
  txnData: Record<string, any>
  rootDenomsStore: RootDenomsStore
  isRedirected?: boolean
  handleBack?: () => void
}

export const SignPsbt = observer(
  ({ txnData, rootDenomsStore, isRedirected, handleBack }: SignPsbtProps) => {
    const getWallet = useGetWallet()
    const navigate = useNavigate()
    const activeChain = useActiveChain()
    const chainInfo = useChainInfo(activeChain)
    const activeWallet = useActiveWallet()

    assert(activeWallet !== null, 'activeWallet is null')
    const walletName = useMemo(() => {
      return formatWalletName(activeWallet.name)
    }, [activeWallet.name])

    const siteOrigin = txnData?.origin as string | undefined
    const siteName = siteOrigin?.split('//')?.at(-1)?.split('.')?.at(-2)
    const siteLogo = useSiteLogo(siteOrigin)

    const details = useMemo(() => {
      return BtcTx.GetPsbtHexDetails(
        txnData.signTxnData.psbtHex,
        activeChain === 'bitcoinSignet' ? TEST_NETWORK : NETWORK,
      )
    }, [activeChain, txnData.signTxnData.psbtHex])

    const denomInfo = useMemo(() => {
      return rootDenomsStore.allDenoms[Object.keys(chainInfo.nativeDenoms)[0]]
    }, [chainInfo.nativeDenoms, rootDenomsStore.allDenoms])

    const address = useAddress()
    const [txStatus, setTxStatus] = useState<TransactionStatus>('idle')
    const [signingError, setSigningError] = useState<string | null>(null)

    const handleSignClick = async () => {
      try {
        if (activeWallet.walletType === WALLETTYPE.LEDGER) {
          throw new Error('Ledger transactions are not supported yet')
        }
        const options = txnData.signTxnData.options

        const autoFinalized = options && options.autoFinalized == false ? false : true

        setSigningError(null)
        setTxStatus('loading')

        const wallet = (await getWallet(activeChain)) as unknown as BtcWallet
        details.inputs.forEach((input, index) => {
          if (input.tapScriptInfo) {
            const tapScriptInfo = input.tapScriptInfo
            details.tx.updateInput(index, {
              tapMerkleRoot: tapScriptInfo.merklePath,
              tapScriptSig: tapScriptInfo.controlBlock,
              tapInternalKey: tapScriptInfo.internalKey,
              tapLeafScript: tapScriptInfo.scriptTree,
            })
          }

          // @ts-ignore
          wallet.signIdx(address, details.tx, index)
        })

        if (autoFinalized) {
          for (let i = 0; i < details.inputs.length; i++) {
            details.tx.finalizeIdx(i)
          }
          details.tx.extract()
        }

        const signedTxHex = hex.encode(details.tx.toPSBT())

        setTxStatus('success')
        try {
          Browser.runtime.sendMessage({
            type: MessageTypes.signBitcoinResponse,
            payloadId: txnData?.payloadId,
            payload: { status: 'success', data: signedTxHex },
          })
        } catch {
          throw new Error('Could not send transaction to the dApp')
        }

        if (isSidePanel()) {
          navigate('/home')
        } else {
          window.close()
        }
      } catch (error) {
        setTxStatus('error')
        setSigningError((error as Error).message)
      }
    }

    const isApproveBtnDisabled = !!signingError || txStatus === 'loading'

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
            header={
              <div className='w-[396px]'>
                <Header
                  // @ts-ignore
                  action={
                    isRedirected
                      ? {
                          type: HeaderActionType.BACK,
                          onClick: handleBack,
                        }
                      : undefined
                  }
                  imgSrc={chainInfo.chainSymbolImageUrl ?? Images.Logos.GenericLight}
                  title={
                    <Buttons.Wallet title={trim(walletName, 10)} className='pr-4 cursor-default' />
                  }
                />
              </div>
            }
          >
            <div
              className={`px-7 py-3 overflow-y-auto relative ${
                isRedirected ? 'h-[500px]' : 'h-[450px]'
              }`}
            >
              <h2 className='text-center text-lg font-bold dark:text-white-100 text-gray-900 w-full'>
                {isRedirected ? 'Transaction Details' : 'Sign Transaction'}
              </h2>

              {isRedirected ? null : (
                <p className='text-center text-sm dark:text-gray-300 text-gray-500 w-full'>
                  Only sign this transaction if you fully understand the content and trust the
                  requesting site
                </p>
              )}

              {isRedirected ? null : (
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
              )}

              {details?.txAmount ? (
                <p className='mt-3'>
                  <span className='font-semibold text-gray-900 dark:text-white-100 pl-1'>
                    Amount
                  </span>

                  <pre className='text-xs text-gray-900 dark:text-white-100 dark:bg-gray-900 bg-white-100 p-4 w-full overflow-x-auto rounded-2xl mt-1'>
                    {`${new BigNumber(Number(details.txAmount))
                      .dividedBy(10 ** (denomInfo.coinDecimals ?? 8))
                      .toNumber()} ${chainInfo.denom}`}
                  </pre>
                </p>
              ) : null}

              {details?.fee ? (
                <p className='mt-3'>
                  <span className='font-semibold text-gray-900 dark:text-white-100 pl-1'>Fee</span>

                  <pre className='text-xs text-gray-900 dark:text-white-100 dark:bg-gray-900 bg-white-100 p-4 w-full overflow-x-auto rounded-2xl mt-1'>
                    {`${new BigNumber(Number(details.fee))
                      .dividedBy(10 ** (denomInfo.coinDecimals ?? 8))
                      .toNumber()} ${chainInfo.denom}`}
                  </pre>
                </p>
              ) : null}

              {details?.inputs?.length ? (
                <p className='mt-3'>
                  <span className='font-semibold text-gray-900 dark:text-white-100 pl-1'>
                    Inputs
                  </span>

                  <pre className='text-xs text-gray-900 dark:text-white-100 dark:bg-gray-900 bg-white-100 p-4 w-full overflow-x-auto rounded-2xl mt-1'>
                    {JSON.stringify(
                      details.inputs,
                      (key, value) => {
                        if (key === 'tapScriptInfo') return
                        if (typeof value === 'bigint') {
                          return `${new BigNumber(Number(value))
                            .dividedBy(10 ** (denomInfo.coinDecimals ?? 8))
                            .toNumber()} ${chainInfo.denom}`
                        }
                        return value
                      },
                      2,
                    )}
                  </pre>
                </p>
              ) : null}

              {details?.outputs?.length ? (
                <p className='mt-3'>
                  <span className='font-semibold text-gray-900 dark:text-white-100 pl-1'>
                    Outputs
                  </span>

                  <pre className='text-xs text-gray-900 dark:text-white-100 dark:bg-gray-900 bg-white-100 p-4 w-full overflow-x-auto rounded-2xl mt-1'>
                    {JSON.stringify(
                      details.outputs,
                      (_, value) => {
                        if (typeof value === 'bigint') {
                          return `${new BigNumber(Number(value))
                            .dividedBy(10 ** (denomInfo.coinDecimals ?? 8))
                            .toNumber()} ${chainInfo.denom}`
                        }

                        return value
                      },
                      2,
                    )}
                  </pre>
                </p>
              ) : null}

              {signingError && txStatus === 'error' ? (
                <ErrorCard text={signingError} className='mt-3' />
              ) : null}
            </div>

            {isRedirected ? null : (
              <div className='absolute bottom-0 left-0 py-3 px-7 dark:bg-black-100 bg-gray-50 w-full'>
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
                    onClick={handleSignClick}
                    disabled={isApproveBtnDisabled}
                    className={`${isApproveBtnDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    {txStatus === 'loading' ? <LoaderAnimation color='white' /> : 'Sign'}
                  </Buttons.Generic>
                </div>
              </div>
            )}
          </PopupLayout>
        </div>
      </div>
    )
  },
)
