import ClickableIcon from 'components/clickable-icons'
import { useHardCodedActions } from 'components/search-modal'
import { PageName } from 'config/analytics'
import CardIcon from 'icons/card-icon'
import { DollarIcon } from 'icons/dollar-icon'
import { SendIcon } from 'icons/send-icon'
import { SwapIcon } from 'icons/swap-icon'
import React, { useCallback } from 'react'
import { useNavigate } from 'react-router'

export function HomeButtons() {
  const navigate = useNavigate()

  const { onSendClick, handleBuyClick, handleSwapClick } = useHardCodedActions()

  const handleStakeClick = useCallback(() => {
    navigate('/stake')
  }, [navigate])

  return (
    <div className={'flex flex-row justify-evenly mb-5 px-7 w-full'}>
      <ClickableIcon label='Buy' icon={CardIcon} onClick={() => handleBuyClick()} />
      <ClickableIcon label='Send' icon={SendIcon} onClick={() => onSendClick()} />
      <ClickableIcon
        label='Swap'
        icon={SwapIcon}
        onClick={() => handleSwapClick(undefined, `/swap?pageSource=${PageName.Home}`)}
      />
      <ClickableIcon label='Stake' icon={DollarIcon} onClick={handleStakeClick} />
    </div>
  )
}
