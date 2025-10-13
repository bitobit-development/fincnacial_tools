// =============================================================================
// Financial Calculations - Barrel Export
// =============================================================================

// Core Financial Formulas
export {
  calculateFutureValue,
  calculatePresentValue,
  calculateCAGR,
  calculateRealReturn,
  convertToRealReturn,
  convertToNominalReturn,
  inflationAdjustedIncome,
} from './core'

// SARS Tax Calculations (2025/26)
export {
  calculateIncomeTax,
  calculateRALumpSumTax,
  calculateCGT,
  calculateDividendTax,
  calculateInterestTax,
  calculateWithdrawalTax,
  getMarginalTaxRate,
  getTaxFreeThreshold,
  TAX_CONSTANTS_2025,
} from './tax'

// Year-by-Year Projections
export {
  projectAccumulationYear,
  projectWithdrawalYear,
  calculateFundDepletionAge,
  generateFullProjection,
  calculateBalanceAtAge,
  projectInflationAdjustedWithdrawalYear,
} from './projections'

// Aggregate Statistics
export {
  calculateTotalContributed,
  calculateTotalWithdrawn,
  calculateTotalTaxPaid,
  calculateNetAfterTaxIncome,
  calculateWealthRetentionRatio,
  calculateEffectiveTaxRate,
  calculateProjectedValueAtRetirement,
  calculateFundDepletionAgeFromProjections,
  generateStatistics,
  calculateAverageAnnualReturn,
  calculateTotalInvestmentReturns,
  calculatePeakBalance,
  calculateRetirementDuration,
  calculateAverageMonthlyIncome,
  calculateInflationAdjustedMonthlyIncome,
} from './statistics'
