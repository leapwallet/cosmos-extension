import { BinaryReader } from '../../../binary';
import { Rpc } from '../../../helpers';
import {
  MsgAddCovenantSigs,
  MsgAddCovenantSigsResponse,
  MsgBTCUndelegate,
  MsgBTCUndelegateResponse,
  MsgCreateBTCDelegation,
  MsgCreateBTCDelegationResponse,
  MsgCreateFinalityProvider,
  MsgCreateFinalityProviderResponse,
  MsgEditFinalityProvider,
  MsgEditFinalityProviderResponse,
  MsgSelectiveSlashingEvidence,
  MsgSelectiveSlashingEvidenceResponse,
  MsgUpdateParams,
  MsgUpdateParamsResponse,
} from './tx';
/** Msg defines the Msg service.
 TODO: handle unbonding tx with full witness */
export interface Msg {
  /** CreateFinalityProvider creates a new finality provider */
  createFinalityProvider(request: MsgCreateFinalityProvider): Promise<MsgCreateFinalityProviderResponse>;
  /** EditFinalityProvider edits an existing finality provider */
  editFinalityProvider(request: MsgEditFinalityProvider): Promise<MsgEditFinalityProviderResponse>;
  /** CreateBTCDelegation creates a new BTC delegation */
  createBTCDelegation(request: MsgCreateBTCDelegation): Promise<MsgCreateBTCDelegationResponse>;
  /** AddCovenantSigs handles signatures from a covenant member */
  addCovenantSigs(request: MsgAddCovenantSigs): Promise<MsgAddCovenantSigsResponse>;
  /** BTCUndelegate handles a signature on unbonding tx from its delegator */
  bTCUndelegate(request: MsgBTCUndelegate): Promise<MsgBTCUndelegateResponse>;
  /**
   * SelectiveSlashingEvidence handles the evidence of selective slashing launched
   * by a finality provider
   */
  selectiveSlashingEvidence(request: MsgSelectiveSlashingEvidence): Promise<MsgSelectiveSlashingEvidenceResponse>;
  /** UpdateParams updates the btcstaking module parameters. */
  updateParams(request: MsgUpdateParams): Promise<MsgUpdateParamsResponse>;
}
export class MsgClientImpl implements Msg {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.createFinalityProvider = this.createFinalityProvider.bind(this);
    this.editFinalityProvider = this.editFinalityProvider.bind(this);
    this.createBTCDelegation = this.createBTCDelegation.bind(this);
    this.addCovenantSigs = this.addCovenantSigs.bind(this);
    this.bTCUndelegate = this.bTCUndelegate.bind(this);
    this.selectiveSlashingEvidence = this.selectiveSlashingEvidence.bind(this);
    this.updateParams = this.updateParams.bind(this);
  }
  createFinalityProvider(request: MsgCreateFinalityProvider): Promise<MsgCreateFinalityProviderResponse> {
    const data = MsgCreateFinalityProvider.encode(request).finish();
    const promise = this.rpc.request('babylon.btcstaking.v1.Msg', 'CreateFinalityProvider', data);
    return promise.then((data) => MsgCreateFinalityProviderResponse.decode(new BinaryReader(data)));
  }
  editFinalityProvider(request: MsgEditFinalityProvider): Promise<MsgEditFinalityProviderResponse> {
    const data = MsgEditFinalityProvider.encode(request).finish();
    const promise = this.rpc.request('babylon.btcstaking.v1.Msg', 'EditFinalityProvider', data);
    return promise.then((data) => MsgEditFinalityProviderResponse.decode(new BinaryReader(data)));
  }
  createBTCDelegation(request: MsgCreateBTCDelegation): Promise<MsgCreateBTCDelegationResponse> {
    const data = MsgCreateBTCDelegation.encode(request).finish();
    const promise = this.rpc.request('babylon.btcstaking.v1.Msg', 'CreateBTCDelegation', data);
    return promise.then((data) => MsgCreateBTCDelegationResponse.decode(new BinaryReader(data)));
  }
  addCovenantSigs(request: MsgAddCovenantSigs): Promise<MsgAddCovenantSigsResponse> {
    const data = MsgAddCovenantSigs.encode(request).finish();
    const promise = this.rpc.request('babylon.btcstaking.v1.Msg', 'AddCovenantSigs', data);
    return promise.then((data) => MsgAddCovenantSigsResponse.decode(new BinaryReader(data)));
  }
  bTCUndelegate(request: MsgBTCUndelegate): Promise<MsgBTCUndelegateResponse> {
    const data = MsgBTCUndelegate.encode(request).finish();
    const promise = this.rpc.request('babylon.btcstaking.v1.Msg', 'BTCUndelegate', data);
    return promise.then((data) => MsgBTCUndelegateResponse.decode(new BinaryReader(data)));
  }
  selectiveSlashingEvidence(request: MsgSelectiveSlashingEvidence): Promise<MsgSelectiveSlashingEvidenceResponse> {
    const data = MsgSelectiveSlashingEvidence.encode(request).finish();
    const promise = this.rpc.request('babylon.btcstaking.v1.Msg', 'SelectiveSlashingEvidence', data);
    return promise.then((data) => MsgSelectiveSlashingEvidenceResponse.decode(new BinaryReader(data)));
  }
  updateParams(request: MsgUpdateParams): Promise<MsgUpdateParamsResponse> {
    const data = MsgUpdateParams.encode(request).finish();
    const promise = this.rpc.request('babylon.btcstaking.v1.Msg', 'UpdateParams', data);
    return promise.then((data) => MsgUpdateParamsResponse.decode(new BinaryReader(data)));
  }
}
