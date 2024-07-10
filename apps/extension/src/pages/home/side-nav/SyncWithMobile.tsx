/* eslint-disable @typescript-eslint/no-explicit-any */
import { usePrimaryWalletAddress } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Key, WALLETTYPE } from '@leapwallet/leap-keychain'
import { Buttons, Header, HeaderActionType, Input, QrCode } from '@leapwallet/leap-ui'
import { captureException } from '@sentry/react'
import CountDownTimer from 'components/countdown-timer'
import Resize from 'components/resize'
import Text from 'components/text'
import { PageName } from 'config/analytics'
import { useChainPageInfo } from 'hooks'
import { usePageView } from 'hooks/analytics/usePageView'
import { SeedPhrase } from 'hooks/wallet/seed-phrase/useSeedPhrase'
import { Wallet } from 'hooks/wallet/useWallet'
import React, { Dispatch, ReactElement, SetStateAction, useState } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  readonly password: string
}

type EnterPasswordViewProps = {
  readonly password?: string
  readonly qrData?: string
  readonly setRevealed: Dispatch<SetStateAction<boolean>>
  readonly setPassword: Dispatch<SetStateAction<string>>
  readonly setQrData?: Dispatch<SetStateAction<string>>
  readonly goBack: () => void
}

const getExportWallet = (wallets: Key<SupportedChain>[], primaryWalletAddress: string) => {
  // find and return primary wallet
  const primaryWallet = wallets.find((wallet) => wallet.addresses.cosmos === primaryWalletAddress)
  if (primaryWallet) return primaryWallet

  const seedPhraseWallet = wallets.find((wallet) => wallet.walletType === WALLETTYPE.SEED_PHRASE)

  if (seedPhraseWallet) return seedPhraseWallet

  const importedSeedPhraseWallet = wallets.find(
    (wallet) => wallet.walletType === WALLETTYPE.SEED_PHRASE_IMPORTED,
  )

  if (importedSeedPhraseWallet) return importedSeedPhraseWallet

  const pvtKeyWallet = wallets.find((wallet) => wallet.walletType === WALLETTYPE.PRIVATE_KEY)

  if (pvtKeyWallet) return pvtKeyWallet

  throw new Error('Cannot sync with hardware wallet')
}

