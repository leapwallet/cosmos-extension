import HCaptcha from '@hcaptcha/react-hcaptcha'
import { useAddress } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import {
  ActiveChainStore,
  ChainInfosStore,
  RootBalanceStore,
} from '@leapwallet/cosmos-wallet-store'
import { ArrowRight, CheckCircle } from '@phosphor-icons/react'
import { captureException } from '@sentry/react'
import axios from 'axios'
import classNames from 'classnames'
import Text from 'components/text'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { Images } from 'images'
import loadingImage from 'lottie-files/swaps-btn-loading.json'
import Lottie from 'lottie-react'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isSidePanel } from 'utils/isSidePanel'

const faucetsURL = `${process.env.LEAP_WALLET_BACKEND_API_URL}/faucets`
const showFaucetsForChain: string[] = []

type Faucet = {
  faucet_id: number
  faucet_name: string
  chain_id: string
  funds_wallet_address: string
  secret_key_name: string
  frequency: string
  status: string
  amount: number
  gas_price: string
  endpoint_url: string
  denom: string
}

type EligibilityData = {
  eligible: boolean
  code:
    | 'ELIGIBLE'
    | 'ALREADY_CLAIMED'
    | 'CAPACITY_FULL'
    | 'IP_LIMIT_REACHED'
    | 'PENDING_CLAIM_EXISTS'
}
const MAX_TRIES = 20

