import {
  denomFetcher,
  formatBigNumber,
  sliceAddress,
  useActiveChain,
  useChainsStore,
} from '@leapwallet/cosmos-wallet-hooks'
import { parfait, ParsedMessage, ParsedMessageType, Token } from '@leapwallet/parser-parfait'
import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'

const tokenToString = async (token: Token, restUrl: string, chainId: string) => {
  try {
    const trace = await denomFetcher.fetchDenomTrace(token.denomination, restUrl, chainId)
    if (!trace) {
      throw new Error('No')
    }
    return `${formatBigNumber(new BigNumber(token.quantity).dividedBy(10 ** trace.coinDecimals))} ${
      trace.coinDenom
    }`
  } catch {
    if (token?.denomination?.startsWith('u') ?? false) {
      return `${token.quantity} ${token.denomination.slice(1)}`
    }
    return `${token?.quantity ?? ''} ${sliceAddress(token?.denomination ?? '')}`
  }
}

const tokensToString = async (tokens: Token[], restUrl: string, chainId: string) => {
  const traces = await Promise.all(tokens.map((t) => tokenToString(t, restUrl, chainId)))
  return traces.join(', ')
}

function getMessageType(type: string) {
  const parts = (type?.startsWith('/') ? type?.split('.') : type?.split('/')) ?? []
  return parts[parts.length - 1] ?? ''
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getSimpleType = (type: string | undefined, additionalInfo?: any) => {
  if (!type) {
    return 'unknown'
  }
  const simpleType = getMessageType(type)

  if (simpleType.trim() === 'SendAuthorization') {
    return 'Send'
  }

  if (simpleType.trim() === 'StakeAuthorization') {
    switch (additionalInfo) {
      case 0:
        return 'Unspecified'
      case 1:
        return 'Delegate'
      case 2:
        return 'Undelegate'
      case 3:
        return 'Redelegate'
      case 4:
        return 'Cancel Unbonding Delegation'
      default:
        return 'unknown'
    }
  }

  if (simpleType.trim() === 'GenericAuthorization') {
    return getMessageType(additionalInfo)
  }

  return simpleType
}

export const getMessageTitle = (message: ParsedMessage) => {
  switch (message.__type) {
    case ParsedMessageType.AuthzExec:
      return 'Execute Authorized Message'
    case ParsedMessageType.AuthzGrant:
      return 'Grant Authorization'
    case ParsedMessageType.AuthzRevoke:
      return 'Revoke Execution Authorization'
    case ParsedMessageType.BankMultiSend:
      return 'Multi Send Tokens'
    case ParsedMessageType.BankSend:
      return 'Send Tokens'
    case ParsedMessageType.FeeGrantGrantAllowance:
      return 'Grant Fee Allowance'
    case ParsedMessageType.FeeGrantRevokeAllowance:
      return 'Revoke Fee Allowance'
    case ParsedMessageType.GammCreatePool:
      return 'Create Balancer Pool'
    case ParsedMessageType.GammJoinPool:
      return 'Join Pool'
    case ParsedMessageType.GammExitPool:
      return 'Exit Pool'
    case ParsedMessageType.GammSwapExact:
    case ParsedMessageType.GammSwapMax:
      return 'Swap Tokens'
    case ParsedMessageType.GammSwapExactAndExit:
    case ParsedMessageType.GammSwapMaxAndExit:
      return 'Swap Tokens and Exit Pool'
    case ParsedMessageType.GammSwapExactAndJoin:
    case ParsedMessageType.GammSwapMaxAndJoin:
      return 'Swap Tokens and Join Pool'
    case ParsedMessageType.GovSubmitProposal:
      return 'Submit Governance Proposal'
    case ParsedMessageType.GovVote:
      return 'Vote on Governance Proposal'
    case ParsedMessageType.GovDeposit:
      return 'Deposit on Governance Proposal'
    case ParsedMessageType.IbcReceive:
      return 'Receive IBC Packet'
    case ParsedMessageType.IbcSend:
      return 'Send Tokens via IBC'
    case ParsedMessageType.LockupLock:
      return 'Lock Tokens'
    case ParsedMessageType.LockupUnlock:
      return 'Unlock Token'
    case ParsedMessageType.LockupUnlockAll:
      return 'Unlock All Tokens'
    case ParsedMessageType.SlashingUnjail:
      return 'Unjail Validator'
    case ParsedMessageType.StakingDelegate:
      return 'Delegate Tokens'
    case ParsedMessageType.StakingUndelegate:
      return 'Undelegate Tokens'
    case ParsedMessageType.StakingCreateValidator:
      return 'Create Validator'
    case ParsedMessageType.StakingEditValidator:
      return 'Edit Validator'
    case ParsedMessageType.StakingBeginRedelegate:
      return 'Redelegate Tokens'
    case ParsedMessageType.StakingCancelUnbondingDelegation:
      return 'Cancel Unbonding Delegation'
    case ParsedMessageType.SuperfluidDelegate:
      return 'Delegate Tokens (Superfluid)'
    case ParsedMessageType.SuperfluidLockAndDelegate:
      return 'Lock and Delegate Tokens (Superfluid)'
    case ParsedMessageType.SuperfluidUnlockAndUndelegate:
      return 'Unlock and Undelegate Tokens (Superfluid)'
    case ParsedMessageType.SuperfluidUndelegate:
      return 'Undelegate Tokens (Superfluid)'
    case ParsedMessageType.StakeIBCAddValidators:
      return 'Add Validators (Liquid Staking)'
    case ParsedMessageType.StakeIBCChangeValidatorWeight:
      return 'Change Validator Weight (Liquid Staking)'
    case ParsedMessageType.StakeIBCDeleteValidator:
      return 'Delete Validator (Liquid Staking)'
    case ParsedMessageType.StakeIBCLiquidStake:
      return 'Liquid Stake (Liquid Staking)'
    case ParsedMessageType.StakeIBCClearBalance:
      return 'Clear Balance (Liquid Staking)'
    case ParsedMessageType.StakeIBCRedeemStake:
      return 'Redeem Staked Tokens (Liquid Staking)'
    case ParsedMessageType.StakeIBCClaimUndelegatedTokens:
      return 'Claim Undelegated Tokens (Liquid Staking)'
    case ParsedMessageType.StakeIBCRegisterHostZone:
      return 'Register Host Zone (Liquid Staking)'
    case ParsedMessageType.StakeIBCRebalanceValidators:
      return 'Rebalance Validators (Liquid Staking)'
    case ParsedMessageType.StakeIBCRestoreInterchainAccount:
      return 'Restore Interchain Account (Liquid Staking)'
    case ParsedMessageType.StakeIBCUpdateValidatorSharesExchRate:
      return 'Update Validator Shares Exchange Rate (Liquid Staking)'
    case ParsedMessageType.IbcPacketReceive:
      return 'Receive IBC Packet'
    case ParsedMessageType.ClaimReward:
      return `Claim reward from ${sliceAddress(message.validatorAddress)}`
    case ParsedMessageType.Unimplemented:
      return getSimpleType(
        message.message['@type'] ??
          message.message.type ??
          message.message.type_url ??
          message.message.typeUrl,
      )
  }
}

const formatAllowanceOption = (allowance: parfait.cosmos.feegrant.grantAllowance['allowance']) => {
  switch (allowance) {
    case 'basic':
      return 'Basic'
    case 'periodic':
      return 'Periodic'
    case 'allowedMsg':
      return 'Allowed Message'
  }
}

export const getMessageDetails = async (
  message: ParsedMessage,
  restUrl: string,
  chainId: string,
) => {
  switch (message.__type) {
    case ParsedMessageType.AuthzExec:
      return Promise.resolve(
        `${sliceAddress(
          message.grantee,
        )} shall execute the following authorized message ${message.messages
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore not sure why ts is complaining here
          .map((m) => getSimpleType('type' in m ? (m.type as string) : m['@type']))
          .join(', ')} on behalf of you`,
      )
    case ParsedMessageType.AuthzGrant:
      return Promise.resolve(
        `Grant authorization for ${sliceAddress(message.grantee)} to execute ${getSimpleType(
          message.grant.authorization['$type_url'] ?? message.grant.authorization['@type'],
          message.grant.authorization.msg ?? message.grant.authorization.authorization_type,
        )} on behalf of you`,
      )
    case ParsedMessageType.AuthzRevoke:
      return Promise.resolve(
        `Revoke authorization for ${sliceAddress(message.grantee)} to execute ${getSimpleType(
          message.permission,
        )} on behalf of you`,
      )
    case ParsedMessageType.BankMultiSend:
      return Promise.resolve(
        `Send ${message.inputs.length} coins to ${message.outputs.length} recipients`,
      )
    case ParsedMessageType.BankSend: {
      return `Send ${await tokensToString(message.tokens, restUrl, chainId)} to ${sliceAddress(
        message.toAddress,
      )}`
    }
    case ParsedMessageType.FeeGrantGrantAllowance:
      return Promise.resolve(
        `Grant ${formatAllowanceOption(message.allowance)} allowance to ${sliceAddress(
          message.grantee,
        )}`,
      )
    case ParsedMessageType.IbcPacketReceive:
      return Promise.resolve(
        `Receive IBC packet from ${sliceAddress(message.sourcePort)}/${sliceAddress(
          message.sourceChannel,
        )}`,
      )
    case ParsedMessageType.FeeGrantRevokeAllowance:
      return Promise.resolve(`Revoke allowance from ${sliceAddress(message.grantee)}`)
    case ParsedMessageType.GammCreatePool:
      return `Create a Balancer pool with ${await tokensToString(
        message.tokens,
        restUrl,
        chainId,
      )} assets`
    case ParsedMessageType.GammJoinPool:
      return `Join pool ${message.poolId} with ${await tokensToString(
        message.tokens,
        restUrl,
        chainId,
      )} assets in return for ${message.shares} shares`
    case ParsedMessageType.GammExitPool:
      return `Exit pool ${message.poolId} with ${
        message.shares
      } shares in return for ${await tokensToString(message.tokens, restUrl, chainId)} assets`
    case ParsedMessageType.GammSwapExact: {
      const tokenOut = {
        quantity: message.tokenOutAmount,
        denomination: message.routes[message.routes.length - 1].tokenOutDenomination,
      }
      return `Swap ${await tokenToString(
        message.tokenIn,
        restUrl,
        chainId,
      )} for ${await tokenToString(tokenOut, restUrl, chainId)}`
    }
    case ParsedMessageType.GammSwapMax: {
      const tokenIn = {
        quantity: message.tokenInAmount,
        denomination: message.routes[0].tokenInDenomination,
      }
      return `Swap ${await tokenToString(tokenIn, restUrl, chainId)} for ${await tokenToString(
        message.tokenOut,
        restUrl,
        chainId,
      )}`
    }
    case ParsedMessageType.GammSwapExactAndExit:
    case ParsedMessageType.GammSwapMaxAndExit:
      return `Sell ${message.shares} shares for ${await tokenToString(
        message.tokenOut,
        restUrl,
        chainId,
      )} and exit pool ${message.poolId}`
    case ParsedMessageType.GammSwapExactAndJoin:
    case ParsedMessageType.GammSwapMaxAndJoin:
      return `Buy ${message.shares} shares for ${await tokenToString(
        message.tokenIn,
        restUrl,
        chainId,
      )} and join pool ${message.poolId}`
    case ParsedMessageType.GovSubmitProposal:
      return Promise.resolve(
        `Submit proposal with deposit of ${await tokensToString(
          message.initialDeposit,
          restUrl,
          chainId,
        )}`,
      )
    case ParsedMessageType.GovVote: {
      const proposalId = ['number', 'string'].includes(typeof message.proposalId)
        ? message.proposalId
        : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          message.proposalId?.low ?? JSON.stringify(message.proposalId)

      return Promise.resolve(`Vote ${message.option} on proposal ${proposalId}`)
    }
    case ParsedMessageType.GovDeposit:
      return Promise.resolve(
        `Deposit ${await tokensToString(message?.amount ?? [], restUrl, chainId)} on proposal ${
          message.proposalId
        }`,
      )
    case ParsedMessageType.IbcSend:
      return `Send ${await tokenToString(message.token, restUrl, chainId)} to ${sliceAddress(
        message.toAddress,
      )} via IBC`
    case ParsedMessageType.IbcReceive:
      return `Receive ${await tokenToString(message.token, restUrl, chainId)} from ${sliceAddress(
        message.fromAddress,
      )} via IBC`
    case ParsedMessageType.LockupLock:
      return `Lock ${await tokensToString(message.tokens, restUrl, chainId)} for ${
        message.duration
      } seconds`
    case ParsedMessageType.LockupUnlock:
      return Promise.resolve(`Unlock token from lock ${message.id}`)
    case ParsedMessageType.LockupUnlockAll:
      return Promise.resolve(`Unlock all tokens from all locks`)
    case ParsedMessageType.SlashingUnjail:
      return Promise.resolve(`Unjail validator ${sliceAddress(message.validatorAddress)}`)
    case ParsedMessageType.StakingCreateValidator:
      return Promise.resolve(
        `Create ${message.moniker} validator with commission rate ${message.rate}`,
      )
    case ParsedMessageType.StakingEditValidator:
      return Promise.resolve(`Edit ${message.moniker} validator`)
    case ParsedMessageType.StakingDelegate:
      return `Delegate ${await tokenToString(
        {
          quantity: message.quantity,
          denomination: message.denomination,
        },
        restUrl,
        chainId,
      )} to ${sliceAddress(message.validatorAddress)}`
    case ParsedMessageType.StakingUndelegate:
      return `Undelegate ${await tokenToString(
        {
          quantity: message.quantity,
          denomination: message.denomination,
        },
        restUrl,
        chainId,
      )} from ${sliceAddress(message.validatorAddress)}`
    case ParsedMessageType.StakingBeginRedelegate:
      return `Redelegate ${await tokenToString(
        {
          quantity: message.quantity,
          denomination: message.denomination,
        },
        restUrl,
        chainId,
      )} from ${sliceAddress(message.sourceValidatorAddress)} to ${sliceAddress(
        message.destinationValidatorAddress,
      )}`
    case ParsedMessageType.StakingCancelUnbondingDelegation:
      return Promise.resolve(
        `Cancel unbonding delegation for ${tokenToString(
          {
            quantity: message.quantity,
            denomination: message.denomination,
          },
          restUrl,
          chainId,
        )} from ${sliceAddress(message.validatorAddress)}`,
      )
    case ParsedMessageType.SuperfluidLockAndDelegate:
      return `Lock ${await tokensToString(
        message.tokens,
        restUrl,
        chainId,
      )} and delegate to ${sliceAddress(message.validatorAddress)}`
    case ParsedMessageType.SuperfluidUnlockAndUndelegate:
      return Promise.resolve(`Remove lock ${message.lockId} and undelegate`)
    case ParsedMessageType.SuperfluidDelegate:
      return Promise.resolve(`Delegate tokens with lock ${message.lockId}`)
    case ParsedMessageType.SuperfluidUndelegate:
      return Promise.resolve(`Undelegate tokens with lock ${message.lockId}`)
    case ParsedMessageType.StakeIBCAddValidators:
      return Promise.resolve(`Add liquid staking validators - ${message.validators.join(', ')}`)
    case ParsedMessageType.StakeIBCChangeValidatorWeight:
      return Promise.resolve(
        `Change liquid staking validator ${message.validatorAddress}'s weight to ${message.weight}`,
      )
    case ParsedMessageType.StakeIBCDeleteValidator:
      return Promise.resolve(`Delete liquid staking validator ${message.validatorAddress}`)
    case ParsedMessageType.StakeIBCLiquidStake:
      return `Liquid stake ${await tokenToString(
        {
          denomination: message.denomination,
          quantity: message.quantity,
        },
        restUrl,
        chainId,
      )}`
    case ParsedMessageType.StakeIBCClearBalance:
      return Promise.resolve(`Clear liquid staking balance of ${message.quantity}`)
    case ParsedMessageType.StakeIBCRedeemStake:
      return Promise.resolve(
        `Redeem liquid stake of ${message.quantity} units to ${sliceAddress(message.receiver)}`,
      )
    case ParsedMessageType.StakeIBCClaimUndelegatedTokens:
      return Promise.resolve('Claim undelegated tokens')
    case ParsedMessageType.StakeIBCRegisterHostZone:
      return Promise.resolve(
        `Register host zone via ${sliceAddress(message.account)} with host denomination ${
          message.hostDenom
        }`,
      )
    case ParsedMessageType.StakeIBCRebalanceValidators:
      return Promise.resolve(
        `Rebalance ${message.numRebalance} liquid staking validators in ${message.hostZone} host zone`,
      )
    case ParsedMessageType.StakeIBCRestoreInterchainAccount:
      return Promise.resolve(
        `Restore interchain account ${sliceAddress(message.creator)} of type ${
          message.accountType
        }`,
      )
    case ParsedMessageType.StakeIBCUpdateValidatorSharesExchRate:
      return Promise.resolve(
        `Update liquid staking validator shares exchange rate for ${sliceAddress(
          message.validatorOperatorAddress,
        )}`,
      )
    case ParsedMessageType.ClaimReward:
      return Promise.resolve(`Claim staking reward from ${sliceAddress(message.validatorAddress)}`)
    case ParsedMessageType.Unimplemented:
      return Promise.resolve(
        getSimpleType(
          message.message['@type'] ??
            message.message.type ??
            message.message.type_url ??
            message.message.typeUrl,
        ),
      )
  }
}

export const useMessageDetails = (message: ParsedMessage | undefined, restUrl: string) => {
  const activeChain = useActiveChain()
  const { chains } = useChainsStore()

  const { data, isLoading } = useQuery({
    queryKey: ['message-details', message],
    queryFn: () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return getMessageDetails(message!, restUrl, chains[activeChain].chainId)
    },
    enabled: !!message,
  })

  return { data, isLoading } as const
}
