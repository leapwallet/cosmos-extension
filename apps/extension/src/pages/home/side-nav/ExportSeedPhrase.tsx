import CanvasTextBox from 'components/canvas-box/CanvasTextBox'
import BottomModal from 'components/new-bottom-modal'
import { CopyButton } from 'components/ui/button/copy-button'
import { SeedPhrase } from 'hooks/wallet/seed-phrase/useSeedPhrase'
import { UserKeyIcon } from 'icons/user-key'
import React, { ReactElement, useState } from 'react'
import { UserClipboard } from 'utils/clipboard'

import { EnterPasswordView } from './EnterPasswordView'

function SeedPhraseView({ password }: { password: Uint8Array }): ReactElement {
  const mnemonic = SeedPhrase.useMnemonic(password)

  return (
    <div className='flex flex-col items-center gap-4'>
      <div className='size-16 rounded-full bg-secondary-100 grid place-items-center'>
        <UserKeyIcon size={24} />
      </div>

      <header className='flex flex-col items-center gap-2 text-center'>
        <span className='text-xl font-bold'>Your secret recovery phrase</span>
        <div className='text-muted-foreground text-sm'>
          Your secret recovery phrase is the only way to recover your wallet and funds!
        </div>
      </header>

      <CanvasTextBox text={mnemonic} noSpace={false} size={'md'} />

      {mnemonic && (
        <CopyButton onClick={() => UserClipboard.copyText(mnemonic)} className='gap-1'>
          Copy to clipboard
        </CopyButton>
      )}
    </div>
  )
}

export default function ExportSeedPhrase({
  isVisible,
  onClose,
}: {
  isVisible: boolean
  onClose: () => void
}): ReactElement {
  const [password, setPassword] = useState<Uint8Array>()
  const [isRevealed, setRevealed] = useState(false)

  const goBack = () => {
    onClose()
    setPassword(undefined)
    setRevealed(false)
  }

  return (
    <BottomModal
      fullScreen
      isOpen={isVisible}
      onClose={goBack}
      title={isRevealed ? 'Recovery Phrase' : 'Enter Password'}
      className='max-h-full overflow-y-auto h-full p-6 !pt-12'
    >
      {isRevealed && !!password ? (
        <SeedPhraseView password={password} />
      ) : (
        <EnterPasswordView
          passwordTo='view the Recovery Phrase'
          autoFocus={isVisible}
          setRevealed={setRevealed}
          setPassword={setPassword}
        />
      )}
    </BottomModal>
  )
}
