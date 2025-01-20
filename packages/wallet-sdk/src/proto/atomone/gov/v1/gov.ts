import { Any, AnyAmino } from '../../../any';
import { BinaryReader, BinaryWriter } from '../../../binary';
import { Coin, CoinAmino } from '../../../coin';
import { Duration, DurationAmino } from '../../../duration';
import { fromJsonTimestamp, fromTimestamp, isSet } from '../../../helpers';
import { Timestamp } from '../../../timestamp';

export const protobufPackage = 'atomone.gov.v1';
/** VoteOption enumerates the valid vote options for a given governance proposal. */
export enum VoteOption {
  /** VOTE_OPTION_UNSPECIFIED - VOTE_OPTION_UNSPECIFIED defines a no-op vote option. */
  VOTE_OPTION_UNSPECIFIED = 0,
  /** VOTE_OPTION_YES - VOTE_OPTION_YES defines a yes vote option. */
  VOTE_OPTION_YES = 1,
  /** VOTE_OPTION_ABSTAIN - VOTE_OPTION_ABSTAIN defines an abstain vote option. */
  VOTE_OPTION_ABSTAIN = 2,
  /** VOTE_OPTION_NO - VOTE_OPTION_NO defines a no vote option. */
  VOTE_OPTION_NO = 3,
  UNRECOGNIZED = -1,
}
export const VoteOptionAmino = VoteOption;
export function voteOptionFromJSON(object: any): VoteOption {
  switch (object) {
    case 0:
    case 'VOTE_OPTION_UNSPECIFIED':
      return VoteOption.VOTE_OPTION_UNSPECIFIED;
    case 1:
    case 'VOTE_OPTION_YES':
      return VoteOption.VOTE_OPTION_YES;
    case 2:
    case 'VOTE_OPTION_ABSTAIN':
      return VoteOption.VOTE_OPTION_ABSTAIN;
    case 3:
    case 'VOTE_OPTION_NO':
      return VoteOption.VOTE_OPTION_NO;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return VoteOption.UNRECOGNIZED;
  }
}
export function voteOptionToJSON(object: VoteOption): string {
  switch (object) {
    case VoteOption.VOTE_OPTION_UNSPECIFIED:
      return 'VOTE_OPTION_UNSPECIFIED';
    case VoteOption.VOTE_OPTION_YES:
      return 'VOTE_OPTION_YES';
    case VoteOption.VOTE_OPTION_ABSTAIN:
      return 'VOTE_OPTION_ABSTAIN';
    case VoteOption.VOTE_OPTION_NO:
      return 'VOTE_OPTION_NO';
    case VoteOption.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}
/** ProposalStatus enumerates the valid statuses of a proposal. */
export enum ProposalStatus {
  /** PROPOSAL_STATUS_UNSPECIFIED - PROPOSAL_STATUS_UNSPECIFIED defines the default proposal status. */
  PROPOSAL_STATUS_UNSPECIFIED = 0,
  /**
   * PROPOSAL_STATUS_DEPOSIT_PERIOD - PROPOSAL_STATUS_DEPOSIT_PERIOD defines a proposal status during the deposit
   * period.
   */
  PROPOSAL_STATUS_DEPOSIT_PERIOD = 1,
  /**
   * PROPOSAL_STATUS_VOTING_PERIOD - PROPOSAL_STATUS_VOTING_PERIOD defines a proposal status during the voting
   * period.
   */
  PROPOSAL_STATUS_VOTING_PERIOD = 2,
  /**
   * PROPOSAL_STATUS_PASSED - PROPOSAL_STATUS_PASSED defines a proposal status of a proposal that has
   * passed.
   */
  PROPOSAL_STATUS_PASSED = 3,
  /**
   * PROPOSAL_STATUS_REJECTED - PROPOSAL_STATUS_REJECTED defines a proposal status of a proposal that has
   * been rejected.
   */
  PROPOSAL_STATUS_REJECTED = 4,
  /**
   * PROPOSAL_STATUS_FAILED - PROPOSAL_STATUS_FAILED defines a proposal status of a proposal that has
   * failed.
   */
  PROPOSAL_STATUS_FAILED = 5,
  UNRECOGNIZED = -1,
}
export const ProposalStatusAmino = ProposalStatus;
export function proposalStatusFromJSON(object: any): ProposalStatus {
  switch (object) {
    case 0:
    case 'PROPOSAL_STATUS_UNSPECIFIED':
      return ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED;
    case 1:
    case 'PROPOSAL_STATUS_DEPOSIT_PERIOD':
      return ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD;
    case 2:
    case 'PROPOSAL_STATUS_VOTING_PERIOD':
      return ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD;
    case 3:
    case 'PROPOSAL_STATUS_PASSED':
      return ProposalStatus.PROPOSAL_STATUS_PASSED;
    case 4:
    case 'PROPOSAL_STATUS_REJECTED':
      return ProposalStatus.PROPOSAL_STATUS_REJECTED;
    case 5:
    case 'PROPOSAL_STATUS_FAILED':
      return ProposalStatus.PROPOSAL_STATUS_FAILED;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return ProposalStatus.UNRECOGNIZED;
  }
}
export function proposalStatusToJSON(object: ProposalStatus): string {
  switch (object) {
    case ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED:
      return 'PROPOSAL_STATUS_UNSPECIFIED';
    case ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD:
      return 'PROPOSAL_STATUS_DEPOSIT_PERIOD';
    case ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD:
      return 'PROPOSAL_STATUS_VOTING_PERIOD';
    case ProposalStatus.PROPOSAL_STATUS_PASSED:
      return 'PROPOSAL_STATUS_PASSED';
    case ProposalStatus.PROPOSAL_STATUS_REJECTED:
      return 'PROPOSAL_STATUS_REJECTED';
    case ProposalStatus.PROPOSAL_STATUS_FAILED:
      return 'PROPOSAL_STATUS_FAILED';
    case ProposalStatus.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}
/** WeightedVoteOption defines a unit of vote for vote split. */
export interface WeightedVoteOption {
  /**
   * option defines the valid vote options, it must not contain duplicate vote
   * options.
   */
  option: VoteOption;
  /** weight is the vote weight associated with the vote option. */
  weight: string;
}
export interface WeightedVoteOptionProtoMsg {
  typeUrl: '/atomone.gov.v1.WeightedVoteOption';
  value: Uint8Array;
}
/** WeightedVoteOption defines a unit of vote for vote split. */
export interface WeightedVoteOptionAmino {
  /**
   * option defines the valid vote options, it must not contain duplicate vote
   * options.
   */
  option?: VoteOption;
  /** weight is the vote weight associated with the vote option. */
  weight?: string;
}
export interface WeightedVoteOptionAminoMsg {
  type: '/atomone.gov.v1.WeightedVoteOption';
  value: WeightedVoteOptionAmino;
}
/**
 * Deposit defines an amount deposited by an account address to an active
 * proposal.
 */
export interface Deposit {
  /** proposal_id defines the unique id of the proposal. */
  proposalId: bigint;
  /** depositor defines the deposit addresses from the proposals. */
  depositor: string;
  /** amount to be deposited by depositor. */
  amount: Coin[];
}
export interface DepositProtoMsg {
  typeUrl: '/atomone.gov.v1.Deposit';
  value: Uint8Array;
}
/**
 * Deposit defines an amount deposited by an account address to an active
 * proposal.
 */
export interface DepositAmino {
  /** proposal_id defines the unique id of the proposal. */
  proposal_id?: string;
  /** depositor defines the deposit addresses from the proposals. */
  depositor?: string;
  /** amount to be deposited by depositor. */
  amount: CoinAmino[];
}
export interface DepositAminoMsg {
  type: '/atomone.gov.v1.Deposit';
  value: DepositAmino;
}
/** Proposal defines the core field members of a governance proposal. */
export interface Proposal {
  /** id defines the unique id of the proposal. */
  id: bigint;
  /** messages are the arbitrary messages to be executed if the proposal passes. */
  messages: Any[];
  /** status defines the proposal status. */
  status: ProposalStatus;
  /**
   * final_tally_result is the final tally result of the proposal. When
   * querying a proposal via gRPC, this field is not populated until the
   * proposal's voting period has ended.
   */
  finalTallyResult?: TallyResult | undefined;
  /** submit_time is the time of proposal submission. */
  submitTime?: Timestamp | undefined;
  /** deposit_end_time is the end time for deposition. */
  depositEndTime?: Timestamp | undefined;
  /** total_deposit is the total deposit on the proposal. */
  totalDeposit: Coin[];
  /** voting_start_time is the starting time to vote on a proposal. */
  votingStartTime?: Timestamp | undefined;
  /** voting_end_time is the end time of voting on a proposal. */
  votingEndTime?: Timestamp | undefined;
  /** metadata is any arbitrary metadata attached to the proposal. */
  metadata: string;
  /**
   * title is the title of the proposal
   *
   * Since: cosmos-sdk 0.47
   */
  title: string;
  /**
   * summary is a short summary of the proposal
   *
   * Since: cosmos-sdk 0.47
   */
  summary: string;
  /**
   * Proposer is the address of the proposal sumbitter
   *
   * Since: cosmos-sdk 0.47
   */
  proposer: string;
}
export interface ProposalProtoMsg {
  typeUrl: '/atomone.gov.v1.Proposal';
  value: Uint8Array;
}
/** Proposal defines the core field members of a governance proposal. */
export interface ProposalAmino {
  /** id defines the unique id of the proposal. */
  id?: string;
  /** messages are the arbitrary messages to be executed if the proposal passes. */
  messages?: AnyAmino[];
  /** status defines the proposal status. */
  status?: ProposalStatus;
  /**
   * final_tally_result is the final tally result of the proposal. When
   * querying a proposal via gRPC, this field is not populated until the
   * proposal's voting period has ended.
   */
  final_tally_result?: TallyResultAmino | undefined;
  /** submit_time is the time of proposal submission. */
  submit_time?: string | undefined;
  /** deposit_end_time is the end time for deposition. */
  deposit_end_time?: string | undefined;
  /** total_deposit is the total deposit on the proposal. */
  total_deposit: CoinAmino[];
  /** voting_start_time is the starting time to vote on a proposal. */
  voting_start_time?: string | undefined;
  /** voting_end_time is the end time of voting on a proposal. */
  voting_end_time?: string | undefined;
  /** metadata is any arbitrary metadata attached to the proposal. */
  metadata?: string;
  /**
   * title is the title of the proposal
   *
   * Since: cosmos-sdk 0.47
   */
  title?: string;
  /**
   * summary is a short summary of the proposal
   *
   * Since: cosmos-sdk 0.47
   */
  summary?: string;
  /**
   * Proposer is the address of the proposal sumbitter
   *
   * Since: cosmos-sdk 0.47
   */
  proposer?: string;
}
export interface ProposalAminoMsg {
  type: '/atomone.gov.v1.Proposal';
  value: ProposalAmino;
}
/** TallyResult defines a standard tally for a governance proposal. */
export interface TallyResult {
  /** yes_count is the number of yes votes on a proposal. */
  yesCount: string;
  /** abstain_count is the number of abstain votes on a proposal. */
  abstainCount: string;
  /** no_count is the number of no votes on a proposal. */
  noCount: string;
}
export interface TallyResultProtoMsg {
  typeUrl: '/atomone.gov.v1.TallyResult';
  value: Uint8Array;
}
/** TallyResult defines a standard tally for a governance proposal. */
export interface TallyResultAmino {
  /** yes_count is the number of yes votes on a proposal. */
  yes_count?: string;
  /** abstain_count is the number of abstain votes on a proposal. */
  abstain_count?: string;
  /** no_count is the number of no votes on a proposal. */
  no_count?: string;
}
export interface TallyResultAminoMsg {
  type: '/atomone.gov.v1.TallyResult';
  value: TallyResultAmino;
}
/**
 * Vote defines a vote on a governance proposal.
 * A Vote consists of a proposal ID, the voter, and the vote option.
 */
export interface Vote {
  /** proposal_id defines the unique id of the proposal. */
  proposalId: bigint;
  /** voter is the voter address of the proposal. */
  voter: string;
  /** options is the weighted vote options. */
  options: WeightedVoteOption[];
  /** metadata is any  arbitrary metadata to attached to the vote. */
  metadata: string;
}
export interface VoteProtoMsg {
  typeUrl: '/atomone.gov.v1.Vote';
  value: Uint8Array;
}
/**
 * Vote defines a vote on a governance proposal.
 * A Vote consists of a proposal ID, the voter, and the vote option.
 */
export interface VoteAmino {
  /** proposal_id defines the unique id of the proposal. */
  proposal_id?: string;
  /** voter is the voter address of the proposal. */
  voter?: string;
  /** options is the weighted vote options. */
  options?: WeightedVoteOptionAmino[];
  /** metadata is any  arbitrary metadata to attached to the vote. */
  metadata?: string;
}
export interface VoteAminoMsg {
  type: '/atomone.gov.v1.Vote';
  value: VoteAmino;
}
/** QuorumCheckQueueEntry defines a quorum check queue entry. */
export interface QuorumCheckQueueEntry {
  /**
   * quorum_timeout_time is the time after which quorum checks start happening
   * and voting period is extended if proposal reaches quorum.
   */
  quorumTimeoutTime?: Timestamp | undefined;
  /**
   * quorum_check_count is the number of times quorum will be checked.
   * This is a snapshot of the parameter value with the same name when the
   * proposal is initially added to the queue.
   */
  quorumCheckCount: bigint;
  /** quorum_checks_done is the number of quorum checks that have been done. */
  quorumChecksDone: bigint;
}
export interface QuorumCheckQueueEntryProtoMsg {
  typeUrl: '/atomone.gov.v1.QuorumCheckQueueEntry';
  value: Uint8Array;
}
/** QuorumCheckQueueEntry defines a quorum check queue entry. */
export interface QuorumCheckQueueEntryAmino {
  /**
   * quorum_timeout_time is the time after which quorum checks start happening
   * and voting period is extended if proposal reaches quorum.
   */
  quorum_timeout_time?: string | undefined;
  /**
   * quorum_check_count is the number of times quorum will be checked.
   * This is a snapshot of the parameter value with the same name when the
   * proposal is initially added to the queue.
   */
  quorum_check_count?: string;
  /** quorum_checks_done is the number of quorum checks that have been done. */
  quorum_checks_done?: string;
}
export interface QuorumCheckQueueEntryAminoMsg {
  type: '/atomone.gov.v1.QuorumCheckQueueEntry';
  value: QuorumCheckQueueEntryAmino;
}
/** DepositParams defines the params for deposits on governance proposals. */
export interface DepositParams {
  /** Minimum deposit for a proposal to enter voting period. */
  minDeposit: Coin[];
  /**
   * Maximum period for Atom holders to deposit on a proposal. Initial value: 2
   * months.
   */
  maxDepositPeriod?: Duration | undefined;
}
export interface DepositParamsProtoMsg {
  typeUrl: '/atomone.gov.v1.DepositParams';
  value: Uint8Array;
}
/** DepositParams defines the params for deposits on governance proposals. */
export interface DepositParamsAmino {
  /** Minimum deposit for a proposal to enter voting period. */
  min_deposit?: CoinAmino[];
  /**
   * Maximum period for Atom holders to deposit on a proposal. Initial value: 2
   * months.
   */
  max_deposit_period?: DurationAmino | undefined;
}
export interface DepositParamsAminoMsg {
  type: '/atomone.gov.v1.DepositParams';
  value: DepositParamsAmino;
}
/** VotingParams defines the params for voting on governance proposals. */
export interface VotingParams {
  /** Duration of the voting period. */
  votingPeriod?: Duration | undefined;
}
export interface VotingParamsProtoMsg {
  typeUrl: '/atomone.gov.v1.VotingParams';
  value: Uint8Array;
}
/** VotingParams defines the params for voting on governance proposals. */
export interface VotingParamsAmino {
  /** Duration of the voting period. */
  voting_period?: DurationAmino | undefined;
}
export interface VotingParamsAminoMsg {
  type: '/atomone.gov.v1.VotingParams';
  value: VotingParamsAmino;
}
/** TallyParams defines the params for tallying votes on governance proposals. */
export interface TallyParams {
  /**
   * Minimum percentage of total stake needed to vote for a result to be
   * considered valid.
   */
  quorum: string;
  /** Minimum proportion of Yes votes for proposal to pass. Default value: 2/3. */
  threshold: string;
  /** quorum for constitution amendment proposals */
  constitutionAmendmentQuorum: string;
  /** Minimum proportion of Yes votes for a Constitution Amendment proposal to pass. Default value: 0.9. */
  constitutionAmendmentThreshold: string;
  /** quorum for law proposals */
  lawQuorum: string;
  /** Minimum proportion of Yes votes for a Law proposal to pass. Default value: 0.9. */
  lawThreshold: string;
}
export interface TallyParamsProtoMsg {
  typeUrl: '/atomone.gov.v1.TallyParams';
  value: Uint8Array;
}
/** TallyParams defines the params for tallying votes on governance proposals. */
export interface TallyParamsAmino {
  /**
   * Minimum percentage of total stake needed to vote for a result to be
   * considered valid.
   */
  quorum?: string;
  /** Minimum proportion of Yes votes for proposal to pass. Default value: 2/3. */
  threshold?: string;
  /** quorum for constitution amendment proposals */
  constitution_amendment_quorum?: string;
  /** Minimum proportion of Yes votes for a Constitution Amendment proposal to pass. Default value: 0.9. */
  constitution_amendment_threshold?: string;
  /** quorum for law proposals */
  law_quorum?: string;
  /** Minimum proportion of Yes votes for a Law proposal to pass. Default value: 0.9. */
  law_threshold?: string;
}
export interface TallyParamsAminoMsg {
  type: '/atomone.gov.v1.TallyParams';
  value: TallyParamsAmino;
}
/**
 * Params defines the parameters for the x/gov module.
 *
 * Since: cosmos-sdk 0.47
 */
export interface Params {
  /** Minimum deposit for a proposal to enter voting period. */
  minDeposit: Coin[];
  /**
   * Maximum period for Atom holders to deposit on a proposal. Initial value: 2
   * months.
   */
  maxDepositPeriod?: Duration | undefined;
  /** Duration of the voting period. */
  votingPeriod?: Duration | undefined;
  /**
   * Minimum percentage of total stake needed to vote for a result to be
   *  considered valid. Default value: 0.25.
   */
  quorum: string;
  /** Minimum proportion of Yes votes for proposal to pass. Default value: 2/3. */
  threshold: string;
  /** The ratio representing the proportion of the deposit value that must be paid at proposal submission. */
  minInitialDepositRatio: string;
  /** burn deposits if a proposal does not meet quorum */
  burnVoteQuorum: boolean;
  /** burn deposits if the proposal does not enter voting period */
  burnProposalDepositPrevote: boolean;
  /**
   * The ratio representing the proportion of the deposit value minimum that
   * must be met when making a deposit. Default value: 0.01. Meaning that for a
   * chain with a min_deposit of 100stake, a deposit of 1stake would be
   * required.
   *
   * Since: cosmos-sdk 0.50
   * NOTE: backported from v50 (https://github.com/cosmos/cosmos-sdk/pull/18146)
   */
  minDepositRatio: string;
  /** quorum for constitution amendment proposals */
  constitutionAmendmentQuorum: string;
  /** Minimum proportion of Yes votes for a Constitution Amendment proposal to pass. Default value: 0.9. */
  constitutionAmendmentThreshold: string;
  /** quorum for law proposals */
  lawQuorum: string;
  /** Minimum proportion of Yes votes for a Law proposal to pass. Default value: 0.9. */
  lawThreshold: string;
  /**
   * Duration of time after a proposal enters the voting period, during which quorum
   * must be achieved to not incur in a voting period extension.
   */
  quorumTimeout?: Duration | undefined;
  /**
   * Duration that expresses the maximum amount of time by which a proposal voting period
   * can be extended.
   */
  maxVotingPeriodExtension?: Duration | undefined;
  /**
   * Number of times a proposal should be checked for quorum after the quorum timeout
   * has elapsed. Used to compute the amount of time in between quorum checks.
   */
  quorumCheckCount: bigint;
}
export interface ParamsProtoMsg {
  typeUrl: '/atomone.gov.v1.Params';
  value: Uint8Array;
}
/**
 * Params defines the parameters for the x/gov module.
 *
 * Since: cosmos-sdk 0.47
 */
export interface ParamsAmino {
  /** Minimum deposit for a proposal to enter voting period. */
  min_deposit: CoinAmino[];
  /**
   * Maximum period for Atom holders to deposit on a proposal. Initial value: 2
   * months.
   */
  max_deposit_period?: DurationAmino | undefined;
  /** Duration of the voting period. */
  voting_period?: DurationAmino | undefined;
  /**
   * Minimum percentage of total stake needed to vote for a result to be
   *  considered valid. Default value: 0.25.
   */
  quorum?: string;
  /** Minimum proportion of Yes votes for proposal to pass. Default value: 2/3. */
  threshold?: string;
  /** The ratio representing the proportion of the deposit value that must be paid at proposal submission. */
  min_initial_deposit_ratio?: string;
  /** burn deposits if a proposal does not meet quorum */
  burn_vote_quorum?: boolean;
  /** burn deposits if the proposal does not enter voting period */
  burn_proposal_deposit_prevote?: boolean;
  /**
   * The ratio representing the proportion of the deposit value minimum that
   * must be met when making a deposit. Default value: 0.01. Meaning that for a
   * chain with a min_deposit of 100stake, a deposit of 1stake would be
   * required.
   *
   * Since: cosmos-sdk 0.50
   * NOTE: backported from v50 (https://github.com/cosmos/cosmos-sdk/pull/18146)
   */
  min_deposit_ratio?: string;
  /** quorum for constitution amendment proposals */
  constitution_amendment_quorum?: string;
  /** Minimum proportion of Yes votes for a Constitution Amendment proposal to pass. Default value: 0.9. */
  constitution_amendment_threshold?: string;
  /** quorum for law proposals */
  law_quorum?: string;
  /** Minimum proportion of Yes votes for a Law proposal to pass. Default value: 0.9. */
  law_threshold?: string;
  /**
   * Duration of time after a proposal enters the voting period, during which quorum
   * must be achieved to not incur in a voting period extension.
   */
  quorum_timeout?: DurationAmino | undefined;
  /**
   * Duration that expresses the maximum amount of time by which a proposal voting period
   * can be extended.
   */
  max_voting_period_extension?: DurationAmino | undefined;
  /**
   * Number of times a proposal should be checked for quorum after the quorum timeout
   * has elapsed. Used to compute the amount of time in between quorum checks.
   */
  quorum_check_count?: string;
}
export interface ParamsAminoMsg {
  type: '/atomone.gov.v1.Params';
  value: ParamsAmino;
}
function createBaseWeightedVoteOption(): WeightedVoteOption {
  return {
    option: 0,
    weight: '',
  };
}
export const WeightedVoteOption = {
  typeUrl: '/atomone.gov.v1.WeightedVoteOption',
  encode(message: WeightedVoteOption, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.option !== 0) {
      writer.uint32(8).int32(message.option);
    }
    if (message.weight !== '') {
      writer.uint32(18).string(message.weight);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): WeightedVoteOption {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseWeightedVoteOption();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.option = reader.int32() as any;
          break;
        case 2:
          message.weight = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): WeightedVoteOption {
    const obj = createBaseWeightedVoteOption();
    if (isSet(object.option)) obj.option = voteOptionFromJSON(object.option);
    if (isSet(object.weight)) obj.weight = String(object.weight);
    return obj;
  },
  toJSON(message: WeightedVoteOption): unknown {
    const obj: any = {};
    message.option !== undefined && (obj.option = voteOptionToJSON(message.option));
    message.weight !== undefined && (obj.weight = message.weight);
    return obj;
  },
  fromPartial(object: Partial<WeightedVoteOption>): WeightedVoteOption {
    const message = createBaseWeightedVoteOption();
    message.option = object.option ?? 0;
    message.weight = object.weight ?? '';
    return message;
  },
  fromAmino(object: WeightedVoteOptionAmino): WeightedVoteOption {
    const message = createBaseWeightedVoteOption();
    if (object.option !== undefined && object.option !== null) {
      message.option = voteOptionFromJSON(object.option);
    }
    if (object.weight !== undefined && object.weight !== null) {
      message.weight = object.weight;
    }
    return message;
  },
  toAmino(message: WeightedVoteOption): WeightedVoteOptionAmino {
    const obj: any = {};
    obj.option = message.option;
    obj.weight = message.weight;
    return obj;
  },
  fromAminoMsg(object: WeightedVoteOptionAminoMsg): WeightedVoteOption {
    return WeightedVoteOption.fromAmino(object.value);
  },
  fromProtoMsg(message: WeightedVoteOptionProtoMsg): WeightedVoteOption {
    return WeightedVoteOption.decode(message.value);
  },
  toProto(message: WeightedVoteOption): Uint8Array {
    return WeightedVoteOption.encode(message).finish();
  },
  toProtoMsg(message: WeightedVoteOption): WeightedVoteOptionProtoMsg {
    return {
      typeUrl: '/atomone.gov.v1.WeightedVoteOption',
      value: WeightedVoteOption.encode(message).finish(),
    };
  },
};
function createBaseDeposit(): Deposit {
  return {
    proposalId: BigInt(0),
    depositor: '',
    amount: [],
  };
}
export const Deposit = {
  typeUrl: '/atomone.gov.v1.Deposit',
  encode(message: Deposit, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.proposalId !== BigInt(0)) {
      writer.uint32(8).uint64(message.proposalId);
    }
    if (message.depositor !== '') {
      writer.uint32(18).string(message.depositor);
    }
    for (const v of message.amount) {
      Coin.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Deposit {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeposit();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.proposalId = reader.uint64();
          break;
        case 2:
          message.depositor = reader.string();
          break;
        case 3:
          message.amount.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Deposit {
    const obj = createBaseDeposit();
    if (isSet(object.proposalId)) obj.proposalId = BigInt(object.proposalId.toString());
    if (isSet(object.depositor)) obj.depositor = String(object.depositor);
    if (Array.isArray(object?.amount)) obj.amount = object.amount.map((e: any) => Coin.fromJSON(e));
    return obj;
  },
  toJSON(message: Deposit): unknown {
    const obj: any = {};
    message.proposalId !== undefined && (obj.proposalId = (message.proposalId || BigInt(0)).toString());
    message.depositor !== undefined && (obj.depositor = message.depositor);
    if (message.amount) {
      obj.amount = message.amount.map((e) => (e ? Coin.toJSON(e) : undefined));
    } else {
      obj.amount = [];
    }
    return obj;
  },
  fromPartial(object: Partial<Deposit>): Deposit {
    const message = createBaseDeposit();
    if (object.proposalId !== undefined && object.proposalId !== null) {
      message.proposalId = BigInt(object.proposalId.toString());
    }
    message.depositor = object.depositor ?? '';
    message.amount = object.amount?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: DepositAmino): Deposit {
    const message = createBaseDeposit();
    if (object.proposal_id !== undefined && object.proposal_id !== null) {
      message.proposalId = BigInt(object.proposal_id);
    }
    if (object.depositor !== undefined && object.depositor !== null) {
      message.depositor = object.depositor;
    }
    message.amount = object.amount?.map((e) => Coin.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: Deposit): DepositAmino {
    const obj: any = {};
    obj.proposal_id = message.proposalId ? message.proposalId.toString() : undefined;
    obj.depositor = message.depositor;
    if (message.amount) {
      obj.amount = message.amount.map((e) => (e ? Coin.toAmino(e) : undefined));
    } else {
      obj.amount = [];
    }
    return obj;
  },
  fromAminoMsg(object: DepositAminoMsg): Deposit {
    return Deposit.fromAmino(object.value);
  },
  fromProtoMsg(message: DepositProtoMsg): Deposit {
    return Deposit.decode(message.value);
  },
  toProto(message: Deposit): Uint8Array {
    return Deposit.encode(message).finish();
  },
  toProtoMsg(message: Deposit): DepositProtoMsg {
    return {
      typeUrl: '/atomone.gov.v1.Deposit',
      value: Deposit.encode(message).finish(),
    };
  },
};
function createBaseProposal(): Proposal {
  return {
    id: BigInt(0),
    messages: [],
    status: 0,
    finalTallyResult: undefined,
    submitTime: undefined,
    depositEndTime: undefined,
    totalDeposit: [],
    votingStartTime: undefined,
    votingEndTime: undefined,
    metadata: '',
    title: '',
    summary: '',
    proposer: '',
  };
}
export const Proposal = {
  typeUrl: '/atomone.gov.v1.Proposal',
  encode(message: Proposal, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.id !== BigInt(0)) {
      writer.uint32(8).uint64(message.id);
    }
    for (const v of message.messages) {
      Any.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.status !== 0) {
      writer.uint32(24).int32(message.status);
    }
    if (message.finalTallyResult !== undefined) {
      TallyResult.encode(message.finalTallyResult, writer.uint32(34).fork()).ldelim();
    }
    if (message.submitTime !== undefined) {
      Timestamp.encode(message.submitTime, writer.uint32(42).fork()).ldelim();
    }
    if (message.depositEndTime !== undefined) {
      Timestamp.encode(message.depositEndTime, writer.uint32(50).fork()).ldelim();
    }
    for (const v of message.totalDeposit) {
      Coin.encode(v!, writer.uint32(58).fork()).ldelim();
    }
    if (message.votingStartTime !== undefined) {
      Timestamp.encode(message.votingStartTime, writer.uint32(66).fork()).ldelim();
    }
    if (message.votingEndTime !== undefined) {
      Timestamp.encode(message.votingEndTime, writer.uint32(74).fork()).ldelim();
    }
    if (message.metadata !== '') {
      writer.uint32(82).string(message.metadata);
    }
    if (message.title !== '') {
      writer.uint32(90).string(message.title);
    }
    if (message.summary !== '') {
      writer.uint32(98).string(message.summary);
    }
    if (message.proposer !== '') {
      writer.uint32(106).string(message.proposer);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Proposal {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProposal();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.uint64();
          break;
        case 2:
          message.messages.push(Any.decode(reader, reader.uint32()));
          break;
        case 3:
          message.status = reader.int32() as any;
          break;
        case 4:
          message.finalTallyResult = TallyResult.decode(reader, reader.uint32());
          break;
        case 5:
          message.submitTime = Timestamp.decode(reader, reader.uint32());
          break;
        case 6:
          message.depositEndTime = Timestamp.decode(reader, reader.uint32());
          break;
        case 7:
          message.totalDeposit.push(Coin.decode(reader, reader.uint32()));
          break;
        case 8:
          message.votingStartTime = Timestamp.decode(reader, reader.uint32());
          break;
        case 9:
          message.votingEndTime = Timestamp.decode(reader, reader.uint32());
          break;
        case 10:
          message.metadata = reader.string();
          break;
        case 11:
          message.title = reader.string();
          break;
        case 12:
          message.summary = reader.string();
          break;
        case 13:
          message.proposer = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Proposal {
    const obj = createBaseProposal();
    if (isSet(object.id)) obj.id = BigInt(object.id.toString());
    if (Array.isArray(object?.messages)) obj.messages = object.messages.map((e: any) => Any.fromJSON(e));
    if (isSet(object.status)) obj.status = proposalStatusFromJSON(object.status);
    if (isSet(object.finalTallyResult)) obj.finalTallyResult = TallyResult.fromJSON(object.finalTallyResult);
    if (isSet(object.submitTime)) obj.submitTime = fromJsonTimestamp(object.submitTime);
    if (isSet(object.depositEndTime)) obj.depositEndTime = fromJsonTimestamp(object.depositEndTime);
    if (Array.isArray(object?.totalDeposit)) obj.totalDeposit = object.totalDeposit.map((e: any) => Coin.fromJSON(e));
    if (isSet(object.votingStartTime)) obj.votingStartTime = fromJsonTimestamp(object.votingStartTime);
    if (isSet(object.votingEndTime)) obj.votingEndTime = fromJsonTimestamp(object.votingEndTime);
    if (isSet(object.metadata)) obj.metadata = String(object.metadata);
    if (isSet(object.title)) obj.title = String(object.title);
    if (isSet(object.summary)) obj.summary = String(object.summary);
    if (isSet(object.proposer)) obj.proposer = String(object.proposer);
    return obj;
  },
  toJSON(message: Proposal): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = (message.id || BigInt(0)).toString());
    if (message.messages) {
      obj.messages = message.messages.map((e) => (e ? Any.toJSON(e) : undefined));
    } else {
      obj.messages = [];
    }
    message.status !== undefined && (obj.status = proposalStatusToJSON(message.status));
    message.finalTallyResult !== undefined &&
      (obj.finalTallyResult = message.finalTallyResult ? TallyResult.toJSON(message.finalTallyResult) : undefined);
    message.submitTime !== undefined && (obj.submitTime = fromTimestamp(message.submitTime).toISOString());
    message.depositEndTime !== undefined && (obj.depositEndTime = fromTimestamp(message.depositEndTime).toISOString());
    if (message.totalDeposit) {
      obj.totalDeposit = message.totalDeposit.map((e) => (e ? Coin.toJSON(e) : undefined));
    } else {
      obj.totalDeposit = [];
    }
    message.votingStartTime !== undefined &&
      (obj.votingStartTime = fromTimestamp(message.votingStartTime).toISOString());
    message.votingEndTime !== undefined && (obj.votingEndTime = fromTimestamp(message.votingEndTime).toISOString());
    message.metadata !== undefined && (obj.metadata = message.metadata);
    message.title !== undefined && (obj.title = message.title);
    message.summary !== undefined && (obj.summary = message.summary);
    message.proposer !== undefined && (obj.proposer = message.proposer);
    return obj;
  },
  fromPartial(object: Partial<Proposal>): Proposal {
    const message = createBaseProposal();
    if (object.id !== undefined && object.id !== null) {
      message.id = BigInt(object.id.toString());
    }
    message.messages = object.messages?.map((e) => Any.fromPartial(e)) || [];
    message.status = object.status ?? 0;
    if (object.finalTallyResult !== undefined && object.finalTallyResult !== null) {
      message.finalTallyResult = TallyResult.fromPartial(object.finalTallyResult);
    }
    if (object.submitTime !== undefined && object.submitTime !== null) {
      message.submitTime = Timestamp.fromPartial(object.submitTime);
    }
    if (object.depositEndTime !== undefined && object.depositEndTime !== null) {
      message.depositEndTime = Timestamp.fromPartial(object.depositEndTime);
    }
    message.totalDeposit = object.totalDeposit?.map((e) => Coin.fromPartial(e)) || [];
    if (object.votingStartTime !== undefined && object.votingStartTime !== null) {
      message.votingStartTime = Timestamp.fromPartial(object.votingStartTime);
    }
    if (object.votingEndTime !== undefined && object.votingEndTime !== null) {
      message.votingEndTime = Timestamp.fromPartial(object.votingEndTime);
    }
    message.metadata = object.metadata ?? '';
    message.title = object.title ?? '';
    message.summary = object.summary ?? '';
    message.proposer = object.proposer ?? '';
    return message;
  },
  fromAmino(object: ProposalAmino): Proposal {
    const message = createBaseProposal();
    if (object.id !== undefined && object.id !== null) {
      message.id = BigInt(object.id);
    }
    message.messages = object.messages?.map((e) => Any.fromAmino(e)) || [];
    if (object.status !== undefined && object.status !== null) {
      message.status = proposalStatusFromJSON(object.status);
    }
    if (object.final_tally_result !== undefined && object.final_tally_result !== null) {
      message.finalTallyResult = TallyResult.fromAmino(object.final_tally_result);
    }
    if (object.submit_time !== undefined && object.submit_time !== null) {
      message.submitTime = Timestamp.fromAmino(object.submit_time);
    }
    if (object.deposit_end_time !== undefined && object.deposit_end_time !== null) {
      message.depositEndTime = Timestamp.fromAmino(object.deposit_end_time);
    }
    message.totalDeposit = object.total_deposit?.map((e) => Coin.fromAmino(e)) || [];
    if (object.voting_start_time !== undefined && object.voting_start_time !== null) {
      message.votingStartTime = Timestamp.fromAmino(object.voting_start_time);
    }
    if (object.voting_end_time !== undefined && object.voting_end_time !== null) {
      message.votingEndTime = Timestamp.fromAmino(object.voting_end_time);
    }
    if (object.metadata !== undefined && object.metadata !== null) {
      message.metadata = object.metadata;
    }
    if (object.title !== undefined && object.title !== null) {
      message.title = object.title;
    }
    if (object.summary !== undefined && object.summary !== null) {
      message.summary = object.summary;
    }
    if (object.proposer !== undefined && object.proposer !== null) {
      message.proposer = object.proposer;
    }
    return message;
  },
  toAmino(message: Proposal): ProposalAmino {
    const obj: any = {};
    obj.id = message.id ? message.id.toString() : undefined;
    if (message.messages) {
      obj.messages = message.messages.map((e) => (e ? Any.toAmino(e) : undefined));
    } else {
      obj.messages = [];
    }
    obj.status = message.status;
    obj.final_tally_result = message.finalTallyResult ? TallyResult.toAmino(message.finalTallyResult) : undefined;
    obj.submit_time = message.submitTime ? Timestamp.toAmino(message.submitTime) : undefined;
    obj.deposit_end_time = message.depositEndTime ? Timestamp.toAmino(message.depositEndTime) : undefined;
    if (message.totalDeposit) {
      obj.total_deposit = message.totalDeposit.map((e) => (e ? Coin.toAmino(e) : undefined));
    } else {
      obj.total_deposit = [];
    }
    obj.voting_start_time = message.votingStartTime ? Timestamp.toAmino(message.votingStartTime) : undefined;
    obj.voting_end_time = message.votingEndTime ? Timestamp.toAmino(message.votingEndTime) : undefined;
    obj.metadata = message.metadata;
    obj.title = message.title;
    obj.summary = message.summary;
    obj.proposer = message.proposer;
    return obj;
  },
  fromAminoMsg(object: ProposalAminoMsg): Proposal {
    return Proposal.fromAmino(object.value);
  },
  fromProtoMsg(message: ProposalProtoMsg): Proposal {
    return Proposal.decode(message.value);
  },
  toProto(message: Proposal): Uint8Array {
    return Proposal.encode(message).finish();
  },
  toProtoMsg(message: Proposal): ProposalProtoMsg {
    return {
      typeUrl: '/atomone.gov.v1.Proposal',
      value: Proposal.encode(message).finish(),
    };
  },
};
function createBaseTallyResult(): TallyResult {
  return {
    yesCount: '',
    abstainCount: '',
    noCount: '',
  };
}
export const TallyResult = {
  typeUrl: '/atomone.gov.v1.TallyResult',
  encode(message: TallyResult, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.yesCount !== '') {
      writer.uint32(10).string(message.yesCount);
    }
    if (message.abstainCount !== '') {
      writer.uint32(18).string(message.abstainCount);
    }
    if (message.noCount !== '') {
      writer.uint32(26).string(message.noCount);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): TallyResult {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTallyResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.yesCount = reader.string();
          break;
        case 2:
          message.abstainCount = reader.string();
          break;
        case 3:
          message.noCount = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): TallyResult {
    const obj = createBaseTallyResult();
    if (isSet(object.yesCount)) obj.yesCount = String(object.yesCount);
    if (isSet(object.abstainCount)) obj.abstainCount = String(object.abstainCount);
    if (isSet(object.noCount)) obj.noCount = String(object.noCount);
    return obj;
  },
  toJSON(message: TallyResult): unknown {
    const obj: any = {};
    message.yesCount !== undefined && (obj.yesCount = message.yesCount);
    message.abstainCount !== undefined && (obj.abstainCount = message.abstainCount);
    message.noCount !== undefined && (obj.noCount = message.noCount);
    return obj;
  },
  fromPartial(object: Partial<TallyResult>): TallyResult {
    const message = createBaseTallyResult();
    message.yesCount = object.yesCount ?? '';
    message.abstainCount = object.abstainCount ?? '';
    message.noCount = object.noCount ?? '';
    return message;
  },
  fromAmino(object: TallyResultAmino): TallyResult {
    const message = createBaseTallyResult();
    if (object.yes_count !== undefined && object.yes_count !== null) {
      message.yesCount = object.yes_count;
    }
    if (object.abstain_count !== undefined && object.abstain_count !== null) {
      message.abstainCount = object.abstain_count;
    }
    if (object.no_count !== undefined && object.no_count !== null) {
      message.noCount = object.no_count;
    }
    return message;
  },
  toAmino(message: TallyResult): TallyResultAmino {
    const obj: any = {};
    obj.yes_count = message.yesCount;
    obj.abstain_count = message.abstainCount;
    obj.no_count = message.noCount;
    return obj;
  },
  fromAminoMsg(object: TallyResultAminoMsg): TallyResult {
    return TallyResult.fromAmino(object.value);
  },
  fromProtoMsg(message: TallyResultProtoMsg): TallyResult {
    return TallyResult.decode(message.value);
  },
  toProto(message: TallyResult): Uint8Array {
    return TallyResult.encode(message).finish();
  },
  toProtoMsg(message: TallyResult): TallyResultProtoMsg {
    return {
      typeUrl: '/atomone.gov.v1.TallyResult',
      value: TallyResult.encode(message).finish(),
    };
  },
};
function createBaseVote(): Vote {
  return {
    proposalId: BigInt(0),
    voter: '',
    options: [],
    metadata: '',
  };
}
export const Vote = {
  typeUrl: '/atomone.gov.v1.Vote',
  encode(message: Vote, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.proposalId !== BigInt(0)) {
      writer.uint32(8).uint64(message.proposalId);
    }
    if (message.voter !== '') {
      writer.uint32(18).string(message.voter);
    }
    for (const v of message.options) {
      WeightedVoteOption.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    if (message.metadata !== '') {
      writer.uint32(42).string(message.metadata);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Vote {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseVote();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.proposalId = reader.uint64();
          break;
        case 2:
          message.voter = reader.string();
          break;
        case 4:
          message.options.push(WeightedVoteOption.decode(reader, reader.uint32()));
          break;
        case 5:
          message.metadata = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Vote {
    const obj = createBaseVote();
    if (isSet(object.proposalId)) obj.proposalId = BigInt(object.proposalId.toString());
    if (isSet(object.voter)) obj.voter = String(object.voter);
    if (Array.isArray(object?.options)) obj.options = object.options.map((e: any) => WeightedVoteOption.fromJSON(e));
    if (isSet(object.metadata)) obj.metadata = String(object.metadata);
    return obj;
  },
  toJSON(message: Vote): unknown {
    const obj: any = {};
    message.proposalId !== undefined && (obj.proposalId = (message.proposalId || BigInt(0)).toString());
    message.voter !== undefined && (obj.voter = message.voter);
    if (message.options) {
      obj.options = message.options.map((e) => (e ? WeightedVoteOption.toJSON(e) : undefined));
    } else {
      obj.options = [];
    }
    message.metadata !== undefined && (obj.metadata = message.metadata);
    return obj;
  },
  fromPartial(object: Partial<Vote>): Vote {
    const message = createBaseVote();
    if (object.proposalId !== undefined && object.proposalId !== null) {
      message.proposalId = BigInt(object.proposalId.toString());
    }
    message.voter = object.voter ?? '';
    message.options = object.options?.map((e) => WeightedVoteOption.fromPartial(e)) || [];
    message.metadata = object.metadata ?? '';
    return message;
  },
  fromAmino(object: VoteAmino): Vote {
    const message = createBaseVote();
    if (object.proposal_id !== undefined && object.proposal_id !== null) {
      message.proposalId = BigInt(object.proposal_id);
    }
    if (object.voter !== undefined && object.voter !== null) {
      message.voter = object.voter;
    }
    message.options = object.options?.map((e) => WeightedVoteOption.fromAmino(e)) || [];
    if (object.metadata !== undefined && object.metadata !== null) {
      message.metadata = object.metadata;
    }
    return message;
  },
  toAmino(message: Vote): VoteAmino {
    const obj: any = {};
    obj.proposal_id = message.proposalId ? message.proposalId.toString() : undefined;
    obj.voter = message.voter;
    if (message.options) {
      obj.options = message.options.map((e) => (e ? WeightedVoteOption.toAmino(e) : undefined));
    } else {
      obj.options = [];
    }
    obj.metadata = message.metadata;
    return obj;
  },
  fromAminoMsg(object: VoteAminoMsg): Vote {
    return Vote.fromAmino(object.value);
  },
  fromProtoMsg(message: VoteProtoMsg): Vote {
    return Vote.decode(message.value);
  },
  toProto(message: Vote): Uint8Array {
    return Vote.encode(message).finish();
  },
  toProtoMsg(message: Vote): VoteProtoMsg {
    return {
      typeUrl: '/atomone.gov.v1.Vote',
      value: Vote.encode(message).finish(),
    };
  },
};
function createBaseQuorumCheckQueueEntry(): QuorumCheckQueueEntry {
  return {
    quorumTimeoutTime: undefined,
    quorumCheckCount: BigInt(0),
    quorumChecksDone: BigInt(0),
  };
}
export const QuorumCheckQueueEntry = {
  typeUrl: '/atomone.gov.v1.QuorumCheckQueueEntry',
  encode(message: QuorumCheckQueueEntry, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.quorumTimeoutTime !== undefined) {
      Timestamp.encode(message.quorumTimeoutTime, writer.uint32(10).fork()).ldelim();
    }
    if (message.quorumCheckCount !== BigInt(0)) {
      writer.uint32(16).uint64(message.quorumCheckCount);
    }
    if (message.quorumChecksDone !== BigInt(0)) {
      writer.uint32(24).uint64(message.quorumChecksDone);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QuorumCheckQueueEntry {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQuorumCheckQueueEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.quorumTimeoutTime = Timestamp.decode(reader, reader.uint32());
          break;
        case 2:
          message.quorumCheckCount = reader.uint64();
          break;
        case 3:
          message.quorumChecksDone = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QuorumCheckQueueEntry {
    const obj = createBaseQuorumCheckQueueEntry();
    if (isSet(object.quorumTimeoutTime)) obj.quorumTimeoutTime = fromJsonTimestamp(object.quorumTimeoutTime);
    if (isSet(object.quorumCheckCount)) obj.quorumCheckCount = BigInt(object.quorumCheckCount.toString());
    if (isSet(object.quorumChecksDone)) obj.quorumChecksDone = BigInt(object.quorumChecksDone.toString());
    return obj;
  },
  toJSON(message: QuorumCheckQueueEntry): unknown {
    const obj: any = {};
    message.quorumTimeoutTime !== undefined &&
      (obj.quorumTimeoutTime = fromTimestamp(message.quorumTimeoutTime).toISOString());
    message.quorumCheckCount !== undefined &&
      (obj.quorumCheckCount = (message.quorumCheckCount || BigInt(0)).toString());
    message.quorumChecksDone !== undefined &&
      (obj.quorumChecksDone = (message.quorumChecksDone || BigInt(0)).toString());
    return obj;
  },
  fromPartial(object: Partial<QuorumCheckQueueEntry>): QuorumCheckQueueEntry {
    const message = createBaseQuorumCheckQueueEntry();
    if (object.quorumTimeoutTime !== undefined && object.quorumTimeoutTime !== null) {
      message.quorumTimeoutTime = Timestamp.fromPartial(object.quorumTimeoutTime);
    }
    if (object.quorumCheckCount !== undefined && object.quorumCheckCount !== null) {
      message.quorumCheckCount = BigInt(object.quorumCheckCount.toString());
    }
    if (object.quorumChecksDone !== undefined && object.quorumChecksDone !== null) {
      message.quorumChecksDone = BigInt(object.quorumChecksDone.toString());
    }
    return message;
  },
  fromAmino(object: QuorumCheckQueueEntryAmino): QuorumCheckQueueEntry {
    const message = createBaseQuorumCheckQueueEntry();
    if (object.quorum_timeout_time !== undefined && object.quorum_timeout_time !== null) {
      message.quorumTimeoutTime = Timestamp.fromAmino(object.quorum_timeout_time);
    }
    if (object.quorum_check_count !== undefined && object.quorum_check_count !== null) {
      message.quorumCheckCount = BigInt(object.quorum_check_count);
    }
    if (object.quorum_checks_done !== undefined && object.quorum_checks_done !== null) {
      message.quorumChecksDone = BigInt(object.quorum_checks_done);
    }
    return message;
  },
  toAmino(message: QuorumCheckQueueEntry): QuorumCheckQueueEntryAmino {
    const obj: any = {};
    obj.quorum_timeout_time = message.quorumTimeoutTime ? Timestamp.toAmino(message.quorumTimeoutTime) : undefined;
    obj.quorum_check_count = message.quorumCheckCount ? message.quorumCheckCount.toString() : undefined;
    obj.quorum_checks_done = message.quorumChecksDone ? message.quorumChecksDone.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: QuorumCheckQueueEntryAminoMsg): QuorumCheckQueueEntry {
    return QuorumCheckQueueEntry.fromAmino(object.value);
  },
  fromProtoMsg(message: QuorumCheckQueueEntryProtoMsg): QuorumCheckQueueEntry {
    return QuorumCheckQueueEntry.decode(message.value);
  },
  toProto(message: QuorumCheckQueueEntry): Uint8Array {
    return QuorumCheckQueueEntry.encode(message).finish();
  },
  toProtoMsg(message: QuorumCheckQueueEntry): QuorumCheckQueueEntryProtoMsg {
    return {
      typeUrl: '/atomone.gov.v1.QuorumCheckQueueEntry',
      value: QuorumCheckQueueEntry.encode(message).finish(),
    };
  },
};
function createBaseDepositParams(): DepositParams {
  return {
    minDeposit: [],
    maxDepositPeriod: undefined,
  };
}
export const DepositParams = {
  typeUrl: '/atomone.gov.v1.DepositParams',
  encode(message: DepositParams, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.minDeposit) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.maxDepositPeriod !== undefined) {
      Duration.encode(message.maxDepositPeriod, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): DepositParams {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDepositParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.minDeposit.push(Coin.decode(reader, reader.uint32()));
          break;
        case 2:
          message.maxDepositPeriod = Duration.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): DepositParams {
    const obj = createBaseDepositParams();
    if (Array.isArray(object?.minDeposit)) obj.minDeposit = object.minDeposit.map((e: any) => Coin.fromJSON(e));
    if (isSet(object.maxDepositPeriod)) obj.maxDepositPeriod = Duration.fromJSON(object.maxDepositPeriod);
    return obj;
  },
  toJSON(message: DepositParams): unknown {
    const obj: any = {};
    if (message.minDeposit) {
      obj.minDeposit = message.minDeposit.map((e) => (e ? Coin.toJSON(e) : undefined));
    } else {
      obj.minDeposit = [];
    }
    message.maxDepositPeriod !== undefined &&
      (obj.maxDepositPeriod = message.maxDepositPeriod ? Duration.toJSON(message.maxDepositPeriod) : undefined);
    return obj;
  },
  fromPartial(object: Partial<DepositParams>): DepositParams {
    const message = createBaseDepositParams();
    message.minDeposit = object.minDeposit?.map((e) => Coin.fromPartial(e)) || [];
    if (object.maxDepositPeriod !== undefined && object.maxDepositPeriod !== null) {
      message.maxDepositPeriod = Duration.fromPartial(object.maxDepositPeriod);
    }
    return message;
  },
  fromAmino(object: DepositParamsAmino): DepositParams {
    const message = createBaseDepositParams();
    message.minDeposit = object.min_deposit?.map((e) => Coin.fromAmino(e)) || [];
    if (object.max_deposit_period !== undefined && object.max_deposit_period !== null) {
      message.maxDepositPeriod = Duration.fromAmino(object.max_deposit_period);
    }
    return message;
  },
  toAmino(message: DepositParams): DepositParamsAmino {
    const obj: any = {};
    if (message.minDeposit) {
      obj.min_deposit = message.minDeposit.map((e) => (e ? Coin.toAmino(e) : undefined));
    } else {
      obj.min_deposit = [];
    }
    obj.max_deposit_period = message.maxDepositPeriod ? Duration.toAmino(message.maxDepositPeriod) : undefined;
    return obj;
  },
  fromAminoMsg(object: DepositParamsAminoMsg): DepositParams {
    return DepositParams.fromAmino(object.value);
  },
  fromProtoMsg(message: DepositParamsProtoMsg): DepositParams {
    return DepositParams.decode(message.value);
  },
  toProto(message: DepositParams): Uint8Array {
    return DepositParams.encode(message).finish();
  },
  toProtoMsg(message: DepositParams): DepositParamsProtoMsg {
    return {
      typeUrl: '/atomone.gov.v1.DepositParams',
      value: DepositParams.encode(message).finish(),
    };
  },
};
function createBaseVotingParams(): VotingParams {
  return {
    votingPeriod: undefined,
  };
}
export const VotingParams = {
  typeUrl: '/atomone.gov.v1.VotingParams',
  encode(message: VotingParams, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.votingPeriod !== undefined) {
      Duration.encode(message.votingPeriod, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): VotingParams {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseVotingParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.votingPeriod = Duration.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): VotingParams {
    const obj = createBaseVotingParams();
    if (isSet(object.votingPeriod)) obj.votingPeriod = Duration.fromJSON(object.votingPeriod);
    return obj;
  },
  toJSON(message: VotingParams): unknown {
    const obj: any = {};
    message.votingPeriod !== undefined &&
      (obj.votingPeriod = message.votingPeriod ? Duration.toJSON(message.votingPeriod) : undefined);
    return obj;
  },
  fromPartial(object: Partial<VotingParams>): VotingParams {
    const message = createBaseVotingParams();
    if (object.votingPeriod !== undefined && object.votingPeriod !== null) {
      message.votingPeriod = Duration.fromPartial(object.votingPeriod);
    }
    return message;
  },
  fromAmino(object: VotingParamsAmino): VotingParams {
    const message = createBaseVotingParams();
    if (object.voting_period !== undefined && object.voting_period !== null) {
      message.votingPeriod = Duration.fromAmino(object.voting_period);
    }
    return message;
  },
  toAmino(message: VotingParams): VotingParamsAmino {
    const obj: any = {};
    obj.voting_period = message.votingPeriod ? Duration.toAmino(message.votingPeriod) : undefined;
    return obj;
  },
  fromAminoMsg(object: VotingParamsAminoMsg): VotingParams {
    return VotingParams.fromAmino(object.value);
  },
  fromProtoMsg(message: VotingParamsProtoMsg): VotingParams {
    return VotingParams.decode(message.value);
  },
  toProto(message: VotingParams): Uint8Array {
    return VotingParams.encode(message).finish();
  },
  toProtoMsg(message: VotingParams): VotingParamsProtoMsg {
    return {
      typeUrl: '/atomone.gov.v1.VotingParams',
      value: VotingParams.encode(message).finish(),
    };
  },
};
function createBaseTallyParams(): TallyParams {
  return {
    quorum: '',
    threshold: '',
    constitutionAmendmentQuorum: '',
    constitutionAmendmentThreshold: '',
    lawQuorum: '',
    lawThreshold: '',
  };
}
export const TallyParams = {
  typeUrl: '/atomone.gov.v1.TallyParams',
  encode(message: TallyParams, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.quorum !== '') {
      writer.uint32(10).string(message.quorum);
    }
    if (message.threshold !== '') {
      writer.uint32(18).string(message.threshold);
    }
    if (message.constitutionAmendmentQuorum !== '') {
      writer.uint32(26).string(message.constitutionAmendmentQuorum);
    }
    if (message.constitutionAmendmentThreshold !== '') {
      writer.uint32(34).string(message.constitutionAmendmentThreshold);
    }
    if (message.lawQuorum !== '') {
      writer.uint32(42).string(message.lawQuorum);
    }
    if (message.lawThreshold !== '') {
      writer.uint32(50).string(message.lawThreshold);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): TallyParams {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTallyParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.quorum = reader.string();
          break;
        case 2:
          message.threshold = reader.string();
          break;
        case 3:
          message.constitutionAmendmentQuorum = reader.string();
          break;
        case 4:
          message.constitutionAmendmentThreshold = reader.string();
          break;
        case 5:
          message.lawQuorum = reader.string();
          break;
        case 6:
          message.lawThreshold = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): TallyParams {
    const obj = createBaseTallyParams();
    if (isSet(object.quorum)) obj.quorum = String(object.quorum);
    if (isSet(object.threshold)) obj.threshold = String(object.threshold);
    if (isSet(object.constitutionAmendmentQuorum))
      obj.constitutionAmendmentQuorum = String(object.constitutionAmendmentQuorum);
    if (isSet(object.constitutionAmendmentThreshold))
      obj.constitutionAmendmentThreshold = String(object.constitutionAmendmentThreshold);
    if (isSet(object.lawQuorum)) obj.lawQuorum = String(object.lawQuorum);
    if (isSet(object.lawThreshold)) obj.lawThreshold = String(object.lawThreshold);
    return obj;
  },
  toJSON(message: TallyParams): unknown {
    const obj: any = {};
    message.quorum !== undefined && (obj.quorum = message.quorum);
    message.threshold !== undefined && (obj.threshold = message.threshold);
    message.constitutionAmendmentQuorum !== undefined &&
      (obj.constitutionAmendmentQuorum = message.constitutionAmendmentQuorum);
    message.constitutionAmendmentThreshold !== undefined &&
      (obj.constitutionAmendmentThreshold = message.constitutionAmendmentThreshold);
    message.lawQuorum !== undefined && (obj.lawQuorum = message.lawQuorum);
    message.lawThreshold !== undefined && (obj.lawThreshold = message.lawThreshold);
    return obj;
  },
  fromPartial(object: Partial<TallyParams>): TallyParams {
    const message = createBaseTallyParams();
    message.quorum = object.quorum ?? '';
    message.threshold = object.threshold ?? '';
    message.constitutionAmendmentQuorum = object.constitutionAmendmentQuorum ?? '';
    message.constitutionAmendmentThreshold = object.constitutionAmendmentThreshold ?? '';
    message.lawQuorum = object.lawQuorum ?? '';
    message.lawThreshold = object.lawThreshold ?? '';
    return message;
  },
  fromAmino(object: TallyParamsAmino): TallyParams {
    const message = createBaseTallyParams();
    if (object.quorum !== undefined && object.quorum !== null) {
      message.quorum = object.quorum;
    }
    if (object.threshold !== undefined && object.threshold !== null) {
      message.threshold = object.threshold;
    }
    if (object.constitution_amendment_quorum !== undefined && object.constitution_amendment_quorum !== null) {
      message.constitutionAmendmentQuorum = object.constitution_amendment_quorum;
    }
    if (object.constitution_amendment_threshold !== undefined && object.constitution_amendment_threshold !== null) {
      message.constitutionAmendmentThreshold = object.constitution_amendment_threshold;
    }
    if (object.law_quorum !== undefined && object.law_quorum !== null) {
      message.lawQuorum = object.law_quorum;
    }
    if (object.law_threshold !== undefined && object.law_threshold !== null) {
      message.lawThreshold = object.law_threshold;
    }
    return message;
  },
  toAmino(message: TallyParams): TallyParamsAmino {
    const obj: any = {};
    obj.quorum = message.quorum;
    obj.threshold = message.threshold;
    obj.constitution_amendment_quorum = message.constitutionAmendmentQuorum;
    obj.constitution_amendment_threshold = message.constitutionAmendmentThreshold;
    obj.law_quorum = message.lawQuorum;
    obj.law_threshold = message.lawThreshold;
    return obj;
  },
  fromAminoMsg(object: TallyParamsAminoMsg): TallyParams {
    return TallyParams.fromAmino(object.value);
  },
  fromProtoMsg(message: TallyParamsProtoMsg): TallyParams {
    return TallyParams.decode(message.value);
  },
  toProto(message: TallyParams): Uint8Array {
    return TallyParams.encode(message).finish();
  },
  toProtoMsg(message: TallyParams): TallyParamsProtoMsg {
    return {
      typeUrl: '/atomone.gov.v1.TallyParams',
      value: TallyParams.encode(message).finish(),
    };
  },
};
function createBaseParams(): Params {
  return {
    minDeposit: [],
    maxDepositPeriod: undefined,
    votingPeriod: undefined,
    quorum: '',
    threshold: '',
    minInitialDepositRatio: '',
    burnVoteQuorum: false,
    burnProposalDepositPrevote: false,
    minDepositRatio: '',
    constitutionAmendmentQuorum: '',
    constitutionAmendmentThreshold: '',
    lawQuorum: '',
    lawThreshold: '',
    quorumTimeout: undefined,
    maxVotingPeriodExtension: undefined,
    quorumCheckCount: BigInt(0),
  };
}
export const Params = {
  typeUrl: '/atomone.gov.v1.Params',
  encode(message: Params, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.minDeposit) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.maxDepositPeriod !== undefined) {
      Duration.encode(message.maxDepositPeriod, writer.uint32(18).fork()).ldelim();
    }
    if (message.votingPeriod !== undefined) {
      Duration.encode(message.votingPeriod, writer.uint32(26).fork()).ldelim();
    }
    if (message.quorum !== '') {
      writer.uint32(34).string(message.quorum);
    }
    if (message.threshold !== '') {
      writer.uint32(42).string(message.threshold);
    }
    if (message.minInitialDepositRatio !== '') {
      writer.uint32(58).string(message.minInitialDepositRatio);
    }
    if (message.burnVoteQuorum === true) {
      writer.uint32(104).bool(message.burnVoteQuorum);
    }
    if (message.burnProposalDepositPrevote === true) {
      writer.uint32(112).bool(message.burnProposalDepositPrevote);
    }
    if (message.minDepositRatio !== '') {
      writer.uint32(122).string(message.minDepositRatio);
    }
    if (message.constitutionAmendmentQuorum !== '') {
      writer.uint32(130).string(message.constitutionAmendmentQuorum);
    }
    if (message.constitutionAmendmentThreshold !== '') {
      writer.uint32(138).string(message.constitutionAmendmentThreshold);
    }
    if (message.lawQuorum !== '') {
      writer.uint32(146).string(message.lawQuorum);
    }
    if (message.lawThreshold !== '') {
      writer.uint32(154).string(message.lawThreshold);
    }
    if (message.quorumTimeout !== undefined) {
      Duration.encode(message.quorumTimeout, writer.uint32(162).fork()).ldelim();
    }
    if (message.maxVotingPeriodExtension !== undefined) {
      Duration.encode(message.maxVotingPeriodExtension, writer.uint32(170).fork()).ldelim();
    }
    if (message.quorumCheckCount !== BigInt(0)) {
      writer.uint32(176).uint64(message.quorumCheckCount);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Params {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.minDeposit.push(Coin.decode(reader, reader.uint32()));
          break;
        case 2:
          message.maxDepositPeriod = Duration.decode(reader, reader.uint32());
          break;
        case 3:
          message.votingPeriod = Duration.decode(reader, reader.uint32());
          break;
        case 4:
          message.quorum = reader.string();
          break;
        case 5:
          message.threshold = reader.string();
          break;
        case 7:
          message.minInitialDepositRatio = reader.string();
          break;
        case 13:
          message.burnVoteQuorum = reader.bool();
          break;
        case 14:
          message.burnProposalDepositPrevote = reader.bool();
          break;
        case 15:
          message.minDepositRatio = reader.string();
          break;
        case 16:
          message.constitutionAmendmentQuorum = reader.string();
          break;
        case 17:
          message.constitutionAmendmentThreshold = reader.string();
          break;
        case 18:
          message.lawQuorum = reader.string();
          break;
        case 19:
          message.lawThreshold = reader.string();
          break;
        case 20:
          message.quorumTimeout = Duration.decode(reader, reader.uint32());
          break;
        case 21:
          message.maxVotingPeriodExtension = Duration.decode(reader, reader.uint32());
          break;
        case 22:
          message.quorumCheckCount = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Params {
    const obj = createBaseParams();
    if (Array.isArray(object?.minDeposit)) obj.minDeposit = object.minDeposit.map((e: any) => Coin.fromJSON(e));
    if (isSet(object.maxDepositPeriod)) obj.maxDepositPeriod = Duration.fromJSON(object.maxDepositPeriod);
    if (isSet(object.votingPeriod)) obj.votingPeriod = Duration.fromJSON(object.votingPeriod);
    if (isSet(object.quorum)) obj.quorum = String(object.quorum);
    if (isSet(object.threshold)) obj.threshold = String(object.threshold);
    if (isSet(object.minInitialDepositRatio)) obj.minInitialDepositRatio = String(object.minInitialDepositRatio);
    if (isSet(object.burnVoteQuorum)) obj.burnVoteQuorum = Boolean(object.burnVoteQuorum);
    if (isSet(object.burnProposalDepositPrevote))
      obj.burnProposalDepositPrevote = Boolean(object.burnProposalDepositPrevote);
    if (isSet(object.minDepositRatio)) obj.minDepositRatio = String(object.minDepositRatio);
    if (isSet(object.constitutionAmendmentQuorum))
      obj.constitutionAmendmentQuorum = String(object.constitutionAmendmentQuorum);
    if (isSet(object.constitutionAmendmentThreshold))
      obj.constitutionAmendmentThreshold = String(object.constitutionAmendmentThreshold);
    if (isSet(object.lawQuorum)) obj.lawQuorum = String(object.lawQuorum);
    if (isSet(object.lawThreshold)) obj.lawThreshold = String(object.lawThreshold);
    if (isSet(object.quorumTimeout)) obj.quorumTimeout = Duration.fromJSON(object.quorumTimeout);
    if (isSet(object.maxVotingPeriodExtension))
      obj.maxVotingPeriodExtension = Duration.fromJSON(object.maxVotingPeriodExtension);
    if (isSet(object.quorumCheckCount)) obj.quorumCheckCount = BigInt(object.quorumCheckCount.toString());
    return obj;
  },
  toJSON(message: Params): unknown {
    const obj: any = {};
    if (message.minDeposit) {
      obj.minDeposit = message.minDeposit.map((e) => (e ? Coin.toJSON(e) : undefined));
    } else {
      obj.minDeposit = [];
    }
    message.maxDepositPeriod !== undefined &&
      (obj.maxDepositPeriod = message.maxDepositPeriod ? Duration.toJSON(message.maxDepositPeriod) : undefined);
    message.votingPeriod !== undefined &&
      (obj.votingPeriod = message.votingPeriod ? Duration.toJSON(message.votingPeriod) : undefined);
    message.quorum !== undefined && (obj.quorum = message.quorum);
    message.threshold !== undefined && (obj.threshold = message.threshold);
    message.minInitialDepositRatio !== undefined && (obj.minInitialDepositRatio = message.minInitialDepositRatio);
    message.burnVoteQuorum !== undefined && (obj.burnVoteQuorum = message.burnVoteQuorum);
    message.burnProposalDepositPrevote !== undefined &&
      (obj.burnProposalDepositPrevote = message.burnProposalDepositPrevote);
    message.minDepositRatio !== undefined && (obj.minDepositRatio = message.minDepositRatio);
    message.constitutionAmendmentQuorum !== undefined &&
      (obj.constitutionAmendmentQuorum = message.constitutionAmendmentQuorum);
    message.constitutionAmendmentThreshold !== undefined &&
      (obj.constitutionAmendmentThreshold = message.constitutionAmendmentThreshold);
    message.lawQuorum !== undefined && (obj.lawQuorum = message.lawQuorum);
    message.lawThreshold !== undefined && (obj.lawThreshold = message.lawThreshold);
    message.quorumTimeout !== undefined &&
      (obj.quorumTimeout = message.quorumTimeout ? Duration.toJSON(message.quorumTimeout) : undefined);
    message.maxVotingPeriodExtension !== undefined &&
      (obj.maxVotingPeriodExtension = message.maxVotingPeriodExtension
        ? Duration.toJSON(message.maxVotingPeriodExtension)
        : undefined);
    message.quorumCheckCount !== undefined &&
      (obj.quorumCheckCount = (message.quorumCheckCount || BigInt(0)).toString());
    return obj;
  },
  fromPartial(object: Partial<Params>): Params {
    const message = createBaseParams();
    message.minDeposit = object.minDeposit?.map((e) => Coin.fromPartial(e)) || [];
    if (object.maxDepositPeriod !== undefined && object.maxDepositPeriod !== null) {
      message.maxDepositPeriod = Duration.fromPartial(object.maxDepositPeriod);
    }
    if (object.votingPeriod !== undefined && object.votingPeriod !== null) {
      message.votingPeriod = Duration.fromPartial(object.votingPeriod);
    }
    message.quorum = object.quorum ?? '';
    message.threshold = object.threshold ?? '';
    message.minInitialDepositRatio = object.minInitialDepositRatio ?? '';
    message.burnVoteQuorum = object.burnVoteQuorum ?? false;
    message.burnProposalDepositPrevote = object.burnProposalDepositPrevote ?? false;
    message.minDepositRatio = object.minDepositRatio ?? '';
    message.constitutionAmendmentQuorum = object.constitutionAmendmentQuorum ?? '';
    message.constitutionAmendmentThreshold = object.constitutionAmendmentThreshold ?? '';
    message.lawQuorum = object.lawQuorum ?? '';
    message.lawThreshold = object.lawThreshold ?? '';
    if (object.quorumTimeout !== undefined && object.quorumTimeout !== null) {
      message.quorumTimeout = Duration.fromPartial(object.quorumTimeout);
    }
    if (object.maxVotingPeriodExtension !== undefined && object.maxVotingPeriodExtension !== null) {
      message.maxVotingPeriodExtension = Duration.fromPartial(object.maxVotingPeriodExtension);
    }
    if (object.quorumCheckCount !== undefined && object.quorumCheckCount !== null) {
      message.quorumCheckCount = BigInt(object.quorumCheckCount.toString());
    }
    return message;
  },
  fromAmino(object: ParamsAmino): Params {
    const message = createBaseParams();
    message.minDeposit = object.min_deposit?.map((e) => Coin.fromAmino(e)) || [];
    if (object.max_deposit_period !== undefined && object.max_deposit_period !== null) {
      message.maxDepositPeriod = Duration.fromAmino(object.max_deposit_period);
    }
    if (object.voting_period !== undefined && object.voting_period !== null) {
      message.votingPeriod = Duration.fromAmino(object.voting_period);
    }
    if (object.quorum !== undefined && object.quorum !== null) {
      message.quorum = object.quorum;
    }
    if (object.threshold !== undefined && object.threshold !== null) {
      message.threshold = object.threshold;
    }
    if (object.min_initial_deposit_ratio !== undefined && object.min_initial_deposit_ratio !== null) {
      message.minInitialDepositRatio = object.min_initial_deposit_ratio;
    }
    if (object.burn_vote_quorum !== undefined && object.burn_vote_quorum !== null) {
      message.burnVoteQuorum = object.burn_vote_quorum;
    }
    if (object.burn_proposal_deposit_prevote !== undefined && object.burn_proposal_deposit_prevote !== null) {
      message.burnProposalDepositPrevote = object.burn_proposal_deposit_prevote;
    }
    if (object.min_deposit_ratio !== undefined && object.min_deposit_ratio !== null) {
      message.minDepositRatio = object.min_deposit_ratio;
    }
    if (object.constitution_amendment_quorum !== undefined && object.constitution_amendment_quorum !== null) {
      message.constitutionAmendmentQuorum = object.constitution_amendment_quorum;
    }
    if (object.constitution_amendment_threshold !== undefined && object.constitution_amendment_threshold !== null) {
      message.constitutionAmendmentThreshold = object.constitution_amendment_threshold;
    }
    if (object.law_quorum !== undefined && object.law_quorum !== null) {
      message.lawQuorum = object.law_quorum;
    }
    if (object.law_threshold !== undefined && object.law_threshold !== null) {
      message.lawThreshold = object.law_threshold;
    }
    if (object.quorum_timeout !== undefined && object.quorum_timeout !== null) {
      message.quorumTimeout = Duration.fromAmino(object.quorum_timeout);
    }
    if (object.max_voting_period_extension !== undefined && object.max_voting_period_extension !== null) {
      message.maxVotingPeriodExtension = Duration.fromAmino(object.max_voting_period_extension);
    }
    if (object.quorum_check_count !== undefined && object.quorum_check_count !== null) {
      message.quorumCheckCount = BigInt(object.quorum_check_count);
    }
    return message;
  },
  toAmino(message: Params): ParamsAmino {
    const obj: any = {};
    if (message.minDeposit) {
      obj.min_deposit = message.minDeposit.map((e) => (e ? Coin.toAmino(e) : undefined));
    } else {
      obj.min_deposit = [];
    }
    obj.max_deposit_period = message.maxDepositPeriod ? Duration.toAmino(message.maxDepositPeriod) : undefined;
    obj.voting_period = message.votingPeriod ? Duration.toAmino(message.votingPeriod) : undefined;
    obj.quorum = message.quorum;
    obj.threshold = message.threshold;
    obj.min_initial_deposit_ratio = message.minInitialDepositRatio;
    obj.burn_vote_quorum = message.burnVoteQuorum;
    obj.burn_proposal_deposit_prevote = message.burnProposalDepositPrevote;
    obj.min_deposit_ratio = message.minDepositRatio;
    obj.constitution_amendment_quorum = message.constitutionAmendmentQuorum;
    obj.constitution_amendment_threshold = message.constitutionAmendmentThreshold;
    obj.law_quorum = message.lawQuorum;
    obj.law_threshold = message.lawThreshold;
    obj.quorum_timeout = message.quorumTimeout ? Duration.toAmino(message.quorumTimeout) : undefined;
    obj.max_voting_period_extension = message.maxVotingPeriodExtension
      ? Duration.toAmino(message.maxVotingPeriodExtension)
      : undefined;
    obj.quorum_check_count = message.quorumCheckCount ? message.quorumCheckCount.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: ParamsAminoMsg): Params {
    return Params.fromAmino(object.value);
  },
  fromProtoMsg(message: ParamsProtoMsg): Params {
    return Params.decode(message.value);
  },
  toProto(message: Params): Uint8Array {
    return Params.encode(message).finish();
  },
  toProtoMsg(message: Params): ParamsProtoMsg {
    return {
      typeUrl: '/atomone.gov.v1.Params',
      value: Params.encode(message).finish(),
    };
  },
};
