import Text from 'components/text'
import { Images } from 'images'
import React from 'react'
import { isCompassWallet } from 'utils/isCompassWallet'

type Props = {
  heading?: string
  subtitle?: string
  SubTitleComponent?: React.FC
  HeadingComponent?: React.FC
  headingSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'jumbo'
}

export const Header: React.FC<Props> = ({
  heading,
  subtitle,
  SubTitleComponent,
  HeadingComponent,
}) => {
  return (
    <div className='flex flex-col justify-center items-center mb-3'>
      <img
        src={isCompassWallet() ? Images.Logos.CompassCircle : Images.Logos.LeapCosmos}
        className='h-[64px]'
      />
      {HeadingComponent ? (
        <HeadingComponent />
      ) : (
        <Text size='xxl' className='font-black text-4xl my-3 mx-2 text-center'>
          {heading}
        </Text>
      )}
      {subtitle && (
        <Text size='lg' color='text-gray-400' className='justify-center'>
          {subtitle}
        </Text>
      )}
      {SubTitleComponent && <SubTitleComponent />}
    </div>
  )
}
