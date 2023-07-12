import { Buttons, Header, HeaderActionType } from '@leapwallet/leap-ui'
import CanvasTextBox from 'components/canvas-box/CanvasTextBox'
import Text from 'components/text'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { SeedPhrase } from 'hooks/wallet/seed-phrase/useSeedPhrase'
import { Images } from 'images'
import React, { ReactElement, useState } from 'react'
import { Colors } from 'theme/colors'
import { UserClipboard } from 'utils/clipboard'

import { EnterPasswordView } from './EnterPasswordView'

function SeedPhraseView({
  goBack,
  password,
}: {
  password: string
  goBack: () => void
}): ReactElement {
  const mnemonic = SeedPhrase.useMnemonic(password)
  const activeChain = useActiveChain()

  return (
    <div className='h-[600px] overflow-scroll'>
      <Header
        topColor={Colors.getChainColor(activeChain)}
        title='Secret Recovery Phrase'
        action={{
          type: HeaderActionType.BACK,
          onClick: goBack,
          'data-testing-id': 'export-seed-phrase-back-btn',
        }}
      />
      <div className='flex flex-col items-center p-[28px] pt-[10px]'>
        <div className='p-4 rounded-2xl dark:bg-gray-900 bg-white-100'>
          <img src={Images.Misc.TextSnippet} />
        </div>
        <div className='dark:text-white-100 text-black-100 text-base mt-4 mb-1 font-bold'>
          These words are the keys to your wallet
        </div>
        <div className='dark:text-gray-400 text-gray-600 text-xs mb-5 w-4/5 text-center'>
          Please store them somewhere safe. Anyone with these words will have full access to your
          wallet
        </div>
        <CanvasTextBox text={mnemonic} noSpace={false} size={'md'} />
        <Buttons.CopyToClipboard
          color={Colors.cosmosPrimary}
          data-testing-id='copy-seed-phrase'
          onCopy={() => {
            UserClipboard.copyText(mnemonic)
          }}
        />
        <div className='w-full h-auto rounded-xl dark:bg-gray-900 bg-white-100 flex items-center p-[10px] my-[20px]'>
          <img className='mr-[16px]' src={Images.Misc.Warning} />
          <div className='flex flex-col gap-y-[2px]'>
            <Text size='xs' className='font-black'>
              Recommended security practice:
            </Text>
            <Text size='xs' color='text-gray-400'>
              Write down seed phrase instead of copying it
            </Text>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ExportSeedPhrase({ goBack }: { goBack: () => void }): ReactElement {
  const [password, setPassword] = useState('')
  const [isRevealed, setRevealed] = useState(false)
  return isRevealed && password != '' ? (
    <SeedPhraseView password={password} goBack={goBack} />
  ) : (
    <EnterPasswordView
      passwordTo='view the Secret Recovery Phrase'
      setRevealed={setRevealed}
      setPassword={setPassword}
      goBack={goBack}
    />
  )
}
