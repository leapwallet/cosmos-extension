import { ENCRYPTED_ACTIVE_WALLET } from '@leapwallet/leap-keychain'
import { Button } from 'components/ui/button'
import { Input } from 'components/ui/input'
import { AuthContextType, useAuth } from 'context/auth-context'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useState } from 'react'
import { Navigate, To, useLocation, useNavigate } from 'react-router-dom'
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
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  exitAnimationState: ExitAnimationState
  errorHighlighted: boolean
  passwordInput: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onClick: () => void
  onClick1: () => void
  loading: boolean
  unlockLoader: boolean
}) {
  if (props.loading) {
    return null
  }

  return (
    <form onSubmit={props.onSubmit} className='flex flex-col h-full z-50'>
      <div
        className={cn(
          'border-b border-border-bottom/50 text-mdl py-[1.125rem] text-center font-bold',
          props.exitAnimationState && 'opacity-0 pointer-events-none',
        )}
      >
        COMPASS
      </div>

      <div className={'flex flex-col flex-1 gap-5 p-6 justify-center items-center w-full relative'}>
        <img
          className={cn(
            'size-20 transition-all duration-500 scale-100 translate-y-0 opacity-100',
            props.passwordInput || props.exitAnimationState ? 'grayscale-0' : 'grayscale',
            props.exitAnimationState === 'scale' && 'scale-150 translate-y-16',
            props.exitAnimationState === 'scale-fade' && 'scale-[4] translate-y-16 opacity-0',
          )}
          src={Images.Logos.CompassCircle}
        />

        <div
          className={cn(
            'flex items-center justify-center flex-col gap-5 w-full transition-opacity duration-300',
            props.exitAnimationState ? 'opacity-0 pointer-events-none' : 'opacity-100',
          )}
        >
          <div className={'flex flex-col gap-0.5 text-center'}>
            <span className='text-lg font-bold'>Welcome back</span>
            <span className='text-xs font-bold text-muted-foreground'>
              Enter your password to unlock your wallet
            </span>
          </div>

          <div className={'w-full'}>
            <Input
              autoFocus
              className='mx-6 w-auto'
              type='password'
              placeholder='Password'
              status={props.errorHighlighted ? 'error' : undefined}
              value={props.passwordInput}
              onChange={(e) => props.onChange(e)}
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
            className='text-secondary-600 text-xs font-bold hover:text-secondary-800 transition-colors'
            onClick={props.onClick1}
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
          onClick={props.onClick}
          data-testing-id='btn-unlock-wallet'
        >
          Unlock wallet
        </Button>
      </div>
    </form>
  )
}

function Login() {
  const activeChain = useActiveChain()
  const location = useLocation()
  const [passwordInput, setPasswordInput] = useState('')
  const [exitAnimationState, setExitAnimationState] = useState<ExitAnimationState>(null)
  const navigate = useNavigate()
  const auth = useAuth()

  const isUnlockToApprove = (
    location.state as { from?: { search?: string } }
  )?.from?.search?.includes?.('unlock-to-approve')

  const [isError, setError] = useState<boolean>(false)
  const [showUnlockLoader, setShowUnlockLoader] = useState(false)

  const successNavigate = useCallback(
    (to: To, autoLogin = false) => {
      const navOptions = { state: { from: 'login' }, replace: true }
      if (autoLogin) {
        navigate(to, navOptions)
        return
      }

      setExitAnimationState('scale')
      // First timeout (850ms): Show initial scale animation
      setTimeout(() => {
        // After 850ms, start fade out animation
        setExitAnimationState('scale-fade')

        // Second timeout (100ms): Wait for fade animation to complete
        setTimeout(() => {
          // After fade completes, navigate to new route
          navigate(to, navOptions)
        }, 100) // 100ms fade duration
      }, 850) // 850ms initial scale duration
    },
    [navigate],
  )

  useEffect(() => {
    if (!auth) {
      return
    }
    const sendKey = `${activeChain}-send-address`

    browser.storage.local.get([sendKey]).then((res) => {
      if (auth.locked === 'unlocked') {
        const from = (location.state as { from: { pathname: string; search?: string } })?.from
        const pathname = from?.pathname
          ? `${from?.pathname}${from?.search ? `${from?.search}` : ''}`
          : null

        const _pathname = res[sendKey]
          ? '/send'
          : pathname?.includes('onboarding')
          ? '/home'
          : pathname || '/home'

        successNavigate(_pathname, true)
      }
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChain, location.state, successNavigate])

  useEffect(() => {
    // We handle the no account case in a separate useEffect hook to prevent multiple tabs from opening. This hook will only run once.
    browser.storage.local.get([ACTIVE_WALLET, ENCRYPTED_ACTIVE_WALLET]).then((storage) => {
      if (!storage[ACTIVE_WALLET] && !storage[ENCRYPTED_ACTIVE_WALLET]) {
        const tabs = browser.extension.getViews({ type: 'tab' })
        const popups = browser.extension.getViews({ type: 'popup' })

        const thisIsAPopup = popups.findIndex((popup) => popup === window) !== -1

        if (thisIsAPopup || sidePanel) {
          browser.tabs.create({ url: browser.runtime.getURL('index.html#/onboarding') })
          closeSidePanel()
        } else {
          const otherTabs = tabs.filter((tab) => tab !== window)
          otherTabs.forEach((tab) => tab.close())
          navigate('/onboarding', { state: { from: 'login' }, replace: true })
        }
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
          if (!sidePanel) {
            window.close()
          }
          return
        }

        const from = (location.state as { from: { pathname: string; search?: string } })?.from
        const pathname = from?.pathname
          ? `${from?.pathname}${from?.search ? `${from?.search}` : ''}`
          : undefined

        if (pathname && pathname.includes('onboarding') && auth && !auth.noAccount) {
          successNavigate('/home')
        } else {
          const _pathname = pathname ?? '/home'
          successNavigate(_pathname)
        }
        setShowUnlockLoader(false)
      })
    } catch (e) {
      setError(true)
      setShowUnlockLoader(false)
    }
  }, [auth, location, passwordInput, successNavigate])

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      signIn()
    },
    [signIn],
  )

  const forgetPasswordHandler = useCallback(() => {
    const views = browser.extension.getViews({ type: 'popup' })
    if (views.length === 0 && !sidePanel) {
      navigate('/forgotPassword')
    } else {
      window.open(browser.runtime.getURL('index.html#/forgotPassword'))
      closeSidePanel()
    }
  }, [navigate])

  usePerformanceMonitor({
    page: 'login',
    queryStatus: auth?.loading ? 'loading' : 'success',
    op: 'loginPageLoad',
    description: 'loading state on login page',
  })

  // If the user is not locked and the password input is empty, navigate to the home page instantly to show loading state
  // When the password is filled and the auth state changes we want to show the animation and the redirect - successNavigate
  if (
    auth?.locked !== 'locked' &&
    !passwordInput &&
    !isUnlockToApprove &&
    !new URLSearchParams(location.search).has('close-on-login')
  ) {
    return <Navigate to='/home' replace state={{ from: '/login' }} />
  }

  return (
    <LoginView
      unlockLoader={showUnlockLoader}
      loading={(auth as AuthContextType).loading || Boolean(auth?.noAccount)}
      onSubmit={handleSubmit}
      errorHighlighted={isError}
      exitAnimationState={exitAnimationState}
      passwordInput={passwordInput}
      onChange={(event) => {
        setError(false)
        setPasswordInput(event.target.value)
      }}
      onClick={signIn}
      onClick1={forgetPasswordHandler}
    />
  )
}

export default observer(Login)
