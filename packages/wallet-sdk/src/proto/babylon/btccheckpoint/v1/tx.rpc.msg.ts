import { BinaryReader } from '../../../binary';
import { Rpc } from '../../../helpers';
import { MsgInsertBTCSpvProof, MsgInsertBTCSpvProofResponse, MsgUpdateParams, MsgUpdateParamsResponse } from './tx';
/** Msg defines the Msg service. */
export interface Msg {
  /** InsertBTCSpvProof tries to insert a new checkpoint into the store. */
  insertBTCSpvProof(request: MsgInsertBTCSpvProof): Promise<MsgInsertBTCSpvProofResponse>;
  /** UpdateParams updates the btccheckpoint module parameters. */
  updateParams(request: MsgUpdateParams): Promise<MsgUpdateParamsResponse>;
}
export class MsgClientImpl implements Msg {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.insertBTCSpvProof = this.insertBTCSpvProof.bind(this);
    this.updateParams = this.updateParams.bind(this);
  }
  insertBTCSpvProof(request: MsgInsertBTCSpvProof): Promise<MsgInsertBTCSpvProofResponse> {
    const data = MsgInsertBTCSpvProof.encode(request).finish();
    const promise = this.rpc.request('babylon.btccheckpoint.v1.Msg', 'InsertBTCSpvProof', data);
    return promise.then((data) => MsgInsertBTCSpvProofResponse.decode(new BinaryReader(data)));
  }
  updateParams(request: MsgUpdateParams): Promise<MsgUpdateParamsResponse> {
    const data = MsgUpdateParams.encode(request).finish();
    const promise = this.rpc.request('babylon.btccheckpoint.v1.Msg', 'UpdateParams', data);
    return promise.then((data) => MsgUpdateParamsResponse.decode(new BinaryReader(data)));
  }
}
