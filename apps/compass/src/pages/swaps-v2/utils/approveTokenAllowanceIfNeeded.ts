/* eslint-disable no-console */
import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber'
import { AddressZero } from '@ethersproject/constants'
import { Contract } from '@ethersproject/contracts'
import { JsonRpcProvider } from '@ethersproject/providers'
import { LedgerError, SeiEvmTx } from '@leapwallet/cosmos-wallet-sdk'
import { EthWallet } from '@leapwallet/leap-keychain'

// Minimal ERC20 ABI - we only need approve function
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) public returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
]

export async function approveTokenAllowanceIfNeeded(
  chainId: number,
  evmJsonRpc: string,
  wallet: EthWallet,
  owner: string,
  tokenAddress: string, // The ERC20 token contract address
  routerAddress: string, // The DEX router address
  amount: string, // Amount to approve
  gasPrice: number | undefined,
  isLedgerTypeWallet: boolean,
  setShowLedgerPopup: (show: boolean) => void,
  setShowLedgerPopupText: (text: string) => void,
) {
  // If the token is the native token, we don't need to approve
  if (tokenAddress === AddressZero) {
    return
  }

  const provider = new JsonRpcProvider(evmJsonRpc)
  // Create contract instance
  const contract = new Contract(tokenAddress, ERC20_ABI, provider)

  try {
    // Check current allowance first
    const currentAllowance = await contract.allowance(owner, routerAddress)
    const weiAmountBN = EthersBigNumber.from(amount)
    if (currentAllowance.lt(weiAmountBN)) {
      // Send approve transaction
      const data = await contract.interface.encodeFunctionData('approve', [routerAddress, amount])

      const gasUsed = await SeiEvmTx.SimulateTransaction(
        tokenAddress,
        '0',
        evmJsonRpc ?? '',
        data,
        undefined,
        owner,
      )

      const seiEvmTx = SeiEvmTx.GetSeiEvmClient(wallet, evmJsonRpc ?? '', chainId)

      if (isLedgerTypeWallet) {
        setShowLedgerPopup(true)
        setShowLedgerPopupText(
          'You will need to confirm 2 transactions on your hardware wallet. Make sure blind signing is enabled',
        )
        await wallet.getAccounts()
      }

      const tx = await seiEvmTx.sendTransaction('', tokenAddress, '0', gasUsed, gasPrice, data)

      // Wait for transaction to be mined
      await tx.wait()
      const newAllowance = await contract.allowance(owner, routerAddress)

      if (newAllowance.lt(weiAmountBN)) {
        throw new Error('Approval failed')
      }
    } else {
      return null
    }
  } catch (error) {
    if (error instanceof LedgerError) {
      setShowLedgerPopup(false)
      setShowLedgerPopupText('')
      throw error
    }
    console.error('Approval failed:', error)
    throw new Error(
      'Approval for token failed' +
        ((error as Error)?.message ? `: ${(error as Error).message}` : ''),
    )
  } finally {
    // setShowLedgerPopup(false)
  }
}
