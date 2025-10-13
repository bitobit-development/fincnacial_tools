// =============================================================================
// Aggregate Statistics Calculations
// =============================================================================

import type { ProjectionYear, Statistics, PlannerState } from '@/types'
import { generateFullProjection, calculateFundDepletionAge } from './projections'

/**
 * Calculate total amount contributed during accumulation phase
 *
 * @param projections - Array of projection years
 * @returns Total contributed (Rand)
 */
export const calculateTotalContributed = (
  projections: ProjectionYear[]
): number => {
  const totalContributions = projections.reduce(
    (sum, year) => sum + year.contributions,
    0
  )

  // Add starting balance (first year's beginning balance)
  const startingBalance = projections[0]?.beginningBalance || 0

  return Math.round((startingBalance + totalContributions) * 100) / 100
}

/**
 * Calculate total amount withdrawn during retirement
 *
 * @param projections - Array of projection years
 * @returns Total withdrawn (Rand)
 */
export const calculateTotalWithdrawn = (
  projections: ProjectionYear[]
): number => {
  const total = projections.reduce((sum, year) => sum + year.withdrawals, 0)

  return Math.round(total * 100) / 100
}

/**
 * Calculate total tax paid over lifetime
 *
 * @param projections - Array of projection years
 * @returns Total tax paid (Rand)
 */
export const calculateTotalTaxPaid = (
  projections: ProjectionYear[]
): number => {
  const total = projections.reduce((sum, year) => sum + year.taxPaid, 0)

  return Math.round(total * 100) / 100
}

/**
 * Calculate net after-tax income
 *
 * @param totalWithdrawn - Total amount withdrawn
 * @param totalTaxPaid - Total tax paid
 * @returns Net income after tax (Rand)
 */
export const calculateNetAfterTaxIncome = (
  totalWithdrawn: number,
  totalTaxPaid: number
): number => {
  const netIncome = totalWithdrawn - totalTaxPaid

  return Math.round(netIncome * 100) / 100
}

/**
 * Calculate wealth retention ratio
 *
 * Formula: (Net After-Tax Income / Total Contributed) × 100
 *
 * Measures how much value was retained after all taxes.
 * > 100% = gained value
 * < 100% = lost value
 *
 * @param netAfterTaxIncome - Net income after tax
 * @param totalContributed - Total contributed
 * @returns Wealth retention ratio (%)
 *
 * @example
 * calculateWealthRetentionRatio(4420000, 2400000) // 184%
 */
export const calculateWealthRetentionRatio = (
  netAfterTaxIncome: number,
  totalContributed: number
): number => {
  if (totalContributed <= 0) return 0

  const ratio = (netAfterTaxIncome / totalContributed) * 100

  return Math.round(ratio * 100) / 100
}

/**
 * Calculate effective tax rate
 *
 * Formula: (Total Tax Paid / Total Withdrawn) × 100
 *
 * Measures the blended tax rate over the entire withdrawal phase
 *
 * @param totalTaxPaid - Total tax paid
 * @param totalWithdrawn - Total withdrawn
 * @returns Effective tax rate (%)
 *
 * @example
 * calculateEffectiveTaxRate(780000, 5200000) // 15%
 */
export const calculateEffectiveTaxRate = (
  totalTaxPaid: number,
  totalWithdrawn: number
): number => {
  if (totalWithdrawn <= 0) return 0

  const rate = (totalTaxPaid / totalWithdrawn) * 100

  return Math.round(rate * 100) / 100
}

/**
 * Calculate projected value at retirement
 *
 * @param projections - Array of projection years
 * @param retirementAge - Age at retirement
 * @returns Balance at retirement (Rand)
 */
export const calculateProjectedValueAtRetirement = (
  projections: ProjectionYear[],
  retirementAge: number
): number => {
  const retirementYear = projections.find((p) => p.age === retirementAge)

  return retirementYear?.endingBalance || 0
}

/**
 * Calculate fund depletion age from projections
 *
 * @param projections - Array of projection years
 * @returns Age when funds run out, or null if never
 */
export const calculateFundDepletionAgeFromProjections = (
  projections: ProjectionYear[]
): number | null => {
  // Find the first year where ending balance is zero or negative
  const depletionYear = projections.find((p) => p.endingBalance <= 0)

  if (!depletionYear) {
    // Check if last year still has balance
    const lastYear = projections[projections.length - 1]
    if (lastYear && lastYear.endingBalance > 0) {
      return null // Fund never depletes
    }
  }

  return depletionYear?.age || null
}

/**
 * Generate complete statistics from planner state
 *
 * Main entry point for calculating all statistics
 *
 * @param plannerState - Complete planner state
 * @returns Statistics object
 */
