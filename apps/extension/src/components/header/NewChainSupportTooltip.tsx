import { useCustomChains } from '@leapwallet/cosmos-wallet-hooks'
import { useTheme } from '@leapwallet/leap-ui'
import { captureException } from '@sentry/react'
import { useSetActiveChain } from 'hooks/settings/useActiveChain'
import { useChainInfos } from 'hooks/useChainInfos'
import { NewChainTooltipData } from 'hooks/useNewChainTooltip'
import React, { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AggregatedSupportedChain } from 'types/utility'
import { uiErrorTags } from 'utils/sentry'

type NewChainSupportTooltipProps = {
  toolTipData: NewChainTooltipData
  handleToolTipClose: () => void
  setNewChain: (chain: string) => void
}

const NewChainSupportTooltip = ({
  toolTipData,
  handleToolTipClose,
  setNewChain,
}: NewChainSupportTooltipProps) => {
  const { header, description, imgUrl, ctaText } = toolTipData

  const { theme } = useTheme()
  const navigate = useNavigate()
  const customChains = useCustomChains()
  const chainInfos = useChainInfos()
  const setActiveChain = useSetActiveChain()

  const handleAddChainClick = useCallback(
    (chain: string) => {
      const item = customChains.find((customChain) => customChain.chainRegistryPath === chain)
      let chainKey
      for (const [key, chainInfo] of Object.entries(chainInfos)) {
        if (
          chainInfo.chainRegistryPath === item?.chainRegistryPath ||
          chainInfo.key === item?.chainRegistryPath
        ) {
          chainKey = key
          break
        }
      }
      if (chainKey) {
        setActiveChain(chainKey as AggregatedSupportedChain, item)
      } else if (item) {
        setNewChain(item.chainName)
      } else {
        captureException(`${chain} chain not found when clicked on tooltip`, {
          tags: uiErrorTags,
        })
      }
    },
    [chainInfos, customChains, setActiveChain, setNewChain],
  )

  const handleSwitchChainClick = useCallback(
    (chainRegistryPath: string) => {
      let chainKey
      for (const [key, chainInfo] of Object.entries(chainInfos)) {
        if (
          chainInfo.chainRegistryPath === chainRegistryPath ||
          chainInfo.key === chainRegistryPath
        ) {
          chainKey = key
          break
        }
      }
      if (chainKey) {
        setActiveChain(chainKey as AggregatedSupportedChain)
      } else {
        captureException(`${chainRegistryPath} chain not found when clicked on banners`, {
          tags: uiErrorTags,
        })
      }
    },
    [chainInfos, setActiveChain],
  )

  const handleCTAClick = useCallback(() => {
    handleToolTipClose()
    switch (toolTipData.ctaAction?.type) {
      case 'redirect-internally': {
        navigate(`${toolTipData.ctaAction.redirectUrl}&toolTipId=${toolTipData.id}`)
        break
      }
      case 'redirect-externally': {
        window.open(toolTipData.ctaAction.redirectUrl, '_blank')
        break
      }
      case 'add-chain': {
        handleAddChainClick(toolTipData.ctaAction.chainRegistryPath)
        break
      }
      case 'switch-chain': {
        handleSwitchChainClick(toolTipData.ctaAction.chainRegistryPath)
        break
      }
      default: {
        navigate(`/home?openChainSwitch=true`)
        break
      }
    }
  }, [
    toolTipData.ctaAction,
    toolTipData.id,
    handleToolTipClose,
    navigate,
    handleAddChainClick,
    handleSwitchChainClick,
  ])

  return (
    <>
      <div
        onClick={(e) => {
          e.stopPropagation()
        }}
        className='cursor-default z-[2] p-3 rounded-xl absolute bg-white-100 !w-[272px] border border-gray-200 dark:border-gray-850 dark:bg-gray-950 top-[56px] right-0 flex flex-col justify-start items-start gap-3 !max-w-max'
      >
        <div className='absolute bottom-[100%] right-4'>
          <svg
            width='28'
            height='8'
            viewBox='0 0 28 8'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M12.5858 0.653454L9.74904 3.81789C8.36542 5.36134 7.67361 6.13306 6.86628 6.68494C6.1505 7.17424 5.37015 7.53481 4.55386 7.75342C3.63316 8 2.65479 8 0.698067 8L27.3019 8C25.3452 8 24.3668 8 23.4461 7.75343C22.6299 7.53481 21.8495 7.17424 21.1337 6.68494C20.3264 6.13306 19.6346 5.36134 18.251 3.81789L15.4142 0.653452C14.6332 -0.217819 13.3668 -0.217816 12.5858 0.653454Z'
              fill={theme !== 'dark' ? '#F4F4F4' : '#141414'}
            />
            <path
              d='M27.3019 7.021C25.2976 7.021 24.4584 7.0147 23.6796 6.83165C22.9653 6.66377 22.2825 6.38688 21.6562 6.01114C20.9733 5.60141 20.3753 5.02493 18.9581 3.63742L16.1213 0.860228C14.9497 -0.286745 13.0503 -0.286741 11.8787 0.860229L9.04193 3.63742C7.62466 5.02493 7.02673 5.60141 6.34378 6.01113C5.71748 6.38688 5.03466 6.66377 4.32041 6.83165C3.54157 7.0147 2.70239 7.021 0.698067 7.021H0V8L0.698067 8C2.65479 8 3.63316 8 4.55386 7.7836C5.37015 7.59174 6.1505 7.27529 6.86628 6.84587C7.67361 6.36153 8.36542 5.68424 9.74904 4.32968L12.5858 1.55249C13.3668 0.787842 14.6332 0.78784 15.4142 1.55249L18.251 4.32968C19.6346 5.68424 20.3264 6.36153 21.1337 6.84587C21.8495 7.27529 22.6299 7.59174 23.4461 7.7836C24.3668 8 25.3452 8 27.3019 8L28 8L28 7.021H27.3019Z'
              fill={theme !== 'dark' ? '#d6d6d6' : '#2C2C2C'}
            />
          </svg>
        </div>

        {imgUrl && <img src={imgUrl} className='rounded-lg w-full h-[72px]' alt='tooltip-img' />}

        <div className='flex flex-col w-full justify-start items-start gap-0'>
          <div className='text-sm !leading-[20px] font-bold text-black-100 dark:text-white-100'>
            {header}
          </div>
          <div className='text-xs !leading-[20px] font-medium text-gray-600 dark:text-gray-400'>
            {description}
          </div>
        </div>

        <div className='flex row w-full justify-between items-center'>
          <button onClick={handleCTAClick} className='bg-green-600 rounded-full flex py-2 px-3'>
            <span className='text-xs !leading-[16.8px] text-white-100 dark:text-white-100 font-bold'>
              {ctaText}
            </span>
          </button>
          <button
            onClick={handleToolTipClose}
            className='font-bold text-xs !leading-[16.8px] flex px-3 py-2 dark:text-gray-400 text-gray-600'
          >
            Close
          </button>
        </div>
      </div>
    </>
  )
}

export default NewChainSupportTooltip