function EnterPasswordView({
  setRevealed,
  setPassword,
  setQrData,
  goBack,
}: EnterPasswordViewProps): ReactElement {
  const { topChainColor } = useChainPageInfo()
  const primaryWalletAddress = usePrimaryWalletAddress()
  const testPassword = SeedPhrase.useTestPassword()
  const [walletError, setWalletError] = useState('')

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({ mode: 'onChange' })

  const onSubmit = (e?: React.BaseSyntheticEvent) => {
    handleSubmit(async (values) => {
      try {
        await testPassword(values.password)

        const wallets = await Wallet.getAllWallets()
        const walletObjects = Object.values(wallets).filter(Boolean)
        const exportWallet = getExportWallet(walletObjects, primaryWalletAddress)
        const cipher = exportWallet.cipher

        const derivedWallets = walletObjects
          .filter((a) => a.cipher === cipher)
          .map((a) => {
            return {
              ai: a.addressIndex,
              ci: a.colorIndex,
              n: a.name,
            }
          })

        // Sync on mobile fails if we do not include address index 0.
        if (
          exportWallet.walletType !== WALLETTYPE.PRIVATE_KEY &&
          !derivedWallets.find((a) => a.ai === 0)
        ) {
          derivedWallets.push({ ai: 0, ci: 0, n: 'Primary' })
        }

        const exportObject = { 0: cipher, 1: derivedWallets }

        setQrData && setQrData(JSON.stringify(exportObject))
        setPassword(values.password)
        setRevealed(true)
      } catch (err: any) {
        if (err.message.toLowerCase().includes('password')) {
          setError('password', {
            type: 'validate',
            message: 'Incorrect Password',
          })
        } else {
          captureException(err)
          setWalletError('Could not load your wallets')
        }
      }
    })(e)
  }

  return (
    <div className='h-[600px]'>
      <Header
        title='Sync with mobile app'
        action={{ type: HeaderActionType.BACK, onClick: goBack }}
      />
      <div className='relative flex flex-col items-center h-[528px] px-7'>
        <div className='dark:bg-gray-900 bg-white-100 rounded-2xl mt-7'>
          <div
            style={{ fontSize: 48 }}
            className='p-[12px] material-icons-round text-gray-400 dark:text-white-100'
          >
            lock
          </div>
        </div>
        <Text size='lg' className='dark:text-white-100 text-gray-900 font-bold mt-4 text-center'>
          Verify it&apos;s you
        </Text>
        <Text size='md' color='dark:text-gray-400 text-gray-700 mt-2 text0center'>
          Enter your wallet password to view QR Code
        </Text>
        <form onSubmit={onSubmit} className='mt-8 flex-grow flex flex-col justify-start'>
          <Resize>
            <Input
              autoFocus
              type='password'
              placeholder='enter password'
              {...register('password')}
              isErrorHighlighted={!!errors.password}
            />
          </Resize>

          {!!errors.password && (
            <Text size='sm' color='text-red-300' className='justify-center text-center pt-2'>
              {errors.password.message}
            </Text>
          )}

          {walletError && (
            <Text size='sm' color='text-red-300' className='justify-center text-center pt-2'>
              {walletError}
            </Text>
          )}

          <Resize className='mt-auto mb-7'>
            <Buttons.Generic type='submit' color={topChainColor}>
              Continue
            </Buttons.Generic>
          </Resize>
        </form>
      </div>
    </div>
  )
}

function QrCodeView({
  qrData,
  setRevealed,
  setPassword,
  goBack,
}: EnterPasswordViewProps): ReactElement {
  usePageView(PageName.SyncWithMobileApp)

  return (
    <div className='h-[600px]'>
      <Header
        title='Sync with mobile app'
        action={{ type: HeaderActionType.BACK, onClick: goBack }}
      />
      <div className='relative flex items-center justify-center flex-col'>
        <div className='rounded-full bg-gray-900 px-4 py-2 my-8 text-gray-200 font-bold text-xs'>
          This code expires in{' '}
          <CountDownTimer
            minutes={5}
            seconds={30}
            setRevealed={setRevealed}
            setPassword={setPassword}
          />
        </div>
        <div className='rounded-[48px] overflow-hidden bg-white-100 p-4 shadow-[0_4px_16px_8px_rgba(0,0,0,0.04)]'>
          <QrCode
            height={312}
            width={312}
            data={qrData as string}
            margin={0}
            qrOptions={{ errorCorrectionLevel: 'M' }}
          />
        </div>
        <div className='text-sm dark:text-gray-400 text-gray-800 my-4 mx-10 text-center'>
          Scan the <span className='font-bold dark:text-gray-200 text-gray-800'>QR code</span> using
          the{' '}
          <span className='font-bold dark:text-gray-200 text-gray-800'>Leap Cosmos mobile app</span>{' '}
          to sync your primary accounts and settings
        </div>
      </div>
    </div>
  )
}

export default function SyncWithMobile({ goBack }: { goBack: () => void }): ReactElement {
  const [password, setPassword] = useState('')
  const [isRevealed, setRevealed] = useState(false)
  const [qrData, setQrData] = useState('')

  return isRevealed && password !== '' && qrData.length > 0 ? (
    <QrCodeView
      qrData={qrData}
      setRevealed={setRevealed}
      setPassword={setPassword}
      goBack={goBack}
    />
  ) : (
    <EnterPasswordView
      setRevealed={setRevealed}
      setPassword={setPassword}
      setQrData={setQrData}
      goBack={goBack}
    />
  )
}
