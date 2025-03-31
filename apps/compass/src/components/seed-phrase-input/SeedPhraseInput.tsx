import classNames from 'classnames'
import { inputStatusOutlineClassMap } from 'components/ui/input'
import { TabSelectors } from 'components/ui/tab-list-selectors'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import React, { useState } from 'react'
import { cn } from 'utils/cn'

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

const SeedPhraseWordInput = ({
  wordIndex,
  word,
  handlePaste,
  handleWordChange,
  isError,
  isFocused,
  handleWordFocused,
  handleWordBlur,
}: SeedPhraseWordInputProps) => {
  return (
    <div
      className={classNames(
        'flex items-center gap-2 rounded-lg bg-secondary-200 h-9 w-28 py-2 px-3 text-xs font-medium overflow-hidden',
        inputStatusOutlineClassMap[isError ? 'error' : 'default'],
      )}
      onFocus={() => handleWordFocused(wordIndex)}
      onBlur={() => handleWordBlur()}
      tabIndex={0}
      onPaste={(event) => {
        event.preventDefault()
        handlePaste(wordIndex, event.clipboardData.getData('text'))
      }}
    >
      <span className='text-muted-foreground shrink-0'>{wordIndex}</span>

      <input
        ref={(node) => node && isFocused && node.focus()}
        type={isFocused || isError ? 'text' : 'password'}
        value={word}
        onChange={(event) => handleWordChange(wordIndex, event.target.value)}
        className='flex-1 outline-none bg-transparent w-0 text-foreground font-bold'
      />
    </div>
  )
}

type SeedPhraseInputProps = {
  onChangeHandler: (value: string) => void
  isError: boolean
  onPage?: string
  className?: string
}

const transition = { duration: 0.2, ease: 'easeInOut' }

const variants: Variants = {
  left: { opacity: 0, x: 10, transition },
  right: { opacity: 0, x: -10, transition },
  visible: { opacity: 1, x: 0, transition },
}

export const SeedPhraseInput = ({ onChangeHandler, isError, className }: SeedPhraseInputProps) => {
  const [focusedWordIndex, setFocusedWordIndex] = useState(1)
  const [seedPhraseWordCount, setSeedPhraseWordCount] = useState(12)
  const [seedPhraseWords, setSeedPhraseWords] = useState(new Array(12).fill('') as string[])

  const handleSeedPhraseWordIndexChange = (newCount: number) => {
    setSeedPhraseWordCount(newCount)
    setSeedPhraseWords(new Array(newCount).fill(''))
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
    <div className={className}>
      <div className={'flex flex-col justify-between items-center w-full mb-7'}>
        <TabSelectors
          selectedIndex={seedPhraseWordCount === 12 ? 0 : 1}
          buttons={[
            {
              label: '12 words',
              onClick: () => handleSeedPhraseWordIndexChange(12),
            },
            {
              label: '24 words',
              onClick: () => handleSeedPhraseWordIndexChange(24),
            },
          ]}
        />
      </div>

      <AnimatePresence exitBeforeEnter>
        <motion.div
          key={seedPhraseWordCount}
          className={cn(
            'w-full grid grid-cols-3 gap-4 justify-items-center overflow-auto p-1',
            isError ? 'max-h-[14.75rem]' : 'max-h-[17.375rem]',
          )}
          variants={variants}
          initial={seedPhraseWords.length === 12 ? 'left' : 'right'}
          animate={'visible'}
          exit={seedPhraseWords.length === 12 ? 'right' : 'left'}
        >
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
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
