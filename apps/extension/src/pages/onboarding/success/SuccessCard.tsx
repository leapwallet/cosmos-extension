import Text from 'components/text'
import { Images } from 'images'
import React from 'react'

interface SuccessCardProps {
  icons: Array<{ icon?: string; image?: string }>
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
          d?.icon ? (
            <Text
              key={i}
              size='lg'
              className='material-icons-round w-5 h-5'
              style={{ color: color }}
            >
              {d?.icon}
            </Text>
          ) : (
            <>
              {i > 0 && <div className='dark:border-gray-800 border-gray-200 border mx-3' />}
              <img
                key={i}
                src={Images.Logos?.[d.image as 'Appstore' | 'Playstore' | 'Dashboard']}
                className='w-5 h-5'
              />
            </>
          ),
        )}
      </div>
      <Text size='lg' style={{ color: color }} className='font-bold my-2'>
        {title}
      </Text>
      <Text size='sm' className='dark:!text-gray-400 text-gray-600 font-medium'>
        {content}
      </Text>
    </div>
  )
}
