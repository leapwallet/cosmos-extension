import { useActiveChain, useChainsStore, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { SignAminoMethod, SignDirectMethod, Signer } from '@leapwallet/elements-core'
import { WalletClient } from '@leapwallet/elements-hooks'
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
        const chainKey = Object.values(chains).find((chain) => chain.chainId === chainId)?.key
        const wallet = await getWallet(
          ((chainKey || chains[activeChain]?.key) ?? '') as SupportedChain,
        )
        const accounts = await wallet!.getAccounts!()
        const account = accounts[0]
        return {
          bech32Address: account.address,
          pubKey: account.pubkey,
          isNanoLedger: isLedgerTypeWallet,
        }
      },
      getSigner: async (chainId: string) => {
        return signer
      },
    }
  }, [])

  return { walletClient }
}
