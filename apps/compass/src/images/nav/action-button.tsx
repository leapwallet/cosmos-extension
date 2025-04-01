import * as React from 'react'

const ActionButton = ({
  fill,
  color,
  className,
}: {
  fill: string
  color: string
  className: string
}) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='44'
    height='44'
    viewBox='0 0 44 44'
    fill='none'
    className={className}
  >
    <rect width='44' height='44' rx='22' fill={fill} fillOpacity='0.12' />
    <rect
      x='0.5'
      y='0.5'
      width='43'
      height='43'
      rx='21.5'
      stroke='url(#paint0_linear_211_7030)'
      strokeOpacity='0.1'
    />
    <defs>
      <linearGradient
        id='paint0_linear_211_7030'
        x1='22'
        y1='0'
        x2='22'
        y2='44'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor={color} />
        <stop offset='1' stopColor={color} stopOpacity='0' />
      </linearGradient>
    </defs>
  </svg>
)

export default ActionButton
