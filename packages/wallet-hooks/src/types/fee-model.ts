export interface FeeModel {
  min_gas_price: MinGasPrice;
}

export interface MinGasPrice {
  denom: string;
  amount: string;
}
