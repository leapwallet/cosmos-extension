import { Buttons } from '@leapwallet/leap-ui'
import CanvasTextBox from 'components/canvas-box/CanvasTextBox'
import Text from 'components/text'
import { Images } from 'images'
import React from 'react'
import { Colors } from 'theme/colors'
import { UserClipboard } from 'utils/clipboard'

import { PhraseView } from './PhraseView'

export type SeedPhraseViewProps = {
  readonly onProceed: () => void
  readonly mnemonic: string
}

export function SeedPhraseView({ onProceed, mnemonic }: SeedPhraseViewProps) {
  return (
    <PhraseView
      heading='Secret Recovery Phrase'
      subHeading='These words are the keys to your wallet. Please write them down or store it somewhere safe.'
    >
      <CanvasTextBox text={mnemonic} noSpace={false} />
      <div className='flex m-[5px] justify-center'>
        <Buttons.CopyToClipboard
          color={Colors.cosmosPrimary}
          onCopy={() => {
            UserClipboard.copyText(mnemonic)
          }}
          data-testing-id='mnemonic-copy-to-clipboard'
        />
      </div>
      <div className='w-[376px] h-auto rounded-xl dark:bg-gray-900 bg-white-100 flex items-center p-[10px] mb-[20px]'>
        <img className='mr-[16px]' src={Images.Misc.Warning} />
        <div className='flex flex-col gap-y-[2px]'>
          <Text size='xs' className='tex font-black'>
            Recommended security practice:
          </Text>
          <Text size='xs' color='text-gray-400'>
            Write down seed phrase instead of copying it
          </Text>
        </div>
      </div>
      <Buttons.Generic
        disabled={mnemonic.length == 0}
        color={Colors.cosmosPrimary}
        onClick={() => {
          onProceed()
        }}
        data-testing-id='saved-mnemonic-btn'
      >
        I have saved it somewhere safe.
      </Buttons.Generic>
    </PhraseView>
  )
}
