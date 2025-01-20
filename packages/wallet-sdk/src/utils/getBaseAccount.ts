export function getBaseAccount(account: any) {
  if (account?.['@type'] === '/desmos.profiles.v3.Profile') {
    return account.account;
  }

  if (account?.base_account) {
    return account.base_account;
  }

  if (account?.base_vesting_account?.base_account) {
    return account.base_vesting_account.base_account;
  }

  return account;
}
