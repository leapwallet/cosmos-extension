import HCaptcha from '@hcaptcha/react-hcaptcha'
import {
  getSeiEvmInfo,
  SeiEvmInfoEnum,
  useActiveChain,
  useFeatureFlags,
  useSeiLinkedAddressState,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import { ArrowSquareOut } from '@phosphor-icons/react'
import { AlertStripV2 } from 'components/alert-strip/alert-strip-v2'
import BottomModal from 'components/bottom-modal'
import { CopyAddressCard } from 'components/card'
import { ErrorCard } from 'components/ErrorCard'
import { Button } from 'components/ui/button'
import { ButtonName, EventName } from 'config/analytics'
import { SHOW_LINK_ADDRESS_NUDGE } from 'config/storage-keys'
import { useGetWalletAddresses } from 'hooks/useGetWalletAddresses'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import mixpanel from 'mixpanel-browser'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useRef, useState } from 'react'
import { globalSheetsStore } from 'stores/ui/global-sheets-store'
import { sidePanel } from 'utils/isSidePanel'
import Browser from 'webextension-polyfill'

const AddressList = observer(() => {
  const walletAddresses = useGetWalletAddresses()

  return (
    <BottomModal
      isOpen={globalSheetsStore.isCopyAddressSheetOpen}
      onClose={() => globalSheetsStore.setCopyAddressSheetOpen(false)}
      title={'Copy wallet address'}
      className='flex flex-col items-center justify-center gap-2 max-h-[400px] w-full overflow-y-auto'
    >
      {walletAddresses.map((address, index) => (
        <CopyAddressCard address={address} key={`${address}-${index}`} />
      ))}
    </BottomModal>
  )
})

export const LinkAddressSheet = observer(() => {
  const walletAddresses = useGetWalletAddresses()
  const [error, setError] = useState<string>()
  const activeChain = useActiveChain()

  const hCaptchaRef = useRef<HCaptcha>(null)
  const [hCaptchaError, setHCaptchaError] = useState<string>('')
  const [showLoadingMessage, setShowLoadingMessage] = useState('')

  const activeNetwork = useSelectedNetwork()
  const { data: featureFlags } = useFeatureFlags()

  const getWallet = Wallet.useGetWallet()
  const { addressLinkState, updateAddressLinkState } = useSeiLinkedAddressState(getWallet)

  const [showRefreshText, setShowRefreshText] = useState(false)

  const handleLinkAddressClick = async () => {
    setShowLoadingMessage('')

    if (addressLinkState === 'success') {
      return
    }

    if (showRefreshText) {
      const homePageUrl = sidePanel ? `/sidepanel.html#/home` : `/index.html#/home`
      window.location.href = Browser.runtime.getURL(homePageUrl)
      window.location.reload()

      return
    }

    try {
      mixpanel.track(EventName.ButtonClick, {
        buttonName: ButtonName.LINK_ADDRESS,
        walletAddresses,
      })
    } catch (_) {
      //
    }

    if (featureFlags?.link_evm_address?.extension === 'redirect') {
      const dAppLink = (await getSeiEvmInfo({
        activeNetwork,
        activeChain: activeChain as 'seiDevnet' | 'seiTestnet2',
        infoType: SeiEvmInfoEnum.NO_FUNDS_DAPP_LINK,
      })) as string

      window.open(dAppLink, '_blank')
      setShowRefreshText(true)
      globalSheetsStore.setCopyAddressSheetOpen(false)

      return
    }

    if (featureFlags?.link_evm_address?.extension === 'no-funds') {
      try {
        const result = await hCaptchaRef.current?.execute({ async: true })

        if (!result) {
          setHCaptchaError('Could not get hCaptcha response. Please try again.')
          return
        }

        await updateAddressLinkState({
          setError,
          onClose: () => {
            globalSheetsStore.setCopyAddressSheetOpen(false)
            localStorage.setItem(SHOW_LINK_ADDRESS_NUDGE, 'false')
          },
          ethAddress: walletAddresses[0],
          token: result.response,
          setShowLoadingMessage,
        })
      } catch (_) {
        setHCaptchaError('Failed to verify captcha. Please try again.')
      }

      return
    }

    await updateAddressLinkState({
      setError,
      onClose: () => {
        globalSheetsStore.setCopyAddressSheetOpen(false)
        localStorage.setItem(SHOW_LINK_ADDRESS_NUDGE, 'false')
      },
      ethAddress: walletAddresses[0],
    })
  }

  const btnText = useMemo(() => {
    if (addressLinkState === 'loading') {
      return 'Loading'
    }

    if (addressLinkState === 'success') {
      return 'Addresses linked successfully'
    }

    if (showRefreshText) {
      return 'Refresh & verify'
    }

    if (featureFlags?.link_evm_address?.extension === 'redirect') {
      return (
        <span className='flex items-center gap-1'>
          Link Addresses
          <ArrowSquareOut size={20} className='!leading-[20px]' />
        </span>
      )
    }

    return 'Link Addresses'
  }, [addressLinkState, featureFlags?.link_evm_address?.extension, showRefreshText])

  const isBtnDisabled =
    addressLinkState === 'loading' || featureFlags?.link_evm_address?.extension === 'disabled'

  return (
    <BottomModal
      isOpen={globalSheetsStore.isCopyAddressSheetOpen}
      onClose={() => {
        localStorage.setItem(SHOW_LINK_ADDRESS_NUDGE, 'false')
        globalSheetsStore.setCopyAddressSheetOpen(false)
      }}
      title={'Link your addresses'}
      className='flex flex-col items-center justify-center gap-2 w-full overflow-y-auto relative'
    >
      <img
        src={Images.Banners.welcomeSeiV2Banner}
        alt='welcome to sei v2 banner'
        className='w-full mb-5 rounded-2xl mt-10 border border-border-bottom'
      />

      <AlertStripV2 className='absolute top-0 left-0 right-0'>
        For Sei V2, link your EVM and SEI address.
        <a
          href='https://seistartguide.addpotion.com/'
          target='_blank'
          className='ml-2 underline'
          rel='noreferrer'
        >
          Learn more
        </a>
      </AlertStripV2>

      <div className='flex flex-col items-center justify-center gap-2 w-full'>
        {walletAddresses.map((address, index) => (
          <CopyAddressCard address={address} key={`${address}-${index}`} />
        ))}
      </div>

      {addressLinkState === 'error' ? <ErrorCard text={error} className='mb-4' /> : null}

      {featureFlags?.link_evm_address?.extension === 'no-funds' ? (
        <form>
          <HCaptcha
            ref={hCaptchaRef}
            sitekey={process.env.LINK_ADDRESS_HCAPTCHA_SITE_KEY ?? ''}
            size='invisible'
            theme='dark'
          />
        </form>
      ) : null}

      <Button className='w-full mt-4' disabled={isBtnDisabled} onClick={handleLinkAddressClick}>
        {btnText}
      </Button>

      {hCaptchaError ? (
        <p className='font-medium text-destructive-200 text-center mt-4'>{hCaptchaError}</p>
      ) : null}

      {showLoadingMessage ? (
        <p className='text-accent-warning text-center mt-4'>{showLoadingMessage}</p>
      ) : null}
    </BottomModal>
  )
})

export const CopyAddressSheet = () => {
  const getWallet = Wallet.useGetWallet()
  const { addressLinkState } = useSeiLinkedAddressState(getWallet)

  if (addressLinkState === 'pending') {
    return <LinkAddressSheet />
  }

  return <AddressList />
}
