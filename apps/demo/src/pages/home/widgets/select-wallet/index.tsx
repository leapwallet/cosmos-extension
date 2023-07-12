import { ChainInfos } from '@leapwallet/cosmos-wallet-sdk'
import { HeaderActionType, WalletCard } from '@leapwallet/leap-ui'
import React, { useMemo, useState } from 'react'

import BottomSheet from '~/components/bottom-sheet'
import CardDivider from '~/components/card-divider'
import Text from '~/components/text'
import { useActiveChain } from '~/hooks/settings/use-active-chain'
import {
  CustomWallet,
  useActiveWallet,
  useSetActiveWalletId,
  useWallets,
} from '~/hooks/wallet/use-wallet'
import { Images } from '~/images'
import { sliceAddress } from '~/util/strings'

import { NewWalletForm } from './create-new-wallet'
import { EditWalletForm } from './edit-wallet'
import ImportWalletForm from './import-wallet'

type SelectWalletProps = {
  readonly isVisible: boolean
  readonly onClose: VoidFunction
  readonly title: string
  readonly currentWalletInfo?: {
    wallets: [CustomWallet]
    chainIds: [string]
    origin: string
  } | null
}

export default function SelectWallet({
  isVisible,
  onClose,
  title,
  currentWalletInfo,
}: SelectWalletProps) {
  const [isNewWalletFormVisible, setIsNewWalletFormVisible] = useState(false)
  const [isImportWalletVisible, setIsImportWalletVisible] = useState(false)
  const [isEditWalletVisible, setIsEditWalletVisible] = useState(false)

  const activeChain = useActiveChain()
  const activeWallet = useActiveWallet()
  const setActiveWalletId = useSetActiveWalletId()
  const [editWallet, setEditWallet] = useState<CustomWallet>()
  const wallets = useWallets()

  const walletsList = useMemo(() => {
    return wallets ? Object.values(wallets).map((wallet) => wallet) : []
  }, [wallets])

  const walletName = activeWallet.name
  const walletColorIndex = activeWallet.colorIndex

  return (
    <>
      <BottomSheet
        isVisible={isVisible}
        onClose={onClose}
        headerTitle={title}
        headerActionType={HeaderActionType.CANCEL}
        closeOnClickBackDrop={true}
      >
        <div className='mb-[40px]'>
          {currentWalletInfo && (
            <div className='flex flex-col rounded-2xl bg-white-100 dark:bg-gray-900 min-h-[100px] justify-center items-center p-2 mx-7 mt-4'>
              <div className='pt-8 pb-2 flex flex-row'>
                <img
                  src={Images.Misc.getWalletIconAtIndex(walletColorIndex)}
                  className='z-10 border-2 border-gray-900 rounded-full relative left-2'
                />
                <object
                  data={`${currentWalletInfo?.origin}/favicon.ico`}
                  type='image/png'
                  className='relative -left-2 z-0'
                >
                  <img src={Images.Misc.DefaultWebsiteIcon} alt='Website default icon' />
                </object>
              </div>
              <Text size='md' color='text-green-600' className='font-bold my-2'>
                Awesome Site
              </Text>
              <Text size='xl' className='my-0 font-extrabold'>
                {walletName} not Connected
              </Text>
              <Text
                size='xs'
                style={{ textAlign: 'center' }}
                className='mb-2'
                color='text-gray-400'
              >
                You can connect this wallet, or can switch to an already connected wallet.
              </Text>
              <div
                onClick={console.log}
                style={{ background: 'rgba(225, 136, 129, 0.1)', color: '#E18881' }}
                className='font-bold p-1 px-2 rounded-2xl cursor-pointer my-2'
              >
                Connect {walletName}
              </div>
            </div>
          )}
          <div className='flex flex-col rounded-2xl bg-white-100 dark:bg-gray-900 max-h-[250px] overflow-y-auto mx-7 mt-7 mb-4 pt-2'>
            {walletsList
              .sort((a, b) => a.addressIndex - b.addressIndex)
              .map((wallet, index, array) => {
                const isLast = index === array.length - 1
                if (wallet.id === currentWalletInfo?.wallets?.[0]?.id) return null

                return (
                  <div className='relative min-h-[56px]' key={wallet.id}>
                    <WalletCard
                      onClick={() => {
                        setActiveWalletId(wallet.id)
                        onClose()
                      }}
                      key={wallet.name}
                      title={wallet.name}
                      icon={
                        <div
                          className='flex h-[56px] w-[56px] hover:cursor-pointer justify-center text-gray-400 items-center bg-white-100 dark:bg-gray-900 material-icons-round'
                          onClick={() => {
                            setEditWallet(wallet)
                            setIsEditWalletVisible(true)
                          }}
                        >
                          more_horiz
                        </div>
                      }
                      subtitle={`${sliceAddress(wallet.addresses[activeChain])} · Imported`}
                      isSelected={activeWallet.id === wallet.id}
                      imgSrc={Images.Misc.getWalletIconAtIndex(wallet.colorIndex)}
                      color={ChainInfos[activeChain].theme.primaryColor}
                      isRounded={true}
                    />
                    {!isLast ? <CardDivider /> : null}
                  </div>
                )
              })}
          </div>
          <div className='bg-white-100 dark:bg-gray-900 rounded-2xl py-4 mx-7 mb-4'>
            <div
              onClick={() => {
                setIsNewWalletFormVisible(true)
              }}
              className='flex items-center px-4 pb-4 bg-white-100 dark:bg-gray-900 cursor-pointer'
            >
              <span className='material-icons-round text-gray-400 mr-4'>add_circle</span>
              <Text size='md' className='font-bold'>
                Create new wallet
              </Text>
            </div>
            <CardDivider />
            <div
              onClick={() => {
                setIsImportWalletVisible(true)
              }}
              className='flex items-center px-4 pt-4 bg-white-100 dark:bg-gray-900 cursor-pointer'
            >
              <span className='material-icons-round text-gray-400 mr-4'>download</span>
              <Text size='md' className='font-bold'>
                Import an existing wallet
              </Text>
            </div>
          </div>
          <div
            onClick={console.log}
            className='flex items-center px-4 py-4 bg-white-100 dark:bg-gray-900 cursor-pointer mx-7 rounded-2xl'
          >
            <span className='material-icons-round text-gray-400 mr-4'>usb</span>
            <Text size='md' className='font-bold'>
              Connect Ledger
            </Text>
          </div>
        </div>
      </BottomSheet>
      <EditWalletForm
        wallet={editWallet}
        isVisible={isEditWalletVisible}
        onClose={() => {
          setIsEditWalletVisible(false)
        }}
      />
      <NewWalletForm
        isVisible={isNewWalletFormVisible}
        onClose={(closeSelectWallet: boolean) => {
          if (closeSelectWallet) {
            onClose()
          }
          setIsNewWalletFormVisible(false)
        }}
      />
      <ImportWalletForm
        isVisible={isImportWalletVisible}
        onClose={(closeSelectWallet: boolean) => {
          if (closeSelectWallet) {
            onClose()
          }
          setIsImportWalletVisible(false)
        }}
      />
    </>
  )
}
