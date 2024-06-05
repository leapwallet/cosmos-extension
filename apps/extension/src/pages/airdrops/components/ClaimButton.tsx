import { AirdropEligibilityInfo } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons } from '@leapwallet/leap-ui'
import { captureException } from '@sentry/react'
import { ButtonName, ButtonType, EventName } from 'config/analytics'
import mixpanel from 'mixpanel-browser'
import React from 'react'
import { isCompassWallet } from 'utils/isCompassWallet'

interface ClaimButtonProps {
  selectedAirdrop: AirdropEligibilityInfo
}

export default function ClaimButton({ selectedAirdrop }: ClaimButtonProps) {
  const redirectURL =
    selectedAirdrop?.CTAInfo?.type === 'internal'
      ? `https://cosmos.leapwallet.io${selectedAirdrop?.CTAInfo?.href}`
      : selectedAirdrop?.CTAInfo?.href

  const trackCTAEvent = () => {
    if (!isCompassWallet()) {
      try {
        mixpanel.track(EventName.ButtonClick, {
          buttonType: ButtonType.AIRDROPS,
          buttonName: ButtonName.CLAIM_AIRDROP,
          redirectURL,
          time: Date.now() / 1000,
        })
      } catch (e) {
        captureException(e)
      }
    }
  }

  return (
    <Buttons.Generic
      size='normal'
      className='w-full mb-6 !bg-black-100 dark:!bg-white-100 text-white-100 dark:text-black-100'
      title={selectedAirdrop?.CTAInfo?.text}
      onClick={() => {
        trackCTAEvent()
        window.open(redirectURL, '_blank')
      }}
    >
      <div className='flex items-center gap-2'>
        {selectedAirdrop?.CTAInfo?.text}
        <span className='material-icons-round' style={{ fontSize: 20 }}>
          open_in_new
        </span>
      </div>
    </Buttons.Generic>
  )
}
