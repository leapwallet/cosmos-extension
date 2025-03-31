import React from 'react'

import Loader from '../loader/Loader'

export function AppInitLoader() {
  return (
    <div className='absolute inset-0 z-10 bg-background flex flex-col items-center justify-center h-full'>
      <Loader />
    </div>
  )
}
