import radar from 'lottie-files/radar.json'
import Lottie from 'lottie-react'
import React from 'react'

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: radar,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice',
  },
}

export default function RadarAnimation({ className }: { className?: string }) {
  return <Lottie {...defaultOptions} className={className ?? 'w-[196px] h-[196px]'} />
}
