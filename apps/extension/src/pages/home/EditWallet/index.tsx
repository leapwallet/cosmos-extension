import { Key, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import {
  getEthereumAddress,
  pubKeyToEvmAddressToShow,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { ActiveChainStore, ChainInfosStore } from '@leapwallet/cosmos-wallet-store'
import { KeyChain } from '@leapwallet/leap-keychain'
import { Check, TrashSimple } from '@phosphor-icons/react'
import classNames from 'classnames'
import { ErrorCard } from 'components/ErrorCard'
import BottomModal from 'components/new-bottom-modal'
import { Button } from 'components/ui/button'
import { Input } from 'components/ui/input'
import { LEDGER_NAME_EDITED_SUFFIX, LEDGER_NAME_EDITED_SUFFIX_REGEX } from 'config/config'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { getWalletIconAtIndex } from 'images/misc'
import { observer } from 'mobx-react-lite'
import React, { ChangeEventHandler, useEffect, useMemo, useState } from 'react'
import { Colors } from 'theme/colors'

import { RemoveWallet } from '../RemoveWallet'
import { CopyButton } from './copy-address'

type EditWalletFormProps = {
  wallet: Key
  isVisible: boolean
  // eslint-disable-next-line no-unused-vars
  onClose: (closeParent: boolean) => void
  activeChainStore: ActiveChainStore
  chainInfoStore: ChainInfosStore
}

export const EditWalletForm = observer(
  ({ isVisible, wallet, onClose, activeChainStore, chainInfoStore }: EditWalletFormProps) => {
    const [name, setName] = useState(wallet?.name ?? '')
    const [error, setError] = useState<string>('')
    const [isShowRemoveWallet, setShowRemoveWallet] = useState<boolean>(false)
    const { activeWallet, setActiveWallet } = useActiveWallet()
    const activeChain = activeChainStore.activeChain
    const [colorIndex, setColorIndex] = useState<number>(wallet?.colorIndex ?? 0)

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
      if (name && wallet) {
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

    const address = useMemo(() => {
      if (activeChain === 'aggregated' || !wallet) return ''
      const evmChain = chainInfoStore.chainInfos[activeChain].evmOnlyChain
      if (evmChain) {
        if (wallet.addresses[activeChain]) {
          return getEthereumAddress(wallet.addresses[activeChain])
        } else {
          return ''
        }
      } else {
        return wallet.addresses[activeChain]
      }
    }, [activeChain, chainInfoStore.chainInfos, wallet])

    return (
      <>
        <BottomModal
          fullScreen
          isOpen={isVisible}
          onClose={() => onClose(false)}
          title={'Edit wallet'}
          className='max-h-none'
          footerComponent={
            <>
              <Button
                size={'md'}
                variant={'secondary'}
                className='flex-1'
                disabled={!name}
                onClick={() => onClose(false)}
              >
                Cancel
              </Button>
              <Button size={'md'} className='flex-1' disabled={!name} onClick={handleSaveChanges}>
                Save changes
              </Button>
            </>
          }
          secondaryActionButton={
            <Button
              variant={'ghost'}
              size={'icon'}
              className='size-12 text-destructive-100 hover:text-destructive-200'
              data-testing-id='btn-remove-wallet-bin'
              onClick={() => setShowRemoveWallet(true)}
              title='Remove wallet'
            >
              <TrashSimple weight='fill' size={18} />
            </Button>
          }
        >
          <div className='flex p-4 mb-4 rounded-2xl flex-col bg-secondary-50 items-center gap-y-4'>
            <img
              src={wallet?.avatar ?? getWalletIconAtIndex(colorIndex)}
              alt='wallet-icon'
              className='size-20'
            />

            {address && <CopyButton address={address} />}

            {wallet ? (
              <Input
                autoFocus
                placeholder='Enter wallet Name'
                maxLength={24}
                value={name.replace(LEDGER_NAME_EDITED_SUFFIX_REGEX, '')}
                onChange={handleInputChange}
                className='ring-accent-green-200 h-12'
                trailingElement={
                  <div className='text-muted-foreground text-sm font-medium'>{`${name.length}/24`}</div>
                }
              />
            ) : null}

            <div className='flex items-center gap-x-[8px] justify-center'>
              {Colors.walletColors.map((color, index) => {
                return (
                  <div
                    key={index}
                    onClick={() => {
                      setColorIndex(index)
                    }}
                    className={classNames('p-[4px] rounded-full cursor-pointer', {
                      'border-2': colorIndex === index,
                    })}
                    style={{ borderColor: color }}
                  >
                    <div
                      className={classNames(
                        'flex items-center justify-center rounded-full w-[16px] h-[16px]',
                      )}
                      style={{ backgroundColor: color }}
                    >
                      {index === colorIndex && <Check size={12} className='text-white-100' />}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {!!error && <ErrorCard className='mx-3' text={error} />}
        </BottomModal>

        <RemoveWallet
          wallet={wallet}
          address={address}
          isVisible={isShowRemoveWallet}
          onClose={(action) => {
            setShowRemoveWallet(false)
            if (action) onClose(action)
          }}
        />
      </>
    )
  },
)
