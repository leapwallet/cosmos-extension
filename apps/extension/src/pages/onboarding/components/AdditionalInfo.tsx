import classNames from 'classnames'
import Text from 'components/text'
import React from 'react'

type AdditionalInfoProps = {
  heading: string
  description: string
  headingClassName?: string
  descriptionClassName?: string
}

export function AdditionalInfo({
  heading,
  description,
  headingClassName,
  descriptionClassName,
}: AdditionalInfoProps) {
  return (
    <>
      <AdditionalInfo.Heading className={headingClassName}>{heading}</AdditionalInfo.Heading>
      <AdditionalInfo.Description className={descriptionClassName}>
        {description}
      </AdditionalInfo.Description>
    </>
  )
}

type AdditionalInfoHeadingProps = {
  children: React.ReactNode
  className?: string
}

AdditionalInfo.Heading = function AdditionalInfoHeading({
  children,
  className,
}: AdditionalInfoHeadingProps) {
  return (
    <Text
      size='md'
      className={classNames('font-bold text-gray-600 dark:text-gray-200 mt-1', className)}
    >
      {children}
    </Text>
  )
}

type AdditionalInfoDescriptionProps = {
  children: React.ReactNode
  className?: string
}

AdditionalInfo.Description = function AdditionalInfoDescription({
  children,
  className,
}: AdditionalInfoDescriptionProps) {
  return (
    <Text size='sm' color={classNames('font-medium text-gray-600 dark:text-gray-400', className)}>
      {children}
    </Text>
  )
}
