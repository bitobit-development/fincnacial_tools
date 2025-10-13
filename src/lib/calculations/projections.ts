// =============================================================================
// Year-by-Year Projection Engine
// =============================================================================

import type { PlannerState, ProjectionYear } from '@/types'
import { calculateFutureValue, calculatePresentValue } from './core'
import { calculateWithdrawalTax } from './tax'

/**
 * Project a single year in the accumulation phase (before retirement)
 *
 * @param beginningBalance - Balance at start of year (Rand)
 * @param monthlyContribution - Monthly contribution (Rand)
 * @param annualReturnRate - Annual return rate (%)
 * @param inflationRate - Annual inflation rate (%)
 * @param currentAge - User's age this year
 * @param currentYear - Calendar year
 * @param baseYear - Base year for inflation adjustment
 * @returns ProjectionYear object
 */
export const projectAccumulationYear = (
  beginningBalance: number,
  monthlyContribution: number,
  annualReturnRate: number,
  inflationRate: number,
  currentAge: number,
  currentYear: number,
  baseYear: number
): ProjectionYear => {
  const annualContribution = monthlyContribution * 12

  // Add contributions to balance
  const balanceAfterContributions = beginningBalance + annualContribution

  // Calculate investment return on balance + contributions
  const investmentReturn = balanceAfterContributions * (annualReturnRate / 100)

  // Ending balance
  const endingBalance = balanceAfterContributions + investmentReturn

  // Inflation adjustment
  const yearsFromBase = currentYear - baseYear
  const inflationAdjustedBalance = calculatePresentValue(
    endingBalance,
    inflationRate,
    yearsFromBase
  )

  return {
    year: currentYear,
    age: currentAge,
    beginningBalance: Math.round(beginningBalance * 100) / 100,
    contributions: Math.round(annualContribution * 100) / 100,
    investmentReturn: Math.round(investmentReturn * 100) / 100,
    withdrawals: 0,
    taxPaid: 0,
    endingBalance: Math.round(endingBalance * 100) / 100,
    inflationAdjustedBalance:
      Math.round(inflationAdjustedBalance * 100) / 100,
  }
}

/**
 * Project a single year in the withdrawal phase (after retirement)
 *
 * @param beginningBalance - Balance at start of year (Rand)
 * @param drawdownRate - Annual withdrawal rate (%)
 * @param annualReturnRate - Annual return rate (%)
 * @param inflationRate - Annual inflation rate (%)
 * @param currentAge - User's age this year
 * @param currentYear - Calendar year
 * @param baseYear - Base year for inflation adjustment
 * @returns ProjectionYear object
 */
export const projectWithdrawalYear = (
  beginningBalance: number,
  drawdownRate: number,
  annualReturnRate: number,
  inflationRate: number,
  currentAge: number,
  currentYear: number,
  baseYear: number
): ProjectionYear => {
  // Calculate withdrawal amount (percentage of beginning balance)
  const withdrawalAmount = beginningBalance * (drawdownRate / 100)

  // Calculate tax on withdrawal (taxed as income)
  const taxPaid = calculateWithdrawalTax(withdrawalAmount, currentAge, false)

  // Balance after withdrawal
  const balanceAfterWithdrawal = Math.max(0, beginningBalance - withdrawalAmount)

  // Calculate investment return on remaining balance
  const investmentReturn =
    balanceAfterWithdrawal * (annualReturnRate / 100)

  // Ending balance (cannot go negative)
  const endingBalance = Math.max(0, balanceAfterWithdrawal + investmentReturn)

  // Inflation adjustment
  const yearsFromBase = currentYear - baseYear
  const inflationAdjustedBalance = calculatePresentValue(
    endingBalance,
    inflationRate,
    yearsFromBase
  )

  return {
    year: currentYear,
    age: currentAge,
    beginningBalance: Math.round(beginningBalance * 100) / 100,
    contributions: 0,
    investmentReturn: Math.round(investmentReturn * 100) / 100,
    withdrawals: Math.round(withdrawalAmount * 100) / 100,
    taxPaid: Math.round(taxPaid * 100) / 100,
    endingBalance: Math.round(endingBalance * 100) / 100,
    inflationAdjustedBalance:
      Math.round(inflationAdjustedBalance * 100) / 100,
  }
}

/**
 * Calculate the age at which funds will be depleted
 *
 * @param startingBalance - Balance at retirement (Rand)
 * @param drawdownRate - Annual withdrawal rate (%)
 * @param annualReturnRate - Annual return rate (%)
 * @param startAge - Age at retirement
 * @returns Age when funds run out, or null if never depletes
 */
export const calculateFundDepletionAge = (
  startingBalance: number,
  drawdownRate: number,
  annualReturnRate: number,
  startAge: number
): number | null => {
  if (startingBalance <= 0) return startAge

  let balance = startingBalance
  let age = startAge
  const maxAge = 120 // Reasonable upper bound

  // If return rate >= drawdown rate, fund may never deplete
  if (annualReturnRate >= drawdownRate) {
    // Simulate to verify
    let testBalance = balance
    for (let testAge = age; testAge < age + 50; testAge++) {
      const withdrawal = testBalance * (drawdownRate / 100)
      const tax = calculateWithdrawalTax(withdrawal, testAge, false)
      const afterWithdrawal = testBalance - withdrawal
      const returns = afterWithdrawal * (annualReturnRate / 100)
      testBalance = afterWithdrawal + returns

      if (testBalance <= 0) {
        // Fund depletes
        break
      }
      if (testAge === age + 49) {
        // Still has money after 50 years
        return null
      }
    }
  }

  // Simulate year by year
  while (balance > 0 && age < maxAge) {
    const withdrawal = balance * (drawdownRate / 100)
    const tax = calculateWithdrawalTax(withdrawal, age, false)
    const balanceAfterWithdrawal = balance - withdrawal
    const investmentReturn =
      balanceAfterWithdrawal * (annualReturnRate / 100)

    balance = balanceAfterWithdrawal + investmentReturn
    age++

    if (balance <= 0) {
      return age
    }
  }

  // Fund never depletes within reasonable timeframe
  return null
}