const RewardStrip = observer(
  ({
    activeChainStore,
    chainInfosStore,
    rootBalanceStore,
    setShowMantraFaucetResp,
  }: {
    activeChainStore: ActiveChainStore
    chainInfosStore: ChainInfosStore
    rootBalanceStore: RootBalanceStore
    setShowMantraFaucetResp: (val: string) => void
  }) => {
    const activeChain = activeChainStore.activeChain
    const chainInfos = chainInfosStore.chainInfos
    const { activeWallet } = useActiveWallet()
    const activeChainAddress = useAddress()

    const activeWalletId = activeWallet?.id
    const chain = chainInfos[activeChain as SupportedChain]
    const faucetSupported = showFaucetsForChain.includes(chain?.chainId ?? '')

    const hCaptchaRef = useRef<HCaptcha>(null)

    const [faucet, setFaucet] = useState<Faucet>()
    const [eligibility, setEligibility] = useState<EligibilityData>({
      eligible: false,
      code: 'ALREADY_CLAIMED',
    })
    const [successClaim, setSuccessClaim] = useState(false)

    const faucetInactive = useMemo(() => faucet?.status === 'inactive', [faucet?.status])

    const checkEligibility = useCallback(async () => {
      if (!faucetInactive) {
        try {
          const { data } = await axios.post(`${faucetsURL}/eligibility`, {
            wallet: activeWalletId,
            wallet_address: activeChainAddress,
            faucet_id: faucet?.faucet_id,
          })
          setEligibility({
            eligible: data.eligible,
            code: data.code,
          })
        } catch (error: any) {
          captureException(error)
        }
      }
    }, [activeChainAddress, activeWalletId, faucet?.faucet_id, faucetInactive])

    const fetchData = useCallback(async () => {
      try {
        const { data } = await axios.get(faucetsURL)
        setFaucet(
          data.data.find(
            (item: any) => item.chain_id === chain?.chainId && item.status !== 'upcoming',
          ),
        )
      } catch (error: any) {
        captureException(error)
      }
    }, [chain?.chainId])

    const checkClaimStatus = useCallback(async (claimId) => {
      try {
        const response = await axios.get(`${faucetsURL}/claim/${claimId}/status`)
        return response
      } catch (error) {
        captureException(error)
      }
    }, [])

    const claimRewards = useCallback(
      async (captcha_token) => {
        try {
          const response = await axios.post(`${faucetsURL}/v2/claim`, {
            wallet: activeWalletId,
            wallet_address: activeChainAddress,
            faucet_id: faucet?.faucet_id,
            captcha_token,
          })
          if (response.status === 200) {
            setEligibility({
              eligible: false,
              code: 'PENDING_CLAIM_EXISTS',
            })
            let retries = 0
            const poll = setInterval(async () => {
              retries++
              const res: any = await checkClaimStatus(response.data.claimId)
              if (retries === MAX_TRIES || res.data?.status === 'success') {
                clearInterval(poll)
              }
              if (res.data?.status === 'success') {
                setEligibility({
                  eligible: false,
                  code: 'ALREADY_CLAIMED',
                })
                setSuccessClaim(true)
                setTimeout(() => {
                  setSuccessClaim(false)
                }, 3000)
                setTimeout(() => {
                  rootBalanceStore.refetchBalances()
                }, 3000)
              }
            }, 2000)
          }
        } catch (error) {
          captureException(error)
        }
      },
      [activeChainAddress, activeWalletId, checkClaimStatus, faucet?.faucet_id, rootBalanceStore],
    )

    const handleSubmit = useCallback(async () => {
      if (eligibility.code === 'CAPACITY_FULL') {
        setShowMantraFaucetResp('Experiencing high traffic. Please try after few minutes.')
        return
      }
      if (eligibility.code === 'IP_LIMIT_REACHED') {
        setShowMantraFaucetResp('You have reached the maximum limit to claim tokens.')
        return
      }
      if (eligibility.eligible && !faucetInactive && !!hCaptchaRef.current) {
        try {
          const result = await hCaptchaRef.current?.execute({ async: true })
          const token = hCaptchaRef.current.getResponse()
          if (!result) {
            throw new Error('could not get hCaptcha response')
          }

          claimRewards(token)
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : error
          if (!(errMsg as string)?.includes?.('challenge-')) {
            captureException(error)
          }
        }
      }
    }, [
      claimRewards,
      eligibility.code,
      eligibility.eligible,
      faucetInactive,
      setShowMantraFaucetResp,
    ])

    useEffect(() => {
      if (faucetSupported) {
        fetchData()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [faucetSupported])

    useEffect(() => {
      if (faucet?.chain_id) {
        checkEligibility()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [faucet?.chain_id, activeChainAddress])

    const titleText = useMemo(() => {
      if (faucetInactive) {
        return (
          <>
            Are you ready for more Mantra missions?
            <br />
            Stay tuned...
          </>
        )
      }
      if (eligibility.code !== 'ALREADY_CLAIMED' || successClaim) {
        return 'Claim OMLY & start your Mantra missions.'
      } else {
        return (
          <>
            You’ve claimed your exclusive OMLY tokens.
            {!isSidePanel() ? <br /> : ' '}
            Stay tuned for more!
          </>
        )
      }
    }, [eligibility.code, faucetInactive, successClaim])

    if (!faucetSupported || !faucet) {
      return null
    }

    return (
      <>
        <div onClick={handleSubmit} className='mb-4 cursor-pointer relative px-7'>
          <img
            src={Images.Banners.faucetBanner}
            className={classNames({ '!h-[64px] rounded-lg object-cover': isSidePanel() })}
          />
          <div className='flex flex-col justify-center absolute py-2.5 px-4 gap-y-[5px] top-0 h-[64px] w-[288px]'>
            <Text
              size='xs'
              className={classNames('font-bold text-gray-800 dark:text-gray-200', {
                'min-[350px]:!pr-5 pr-7': isSidePanel(),
              })}
            >
              {titleText}
            </Text>
            {!faucetInactive && (eligibility.code !== 'ALREADY_CLAIMED' || successClaim) && (
              <div
                className={`flex ${
                  eligibility.code === 'PENDING_CLAIM_EXISTS'
                    ? 'bg-orange-500'
                    : successClaim
                    ? 'bg-green-600'
                    : 'bg-white-100'
                } py-1 px-2 rounded-lg w-2/3 items-center justify-between`}
              >
                <Text
                  size='xs'
                  className='font-bold'
                  color={`${
                    eligibility.code === 'PENDING_CLAIM_EXISTS' || successClaim
                      ? 'text-white-100'
                      : 'text-black-100'
                  }`}
                >
                  {eligibility.code === 'PENDING_CLAIM_EXISTS'
                    ? 'Claiming'
                    : successClaim
                    ? '0.88 OMLY claimed'
                    : 'Claim 0.88 OMLY'}
                </Text>
                {eligibility.code === 'PENDING_CLAIM_EXISTS' ? (
                  <Lottie
                    loop={true}
                    autoplay={true}
                    animationData={loadingImage}
                    rendererSettings={{
                      preserveAspectRatio: 'xMidYMid slice',
                    }}
                    className={'h-[16px] w-[16px]'}
                  />
                ) : (
                  <>
                    {successClaim ? (
                      <CheckCircle weight='fill' size={20} className='text-black-100' />
                    ) : (
                      <ArrowRight size={20} className='text-black-100' />
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <HCaptcha
          ref={hCaptchaRef}
          sitekey='e16e9de4-5efc-4d4a-9c04-9dbe115e6274'
          size='invisible'
          theme='dark'
        />
      </>
    )
  },
)

export default RewardStrip
