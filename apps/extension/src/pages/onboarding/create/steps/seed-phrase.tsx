import CanvasTextBox from 'components/canvas-box/CanvasTextBox'
import { Button } from 'components/ui/button'
import { CopyButton } from 'components/ui/button/copy-button'
import { KeySlimIcon } from 'icons/key-slim-icon'
import React from 'react'
import { UserClipboard } from 'utils/clipboard'

import { OnboardingWrapper } from '../../wrapper'
import { useCreateWalletContext } from '../create-wallet-context'

export const SeedPhrase = () => {
  const { prevStep, currentStep, mnemonic, moveToNextStep } = useCreateWalletContext()

  return (
    <OnboardingWrapper
      headerIcon={<KeySlimIcon className='size-6' />}
      entry={prevStep <= currentStep ? 'right' : 'left'}
      heading='Your secret recovery phrase'
      subHeading={
        <>
          Write down these words, your secret recovery phrase <br /> is the{' '}
          <span className='text-warning'> only way to recover </span> your wallet and funds!
        </>
      }
    >
      <div className='flex flex-col gap-3 justify-center'>
        <CanvasTextBox text={mnemonic} noSpace={false} />

        <CopyButton
          className='mx-auto'
          data-testing-id='mnemonic-copy-to-clipboard'
          onClick={() => {
            UserClipboard.copyText(mnemonic)
          }}
        >
          Copy to Clipboard
        </CopyButton>
      </div>

      <Button
        disabled={mnemonic.length === 0}
        className='w-full mt-auto'
        onClick={moveToNextStep}
        data-testing-id='saved-mnemonic-btn'
      >
        I have saved my recovery phrase
      </Button>
    </OnboardingWrapper>
  )
}
