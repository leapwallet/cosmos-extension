import { BinaryReader } from '../../../binary';
import { Rpc } from '../../../helpers';
import { MsgWrappedCreateValidator, MsgWrappedCreateValidatorResponse } from './tx';
/** Msg defines the checkpointing Msg service. */
export interface Msg {
  /** WrappedCreateValidator defines a method for registering a new validator */
  wrappedCreateValidator(request: MsgWrappedCreateValidator): Promise<MsgWrappedCreateValidatorResponse>;
}
export class MsgClientImpl implements Msg {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.wrappedCreateValidator = this.wrappedCreateValidator.bind(this);
  }
  wrappedCreateValidator(request: MsgWrappedCreateValidator): Promise<MsgWrappedCreateValidatorResponse> {
    const data = MsgWrappedCreateValidator.encode(request).finish();
    const promise = this.rpc.request('babylon.checkpointing.v1.Msg', 'WrappedCreateValidator', data);
    return promise.then((data) => MsgWrappedCreateValidatorResponse.decode(new BinaryReader(data)));
  }
}
