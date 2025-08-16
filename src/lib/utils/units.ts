const multipliers = {
  knots: 1.943_84, // knots
  kph: 3.6, // kilometers per hour
  mph: 2.236_94, // miles per hour
  mps: 1, // meters per second
}

export function mpsToMph(mps: number): number {
  return mps * multipliers.mph // Convert meters per second to miles per hour
}

export function mphToMps(mph: number): number {
  return mph / multipliers.mph // Convert miles per hour to meters per second
}

export function mpsToKph(mps: number): number {
  return mps * multipliers.kph // Convert meters per second to kilometers per hour
}

export function kphToMps(kph: number): number {
  return kph / multipliers.kph // Convert kilometers per hour to meters per second
}

export function mpsToKnots(mps: number): number {
  return mps * multipliers.knots // Convert meters per second to knots
}

export function knotsToMps(knots: number): number {
  return knots / multipliers.knots // Convert knots to meters per second
}
