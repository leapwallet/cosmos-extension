export class LedgerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LedgerError';
  }
}
//errors thrown by ledger
export const bolosErrorMessage = 'Please close BOLOS and open the Cosmos Ledger app on your Ledger device.';
export const bolosErrorMessageEthApp = 'Ledger device: CLA_NOT_SUPPORTED';
export const ledgerDisconnectMessage =
  "Ledger Native Error: DisconnectedDeviceDuringOperation: Failed to execute 'transferOut' on 'USBDevice': The device was disconnected.";

export const transactionDeclinedError = 'Transaction signing request was rejected by the user';
export const transactionDeclinedError3 = 'Transaction rejected';

export const ledgerLockedError = 'Locked device (0x5515)';
export const ledgerLockedError2 = 'Ledger Native Error: Unknown Status Code: 21781';
export const transactionDeclinedError2 = 'Condition of use not satisfied (denied by the user?)';
export const sizeLimitExceededError = 'Ledger Native Error: Data is invalid : JSON. Too many tokens';
export const declinedCosmosAppOpenError = 'Please open the Cosmos app on your Ledger device.';
export const declinedEthAppOpenError = 'Please open the Ethereum app on your Ledger device.';
export const ethAppEnableContractDataError =
  'Please enable Blind signing or Contract data in the Ethereum app Settings';

export const transactionDeclinedErrors = [
  transactionDeclinedError,
  transactionDeclinedError2,
  transactionDeclinedError3,
];

//errors shown to user
export const txDeclinedErrorUser = new LedgerError('Transaction rejected on Ledger.');
export const bolosError = new LedgerError('Please open the Cosmos app on your Ledger.');
export const bolosErrorEth = new LedgerError('Please open the Ethereum app on your Ledger.');
export const deviceLockedError = new LedgerError('Please unlock your Ledger device.');

export const ledgerConnectedOnDifferentTabError = new LedgerError(
  'Ledger is connected on a different tab. Please close the other tab and try again.',
);

export const deviceDisconnectedError = new LedgerError(
  'Ledger device disconnected. Please connect and unlock your device and open the cosmos app on it.',
);
export const sizeLimitExceededErrorUser = new LedgerError(
  'Error: Transaction size exceeds Ledger capacity. Please contact dApp developer for support.',
);

export const declinedSeiAppOpenError = 'Please open the Sei app on your Ledger device.';
