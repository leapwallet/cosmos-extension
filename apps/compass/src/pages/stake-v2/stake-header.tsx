import { ArrowLeft } from '@phosphor-icons/react'
import { WalletButton } from 'components/button/WalletButton'
import { PageHeader } from 'components/header'
import { Button } from 'components/ui/button'
import { useWalletInfo } from 'hooks/useWalletInfo'
import SelectWallet from 'pages/home/SelectWallet'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const StakeHeader = (props: { disableWalletButton?: boolean }) => {
  const navigate = useNavigate()
  const walletInfo = useWalletInfo()
  const [showSelectWallet, setShowSelectWallet] = useState(false)

  return (
    <>
      <PageHeader>
        <Button
          size={'icon'}
          variant={'ghost'}
          className={'text-muted-foreground hover:text-foreground hover:bg-inherit'}
          onClick={() => navigate(-1)}
          title='Back'
        >
          <ArrowLeft className='size-5' />
        </Button>

        <WalletButton
          showDropdown
          showWalletAvatar
          className='absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2'
          walletName={walletInfo.walletName}
          walletAvatar={walletInfo.walletAvatar}
          handleDropdownClick={() => setShowSelectWallet(true && !props.disableWalletButton)}
        />
      </PageHeader>

      <SelectWallet isVisible={showSelectWallet} onClose={() => setShowSelectWallet(false)} />
    </>
  )
}
