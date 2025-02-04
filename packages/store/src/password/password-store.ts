import { makeAutoObservable } from 'mobx';

export class PasswordStore {
  password?: Uint8Array | null;

  constructor() {
    makeAutoObservable(this);
  }

  setPassword(password: Uint8Array | undefined | null) {
    this.password = password;
  }
}
