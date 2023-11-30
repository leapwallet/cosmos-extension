/* eslint-disable no-unused-vars */
import { useChainInfo } from '@leapwallet/cosmos-wallet-hooks'
import { ENCRYPTED_ACTIVE_WALLET } from '@leapwallet/leap-keychain'
import ExtensionPage from 'components/extension-page'
import { SearchModal } from 'components/search-modal'
import { EventName } from 'config/analytics'
import { QUICK_SEARCH_DISABLED_PAGES } from 'config/config'
import { ACTIVE_WALLET } from 'config/storage-keys'
import useQuery from 'hooks/useQuery'
import { Wallet } from 'hooks/wallet/useWallet'
import mixpanel from 'mixpanel-browser'
import SideNav from 'pages/home/side-nav'
import React, { ReactElement, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { useRef } from 'react'
import KeyboardEventHandler from 'react-keyboard-event-handler'
import { Navigate, useLocation } from 'react-router-dom'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { hasMnemonicWallet } from 'utils/hasMnemonicWallet'
import browser, { extension } from 'webextension-polyfill'

import {
  searchModalActiveOptionState,
  searchModalEnteredOptionState,
  searchModalState,
  showSideNavFromSearchModalState,
} from '../atoms/search-modal'
import { useSetPassword } from '../hooks/settings/usePassword'
import { SeedPhrase } from '../hooks/wallet/seed-phrase/useSeedPhrase'

export type AuthContextType = {
  locked: boolean
  noAccount: boolean
  signin: (password: string, callback?: VoidFunction) => void
  signout: (callback?: VoidFunction) => void
  loading: boolean
}

const AuthContext = React.createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }): ReactElement {
  const [loading, setLoading] = useState<boolean>(true)
  const [locked, setLocked] = useState<boolean>(true)
  const [noAccount, setNoAccount] = useState<boolean | undefined>(false)
  const setPassword = useSetPassword()
  const testPassword = SeedPhrase.useTestPassword()

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listener = (message: any, sender: any) => {
      if (sender.id !== browser.runtime.id) return
      if (message.type === 'auto-lock') {
        setLocked(true)
      }
    }
    browser.runtime.onMessage.addListener(listener)
    return () => {
      browser.runtime.onMessage.removeListener(listener)
    }
  }, [])

  const signin = useCallback(
    async (password: string, callback?: VoidFunction) => {
      if (!password) {
        setNoAccount(true)
      } else {
        try {
          await testPassword(password)
          /**
           * when there is an active wallet, we don't need to decrypt the keychain,
           * if we do it will overwrite the active wallet and keychain with the encrypted version
           *
           * on signout, we encrypt the updated keychain and active wallet.
           *
           * for some reason the password authentication failed errors are not propagated to the calling function when using async await
           */
          browser.storage.local.get([ACTIVE_WALLET]).then(async () => {
            browser.runtime.sendMessage({ type: 'unlock', data: { password } })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const listener = async (message: { type: string }, sender: any) => {
              if (sender.id !== browser.runtime.id) return
              if (message.type === 'wallet-unlocked') {
                setLocked(false)
                setNoAccount(false)
                setLoading(false)
                await setPassword(password)
                callback && callback()
                browser.runtime.onMessage.removeListener(listener)
              }
            }

            browser.runtime.onMessage.addListener(listener)
          })
        } catch (e) {
          throw new Error('Password authentication failed')
        }
      }
    },
    [setPassword, testPassword],
  )

  const signout = useCallback(
    async (callback?: VoidFunction) => {
      if (locked) return
      await setPassword(null)
      browser.runtime.sendMessage({ type: 'lock' })
      const storage = await browser.storage.local.get([ACTIVE_WALLET, ENCRYPTED_ACTIVE_WALLET])

      if (!storage[ACTIVE_WALLET] && !storage[ENCRYPTED_ACTIVE_WALLET]) {
        setNoAccount(true)
      }
      setLocked(true)
      window.location.reload()

      if (callback) callback()
    },
    [setPassword, locked],
  )

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listener = async (message: any, sender: any) => {
      if (sender.id !== browser.runtime.id) return
      if (message.type === 'authentication') {
        if (message.data.status === 'success') {
          signin(message.data.password)
        } else {
          setLoading(() => false)
        }
      }
    }

    const fn = async () => {
      setLoading(true)
      const storage = await browser.storage.local.get([ACTIVE_WALLET, ENCRYPTED_ACTIVE_WALLET])
      if (storage[ACTIVE_WALLET] || storage[ENCRYPTED_ACTIVE_WALLET]) {
        setNoAccount(false)
        browser.runtime.onMessage.addListener(listener)
        browser.runtime.sendMessage({ type: 'popup-open' })
        setTimeout(() => {
          if (loading) {
            setLoading(false)
            //browser.runtime.onMessage.removeListener(listener)
          }
        }, 5000)
      } else {
        setNoAccount(true)
        setLoading(false)
      }
    }

    fn()

    return () => {
      browser.runtime.onMessage.removeListener(listener)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signin])

  const value = {
    locked,
    noAccount: noAccount as boolean,
    signin,
    signout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

export function RequireAuth({
  children,
  hideBorder,
}: {
  children: JSX.Element
  hideBorder?: boolean
}) {
  const auth = useAuth()
  const location = useLocation()
  const [showModal, setShowSearchModal] = useRecoilState(searchModalState)
  const [searchModalActiveOption, setSearchModalActiveOption] = useRecoilState(
    searchModalActiveOptionState,
  )
  const setSearchModalEnteredOption = useSetRecoilState(searchModalEnteredOptionState)
  const [showSideNav, setShowSideNav] = useRecoilState(showSideNavFromSearchModalState)
  const chain = useChainInfo()

  if (auth?.locked) {
    return <Navigate to='/' state={{ from: location }} replace />
  }

  const views = extension.getViews({ type: 'popup' })

  const Children = QUICK_SEARCH_DISABLED_PAGES.includes(location.pathname) ? (
    children
  ) : (
    <>
      <KeyboardEventHandler
        handleKeys={['meta+k', 'ctrl+k', 'up', 'down', 'enter']}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onKeyEvent={(key: string, event: any) => {
          event.stopPropagation()
          event.preventDefault()

          if (['down', 'up'].includes(key)) {
            if (showModal) {
              const newActive =
                key === 'down'
                  ? searchModalActiveOption.active + 1
                  : searchModalActiveOption.active - 1

              if (
                newActive >= searchModalActiveOption.lowLimit &&
                newActive < searchModalActiveOption.highLimit
              ) {
                setSearchModalActiveOption({ ...searchModalActiveOption, active: newActive })
                document
                  .querySelector(
                    `[data-search-active-option-id=search-active-option-id-${newActive}]`,
                  )
                  ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
              }

              setSearchModalEnteredOption(null)
            }
          } else if (key === 'enter') {
            showModal && setSearchModalEnteredOption(searchModalActiveOption.active)
          } else {
            if (!showModal) {
              try {
                mixpanel.track(EventName.QuickSearchOpen, {
                  chainId: chain.chainId,
                  chainName: chain.chainName,
                  openMode: 'Shortcut',
                })
              } catch (e) {
                //
              }
            } else {
              try {
                mixpanel.track(EventName.QuickSearchClose, {
                  chainId: chain.chainId,
                  chainName: chain.chainName,
                })
              } catch {
                //
              }
            }

            setShowSearchModal(!showModal)
            setSearchModalEnteredOption(null)
          }
        }}
        handleFocusableElements={true}
      />
      {children}
      <SearchModal />
      {showSideNav ? <SideNav isShown={showSideNav} toggler={() => setShowSideNav(false)} /> : null}
    </>
  )

  if (hideBorder) {
    return (
      <div
        id='search-modal-container'
        className='relative flex flex-col w-screen h-screen p-[20px] z-0 dark:bg-black-100 overflow-y-scroll pt-0'
      >
        {Children}
      </div>
    )
  }

  return views.length === 0 ? (
    <ExtensionPage>
      <div className='absolute top-0 rounded-2xl flex bottom-0 w-1/2 z-5 justify-center items-center'>
        <div
          id='search-modal-container'
          className='dark:shadow-sm shadow-xl dark:shadow-gray-700 relative'
        >
          {Children}
        </div>
      </div>
    </ExtensionPage>
  ) : (
    <div id='search-modal-container' className='relative w-full'>
      {Children}
    </div>
  )
}

export function RequireAuthOnboarding({ children }: { children: JSX.Element }) {
  const [redirectTo, setRedirectTo] = useState<'home' | 'onboarding' | undefined>()
  const auth = useAuth()
  const walletName = useQuery().get('walletName') ?? undefined
  const newUser = useRef(false)

  useEffect(() => {
    const fn = async () => {
      if (newUser.current) {
        return
      }

      const store = await browser.storage.local.get([ENCRYPTED_ACTIVE_WALLET])
      if (!auth?.loading && auth?.locked && store[ENCRYPTED_ACTIVE_WALLET]) {
        setRedirectTo('home')
        return
      }

      const allWallets = await Wallet.getAllWallets()
      if (!allWallets || Object.keys(allWallets).length === 0) {
        newUser.current = true
      }
      const hasPrimaryWallet = hasMnemonicWallet(allWallets)
      const isLedger = walletName === 'hardwarewallet'

      if (hasPrimaryWallet && !isLedger) {
        setRedirectTo('home')
      } else {
        setRedirectTo('onboarding')
      }
    }
    fn()
  }, [auth, walletName])

  if (redirectTo === 'onboarding') {
    return children
  }
  if (redirectTo === 'home') {
    return <Navigate to='/' replace />
  }
  return null
}
