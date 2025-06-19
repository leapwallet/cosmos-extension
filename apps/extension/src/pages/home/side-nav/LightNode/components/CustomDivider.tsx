import React from 'react'
import { cn } from 'utils/cn'

const deciderStyle = {
  background: 'linear-gradient(92.33deg, #904CFA 1.96%, #7B2BF9 99.09%)',
}

const CustomDivider = ({ className }: { className?: string }) => (
  <div className={cn('h-px w-full shrink-0 opacity-50', className)} style={deciderStyle} />
)

export default CustomDivider
