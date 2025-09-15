import {
  CosmosTxType,
  LeapWalletApi,
  useAddressStore,
  useFeatureFlags,
  useGetEvmGasPrices,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  bech32ToEthAddress,
  mintNft,
  NFTMetadata,
  simulateMintTx,
} from '@leapwallet/cosmos-wallet-sdk'
import { EvmBalanceStore } from '@leapwallet/cosmos-wallet-store'
import { EthWallet, Key } from '@leapwallet/leap-keychain'
import { CardDivider } from '@leapwallet/leap-ui'
import { CaretRight, CheckCircle, ShareNetwork } from '@phosphor-icons/react'
import classNames from 'classnames'
import LedgerConfirmationPopup from 'components/ledger-confirmation/LedgerConfirmationPopup'
import Text from 'components/text'
import { Button } from 'components/ui/button'
import { Separator } from 'components/ui/separator'
import { AnimatePresence, motion } from 'framer-motion'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import { CopySvg, getWalletIconAtIndex } from 'images/misc'
import loadingImage from 'lottie-files/swaps-btn-loading.json'
import Lottie from 'lottie-react'
import { observer } from 'mobx-react-lite'
import { Chip, NonFractionalizedNftDescription } from 'pages/nfts/components'
import React, { useCallback, useEffect, useState } from 'react'
import { chainInfoStore } from 'stores/chain-infos-store'
import { lightNodeStore } from 'stores/light-node-store'
import { Colors } from 'theme/colors'
import { UserClipboard } from 'utils/clipboard'
import { getChainName } from 'utils/getChainName'
import { isSidePanel } from 'utils/isSidePanel'
import { opacityFadeInOut, transition150 } from 'utils/motion-variants'
import { formatTokenAmount, sliceWord } from 'utils/strings'

