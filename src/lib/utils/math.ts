export function calcMean(ns: number[]): number {
  if (ns.length === 0) {
    return 0
  }
  return ns.reduce((a, b) => a + b, 0) / ns.length
}
