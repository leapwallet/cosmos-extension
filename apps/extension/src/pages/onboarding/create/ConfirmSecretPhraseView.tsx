import { Buttons } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import { CanvasBox } from 'components/canvas-box/CanvasTextBox'
import Text from 'components/text'
import React, { ChangeEvent, ComponentPropsWithoutRef, useMemo, useState } from 'react'
import { ChangeEventHandler } from 'react'
import { Colors } from 'theme/colors'
import { getWordFromMnemonic } from 'utils/getWordFromMnemonic'

import { PhraseView } from './PhraseView'
import { SeedPhraseViewProps } from './SeedPhraseView'

type WordInputProps = ComponentPropsWithoutRef<'input'> & {
  readonly value?: string
  readonly onChange?: ChangeEventHandler
  readonly name?: string
  readonly className?: string
}

function WordInput({ value, onChange, name, className, ...rest }: WordInputProps) {
  return (
    <input
      type='text'
      className={classNames(
        'w-[80px] h-[28px] border-[1px] border-solid dark:border-white-100 border-gray-800 focus:outline-none rounded-2xl dark:bg-gray-800 bg-gray-50 text-center dark:text-white-100 text-gray-800',
        className,
      )}
      value={value ?? ''}
      name={name ?? ''}
      onChange={onChange}
      autoComplete='off'
      autoCorrect='off'
      autoCapitalize='off'
      {...rest}
    />
  )
}

export function ConfirmSecretPhraseView({ onProceed, mnemonic }: SeedPhraseViewProps) {
  const [error, setError] = useState('')
  const [missingWords, setMissingWords] = useState({
    four: '',
    eight: '',
    tweleve: '',
  })

  const words = useMemo(() => {
    const _words = mnemonic.trim().split(' ')
    _words[3] = ''
    _words[7] = ''
    _words[11] = ''

    return _words.join(' ')
  }, [mnemonic])

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    setError('')
    setMissingWords((prevValue) => ({ ...prevValue, [event.target.name]: event.target.value }))
  }

  function handleConfirmClick() {
    const _four = getWordFromMnemonic(mnemonic, 4)
    if (_four !== missingWords.four.trim()) {
      setError('Enter correct 4th word.')
      return
    }

    const _eigth = getWordFromMnemonic(mnemonic, 8)
    if (_eigth !== missingWords.eight.trim()) {
      setError('Enter correct 8th word.')
      return
    }

    const _tweleve = getWordFromMnemonic(mnemonic, 12)
    if (_tweleve !== missingWords.tweleve.trim()) {
      setError('Enter correct 12th word.')
      return
    }

    onProceed()
  }

  const isBtnDisabled = useMemo(
    function () {
      return Object.values(missingWords).includes('')
    },
    [missingWords],
  )

  return (
    <PhraseView
      heading='Confirm Secret Recovery Phrase'
      subHeading='Enter the 4th, 8th and 12th words of your Secret Recovery Phrase'
    >
      <form onSubmit={(event) => event.preventDefault()}>
        <div
          className={classNames(
            'relative rounded-2xl dark:bg-gray-900 bg-white-100 text-xs font-medium box-border font-Satoshi h-[184px] w-[376px] p-5',
            { 'mb-[25px]': error === '' },
          )}
        >
          <CanvasBox height={144} width={376 - 30} text={words} noSpace={false} />
          <WordInput
            name='four'
            value={missingWords.four}
            onChange={handleInputChange}
            className='absolute top-[63px] left-[45px]'
            data-testing-id='input-fourth-word'
          />

          <WordInput
            name='eight'
            value={missingWords.eight}
            onChange={handleInputChange}
            className='absolute top-[98px] left-[160px]'
            data-testing-id='input-eighth-word'
          />

          <WordInput
            name='tweleve'
            value={missingWords.tweleve}
            onChange={handleInputChange}
            className='absolute top-[130px] left-[273px]'
            data-testing-id='input-tweleveth-word'
          />
        </div>

        {error && (
          <Text size='sm' color='text-red-300 mt-[12px] mb-[16px]' data-testing-id='error-text-ele'>
            {error}
          </Text>
        )}
        <Buttons.Generic
          type='submit'
          disabled={isBtnDisabled}
          color={Colors.cosmosPrimary}
          onClick={handleConfirmClick}
          data-testing-id='confirm-phrase-btn'
        >
          Confirm
        </Buttons.Generic>
      </form>
    </PhraseView>
  )
}
