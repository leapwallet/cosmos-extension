/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BETA_NFT_CHAINS,
  BETA_NFTS_COLLECTIONS,
  NftChain,
  useAddress,
  useBetaNFTsCollectionsStore,
  useChainApis,
  useDisabledNFTsCollections,
  useNftChains,
  useNftChainsStore,
  useSelectedNetwork,
  useSetDisabledNFTsInStorage,
} from '@leapwallet/cosmos-wallet-hooks'
import { CosmWasmClientHandler } from '@leapwallet/cosmos-wallet-hooks/dist/utils/useCosmWasmClient'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { GenericCard, HeaderActionType } from '@leapwallet/leap-ui'
import BottomSheet from 'components/bottom-sheet/BottomSheet'
import { InputComponent } from 'components/input-component/InputComponent'
import { LoaderAnimation } from 'components/loader/Loader'
import Text from 'components/text'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useChainInfos } from 'hooks/useChainInfos'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import { SelectChainSheet } from 'pages/home/side-nav/CustomEndpoints'
import React, { useEffect, useRef, useState } from 'react'
import { getChainName } from 'utils/getChainName'
import { imgOnError } from 'utils/imgOnError'
import { isCompassWallet } from 'utils/isCompassWallet'
import Browser from 'webextension-polyfill'

import { useNftContext } from '../context'
import { ManageCollectionsProps, NftAvatar, NftToggleCard, Text as NftText } from './index'

type AddCollectionProps = Omit<ManageCollectionsProps, 'openAddCollectionSheet'>

