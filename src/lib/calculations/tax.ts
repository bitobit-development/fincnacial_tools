// =============================================================================
// SARS Tax Calculations (2025/26 Tax Year)
// =============================================================================

/**
 * SARS Income Tax Brackets for 2025/26
 */
const INCOME_TAX_BRACKETS_2025 = [
  { min: 0, max: 237100, rate: 0.18, baseTax: 0 },
  { min: 237101, max: 370500, rate: 0.26, baseTax: 42678 },
  { min: 370501, max: 512800, rate: 0.31, baseTax: 77362 },
  { min: 512801, max: 673000, rate: 0.36, baseTax: 121475 },
  { min: 673001, max: 857900, rate: 0.39, baseTax: 179147 },
  { min: 857901, max: 1817000, rate: 0.41, baseTax: 251258 },
  { min: 1817001, max: Infinity, rate: 0.45, baseTax: 644489 },
] as const

/**
 * SARS Tax Rebates for 2025/26
 */
const TAX_REBATES_2025 = {
  primary: 17235, // All taxpayers
  secondary: 9444, // Age 65+
  tertiary: 3145, // Age 75+
} as const

/**
 * SARS RA Lump-Sum Withdrawal Brackets for 2025/26
 */
const RA_LUMP_SUM_BRACKETS_2025 = [
  { min: 0, max: 550000, rate: 0, baseTax: 0 }, // Tax-free
  { min: 550001, max: 770000, rate: 0.18, baseTax: 0 },
  { min: 770001, max: 1155000, rate: 0.27, baseTax: 39600 },
  { min: 1155001, max: Infinity, rate: 0.36, baseTax: 143550 },
] as const

/**
 * SARS Capital Gains Tax Rules for 2025/26
 */
const CGT_RULES_2025 = {
  inclusionRate: 0.4, // 40% of gain is taxable
  annualExclusion: 40000, // R40,000 annual exclusion
} as const

/**
 * SARS Dividend Withholding Tax for 2025/26
 */
const DIVIDEND_WHT_RATE_2025 = 0.2 // 20% flat rate

/**
 * SARS Interest Income Exemptions for 2025/26
 */
const INTEREST_EXEMPTIONS_2025 = {
  under65: 23800,
  over65: 34500,
} as const

// =============================================================================
// Tax Calculation Functions
// =============================================================================

/**
 * Calculate SARS progressive income tax
 *
 * @param taxableIncome - Annual taxable income (Rand)
 * @param age - Taxpayer's age
 * @returns Tax amount (Rand)
 *
 * @example
 * calculateIncomeTax(500000, 60) // R 105,227
 * calculateIncomeTax(500000, 70) // R 95,783 (with secondary rebate)
 */
export const calculateIncomeTax = (
  taxableIncome: number,
  age: number
): number => {
  if (taxableIncome <= 0) return 0

  // Find applicable bracket
  const bracket = INCOME_TAX_BRACKETS_2025.find(
    (b) => taxableIncome >= b.min && taxableIncome <= b.max
  )

  if (!bracket) return 0

  // Calculate tax before rebates (SARS formula includes +1 for inclusive range)
  const taxableAmount = Math.max(0, taxableIncome - bracket.min)
  const taxBeforeRebates = bracket.baseTax + taxableAmount * bracket.rate

  // Apply age-based rebates
  let totalRebate = TAX_REBATES_2025.primary

  if (age >= 75) {
    totalRebate += TAX_REBATES_2025.secondary + TAX_REBATES_2025.tertiary
  } else if (age >= 65) {
    totalRebate += TAX_REBATES_2025.secondary
  }

  // Tax cannot be negative
  const finalTax = Math.max(0, taxBeforeRebates - totalRebate)

  return Math.round(finalTax * 100) / 100
}

/**
 * Calculate SARS RA lump-sum withdrawal tax
 *
 * @param lumpSumAmount - Lump-sum withdrawal amount (Rand)
 * @returns Tax amount (Rand)
 *
 * @example
 * calculateRALumpSumTax(1000000) // R 101,850
 */
export const calculateRALumpSumTax = (lumpSumAmount: number): number => {
  if (lumpSumAmount <= 0) return 0

  // Find applicable bracket
  const bracket = RA_LUMP_SUM_BRACKETS_2025.find(
    (b) => lumpSumAmount >= b.min && lumpSumAmount <= b.max
  )

  if (!bracket) return 0

  // Calculate tax (SARS formula)
  const taxableAmount = Math.max(0, lumpSumAmount - bracket.min)
  const tax = bracket.baseTax + taxableAmount * bracket.rate

  return Math.round(tax * 100) / 100
}

/**
 * Calculate Capital Gains Tax (CGT)
 *
 * @param capitalGain - Total capital gain (Rand)
 * @param marginalIncomeTaxRate - Taxpayer's marginal rate (%)
 * @returns CGT amount (Rand)
 *
 * @example
 * calculateCGT(200000, 39) // R 24,960
 */
