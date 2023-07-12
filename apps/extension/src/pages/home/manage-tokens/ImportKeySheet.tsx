import { SecretToken, useAddress, useChainApis, useChainId } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons, GenericCard, HeaderActionType, Input } from '@leapwallet/leap-ui'
import React, { useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { UserClipboard } from 'utils/clipboard'

import BottomSheet from '../../../components/bottom-sheet/BottomSheet'
import { ErrorCard } from '../../../components/ErrorCard'
import { LoaderAnimation } from '../../../components/loader/Loader'
import Text from '../../../components/text'
import { useCreateViewingKey } from '../../../hooks/secret/useCreateViewingKey'
import { useViewingKeyFee } from '../../../hooks/secret/useViewingKeyFee'
import { useDefaultTokenLogo } from '../../../hooks/utility/useDefaultTokenLogo'
import { Colors } from '../../../theme/colors'
import { CopyViewingKey } from './CopyViewingKey'

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
  const { feeText, loadingFees } = useViewingKeyFee(token?.contractAddr)
  const createViewingKey = useCreateViewingKey()
  const [showCopyKey, setShowCopyKey] = useState(false)
  const address = useAddress()
  const { lcdUrl } = useChainApis('secret')
  const chainId = useChainId()

  const clearState = () => {
    setViewingKeyLoader(false)
    setError(null)
    setInputViewingKey('')
    setShowCopyKey(false)
    onClose()
  }

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={() => {
        clearState()
      }}
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
          autoFocus={true}
        />

        {error ? (
          <div className='mb-2'>
            <ErrorCard text={error} />
          </div>
        ) : null}

        {loadingFees && type !== 'import' ? (
          <div className='flex justify-center'>
            <Skeleton count={1} className='min-w-[200px] max-w-[200px] h-[12px] mb-5' />
          </div>
        ) : null}

        {type !== 'import' && !showCopyKey && !loadingFees ? (
          <div className='flex justify-center'>
            <Text size='sm' className='mb-5 text-center' color={'text-gray-200'}>
              Transaction Fee: {feeText}
            </Text>
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
            disabled={(!inputViewingKey && !viewingKeyLoader) || !!error}
            className='w-[344px]'
            onClick={async () => {
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
                  inputViewingKey,
                )

                if (res.error) {
                  setError(res.error)
                  setViewingKeyLoader(false)
                } else {
                  setShowCopyKey(true)
                  setViewingKeyLoader(false)
                }
              }
            }}
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
