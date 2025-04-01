export function isCompassWallet() {
  return !!process.env.APP?.includes('compass')
}
