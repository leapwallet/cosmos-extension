import { Key, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { KeyChain } from '@leapwallet/leap-keychain'
import { Buttons, Header, HeaderActionType, Input, ThemeName, useTheme } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import { ErrorCard } from 'components/ErrorCard'
import IconButton from 'components/icon-button'
import { LEDGER_NAME_EDITED_SUFFIX, LEDGER_NAME_EDITED_SUFFIX_REGEX } from 'config/config'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { Images } from 'images'
import React, { ChangeEventHandler, useEffect, useState } from 'react'
import { Colors } from 'theme/colors'
import { UserClipboard } from 'utils/clipboard'
import { formatWalletName } from 'utils/formatWalletName'
import { sliceAddress } from 'utils/strings'

import BottomSheet from '../../components/bottom-sheet/BottomSheet'
import { RemoveWallet } from './RemoveWallet'

type EditWalletFormProps = {
  wallet: Key
  isVisible: boolean
  // eslint-disable-next-line no-unused-vars
  onClose: (closeParent: boolean) => void
}

export function EditWalletForm({ isVisible, wallet, onClose }: EditWalletFormProps) {
  const [name, setName] = useState(wallet?.name ?? '')
  const [error, setError] = useState<string>('')
  const [isShowRemoveWallet, setShowRemoveWallet] = useState<boolean>(false)
  const { activeWallet, setActiveWallet } = useActiveWallet()
  const activeChain = useActiveChain()
  const [colorIndex, setColorIndex] = useState<number>(wallet?.colorIndex ?? 0)
  const isDark = useTheme().theme === ThemeName.DARK

  useEffect(() => {
    setError('')
    setName(wallet?.name ?? '')
    setColorIndex(wallet?.colorIndex ?? 0)
  }, [wallet, isVisible])

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
                data-testing-id='btn-remove-wallet-bin'
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
                onCopy={() => {
                  UserClipboard.copyText(wallet.addresses[activeChain])
                }}
              />
            )}
            {wallet ? (
              <div className='flex relative justify-center shrink w-[312px]'>
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
                      {index === colorIndex && (
                        <div className='material-icons-round text-white-100'>check</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          {!!error && <ErrorCard text={error} />}
          <div className='flex shrink w-[344px]'>
            <Buttons.Generic
              disabled={!name}
              color={Colors.getChainColor(activeChain)}
              onClick={handleSaveChanges}
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
