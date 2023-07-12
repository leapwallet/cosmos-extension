export interface BalancesResponse {
  balances: Balance[];
  pagination: Pagination;
}

export interface Balance {
  denom: string;
  amount: string;
}

export interface Pagination {
  next_key: any;
}

export interface Dict<T = any> {
  [key: string | number]: T;
}
