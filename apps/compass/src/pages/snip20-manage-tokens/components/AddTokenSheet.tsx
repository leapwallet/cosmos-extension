import { SecretToken } from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider, GenericCard } from '@leapwallet/leap-ui'
import { CaretRight, ClipboardText, PencilSimple, PlusCircle } from '@phosphor-icons/react'
import BottomModal from 'components/bottom-modal'
import Text from 'components/text'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import React from 'react'

type AddTokenSheetProps = {
  isVisible: boolean
  onClose: VoidFunction
  token?: SecretToken
  onCreateViewingKey: VoidFunction
  onUpdateViewingKey: VoidFunction
  onImportViewingKey: VoidFunction
}

export function AddTokenSheet({
  isVisible,
  onClose,
  token,
  onCreateViewingKey,
  onUpdateViewingKey,
  onImportViewingKey,
}: AddTokenSheetProps) {
  const defaultLogo = useDefaultTokenLogo()

  return (
    <BottomModal isOpen={isVisible} onClose={onClose} title={'Add Token'}>
      <div>
        <div className='mb-4 px-5'>
          <div className='flex items-center'>
            <img
              src={token?.icon === '' ? defaultLogo : token?.icon}
              className='h-[32px] w-[32px] mr-3'
            />
            <Text size='xxl'>{token?.symbol}</Text>
          </div>
          <Text size='md' className='font-bold text-gray-200'>
            {token?.name}
          </Text>
        </div>
        <div>
          <GenericCard
            onClick={() => onCreateViewingKey()}
            className='rounded-t-2xl'
            title={token?.snip24Enabled ? 'Create query permit' : 'Create new key'}
            img={<PlusCircle size={16} className='text-gray-400 mr-3' />}
            icon={<CaretRight size={16} className='text-gray-400' />}
          />
          <CardDivider />
          <GenericCard
            onClick={() => onUpdateViewingKey()}
            title='Update key'
            img={<PencilSimple size={16} className='text-gray-400 mr-3' />}
            icon={<CaretRight size={16} className='text-gray-400' />}
          />
          <CardDivider />
          <GenericCard
            onClick={() => {
              onImportViewingKey()
            }}
            className='rounded-b-2xl'
            title={<Text size='md'>Import key</Text>}
            img={<ClipboardText size={16} className='text-gray-400 mr-3' />}
            icon={<CaretRight size={16} className='text-gray-400' />}
          />
        </div>
      </div>
    </BottomModal>
  )
}
