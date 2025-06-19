import { ENCRYPTED_ACTIVE_WALLET } from '@leapwallet/leap-keychain'
import { Button } from 'components/ui/button'
import { Input } from 'components/ui/input'
import { AuthContextType, useAuth } from 'context/auth-context'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor'
import { HappyFrog } from 'icons/frog'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Location, To, useNavigate } from 'react-router-dom'
import { autoLockTimeStore } from 'stores/password-store'
import { closeSidePanel } from 'utils/closeSidePanel'
import { cn } from 'utils/cn'
import { sidePanel } from 'utils/isSidePanel'
import { transition150 } from 'utils/motion-variants'
import browser from 'webextension-polyfill'

import { ACTIVE_WALLET, BG_RESPONSE, REDIRECT_REQUEST } from '../../config/storage-keys'

const loginErrorVariants: Variants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: '2.25rem' },
}

type ExitAnimationState = 'scale' | 'scale-fade' | null

function LoginView(props: {
  exitAnimationState: ExitAnimationState
  errorHighlighted: boolean
  passwordInput: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onSignIn: () => void
  onForgotPassword: () => void
  loading: boolean
  unlockLoader: boolean
}) {
  if (props.loading) {
    return null
  }

  return (
    <div className='flex flex-col h-full z-50'>
      <div
        className={cn(
          'border-b border-border-bottom/50 text-mdl py-[1.125rem] text-center font-bold',
          props.exitAnimationState && 'opacity-0 pointer-events-none',
        )}
      >
        Leap Wallet
      </div>

      <div className={'flex flex-col flex-1 gap-5 p-6 justify-center items-center w-full relative'}>
        <HappyFrog
          className={cn(
            'size-28 transition-all duration-500 scale-100 translate-y-0 opacity-100',
            props.exitAnimationState === 'scale' && 'scale-150 translate-y-16',
            props.exitAnimationState === 'scale-fade' && 'scale-[4] translate-y-16 opacity-0',
          )}
        />

        <div
          className={cn(
            'flex items-center justify-center flex-col gap-5 w-full transition-opacity duration-300',
            props.exitAnimationState ? 'opacity-0 pointer-events-none' : 'opacity-100',
          )}
        >
          <span className='text-xl font-bold mt-3'>Enter your password</span>

          <div className={'w-full'}>
            <Input
              autoFocus
              className='w-full'
              type='password'
              placeholder='Password'
              status={props.errorHighlighted ? 'error' : undefined}
              value={props.passwordInput}
              onChange={(e) => props.onChange(e)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  props.onSignIn()
                }
              }}
              data-testing-id='login-input-enter-password'
            />

            <AnimatePresence>
              {props.errorHighlighted && (
                <motion.span
                  data-testing-id='login-error-text'
                  className='text-destructive-100 text-center text-sm h-9 flex items-center'
                  transition={transition150}
                  variants={loginErrorVariants}
                  initial='hidden'
                  animate='visible'
                  exit='hidden'
                >
                  <span className='mt-auto text-center w-full'>
                    Incorrect password. Please try again
                  </span>
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <button
            type='button'
            className='text-secondary-800 text-sm hover:text-foreground transition-colors'
            onClick={props.onForgotPassword}
          >
            Forgot Password?
          </button>
        </div>
      </div>

      <div
        key='unlock-wallet'
        className={cn(
          'border-t border-border-bottom/50 text-mdl p-4 text-center font-bold mt-auto transition-opacity duration-300',
          props.exitAnimationState ? 'opacity-0 pointer-events-none' : 'opacity-100',
        )}
      >
        <Button
          size={'md'}
          className='w-full'
          onClick={props.onSignIn}
          data-testing-id='btn-unlock-wallet'
        >
          Unlock wallet
        </Button>
      </div>
    </div>
  )
}

