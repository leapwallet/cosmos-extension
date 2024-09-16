import {
  MsgAddValidators,
  MsgClaimUndelegatedTokens,
  MsgClearBalance,
  MsgDeleteValidator,
  MsgLiquidStake,
  MsgRebalanceValidators,
  MsgRedeemStake,
  MsgRegisterHostZone,
  MsgRestoreInterchainAccount,
  MsgUpdateValidatorSharesExchRate,
} from './tx';

export const AminoConverter = {
  '/stride.stakeibc.MsgLiquidStake': {
    aminoType: 'stakeibc/LiquidStake',
    toAmino: MsgLiquidStake.toAmino,
    fromAmino: MsgLiquidStake.fromAmino,
  },
  '/stride.stakeibc.MsgRedeemStake': {
    aminoType: 'stakeibc/RedeemStake',
    toAmino: MsgRedeemStake.toAmino,
    fromAmino: MsgRedeemStake.fromAmino,
  },
  '/stride.stakeibc.MsgRegisterHostZone': {
    aminoType: 'stakeibc/RegisterHostZone',
    toAmino: MsgRegisterHostZone.toAmino,
    fromAmino: MsgRegisterHostZone.fromAmino,
  },
  '/stride.stakeibc.MsgClaimUndelegatedTokens': {
    aminoType: 'stakeibc/ClaimUndelegatedTokens',
    toAmino: MsgClaimUndelegatedTokens.toAmino,
    fromAmino: MsgClaimUndelegatedTokens.fromAmino,
  },
  '/stride.stakeibc.MsgRebalanceValidators': {
    aminoType: 'stakeibc/RebalanceValidators',
    toAmino: MsgRebalanceValidators.toAmino,
    fromAmino: MsgRebalanceValidators.fromAmino,
  },
  '/stride.stakeibc.MsgAddValidators': {
    aminoType: '/stride.stakeibc.MsgAddValidators',
    toAmino: MsgAddValidators.toAmino,
    fromAmino: MsgAddValidators.fromAmino,
  },
  '/stride.stakeibc.MsgDeleteValidator': {
    aminoType: 'stakeibc/DeleteValidator',
    toAmino: MsgDeleteValidator.toAmino,
    fromAmino: MsgDeleteValidator.fromAmino,
  },
  '/stride.stakeibc.MsgRestoreInterchainAccount': {
    aminoType: 'stakeibc/RestoreInterchainAccount',
    toAmino: MsgRestoreInterchainAccount.toAmino,
    fromAmino: MsgRestoreInterchainAccount.fromAmino,
  },
  '/stride.stakeibc.MsgUpdateValidatorSharesExchRate': {
    aminoType: 'stakeibc/UpdateValidatorSharesExchRate',
    toAmino: MsgUpdateValidatorSharesExchRate.toAmino,
    fromAmino: MsgUpdateValidatorSharesExchRate.fromAmino,
  },
  '/stride.stakeibc.MsgClearBalance': {
    aminoType: 'still-no-defined',
    toAmino: MsgClearBalance.toAmino,
    fromAmino: MsgClearBalance.fromAmino,
  },
};
