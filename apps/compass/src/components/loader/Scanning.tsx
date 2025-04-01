import scanning from 'lottie-files/scanning.json'
import Lottie from 'lottie-react'
import React from 'react'

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: scanning,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice',
  },
}

export default function ScanningAnimation({ className }: { className?: string }) {
  return <Lottie {...defaultOptions} className={className ?? 'w-[196px] h-[196px]'} />
}
