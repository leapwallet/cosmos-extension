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
import { Buttons, CardDivider } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import BottomModal from 'components/bottom-modal'
import { ErrorCard } from 'components/ErrorCard'
import { LoaderAnimation } from 'components/loader/Loader'
import Text from 'components/text'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import React, { useMemo, useRef, useState } from 'react'
import { Colors } from 'theme/colors'
import Browser from 'webextension-polyfill'

import { CopyAddressCard } from './CopyAddressCard'

type LinkAddressesSheetProps = {
  isVisible: boolean
  onClose: (refetch?: boolean) => void
  walletAddresses: string[]
}

export function LinkAddressesSheet({
  isVisible,
  onClose,
  walletAddresses,
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
      window.location.href = Browser.runtime.getURL('/index.html#/home')
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
          onClose,
          ethAddress: walletAddresses[0],
          token: result.response,
          setShowLoadingMessage,
        })
      } catch (_) {
        setHCaptchaError('Failed to verify captcha. Please try again.')
      }
    } else {
      await updateAddressLinkState({ setError, onClose, ethAddress: walletAddresses[0] })
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
          <span className='!leading-[20px] !text-lg material-icons-round'>open_in_new</span>
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
      hideActionButton={true}
      showSecondaryActionButton={true}
      contentClassName='[&>div:first-child]:!justify-start'
      headerClassName='h-[18px]'
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
        className='bg-white-100 dark:bg-gray-900 rounded-2xl max-h-[400px] w-full mb-4'
        style={{ overflowY: 'scroll' }}
      >
        {walletAddresses.map((address, index, array) => {
          const isLast = index === array.length - 1

          return (
            <React.Fragment key={`${address}-${index}`}>
              <CopyAddressCard address={address} />
              {!isLast && <CardDivider />}
            </React.Fragment>
          )
        })}
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
