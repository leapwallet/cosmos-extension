import {
  MsgDeposit,
  MsgExecLegacyContent,
  MsgProposeConstitutionAmendment,
  MsgProposeLaw,
  MsgSubmitProposal,
  MsgUpdateParams,
  MsgVote,
  MsgVoteWeighted,
} from './tx';

export const AminoConverter = {
  '/atomone.gov.v1.MsgSubmitProposal': {
    aminoType: 'atomone/v1/MsgSubmitProposal',
    toAmino: MsgSubmitProposal.toAmino,
    fromAmino: MsgSubmitProposal.fromAmino,
  },
  '/atomone.gov.v1.MsgExecLegacyContent': {
    aminoType: 'atomone/v1/MsgExecLegacyContent',
    toAmino: MsgExecLegacyContent.toAmino,
    fromAmino: MsgExecLegacyContent.fromAmino,
  },
  '/atomone.gov.v1.MsgVote': {
    aminoType: 'atomone/v1/MsgVote',
    toAmino: MsgVote.toAmino,
    fromAmino: MsgVote.fromAmino,
  },
  '/atomone.gov.v1.MsgVoteWeighted': {
    aminoType: 'atomone/v1/MsgVoteWeighted',
    toAmino: MsgVoteWeighted.toAmino,
    fromAmino: MsgVoteWeighted.fromAmino,
  },
  '/atomone.gov.v1.MsgDeposit': {
    aminoType: 'atomone/v1/MsgDeposit',
    toAmino: MsgDeposit.toAmino,
    fromAmino: MsgDeposit.fromAmino,
  },
  '/atomone.gov.v1.MsgUpdateParams': {
    aminoType: 'atomone/x/gov/v1/MsgUpdateParams',
    toAmino: MsgUpdateParams.toAmino,
    fromAmino: MsgUpdateParams.fromAmino,
  },
  '/atomone.gov.v1.MsgProposeLaw': {
    aminoType: 'atomone/x/gov/v1/MsgProposeLaw',
    toAmino: MsgProposeLaw.toAmino,
    fromAmino: MsgProposeLaw.fromAmino,
  },
  '/atomone.gov.v1.MsgProposeConstitutionAmendment': {
    aminoType: 'atomone/x/gov/v1/MsgProposeAmendment',
    toAmino: MsgProposeConstitutionAmendment.toAmino,
    fromAmino: MsgProposeConstitutionAmendment.fromAmino,
  },
};
