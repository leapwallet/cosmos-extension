import MsgGrant from './authz/msgs/MsgGrant';
import MsgRevoke from './authz/msgs/MsgRevoke';
import MsgSend from './bank/msgs/MsgSend';
import MsgWithdrawDelegatorReward from './distribution/msgs/MsgWithdrawDelegatorReward';
import MsgVote from './gov/msgs/MsgVote';
import MsgTransfer from './ibc/msgs/MsgTransfer';
import MsgBeginRedelegate from './staking/msgs/MsgBeginRedelegate';
import MsgDelegate from './staking/msgs/MsgDelegate';
import MsgUndelegate from './staking/msgs/MsgUndelegate';
import MsgExecuteContract from './wasm/msgs/MsgExecuteContract';
import MsgExecuteContractCompat from './wasm/msgs/MsgExecuteContractCompat';

/**
 * @category Messages
 */
export type Msgs =
  | MsgGrant
  | MsgRevoke
  | MsgSend
  | MsgWithdrawDelegatorReward
  | MsgVote
  | MsgTransfer
  | MsgDelegate
  | MsgUndelegate
  | MsgBeginRedelegate
  | MsgExecuteContract
  | MsgExecuteContractCompat;