export function AddCollection({ isVisible, onClose }: AddCollectionProps) {
  const chainInfos = useChainInfos()
  const activeChain = useActiveChain()
  const activeNetwork = useSelectedNetwork()
  const defaultTokenLogo = useDefaultTokenLogo()
  const timeoutIdRef = useRef<NodeJS.Timeout>()
  const { setTriggerRerender } = useNftContext()

  const [showSelectChain, setShowSelectChain] = useState(false)
  const [enteredCollection, setEnteredCollection] = useState('')
  const [selectedChain, setSelectedChain] = useState<SupportedChain>(
    isCompassWallet() ? activeChain : ('' as SupportedChain),
  )
  const [nftInfo, setNftInfo] = useState<{ [key: string]: any }>({})
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [fetchingCollectionInfo, setFetchingCollectionInfo] = useState(false)

  const nftChains = useNftChains()
  const disabledNFTsCollections = useDisabledNFTsCollections()
  const setDisabledNFTsCollections = useSetDisabledNFTsInStorage()
  const { setNftChains } = useNftChainsStore()
  const { setBetaNFTsCollections } = useBetaNFTsCollectionsStore()

  const chain = selectedChain ? selectedChain : activeChain
  let forceNetwork: 'testnet' | 'mainnet' =
    chainInfos[chain].chainId === chainInfos[chain].testnetChainId ? 'testnet' : 'mainnet'
  forceNetwork = isCompassWallet() ? activeNetwork : forceNetwork

  const activeAddress = useAddress(selectedChain)
  const { rpcUrl } = useChainApis(chain, forceNetwork)

  useEffect(() => {
    setSelectedChain(isCompassWallet() ? activeChain : ('' as SupportedChain))
  }, [activeChain])

  useEffect(() => {
    if (enteredCollection.length !== 0 && rpcUrl && selectedChain) {
      clearTimeout(timeoutIdRef.current)

      timeoutIdRef.current = setTimeout(async () => {
        try {
          setErrors({})
          setNftInfo({})
          setFetchingCollectionInfo(true)
          const client = await CosmWasmClientHandler.getClient(rpcUrl)

          const [tokenInfo, contractInfo] = await Promise.all([
            client.queryContractSmart(enteredCollection, {
              tokens: { owner: activeAddress, limit: 2 },
            }),
            client.queryContractSmart(enteredCollection, {
              contract_info: {},
            }),
          ])

          const tokens = tokenInfo?.tokens ?? tokenInfo?.ids ?? []
          if (tokens.length === 0) {
            setErrors((prevValue) => ({
              ...prevValue,
              noTokens: "Couldn't enable collection. You don't have any NFT in this collection.",
            }))
          }

          setNftInfo({ contractInfo, enable: false })
        } catch (error) {
          setErrors((prevValue) => ({ ...prevValue, collection: 'Invalid collection address.' }))
        } finally {
          setFetchingCollectionInfo(false)
        }
      }, 100)
    }
  }, [enteredCollection, activeAddress, rpcUrl, selectedChain])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim()
    setEnteredCollection(value)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (value && selectedChain === '') {
      setErrors({ selectedChain: 'Please select a chain' })
    } else {
      setErrors({})
    }
  }

  const handleToggleClick = async (isEnabled: boolean) => {
    setNftInfo((prevValue) => ({ ...prevValue, enable: isEnabled }))

    let _disabledNFTsCollections: string[] = []
    let hasToSetInfo = true

    if (isEnabled) {
      _disabledNFTsCollections = disabledNFTsCollections.filter(
        (collection) => collection !== enteredCollection,
      )

      const storage = await Browser.storage.local.get([BETA_NFTS_COLLECTIONS, BETA_NFT_CHAINS])
      if (storage[BETA_NFTS_COLLECTIONS]) {
        const parsedData = JSON.parse(storage[BETA_NFTS_COLLECTIONS])[selectedChain] ?? []

        if (parsedData.includes(enteredCollection)) {
          hasToSetInfo = false
        }
      }
    } else {
      _disabledNFTsCollections = [...disabledNFTsCollections, enteredCollection]
    }

    await setDisabledNFTsCollections(_disabledNFTsCollections)
    if (hasToSetInfo) {
      const storage = await Browser.storage.local.get([BETA_NFTS_COLLECTIONS, BETA_NFT_CHAINS])

      if (storage[BETA_NFTS_COLLECTIONS]) {
        const parsedData = JSON.parse(storage[BETA_NFTS_COLLECTIONS])

        await Browser.storage.local.set({
          [BETA_NFTS_COLLECTIONS]: JSON.stringify({
            ...parsedData,
            [selectedChain]: [...(parsedData[selectedChain] ?? []), enteredCollection],
          }),
        })

        setBetaNFTsCollections({
          ...parsedData,
          [selectedChain]: [...(parsedData[selectedChain] ?? []), enteredCollection],
        })
      } else {
        await Browser.storage.local.set({
          [BETA_NFTS_COLLECTIONS]: JSON.stringify({
            [selectedChain]: [enteredCollection],
          }),
        })

        setBetaNFTsCollections({
          [selectedChain]: [enteredCollection],
        })
      }

      const isANewChain = nftChains.every(
        (nftChain) => nftChain.forceContractsListChain !== selectedChain,
      )

      if (isANewChain) {
        const chain: NftChain = {
          forceNetwork,
          forceChain: selectedChain,
          forceContractsListChain: selectedChain,
        }

        await Browser.storage.local.set({
          [BETA_NFT_CHAINS]: JSON.stringify([
            ...JSON.parse(storage[BETA_NFT_CHAINS] ?? '[]'),
            chain,
          ]),
        })
        setNftChains([...nftChains, chain])
      }
      setTriggerRerender((prevValue) => !prevValue)
    }
  }

  return (
    <>
      <BottomSheet
        isVisible={isVisible}
        headerTitle='Add Collection'
        onClose={() => {
          onClose()
          setSelectedChain('' as SupportedChain)
          setEnteredCollection('')
          setNftInfo({})
          setErrors({})
        }}
        headerActionType={HeaderActionType.CANCEL}
        closeOnClickBackDrop={true}
      >
        <div className='w-full h-[320px] flex flex-col pt-6 pb-2 px-7 sticky top-[72px] bg-gray-50 dark:bg-black-100'>
          <GenericCard
            title={
              selectedChain ? getChainName(chainInfos[selectedChain].chainName) : 'Select Chain'
            }
            img={
              <img
                src={
                  selectedChain
                    ? chainInfos[selectedChain].chainSymbolImageUrl ?? defaultTokenLogo
                    : defaultTokenLogo
                }
                className='w-[28px] h-[28px] mr-2 border rounded-full dark:border-[#333333] border-[#cccccc]'
                onError={imgOnError(defaultTokenLogo)}
              />
            }
            isRounded={true}
            title2={selectedChain ? 'Chain' : ''}
            icon={<img className='w-[10px] h-[10px] ml-2' src={Images.Misc.RightArrow} />}
            onClick={() => setShowSelectChain(true)}
          />
          {errors?.selectedChain && enteredCollection.length > 0 && (
            <Text size='sm' color='text-red-300 mt-1 mb-2'>
              {errors?.selectedChain}
            </Text>
          )}

          <div className='rounded-2xl bg-white-100 dark:bg-gray-900 pt-4 px-4 pb-0 block my-4 w-full'>
            <InputComponent
              placeholder='Enter collection address'
              value={enteredCollection}
              name='collection'
              onChange={handleInputChange}
              error={errors.collection}
            />
          </div>

          {fetchingCollectionInfo && (
            <div className='flex items-center justify-center'>
              <LoaderAnimation color='#29a874' />
            </div>
          )}

          {Object.keys(nftInfo).length > 0 && (
            <NftToggleCard
              title={
                <NftText className='capitalize'>{nftInfo.contractInfo.name.toLowerCase()}</NftText>
              }
              size='md'
              avatar={<NftAvatar image='' />}
              isEnabled={nftInfo.enable}
              isRounded={true}
              onClick={
                errors.noTokens ? () => undefined : (isEnabled) => handleToggleClick(isEnabled)
              }
              className='roundex-2xl'
            />
          )}

          {errors.noTokens && (
            <Text size='sm' color='text-red-300 mt-4'>
              Couldn&apos;t enable collection. You don&apos;t have any NFT in this collection.
            </Text>
          )}
        </div>
      </BottomSheet>

      <SelectChainSheet
        chainsToShow={isCompassWallet() ? [chainInfos[activeChain].chainRegistryPath] : undefined}
        onPage='AddCollection'
        isVisible={showSelectChain}
        onClose={() => setShowSelectChain(false)}
        selectedChain={selectedChain}
        onChainSelect={(chaiName: SupportedChain) => {
          setSelectedChain(chaiName)
          setShowSelectChain(false)
        }}
      />
    </>
  )
}