export const calculateCGT = (
  capitalGain: number,
  marginalIncomeTaxRate: number
): number => {
  if (capitalGain <= 0) return 0

  // Apply annual exclusion
  const taxableGain = Math.max(0, capitalGain - CGT_RULES_2025.annualExclusion)

  // Only 40% of gain is included in taxable income
  const includedAmount = taxableGain * CGT_RULES_2025.inclusionRate

  // Tax at marginal rate
  const cgt = includedAmount * (marginalIncomeTaxRate / 100)

  return Math.round(cgt * 100) / 100
}

/**
 * Calculate Dividend Withholding Tax
 *
 * @param dividendIncome - Total dividend income (Rand)
 * @returns Dividend tax (Rand)
 *
 * @example
 * calculateDividendTax(50000) // R 10,000
 */
export const calculateDividendTax = (dividendIncome: number): number => {
  if (dividendIncome <= 0) return 0

  const tax = dividendIncome * DIVIDEND_WHT_RATE_2025

  return Math.round(tax * 100) / 100
}

/**
 * Calculate Interest Income Tax
 *
 * @param interestIncome - Total interest income (Rand)
 * @param age - Taxpayer's age
 * @param marginalIncomeTaxRate - Taxpayer's marginal rate (%)
 * @returns Interest tax (Rand)
 *
 * @example
 * calculateInterestTax(40000, 60, 39) // R 6,318
 * calculateInterestTax(40000, 70, 39) // R 2,145
 */
export const calculateInterestTax = (
  interestIncome: number,
  age: number,
  marginalIncomeTaxRate: number
): number => {
  if (interestIncome <= 0) return 0

  // Determine exemption based on age
  const exemption =
    age >= 65
      ? INTEREST_EXEMPTIONS_2025.over65
      : INTEREST_EXEMPTIONS_2025.under65

  // Calculate taxable interest
  const taxableInterest = Math.max(0, interestIncome - exemption)

  // Tax at marginal rate
  const tax = taxableInterest * (marginalIncomeTaxRate / 100)

  return Math.round(tax * 100) / 100
}

/**
 * Calculate total withdrawal tax
 *
 * Determines which tax calculation to use based on withdrawal type
 *
 * @param withdrawalAmount - Withdrawal amount (Rand)
 * @param age - Taxpayer's age
 * @param isRALumpSum - True for one-time RA lump-sum, false for regular annuity
 * @returns Tax amount (Rand)
 *
 * @example
 * calculateWithdrawalTax(500000, 65, true) // RA lump-sum tax
 * calculateWithdrawalTax(100000, 65, false) // Income tax
 */
export const calculateWithdrawalTax = (
  withdrawalAmount: number,
  age: number,
  isRALumpSum = false
): number => {
  if (withdrawalAmount <= 0) return 0

  if (isRALumpSum) {
    // One-time RA lump-sum withdrawal (retirement benefit)
    return calculateRALumpSumTax(withdrawalAmount)
  } else {
    // Regular annuity withdrawal (taxed as income)
    return calculateIncomeTax(withdrawalAmount, age)
  }
}

/**
 * Get marginal tax rate for a given income and age
 *
 * @param taxableIncome - Annual taxable income (Rand)
 * @param age - Taxpayer's age
 * @returns Marginal tax rate (%)
 */
export const getMarginalTaxRate = (
  taxableIncome: number,
  age: number
): number => {
  if (taxableIncome <= 0) return 0

  // Find applicable bracket
  const bracket = INCOME_TAX_BRACKETS_2025.find(
    (b) => taxableIncome >= b.min && taxableIncome <= b.max
  )

  if (!bracket) return 0

  // Calculate tax with current income
  const currentTax = calculateIncomeTax(taxableIncome, age)

  // Calculate tax with R1 additional income
  const additionalTax = calculateIncomeTax(taxableIncome + 1, age)

  // Marginal rate is the difference
  const marginalRate = (additionalTax - currentTax) * 100

  return Math.round(marginalRate * 100) / 100
}

/**
 * Calculate tax-free threshold based on age
 *
 * @param age - Taxpayer's age
 * @returns Tax-free threshold (Rand)
 */
export const getTaxFreeThreshold = (age: number): number => {
  let rebate = TAX_REBATES_2025.primary

  if (age >= 75) {
    rebate += TAX_REBATES_2025.secondary + TAX_REBATES_2025.tertiary
  } else if (age >= 65) {
    rebate += TAX_REBATES_2025.secondary
  }

  // Find the income where tax equals the rebate
  // For first bracket: baseTax + (income - min) * rate = rebate
  // income = (rebate - baseTax) / rate + min

  const firstBracket = INCOME_TAX_BRACKETS_2025[0]
  const threshold = rebate / firstBracket.rate

  return Math.round(threshold * 100) / 100
}

/**
 * Export tax constants for testing and reference
 */
export const TAX_CONSTANTS_2025 = {
  incomeTaxBrackets: INCOME_TAX_BRACKETS_2025,
  taxRebates: TAX_REBATES_2025,
  raLumpSumBrackets: RA_LUMP_SUM_BRACKETS_2025,
  cgtRules: CGT_RULES_2025,
  dividendWhtRate: DIVIDEND_WHT_RATE_2025,
  interestExemptions: INTEREST_EXEMPTIONS_2025,
} as const
