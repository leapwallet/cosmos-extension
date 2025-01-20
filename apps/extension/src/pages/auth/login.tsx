/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ENCRYPTED_ACTIVE_WALLET } from '@leapwallet/leap-keychain'
import { Buttons, Input, ThemeName, useTheme } from '@leapwallet/leap-ui'
import { Lock } from '@phosphor-icons/react'
import classNames from 'classnames'
import CssLoader from 'components/css-loader/CssLoader'
import ExtensionPage from 'components/extension-page'
import PopupLayout from 'components/layout/popup-layout'
import Text from 'components/text'
import { AuthContextType, useAuth } from 'context/auth-context'
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { autoLockTimeStore } from 'stores/password-store'
import { Colors } from 'theme/colors'
import { closeSidePanel } from 'utils/closeSidePanel'
import { isCompassWallet } from 'utils/isCompassWallet'
import { isSidePanel } from 'utils/isSidePanel'
import browser from 'webextension-polyfill'

import Loader from '../../components/loader/Loader'
import { ACTIVE_WALLET, BG_RESPONSE, REDIRECT_REQUEST } from '../../config/storage-keys'

function LoginView(props: {
  // eslint-disable-next-line no-unused-vars
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  errorHighlighted: boolean
  // eslint-disable-next-line no-unused-vars
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onClick: () => void
  onClick1: () => void
  loading: boolean
  unlockLoader: boolean
  fullHeight?: boolean
}) {
  const theme = useTheme()
  const isDark = theme.theme === ThemeName.DARK

  if (props.loading) {
    return (
      <PopupLayout>
        <div className='flex flex-col items-center justify-center h-full'>{/*<Loader />*/}</div>
      </PopupLayout>
    )
  }

  return (
    <PopupLayout className='!h-screen !max-h-[680px]'>
      <div className='flex h-[72px] w-[400px] items-center px-7 mt-[8px]'>
        <img
          className={classNames({
            'w-[40px] h-[40px]': isCompassWallet(),
            'h-[30px]': !isCompassWallet(),
          })}
          src={
            isCompassWallet()
              ? Images.Logos.CompassCircle
              : isDark
              ? Images.Logos.LeapDarkMode
              : Images.Logos.LeapLightMode
          }
        />
        {isCompassWallet() && (
          <div className='font-black inline-block text-2xl text-gray-900 dark:text-white-100 ml-2'>
            COMPASS
          </div>
        )}
      </div>
      <form
        onSubmit={props.onSubmit}
        className={classNames(
          'relative flex items-center justify-center flex-col h-[calc(100%-96px)]',
          {
            'p-[48px]': !isSidePanel(),
            'p-7': isSidePanel(),
          },
        )}
      >
        <div className='dark:bg-gray-900 bg-white-100 rounded-[16px] mb-4 p-4'>
          <Lock size={48} className='text-gray-400 dark:text-white-100' />
        </div>
        <Text size='lg' className='dark:text-white-100 text-gray-900 font-bold mb-1'>
          Welcome back
        </Text>
        <Text
          size='md'
          color='text-gray-400 font-bold mb-8'
          data-testing-id='login-enter-your-password-ele'
        >
          Enter your password to unlock wallet
        </Text>
        <div className='flex w-[304px] justify-center shrink'>
          <Input
            autoFocus
            type='password'
            placeholder='Enter password'
            isErrorHighlighted={props.errorHighlighted}
            onChange={(e) => props.onChange(e)}
            data-testing-id='login-input-enter-password'
          />
        </div>
        <div className='h-[64px]'>
          {props.errorHighlighted && (
            <Text size='sm' color='text-red-300 mt-[16px]' data-testing-id='login-error-text'>
              Incorrect password. Please try again
            </Text>
          )}
        </div>
        <div className='flex w-[304px] shrink'>
          <Buttons.Generic
            size='normal'
            onClick={props.onClick}
            color={isCompassWallet() ? Colors.compassPrimary : Colors.osmosisPrimary}
            data-testing-id='btn-unlock-wallet'
            disabled={props.unlockLoader}
          >
            {props.unlockLoader ? <CssLoader /> : 'Unlock wallet'}
          </Buttons.Generic>
        </div>
        <div className='p-[28px]' onClick={props.onClick1}>
          <Text size='md' className='font-semibold hover:underline cursor-pointer'>
            Forgot Password?
          </Text>
        </div>
      </form>
    </PopupLayout>
  )
}

