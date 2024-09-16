import HCaptcha from '@hcaptcha/react-hcaptcha'
import {
  getSeiEvmInfo,
  SeiEvmInfoEnum,
  useActiveChain,
  useChainInfo,
  useFeatureFlags,
  useSeiLinkedAddressState,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import { Buttons } from '@leapwallet/leap-ui'
import { ArrowSquareOut } from '@phosphor-icons/react'
import classNames from 'classnames'
import BottomModal from 'components/bottom-modal'
import { CopyAddressCard } from 'components/card'
import { ErrorCard } from 'components/ErrorCard'
import { LoaderAnimation } from 'components/loader/Loader'
import Text from 'components/text'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import React, { Dispatch, SetStateAction, useMemo, useRef, useState } from 'react'
import { Colors } from 'theme/colors'
import { isSidePanel } from 'utils/isSidePanel'
import Browser from 'webextension-polyfill'

type LinkAddressesSheetProps = {
  isVisible: boolean
  onClose: (refetch?: boolean) => void
  walletAddresses: string[]
  setIsToAddLinkAddressNudgeText: Dispatch<SetStateAction<boolean>>
}

export function LinkAddressesSheet({
  isVisible,
  onClose,
  walletAddresses,
  setIsToAddLinkAddressNudgeText,
}: LinkAddressesSheetProps) {
  const getWallet = Wallet.useGetWallet()
  const [error, setError] = useState<string>()
  const activeChain = useActiveChain()
  const activeChainInfo = useChainInfo()

  const hCaptchaRef = useRef<HCaptcha>(null)
  const [hCaptchaError, setHCaptchaError] = useState<string>('')
  const [showLoadingMessage, setShowLoadingMessage] = useState('')

  const activeNetwork = useSelectedNetwork()
  const { data: featureFlags } = useFeatureFlags()
  const { addressLinkState, updateAddressLinkState } = useSeiLinkedAddressState(getWallet)
  const [showRefreshText, setShowRefreshText] = useState(false)

  const handleLinkAddressClick = async () => {
    setShowLoadingMessage('')

    if (showRefreshText) {
      const homePageUrl = isSidePanel() ? `/sidepanel.html#/home` : `/index.html#/home`
      window.location.href = Browser.runtime.getURL(homePageUrl)
      window.location.reload()
    } else if (featureFlags?.link_evm_address?.extension === 'redirect') {
      const dAppLink = (await getSeiEvmInfo({
        activeNetwork,
        activeChain: activeChain as 'seiDevnet' | 'seiTestnet2',
        infoType: SeiEvmInfoEnum.NO_FUNDS_DAPP_LINK,
      })) as string

      window.open(dAppLink, '_blank')
      setShowRefreshText(true)
    } else if (featureFlags?.link_evm_address?.extension === 'no-funds') {
      try {
        const result = await hCaptchaRef.current?.execute({ async: true })

        if (!result) {
          setHCaptchaError('Could not get hCaptcha response. Please try again.')
          return
        }

        await updateAddressLinkState({
          setError,
          onClose: (refetch?: boolean) => {
            setIsToAddLinkAddressNudgeText(false)
            onClose(refetch)
          },
          ethAddress: walletAddresses[0],
          token: result.response,
          setShowLoadingMessage,
        })
      } catch (_) {
        setHCaptchaError('Failed to verify captcha. Please try again.')
      }
    } else {
      await updateAddressLinkState({
        setError,
        onClose: (refetch?: boolean) => {
          setIsToAddLinkAddressNudgeText(false)
          onClose(refetch)
        },
        ethAddress: walletAddresses[0],
      })
    }
  }

  const btnText = useMemo(() => {
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

  if (['done', 'unknown'].includes(addressLinkState)) return null
  const isBtnDisabled =
    addressLinkState === 'loading' || featureFlags?.link_evm_address?.extension === 'disabled'

  return (
    <BottomModal
      isOpen={isVisible}
      onClose={onClose}
      closeOnBackdropClick={true}
      title='Link addresses to explore Sei V2'
      contentClassName='[&>div:first-child]:!justify-start'
    >
      <img
        src={Images.Banners.welcomeSeiV2Banner}
        alt='welcome to sei v2 banner'
        className='w-full mb-5 rounded-2xl'
      />

      <Text size='sm' className='mb-5 !block'>
        Link your EVM & Sei addresses. This is necessary for Sei V2.
        <a
          href='https://seistartguide.addpotion.com/'
          target='_blank'
          className='ml-2 underline'
          rel='noreferrer'
        >
          Learn more ↗
        </a>
      </Text>

      <div
        className='flex flex-col items-center justif-center gap-4 max-h-[400px] w-full mb-4'
        style={{ overflowY: 'scroll' }}
      >
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

      <Buttons.Generic
        color={
          addressLinkState === 'success'
            ? Colors.green600
            : Colors.getChainColor(activeChain, activeChainInfo)
        }
        size='normal'
        className={classNames('w-[344px]', {
          '!cursor-default': addressLinkState === 'success',
        })}
        disabled={isBtnDisabled}
        onClick={addressLinkState === 'success' ? undefined : handleLinkAddressClick}
      >
        {addressLinkState === 'loading' ? <LoaderAnimation color={Colors.white100} /> : btnText}
      </Buttons.Generic>

      {hCaptchaError ? <p className='text-red-300 text-center mt-4'>{hCaptchaError}</p> : null}
      {showLoadingMessage ? (
        <p className='text-yellow-600 text-center mt-4'>{showLoadingMessage}</p>
      ) : null}
    </BottomModal>
  )
}
