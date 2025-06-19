import { Buttons, Header, HeaderActionType } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import CanvasTextBox from 'components/canvas-box/CanvasTextBox'
import Text from 'components/text'
import { useChainPageInfo } from 'hooks'
import { SeedPhrase } from 'hooks/wallet/seed-phrase/useSeedPhrase'
import { Images } from 'images'
import React, { ReactElement, useState } from 'react'
import { UserClipboard } from 'utils/clipboard'

import { EnterPasswordView } from './EnterPasswordView'

function SeedPhraseView({
  goBack,
  password,
}: {
  password: Uint8Array
  goBack: () => void
}): ReactElement {
  const mnemonic = SeedPhrase.useMnemonic(password)
  const { topChainColor } = useChainPageInfo()

  return (
    <div className={classNames('panel-height enclosing-panel overflow-scroll')}>
      <Header
        title='Recovery Phrase'
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
        <div className='dark:text-white-100 text-black-100 text-base mt-4 mb-1 font-bold text-center'>
          These words are the keys to your wallet
        </div>
        <div className='dark:text-gray-400 text-gray-600 text-xs mb-5 w-4/5 text-center'>
          Exporting a recovery phrase to MetaMask might give a different address, use private key
          instead.
        </div>

        <CanvasTextBox text={mnemonic} noSpace={false} size={'md'} />
        <Buttons.CopyToClipboard
          color={topChainColor}
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
              Write down recovery phrase instead of copying it
            </Text>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ExportSeedPhrase({ goBack }: { goBack: () => void }): ReactElement {
  const [password, setPassword] = useState<Uint8Array>()
  const [isRevealed, setRevealed] = useState(false)
  return isRevealed && !!password ? (
    <SeedPhraseView password={password} goBack={goBack} />
  ) : (
    <EnterPasswordView
      passwordTo='view the Recovery Phrase'
      setRevealed={setRevealed}
      setPassword={setPassword}
      goBack={goBack}
    />
  )
}
