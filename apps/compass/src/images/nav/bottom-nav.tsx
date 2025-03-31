import * as React from 'react'

const BottomNav = ({
  fill,
  stroke,
  className,
}: {
  fill: string
  stroke: string
  className: string
}) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='400'
    height='83'
    viewBox='0 0 400 83'
    fill='none'
    className={className}
  >
    <path
      d='M162.026 19C168.386 19 173.879 14.9314 178.263 10.3241C183.728 4.58026 191.446 1 200 1C208.554 1 216.272 4.58026 221.737 10.3241C226.121 14.9314 231.614 19 237.974 19H400V83H0V19H162.026Z'
      fill={fill}
    />
    <path
      d='M400 19H237.974C231.614 19 226.121 14.9314 221.737 10.3241C216.272 4.58026 208.554 1 200 1C191.446 1 183.728 4.58026 178.263 10.3241C173.879 14.9314 168.386 19 162.026 19H0'
      stroke={stroke}
    />
  </svg>
)

export default BottomNav
