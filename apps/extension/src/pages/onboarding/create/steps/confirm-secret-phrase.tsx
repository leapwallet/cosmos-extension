import { CanvasBox } from 'components/canvas-box/CanvasTextBox'
import { Button } from 'components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'
import { KeySlimIcon } from 'icons/key-slim-icon'
import React, {
  ChangeEvent,
  ChangeEventHandler,
  ComponentPropsWithoutRef,
  useMemo,
  useState,
} from 'react'
import { cn } from 'utils/cn'
import { getWordFromMnemonic } from 'utils/getWordFromMnemonic'
import { errorVariants } from 'utils/motion-variants'

import { OnboardingWrapper } from '../../wrapper'
import { useCreateWalletContext } from '../create-wallet-context'

type StatusType = 'error' | 'success' | ''

type Status = {
  four: StatusType
  eight: StatusType
  tweleve: StatusType
}

type WordInputProps = ComponentPropsWithoutRef<'input'> & {
  readonly value?: string
  readonly onChange?: ChangeEventHandler
  readonly onBlur?: () => void
  readonly name?: string
  readonly className?: string
  readonly prefixNumber?: number
  readonly status?: StatusType
}

const outlineClassMap = {
  error: 'outline-destructive-100',
  success: 'outline-accent-success',
  default: 'focus-within:outline-foreground',
}

const WordInput = ({
  value,
  onChange,
  onBlur,
  name,
  prefixNumber,
  className,
  status,
  ...rest
}: WordInputProps) => {
  return (
    <div
      className={cn(
        'w-[100px] h-7 rounded-lg bg-secondary text-center flex items-center justify-center outline outline-transparent outline-1 px-2 gap-4 transition-[outline-color]',
        outlineClassMap[status as keyof typeof outlineClassMap] ?? outlineClassMap.default,
        className,
      )}
    >
      <span className='text-muted-foreground'>{prefixNumber}</span>
      <input
        className='bg-inherit border-none outline-none w-full h-full'
        type='text'
        value={value ?? ''}
        name={name ?? ''}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete='off'
        autoCorrect='off'
        autoCapitalize='off'
        {...rest}
      />
    </div>
  )
}

type MissingWords = {
  four: string
  eight: string
  tweleve: string
}

function ConfirmSecretPhraseView({
  mnemonic,
  onProceed,
}: {
  mnemonic: string
  onProceed: () => void
}) {
  const [status, setStatus] = useState<Status>({
    four: '',
    eight: '',
    tweleve: '',
  })
  const [missingWords, setMissingWords] = useState<MissingWords>({
    four: '',
    eight: '',
    tweleve: '',
  })

  const hasError = status.four === 'error' || status.eight === 'error' || status.tweleve === 'error'

  const words = useMemo(() => {
    const _words = mnemonic.trim().split(' ')
    _words[3] = ''
    _words[7] = ''
    _words[11] = ''

    return _words.join(' ')
  }, [mnemonic])

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    setStatus({
      ...status,
      [event.target.name]: '',
    })
    setMissingWords((prevValue) => ({ ...prevValue, [event.target.name]: event.target.value }))
  }

  const validateInput = (index: number, numberWord: keyof typeof missingWords) => {
    const word = getWordFromMnemonic(mnemonic, index)
    const missingWord = missingWords[numberWord].trim()

    setStatus({
      ...status,
      [numberWord]: missingWord && word !== missingWord ? 'error' : missingWord ? 'success' : '',
    })
  }

  function handleConfirmClick() {
    if (getWordFromMnemonic(mnemonic, 4) !== missingWords.four.trim()) {
      setStatus({
        ...status,
        four: 'error',
      })
      return
    }

    if (getWordFromMnemonic(mnemonic, 8) !== missingWords.eight.trim()) {
      setStatus({
        ...status,
        eight: 'error',
      })
      return
    }

    if (getWordFromMnemonic(mnemonic, 12) !== missingWords.tweleve.trim()) {
      setStatus({
        ...status,
        tweleve: 'error',
      })
      return
    }

    onProceed()
  }

  return (
    <>
      <div className='space-y-6'>
        <div
          className={
            'relative rounded-2xl bg-secondary-200 text-xs font-medium box-border h-[184px] w-[376px] p-5'
          }
        >
          <CanvasBox height={144} width={376 - 30} text={words} noSpace={false} />

          <WordInput
            name='four'
            prefixNumber={4}
            value={missingWords.four}
            onChange={handleInputChange}
            className='absolute top-[56px] left-[28px]'
            data-testing-id='input-fourth-word'
            onBlur={() => validateInput(4, 'four')}
            status={status.four}
          />

          <WordInput
            name='eight'
            prefixNumber={8}
            value={missingWords.eight}
            onChange={handleInputChange}
            className='absolute top-[91px] left-[144px]'
            data-testing-id='input-eighth-word'
            onBlur={() => validateInput(8, 'eight')}
            status={status.eight}
          />

          <WordInput
            name='tweleve'
            prefixNumber={12}
            value={missingWords.tweleve}
            onChange={handleInputChange}
            className='absolute top-[127] left-[259px]'
            data-testing-id='input-tweleveth-word'
            onBlur={() => validateInput(12, 'tweleve')}
            status={status.tweleve}
          />
        </div>

        <AnimatePresence>
          {hasError && (
            <motion.span
              className='text-xs text-destructive-100 font-medium text-center mt-4 block'
              data-testing-id='error-text-ele'
              variants={errorVariants}
              initial='hidden'
              animate='visible'
              exit='hidden'
            >
              Seed phrase does not match. Please try again.
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <Button
        className='w-full mt-auto'
        onClick={handleConfirmClick}
        disabled={Boolean(hasError || Object.values(missingWords).includes(''))}
        data-testing-id='confirm-phrase-btn'
      >
        Confirm and continue
      </Button>
    </>
  )
}

export const ConfirmSecretPhrase = () => {
  const { prevStep, currentStep, mnemonic, moveToNextStep } = useCreateWalletContext()

  return (
    <form onSubmit={(event) => event.preventDefault()} className='flex flex-col h-full'>
      <OnboardingWrapper
        headerIcon={<KeySlimIcon className='size-6' />}
        entry={prevStep <= currentStep ? 'right' : 'left'}
        heading='Verify your recovery phrase'
        subHeading={
          <>
            Select the 4th, 6th and 8th words of your recovery <br />
            phrase in that same order.
          </>
        }
      >
        <ConfirmSecretPhraseView mnemonic={mnemonic} onProceed={moveToNextStep} />
      </OnboardingWrapper>
    </form>
  )
}