function Login({ location }: { location: Location }) {
  const [passwordInput, setPasswordInput] = useState('')
  const [exitAnimationState, setExitAnimationState] = useState<ExitAnimationState>(null)
  const hasAccounts = useRef(false)

  const isNavigating = useRef(false)

  const auth = useAuth()

  const isUnlockToApprove = (
    location.state as { from?: { search?: string } }
  )?.from?.search?.includes?.('unlock-to-approve')

  const [isError, setError] = useState<boolean>(false)
  const [showUnlockLoader, setShowUnlockLoader] = useState(false)

  const navigate = useNavigate()

  const successNavigate = useCallback((to: To, animate = false) => {
    if (!to || isNavigating.current) {
      return
    }

    isNavigating.current = true

    if (!animate) {
      navigate(to, { state: { from: '/login' }, replace: true })
      isNavigating.current = false
      return
    }

    setExitAnimationState('scale')
    // First timeout (850ms): Show initial scale animation
    setTimeout(() => {
      // After 850ms, start fade out animation
      setExitAnimationState('scale-fade')

      // Second timeout (100ms): Wait for fade animation to complete
      setTimeout(() => {
        navigate(to, { state: { from: '/login' }, replace: true })
      }, 100) // 100ms fade duration
    }, 850) // 850ms initial scale duration
  }, [])

  useEffect(() => {
    // We handle the no account case in a separate useEffect hook to prevent multiple tabs from opening. This hook will only run once.
    browser.storage.local.get([ACTIVE_WALLET, ENCRYPTED_ACTIVE_WALLET]).then((storage) => {
      if (storage[ACTIVE_WALLET] || storage[ENCRYPTED_ACTIVE_WALLET]) {
        hasAccounts.current = true
        return
      }

      const tabs = browser.extension.getViews({ type: 'tab' })
      const popups = browser.extension.getViews({ type: 'popup' })

      const thisIsAPopup = popups.findIndex((popup) => popup === window) !== -1

      if (thisIsAPopup || sidePanel) {
        browser.tabs.create({ url: browser.runtime.getURL('index.html#/onboarding') })
        closeSidePanel()
      } else {
        const otherTabs = tabs.filter((tab) => tab !== window)
        otherTabs.forEach((tab) => tab.close())
        successNavigate('/onboarding')
      }
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handleCancel = async () => {
      const searchParams = new URLSearchParams(location.search)
      if (searchParams.has('close-on-login') || isUnlockToApprove) {
        browser.runtime.sendMessage({ type: 'user-logged-in', payload: { status: 'failed' } })
      } else {
        await browser.storage.local.set({ [BG_RESPONSE]: { error: 'Request rejected' } })
      }
      setTimeout(() => {
        browser.storage.local.remove(BG_RESPONSE)
      }, 50)
    }

    browser.storage.local.get(REDIRECT_REQUEST).then(async (result) => {
      if (result[REDIRECT_REQUEST]) {
        await browser.storage.local.remove(BG_RESPONSE)
      }
    })
    window.addEventListener('beforeunload', handleCancel)
    return () => {
      window.removeEventListener('beforeunload', handleCancel)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signIn = useCallback(async () => {
    if (!passwordInput) {
      return
    }

    setShowUnlockLoader(true)
    try {
      const textEncoder = new TextEncoder()
      await (auth as AuthContextType).signin(textEncoder.encode(passwordInput), () => {
        autoLockTimeStore.setLastActiveTime()
        const searchParams = new URLSearchParams(location.search)
        if (searchParams.has('close-on-login')) {
          browser.runtime.sendMessage({ type: 'user-logged-in', payload: { status: 'success' } })
          if (sidePanel) {
            successNavigate('/home')
          }

          window.close()
          return
        }

        const from = (location.state as { from: { pathname: string; search?: string } })?.from
        const pathname = from?.pathname
          ? `${from?.pathname}${from?.search ? `${from?.search}` : ''}`
          : undefined

        const defaultPath = '/home'
        let pathName = defaultPath

        if (!pathname?.includes('onboarding') || !auth || auth?.noAccount) {
          const _pathname = pathname === '/' ? defaultPath : pathname
          pathName = _pathname || defaultPath
        }

        successNavigate(pathName, true)
        setShowUnlockLoader(false)
      })
    } catch (e) {
      setError(true)
      setShowUnlockLoader(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, location, passwordInput, successNavigate])

  const forgetPasswordHandler = useCallback(() => {
    const views = browser.extension.getViews({ type: 'popup' })
    if (views.length === 0 && !sidePanel) {
      successNavigate('/forgotPassword')
    } else {
      window.open(browser.runtime.getURL('index.html#/forgotPassword'))
      closeSidePanel()
    }
  }, [successNavigate])

  useEffect(() => {
    // If the user is not locked and the password input is empty, navigate to the home page instantly to show loading state
    // When the password is filled and the auth state changes we want to show the animation and the redirect - successNavigate
    const autoLogin =
      auth?.locked === 'unlocked' &&
      !passwordInput &&
      !isUnlockToApprove &&
      !new URLSearchParams(location.search).has('close-on-login')

    if (autoLogin) {
      successNavigate('/home')
    }
  }, [auth, isUnlockToApprove, location.search, passwordInput, successNavigate])

  usePerformanceMonitor({
    page: 'login',
    queryStatus: auth?.loading ? 'loading' : 'success',
    op: 'loginPageLoad',
    description: 'loading state on login page',
  })

  return (
    <>
      <LoginView
        unlockLoader={showUnlockLoader}
        loading={(auth as AuthContextType).loading || Boolean(auth?.noAccount)}
        errorHighlighted={isError}
        exitAnimationState={exitAnimationState}
        passwordInput={passwordInput}
        onChange={(event) => {
          setError(false)
          setPasswordInput(event.target.value)
        }}
        onSignIn={signIn}
        onForgotPassword={forgetPasswordHandler}
      />
    </>
  )
}

export default observer(Login)
