import {
  Key,
  useActiveChain,
  useChainInfo,
  useGetChains,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import { pubKeyToEvmAddressToShow } from '@leapwallet/cosmos-wallet-sdk'
import { CardDivider, WalletCard } from '@leapwallet/leap-ui'
import { DotsThree } from '@phosphor-icons/react'
import { LEDGER_NAME_EDITED_SUFFIX_REGEX } from 'config/config'
import { AGGREGATED_CHAIN_KEY, walletLabels } from 'config/constants'
import { useChainPageInfo } from 'hooks'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useMemo } from 'react'
import { AggregatedSupportedChain } from 'types/utility'
import { formatWalletName } from 'utils/formatWalletName'
import { isLedgerEnabled } from 'utils/isLedgerEnabled'

import Text from '../../components/text'
import useActiveWallet from '../../hooks/settings/useActiveWallet'
import { sliceAddress } from '../../utils/strings'

const WalletCardWrapper = observer(
  ({
    isLast,
    wallet,
    onClose,
    setEditWallet,
    setIsEditWalletVisible,
  }: {
    isLast: boolean
    wallet: Key
    onClose: () => void
    setEditWallet: (wallet: Key) => void
    setIsEditWalletVisible: (visible: boolean) => void
  }) => {
    const activeChainInfo = useChainInfo()
    const activeChain = useActiveChain() as AggregatedSupportedChain
    const { activeWallet, setActiveWallet } = useActiveWallet()
    const chains = useGetChains()
    const { topChainColor } = useChainPageInfo()

    const { walletLabel, shortenedWalletName } = useMemo(() => {
      let walletLabel = ''

      if (wallet.walletType === WALLETTYPE.LEDGER) {
        walletLabel = ` · /0'/0/${wallet.addressIndex}`
      }

      if (
        (wallet.walletType === WALLETTYPE.PRIVATE_KEY ||
          wallet.walletType === WALLETTYPE.SEED_PHRASE_IMPORTED) &&
        !wallet.watchWallet
      ) {
        walletLabel = ` · Imported`
      }
      const walletName =
        wallet.walletType == WALLETTYPE.LEDGER && !LEDGER_NAME_EDITED_SUFFIX_REGEX.test(wallet.name)
          ? `${walletLabels[wallet.walletType]} Wallet ${wallet.addressIndex + 1}`
          : formatWalletName(wallet.name)

      const sliceLength = wallet.walletType === WALLETTYPE.LEDGER ? 10 : 19
      const walletNameLength = walletName.length
      const shortenedWalletName =
        walletNameLength > sliceLength ? walletName.slice(0, sliceLength) + '...' : walletName

      return { walletLabel, walletName, walletNameLength, shortenedWalletName }
    }, [wallet])

    const { addressText, disableEdit } = useMemo(() => {
      const addressValue = activeChainInfo?.evmOnlyChain
        ? pubKeyToEvmAddressToShow(wallet?.pubKeys?.[activeChainInfo?.key], true) ??
          wallet?.addresses?.[activeChainInfo?.key]
        : wallet?.addresses?.[activeChainInfo?.key] ?? ''

      let addressText = `${
        addressValue ? sliceAddress(addressValue) + walletLabel : walletLabel.replace(' · ', '')
      }`

      let disableEdit = false

      if (
        wallet.walletType === WALLETTYPE.LEDGER &&
        !isLedgerEnabled(
          activeChainInfo?.key,
          activeChainInfo?.bip44?.coinType,
          Object.values(chains),
        )
      ) {
        addressText = `Ledger not supported on ${activeChainInfo?.chainName}`
        disableEdit = true
      }
      if (
        wallet.walletType === WALLETTYPE.LEDGER &&
        isLedgerEnabled(
          activeChainInfo?.key,
          activeChainInfo?.bip44?.coinType,
          Object.values(chains),
        ) &&
        !wallet.addresses[activeChainInfo?.key]
      ) {
        addressText = `Please import EVM wallet`
        disableEdit = true
      }
      return { addressText, disableEdit }
    }, [wallet, walletLabel, activeChainInfo, chains])

    const title = useMemo(() => {
      return (
        <div className='flex flex-row items-center whitespace-nowrap'>
          {shortenedWalletName}
          {wallet.walletType === WALLETTYPE.LEDGER && (
            <Text
              className='bg-gray-950 font-normal rounded-2xl justify-center items-center px-2 ml-1 h-[18px]'
              color='text-gray-400'
              size='xs'
            >
              Ledger
            </Text>
          )}
        </div>
      )
    }, [shortenedWalletName, wallet.walletType])

    const icon = useMemo(() => {
      return (
        <div
          className='flex h-[28px] w-[28px] hover:cursor-pointer justify-center text-gray-400 items-center bg-white-100 dark:bg-gray-900'
          onClick={(e) => {
            e.stopPropagation()
            if (disableEdit) return
            setEditWallet(wallet)
            setIsEditWalletVisible(true)
          }}
          data-testing-id={isLast ? 'btn-more-horiz' : ''}
        >
          <DotsThree size={20} className='text-gray-400' />
        </div>
      )
    }, [disableEdit, isLast, setEditWallet, setIsEditWalletVisible, wallet])

    const onClick = useCallback(async () => {
      await setActiveWallet(wallet)
      onClose()
    }, [wallet, setActiveWallet, onClose])

    return (
      <div className='relative min-h-[56px]' key={wallet.id}>
        <WalletCard
          onClick={onClick}
          key={formatWalletName(wallet.name)}
          title={title}
          icon={icon}
          subtitle={
            activeChain === AGGREGATED_CHAIN_KEY ? walletLabel?.replace(' · ', '') : addressText
          }
          isSelected={activeWallet?.id === wallet.id}
          imgSrc={
            wallet?.avatar ??
            Images.Misc.getWalletIconAtIndex(wallet.colorIndex, wallet.watchWallet)
          }
          color={topChainColor}
          isRounded={true}
        />
        {!isLast ? <CardDivider /> : null}
      </div>
    )
  },
)

export default WalletCardWrapper
