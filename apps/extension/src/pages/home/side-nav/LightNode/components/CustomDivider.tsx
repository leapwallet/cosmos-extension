import classNames from 'classnames'
import React from 'react'
const CustomDivider = ({ className }: { className?: string }) => (
  <div
    className={classNames(
      'my-0.5 border-[0.5px] border-solid border-white-100 dark:border-gray-800 opacity-50',
      className,
    )}
  />
)

export default CustomDivider
