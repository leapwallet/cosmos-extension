export function convertScientificNotation(value: number) {
  return new Intl.NumberFormat('fullwide', { useGrouping: false }).format(value);
}
