import {
  getFilteredDapps,
  OptionPlatformConfig,
  QuickSearchOption,
  useChainInfo,
  useFetchDappListForQuickSearch,
  useGetQuickSearchOptions,
} from '@leapwallet/cosmos-wallet-hooks'
import classNames from 'classnames'
import { LoaderAnimation } from 'components/loader/Loader'
import { EventName } from 'config/analytics'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { Images } from 'images'
import mixpanel from 'mixpanel-browser'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { Colors } from 'theme/colors'

import {
  searchModalActiveOptionState,
  searchModalEnteredOptionState,
  searchModalState,
} from '../../atoms/search-modal'
import AlertStrip from '../alert-strip/AlertStrip'
import { QuickSearchOptions } from './QuickSearchOptions'
import { useHardCodedActions } from './useHardCodedActions'

function openLink(url: string, target?: string) {
  window.open(url, target)
}

export function SearchModal() {
  const { data: dappsList } = useFetchDappListForQuickSearch()
  const activeChain = useActiveChain()
  const chain = useChainInfo()
  const navigate = useNavigate()
  const [showModal, setShowSearchModal] = useRecoilState(searchModalState)
  const [searchModalActiveOption, setSearchModalActiveOption] = useRecoilState(
    searchModalActiveOptionState,
  )
  const [searchedText, setSearchedText] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { data: suggestions, status } = useGetQuickSearchOptions()
  const setSearchModalEnteredOption = useSetRecoilState(searchModalEnteredOptionState)
  const {
    setAlertMessage,
    setShowAlert,
    showAlert,
    alertMessage,
    handleConnectLedgerClick,
    handleCopyAddressClick,
    handleHideBalancesClick,
    handleLockWalletClick,
    handleSettingsClick,
    handleSwapClick,
  } = useHardCodedActions()

  const activeSuggestions = useMemo(() => {
    const extensionSuggestions =
      suggestions?.filter(({ visible_on }) => {
        if (visible_on.platforms.includes('All') || visible_on.platforms.includes('Extension')) {
          return true
        }

        return false
      }) ?? []

    return extensionSuggestions.filter(({ visible_on }) => {
      if (visible_on.chains.includes('All') || visible_on.chains.includes(activeChain)) {
        return true
      }

      return false
    })
  }, [activeChain, suggestions])

  const filteredSuggestions = useMemo(() => {
    if (searchedText.trim()) {
      const _filteredSuggestions =
        activeSuggestions.filter(({ action_name, show_in_search }) => {
          return (
            show_in_search &&
            action_name.trim().toLowerCase().includes(searchedText.trim().toLowerCase())
          )
        }) ?? []

      let _filteredDapps: QuickSearchOption[] = []

      if (dappsList && dappsList?.dapps?.length) {
        _filteredDapps = getFilteredDapps(dappsList.dapps, dappsList.types, searchedText)
      }

      return [..._filteredSuggestions, ..._filteredDapps]
    }

    return activeSuggestions.filter(({ show_in_list }) => {
      return show_in_list
    })
  }, [activeSuggestions, dappsList, searchedText])

  useEffect(() => {
    if (searchInputRef.current && showModal) {
      searchInputRef.current.focus()
    }

    return () => {
      setSearchedText('')
      setSearchModalActiveOption((currVal) => ({ ...currVal, active: 0 }))
      setSearchModalEnteredOption(null)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal])

  useEffect(() => {
    const newHighLimit = filteredSuggestions.length

    setSearchModalActiveOption((currVal) => {
      const newActive = currVal.active >= newHighLimit ? newHighLimit - 1 : currVal.active

      return {
        ...currVal,
        active: newActive,
        highLimit: newHighLimit,
      }
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredSuggestions.length])

  const handleClose = useCallback(() => {
    setShowSearchModal(false)
    try {
      mixpanel.track(EventName.QuickSearchClose, {
        chainId: chain.chainId,
        chainName: chain.chainName,
      })
    } catch {
      //
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleNoRedirectActions = (actionName: string) => {
    switch (actionName) {
      case 'Swap': {
        handleSwapClick()
        break
      }

      case 'Connect Ledger': {
        handleConnectLedgerClick()
        break
      }

      case 'Copy Address': {
        handleCopyAddressClick()
        break
      }

      case 'Lock Wallet': {
        handleLockWalletClick()
        break
      }

      case 'Hide Balances': {
        handleHideBalancesClick()
        break
      }

      case 'Settings': {
        handleSettingsClick()
        break
      }
    }
  }

  const handleOptionClick = (
    config: OptionPlatformConfig,
    optionIndex: number,
    actionName: string,
  ) => {
    if (searchedText.trim()) {
      try {
        mixpanel.track(EventName.QuickSearchClick, {
          searchUsed: true,
          searchTerm: searchedText.trim(),
          actionIndex: optionIndex,
          actionName,
          chainId: chain.chainId,
          chainName: chain.chainName,
        })
      } catch {
        //
      }
    } else {
      try {
        mixpanel.track(EventName.QuickSearchClick, {
          searchUsed: false,
          actionIndex: optionIndex,
          actionName,
          chainId: chain.chainId,
          chainName: chain.chainName,
        })
      } catch {
        //
      }
    }

    setShowSearchModal(false)

    switch (config.action_type) {
      case 'no-redirect': {
        handleNoRedirectActions(actionName)
        break
      }

      case 'redirect-external': {
        openLink(config.redirect_url ?? '', '_blank')
        break
      }

      case 'redirect-internal': {
        navigate(config.redirect_url ?? '')
        break
      }
    }
  }

  return (
    <div
      className='w-[400px] h-[600px] max-h-[600px] overflow-y-auto absolute top-0 inset-0 pointer-events-none'
      style={{ zIndex: 9999999999 }}
    >
      {showAlert && (
        <AlertStrip
          message={alertMessage}
          bgColor={Colors.green600}
          alwaysShow={false}
          onHide={() => {
            setShowAlert(false)
            setAlertMessage('')
          }}
          className='absolute top-[80px] left-[40px] rounded-2xl w-80 h-auto p-2'
          timeOut={1000}
        />
      )}

      <div
        className={classNames('w-full h-full flex items-center justify-center dark:bg-black-80', {
          'opacity-0 pointer-events-none transition-opacity duration-75': !showModal,
          'opacity-100 pointer-events-auto transition-opacity duration-75': showModal,
        })}
        onClick={handleClose}
      >
        <div
          className='h-[468px] w-[349px] rounded-2xl dark:bg-gray-950 border dark:border-gray-900'
          onClick={(event) => event.stopPropagation()}
        >
          <div className='w-full py-3 px-6 border-b dark:border-b-gray-900 flex items-center gap-3'>
            <img className='invert dark:invert-0' src={Images.Misc.SearchModalGlass} alt='' />
            <input
              type='text'
              placeholder='Search commands, pages, and dApps'
              className='text-base dark:text-gray-200 outline-none bg-white-0 grow'
              value={searchedText}
              onChange={(event) => setSearchedText(event.target.value)}
              ref={searchInputRef}
            />
          </div>

          <div className='w-full py-3'>
            {status === 'loading' ? (
              <div className='w-full h-[380px] flex items-center justify-center'>
                <LoaderAnimation color='' />
              </div>
            ) : null}

            {status === 'success' ? (
              <QuickSearchOptions
                suggestionsList={filteredSuggestions}
                activeSearchOption={searchModalActiveOption.active}
                handleOptionClick={handleOptionClick}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
