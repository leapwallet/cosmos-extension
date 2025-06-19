import {
  StandardConnect,
  StandardConnectFeature,
  StandardDisconnect,
  StandardDisconnectFeature,
  StandardEvents,
  StandardEventsFeature,
  StandardEventsListeners,
  SuiReportTransactionEffects,
  SuiReportTransactionEffectsFeature,
  SuiSignAndExecuteTransaction,
  SuiSignAndExecuteTransactionBlock,
  SuiSignAndExecuteTransactionBlockFeature,
  SuiSignAndExecuteTransactionFeature,
  SuiSignPersonalMessage,
  SuiSignPersonalMessageFeature,
  SuiSignTransaction,
  SuiSignTransactionBlock,
  SuiSignTransactionBlockFeature,
  SuiSignTransactionFeature,
} from '@mysten/wallet-standard';

export type WalletEventsMap = {
  [E in keyof StandardEventsListeners]: Parameters<StandardEventsListeners[E]>[0];
};

export type Features = StandardConnectFeature &
  StandardDisconnectFeature &
  StandardEventsFeature &
  SuiSignPersonalMessageFeature &
  SuiSignTransactionFeature &
  SuiSignAndExecuteTransactionFeature &
  SuiReportTransactionEffectsFeature &
  // Legacy features for backward compatibility
  SuiSignTransactionBlockFeature &
  SuiSignAndExecuteTransactionBlockFeature;

export enum SUI_FEATURE {
  STANDARD__CONNECT = 'standard:connect',
  STANDARD__DISCONNECT = 'standard:disconnect',
  STANDARD__EVENTS = 'standard:events',
  SUI__SIGN_PERSONAL_MESSAGE = 'sui:signPersonalMessage',
  SUI__SIGN_TRANSACTION = 'sui:signTransaction',
  SUI__SIGN_AND_EXECUTE_TRANSACTION = 'sui:signAndExecuteTransaction',
  SUI__REPORT_TRANSACTION_EFFECTS = 'sui:reportTransactionEffects',
  // Legacy features for backward compatibility
  SUI__SIGN_TRANSACTION_BLOCK = 'sui:signTransactionBlock',
  SUI__SIGN_AND_EXECUTE_TRANSACTION_BLOCK = 'sui:signAndExecuteTransactionBlock',
}

export const features = [
  StandardConnect,
  StandardDisconnect,
  StandardEvents,
  SuiSignPersonalMessage,
  SuiSignTransaction,
  SuiSignAndExecuteTransaction,
  SuiReportTransactionEffects,
  // Legacy features for backward compatibility
  SuiSignTransactionBlock,
  SuiSignAndExecuteTransactionBlock,
];
