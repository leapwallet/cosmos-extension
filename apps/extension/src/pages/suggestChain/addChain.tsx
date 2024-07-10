/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Key, removeTrailingSlash } from '@leapwallet/cosmos-wallet-hooks'
import {
  chainIdToChain,
  ChainInfo,
  defaultGasPriceStep,
  sleep,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, Header, HeaderActionType } from '@leapwallet/leap-ui'
import { captureException } from '@sentry/react'
import { chainInfosState } from 'atoms/chains'
import axios from 'axios'
import { ErrorCard } from 'components/ErrorCard'
import { InputComponent } from 'components/input-component/InputComponent'
import PopupLayout from 'components/layout/popup-layout'
import Loader from 'components/loader/Loader'
import Text from 'components/text'
import { ButtonName, ButtonType, EventName } from 'config/analytics'
import { BETA_CHAINS } from 'config/storage-keys'
import { useSetActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet, { useUpdateKeyStore } from 'hooks/settings/useActiveWallet'
import { useChainInfos } from 'hooks/useChainInfos'
import { Images } from 'images'
import mixpanel from 'mixpanel-browser'
import SideNav from 'pages/home/side-nav'
import React, { ChangeEvent, FormEvent, useState } from 'react'
import { useNavigate } from 'react-router'
import { useSetRecoilState } from 'recoil'
import { isCompassWallet } from 'utils/isCompassWallet'
import { isNotValidNumber, isNotValidURL } from 'utils/regex'
import browser from 'webextension-polyfill'

type TAddChainFormProps = {
  updateKeyStore: (
    wallet: Key,
    activeChain: SupportedChain,
    actionType?: 'UPDATE' | 'DELETE',
    chainInfo?: ChainInfo,
  ) => Promise<Record<string, Key>>
  activeWallet: Key
  setActiveWallet: (wallet: Key) => Promise<void>
  setActiveChain: (chain: SupportedChain, chainInfo?: ChainInfo) => Promise<void>
}
const AddChainForm = ({
  updateKeyStore,
  activeWallet,
  setActiveWallet,
  setActiveChain,
}: TAddChainFormProps) => {
  const chainInfos = useChainInfos()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const setChainInfos = useSetRecoilState(chainInfosState)
  const [chainInfo, setChainInfo] = useState({
    chainName: '',
    chainId: '',
    denom: '',
    coinType: '',
    rpcUrl: '',
    restUrl: '',
    addressPrefix: '',
    explorerUrl: '',
    decimals: '',
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const {
    chainName,
    chainId,
    denom,
    coinType,
    rpcUrl,
    restUrl,
    addressPrefix,
    explorerUrl,
    decimals,
  } = chainInfo

  const fetchChainInfo = async (chainId: string) => {
    try {
      const chain = chainIdToChain[chainId.trim()]
      if (!chain) {
        return
      }
      const mainnetBaseURL = 'https://chains.cosmos.directory'
      const { data: mainnetData }: any = await axios
        .get(`${mainnetBaseURL}/${chain}`)
        .catch(() => ({}))

      const testnetBaseURL = 'https://chains.testcosmos.directory'
      const { data: testnetData }: any = mainnetData
        ? { data: null }
        : await axios.get(`${testnetBaseURL}/${chain}`).catch(() => ({}))

      const info = mainnetData?.chain || testnetData?.chain
      if (!info) {
        return
      }
      const mintscanExplorer = info.explorers.find((explorer: any) => explorer.kind === 'mintscan')

      setChainInfo({
        chainId: info.chain_id,
        chainName: info.pretty_name,
        denom: info.denom,
        coinType: String(info.slip44),
        addressPrefix: info.bech32_prefix,
        decimals: String(info.decimals),
        restUrl: info.best_apis.rest[0].address,
        rpcUrl: info.best_apis.rpc[0].address,
        explorerUrl: mintscanExplorer
          ? mintscanExplorer.tx_page.slice(0, -10)
          : info.explorers[0].tx_page.slice(0, -10),
      })
    } catch (_) {
      return
    }
  }

  const trackCTAEvent = (buttonName: string, redirectURL?: string) => {
    if (!isCompassWallet()) {
      try {
        mixpanel.track(EventName.ButtonClick, {
          buttonType: ButtonType.CHAIN_MANAGEMENT,
          buttonName,
          addedChainName: chainName,
          redirectURL,
          time: Date.now() / 1000,
        })
      } catch (e) {
        captureException(e)
      }
    }
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget
    const chains = Object.values(chainInfos).filter((chain) => chain.enabled)

    let error = ''
    if (value) {
      if (['coinType', 'decimals'].includes(name) && isNotValidNumber(value)) {
        error = `Invalid ${name} provided`
      } else if (
        ['rpcUrl', 'restUrl', 'explorerUrl'].includes(name) &&
        isNotValidURL(value.replace(/ /g, '')) &&
        value.replace(/ /g, '')?.length > 0
      ) {
        error = `Invalid ${name} provided`
      } else if (
        name === 'chainName' &&
        chains.some((chain) => chain.chainName.toLowerCase() === value.toLowerCase())
      ) {
        error = 'Chain with same name already exists'
      } else if (name === 'chainId') {
        if (chains.some((chain) => chain.chainId.toLowerCase() === value.toLowerCase())) {
          error = 'Chain with same id already exists'
        } else if (
          chains.some((chain) => (chain.testnetChainId ?? '').toLowerCase() === value.toLowerCase())
        ) {
          error = 'Test chain with same id already exists'
        }
      }
    }

    if (error) {
      setErrors((s) => ({ ...s, [name]: error }))
    } else if (errors[name]) {
      delete errors[name]
      setErrors(errors)
    }

    if (['rpcUrl', 'restUrl', 'explorerUrl'].includes(name)) {
      setChainInfo((s) => ({ ...s, [name]: value.replace(/ /g, '') }))
    } else {
      setChainInfo((s) => ({ ...s, [name]: value }))
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    setLoading(true)
    event.preventDefault()
    const data: any = {
      chainId: chainId,
      chainName: chainName,
      chainRegistryPath: addressPrefix,
      key: chainName,
      chainSymbolImageUrl: Images.Logos.GenericLight,
      txExplorer: {
        mainnet: {
          name: 'Explorer',
          txUrl: explorerUrl,
        },
      },
      apis: {
        rest: removeTrailingSlash(restUrl),
        rpc: removeTrailingSlash(rpcUrl),
      },
      denom: denom,
      bip44: {
        coinType: coinType,
      },
      addressPrefix: addressPrefix,
      gasPriceStep: defaultGasPriceStep,
      ibcChannelIds: {},
      nativeDenoms: {
        [denom]: {
          coinDenom: addressPrefix,
          coinMinimalDenom: denom,
          coinDecimals: Number(decimals),
          coinGeckoId: '',
          icon: Images.Logos.GenericLight,
          chain: chainName,
        },
      },
      theme: {
        primaryColor: '#E18881',
        gradient:
          'linear-gradient(180deg, rgba(225, 136, 129, 0.32) 0%, rgba(225, 136, 129, 0) 100%)',
      },
      enabled: true,
      beta: true,
      features: [],
    }

    setChainInfos({ ...chainInfos, [chainName]: data })
    await sleep(500)

    browser.storage.local.get([BETA_CHAINS]).then(async (resp) => {
      try {
        const updatedKeystore = await updateKeyStore(
          activeWallet,
          chainName as unknown as SupportedChain,
          'UPDATE',
          data,
        )
        let betaChains = resp?.[BETA_CHAINS]

        betaChains = typeof betaChains === 'string' ? JSON.parse(betaChains) : {}
        betaChains[chainName] = data
        await browser.storage.local.set({ [BETA_CHAINS]: JSON.stringify(betaChains) })

        await setActiveWallet(updatedKeystore[activeWallet.id])
        await setActiveChain(chainName as unknown as SupportedChain, data)
        navigate('/')
      } catch (error) {
        setErrors((s) => ({ ...s, submit: 'Unable to add chain' }))
        // do nothing
      } finally {
        setLoading(false)
      }
    })
    trackCTAEvent(ButtonName.ADD_NEW_CHAIN, '/add-chain')
  }

  const disableSubmit =
    !chainId ||
    !chainName ||
    !denom ||
    !coinType ||
    !rpcUrl ||
    !restUrl ||
    !addressPrefix ||
    !decimals ||
    Object.values(errors).length > 0

  return (
    <form className='mx-auto w-[344px] mb-5' onSubmit={handleSubmit}>
      <InputComponent
        placeholder='Chain Id (Ex: juno-1)'
        value={chainId}
        name='chainId'
        onChange={handleChange}
        error={errors.chainId}
        onBlur={(event) => fetchChainInfo(event.currentTarget.value)}
      />

      <InputComponent
        placeholder='Chain Name (Ex: Juno)'
        value={chainName}
        name='chainName'
        onChange={handleChange}
        error={errors.chainName}
      />

      <InputComponent
        placeholder='New RPC URL (Without Trailing Slash)'
        value={rpcUrl}
        name='rpcUrl'
        onChange={handleChange}
        error={errors.rpcUrl}
      />

      <InputComponent
        placeholder='New REST URL (Without Trailing Slash)'
        value={restUrl}
        name='restUrl'
        onChange={handleChange}
        error={errors.restUrl}
      />

      <InputComponent
        placeholder='Address Prefix (Ex: juno)'
        value={addressPrefix}
        name='addressPrefix'
        onChange={handleChange}
      />

      <InputComponent
        placeholder='Native Denom (Ex: ujuno)'
        value={denom}
        name='denom'
        onChange={handleChange}
      />

      <InputComponent
        placeholder='Coin Type (Ex: 118)'
        value={coinType}
        name='coinType'
        onChange={handleChange}
        error={errors.coinType}
      />

      <InputComponent
        placeholder='Decimals (Ex: 6)'
        value={decimals}
        name='decimals'
        onChange={handleChange}
        error={errors.decimals}
      />

      <InputComponent
        placeholder='Block explorer URL (Optional)'
        value={explorerUrl}
        name='explorerUrl'
        onChange={handleChange}
        error={errors.explorerUrl}
      />
      {errors.submit ? <ErrorCard text={errors.submit} /> : null}

      <div className='flex gap-x-4 mt-3'>
        <Buttons.Generic
          className='rounded-2xl w-full font-bold py-3 dark:bg-gray-900 bg-gray-900 text-gray-900 dark:text-white-100 h-12'
          type='reset'
          onClick={() => navigate('/')}
          style={{ boxShadow: 'none' }}
        >
          Cancel
        </Buttons.Generic>

        <Buttons.Generic
          className='rounded-2xl w-full font-bold py-3 text-gray-900 dark:text-white-100 relative h-12'
          style={{ backgroundColor: '#E18881', boxShadow: 'none' }}
          type='submit'
          disabled={loading || disableSubmit}
        >
          {loading ? <Loader /> : 'Add chain'}
        </Buttons.Generic>
      </div>
    </form>
  )
}

export default function AddChain() {
  const navigate = useNavigate()
  const [showSideNav, setShowSideNav] = useState(false)
  const updateKeyStore = useUpdateKeyStore()
  const { activeWallet, setActiveWallet } = useActiveWallet()
  const setActiveChain = useSetActiveChain()
  return (
    <div className='relative overflow-clip m-auto'>
      <SideNav isShown={showSideNav} toggler={() => setShowSideNav(!showSideNav)} />
      <PopupLayout
        header={
          <Header
            title='Add Chain'
            action={{
              onClick: () => {
                navigate('/home')
              },
              type: HeaderActionType.BACK,
            }}
          />
        }
      >
        <div className='w-[400px] h-[600px] max-h-[600px] overflow-y-auto bg-gray-50 dark:bg-black-100'>
          <div className='rounded-xl mx-auto w-[344px] flex items-center h-[68px] bg-white-100 dark:bg-gray-900 py-2 pl-5 pr-[10px] mt-7 mb-4'>
            <img className='mr-[16px]' src={Images.Misc.Warning} width='40' height='40' />
            <div className='flex flex-col gap-y-[2px]'>
              <Text size='sm' color='text-gray-400 font-medium'>
                Caution:
              </Text>
              <Text size='sm' color='font-bold dark:text-white-100 text-gray-900'>
                Only add custom networks you trust.
              </Text>
            </div>
          </div>
          <AddChainForm
            updateKeyStore={updateKeyStore as () => Promise<Record<string, Key>>}
            activeWallet={activeWallet as Key}
            setActiveWallet={setActiveWallet}
            setActiveChain={setActiveChain}
          />
        </div>
      </PopupLayout>
    </div>
  )
}
