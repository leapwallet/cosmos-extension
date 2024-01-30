import { AminoMsg } from '@cosmjs/amino';
import { Long } from '@osmonauts/helpers';

import { iCAAccountTypeFromJSON } from './ica_account';
import {
  MsgAddValidators,
  MsgChangeValidatorWeight,
  MsgClaimUndelegatedTokens,
  MsgClearBalance,
  MsgDeleteValidator,
  MsgLiquidStake,
  MsgLSMLiquidStake,
  MsgRebalanceValidators,
  MsgRedeemStake,
  MsgRegisterHostZone,
  MsgRestoreInterchainAccount,
  MsgUpdateValidatorSharesExchRate,
} from './tx';

export interface AminoMsgLiquidStake extends AminoMsg {
  type: 'stakeibc/LiquidStake';
  value: {
    creator: string;
    amount: string;
    host_denom: string;
  };
}
export interface AminoMsgLSMLiquidStake extends AminoMsg {
  type: 'stakeibc/LSMLiquidStake';
  value: {
    creator: string;
    amount: string;
    lsm_token_ibc_denom: string;
  };
}
export interface AminoMsgRedeemStake extends AminoMsg {
  type: 'stakeibc/RedeemStake';
  value: {
    creator: string;
    amount: string;
    host_zone: string;
    receiver: string;
  };
}
export interface AminoMsgRegisterHostZone extends AminoMsg {
  type: 'stakeibc/RegisterHostZone';
  value: {
    connection_id: string;
    bech32prefix: string;
    host_denom: string;
    ibc_denom: string;
    creator: string;
    transfer_channel_id: string;
    unbonding_period: string;
    min_redemption_rate: string;
    max_redemption_rate: string;
    lsm_liquid_stake_enabled: boolean;
  };
}
export interface AminoMsgClaimUndelegatedTokens extends AminoMsg {
  type: 'stakeibc/ClaimUndelegatedTokens';
  value: {
    creator: string;
    host_zone_id: string;
    epoch: string;
    sender: string;
  };
}
export interface AminoMsgRebalanceValidators extends AminoMsg {
  type: 'stakeibc/RebalanceValidators';
  value: {
    creator: string;
    host_zone: string;
    num_rebalance: string;
  };
}
export interface AminoMsgAddValidators extends AminoMsg {
  type: '/stride.stakeibc.MsgAddValidators';
  value: {
    creator: string;
    host_zone: string;
    validators: {
      name: string;
      address: string;
      weight: string;
      delegation: string;
      slash_query_progress_tracker: string;
      slash_query_checkpoint: string;
      internal_shares_to_tokens_rate: string;
      delegation_changes_in_progress: string;
      slash_query_in_progress: boolean;
    }[];
  };
}
export interface AminoMsgChangeValidatorWeight extends AminoMsg {
  type: 'stakeibc/ChangeValidatorWeight';
  value: {
    creator: string;
    host_zone: string;
    val_addr: string;
    weight: string;
  };
}
export interface AminoMsgDeleteValidator extends AminoMsg {
  type: 'stakeibc/DeleteValidator';
  value: {
    creator: string;
    host_zone: string;
    val_addr: string;
  };
}
export interface AminoMsgRestoreInterchainAccount extends AminoMsg {
  type: 'stakeibc/RestoreInterchainAccount';
  value: {
    creator: string;
    chain_id: string;
    account_type: number;
  };
}
export interface AminoMsgUpdateValidatorSharesExchRate extends AminoMsg {
  type: 'stakeibc/UpdateValidatorSharesExchRate';
  value: {
    creator: string;
    chain_id: string;
    valoper: string;
  };
}
export interface AminoMsgClearBalance extends AminoMsg {
  type: 'still-no-defined';
  value: {
    creator: string;
    chain_id: string;
    amount: string;
    channel: string;
  };
}
export const AminoConverter = {
  '/stride.stakeibc.MsgLiquidStake': {
    aminoType: 'stakeibc/LiquidStake',
    toAmino: ({ creator, amount, hostDenom }: MsgLiquidStake): AminoMsgLiquidStake['value'] => {
      return {
        creator,
        amount,
        host_denom: hostDenom,
      };
    },
    fromAmino: ({ creator, amount, host_denom }: AminoMsgLiquidStake['value']): MsgLiquidStake => {
      return {
        creator,
        amount,
        hostDenom: host_denom,
      };
    },
  },
  '/stride.stakeibc.MsgLSMLiquidStake': {
    aminoType: 'stakeibc/LSMLiquidStake',
    toAmino: ({ creator, amount, lsmTokenIbcDenom }: MsgLSMLiquidStake): AminoMsgLSMLiquidStake['value'] => {
      return {
        creator,
        amount,
        lsm_token_ibc_denom: lsmTokenIbcDenom,
      };
    },
    fromAmino: ({ creator, amount, lsm_token_ibc_denom }: AminoMsgLSMLiquidStake['value']): MsgLSMLiquidStake => {
      return {
        creator,
        amount,
        lsmTokenIbcDenom: lsm_token_ibc_denom,
      };
    },
  },
  '/stride.stakeibc.MsgRedeemStake': {
    aminoType: 'stakeibc/RedeemStake',
    toAmino: ({ creator, amount, hostZone, receiver }: MsgRedeemStake): AminoMsgRedeemStake['value'] => {
      return {
        creator,
        amount,
        host_zone: hostZone,
        receiver,
      };
    },
    fromAmino: ({ creator, amount, host_zone, receiver }: AminoMsgRedeemStake['value']): MsgRedeemStake => {
      return {
        creator,
        amount,
        hostZone: host_zone,
        receiver,
      };
    },
  },
  '/stride.stakeibc.MsgRegisterHostZone': {
    aminoType: 'stakeibc/RegisterHostZone',
    toAmino: ({
      connectionId,
      bech32prefix,
      hostDenom,
      ibcDenom,
      creator,
      transferChannelId,
      unbondingPeriod,
      minRedemptionRate,
      maxRedemptionRate,
      lsmLiquidStakeEnabled,
    }: MsgRegisterHostZone): AminoMsgRegisterHostZone['value'] => {
      return {
        connection_id: connectionId,
        bech32prefix,
        host_denom: hostDenom,
        ibc_denom: ibcDenom,
        creator,
        transfer_channel_id: transferChannelId,
        unbonding_period: unbondingPeriod.toString(),
        min_redemption_rate: minRedemptionRate,
        max_redemption_rate: maxRedemptionRate,
        lsm_liquid_stake_enabled: lsmLiquidStakeEnabled,
      };
    },
    fromAmino: ({
      connection_id,
      bech32prefix,
      host_denom,
      ibc_denom,
      creator,
      transfer_channel_id,
      unbonding_period,
      min_redemption_rate,
      max_redemption_rate,
      lsm_liquid_stake_enabled,
    }: AminoMsgRegisterHostZone['value']): MsgRegisterHostZone => {
      return {
        connectionId: connection_id,
        bech32prefix,
        hostDenom: host_denom,
        ibcDenom: ibc_denom,
        creator,
        transferChannelId: transfer_channel_id,
        unbondingPeriod: Long.fromString(unbonding_period),
        minRedemptionRate: min_redemption_rate,
        maxRedemptionRate: max_redemption_rate,
        lsmLiquidStakeEnabled: lsm_liquid_stake_enabled,
      };
    },
  },
  '/stride.stakeibc.MsgClaimUndelegatedTokens': {
    aminoType: 'stakeibc/ClaimUndelegatedTokens',
    toAmino: ({
      creator,
      hostZoneId,
      epoch,
      sender,
    }: MsgClaimUndelegatedTokens): AminoMsgClaimUndelegatedTokens['value'] => {
      return {
        creator,
        host_zone_id: hostZoneId,
        epoch: epoch.toString(),
        sender,
      };
    },
    fromAmino: ({
      creator,
      host_zone_id,
      epoch,
      sender,
    }: AminoMsgClaimUndelegatedTokens['value']): MsgClaimUndelegatedTokens => {
      return {
        creator,
        hostZoneId: host_zone_id,
        epoch: Long.fromString(epoch),
        sender,
      };
    },
  },
  '/stride.stakeibc.MsgRebalanceValidators': {
    aminoType: 'stakeibc/RebalanceValidators',
    toAmino: ({ creator, hostZone, numRebalance }: MsgRebalanceValidators): AminoMsgRebalanceValidators['value'] => {
      return {
        creator,
        host_zone: hostZone,
        num_rebalance: numRebalance.toString(),
      };
    },
    fromAmino: ({
      creator,
      host_zone,
      num_rebalance,
    }: AminoMsgRebalanceValidators['value']): MsgRebalanceValidators => {
      return {
        creator,
        hostZone: host_zone,
        numRebalance: Long.fromString(num_rebalance),
      };
    },
  },
  '/stride.stakeibc.MsgAddValidators': {
    aminoType: '/stride.stakeibc.MsgAddValidators',
    toAmino: ({ creator, hostZone, validators }: MsgAddValidators): AminoMsgAddValidators['value'] => {
      return {
        creator,
        host_zone: hostZone,
        validators: validators.map((el0) => ({
          name: el0.name,
          address: el0.address,
          weight: el0.weight.toString(),
          delegation: el0.delegation,
          slash_query_progress_tracker: el0.slashQueryProgressTracker,
          slash_query_checkpoint: el0.slashQueryCheckpoint,
          internal_shares_to_tokens_rate: el0.internalSharesToTokensRate,
          delegation_changes_in_progress: el0.delegationChangesInProgress.toString(),
          slash_query_in_progress: el0.slashQueryInProgress,
        })),
      };
    },
    fromAmino: ({ creator, host_zone, validators }: AminoMsgAddValidators['value']): MsgAddValidators => {
      return {
        creator,
        hostZone: host_zone,
        validators: validators.map((el0) => ({
          name: el0.name,
          address: el0.address,
          weight: Long.fromString(el0.weight),
          delegation: el0.delegation,
          slashQueryProgressTracker: el0.slash_query_progress_tracker,
          slashQueryCheckpoint: el0.slash_query_checkpoint,
          internalSharesToTokensRate: el0.internal_shares_to_tokens_rate,
          delegationChangesInProgress: Long.fromString(el0.delegation_changes_in_progress),
          slashQueryInProgress: el0.slash_query_in_progress,
        })),
      };
    },
  },
  '/stride.stakeibc.MsgChangeValidatorWeight': {
    aminoType: 'stakeibc/ChangeValidatorWeight',
    toAmino: ({
      creator,
      hostZone,
      valAddr,
      weight,
    }: MsgChangeValidatorWeight): AminoMsgChangeValidatorWeight['value'] => {
      return {
        creator,
        host_zone: hostZone,
        val_addr: valAddr,
        weight: weight.toString(),
      };
    },
    fromAmino: ({
      creator,
      host_zone,
      val_addr,
      weight,
    }: AminoMsgChangeValidatorWeight['value']): MsgChangeValidatorWeight => {
      return {
        creator,
        hostZone: host_zone,
        valAddr: val_addr,
        weight: Long.fromString(weight),
      };
    },
  },
  '/stride.stakeibc.MsgDeleteValidator': {
    aminoType: 'stakeibc/DeleteValidator',
    toAmino: ({ creator, hostZone, valAddr }: MsgDeleteValidator): AminoMsgDeleteValidator['value'] => {
      return {
        creator,
        host_zone: hostZone,
        val_addr: valAddr,
      };
    },
    fromAmino: ({ creator, host_zone, val_addr }: AminoMsgDeleteValidator['value']): MsgDeleteValidator => {
      return {
        creator,
        hostZone: host_zone,
        valAddr: val_addr,
      };
    },
  },
  '/stride.stakeibc.MsgRestoreInterchainAccount': {
    aminoType: 'stakeibc/RestoreInterchainAccount',
    toAmino: ({
      creator,
      chainId,
      accountType,
    }: MsgRestoreInterchainAccount): AminoMsgRestoreInterchainAccount['value'] => {
      return {
        creator,
        chain_id: chainId,
        account_type: accountType,
      };
    },
    fromAmino: ({
      creator,
      chain_id,
      account_type,
    }: AminoMsgRestoreInterchainAccount['value']): MsgRestoreInterchainAccount => {
      return {
        creator,
        chainId: chain_id,
        accountType: iCAAccountTypeFromJSON(account_type),
      };
    },
  },
  '/stride.stakeibc.MsgUpdateValidatorSharesExchRate': {
    aminoType: 'stakeibc/UpdateValidatorSharesExchRate',
    toAmino: ({
      creator,
      chainId,
      valoper,
    }: MsgUpdateValidatorSharesExchRate): AminoMsgUpdateValidatorSharesExchRate['value'] => {
      return {
        creator,
        chain_id: chainId,
        valoper,
      };
    },
    fromAmino: ({
      creator,
      chain_id,
      valoper,
    }: AminoMsgUpdateValidatorSharesExchRate['value']): MsgUpdateValidatorSharesExchRate => {
      return {
        creator,
        chainId: chain_id,
        valoper,
      };
    },
  },
  '/stride.stakeibc.MsgClearBalance': {
    aminoType: 'still-no-defined',
    toAmino: ({ creator, chainId, amount, channel }: MsgClearBalance): AminoMsgClearBalance['value'] => {
      return {
        creator,
        chain_id: chainId,
        amount,
        channel,
      };
    },
    fromAmino: ({ creator, chain_id, amount, channel }: AminoMsgClearBalance['value']): MsgClearBalance => {
      return {
        creator,
        chainId: chain_id,
        amount,
        channel,
      };
    },
  },
};
