import { Key, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { getEthereumAddress, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { ActiveChainStore, ChainInfosStore } from '@leapwallet/cosmos-wallet-store'
import { KeyChain } from '@leapwallet/leap-keychain'
import { Buttons, Input, ThemeName, useTheme } from '@leapwallet/leap-ui'
import { Check, Wallet } from '@phosphor-icons/react'
import classNames from 'classnames'
import BottomModal from 'components/bottom-modal'
import { ErrorCard } from 'components/ErrorCard'
import IconButton from 'components/icon-button'
import { LEDGER_NAME_EDITED_SUFFIX, LEDGER_NAME_EDITED_SUFFIX_REGEX } from 'config/config'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { useChainPageInfo } from 'hooks'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { ChangeEventHandler, useEffect, useState } from 'react'
import { Colors } from 'theme/colors'
import { UserClipboard } from 'utils/clipboard'
import { sliceAddress } from 'utils/strings'

import { RemoveWallet } from './RemoveWallet'

type EditWalletFormProps = {
  wallet: Key
  isVisible: boolean
  // eslint-disable-next-line no-unused-vars
  onClose: (closeParent: boolean) => void
  activeChainStore: ActiveChainStore
  chainInfosStore: ChainInfosStore
}

export const EditWalletForm = observer(
  ({ isVisible, wallet, onClose, activeChainStore, chainInfosStore }: EditWalletFormProps) => {
    const [name, setName] = useState(wallet?.name ?? '')
    const [error, setError] = useState<string>('')
    const [isShowRemoveWallet, setShowRemoveWallet] = useState<boolean>(false)
    const { activeWallet, setActiveWallet } = useActiveWallet()
    const activeChain = activeChainStore.activeChain
    const [colorIndex, setColorIndex] = useState<number>(wallet?.colorIndex ?? 0)
    const isDark = useTheme().theme === ThemeName.DARK

    useEffect(() => {
      setError('')
      setName(wallet?.name ?? '')
      setColorIndex(wallet?.colorIndex ?? 0)
    }, [wallet, isVisible])

    const { topChainColor } = useChainPageInfo()
    const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
      setError('')
      if (e.target.value.length < 25) setName(e.target.value)
    }

    const handleSaveChanges = async () => {
      if (name) {
        try {
          const walletName =
            wallet.walletType === WALLETTYPE.LEDGER
              ? `${name.trim()}${LEDGER_NAME_EDITED_SUFFIX}`
              : name.trim()
          await KeyChain.EditWallet({
            walletId: wallet.id,
            name: walletName,
            colorIndex: colorIndex,
          })

          if (wallet.id === activeWallet?.id) {
            setActiveWallet({ ...activeWallet, name: walletName, colorIndex })
          }

          onClose(false)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          setError(error.message)
        }
      }
    }

    const getAddress = (chain: SupportedChain, wallet: Key) => {
      const evmChain = chainInfosStore.chainInfos[chain].evmOnlyChain
      if (evmChain) {
        return getEthereumAddress(wallet.addresses[chain])
      } else {
        return wallet.addresses[chain]
      }
    }

    return (
      <>
        <BottomModal
          containerDiv={document.getElementById('edit-wallet-container') ?? undefined}
          isOpen={isVisible}
          onClose={() => onClose(false)}
          title={'Edit wallet'}
          closeOnBackdropClick={true}
          secondaryActionButton={
            <div className='absolute top-[22px] left-7'>
              <IconButton
                onClick={() => {
                  setShowRemoveWallet(true)
                }}
                image={{ src: Images.Misc.DeleteRed, alt: ' ' }}
                data-testing-id='btn-remove-wallet-bin'
              />
            </div>
          }
        >
          <div className='flex flex-col  justify-center gap-y-[16px] items-center'>
            <div className='flex w-[344px] rounded-2xl flex-col dark:bg-gray-900 bg-white-100 items-center py-[24px] gap-y-[20px] px-4'>
              <div
                className='rounded-full'
                style={{ backgroundColor: Colors.walletColors[colorIndex] }}
              >
                <div className='p-[24px] text-white-100'>
                  <Wallet size={40} className='text-white-100' />
                </div>
              </div>

              {activeChain && activeChain !== AGGREGATED_CHAIN_KEY && wallet && (
                <Buttons.CopyWalletAddress
                  color={Colors.getChainColor(activeChain)}
                  walletAddress={sliceAddress(getAddress(activeChain, wallet))}
                  data-testing-id='copy-wallet-address'
                  style={{
                    backgroundColor: isDark ? '#383838' : '#E8E8E8',
                    color: !isDark ? '#383838' : '#E8E8E8',
                  }}
                  onCopy={() => {
                    UserClipboard.copyText(getAddress(activeChain, wallet))
                  }}
                />
              )}

              {wallet ? (
                <div className='flex relative justify-center shrink w-full'>
                  <Input
                    placeholder='Enter wallet Name'
                    maxLength={24}
                    value={name.replace(LEDGER_NAME_EDITED_SUFFIX_REGEX, '')}
                    onChange={handleInputChange}
                  />
                  <div className='absolute right-[16px] top-[14px] text-gray-400 text-sm font-medium'>{`${name.length}/24`}</div>
                </div>
              ) : null}

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
                        {index === colorIndex && <Check size={16} className='text-white-100' />}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {!!error && <ErrorCard text={error} />}
            <div className='flex shrink w-[344px]'>
              <Buttons.Generic disabled={!name} color={topChainColor} onClick={handleSaveChanges}>
                Save changes
              </Buttons.Generic>
            </div>
          </div>
        </BottomModal>

        {/* <RemoveWallet
          wallet={wallet}
          isVisible={isShowRemoveWallet}
          onClose={(action) => {
            setShowRemoveWallet(false)
            if (action) onClose(action)
          }}
        /> */}
      </>
    )
  },
)
