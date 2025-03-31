import { WalletButton } from 'components/button/WalletButton'
import { PageHeader } from 'components/header'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { Globe } from 'images/misc'
import React, { PropsWithChildren } from 'react'
import { cn } from 'utils/cn'
import { imgOnError } from 'utils/imgOnError'

export const DappHeader = () => {
  const { walletAvatar, walletName } = useWalletInfo()

  return (
    <PageHeader className='py-3.5 -mx-5'>
      <WalletButton
        className='mx-auto bg-secondary-200'
        showWalletAvatar
        walletName={walletName}
        walletAvatar={walletAvatar}
        handleDropdownClick={() => void 0}
      />
    </PageHeader>
  )
}

type DappHeadingProps = {
  logo: string
  title: React.ReactNode
  subTitle: React.ReactNode
}

export const DappHeading = (props: DappHeadingProps) => {
  return (
    <div className='flex items-center gap-5'>
      <img src={props.logo} onError={imgOnError(Globe)} className='size-[54px]' />

      <div className='flex flex-col gap-[3px]'>
        <span className='text-lg font-bold'>{props.title}</span>
        <span className='text-xs text-muted-foreground'>{props.subTitle}</span>
      </div>
    </div>
  )
}

type DappWrapperProps = PropsWithChildren<DappHeadingProps> & {
  className?: string
}

export const DappWrapper = (props: DappWrapperProps) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-5 mx-auto w-full max-w-2xl box-border h-full overflow-scroll px-6 bg-secondary-50',
        props.className,
      )}
    >
      <DappHeader />

      <DappHeading {...props} />

      {props.children}
    </div>
  )
}
