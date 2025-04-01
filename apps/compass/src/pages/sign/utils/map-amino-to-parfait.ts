export const mapAminoToTypeUrl = (aminoType: string): string => {
  switch (aminoType) {
    case 'cosmos-sdk/MsgSend':
      return '/cosmos.bank.v1beta1.MsgSend'
    case 'cosmos-sdk/MsgMultiSend':
      return '/cosmos.bank.v1beta1.MsgMultiSend'
    case 'cosmos-sdk/MsgCreateValidator':
      return '/cosmos.staking.v1beta1.MsgCreateValidator'
    case 'cosmos-sdk/MsgEditValidator':
      return '/cosmos.staking.v1beta1.MsgEditValidator'
    case 'cosmos-sdk/MsgDelegate':
      return '/cosmos.staking.v1beta1.MsgDelegate'
    case 'cosmos-sdk/MsgUndelegate':
      return '/cosmos.staking.v1beta1.MsgUndelegate'
    case 'cosmos-sdk/MsgBeginRedelegate':
      return '/cosmos.staking.v1beta1.MsgBeginRedelegate'
    case 'cosmos-sdk/MsgVote':
      return '/cosmos.gov.v1beta1.MsgVote'
    case 'cosmos-sdk/MsgSubmitProposal':
      return '/cosmos.gov.v1beta1.MsgSubmitProposal'
    case 'cosmos-sdk/MsgDeposit':
      return '/cosmos.gov.v1beta1.MsgDeposit'
    case 'cosmos-sdk/MsgTransfer':
      return '/ibc.applications.transfer.v1.MsgTransfer'
    case 'cosmos-sdk/MsgUnjail':
      return '/cosmos.slashing.v1beta1.MsgUnjail'
    case 'osmosis/gamm/join-pool':
      return '/osmosis.gamm.v1beta1.MsgJoinPool'
    case 'osmosis/gamm/exit-pool':
      return '/osmosis.gamm.v1beta1.MsgExitPool'
    case 'osmosis/gamm/swap-exact-amount-in':
      return '/osmosis.gamm.v1beta1.MsgSwapExactAmountIn'
    case 'osmosis/gamm/swap-exact-amount-out':
      return '/osmosis.gamm.v1beta1.MsgSwapExactAmountOut'
    case 'osmosis/gamm/join-swap-extern-amount-in':
      return '/osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn'
    case 'osmosis/gamm/join-swap-share-amount-out':
      return '/osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOut'
    case 'osmosis/gamm/exit-swap-share-amount-in':
      return '/osmosis.gamm.v1beta1.MsgExitSwapShareAmountIn'
    case 'osmosis/gamm/exit-swap-extern-amount-out':
      return '/osmosis.gamm.v1beta1.MsgExitSwapExternAmountOut'
    default:
      return 'unknown'
  }
}
