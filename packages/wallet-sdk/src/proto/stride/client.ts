import * as strideClaimTxAmino from './claim/tx.amino';
import * as strideInterchainqueryV1MessagesAmino from './interchainquery/v1/messages.amino';
import * as strideStakeibcTxAmino from './stakeibc/tx.amino';

export const strideAminoConverters = {
  ...strideClaimTxAmino.AminoConverter,
  ...strideInterchainqueryV1MessagesAmino.AminoConverter,
  ...strideStakeibcTxAmino.AminoConverter,
};
