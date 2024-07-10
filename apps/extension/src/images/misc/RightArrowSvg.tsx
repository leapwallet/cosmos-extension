import React from 'react'

const RightArrowSvg = React.memo((props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width='6'
    height='10'
    viewBox='0 0 6 10'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path d='M0.741553 0.591665C0.416553 0.916665 0.416553 1.44166 0.741553 1.76666L3.97489 5L0.741553 8.23333C0.416553 8.55833 0.416553 9.08333 0.741553 9.40833C1.06655 9.73333 1.59155 9.73333 1.91655 9.40833L5.74155 5.58333C6.06655 5.25833 6.06655 4.73333 5.74155 4.40833L1.91655 0.583331C1.59989 0.266665 1.06655 0.266665 0.741553 0.591665Z' />
  </svg>
))

RightArrowSvg.displayName = 'DownArrowSvg'
export { RightArrowSvg }
