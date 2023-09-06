/* eslint-disable no-unused-vars */
import { ENCRYPTED_ACTIVE_WALLET } from '@leapwallet/leap-keychain'
import ExtensionPage from 'components/extension-page'
import Loader, { LoaderAnimation } from 'components/loader/Loader'
import { ACTIVE_WALLET, V80_KEYSTORE_MIGRATION_COMPLETE } from 'config/storage-keys'
import useQuery from 'hooks/useQuery'
import { Wallet } from 'hooks/wallet/useWallet'
import React, { ReactElement, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { useRef } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { hasMnemonicWallet } from 'utils/hasMnemonicWallet'
import browser, { extension } from 'webextension-polyfill'

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
          browser.storage.local.get([ACTIVE_WALLET]).then(async () => {
            browser.runtime.sendMessage({ type: 'unlock', data: { password } })
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

  if (auth?.locked) {
    return <Navigate to='/' state={{ from: location }} replace />
  }

  const views = extension.getViews({ type: 'popup' })

  if (hideBorder) {
    return (
      <div className='relative flex flex-col w-screen h-screen p-[20px] z-0 dark:bg-black-100 overflow-y-scroll pt-0'>
        {children}
      </div>
    )
  }

  return views.length === 0 ? (
    <ExtensionPage>
      <div className='absolute top-0 rounded-2xl flex bottom-0 w-1/2 z-5 justify-center items-center'>
        <div className='dark:shadow-sm shadow-xl dark:shadow-gray-700'>{children}</div>
      </div>
    </ExtensionPage>
  ) : (
    children
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
