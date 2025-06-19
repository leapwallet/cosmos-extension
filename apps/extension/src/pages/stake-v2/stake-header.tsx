import { ArrowLeft, MagnifyingGlass } from '@phosphor-icons/react'
import { WalletButtonV2 } from 'components/button'
import { PageHeader } from 'components/header/PageHeaderV2'
import { useWalletInfo } from 'hooks/useWalletInfo'
import SelectWallet from 'pages/home/SelectWallet/v2'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const StakeHeader = ({
  disableWalletButton,
  setShowSearchInput,
  onBackClick,
}: {
  disableWalletButton?: boolean
  setShowSearchInput?: React.Dispatch<React.SetStateAction<boolean>>
  onBackClick?: () => void
}) => {
  const navigate = useNavigate()
  const walletInfo = useWalletInfo()
  const [showSelectWallet, setShowSelectWallet] = useState(false)

  return (
    <>
      <PageHeader>
        <ArrowLeft
          size={36}
          className='text-muted-foreground hover:text-foreground cursor-pointer p-2'
          onClick={() => {
            if (onBackClick) {
              onBackClick()
            } else {
              navigate(-1)
            }
          }}
        />

        <WalletButtonV2
          showDropdown
          showWalletAvatar
          className='absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2'
          walletName={walletInfo.walletName}
          walletAvatar={walletInfo.walletAvatar}
          handleDropdownClick={() => setShowSelectWallet(true && !disableWalletButton)}
        />
        {setShowSearchInput && (
          <MagnifyingGlass
            size={36}
            className='text-muted-foreground hover:text-foreground cursor-pointer p-2'
            onClick={() => setShowSearchInput((val) => !val)}
          />
        )}
      </PageHeader>

      <SelectWallet
        isVisible={showSelectWallet}
        onClose={() => setShowSelectWallet(false)}
        title='Your Wallets'
      />
    </>
  )
}
