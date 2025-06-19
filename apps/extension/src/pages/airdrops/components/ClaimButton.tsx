import { AirdropEligibilityInfo } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons } from '@leapwallet/leap-ui'
import { ArrowSquareOut } from '@phosphor-icons/react'
import { captureException } from '@sentry/react'
import { ButtonName, ButtonType, EventName } from 'config/analytics'
import { LEAPBOARD_URL } from 'config/constants'
import mixpanel from 'mixpanel-browser'
import React from 'react'

interface ClaimButtonProps {
  selectedAirdrop: AirdropEligibilityInfo
}

export default function ClaimButton({ selectedAirdrop }: ClaimButtonProps) {
  const redirectURL =
    selectedAirdrop?.CTAInfo?.type === 'internal'
      ? `${LEAPBOARD_URL}${selectedAirdrop?.CTAInfo?.href}`
      : selectedAirdrop?.CTAInfo?.href

  const trackCTAEvent = () => {
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
        <ArrowSquareOut size={20} className='text-white-100 dark:text-black-100' />
      </div>
    </Buttons.Generic>
  )
}
