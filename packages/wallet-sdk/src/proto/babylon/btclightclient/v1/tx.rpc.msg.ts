import { BinaryReader } from '../../../binary';
import { Rpc } from '../../../helpers';
import { MsgInsertHeaders, MsgInsertHeadersResponse, MsgUpdateParams, MsgUpdateParamsResponse } from './tx';
/** Msg defines the Msg service. */
export interface Msg {
  /** InsertHeaders adds a batch of headers to the BTC light client chain */
  insertHeaders(request: MsgInsertHeaders): Promise<MsgInsertHeadersResponse>;
  /** UpdateParams defines a method for updating btc light client module parameters. */
  updateParams(request: MsgUpdateParams): Promise<MsgUpdateParamsResponse>;
}
export class MsgClientImpl implements Msg {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.insertHeaders = this.insertHeaders.bind(this);
    this.updateParams = this.updateParams.bind(this);
  }
  insertHeaders(request: MsgInsertHeaders): Promise<MsgInsertHeadersResponse> {
    const data = MsgInsertHeaders.encode(request).finish();
    const promise = this.rpc.request('babylon.btclightclient.v1.Msg', 'InsertHeaders', data);
    return promise.then((data) => MsgInsertHeadersResponse.decode(new BinaryReader(data)));
  }
  updateParams(request: MsgUpdateParams): Promise<MsgUpdateParamsResponse> {
    const data = MsgUpdateParams.encode(request).finish();
    const promise = this.rpc.request('babylon.btclightclient.v1.Msg', 'UpdateParams', data);
    return promise.then((data) => MsgUpdateParamsResponse.decode(new BinaryReader(data)));
  }
}
