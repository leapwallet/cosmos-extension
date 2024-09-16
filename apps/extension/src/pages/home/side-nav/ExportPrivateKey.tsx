import { WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { generatePrivateKeyFromHdPath } from '@leapwallet/cosmos-wallet-sdk'
import getHDPath from '@leapwallet/cosmos-wallet-sdk/dist/browser/utils/get-hdpath'
import { decrypt } from '@leapwallet/leap-keychain'
import { Buttons, Header, HeaderActionType } from '@leapwallet/leap-ui'
import CanvasTextBox from 'components/canvas-box/CanvasTextBox'
import Text from 'components/text'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useChainInfos } from 'hooks/useChainInfos'
import { Images } from 'images'
import React, { ReactElement, useEffect, useState } from 'react'
import { Colors } from 'theme/colors'
import { UserClipboard } from 'utils/clipboard'

import { EnterPasswordView } from './EnterPasswordView'

type PrivateKeyViewProps = {
  readonly password: string
  readonly goBack: () => void
}

function PrivateKeyView({ password, goBack }: PrivateKeyViewProps): ReactElement {
  const [privateKey, setPrivateKey] = useState('')

  const chainInfos = useChainInfos()
  const activeChain = useActiveChain()
  const { activeWallet } = useActiveWallet()

  useEffect(() => {
    const fn = async () => {
      if (!privateKey && activeWallet?.cipher) {
        const cipher = decrypt(activeWallet.cipher, password)
        if (activeWallet.walletType === WALLETTYPE.PRIVATE_KEY) setPrivateKey(cipher)
        else {
          const privKey = await generatePrivateKeyFromHdPath(
            cipher,
            getHDPath(
              chainInfos[activeChain].bip44.coinType,
              activeWallet?.addressIndex.toString(),
            ),
          )
          setPrivateKey('0x' + privKey)
        }
      }
    }

    fn()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWallet])

  return (
    <div className='panel-height '>
      <Header title='Private Key' action={{ type: HeaderActionType.BACK, onClick: goBack }} />
      <div className='flex flex-col items-center p-7 pt-[10px]'>
        <div className='p-4 rounded-2xl dark:bg-gray-900 bg-white-100'>
          <img src={Images.Misc.KeyVpn} />
        </div>
        <div className='dark:text-white-100 text-black-100 text-base mt-4 mb-1 font-bold text-center'>
          These words are the keys to your wallet
        </div>
        <div className='dark:text-gray-400 text-gray-600 text-xs mb-5 w-4/5 text-center'>
          Please store them somewhere safe. Anyone with these words will have full access to your
          wallet
        </div>
        <CanvasTextBox text={privateKey} noSpace={true} size={'md'} />
        <Buttons.CopyToClipboard
          data-testing-id='copy-private-key'
          color={Colors.getChainColor(activeChain)}
          onCopy={() => {
            UserClipboard.copyText(privateKey)
          }}
        />
        <div className='w-full h-auto rounded-xl dark:bg-gray-900 bg-white-100 flex items-center p-[10px] mt-[20px] mb-[10px]'>
          <img className='mr-[16px]' src={Images.Misc.Warning} />
          <div className='flex flex-col gap-y-[2px]'>
            <Text size='xs' className='tex font-black'>
              Recommended security practice:
            </Text>
            <Text size='xs' color='text-gray-400'>
              Write down private key instead of copying it
            </Text>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ExportPrivateKey({ goBack }: { goBack: () => void }): ReactElement {
  const [password, setPassword] = useState('')
  const [isRevealed, setRevealed] = useState(false)

  return isRevealed ? (
    <PrivateKeyView password={password} goBack={goBack} />
  ) : (
    <EnterPasswordView
      passwordTo='view the Private key'
      setRevealed={setRevealed}
      setPassword={setPassword}
      goBack={goBack}
    />
  )
}
