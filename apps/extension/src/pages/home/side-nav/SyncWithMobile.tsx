/* eslint-disable @typescript-eslint/no-explicit-any */
import { usePrimaryWalletAddress } from '@leapwallet/cosmos-wallet-hooks'
import { pubKeyToEvmAddressToShow, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Key, WALLETTYPE } from '@leapwallet/leap-keychain'
import { QrCode } from '@leapwallet/leap-ui'
import { captureException } from '@sentry/react'
import CountDownTimer from 'components/countdown-timer'
import BottomModal from 'components/new-bottom-modal'
import { Button } from 'components/ui/button'
import { PasswordInput } from 'components/ui/input/password-input'
import { PageName } from 'config/analytics'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { usePageView } from 'hooks/analytics/usePageView'
import { SeedPhrase } from 'hooks/wallet/seed-phrase/useSeedPhrase'
import { Wallet } from 'hooks/wallet/useWallet'
import { LockIcon } from 'icons/lock'
import React, { Dispatch, ReactElement, SetStateAction, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { transition200 } from 'utils/motion-variants/global-layout-motions'
import { uiErrorTags } from 'utils/sentry'

type FormData = {
  readonly rawPassword: string
}

type EnterPasswordViewProps = {
  readonly password?: string
  readonly qrData?: string
  readonly setRevealed: Dispatch<SetStateAction<boolean>>
  readonly setPassword: Dispatch<SetStateAction<string>>
  readonly setQrData?: Dispatch<SetStateAction<string>>
}

const getExportWallet = (wallets: Key<SupportedChain>[], primaryWalletAddress: string) => {
  // find and return primary wallet
  const primaryWallet = wallets.find((wallet) => {
    if (wallet?.addresses?.cosmos) {
      return wallet?.addresses?.cosmos === primaryWalletAddress
    }
    if (wallet?.pubKeys?.ethereum) {
      const evmAddress = pubKeyToEvmAddressToShow(wallet?.pubKeys?.ethereum, true)
      return evmAddress === primaryWalletAddress
    }
    if (wallet?.pubKeys?.solana) {
      return wallet?.pubKeys?.solana === primaryWalletAddress
    }
    if (wallet?.addresses?.sui) {
      return wallet?.addresses?.sui === primaryWalletAddress
    }
    return false
  })
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
}: EnterPasswordViewProps): ReactElement {
  const primaryWalletAddress = usePrimaryWalletAddress()
  const testPassword = SeedPhrase.useTestPassword()
  const [walletError, setWalletError] = useState('')

  const formRef = useRef<HTMLFormElement>(null)

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<FormData>({ mode: 'onChange' })

  const password = watch('rawPassword')

  const onSubmit = async (values: FormData) => {
    try {
      const password = new TextEncoder().encode(values.rawPassword)
      await testPassword(password)

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
      setPassword(values.rawPassword)
      setRevealed(true)
    } catch (err: any) {
      if (err.message.toLowerCase().includes('password')) {
        setError('rawPassword', {
          type: 'validate',
          message: 'Incorrect Password',
        })
      } else {
        captureException(err, {
          tags: uiErrorTags,
        })
        setWalletError('Could not load your wallets')
      }
    }
  }

  // delay auto focus to prevent jitter
  useEffect(() => {
    const passwordInput = formRef.current?.querySelector('#password') as HTMLInputElement
    if (!passwordInput) {
      return
    }

    const timeout = setTimeout(() => {
      passwordInput.focus()
    }, 250)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <>
      <div className='p-5 bg-secondary-200 rounded-full grid place-content-center w-fit mx-auto mt-4'>
        <LockIcon size={24} />
      </div>

      <header className='flex flex-col items-center gap-2'>
        <span className='text-xl font-bold'>Verify it&apos;s you</span>
        <span className='text-sm'>Enter your wallet password to view QR Code</span>
      </header>

      <form
        ref={formRef}
        onSubmit={handleSubmit(onSubmit)}
        className='mt-2 flex-grow flex flex-col justify-start'
      >
        <PasswordInput
          id='password'
          type='password'
          placeholder='Enter password'
          {...register('rawPassword')}
          autoFocus={false}
          status={errors.rawPassword ? 'error' : 'default'}
        />

        {(!!errors.rawPassword || !!walletError) && (
          <span className='text-sm text-destructive-100 font-medium mt-2 text-center animate-fadeIn duration-100'>
            {errors.rawPassword?.message || walletError}
          </span>
        )}

        <Button disabled={!password} className='mt-auto'>
          Enter password
        </Button>
      </form>
    </>
  )
}

function QrCodeView({ qrData, setRevealed, setPassword }: EnterPasswordViewProps): ReactElement {
  usePageView(PageName.SyncWithMobileApp)

  return (
    <>
      <div className='rounded-full px-5 py-2.5 font-medium text-xs bg-secondary-100 w-fit mx-auto min-w-[11.75rem]'>
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
          height={Math.min(400, window.innerWidth) - 88}
          width={Math.min(400, window.innerWidth) - 88}
          data={qrData as string}
          margin={0}
          qrOptions={{ errorCorrectionLevel: 'M' }}
        />
      </div>

      <span className='text-xs font-medium text-secondary-800 text-center'>
        Scan the QR code using the Leap mobile app to sync your primary accounts and settings.
      </span>
    </>
  )
}

const tabVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
}

export default function SyncWithMobile({
  open,
  goBack,
}: {
  open: boolean
  goBack: () => void
}): ReactElement {
  const [password, setPassword] = useState('')
  const [isRevealed, setRevealed] = useState(false)
  const [qrData, setQrData] = useState('')

  const showQrCode = isRevealed && password !== '' && qrData.length > 0

  return (
    <BottomModal
      fullScreen
      isOpen={open}
      onClose={goBack}
      title={
        <AnimatePresence mode='wait' initial={false}>
          {showQrCode ? (
            <motion.span
              key='sync-with-mobile-app'
              initial='hidden'
              animate='visible'
              exit='exit'
              variants={tabVariants}
              transition={transition200}
            >
              Sync with mobile app
            </motion.span>
          ) : (
            <motion.span
              key='enter-password'
              initial='hidden'
              animate='visible'
              exit='exit'
              variants={tabVariants}
              transition={transition200}
            >
              Enter Password
            </motion.span>
          )}
        </AnimatePresence>
      }
      className='p-6 h-full'
    >
      <AnimatePresence mode='wait' initial={false}>
        {showQrCode ? (
          <motion.div
            key='qr-code-view'
            initial='hidden'
            animate='visible'
            exit='exit'
            variants={tabVariants}
            transition={transition200}
            className='flex flex-col gap-6 h-full'
          >
            <QrCodeView qrData={qrData} setRevealed={setRevealed} setPassword={setPassword} />
          </motion.div>
        ) : (
          <motion.div
            key='enter-password-view'
            initial='hidden'
            animate='visible'
            exit='exit'
            variants={tabVariants}
            transition={transition200}
            className='flex flex-col gap-6 h-full'
          >
            <EnterPasswordView
              setRevealed={setRevealed}
              setPassword={setPassword}
              setQrData={setQrData}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </BottomModal>
  )
}
