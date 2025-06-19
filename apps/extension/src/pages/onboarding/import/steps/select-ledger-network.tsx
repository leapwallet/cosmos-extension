import { Button } from 'components/ui/button'
import { Checkbox } from 'components/ui/check-box'
import { useDefaultTokenLogo } from 'hooks'
import { Images } from 'images'
import { OnboardingWrapper } from 'pages/onboarding/wrapper'
import React, { useEffect } from 'react'
import { imgOnError } from 'utils/imgOnError'

import { LEDGER_NETWORK, useImportWalletContext } from '../import-wallet-context'

export const ledgerNetworkOptions = [
  {
    id: LEDGER_NETWORK.COSMOS,
    img: Images.Logos.Cosmos,
    title: 'COSMOS',
    subText: 'OSMO, ATOM & 4 more',
  },
  {
    id: LEDGER_NETWORK.ETH,
    img: Images.Logos.Ethereum,
    title: 'EVM',
    subText: 'ETH, AVAX, BASE & 5 more',
  },
]

export const SelectLedgerNetwork = () => {
  const {
    ledgerNetworks,
    addresses,
    setLedgerNetworks,
    moveToNextStep,
    setWalletAccounts,
    prevStep,
    currentStep,
    setAddresses,
  } = useImportWalletContext()

  useEffect(() => {
    setWalletAccounts(undefined)
    if (addresses && Object.keys(addresses).length > 0) {
      setAddresses({})
    }
  }, [])

  return (
    <OnboardingWrapper
      heading={'Select networks'}
      subHeading={'Select networks you want to connect with'}
      entry={prevStep <= currentStep ? 'right' : 'left'}
    >
      <div className='flex flex-col rounded-xl overflow-hidden py-1'>
        {ledgerNetworkOptions.map((network) => (
          <LedgerNetworkCard
            key={network.id}
            {...network}
            checked={ledgerNetworks.has(network.id)}
            onCheckedChange={(checked) => {
              setLedgerNetworks((prev) => {
                const newSet = new Set(prev)
                if (checked) {
                  newSet.add(network.id)
                } else {
                  newSet.delete(network.id)
                }

                return newSet
              })
            }}
          />
        ))}
      </div>

      <Button
        disabled={ledgerNetworks.size === 0}
        className='w-full mt-auto'
        onClick={moveToNextStep}
      >
        Proceed
      </Button>
    </OnboardingWrapper>
  )
}

const LedgerNetworkCard = (props: {
  img?: string
  title: string
  subText: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) => {
  const defaultTokenLogo = useDefaultTokenLogo()

  return (
    <label
      className={
        'flex flex-row gap-[14px] items-center p-5 border-b border-secondary-600/25 last:border-b-0 bg-secondary-200 hover:bg-secondary-300/75 transition-colors cursor-pointer text-start'
      }
    >
      <img
        src={props.img || defaultTokenLogo}
        alt={props.title}
        onError={imgOnError(defaultTokenLogo)}
        className='size-10 rounded-full'
      />

      <div className='flex flex-col'>
        <h3 className='text-md font-bold'>{props.title}</h3>
        <p className='text-sm font-medium text-muted-foreground'>{props.subText}</p>
      </div>

      <Checkbox
        className='ml-auto'
        checked={props.checked}
        onCheckedChange={props.onCheckedChange}
      />
    </label>
  )
}