const NFTDetails = ({
  showSuccess: _showSuccess,
  nftData,
}: {
  showSuccess?: boolean
  nftData: NFTMetadata
}) => {
  const [showSuccess, setShowSuccess] = useState(_showSuccess ?? false)
  const { data: featureFlags } = useFeatureFlags()

  const handleShare = async () => {
    const tweetText = featureFlags?.lightNodeNFT?.tweetText ?? ''
    const shareUrl = featureFlags?.lightNodeNFT?.tweetImageUrl ?? ''
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tweetText,
    )}&url=${encodeURIComponent(shareUrl)}`
    window.open(twitterShareUrl.toString(), '_blank')
  }

  useEffect(() => {
    setTimeout(() => {
      setShowSuccess(false)
    }, 5000)
  }, [])

  return (
    <div className='h-[calc(100%-116px)]'>
      <div className='flex flex-col gap-5 p-6 overflow-y-scroll h-full'>
        {showSuccess && (
          <div className='relative flex justify-between items-center bg-[#D6F3BC] rounded-xl pt-1 min-h-[41px] px-5 overflow-y-hidden'>
            <Text size='sm' color='text-gray-950' className='font-bold'>
              NFT minted successfully!
            </Text>
            <img src={Images.Misc.Lumi} width={55} height={60} className='mt-4' />
            <div className='w-full absolute bottom-0 left-0 h-1 bg-green-600 rounded-b-xl animate-progress' />
          </div>
        )}
        {nftData.animation_url ? (
          <video autoPlay loop playsInline muted className='rounded-xl' width={352} height={352}>
            <source type='video/mp4' src={nftData.animation_url} />
            Your browser does not support this video player.
          </video>
        ) : (
          <img
            src={nftData.image ?? Images.Logos.GenericDark}
            width={352}
            height={352}
            className='rounded-xl'
          />
        )}

        <div className='flex items-center justify-between'>
          <div className='flex flex-col flex-1'>
            <p
              className={classNames(
                'text-gray-800 dark:text-white-100 truncate max-w-[200px] text-lg font-bold',
                {
                  '!max-w-[160px]': isSidePanel(),
                },
              )}
            >
              {nftData.name}
            </p>
            {nftData?.tokenId && (
              <p
                className={classNames('text-gray-300 text-sm truncate max-w-[180px] text-base', {
                  '!max-w-[160px]': isSidePanel(),
                })}
                title={nftData.tokenId}
              >
                #{nftData.tokenId}
              </p>
            )}
          </div>

          <Chip className='bg-gray-100 dark:bg-gray-900 py-[3px] px-[7px] shrink-0'>
            <Chip.Image
              className='w-[24px] h-[24px]'
              src={chainInfoStore.chainInfos['forma'].chainSymbolImageUrl}
              alt={`${chainInfoStore.chainInfos['forma'].chainName.toLowerCase()} logo`}
            />
            <Chip.Text
              className='text-gray-800 dark:text-gray-300 text-sm max-w-[90px] truncate'
              title={getChainName(chainInfoStore.chainInfos['forma'].chainName)}
            >
              {getChainName(chainInfoStore.chainInfos['forma'].chainName)}
            </Chip.Text>
          </Chip>
        </div>

        <CardDivider />

        <div className=' flex justify-between items-center'>
          <button
            className={classNames(
              'rounded-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white-100 flex items-center justify-center flex-1 py-[12px] mr-[12px]',
              {
                'px-[30px]': !isSidePanel(),
                'px-[12px] flex-wrap': isSidePanel(),
              },
            )}
            onClick={handleShare}
          >
            <div className='flex gap-2 items-center'>
              <ShareNetwork size={20} className='text-black-100 dark:text-white-100' /> Share on X
            </div>
          </button>
        </div>
        <div>
          <NonFractionalizedNftDescription
            nftDetails={nftData}
            color={chainInfoStore.chainInfos['forma'].theme.primaryColor}
          />
        </div>
      </div>
    </div>
  )
}

const AlreadyMinted = ({
  nftData,
  mintedWallet,
}: {
  nftData?: NFTMetadata
  mintedWallet: Key<string> | null
}) => {
  const [isWalletAddressCopied, setIsWalletAddressCopied] = useState(false)
  const ethAddress = bech32ToEthAddress(mintedWallet?.addresses.forma ?? '')

  const handleCopyClick = useCallback(() => {
    setIsWalletAddressCopied(true)
    setTimeout(() => setIsWalletAddressCopied(false), 2000)
    UserClipboard.copyText(ethAddress)
  }, [ethAddress])

  const handleViewDetails = useCallback(async () => {
    let explorerUrl = 'https://explorer.forma.art/token/0xd4368164DEb9Dc170FC27FeAd657192EEe4eA57c'

    if (nftData?.tokenId) {
      explorerUrl += `/instance/${nftData.tokenId}`
    }

    window.open(explorerUrl, '_blank')
  }, [nftData?.tokenId])

  return (
    <div className='flex flex-col gap-5 items-center p-6'>
      <div className='flex flex-col rounded-xl bg-secondary-100'>
        <div className='flex flex-col items-center gap-5 pt-8 pb-0'>
          <img src={Images.Activity.TxSwapSuccess} width={72} height={72} />
          <span className='text-mdl font-bold text-center'>
            You&apos;ve already minted your NFT with another wallet.
          </span>
        </div>

        <Separator className='mt-6' />

        <div className='flex p-5 items-center gap-4'>
          <img src={getWalletIconAtIndex(mintedWallet?.colorIndex ?? 0)} width={44} height={44} />

          <div className='flex flex-col gap-1'>
            <span className='text-sm font-bold'>{mintedWallet?.name}</span>

            <AnimatePresence mode='wait'>
              {isWalletAddressCopied ? (
                <motion.div
                  key='copied'
                  initial='hidden'
                  animate='visible'
                  exit='hidden'
                  variants={opacityFadeInOut}
                  transition={transition150}
                  className='text-xs text-accent-success flex gap-1 items-center'
                >
                  <span>Copied</span>
                  <CheckCircle className='size-3.5' />
                </motion.div>
              ) : (
                <motion.div
                  key='address'
                  initial='hidden'
                  animate='visible'
                  exit='hidden'
                  variants={opacityFadeInOut}
                  transition={transition150}
                  onClick={handleCopyClick}
                  className='flex gap-1 cursor-pointer text-muted-foreground hover:text-foreground transition-colors'
                >
                  <span className='text-xs'>{sliceWord(ethAddress, 10, 5)}</span>
                  <CopySvg className='size-3.5' />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className='w-full flex flex-col gap-4 p-5 rounded-xl bg-secondary-100'>
        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium'>NFT preview</span>
          <div
            className='flex items-center gap-0.5 cursor-pointer text-accent-success hover:text-accent-success-200 transition-colors'
            onClick={handleViewDetails}
          >
            <span className='text-sm font-medium'>View details</span>
            <CaretRight size={12} />
          </div>
        </div>
        <img src={nftData?.image} className='w-[312px] h-[312px] rounded-xl' />
      </div>
    </div>
  )
}

export const LightNodeBanner = ({ title }: { title: string }) => {
  return (
    <div className='flex justify-between items-center bg-[#D6F3BC] rounded-xl pt-1.5 pb-1 px-5'>
      <span className='text-sm font-bold text-gray-950'>{title}</span>
      <img src={Images.Misc.Lumi} width={70} height={60} />
    </div>
  )
}

const LumisNFT = observer(
  ({
    isEligible,
    nftData,
    fetcher,
    evmBalanceStore,
    mintedWallet,
  }: {
    isEligible: boolean
    nftData?: NFTMetadata
    fetcher: () => Promise<void>
    evmBalanceStore: EvmBalanceStore
    mintedWallet: Key<string> | null
  }) => {
    const getWallet = Wallet.useGetWallet()
    const txPostToDB = LeapWalletApi.useOperateCosmosTx()
    const { gasPrice } = useGetEvmGasPrices('forma')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const eligibleToMint = isEligible && lightNodeStore.isLightNodeRunning
    const [showSuccess, setShowSuccess] = useState(false)
    const { primaryAddress } = useAddressStore()
    const { activeWallet } = useActiveWallet()
    const [showLedgerPopup, setShowLedgerPopup] = useState(false)
    const [gasLimit, setGasLimit] = useState(0)
    const nativeDenom = Object.values(chainInfoStore.chainInfos['forma'].nativeDenoms)[0]
    const evmBalance = evmBalanceStore.evmBalanceForChain('forma', undefined, undefined)
    const nativeBalance = evmBalance.find(
      (token) => token.chain === 'forma' && token.coinMinimalDenom === nativeDenom.coinMinimalDenom,
    )
    const fees = (gasLimit * gasPrice.low) / 10 ** nativeDenom.coinDecimals

    const handleMintClick = async () => {
      try {
        setLoading(true)
        const wallet = await getWallet('forma', true)
        if (activeWallet?.walletType === WALLETTYPE.LEDGER) {
          setShowLedgerPopup(true)
        }
        const address = (await wallet.getAccounts())[0].address
        const txHash = await mintNft(
          primaryAddress,
          address,
          wallet as unknown as EthWallet,
          gasLimit,
          gasPrice.low,
        )

        if (txHash) {
          await fetcher()
          setShowSuccess(true)
          await txPostToDB({
            txHash,
            txType: CosmosTxType.NFTMint,
            forceWalletAddress: bech32ToEthAddress(address),
            forcePrimaryAddress: primaryAddress,
            forceChain: 'forma',
            forceNetwork: 'mainnet',
            feeDenomination: nativeDenom.coinMinimalDenom,
            feeQuantity: (gasLimit * gasPrice.low).toString(),
          })
        } else {
          throw new Error('Something went wrong')
        }
      } catch (error: any) {
        setError(
          error.code === 'INSUFFICIENT_FUNDS'
            ? 'Insufficient funds for fees'
            : 'Something went wrong',
        )
        setTimeout(() => {
          setError('')
        }, 7000)
      } finally {
        setLoading(false)
        setShowLedgerPopup(false)
      }
    }

    const simulateTx = useCallback(async () => {
      if (!activeWallet?.addresses.forma) return
      const value = await simulateMintTx(primaryAddress, activeWallet?.addresses.forma ?? '')
      setGasLimit(value)
    }, [activeWallet?.addresses.forma, primaryAddress])

    useEffect(() => {
      if (!mintedWallet && !nftData && eligibleToMint) {
        simulateTx()
      }
    }, [eligibleToMint, mintedWallet, nftData, simulateTx])

    useEffect(() => {
      if (nativeBalance?.amount && fees > 0 && +nativeBalance.amount < fees) {
        setError('Insufficient funds for fees')
      }
    }, [fees, nativeBalance?.amount])

    if (mintedWallet && nftData) {
      return <AlreadyMinted nftData={nftData} mintedWallet={mintedWallet} />
    }

    if (nftData) {
      return <NFTDetails showSuccess={showSuccess} nftData={nftData} />
    }

    return (
      <div>
        <div
          className={classNames('flex flex-col gap-5 p-6 overflow-y-scroll', {
            'h-[calc(100%-80px)]': !error,
            'h-[calc(100%-136px)]': !!error,
          })}
        >
          <LightNodeBanner
            title={
              lightNodeStore.isLightNodeRunning
                ? 'You can mint your exclusive Lumi NFT now!'
                : `${
                    !lightNodeStore.lastSyncedInfo?.lastSyncedHeader ? 'Run a' : 'Resume your'
                  } Light node to unlock your exclusive Lumi NFT`
            }
          />

          <img src={Images.Misc.LumiCover} />

          {eligibleToMint && (
            <div className='flex flex-col items-center gap-2 text-center'>
              <span className='text-2xl font-bold'>Introducing Lumis!</span>
              <span className='text-sm font-medium text-muted-foreground'>
                Lumis are flying companions for the amazing Celestia Mammoths. Your Lumi will grow &
                evolve as you run a light node.
              </span>
            </div>
          )}
        </div>

        <div className='flex flex-col items-center gap-3 p-4 bg-secondary-100'>
          {error && (
            <span className='text-xs font-medium text-orange-300'>
              You need {formatTokenAmount(fees.toString(), nativeDenom.coinDenom, 4)} on Forma to
              mint your Lumi NFT!
            </span>
          )}

          <Button
            className='w-full'
            onClick={handleMintClick}
            disabled={!eligibleToMint || !!error || loading || gasLimit === 0}
          >
            {loading ? (
              <Lottie
                loop={true}
                autoplay={true}
                animationData={loadingImage}
                rendererSettings={{
                  preserveAspectRatio: 'xMidYMid slice',
                }}
                className={'h-[28px] w-[28px]'}
              />
            ) : error ? (
              error
            ) : (
              'Mint now'
            )}
          </Button>

          {error && (
            <div className='flex items-center gap-1.5 mt-2'>
              <span className='text-xs font-medium text-gray-700 dark:text-gray-200'>
                Don&apos;t have TIA on Forma?
              </span>
              <a
                target='_blank'
                rel='noreferrer noopener'
                href='https://bridge.forma.art/'
                className='flex items-center gap-0.5 cursor-pointer text-accent-success hover:text-accent-success-200 transition-colors'
              >
                <span className='text-xs font-bold'>Bridge now</span>
                <CaretRight className='font-bold' size={12} />
              </a>
            </div>
          )}
        </div>
        {showLedgerPopup && (
          <LedgerConfirmationPopup
            showLedgerPopup={showLedgerPopup}
            onCloseLedgerPopup={() => setShowLedgerPopup(false)}
          />
        )}
      </div>
    )
  },
)

export default LumisNFT
