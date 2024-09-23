import { NativeDenom } from '@leapwallet/cosmos-wallet-sdk';
import { DenomsRecord } from '@leapwallet/cosmos-wallet-sdk/dist/browser/types/constants';
import { ThemeName } from '@leapwallet/leap-ui';
import { type ParsedTransaction } from '@leapwallet/parser-parfait';

export type ActivityType =
  | 'send'
  | 'receive'
  | 'fallback'
  | 'delegate'
  | 'undelegate'
  | 'pending'
  | 'ibc/transfer'
  | 'swap'
  | 'vote'
  | 'secretTokenTransfer'
  | 'liquidity/add'
  | 'liquidity/remove'
  | 'grant'
  | 'revoke'
  | 'pending'
  | 'secretTokenTransfer'
  | 'cw20TokenTransfer';

export type ActivityCardContent = {
  txType: ActivityType;
  title1: string;
  subtitle1: string;
  title2?: string;
  subtitle2?: string;
  img?: string;
  secondaryImg?: string;
  sentAmount?: string;
  sentTokenInfo?: NativeDenom;
  receivedTokenInfo?: NativeDenom;
  receivedAmount?: string;
  sentUsdValue?: string;
  receivedUsdValue?: string;
  feeAmount?: string;
};

export type Activity = {
  parsedTx: ParsedTransaction;
  content: ActivityCardContent;
};

export type TxResponse = {
  readonly activity: Activity[];
  readonly loading: boolean;
  readonly error?: boolean;
};

export type getActivityContentProps = {
  parsedTx?: ParsedTransaction;
  sentTokenInfo?: NativeDenom;
  sentAmount?: {
    amount: string;
    denomID: string;
  };
  restUrl: string;
  address?: string;
  theme?: ThemeName;
  denoms: DenomsRecord;
  chainId?: string;
  coinDecimals?: number;
};
