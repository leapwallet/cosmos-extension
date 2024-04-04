import { fromBase64 } from '@cosmjs/encoding'
import { useActiveChain, useChainsStore, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { SignAminoMethod, SignDirectMethod, Signer } from '@leapwallet/elements-core'
import { WalletClient } from '@leapwallet/elements-hooks'
import { LEDGER_ENABLED_EVM_CHAINS } from 'config/config'
import { decodeChainIdToChain } from 'extension-scripts/utils'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { Wallet } from 'hooks/wallet/useWallet'
import { useMemo } from 'react'

export const useWalletClient = () => {
  const { activeWallet } = useActiveWallet()
  const getWallet = Wallet.useGetWallet()
  const activeChain = useActiveChain()
  const { chains } = useChainsStore()

  const isLedgerTypeWallet = activeWallet?.walletType === WALLETTYPE.LEDGER

  const signDirect: SignDirectMethod = async (signerAddress: string, signDoc: any) => {
    const wallet = await getWallet((chains[activeChain]?.key ?? '') as SupportedChain)
    if ('signDirect' in wallet) {
      const result = await wallet.signDirect(signerAddress, signDoc)
      return {
        signature: new Uint8Array(Buffer.from(result.signature.signature, 'base64')),
        signed: result.signed,
      }
    } else {
      throw new Error('signDirect not supported')
    }
  }

  const signAmino: SignAminoMethod = async (address: string, signDoc: any) => {
    const wallet = await getWallet((chains[activeChain]?.key ?? '') as SupportedChain)
    if ('signAmino' in wallet) {
      const res = await wallet.signAmino(address, signDoc)
      return {
        // @ts-ignore
        signature: new Uint8Array(Buffer.from(res.signature.signature, 'base64')),
        signed: res.signed,
      }
    } else {
      throw new Error('signAmino not supported')
    }
  }

  const signer: Signer = {
    signDirect: signDirect,
    signAmino: signAmino,
  }

  const walletClient: WalletClient = useMemo(() => {
    return {
      enable: async (chainIds: string | string[]) => {},
      getAccount: async (chainId: string) => {
        if (!activeWallet) throw new Error('No active wallet')
        const chainIdToChain = await decodeChainIdToChain()
        const chainKey = chainIdToChain[chainId] ?? activeChain

        const address = activeWallet.addresses[chainKey as SupportedChain]
        const pubKey = activeWallet.pubKeys?.[chainKey as SupportedChain]
        if (!address || !pubKey) throw new Error('No address or pubKey')
        return {
          bech32Address: address,
          pubKey: fromBase64(pubKey),
          isNanoLedger: isLedgerTypeWallet,
        }
      },
      getSigner: async (chainId: string) => {
        return signer
      },
    }
  }, [activeWallet])

  return { walletClient }
}
