// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { GeneratedType } from '@cosmjs/proto-signing';

import * as initiaMoveV1TxAmino from './move/tx.amino';
import * as initiaMoveV1TxRegistry from './move/tx.registry';
import * as initiaMstakingV1TxAmino from './mstaking/tx.amino';
import * as initiaMstakingV1TxRegistry from './mstaking/tx.registry';
import { MsgInitiateTokenDeposit } from './opinit/ophost/tx';

export const initiaAminoConverters = {
  ...initiaMstakingV1TxAmino.AminoConverter,
  ...initiaMoveV1TxAmino.AminoConverter,
  '/opinit.ophost.v1.MsgInitiateTokenDeposit': {
    aminoType: 'ophost/MsgInitiateTokenDeposit',
    toAmino: MsgInitiateTokenDeposit.toAmino,
    fromAmino: MsgInitiateTokenDeposit.fromAmino,
  },
};

export const initiaProtoRegistry: ReadonlyArray<[string, GeneratedType]> = [
  ...initiaMstakingV1TxRegistry.registry,
  ...initiaMoveV1TxRegistry.registry,
  ['/opinit.ophost.v1.MsgInitiateTokenDeposit', MsgInitiateTokenDeposit],
];