function Login() {
  const activeChain = useActiveChain()
  const location = useLocation()
  const [passwordInput, setPasswordInput] = useState('')
  const navigate = useNavigate()
  const auth = useAuth()
  const [isPopup, setIsPopup] = useState(false)

  const [isError, setError] = useState<boolean>(false)
  const [showUnlockLoader, setShowUnlockLoader] = useState(false)

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
          : undefined
        const _pathname = res[sendKey] ? '/send' : pathname ?? '/home'
        navigate(_pathname, { state: { from: 'login' }, replace: true })
      }
    })
  }, [activeChain, auth, location.state, navigate])

  useEffect(() => {
    // We handle the no account case in a separate useEffect hook to prevent multiple tabs from opening. This hook will only run once.
    browser.storage.local.get([ACTIVE_WALLET, ENCRYPTED_ACTIVE_WALLET]).then((storage) => {
      if (!storage[ACTIVE_WALLET] && !storage[ENCRYPTED_ACTIVE_WALLET]) {
        const tabs = browser.extension.getViews({ type: 'tab' })
        const popups = browser.extension.getViews({ type: 'popup' })

        const thisIsAPopup = popups.findIndex((popup) => popup === window) !== -1

        if (thisIsAPopup || isSidePanel()) {
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
      //@ts-ignore
      if (
        searchParams.has('close-on-login') ||
        //@ts-ignore
        location.state?.from.search.includes('unlock-to-approve')
      ) {
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
        setIsPopup(true)
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
    if (passwordInput) {
      setShowUnlockLoader(true)
      try {
        const textEncoder = new TextEncoder()
        await (auth as AuthContextType).signin(textEncoder.encode(passwordInput), () => {
          setPasswordInput('')
          autoLockTimeStore.setLastActiveTime()
          const searchParams = new URLSearchParams(location.search)
          if (searchParams.has('close-on-login')) {
            browser.runtime.sendMessage({ type: 'user-logged-in', payload: { status: 'success' } })
            if (isSidePanel()) {
              navigate('/home')
            } else {
              window.close()
            }
            return
          }

          const from = (location.state as { from: { pathname: string; search?: string } })?.from
          const pathname = from?.pathname
            ? `${from?.pathname}${from?.search ? `${from?.search}` : ''}`
            : undefined

          if (pathname && pathname.includes('onboarding') && auth && !auth.noAccount) {
            navigate('/home', { state: { from: 'login' }, replace: true })
          } else {
            const _pathname = pathname ?? '/home'
            navigate(_pathname, { state: { from: 'login' }, replace: true })
          }
          setShowUnlockLoader(false)
        })
      } catch (e) {
        setError(true)
        setShowUnlockLoader(false)
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, location.state, navigate, passwordInput])

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      signIn()
    },
    [signIn],
  )

  const views = browser.extension.getViews({ type: 'popup' })

  const forgetPasswordHandler = useCallback(() => {
    if (views.length === 0 && !isSidePanel()) {
      navigate('/forgotPassword')
    } else {
      window.open(browser.runtime.getURL('index.html#/forgotPassword'))
      closeSidePanel()
    }
  }, [navigate, views.length])

  usePerformanceMonitor({
    page: 'login',
    queryStatus: auth?.loading ? 'loading' : 'success',
    op: 'loginPageLoad',
    description: 'loading state on login page',
  })

  return (views.length === 0 && !isPopup) || isSidePanel() ? (
    <ExtensionPage>
      <div
        className={classNames('absolute top-0 flex h-full z-5 justify-center items-center', {
          'w-1/2': !isSidePanel(),
        })}
      >
        <div className='dark:shadow-sm shadow-xl dark:shadow-gray-700 enclosing-panel panel-height'>
          <LoginView
            unlockLoader={showUnlockLoader}
            loading={(auth as AuthContextType).loading || Boolean(auth?.noAccount)}
            onSubmit={handleSubmit}
            errorHighlighted={isError}
            onChange={(event) => {
              setError(false)
              setPasswordInput(event.target.value)
            }}
            onClick={signIn}
            onClick1={forgetPasswordHandler}
          />
        </div>
      </div>
    </ExtensionPage>
  ) : (
    <LoginView
      unlockLoader={showUnlockLoader}
      loading={(auth as AuthContextType).loading || Boolean(auth?.noAccount)}
      onSubmit={handleSubmit}
      errorHighlighted={isError}
      fullHeight={true}
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
