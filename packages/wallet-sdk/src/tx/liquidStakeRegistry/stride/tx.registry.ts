import { GeneratedType, Registry } from '@cosmjs/proto-signing';

import {
  MsgAddValidator,
  MsgChangeValidatorWeight,
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
export const registry: ReadonlyArray<[string, unknown]> = [
  ['/stride.stakeibc.MsgLiquidStake', MsgLiquidStake],
  ['/stride.stakeibc.MsgRedeemStake', MsgRedeemStake],
  ['/stride.stakeibc.MsgRegisterHostZone', MsgRegisterHostZone],
  ['/stride.stakeibc.MsgClaimUndelegatedTokens', MsgClaimUndelegatedTokens],
  ['/stride.stakeibc.MsgRebalanceValidators', MsgRebalanceValidators],
  ['/stride.stakeibc.MsgAddValidator', MsgAddValidator],
  ['/stride.stakeibc.MsgChangeValidatorWeight', MsgChangeValidatorWeight],
  ['/stride.stakeibc.MsgDeleteValidator', MsgDeleteValidator],
  ['/stride.stakeibc.MsgRestoreInterchainAccount', MsgRestoreInterchainAccount],
  ['/stride.stakeibc.MsgUpdateValidatorSharesExchRate', MsgUpdateValidatorSharesExchRate],
  ['/stride.stakeibc.MsgClearBalance', MsgClearBalance],
];
export const load = (protoRegistry: Registry) => {
  registry.forEach(([typeUrl, mod]) => {
    protoRegistry.register(typeUrl, mod as GeneratedType);
  });
};
export const MessageComposer = {
  encoded: {
    liquidStake(value: MsgLiquidStake) {
      return {
        typeUrl: '/stride.stakeibc.MsgLiquidStake',
        value: MsgLiquidStake.encode(value).finish(),
      };
    },

    redeemStake(value: MsgRedeemStake) {
      return {
        typeUrl: '/stride.stakeibc.MsgRedeemStake',
        value: MsgRedeemStake.encode(value).finish(),
      };
    },

    registerHostZone(value: MsgRegisterHostZone) {
      return {
        typeUrl: '/stride.stakeibc.MsgRegisterHostZone',
        value: MsgRegisterHostZone.encode(value).finish(),
      };
    },

    claimUndelegatedTokens(value: MsgClaimUndelegatedTokens) {
      return {
        typeUrl: '/stride.stakeibc.MsgClaimUndelegatedTokens',
        value: MsgClaimUndelegatedTokens.encode(value).finish(),
      };
    },

    rebalanceValidators(value: MsgRebalanceValidators) {
      return {
        typeUrl: '/stride.stakeibc.MsgRebalanceValidators',
        value: MsgRebalanceValidators.encode(value).finish(),
      };
    },

    addValidator(value: MsgAddValidator) {
      return {
        typeUrl: '/stride.stakeibc.MsgAddValidator',
        value: MsgAddValidator.encode(value).finish(),
      };
    },

    changeValidatorWeight(value: MsgChangeValidatorWeight) {
      return {
        typeUrl: '/stride.stakeibc.MsgChangeValidatorWeight',
        value: MsgChangeValidatorWeight.encode(value).finish(),
      };
    },

    deleteValidator(value: MsgDeleteValidator) {
      return {
        typeUrl: '/stride.stakeibc.MsgDeleteValidator',
        value: MsgDeleteValidator.encode(value).finish(),
      };
    },

    restoreInterchainAccount(value: MsgRestoreInterchainAccount) {
      return {
        typeUrl: '/stride.stakeibc.MsgRestoreInterchainAccount',
        value: MsgRestoreInterchainAccount.encode(value).finish(),
      };
    },

    updateValidatorSharesExchRate(value: MsgUpdateValidatorSharesExchRate) {
      return {
        typeUrl: '/stride.stakeibc.MsgUpdateValidatorSharesExchRate',
        value: MsgUpdateValidatorSharesExchRate.encode(value).finish(),
      };
    },

    clearBalance(value: MsgClearBalance) {
      return {
        typeUrl: '/stride.stakeibc.MsgClearBalance',
        value: MsgClearBalance.encode(value).finish(),
      };
    },
  },
  withTypeUrl: {
    liquidStake(value: MsgLiquidStake) {
      return {
        typeUrl: '/stride.stakeibc.MsgLiquidStake',
        value,
      };
    },

    redeemStake(value: MsgRedeemStake) {
      return {
        typeUrl: '/stride.stakeibc.MsgRedeemStake',
        value,
      };
    },

    registerHostZone(value: MsgRegisterHostZone) {
      return {
        typeUrl: '/stride.stakeibc.MsgRegisterHostZone',
        value,
      };
    },

    claimUndelegatedTokens(value: MsgClaimUndelegatedTokens) {
      return {
        typeUrl: '/stride.stakeibc.MsgClaimUndelegatedTokens',
        value,
      };
    },

    rebalanceValidators(value: MsgRebalanceValidators) {
      return {
        typeUrl: '/stride.stakeibc.MsgRebalanceValidators',
        value,
      };
    },

    addValidator(value: MsgAddValidator) {
      return {
        typeUrl: '/stride.stakeibc.MsgAddValidator',
        value,
      };
    },

    changeValidatorWeight(value: MsgChangeValidatorWeight) {
      return {
        typeUrl: '/stride.stakeibc.MsgChangeValidatorWeight',
        value,
      };
    },

    deleteValidator(value: MsgDeleteValidator) {
      return {
        typeUrl: '/stride.stakeibc.MsgDeleteValidator',
        value,
      };
    },

    restoreInterchainAccount(value: MsgRestoreInterchainAccount) {
      return {
        typeUrl: '/stride.stakeibc.MsgRestoreInterchainAccount',
        value,
      };
    },

    updateValidatorSharesExchRate(value: MsgUpdateValidatorSharesExchRate) {
      return {
        typeUrl: '/stride.stakeibc.MsgUpdateValidatorSharesExchRate',
        value,
      };
    },

    clearBalance(value: MsgClearBalance) {
      return {
        typeUrl: '/stride.stakeibc.MsgClearBalance',
        value,
      };
    },
  },
  fromPartial: {
    liquidStake(value: MsgLiquidStake) {
      return {
        typeUrl: '/stride.stakeibc.MsgLiquidStake',
        value: MsgLiquidStake.fromPartial(value),
      };
    },

    redeemStake(value: MsgRedeemStake) {
      return {
        typeUrl: '/stride.stakeibc.MsgRedeemStake',
        value: MsgRedeemStake.fromPartial(value),
      };
    },

    registerHostZone(value: MsgRegisterHostZone) {
      return {
        typeUrl: '/stride.stakeibc.MsgRegisterHostZone',
        value: MsgRegisterHostZone.fromPartial(value),
      };
    },

    claimUndelegatedTokens(value: MsgClaimUndelegatedTokens) {
      return {
        typeUrl: '/stride.stakeibc.MsgClaimUndelegatedTokens',
        value: MsgClaimUndelegatedTokens.fromPartial(value),
      };
    },

    rebalanceValidators(value: MsgRebalanceValidators) {
      return {
        typeUrl: '/stride.stakeibc.MsgRebalanceValidators',
        value: MsgRebalanceValidators.fromPartial(value),
      };
    },

    addValidator(value: MsgAddValidator) {
      return {
        typeUrl: '/stride.stakeibc.MsgAddValidator',
        value: MsgAddValidator.fromPartial(value),
      };
    },

    changeValidatorWeight(value: MsgChangeValidatorWeight) {
      return {
        typeUrl: '/stride.stakeibc.MsgChangeValidatorWeight',
        value: MsgChangeValidatorWeight.fromPartial(value),
      };
    },

    deleteValidator(value: MsgDeleteValidator) {
      return {
        typeUrl: '/stride.stakeibc.MsgDeleteValidator',
        value: MsgDeleteValidator.fromPartial(value),
      };
    },

    restoreInterchainAccount(value: MsgRestoreInterchainAccount) {
      return {
        typeUrl: '/stride.stakeibc.MsgRestoreInterchainAccount',
        value: MsgRestoreInterchainAccount.fromPartial(value),
      };
    },

    updateValidatorSharesExchRate(value: MsgUpdateValidatorSharesExchRate) {
      return {
        typeUrl: '/stride.stakeibc.MsgUpdateValidatorSharesExchRate',
        value: MsgUpdateValidatorSharesExchRate.fromPartial(value),
      };
    },

    clearBalance(value: MsgClearBalance) {
      return {
        typeUrl: '/stride.stakeibc.MsgClearBalance',
        value: MsgClearBalance.fromPartial(value),
      };
    },
  },
};
