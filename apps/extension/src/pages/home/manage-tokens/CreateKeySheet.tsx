import {
  SecretToken,
  useAddress,
  useChainApis,
  useChainId,
  useGetChains,
} from '@leapwallet/cosmos-wallet-hooks'
import { Buttons, GenericCard, HeaderActionType } from '@leapwallet/leap-ui'
import { useCreateQueryPermit } from 'hooks/secret/useCreateQueryPermit'
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

type Props = {
  isVisible: boolean
  onClose: VoidFunction
  token?: SecretToken & { contractAddr: string }
  onSuccess: VoidFunction
}

export function CreateKeySheet({ isVisible, onClose, token, onSuccess }: Props) {
  const defaultLogo = useDefaultTokenLogo()
  const [generatedViewingKey, setGeneratedViewingKey] = useState<string | undefined | null>(null)
  const [viewingKeyLoader, setViewingKeyLoader] = useState(false)

  const { feeText, loadingFees } = useViewingKeyFee(token?.contractAddr)
  const createViewingKey = useCreateViewingKey()
  const createQueryPermit = useCreateQueryPermit()
  const [error, setError] = useState<string | null>(null)
  const address = useAddress()
  const { lcdUrl } = useChainApis('secret')
  const chainId = useChainId()
  const chains = useGetChains()

  const clearState = () => {
    setGeneratedViewingKey(null)
    setViewingKeyLoader(false)
    onClose()
  }

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={() => {
        clearState()
      }}
      headerTitle={token?.snip24Enabled ? 'Create query permit' : 'Create Viewing Key'}
      headerActionType={HeaderActionType.CANCEL}
    >
      <div className='p-7'>
        <div className='py-5 rounded-2xl bg-white-100 dark:bg-gray-900 mb-7'>
          <Text size='xs' className='font-bold px-5' color={'text-gray-200'}>
            {token?.snip24Enabled ? 'Create query permit' : 'Create Viewing Key'}
          </Text>
          <GenericCard
            className='w-[300px] px-0'
            title={token?.symbol}
            subtitle={token?.name}
            img={
              <img
                src={token?.icon === '' ? defaultLogo : token?.icon}
                className='w-[40px] h-[40px] mr-3'
              />
            }
          />
        </div>
        {!generatedViewingKey && !token?.snip24Enabled ? (
          <div className='flex justify-center'>
            {loadingFees ? (
              <Skeleton count={1} className='min-w-[200px] max-w-[200px] h-[12px] mb-5' />
            ) : (
              <Text size='sm' className='mb-5 text-center' color={'text-gray-200'}>
                Transaction Fee: {feeText}
              </Text>
            )}
          </div>
        ) : null}
        {generatedViewingKey ? (
          <CopyViewingKey
            generatedViewingKey={generatedViewingKey}
            onCopy={async () => {
              await UserClipboard.copyText(generatedViewingKey)
            }}
          />
        ) : null}

        {error ? (
          <div className='mb-2'>
            <ErrorCard text={error} />
          </div>
        ) : null}

        {!viewingKeyLoader ? (
          <Buttons.Generic
            size='normal'
            color={'#E18881'}
            disabled={!!viewingKeyLoader || (loadingFees && !token?.snip24Enabled)}
            className='w-[344px]'
            onClick={async () => {
              setViewingKeyLoader(true)
              if (token?.snip24Enabled) {
                createQueryPermit(address, token.contractAddr)
                clearState()
                onSuccess()
              } else {
                if (!generatedViewingKey) {
                  const { error, key } = await createViewingKey(
                    lcdUrl ?? chains.secret.apis.rest ?? '',
                    chainId ?? 'secret-4',
                    address,
                    token?.contractAddr as string,
                    false,
                  )
                  if (error) {
                    setError(error)
                    setViewingKeyLoader(false)
                  } else {
                    setViewingKeyLoader(false)
                    setGeneratedViewingKey(key)
                  }
                } else {
                  clearState()
                  onSuccess()
                }
              }
            }}
          >
            {generatedViewingKey ? 'Done' : 'Confirm'}
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
