import { WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import {
  generateBitcoinPrivateKey,
  generatePrivateKeyFromHdPath,
  isAptosChain,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { decrypt, getFullHDPath } from '@leapwallet/leap-keychain'
import { Buttons, Header, HeaderActionType, ThemeName, useTheme } from '@leapwallet/leap-ui'
import CanvasTextBox from 'components/canvas-box/CanvasTextBox'
import Text from 'components/text'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useChainInfos } from 'hooks/useChainInfos'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import { GenericDark, GenericLight } from 'images/logos'
import { observer } from 'mobx-react-lite'
import React, { ReactElement, useEffect, useState } from 'react'
import { chainTagsStore } from 'stores/chain-infos-store'
import { Colors } from 'theme/colors'
import { AggregatedSupportedChain } from 'types/utility'
import { UserClipboard } from 'utils/clipboard'
import { customKeygenfnMove } from 'utils/getChainInfosList'
import { imgOnError } from 'utils/imgOnError'
import { isCompassWallet } from 'utils/isCompassWallet'

import { SelectChainSheet } from './CustomEndpoints'
import { EnterPasswordView } from './EnterPasswordView'

type PrivateKeyViewProps = {
  readonly activeChain: SupportedChain
  readonly password: Uint8Array
  readonly goBack: () => void
}

function PrivateKeyView({ password, goBack, activeChain }: PrivateKeyViewProps): ReactElement {
  const [privateKey, setPrivateKey] = useState('')

  const chainInfos = useChainInfos()
  const { activeWallet } = useActiveWallet()

  useEffect(() => {
    const fn = async () => {
      if (!privateKey && activeWallet?.cipher) {
        const cipher = decrypt(activeWallet.cipher, password)
        if (activeWallet.walletType === WALLETTYPE.PRIVATE_KEY) setPrivateKey(cipher)
        else {
          const { useBip84, bip44 } = chainInfos[activeChain]
          const hdPath = getFullHDPath(
            useBip84 ? '84' : '44',
            bip44.coinType,
            activeWallet?.addressIndex.toString(),
          )
          if (useBip84) {
            const privKey = generateBitcoinPrivateKey(cipher, hdPath)
            setPrivateKey('0x' + privKey)
          } else if (isAptosChain(activeChain)) {
            const account = await customKeygenfnMove(
              decrypt(activeWallet.cipher, password),
              hdPath,
              'seedPhrase',
            )
            const privKey = account.privateKey
            setPrivateKey(privKey)
          } else {
            const privKey = await generatePrivateKeyFromHdPath(cipher, hdPath)
            setPrivateKey('0x' + privKey)
          }
        }
      }
    }

    fn()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWallet])

  return (
    <div className='panel-height'>
      <Header title='Private Key' action={{ type: HeaderActionType.BACK, onClick: goBack }} />
      <div className='flex flex-col items-center px-7 py-6'>
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

type SelectChainViewProps = {
  goBack: () => void
  selectedChain: AggregatedSupportedChain
  setSelectedChain: (chain: AggregatedSupportedChain) => void
}

const SelectChainView = observer(
  ({ selectedChain, setSelectedChain, goBack }: SelectChainViewProps) => {
    const [showSheet, setShowSheet] = useState(false)
    const [targetChain, setTargetChain] = useState(selectedChain)

    const { theme } = useTheme()
    const defaultTokenLogo = useDefaultTokenLogo()
    const chainsInfo = useChainInfos()

    const allChainsImg = theme === ThemeName.DARK ? GenericDark : GenericLight
    const defaultColor = isCompassWallet() ? Colors.compassPrimary : Colors.cosmosPrimary
    const chainDetails =
      targetChain === AGGREGATED_CHAIN_KEY
        ? {
            chainName: 'Select a chain',
            chainSymbolImageUrl: allChainsImg,
            theme: {
              primaryColor: defaultColor,
            },
          }
        : chainsInfo[targetChain]

    return (
      <div className='panel-height flex flex-col'>
        <Header title='Private Key' action={{ type: HeaderActionType.BACK, onClick: goBack }} />

        <div className='flex flex-col gap-4 px-7 flex-grow py-6'>
          <div className='flex flex-col items-center'>
            <div className='p-4 rounded-2xl dark:bg-gray-900 bg-white-100'>
              <img src={Images.Misc.KeyVpn} />
            </div>
            <div className='dark:text-white-100 text-black-100 text-base mt-4 mb-1 font-bold text-center'>
              Select a chain to export key
            </div>
            <div className='dark:text-gray-400 text-gray-600 text-xs mb-5 text-center'>
              You&apos;ll need to select a specific chain to export your private key, as each chain
              handles keys a bit differently.
            </div>
          </div>

          <button
            className='dark:bg-gray-900 bg-white-100 w-full flex items-center justify-start px-3.5 py-2.5 cursor-pointer rounded-full text-sm gap-2'
            onClick={() => setShowSheet(true)}
          >
            <img
              src={chainDetails?.chainSymbolImageUrl ?? defaultTokenLogo}
              className='h-5 w-5'
              onError={imgOnError(defaultTokenLogo)}
            />

            <span className='dark:text-gray-100 text-black-100 mr-auto'>
              {chainDetails?.chainName ?? 'Select a chain'}
            </span>

            <img src={Images.Misc.ArrowDown} className='w-2 h-2 mx-1' />
          </button>

          <Buttons.Generic
            color={chainDetails?.theme.primaryColor ?? defaultColor}
            size='normal'
            className='w-full mt-auto'
            title='Proceed'
            disabled={targetChain === AGGREGATED_CHAIN_KEY}
            onClick={() => {
              setShowSheet(false)
              setSelectedChain(targetChain)
            }}
          >
            Proceed
          </Buttons.Generic>
        </div>

        <SelectChainSheet
          chainTagsStore={chainTagsStore}
          isVisible={showSheet}
          onChainSelect={(chain) => {
            setTargetChain(chain)
            setShowSheet(false)
          }}
          onClose={() => setShowSheet(false)}
          selectedChain={targetChain as SupportedChain}
        />
      </div>
    )
  },
)

export default function ExportPrivateKey({ goBack }: { goBack: () => void }): ReactElement {
  const [password, setPassword] = useState<Uint8Array>()
  const [isRevealed, setRevealed] = useState(false)
  const activeChain = useActiveChain() as AggregatedSupportedChain
  const [selectedChain, setSelectedChain] = useState(activeChain)

  if (selectedChain === AGGREGATED_CHAIN_KEY) {
    return (
      <SelectChainView
        key={selectedChain}
        goBack={goBack}
        selectedChain={selectedChain}
        setSelectedChain={setSelectedChain}
      />
    )
  }

  if (!isRevealed || !password) {
    return (
      <EnterPasswordView
        passwordTo='view the Private key'
        setRevealed={setRevealed}
        setPassword={setPassword}
        goBack={goBack}
      />
    )
  }

  return <PrivateKeyView password={password} goBack={goBack} activeChain={selectedChain} />
}
