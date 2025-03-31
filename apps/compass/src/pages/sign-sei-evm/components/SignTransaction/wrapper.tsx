import { DappWrapper } from 'components/dapp/wrapper'
import { useDefaultTokenLogo } from 'hooks'
import { useSiteLogo } from 'hooks/utility/useSiteLogo'
import React from 'react'

export const SignTransactionWrapper = (props: {
  children: React.ReactNode
  chainName: string
  origin: string
  logo?: string
  className?: string
}) => {
  const defaultTokenLogo = useDefaultTokenLogo()
  const siteLogo = useSiteLogo(props.origin)

  return (
    <DappWrapper
      logo={props.logo || siteLogo || defaultTokenLogo}
      subTitle={props.origin}
      title={'Approve transaction'}
      className={props.className}
    >
      {props.children}
    </DappWrapper>
  )
}
