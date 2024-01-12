export class LedgerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LedgerError';
  }
}
//errors thrown by ledger
export const bolosErrorMessage = 'Please close BOLOS and open the Cosmos Ledger app on your Ledger device.';
export const ledgerDisconnectMessage =
  "Ledger Native Error: DisconnectedDeviceDuringOperation: Failed to execute 'transferOut' on 'USBDevice': The device was disconnected.";

export const transactionDeclinedError = new LedgerError('Transaction signing request was rejected by the user');
export const ledgerLockedError = 'Ledger Native Error: LockedDeviceError: Ledger device: Locked device (0x5515)';

//errors shown to user
export const txDeclinedErrorUser = new LedgerError('Transaction rejected on Ledger.');
export const bolosError = new LedgerError('Please open the Cosmos Ledger app on your Ledger device.');
export const deviceLockedError = new LedgerError('Please unlock your Ledger device.');

export const ledgerConnectedOnDifferentTabError = new LedgerError(
  'Ledger is connected on a different tab. Please close the other tab and try again.',
);

export const deviceDisconnectedError = new LedgerError(
  'Ledger device disconnected. Please connect and unlock your device and open the cosmos app on it.',
);
