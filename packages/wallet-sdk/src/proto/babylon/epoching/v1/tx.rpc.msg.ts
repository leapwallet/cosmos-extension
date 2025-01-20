import { BinaryReader } from '../../../binary';
import { Rpc } from '../../../helpers';
import {
  MsgUpdateParams,
  MsgUpdateParamsResponse,
  MsgWrappedBeginRedelegate,
  MsgWrappedBeginRedelegateResponse,
  MsgWrappedCancelUnbondingDelegation,
  MsgWrappedCancelUnbondingDelegationResponse,
  MsgWrappedDelegate,
  MsgWrappedDelegateResponse,
  MsgWrappedUndelegate,
  MsgWrappedUndelegateResponse,
} from './tx';
/** Msg defines the Msg service. */
export interface Msg {
  /**
   * WrappedDelegate defines a method for performing a delegation of coins from
   * a delegator to a validator.
   */
  wrappedDelegate(request: MsgWrappedDelegate): Promise<MsgWrappedDelegateResponse>;
  /**
   * WrappedUndelegate defines a method for performing an undelegation from a
   * delegate and a validator.
   */
  wrappedUndelegate(request: MsgWrappedUndelegate): Promise<MsgWrappedUndelegateResponse>;
  /**
   * WrappedBeginRedelegate defines a method for performing a redelegation of
   * coins from a delegator and source validator to a destination validator.
   */
  wrappedBeginRedelegate(request: MsgWrappedBeginRedelegate): Promise<MsgWrappedBeginRedelegateResponse>;
  /**
   * WrappedCancelUnbondingDelegation defines a method for cancelling unbonding of
   * coins from a delegator and source validator to a destination validator.
   */
  wrappedCancelUnbondingDelegation(
    request?: MsgWrappedCancelUnbondingDelegation,
  ): Promise<MsgWrappedCancelUnbondingDelegationResponse>;
  /** UpdateParams defines a method for updating epoching module parameters. */
  updateParams(request: MsgUpdateParams): Promise<MsgUpdateParamsResponse>;
}
export class MsgClientImpl implements Msg {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.wrappedDelegate = this.wrappedDelegate.bind(this);
    this.wrappedUndelegate = this.wrappedUndelegate.bind(this);
    this.wrappedBeginRedelegate = this.wrappedBeginRedelegate.bind(this);
    this.wrappedCancelUnbondingDelegation = this.wrappedCancelUnbondingDelegation.bind(this);
    this.updateParams = this.updateParams.bind(this);
  }
  wrappedDelegate(request: MsgWrappedDelegate): Promise<MsgWrappedDelegateResponse> {
    const data = MsgWrappedDelegate.encode(request).finish();
    const promise = this.rpc.request('babylon.epoching.v1.Msg', 'WrappedDelegate', data);
    return promise.then((data) => MsgWrappedDelegateResponse.decode(new BinaryReader(data)));
  }
  wrappedUndelegate(request: MsgWrappedUndelegate): Promise<MsgWrappedUndelegateResponse> {
    const data = MsgWrappedUndelegate.encode(request).finish();
    const promise = this.rpc.request('babylon.epoching.v1.Msg', 'WrappedUndelegate', data);
    return promise.then((data) => MsgWrappedUndelegateResponse.decode(new BinaryReader(data)));
  }
  wrappedBeginRedelegate(request: MsgWrappedBeginRedelegate): Promise<MsgWrappedBeginRedelegateResponse> {
    const data = MsgWrappedBeginRedelegate.encode(request).finish();
    const promise = this.rpc.request('babylon.epoching.v1.Msg', 'WrappedBeginRedelegate', data);
    return promise.then((data) => MsgWrappedBeginRedelegateResponse.decode(new BinaryReader(data)));
  }
  wrappedCancelUnbondingDelegation(
    request: MsgWrappedCancelUnbondingDelegation = {},
  ): Promise<MsgWrappedCancelUnbondingDelegationResponse> {
    const data = MsgWrappedCancelUnbondingDelegation.encode(request).finish();
    const promise = this.rpc.request('babylon.epoching.v1.Msg', 'WrappedCancelUnbondingDelegation', data);
    return promise.then((data) => MsgWrappedCancelUnbondingDelegationResponse.decode(new BinaryReader(data)));
  }
  updateParams(request: MsgUpdateParams): Promise<MsgUpdateParamsResponse> {
    const data = MsgUpdateParams.encode(request).finish();
    const promise = this.rpc.request('babylon.epoching.v1.Msg', 'UpdateParams', data);
    return promise.then((data) => MsgUpdateParamsResponse.decode(new BinaryReader(data)));
  }
}
