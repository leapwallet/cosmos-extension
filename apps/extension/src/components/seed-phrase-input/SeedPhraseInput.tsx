import classNames from 'classnames'
import { Images } from 'images'
import React, { useState } from 'react'

type SeedPhraseWordInputProps = {
  // eslint-disable-next-line no-unused-vars
  handlePaste: (wordIndex: number, value: string) => void
  wordIndex: number
  word: string
  // eslint-disable-next-line no-unused-vars
  handleWordChange: (wordIndex: number, value: string) => void
  isError: boolean
  isFocused: boolean
  // eslint-disable-next-line no-unused-vars
  handleWordFocused: (wordIndex: number) => void
  handleWordBlur: () => void
}

function SeedPhraseWordInput({
  wordIndex,
  word,
  handlePaste,
  handleWordChange,
  isError,
  isFocused,
  handleWordFocused,
  handleWordBlur,
}: SeedPhraseWordInputProps) {
  return (
    <div
      className={classNames(
        'relative rounded-lg bg-white-100 dark:bg-gray-900 flex h-[40px] p-3 items-center',
        {
          'border-2': isFocused || isError,
          'border-gray-600': isFocused,
          'border-red-300': isError,
        },
      )}
      onFocus={() => handleWordFocused(wordIndex)}
      onBlur={() => handleWordBlur()}
      tabIndex={0}
      onPaste={(event) => {
        event.preventDefault()
        handlePaste(wordIndex, event.clipboardData.getData('text'))
      }}
    >
      {isFocused || word.length !== 0 ? (
        <input
          ref={(node) => node && isFocused && node.focus()}
          className='absolute flex-1 w-[80%] bg-white-100 dark:bg-gray-900 outline-none text-gray-800 dark:text-white-100'
          type={isFocused ? 'text' : 'password'}
          value={word}
          onChange={(event) => handleWordChange(wordIndex, event.target.value)}
        />
      ) : (
        <span className='text-gray-600'>{wordIndex}</span>
      )}
    </div>
  )
}

type SeedPhraseInputProps = {
  // eslint-disable-next-line no-unused-vars
  onChangeHandler: (value: string) => void
  isError: boolean
  heading: string
  onPage?: string
}

export function SeedPhraseInput({
  onChangeHandler,
  isError,
  heading,
  onPage,
}: SeedPhraseInputProps) {
  const [focusedWordIndex, setFocusedWordIndex] = useState(1)
  const [seedPhraseWordCount, setSeedPhraseWordCount] = useState(12)
  const [seedPhraseWords, setSeedPhraseWords] = useState(new Array(12).fill(''))
  const [showDropdown, setShowDropdown] = useState(false)

  const handleSeedPhraseWordIndexChange = (newCount: number) => {
    setSeedPhraseWordCount(newCount)
    setSeedPhraseWords(new Array(newCount).fill(''))
    setShowDropdown(false)
  }

  const handlePaste = (wordIndex: number, clipboardText: string) => {
    const words = clipboardText
      .trim()
      .split(' ')
      .map((word) => word.trim())
      .filter((word) => word.length)

    if (words.length) {
      if (words.length === 12 || words.length === 24) {
        if (words.length === 24) setSeedPhraseWordCount(24)
        else if (words.length === 12) setSeedPhraseWordCount(12)

        setSeedPhraseWords(words)
        onChangeHandler(words.join(' ').trim())
        return
      }

      for (
        let index = wordIndex;
        index < Math.min(seedPhraseWordCount, words.length + wordIndex);
        index++
      ) {
        seedPhraseWords[index - 1] = words[index - wordIndex]
      }

      setSeedPhraseWords(seedPhraseWords)
      onChangeHandler(seedPhraseWords.join(' ').trim())
    }
  }

  const handleWordChange = (wordIndex: number, value: string) => {
    seedPhraseWords[wordIndex - 1] = value
    setSeedPhraseWords(seedPhraseWords)
    onChangeHandler(seedPhraseWords.join(' ').trim())
  }

  const handleWordFocused = (wordIndex: number) => {
    setFocusedWordIndex(wordIndex)
  }

  const handleWordBlur = () => {
    setFocusedWordIndex(-1)
  }

  return (
    <div className='w-full'>
      <div
        className={classNames('flex justify-between items-center mb-4 w-full', {
          'flex-col gap-y-4': onPage === 'SelectWallet',
        })}
      >
        <p className='text-gray-400 dark:text-gray-200'>{heading}</p>
        <button
          className='bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white-100 flex items-center rounded-full gap-2 py-2 px-4 relative'
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <span>{seedPhraseWordCount} words</span>
          <img src={Images.Misc.ArrowDown} alt='arrow down' />
          {showDropdown && (
            <div className='shadow-md shadow-gray-100 dark:shadow-gray-800 w-[110%] absolute flex flex-col rounded-xl z-10 top-[48px] left-0 bg-gray-50 dark:bg-gray-900 items-start p-2 dark:text-white-100 text-gray-900'>
              <button className='pb-2 w-full' onClick={() => handleSeedPhraseWordIndexChange(12)}>
                12 words
              </button>
              <button
                className='pt-2 w-full border-t-[0.5px] border-gray-100 dark:border-gray-800'
                onClick={() => handleSeedPhraseWordIndexChange(24)}
              >
                24 words
              </button>
            </div>
          )}{' '}
        </button>
      </div>

      <div className='w-full bg-gray-50 dark:bg-gray-950 rounded-2xl p-4 grid grid-cols-3 gap-2'>
        {seedPhraseWords.map((value, index) => {
          return (
            <SeedPhraseWordInput
              wordIndex={index + 1}
              key={`${value}-${index}`}
              word={value}
              handlePaste={handlePaste}
              handleWordChange={handleWordChange}
              isError={isError}
              isFocused={index + 1 === focusedWordIndex}
              handleWordFocused={handleWordFocused}
              handleWordBlur={handleWordBlur}
            />
          )
        })}
      </div>
    </div>
  )
}
