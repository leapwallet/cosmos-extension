import { SecretToken, useAddress, useChainApis, useChainId } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons, GenericCard, HeaderActionType, Input } from '@leapwallet/leap-ui'
import BottomSheet from 'components/bottom-sheet/BottomSheet'
import { ErrorCard } from 'components/ErrorCard'
import { LoaderAnimation } from 'components/loader/Loader'
import { useCreateViewingKey } from 'hooks/secret/useCreateViewingKey'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Colors } from 'theme/colors'
import { UserClipboard } from 'utils/clipboard'

import { useSnip20ManageTokens } from '../context'
import { CopyViewingKey, Fee } from './index'

type ImportKeySheetProps = {
  isVisible: boolean
  onClose: () => void
  type: 'import' | 'update'
  token?: SecretToken & { contractAddr: string }
  onSuccess: VoidFunction
}

export function ImportKeySheet({
  isVisible,
  onClose,
  type,
  token,
  onSuccess,
}: ImportKeySheetProps) {
  const defaultLogo = useDefaultTokenLogo()
  const [viewingKeyLoader, setViewingKeyLoader] = useState(false)
  const [inputViewingKey, setInputViewingKey] = useState('')
  const [error, setError] = useState<string | null>(null)
  const createViewingKey = useCreateViewingKey()
  const [showCopyKey, setShowCopyKey] = useState(false)
  const address = useAddress()
  const { lcdUrl } = useChainApis('secret')
  const chainId = useChainId()
  const inputEleRef = useRef<HTMLInputElement>(null)

  const { setContractAddress, userPreferredGasLimit, userPreferredGasPrice } =
    useSnip20ManageTokens()
  useEffect(() => {
    if (token?.contractAddr) {
      setContractAddress(token.contractAddr)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token?.contractAddr])

  useEffect(() => {
    if (inputEleRef?.current) {
      inputEleRef.current.focus()
    }
  }, [inputEleRef])

  const clearState = useCallback(() => {
    setViewingKeyLoader(false)
    setError(null)
    setInputViewingKey('')
    setShowCopyKey(false)
    onClose()
  }, [onClose])

  const handleConfirmClick = useCallback(async () => {
    if (showCopyKey) {
      onSuccess()
      clearState()
    } else {
      setViewingKeyLoader(true)
      const res = await createViewingKey(
        lcdUrl ?? '',
        chainId ?? '',
        address,
        token?.contractAddr as string,
        type === 'import',
        {
          key: inputViewingKey,
          gasLimit: userPreferredGasLimit,
          feeDenom: userPreferredGasPrice?.denom,
          gasPriceStep: Number(userPreferredGasPrice?.amount ?? 0),
        },
      )

      if (res.error) {
        setError(res.error)
        setViewingKeyLoader(false)
      } else {
        setShowCopyKey(true)
        setViewingKeyLoader(false)
      }
    }
  }, [
    address,
    chainId,
    clearState,
    createViewingKey,
    inputViewingKey,
    lcdUrl,
    onSuccess,
    showCopyKey,
    token?.contractAddr,
    type,
    userPreferredGasLimit,
    userPreferredGasPrice?.amount,
    userPreferredGasPrice?.denom,
  ])

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={() => clearState()}
      headerTitle={type === 'import' ? 'Import viewing key' : 'Update viewing key'}
      headerActionType={HeaderActionType.CANCEL}
    >
      <div className='p-7'>
        <GenericCard
          className='rounded-2xl mb-4 p-4'
          title={token?.symbol}
          subtitle={token?.name}
          img={
            <img
              src={token?.icon === '' ? defaultLogo : token?.icon}
              className='w-[40px] h-[40px] mr-4'
            />
          }
        />

        <Input
          onChange={(e) => {
            setInputViewingKey(e.target.value)
            setError(null)
          }}
          placeholder='enter key'
          className='mb-4 w-[344px]'
          ref={inputEleRef}
        />

        {type !== 'import' && !showCopyKey ? <Fee /> : null}
        {error ? (
          <div className='mb-2'>
            <ErrorCard text={error} className='mb-4' />
          </div>
        ) : null}

        {showCopyKey ? (
          <CopyViewingKey
            generatedViewingKey={inputViewingKey}
            onCopy={async () => {
              UserClipboard.copyText(inputViewingKey)
            }}
          />
        ) : null}

        {!viewingKeyLoader ? (
          <Buttons.Generic
            size='normal'
            color={'#E18881'}
            disabled={!inputViewingKey || !!error}
            className='w-[344px]'
            onClick={handleConfirmClick}
          >
            {showCopyKey ? 'Done' : 'Confirm'}
          </Buttons.Generic>
        ) : (
          <div className='flex justify-center w-[344px]'>
            <LoaderAnimation color={Colors.white100} />
          </div>
        )}
      </div>
    </BottomSheet>
  )
}
