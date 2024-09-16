import { Icon } from '@phosphor-icons/react'
import Text from 'components/text'
import { Images } from 'images'
import React from 'react'

interface SuccessCardProps {
  icons: Array<{ icon: Icon } | { image: 'Appstore' | 'Playstore' | 'Dashboard' }>
  color: string
  title: string
  content: string
  onCardClick: () => void
}

export default function SuccessCard({
  icons,
  color,
  title,
  content,
  onCardClick,
}: SuccessCardProps) {
  return (
    <div
      className='dark:bg-gray-950 bg-gray-50 px-7 py-5 rounded-2xl flex-1 cursor-pointer'
      onClick={onCardClick}
    >
      <div className='flex'>
        {icons.map((d, i) =>
          'icon' in d ? (
            <d.icon key={i} size={24} style={{ color: color }} />
          ) : (
            <>
              {i > 0 && <div className='dark:border-gray-800 border-gray-200 border mx-3' />}
              <img key={i} src={Images.Logos[d.image]} className='w-5 h-5' />
            </>
          ),
        )}
      </div>
      <Text size='lg' style={{ color }} className='font-bold my-2'>
        {title}
      </Text>
      <Text size='sm' className='dark:!text-gray-400 text-gray-600 font-medium'>
        {content}
      </Text>
    </div>
  )
}
