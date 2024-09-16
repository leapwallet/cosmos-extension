import { Key as WalletKey, useChainsStore } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfo, sleep } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, GenericCard } from '@leapwallet/leap-ui'
import { captureException } from '@sentry/react'
import { chainInfosState } from 'atoms/chains'
import BottomModal from 'components/bottom-modal'
import { Divider, Key, Value } from 'components/dapp'
import { ErrorCard } from 'components/ErrorCard'
import { InfoCard } from 'components/info-card'
import { LoaderAnimation } from 'components/loader/Loader'
import { ButtonName, ButtonType, EventName } from 'config/analytics'
import { BETA_CHAINS } from 'config/storage-keys'
import { useSetActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet, { useUpdateKeyStore } from 'hooks/settings/useActiveWallet'
import { useThemeState } from 'hooks/settings/useTheme'
import { useChainInfos } from 'hooks/useChainInfos'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import mixpanel from 'mixpanel-browser'
import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { useSetRecoilState } from 'recoil'
import { chainInfoStore } from 'stores/chain-infos-store'
import { rootStore } from 'stores/root-store'
import { Colors } from 'theme/colors'
import { imgOnError } from 'utils/imgOnError'
import { isCompassWallet } from 'utils/isCompassWallet'
import browser from 'webextension-polyfill'

type AddFromChainStoreProps = {
  readonly isVisible: boolean
  readonly onClose: VoidFunction
  newAddChain: ChainInfo
}

export default function AddFromChainStore({
  isVisible,
  onClose,
  newAddChain,
}: AddFromChainStoreProps) {
  const [showMore, setShowMore] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const defaultTokenLogo = useDefaultTokenLogo()
  const setChains = useChainsStore((store) => store.setChains)
  const setChainInfos = useSetRecoilState(chainInfosState)
  const updateKeyStore = useUpdateKeyStore()
  const { activeWallet, setActiveWallet } = useActiveWallet()
  const setActiveChain = useSetActiveChain()
  const chainInfos = useChainInfos()
  const navigate = useNavigate()
  const { theme } = useThemeState()

  const handleCancel = async () => {
    onClose()
  }

  const newChainKey = newAddChain?.key ?? newAddChain?.chainName
  const onAddChain = async () => {
    if (!isCompassWallet()) {
      try {
        mixpanel.track(EventName.ButtonClick, {
          buttonType: ButtonType.CHAIN_MANAGEMENT,
          buttonName: ButtonName.ADD_CHAIN_FROM_STORE,
          redirectURL: '/home',
          addedChainName: newAddChain?.chainName,
          time: Date.now() / 1000,
        })
      } catch (e) {
        captureException(e)
      }
    }

    setIsLoading(true)
    setChainInfos({ ...chainInfos, [newChainKey]: newAddChain })
    setChains({ ...chainInfos, [newChainKey]: newAddChain })
    rootStore.setChains({ ...chainInfos, [newChainKey]: newAddChain })
    await sleep(500)

    browser.storage.local.get([BETA_CHAINS]).then(async (resp) => {
      try {
        const updatedKeystore = await updateKeyStore(
          activeWallet as WalletKey,
          newChainKey,
          'UPDATE',
          newAddChain,
        )
        let betaChains = resp?.[BETA_CHAINS]
        betaChains = typeof betaChains === 'string' ? JSON.parse(betaChains) : {}
        betaChains[newChainKey] = newAddChain
        await browser.storage.local.set({ [BETA_CHAINS]: JSON.stringify(betaChains) })

        if (activeWallet) {
          await setActiveWallet(updatedKeystore[activeWallet.id] as WalletKey)
        }
        await setActiveChain(newChainKey, newAddChain)
        navigate('/')
      } catch (error) {
        setErrors((s) => ({ ...s, submit: 'Unable to add chain' }))
      } finally {
        setIsLoading(false)
      }
    })
  }

  return (
    <BottomModal
      isOpen={isVisible}
      onClose={onClose}
      closeOnBackdropClick={true}
      title='Add From Chain Store'
      hideActionButton
      secondaryActionButton={
        <div className='absolute top-[22px] left-7'>
          <Buttons.Back onClick={onClose} />
        </div>
      }
    >
      <div className='relative w-full flex flex-col justify-between items-center'>
        <div className='flex flex-col items-center'>
          <GenericCard
            title={<span className='text-[15px] truncate'>{newAddChain?.chainName ?? ''}</span>}
            className='py-8 mb-5'
            img={
              <img
                src={newAddChain?.chainSymbolImageUrl ?? defaultTokenLogo}
                className='h-10 w-10 mr-3'
                onError={imgOnError(defaultTokenLogo)}
              />
            }
            size='sm'
            isRounded
          />

          <div className='flex flex-col gap-y-[10px] bg-white-100 dark:bg-gray-900 rounded-2xl p-4 w-full'>
            <Key>Network Name</Key>
            <Value>{newAddChain?.chainName ?? ''}</Value>
            {Divider}
            <Key>Network URL</Key>
            <Value>{newAddChain?.apis?.rest || newAddChain?.apis?.restTest || ''}</Value>
            {Divider}
            <Key>Chain ID</Key>
            <Value>{newAddChain?.chainId ?? ''}</Value>
            {Divider}
            <Key>Currency Symbol</Key>
            <Value>{newAddChain?.denom ?? ''}</Value>
            {showMore && (
              <>
                {Divider}
                <Key>Coin Type</Key>
                <Value>{newAddChain?.bip44?.coinType ?? ''}</Value>
                {Divider}
                <Key>Address Prefix</Key>
                <Value>{newAddChain?.addressPrefix ?? ''}</Value>
                {Divider}
                <Key>Chain Registry Path</Key>
                <Value>{newAddChain?.chainRegistryPath ?? ''}</Value>
              </>
            )}
            <button
              className='text-xs font-bold text-gray-400 h-5 w-full text-left'
              style={{ color: '#726FDC' }}
              onClick={() => setShowMore(!showMore)}
            >
              {showMore ? 'Show less' : 'Show more'}
            </button>
          </div>

          <InfoCard
            message='Some wallet features may not work as expected for custom-added chains'
            className='my-6'
          />

          {errors.submit ? <ErrorCard text={errors.submit} /> : null}
        </div>

        <div className='w-full flex flex-col justify-center items-center box-border'>
          <div className='flex flex-row justify-between w-full'>
            <Buttons.Generic
              style={{
                height: '48px',
                background: theme === 'dark' ? Colors.gray900 : Colors.gray300,
                color: Colors.white100,
              }}
              onClick={handleCancel}
            >
              Cancel
            </Buttons.Generic>
            <Buttons.Generic
              style={{
                height: '48px',
                background: Colors.cosmosPrimary,
                color: Colors.white100,
              }}
              className='ml-3 bg-gray-800'
              onClick={onAddChain}
              disabled={isLoading || Object.values(errors).length > 0}
            >
              {isLoading ? <LoaderAnimation color={Colors.white100} /> : 'Add Chain'}
            </Buttons.Generic>
          </div>
        </div>
      </div>
    </BottomModal>
  )
}
