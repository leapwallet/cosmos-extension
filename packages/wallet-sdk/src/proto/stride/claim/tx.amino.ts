import { MsgClaimFreeAmount, MsgCreateAirdrop, MsgDeleteAirdrop, MsgSetAirdropAllocations } from './tx';

export const AminoConverter = {
  '/stride.claim.MsgSetAirdropAllocations': {
    aminoType: '/stride.claim.MsgSetAirdropAllocations',
    toAmino: MsgSetAirdropAllocations.toAmino,
    fromAmino: MsgSetAirdropAllocations.fromAmino,
  },
  '/stride.claim.MsgClaimFreeAmount': {
    aminoType: 'claim/ClaimFreeAmount',
    toAmino: MsgClaimFreeAmount.toAmino,
    fromAmino: MsgClaimFreeAmount.fromAmino,
  },
  '/stride.claim.MsgCreateAirdrop': {
    aminoType: '/stride.claim.MsgCreateAirdrop',
    toAmino: MsgCreateAirdrop.toAmino,
    fromAmino: MsgCreateAirdrop.fromAmino,
  },
  '/stride.claim.MsgDeleteAirdrop': {
    aminoType: '/stride.claim.MsgDeleteAirdrop',
    toAmino: MsgDeleteAirdrop.toAmino,
    fromAmino: MsgDeleteAirdrop.fromAmino,
  },
};
