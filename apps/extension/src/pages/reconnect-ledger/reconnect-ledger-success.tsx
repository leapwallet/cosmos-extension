import { Button } from 'components/ui/button'
import { Images } from 'images'
import React from 'react'
import CanvasConfetti from 'react-canvas-confetti/dist/presets/fireworks'
import { createPortal } from 'react-dom'
import { handleSidePanelClick } from 'utils/isSidePanel'

const Confetti = () => {
  return (
    <CanvasConfetti
      className='w-full h-full absolute opacity-50 top-0 left-0 right-0 z-10 isolate'
      onInit={({ conductor }) => {
        conductor.run({
          speed: 1,
        })
        setTimeout(() => {
          conductor.stop()
        }, 5_000)
      }}
      globalOptions={{
        useWorker: true,
        resize: true,
      }}
    />
  )
}

export function ReconnectLedgerSuccess() {
  return (
    <>
      {createPortal(
        <>
          <Confetti />
        </>,
        document.body,
      )}

      <div className='flex flex-col gap-y-8 my-auto z-20'>
        <div className='w-32 h-auto mx-auto'>
          <img src={Images.Misc.OnboardingFrog} className='w-full h-full' />
        </div>

        <header className='flex flex-col gap-y-5 items-center text-center'>
          <h1 className='font-bold text-xxl'>You are all set!</h1>

          <span className='flex flex-col gap-y-1 text-muted-foreground text-md'>
            Close this page and retry your previous transaction.
          </span>
        </header>
      </div>

      <Button
        className='w-full z-20'
        onClick={() => {
          handleSidePanelClick('https://app.leapwallet.io')
        }}
      >
        Open Leap Extension
      </Button>
    </>
  )
}
