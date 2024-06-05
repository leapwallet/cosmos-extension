import { sliceAddress, useChainInfo } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons, GenericCard } from '@leapwallet/leap-ui'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import React, { useMemo, useRef } from 'react'
import { Colors } from 'theme/colors'
import { UserClipboard } from 'utils/clipboard'
import { imgOnError } from 'utils/imgOnError'
import { isCompassWallet } from 'utils/isCompassWallet'

type CopyAddressCardProps = {
  address: string
}

export function CopyAddressCard({ address }: CopyAddressCardProps) {
  const activeChainInfo = useChainInfo()
  const defaultTokenLogo = useDefaultTokenLogo()
  const copyAddressRef = useRef<HTMLButtonElement>(null)

  const [name, imgURL] = useMemo(() => {
    let name =
      activeChainInfo.addressPrefix.slice(0, 1).toUpperCase() +
      activeChainInfo.addressPrefix.slice(1).toLowerCase() +
      ' ' +
      'address'

    let imgURL = activeChainInfo.chainSymbolImageUrl ?? defaultTokenLogo

    if (address.toLowerCase().startsWith('0x')) {
      name = 'EVM address'

      if (isCompassWallet()) {
        imgURL = Images.Logos.SeiV2
      }
    }

    return [name, imgURL]
  }, [
    activeChainInfo.addressPrefix,
    activeChainInfo.chainSymbolImageUrl,
    address,
    defaultTokenLogo,
  ])

  return (
    <GenericCard
      title={name}
      img={
        <img
          className='mr-3 w-[30px] h-[30px]'
          src={imgURL}
          onError={imgOnError(defaultTokenLogo)}
        />
      }
      subtitle={sliceAddress(address, 8)}
      onClick={() => {
        copyAddressRef.current?.click()
        UserClipboard.copyText(address)
      }}
      size='md'
      className='px-4 py-2'
      icon={
        <Buttons.CopyWalletAddress
          copyIcon={Images.Activity.Copy}
          ref={copyAddressRef}
          color={isCompassWallet() ? Colors.compassPrimary : Colors.green600}
        />
      }
    />
  )
}