/**
 * Generate complete year-by-year projection from current age to age 100
 *
 * @param plannerState - Complete planner state
 * @returns Array of ProjectionYear objects
 */
export const generateFullProjection = (
  plannerState: PlannerState
): ProjectionYear[] => {
  const {
    currentAge,
    retirementAge,
    startingBalance,
    monthlyContribution,
    annualReturn,
    inflation,
    drawdownRate,
  } = plannerState

  const projectionHistory: ProjectionYear[] = []
  const baseYear = new Date().getFullYear()

  let balance = startingBalance
  let age = currentAge
  let year = baseYear

  // Accumulation phase (before retirement)
  while (age < retirementAge) {
    const projection = projectAccumulationYear(
      balance,
      monthlyContribution,
      annualReturn,
      inflation,
      age,
      year,
      baseYear
    )

    projectionHistory.push(projection)
    balance = projection.endingBalance
    age++
    year++
  }

  // Withdrawal phase (after retirement, up to age 100 or fund depletion)
  const maxAge = 100
  while (age <= maxAge && balance > 0) {
    const projection = projectWithdrawalYear(
      balance,
      drawdownRate,
      annualReturn,
      inflation,
      age,
      year,
      baseYear
    )

    projectionHistory.push(projection)
    balance = projection.endingBalance
    age++
    year++

    // Stop if balance is effectively zero
    if (balance < 1) {
      break
    }
  }

  return projectionHistory
}

/**
 * Calculate the balance at a specific age
 *
 * @param plannerState - Complete planner state
 * @param targetAge - Age to calculate balance for
 * @returns Balance at target age (Rand)
 */
export const calculateBalanceAtAge = (
  plannerState: PlannerState,
  targetAge: number
): number => {
  const { currentAge, retirementAge, startingBalance, monthlyContribution, annualReturn } =
    plannerState

  if (targetAge < currentAge) return startingBalance
  if (targetAge === currentAge) return startingBalance

  // Before retirement
  if (targetAge < retirementAge) {
    const years = targetAge - currentAge
    return calculateFutureValue(
      startingBalance,
      monthlyContribution,
      annualReturn,
      years
    )
  }

  // At or after retirement - need full projection
  const projections = generateFullProjection(plannerState)
  const targetProjection = projections.find((p) => p.age === targetAge)

  return targetProjection?.endingBalance || 0
}

/**
 * Project a single year with inflation-adjusted withdrawal
 *
 * Used for calculating realistic retirement income that maintains purchasing power
 *
 * @param beginningBalance - Balance at start of year (Rand)
 * @param baseWithdrawalAmount - Base withdrawal amount (Rand)
 * @param yearsIntoRetirement - Years since retirement started
 * @param annualReturnRate - Annual return rate (%)
 * @param inflationRate - Annual inflation rate (%)
 * @param currentAge - User's age this year
 * @param currentYear - Calendar year
 * @param baseYear - Base year for inflation adjustment
 * @returns ProjectionYear object
 */
export const projectInflationAdjustedWithdrawalYear = (
  beginningBalance: number,
  baseWithdrawalAmount: number,
  yearsIntoRetirement: number,
  annualReturnRate: number,
  inflationRate: number,
  currentAge: number,
  currentYear: number,
  baseYear: number
): ProjectionYear => {
  // Adjust withdrawal for inflation
  const inflationAdjustedWithdrawal =
    baseWithdrawalAmount * Math.pow(1 + inflationRate / 100, yearsIntoRetirement)

  // Calculate tax
  const taxPaid = calculateWithdrawalTax(
    inflationAdjustedWithdrawal,
    currentAge,
    false
  )

  // Balance after withdrawal
  const balanceAfterWithdrawal = Math.max(
    0,
    beginningBalance - inflationAdjustedWithdrawal
  )

  // Investment return
  const investmentReturn =
    balanceAfterWithdrawal * (annualReturnRate / 100)

  // Ending balance
  const endingBalance = Math.max(0, balanceAfterWithdrawal + investmentReturn)

  // Inflation adjustment for reporting
  const yearsFromBase = currentYear - baseYear
  const inflationAdjustedBalance = calculatePresentValue(
    endingBalance,
    inflationRate,
    yearsFromBase
  )

  return {
    year: currentYear,
    age: currentAge,
    beginningBalance: Math.round(beginningBalance * 100) / 100,
    contributions: 0,
    investmentReturn: Math.round(investmentReturn * 100) / 100,
    withdrawals: Math.round(inflationAdjustedWithdrawal * 100) / 100,
    taxPaid: Math.round(taxPaid * 100) / 100,
    endingBalance: Math.round(endingBalance * 100) / 100,
    inflationAdjustedBalance:
      Math.round(inflationAdjustedBalance * 100) / 100,
  }
}
