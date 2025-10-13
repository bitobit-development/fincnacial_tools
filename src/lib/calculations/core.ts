// =============================================================================
// Core Financial Formulas
// =============================================================================

/**
 * Calculate Future Value with regular monthly contributions
 *
 * Formula: FV = PV × (1 + r)^n + PMT × [((1 + r)^n - 1) / r]
 *
 * @param presentValue - Starting balance (Rand)
 * @param monthlyContribution - Monthly contribution amount (Rand)
 * @param annualReturnRate - Annual return rate (percentage, e.g., 8 for 8%)
 * @param years - Number of years
 * @returns Future value in Rand
 *
 * @example
 * calculateFutureValue(100000, 3000, 8, 20) // R 2,332,366
 */
export const calculateFutureValue = (
  presentValue: number,
  monthlyContribution: number,
  annualReturnRate: number,
  years: number
): number => {
  // Handle edge cases
  if (years <= 0) return presentValue
  if (presentValue < 0 || monthlyContribution < 0) return 0

  const r = annualReturnRate / 100 // Convert percentage to decimal
  const annualContribution = monthlyContribution * 12

  // Handle zero return rate (special case where division by zero would occur)
  if (r === 0) {
    return presentValue + annualContribution * years
  }

  // Growth of present value
  const growthOfPV = presentValue * Math.pow(1 + r, years)

  // Growth of contributions (annuity formula)
  const growthOfContributions =
    annualContribution * ((Math.pow(1 + r, years) - 1) / r)

  return Math.round((growthOfPV + growthOfContributions) * 100) / 100
}

/**
 * Calculate Present Value (adjust future value for inflation)
 *
 * Formula: PV = FV / (1 + i)^n
 *
 * @param futureValue - Nominal future value (Rand)
 * @param inflationRate - Annual inflation rate (percentage)
 * @param years - Number of years
 * @returns Real value in today's Rand
 *
 * @example
 * calculatePresentValue(2000000, 6, 20) // R 623,612
 */
export const calculatePresentValue = (
  futureValue: number,
  inflationRate: number,
  years: number
): number => {
  if (years <= 0) return futureValue
  if (futureValue < 0) return 0

  const i = inflationRate / 100
  const presentValue = futureValue / Math.pow(1 + i, years)

  return Math.round(presentValue * 100) / 100
}

/**
 * Calculate Compound Annual Growth Rate (CAGR)
 *
 * Formula: CAGR = ((FV / PV)^(1 / n) - 1) × 100
 *
 * @param initialValue - Starting value
 * @param finalValue - Ending value
 * @param years - Number of years
 * @returns CAGR as percentage
 *
 * @example
 * calculateCAGR(100000, 200000, 10) // 7.18%
 */
export const calculateCAGR = (
  initialValue: number,
  finalValue: number,
  years: number
): number => {
  if (years <= 0 || initialValue <= 0) return 0
  if (finalValue <= 0) return -100

  const cagr = (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100

  return Math.round(cagr * 100) / 100
}

/**
 * Calculate Real Return (inflation-adjusted return)
 *
 * Formula: Real Return = ((1 + Nominal) / (1 + Inflation)) - 1
 *
 * @param nominalReturn - Nominal return rate (percentage)
 * @param inflation - Inflation rate (percentage)
 * @returns Real return as percentage
 *
 * @example
 * calculateRealReturn(10, 6) // 3.77%
 */
export const calculateRealReturn = (
  nominalReturn: number,
  inflation: number
): number => {
  const r = nominalReturn / 100
  const i = inflation / 100

  const realReturn = ((1 + r) / (1 + i) - 1) * 100

  return Math.round(realReturn * 100) / 100
}

/**
 * Convert nominal return to real return
 *
 * @param nominalReturn - Nominal return (%)
 * @param inflation - Inflation rate (%)
 * @returns Real return (%)
 */
export const convertToRealReturn = (
  nominalReturn: number,
  inflation: number
): number => {
  return calculateRealReturn(nominalReturn, inflation)
}

/**
 * Convert real return to nominal return
 *
 * @param realReturn - Real return (%)
 * @param inflation - Inflation rate (%)
 * @returns Nominal return (%)
 */
export const convertToNominalReturn = (
  realReturn: number,
  inflation: number
): number => {
  const r = realReturn / 100
  const i = inflation / 100

  const nominalReturn = ((1 + r) * (1 + i) - 1) * 100

  return Math.round(nominalReturn * 100) / 100
}

/**
 * Calculate future income needed based on inflation
 *
 * @param currentIncome - Today's income (Rand)
 * @param inflationRate - Annual inflation (%)
 * @param years - Years in future
 * @returns Future income needed (Rand)
 */
export const inflationAdjustedIncome = (
  currentIncome: number,
  inflationRate: number,
  years: number
): number => {
  if (years <= 0) return currentIncome
  if (currentIncome < 0) return 0

  const futureIncome = currentIncome * Math.pow(1 + inflationRate / 100, years)

  return Math.round(futureIncome * 100) / 100
}
