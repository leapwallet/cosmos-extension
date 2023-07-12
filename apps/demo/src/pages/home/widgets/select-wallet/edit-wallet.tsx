import { ChainInfos, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, Header, HeaderActionType, Input, ThemeName, useTheme } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'

import BottomSheet from '~/components/bottom-sheet'
import IconButton from '~/components/icon-button'
import { useActiveChain } from '~/hooks/settings/use-active-chain'
import { CustomWallet } from '~/hooks/wallet/use-wallet'
import { Images } from '~/images'
import { Colors } from '~/theme/colors'
import { sliceAddress } from '~/util/strings'

import { RemoveWallet } from './remove-wallet'

type EditWalletFormProps = {
  wallet: CustomWallet
  isVisible: boolean
  onClose: (closeParent: boolean) => void
}

export function EditWalletForm({ isVisible, wallet, onClose }: EditWalletFormProps) {
  const [name, setName] = useState(wallet?.name ?? '')
  const [isShowRemoveWallet, setShowRemoveWallet] = useState<boolean>(false)
  const activeChain = useActiveChain() as SupportedChain
  const [colorIndex, setColorIndex] = useState<number>(0)
  const isDark = useTheme().theme === ThemeName.DARK

  useEffect(() => {
    setName(wallet?.name ?? '')
    setColorIndex(0)
  }, [wallet, isVisible])

  return (
    <>
      <BottomSheet
        isVisible={isVisible}
        onClose={() => onClose(false)}
        headerTitle={'Edit wallet'}
        headerActionType={HeaderActionType.CANCEL}
        closeOnClickBackDrop={true}
        customHeader={(toggle) => (
          <div className='relative'>
            <Header
              title={'Edit Wallet'}
              action={{
                type: HeaderActionType.CANCEL,
                onClick: toggle,
              }}
            />
            <div className='absolute p-[3px] hover:cursor-pointer right-[20px] top-[20px]'>
              <IconButton
                onClick={() => {
                  setShowRemoveWallet(true)
                }}
                image={{ src: Images.Misc.DeleteRed, alt: ' ' }}
              />
            </div>
          </div>
        )}
      >
        <div className='flex flex-col  justify-center gap-y-[16px] items-center p-[28px]'>
          <div className='flex w-[344px] rounded-2xl flex-col dark:bg-gray-900 bg-white-100 items-center py-[24px] gap-y-[20px] px-[16]'>
            <div
              className='rounded-full'
              style={{ backgroundColor: Colors.walletColors[colorIndex] }}
            >
              <div
                className='p-[24px] material-icons-round text-white-100'
                style={{ fontSize: 40 }}
              >
                account_balance_wallet
              </div>
            </div>

            {activeChain && wallet && (
              <Buttons.CopyWalletAddress
                color={Colors.getChainColor(activeChain)}
                walletAddress={sliceAddress(wallet.addresses[activeChain])}
                data-testing-id='copy-wallet-address'
                style={{
                  backgroundColor: isDark ? '#383838' : '#E8E8E8',
                  color: !isDark ? '#383838' : '#E8E8E8',
                }}
                onCopy={async () => {
                  await navigator.clipboard.writeText(wallet.addresses[activeChain])
                }}
              />
            )}
            <div className='flex relative justify-center shrink w-[312px]'>
              <Input
                placeholder='Enter wallet Name'
                maxLength={24}
                value={name}
                onChange={(e) => {
                  if (e.target.value.length < 25) setName(e.target.value)
                }}
              />
              <div className='absolute right-[16px] top-[14px] text-gray-400 text-sm font-medium'>{`${name.length}/24`}</div>
            </div>
            <div className='flex items-center gap-x-[8px] justify-center'>
              {Colors.walletColors.map((color, index) => {
                return (
                  <div
                    key={index}
                    onClick={() => {
                      setColorIndex(index)
                    }}
                    className={classNames('p-[5px] rounded-full', {
                      'border-2': colorIndex === index,
                    })}
                    style={{ borderColor: color }}
                  >
                    <div
                      className={classNames(
                        'flex items-center justify-center rounded-full w-[24px] h-[24px]',
                      )}
                      style={{ backgroundColor: color }}
                    >
                      {index === colorIndex && (
                        <div className='material-icons-round text-white-100'>check</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className='flex shrink w-[344px]'>
            <Buttons.Generic
              disabled={!name}
              color={ChainInfos[activeChain].theme.primaryColor}
              onClick={console.log}
            >
              Save changes
            </Buttons.Generic>
          </div>
        </div>
      </BottomSheet>
      <RemoveWallet
        wallet={wallet}
        isVisible={isShowRemoveWallet}
        onClose={(action) => {
          setShowRemoveWallet(false)
          if (action) onClose(action)
        }}
      />
    </>
  )
}
