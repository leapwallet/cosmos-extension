/* eslint-disable @typescript-eslint/ban-ts-comment */
import { OfflineAminoSigner } from '@cosmjs/amino';
import { OfflineDirectSigner } from '@cosmjs/proto-signing';

import { newPermit, Permission, Permit, PermitError, validatePermit } from './index';

export class DirectSignerUnsupported extends PermitError {
  constructor() {
    super('Only amino signer is supported for permits');
  }
}

export class PermitSigner {
  signer: OfflineAminoSigner | OfflineDirectSigner;

  constructor(signer: OfflineAminoSigner | OfflineDirectSigner) {
    this.signer = signer;
  }

  private isAminoSigner = (signer: OfflineAminoSigner | OfflineDirectSigner): boolean => {
    return 'signAmino' in signer;
  };

  _checkSigner() {
    if (!this.isAminoSigner(this.signer)) {
      throw new DirectSignerUnsupported();
    }
  }

  /**
   *
   * Signs a new permit based on the input parameters.
   *
   * @param owner
   * @param chainId
   * @param permitName
   * @param allowedContracts
   * @param permissions
   * @param keplr - are we signing with keplr or not?
   * @returns Permit
   */
  sign(
    owner: string,
    chainId: string,
    permitName: string,
    allowedContracts: string[],
    permissions: Permission[],
    keplr: boolean = true,
  ): Promise<Permit> {
    this._checkSigner();

    return newPermit(
      //@ts-ignore
      this.signer,
      owner,
      chainId,
      permitName,
      allowedContracts,
      permissions,
      keplr,
    );
  }

  /**
   *
   * This method will verify a permit according to a contract address and a submitting address (and a set of permissions)
   * On failure an appropriate error will be thrown according to the type of error.
   *
   * @throws PermitError on any error or verification failure
   *
   * @param permit
   * @param forAddress
   * @param forContract
   * @param permissions
   */
  verify(permit: Permit, forAddress: string, forContract: string, permissions: Permission[]): boolean {
    return validatePermit(permit, forAddress, forContract, permissions);
  }

  /**
   * Variant of the verify method that returns a boolean value instead of throwing exceptions
   *
   * @param permit
   * @param forAddress
   * @param forContract
   * @param permissions
   *
   * @returns boolean - true on success, false on verification failure
   */
  verifyNoExcept(permit: Permit, forAddress: string, forContract: string, permissions: Permission[]): boolean {
    return validatePermit(permit, forAddress, forContract, permissions, false);
  }
}
