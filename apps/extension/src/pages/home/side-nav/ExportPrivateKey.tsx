import { WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import {
  generateBitcoinPrivateKey,
  generatePrivateKeyFromHdPath,
  isAptosChain,
  isSolanaChain,
  isSuiChain,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { decrypt, getFullHDPath } from '@leapwallet/leap-keychain'
import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import { CaretRight } from '@phosphor-icons/react'
import { base58 } from '@scure/base'
import CanvasTextBox from 'components/canvas-box/CanvasTextBox'
import BottomModal from 'components/new-bottom-modal'
import { Button } from 'components/ui/button'
import { CopyButton } from 'components/ui/button/copy-button'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useChainInfos } from 'hooks/useChainInfos'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { KeyIcon } from 'icons/key-icon'
import { GenericDark, GenericLight } from 'images/logos'
import { observer } from 'mobx-react-lite'
import React, { ReactElement, useEffect, useMemo, useState } from 'react'
import { chainTagsStore } from 'stores/chain-infos-store'
import { Colors } from 'theme/colors'
import { AggregatedSupportedChain } from 'types/utility'
import { UserClipboard } from 'utils/clipboard'
import {
  customKeygenfnMove,
  customKeygenfnSolana,
  customKeygenfnSui,
} from 'utils/getChainInfosList'
import { imgOnError } from 'utils/imgOnError'

import { SelectChainSheet } from './CustomEndpoints'
import { EnterPasswordView } from './EnterPasswordView'

type PrivateKeyViewProps = {
  readonly activeChain: SupportedChain
  readonly password: Uint8Array
}

function PrivateKeyView({ password, activeChain }: PrivateKeyViewProps): ReactElement {
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
          } else if (isSolanaChain(activeChain)) {
            const privKey = await customKeygenfnSolana(cipher, hdPath, 'seedPhrase')
            const privateKeyBytes = privKey.privateKey as Uint8Array

            let publicKeyBytes: Uint8Array

            publicKeyBytes = base58.decode(privKey.pubkey)

            if (publicKeyBytes.length === 33) {
              publicKeyBytes = publicKeyBytes.slice(1)
            }

            const combinedBytes = new Uint8Array(64)
            combinedBytes.set(privateKeyBytes)
            combinedBytes.set(publicKeyBytes, 32)

            const privateKeyBase58 = base58.encode(combinedBytes)
            setPrivateKey(privateKeyBase58)
          } else if (isSuiChain(activeChain)) {
            const privKey = await customKeygenfnSui(cipher, hdPath, 'seedPhrase')
            setPrivateKey(privKey.privateKey)
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
    <div className='flex flex-col items-center gap-4'>
      <div className='flex flex-col items-center gap-6 mb-4'>
        <div className='size-16 rounded-full bg-secondary-100 grid place-items-center'>
          <KeyIcon size={24} />
        </div>

        <header className='flex flex-col items-center gap-2 text-center'>
          <span className='text-xl font-bold'>Your private key</span>
          <div className='text-muted-foreground text-sm'>
            Please store them somewhere safe. Anyone with these words will have full access to your
            wallet.
          </div>
        </header>
      </div>

      <CanvasTextBox text={privateKey} noSpace={true} size={'md'} />

      {privateKey && (
        <CopyButton onClick={() => UserClipboard.copyText(privateKey)} className='gap-1'>
          Copy to clipboard
        </CopyButton>
      )}
    </div>
  )
}

type SelectChainViewProps = {
  selectedChain: AggregatedSupportedChain
  setSelectedChain: (chain: AggregatedSupportedChain) => void
}

const SelectChainView = observer(({ selectedChain, setSelectedChain }: SelectChainViewProps) => {
  const [showSheet, setShowSheet] = useState(false)
  const [targetChain, setTargetChain] = useState(selectedChain)

  const { theme } = useTheme()
  const defaultTokenLogo = useDefaultTokenLogo()
  const chainsInfo = useChainInfos()

  const allChainsImg = theme === ThemeName.DARK ? GenericDark : GenericLight
  const defaultColor = Colors.cosmosPrimary
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
    <>
      <div className='flex flex-col gap-4 h-full'>
        <div className='flex flex-col items-center gap-6'>
          <div className='size-16 rounded-full bg-secondary-100 grid place-items-center'>
            <KeyIcon size={24} />
          </div>

          <header className='flex flex-col items-center gap-2 text-center'>
            <span className='text-xl font-bold'>Select a chain to export key</span>
            <div className='text-muted-foreground text-sm'>
              You&apos;ll need to select a specific chain to export your private key, as each chain
              handles keys a bit differently.
            </div>
          </header>
        </div>

        <button
          className='bg-secondary-100 w-full flex items-center justify-start px-5 py-4 cursor-pointer rounded-xl text-sm gap-3 mt-8 hover:bg-secondary-200'
          onClick={() => setShowSheet(true)}
        >
          <img
            className='size-5'
            onError={imgOnError(defaultTokenLogo)}
            src={chainDetails?.chainSymbolImageUrl ?? defaultTokenLogo}
          />

          <span
            className={
              'text-sm font-bold mr-auto ' +
              (targetChain && targetChain !== AGGREGATED_CHAIN_KEY
                ? 'text-foreground'
                : 'text-muted-foreground ')
            }
          >
            {chainDetails?.chainName ?? 'Select a chain'}
          </span>

          <CaretRight size={14} className='text-muted-foreground' />
        </button>

        <Button
          className='w-full mt-auto'
          disabled={targetChain === AGGREGATED_CHAIN_KEY}
          onClick={() => {
            setShowSheet(false)
            setSelectedChain(targetChain)
          }}
        >
          Proceed
        </Button>
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
        showAggregatedOption={false}
      />
    </>
  )
})

const tabToTitle = {
  'select-chain': 'Select a chain',
  'enter-password': 'Enter Password',
  'private-key': 'Private Key',
}

export default function ExportPrivateKey({
  isVisible,
  onClose,
}: {
  isVisible: boolean
  onClose: () => void
}): ReactElement {
  const [password, setPassword] = useState<Uint8Array>()
  const [isRevealed, setRevealed] = useState(false)
  const activeChain = useActiveChain() as AggregatedSupportedChain
  const [selectedChain, setSelectedChain] = useState(activeChain)

  const handleClose = () => {
    setPassword(undefined)
    setRevealed(false)
    setSelectedChain(activeChain)
    onClose()
  }

  const tab = useMemo(() => {
    if (selectedChain === AGGREGATED_CHAIN_KEY) {
      return 'select-chain'
    }

    if (!isRevealed || !password) {
      return 'enter-password'
    }

    return 'private-key'
  }, [selectedChain, isRevealed, password])

  return (
    <BottomModal
      fullScreen
      isOpen={isVisible}
      onClose={handleClose}
      title={tabToTitle[tab]}
      className='max-h-full overflow-y-auto h-full p-6 !pt-12'
    >
      {tab === 'select-chain' && (
        <SelectChainView
          key={`${selectedChain}-${isVisible}`}
          selectedChain={selectedChain}
          setSelectedChain={setSelectedChain}
        />
      )}

      {tab === 'enter-password' && (
        <EnterPasswordView
          key={isVisible ? 1 : 0}
          passwordTo='view the Private key'
          setRevealed={setRevealed}
          setPassword={setPassword}
          autoFocus={isVisible}
        />
      )}

      {tab === 'private-key' && !!password && (
        <PrivateKeyView
          key={isVisible ? 1 : 0}
          password={password}
          activeChain={selectedChain as SupportedChain}
        />
      )}
    </BottomModal>
  )
}
