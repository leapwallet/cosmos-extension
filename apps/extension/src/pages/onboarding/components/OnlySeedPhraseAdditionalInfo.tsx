import React from 'react'

import { AdditionalInfo } from './index'

type OnlySeedPhraseAdditionalInfoProps = {
  walletName: string
  isCosmostation: boolean
}

export function OnlySeedPhraseAdditionalInfo({
  walletName,
  isCosmostation,
}: OnlySeedPhraseAdditionalInfoProps) {
  return (
    <>
      <AdditionalInfo.Heading>Where can I find my phrase?</AdditionalInfo.Heading>
      <AdditionalInfo.Description>
        <ol className='mb-[32px]'>
          <li>
            1. Open <strong> {walletName} extension </strong>
          </li>

          {walletName === 'Leap' ? (
            <>
              <li>
                2. On top left, click on the <strong> Hamburger icon </strong>
              </li>

              <li>
                3. Select show recovery phrase and enter your password and{' '}
                <strong> view recovery phrase </strong>
              </li>
            </>
          ) : (
            <>
              <li>
                2. On top {isCosmostation ? 'left' : 'right'}, click on the{' '}
                <strong> Profile icon </strong>
              </li>

              <li>
                3. Select {isCosmostation ? 'account settings' : 'wallet'} and click on the 3 dots
                and <strong> view recovery phrase </strong>
              </li>
            </>
          )}

          <li>4. Copy and paste the recovery phrase to the field on the left.</li>
        </ol>
      </AdditionalInfo.Description>
    </>
  )
}
