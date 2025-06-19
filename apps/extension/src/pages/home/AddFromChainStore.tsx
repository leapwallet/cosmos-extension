import { Key as WalletKey, useChainsStore } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfo, sleep } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, GenericCard, useTheme } from '@leapwallet/leap-ui'
import { captureException } from '@sentry/react'
import { Divider, KeyNew as Key, ValueNew as Value } from 'components/dapp'
import { ErrorCard } from 'components/ErrorCard'
import { InfoCard } from 'components/info-card'
import { LoaderAnimation } from 'components/loader/Loader'
import BottomModal from 'components/new-bottom-modal'
import { Button } from 'components/ui/button'
import { ButtonName, ButtonType, EventName } from 'config/analytics'
import { BETA_CHAINS } from 'config/storage-keys'
import { useSetActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet, { useUpdateKeyStore } from 'hooks/settings/useActiveWallet'
import { useChainInfos } from 'hooks/useChainInfos'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import mixpanel from 'mixpanel-browser'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { chainTagsStore } from 'stores/chain-infos-store'
import { rootStore } from 'stores/root-store'
import { Colors } from 'theme/colors'
import { imgOnError } from 'utils/imgOnError'
import browser from 'webextension-polyfill'

type AddFromChainStoreProps = {
  readonly isVisible: boolean
  readonly onClose: VoidFunction
  newAddChain: ChainInfo
  skipUpdatingActiveChain?: boolean
  successCallback?: () => void
}

const AddFromChainStore = observer(
  ({
    isVisible,
    onClose,
    newAddChain,
    skipUpdatingActiveChain,
    successCallback,
  }: AddFromChainStoreProps) => {
    const [showMore, setShowMore] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<{ [key: string]: string }>({})

    const defaultTokenLogo = useDefaultTokenLogo()
    const setChains = useChainsStore((store) => store.setChains)
    const updateKeyStore = useUpdateKeyStore()
    const { activeWallet, setActiveWallet } = useActiveWallet()
    const setActiveChain = useSetActiveChain()
    const chainInfos = useChainInfos()
    const navigate = useNavigate()
    const { theme } = useTheme()

    const isEvmChain = useMemo(() => !!newAddChain && 'evmOnlyChain' in newAddChain, [newAddChain])

    const networkUrl = useMemo(() => {
      if (!newAddChain) {
        return
      }
      if (isEvmChain) {
        return newAddChain.apis?.evmJsonRpcTest ?? newAddChain.apis?.evmJsonRpc
      }
      return newAddChain.apis?.restTest ?? newAddChain.apis?.rest
    }, [isEvmChain, newAddChain])

    const newChainKey = newAddChain?.key ?? newAddChain?.chainName

    const handleCancel = useCallback(() => {
      onClose()
    }, [onClose])

    const onAddChain = async () => {
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

      setIsLoading(true)
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

          if (isEvmChain) {
            chainTagsStore.setBetaChainTags(newAddChain.chainId, ['EVM'])
          } else {
            chainTagsStore.setBetaChainTags(newAddChain.chainId, ['Cosmos'])
          }

          if (!skipUpdatingActiveChain) {
            if (activeWallet) {
              await setActiveWallet(updatedKeystore[activeWallet.id] as WalletKey)
            }
            await setActiveChain(newChainKey, newAddChain)
            navigate('/')
          }
          successCallback?.()
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
        fullScreen
        title='Add from chain store'
        hideActionButton
        className='!h-[calc(100%-61px)] p-0 overflow-y-hidden'
        secondaryActionButton={
          <div className='absolute top-[22px] left-7'>
            <Buttons.Back onClick={onClose} />
          </div>
        }
      >
        <div className='h-full w-full flex flex-col justify-between items-center overflow-y-auto pt-6 px-6'>
          <div className='flex flex-col items-center pb-[92px]'>
            <div className='flex flex-row items-center gap-x-4 w-full mb-6'>
              <img
                src={newAddChain?.chainSymbolImageUrl ?? defaultTokenLogo}
                className='h-[54px] w-[54px] rounded-full'
                onError={imgOnError(defaultTokenLogo)}
              />
              <span className='text-lg !leading-[27px] font-bold text-foreground truncate'>
                {newAddChain?.chainName || '--'}
              </span>
            </div>

            <div className='flex flex-col gap-4 bg-secondary-100 rounded-xl p-5 w-full'>
              <div className='flex flex-col gap-[6px]'>
                <Key>Network Name</Key>
                <Value>{newAddChain?.chainName || '--'}</Value>
              </div>

              {Divider}

              <div className='flex flex-col gap-[6px]'>
                <Key>Network URL</Key>
                <Value>{networkUrl || '--'}</Value>
              </div>

              {Divider}

              <div className='flex flex-col gap-[6px]'>
                <Key>Chain ID</Key>
                <Value>{newAddChain?.chainId || '--'}</Value>
              </div>

              {Divider}

              <div className='flex flex-col gap-[6px]'>
                <Key>Currency Symbol</Key>
                <Value>{newAddChain?.denom || '--'}</Value>
              </div>
              {showMore && (
                <>
                  {Divider}
                  <div className='flex flex-col gap-[6px]'>
                    <Key>Coin Type</Key>
                    <Value>{newAddChain?.bip44?.coinType || '--'}</Value>
                  </div>

                  {!isEvmChain ? (
                    <>
                      {Divider}
                      <div className='flex flex-col gap-[6px]'>
                        <Key>Address Prefix</Key>
                        <Value>{newAddChain?.addressPrefix || '--'}</Value>
                      </div>

                      {Divider}

                      <div className='flex flex-col gap-[6px]'>
                        <Key>Chain Registry Path</Key>
                        <Value>{newAddChain?.chainRegistryPath || '--'}</Value>
                      </div>
                    </>
                  ) : null}
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
        </div>

        <div className='w-full items-center box-border sticky bottom-0 py-5 px-6 bg-secondary-100 flex flex-row gap-4 justify-between'>
          <Button
            className='flex-1 flex flex-row justify-center items-center text-secondary-100 hover:bg-foreground bg-foreground font-bold'
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            className='flex-1 text-foreground'
            onClick={onAddChain}
            disabled={isLoading || Object.values(errors).length > 0}
          >
            {isLoading ? <LoaderAnimation color={Colors.white100} /> : 'Add Chain'}
          </Button>
        </div>
      </BottomModal>
    )
  },
)

export default AddFromChainStore
