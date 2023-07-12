import BN from 'bignumber.js';

/* math */
export function plus(a: BN.Value, b: BN.Value): string {
  return new BN(a || 0).plus(b || 0).toString();
}

export function minus(a: BN.Value, b: BN.Value): string {
  return new BN(a || 0).minus(b || 0).toString();
}

export function times(a: BN.Value, b: BN.Value): string {
  return new BN(a || 0).times(b || 0).toString();
}

export function pow(a: BN.Value, b: BN.Value): string {
  return new BN(a || 0).pow(b || 0).toString();
}

export function div(a: BN.Value, b: BN.Value): string {
  return new BN(a || 0).div(b || 1).toString();
}

export function sum(array: BN.Value[]): string {
  return BN.sum.apply(null, array.filter(isFinite)).toString();
}

export function max(array: BN.Value[]): string {
  return BN.max.apply(null, array.filter(isFinite)).toString();
}

export function min(array: BN.Value[]): string {
  return BN.min.apply(null, array.filter(isFinite)).toString();
}

export function ceil(n: BN.Value): string {
  return new BN(n).integerValue(BN.ROUND_CEIL).toString();
}

export function floor(n: BN.Value): string {
  return new BN(n).integerValue(BN.ROUND_FLOOR).toString();
}

/* format */
export function percent(n: BN.Value, f = 2): string {
  return new BN(times(n, 100)).toFixed(f) + '%';
}

export function toNumber(n: BN.Value): number {
  return new BN(n).toNumber();
}

/* boolean */
export function gt(a: BN.Value, b: BN.Value): boolean {
  return new BN(a).gt(b);
}
export function lt(a: BN.Value, b: BN.Value): boolean {
  return new BN(a).lt(b);
}
export function gte(a: BN.Value, b: BN.Value): boolean {
  return new BN(a).gte(b);
}
export function lte(a: BN.Value, b: BN.Value): boolean {
  return new BN(a).lte(b);
}

export function isFinite(n: BN.Value): boolean {
  return new BN(n).isFinite();
}
export function isInteger(n: BN.Value): boolean {
  return new BN(n).isInteger();
}