export const generateStatistics = (
  plannerState: PlannerState
): Statistics => {
  // Generate full projection
  const projections = generateFullProjection(plannerState)

  // Calculate all statistics
  const totalContributed = calculateTotalContributed(projections)
  const totalWithdrawn = calculateTotalWithdrawn(projections)
  const totalTaxPaid = calculateTotalTaxPaid(projections)
  const netAfterTaxIncome = calculateNetAfterTaxIncome(
    totalWithdrawn,
    totalTaxPaid
  )
  const projectedValueAtRetirement = calculateProjectedValueAtRetirement(
    projections,
    plannerState.retirementAge
  )
  const fundDepletionAge = calculateFundDepletionAgeFromProjections(projections)
  const wealthRetentionRatio = calculateWealthRetentionRatio(
    netAfterTaxIncome,
    totalContributed
  )
  const effectiveTaxRate = calculateEffectiveTaxRate(
    totalTaxPaid,
    totalWithdrawn
  )

  return {
    totalContributed,
    projectedValueAtRetirement,
    totalWithdrawn,
    totalTaxPaid,
    netAfterTaxIncome,
    fundDepletionAge,
    wealthRetentionRatio,
    effectiveTaxRate,
  }
}

/**
 * Calculate average annual return achieved
 *
 * @param projections - Array of projection years
 * @returns Average annual return (%)
 */
export const calculateAverageAnnualReturn = (
  projections: ProjectionYear[]
): number => {
  if (projections.length === 0) return 0

  const totalReturn = projections.reduce((sum, year) => {
    const beginningBalance = year.beginningBalance + year.contributions
    if (beginningBalance <= 0) return sum
    return sum + (year.investmentReturn / beginningBalance) * 100
  }, 0)

  const averageReturn = totalReturn / projections.length

  return Math.round(averageReturn * 100) / 100
}

/**
 * Calculate total investment returns (growth)
 *
 * @param projections - Array of projection years
 * @returns Total investment growth (Rand)
 */
export const calculateTotalInvestmentReturns = (
  projections: ProjectionYear[]
): number => {
  const total = projections.reduce((sum, year) => sum + year.investmentReturn, 0)

  return Math.round(total * 100) / 100
}

/**
 * Calculate peak balance (highest balance achieved)
 *
 * @param projections - Array of projection years
 * @returns Peak balance and age it occurred
 */
export const calculatePeakBalance = (
  projections: ProjectionYear[]
): { balance: number; age: number; year: number } => {
  if (projections.length === 0) {
    return { balance: 0, age: 0, year: 0 }
  }

  const peak = projections.reduce((max, year) => {
    return year.endingBalance > max.endingBalance ? year : max
  }, projections[0])

  return {
    balance: peak.endingBalance,
    age: peak.age,
    year: peak.year,
  }
}

/**
 * Calculate retirement duration (years of withdrawals)
 *
 * @param projections - Array of projection years
 * @param retirementAge - Age at retirement
 * @returns Number of years in retirement
 */
export const calculateRetirementDuration = (
  projections: ProjectionYear[],
  retirementAge: number
): number => {
  const retirementYears = projections.filter((p) => p.age >= retirementAge)

  return retirementYears.length
}

/**
 * Calculate average monthly income during retirement
 *
 * @param totalWithdrawn - Total withdrawn during retirement
 * @param retirementDuration - Years in retirement
 * @returns Average monthly income (Rand)
 */
export const calculateAverageMonthlyIncome = (
  totalWithdrawn: number,
  retirementDuration: number
): number => {
  if (retirementDuration <= 0) return 0

  const averageAnnual = totalWithdrawn / retirementDuration
  const averageMonthly = averageAnnual / 12

  return Math.round(averageMonthly * 100) / 100
}

/**
 * Calculate inflation-adjusted average monthly income
 *
 * @param projections - Array of projection years
 * @param retirementAge - Age at retirement
 * @returns Average monthly income in today's Rand
 */
export const calculateInflationAdjustedMonthlyIncome = (
  projections: ProjectionYear[],
  retirementAge: number
): number => {
  const retirementYears = projections.filter((p) => p.age >= retirementAge)

  if (retirementYears.length === 0) return 0

  // Use inflation-adjusted withdrawals
  const totalInflationAdjustedWithdrawals = retirementYears.reduce(
    (sum, year) => {
      // Convert withdrawal to today's value
      const yearsFromStart = year.year - projections[0].year
      const inflationFactor = Math.pow(1.06, yearsFromStart) // Assume 6% inflation
      return sum + year.withdrawals / inflationFactor
    },
    0
  )

  const averageAnnual =
    totalInflationAdjustedWithdrawals / retirementYears.length
  const averageMonthly = averageAnnual / 12

  return Math.round(averageMonthly * 100) / 100
}
