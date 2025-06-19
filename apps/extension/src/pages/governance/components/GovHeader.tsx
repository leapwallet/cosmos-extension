import { ArrowLeft } from '@phosphor-icons/react'
import { PageHeader } from 'components/header/PageHeaderV2'
import Text from 'components/text'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const GovHeader = ({ title, onBack }: { title?: string; onBack?: () => void }) => {
  const navigate = useNavigate()
  return (
    <PageHeader>
      <ArrowLeft
        className='size-9 p-2 cursor-pointer text-muted-foreground hover:text-foreground'
        onClick={() => {
          onBack ? onBack() : navigate(-1)
        }}
      />
      <Text className='text-[18px] font-bold !leading-6' color='text-monochrome'>
        {title ?? 'Governance'}
      </Text>
      <div className='w-9 h-9' />
    </PageHeader>
  )
}

export default GovHeader
