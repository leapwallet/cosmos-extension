import { GeneratedType, Registry } from '@cosmjs/proto-signing';

import {
  MsgAddCovenantSigs,
  MsgBTCUndelegate,
  MsgCreateBTCDelegation,
  MsgCreateFinalityProvider,
  MsgEditFinalityProvider,
  MsgSelectiveSlashingEvidence,
  MsgUpdateParams,
} from './tx';
export const registry: ReadonlyArray<[string, GeneratedType]> = [
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ['/babylon.btcstaking.v1.MsgCreateFinalityProvider', MsgCreateFinalityProvider],
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ['/babylon.btcstaking.v1.MsgEditFinalityProvider', MsgEditFinalityProvider],
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ['/babylon.btcstaking.v1.MsgCreateBTCDelegation', MsgCreateBTCDelegation],
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ['/babylon.btcstaking.v1.MsgAddCovenantSigs', MsgAddCovenantSigs],
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ['/babylon.btcstaking.v1.MsgBTCUndelegate', MsgBTCUndelegate],
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ['/babylon.btcstaking.v1.MsgSelectiveSlashingEvidence', MsgSelectiveSlashingEvidence],
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ['/babylon.btcstaking.v1.MsgUpdateParams', MsgUpdateParams],
];
export const load = (protoRegistry: Registry) => {
  registry.forEach(([typeUrl, mod]) => {
    protoRegistry.register(typeUrl, mod);
  });
};
export const MessageComposer = {
  encoded: {
    createFinalityProvider(value: MsgCreateFinalityProvider) {
      return {
        typeUrl: '/babylon.btcstaking.v1.MsgCreateFinalityProvider',
        value: MsgCreateFinalityProvider.encode(value).finish(),
      };
    },
    editFinalityProvider(value: MsgEditFinalityProvider) {
      return {
        typeUrl: '/babylon.btcstaking.v1.MsgEditFinalityProvider',
        value: MsgEditFinalityProvider.encode(value).finish(),
      };
    },
    createBTCDelegation(value: MsgCreateBTCDelegation) {
      return {
        typeUrl: '/babylon.btcstaking.v1.MsgCreateBTCDelegation',
        value: MsgCreateBTCDelegation.encode(value).finish(),
      };
    },
    addCovenantSigs(value: MsgAddCovenantSigs) {
      return {
        typeUrl: '/babylon.btcstaking.v1.MsgAddCovenantSigs',
        value: MsgAddCovenantSigs.encode(value).finish(),
      };
    },
    bTCUndelegate(value: MsgBTCUndelegate) {
      return {
        typeUrl: '/babylon.btcstaking.v1.MsgBTCUndelegate',
        value: MsgBTCUndelegate.encode(value).finish(),
      };
    },
    selectiveSlashingEvidence(value: MsgSelectiveSlashingEvidence) {
      return {
        typeUrl: '/babylon.btcstaking.v1.MsgSelectiveSlashingEvidence',
        value: MsgSelectiveSlashingEvidence.encode(value).finish(),
      };
    },
    updateParams(value: MsgUpdateParams) {
      return {
        typeUrl: '/babylon.btcstaking.v1.MsgUpdateParams',
        value: MsgUpdateParams.encode(value).finish(),
      };
    },
  },
  withTypeUrl: {
    createFinalityProvider(value: MsgCreateFinalityProvider) {
      return {
        typeUrl: '/babylon.btcstaking.v1.MsgCreateFinalityProvider',
        value,
      };
    },
    editFinalityProvider(value: MsgEditFinalityProvider) {
      return {
        typeUrl: '/babylon.btcstaking.v1.MsgEditFinalityProvider',
        value,
      };
    },
    createBTCDelegation(value: MsgCreateBTCDelegation) {
      return {
        typeUrl: '/babylon.btcstaking.v1.MsgCreateBTCDelegation',
        value,
      };
    },
    addCovenantSigs(value: MsgAddCovenantSigs) {
      return {
        typeUrl: '/babylon.btcstaking.v1.MsgAddCovenantSigs',
        value,
      };
    },
    bTCUndelegate(value: MsgBTCUndelegate) {
      return {
        typeUrl: '/babylon.btcstaking.v1.MsgBTCUndelegate',
        value,
      };
    },
    selectiveSlashingEvidence(value: MsgSelectiveSlashingEvidence) {
      return {
        typeUrl: '/babylon.btcstaking.v1.MsgSelectiveSlashingEvidence',
        value,
      };
    },
    updateParams(value: MsgUpdateParams) {
      return {
        typeUrl: '/babylon.btcstaking.v1.MsgUpdateParams',
        value,
      };
    },
  },
  fromPartial: {
    createFinalityProvider(value: MsgCreateFinalityProvider) {
      return {
        typeUrl: '/babylon.btcstaking.v1.MsgCreateFinalityProvider',
        value: MsgCreateFinalityProvider.fromPartial(value),
      };
    },
    editFinalityProvider(value: MsgEditFinalityProvider) {
      return {
        typeUrl: '/babylon.btcstaking.v1.MsgEditFinalityProvider',
        value: MsgEditFinalityProvider.fromPartial(value),
      };
    },
    createBTCDelegation(value: MsgCreateBTCDelegation) {
      return {
        typeUrl: '/babylon.btcstaking.v1.MsgCreateBTCDelegation',
        value: MsgCreateBTCDelegation.fromPartial(value),
      };
    },
    addCovenantSigs(value: MsgAddCovenantSigs) {
      return {
        typeUrl: '/babylon.btcstaking.v1.MsgAddCovenantSigs',
        value: MsgAddCovenantSigs.fromPartial(value),
      };
    },
    bTCUndelegate(value: MsgBTCUndelegate) {
      return {
        typeUrl: '/babylon.btcstaking.v1.MsgBTCUndelegate',
        value: MsgBTCUndelegate.fromPartial(value),
      };
    },
    selectiveSlashingEvidence(value: MsgSelectiveSlashingEvidence) {
      return {
        typeUrl: '/babylon.btcstaking.v1.MsgSelectiveSlashingEvidence',
        value: MsgSelectiveSlashingEvidence.fromPartial(value),
      };
    },
    updateParams(value: MsgUpdateParams) {
      return {
        typeUrl: '/babylon.btcstaking.v1.MsgUpdateParams',
        value: MsgUpdateParams.fromPartial(value),
      };
    },
  },
};
