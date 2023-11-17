import React from 'react'

export function ComingSoon() {
  return (
    <div className='h-[475px] px-4 flex flex-col items-center justify-center text-center gap-[4px]'>
      <div className='relative'>
        <span
          className='absolute w-[200px] h-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ml-[0.3rem]'
          style={{ boxShadow: '2px -2px 4.5rem 1.5rem #28ba5b', borderRadius: '100% 100% 0 0' }}
        ></span>

        <img
          className='z-10 relative'
          src='https://assets.leapwallet.io/frog-coming-soon.png'
          alt='frog-coming-soon'
        />
      </div>

      <h3 className='dark:text-white-100 font-bold text-[24px]'>Coming soon</h3>
      <p className='text-gray-400 text-[16px] font-medium'>
        We&apos;re working on it. Or perhaps the chain is...
        <br />
        Either way, this page is coming soon!
      </p>
    </div>
  )
}
