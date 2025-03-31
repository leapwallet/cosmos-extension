import { DappWrapper } from 'components/dapp/wrapper'
import { useDefaultTokenLogo } from 'hooks'
import { useSiteLogo } from 'hooks/utility/useSiteLogo'
import React from 'react'

export const ApproveConnectionWrapper = (props: {
  children: React.ReactNode
  origin: string
  logo?: string
}) => {
  const defaultTokenLogo = useDefaultTokenLogo()
  const siteLogo = useSiteLogo(props.origin)

  return (
    <DappWrapper
      logo={props.logo || siteLogo || defaultTokenLogo}
      subTitle={props.origin}
      title={'Connect wallet'}
    >
      {props.children}
    </DappWrapper>
  )
}
