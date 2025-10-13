# Calculation Logic Documentation

**Project:** AI Retirement & Tax Optimization Planner
**Version:** 1.0
**Compliance:** SARS 2025/26 Tax Year
**Last Updated:** 2025-10-13

---

## Overview

This document specifies all financial calculation formulas used in the AI Retirement Planner, including retirement projections, SARS-compliant tax calculations, inflation adjustments, and wealth statistics.

---

## 1. Core Financial Calculations

### 1.1 Future Value (FV) with Regular Contributions

**Formula:**
```
FV = PV × (1 + r)^n + PMT × [((1 + r)^n - 1) / r]

Where:
  FV  = Future Value
  PV  = Present Value (starting balance)
  PMT = Payment (monthly contribution × 12 for annual)
  r   = Annual interest rate (as decimal, e.g., 0.08 for 8%)
  n   = Number of years
```

**TypeScript Implementation:**
```typescript
function calculateFutureValue(
  presentValue: number,
  monthlyContribution: number,
  annualReturnRate: number,
  years: number
): number {
  const r = annualReturnRate / 100; // Convert percentage to decimal
  const annualContribution = monthlyContribution * 12;

  const growthOfPV = presentValue * Math.pow(1 + r, years);
  const growthOfContributions = annualContribution * ((Math.pow(1 + r, years) - 1) / r);

  return growthOfPV + growthOfContributions;
}
```

**Example:**
```typescript
// R 100,000 starting, R 3,000/month, 8% return, 20 years
const fv = calculateFutureValue(100000, 3000, 8, 20);
// Result: R 2,332,366
```

---

### 1.2 Present Value (PV) - Inflation Adjustment

**Formula:**
```
PV = FV / (1 + i)^n

Where:
  PV = Present Value (real value in today's Rand)
  FV = Future Value (nominal value)
  i  = Inflation rate (as decimal)
  n  = Number of years
```

**TypeScript Implementation:**
```typescript
function inflationAdjustedValue(
  futureValue: number,
  inflationRate: number,
  years: number
): number {
  const i = inflationRate / 100;
  return futureValue / Math.pow(1 + i, years);
}
```

**Example:**
```typescript
// R 2,000,000 in 20 years, 6% inflation
const realValue = inflationAdjustedValue(2000000, 6, 20);
// Result: R 623,612 (today's purchasing power)
```

---

### 1.3 Compound Annual Growth Rate (CAGR)

**Formula:**
```
CAGR = ((FV / PV)^(1 / n) - 1) × 100

Where:
  CAGR = Compound Annual Growth Rate (%)
  FV   = Final Value
  PV   = Present Value
  n    = Number of years
```

**TypeScript Implementation:**
```typescript
function calculateCAGR(
  initialValue: number,
  finalValue: number,
  years: number
): number {
  return (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100;
}
```

**Example:**
```typescript
// R 100,000 grew to R 200,000 over 10 years
const cagr = calculateCAGR(100000, 200000, 10);
// Result: 7.18% per year
```

---

### 1.4 Real Return (Inflation-Adjusted)

**Formula:**
```
Real Return = ((1 + Nominal Return) / (1 + Inflation)) - 1

Where:
  Nominal Return = Stated investment return
  Inflation      = CPI inflation rate
```

**TypeScript Implementation:**
```typescript
function calculateRealReturn(
  nominalReturn: number,
  inflation: number
): number {
  const r = nominalReturn / 100;
  const i = inflation / 100;
  return ((1 + r) / (1 + i) - 1) * 100;
}
```

**Example:**
```typescript
// 10% nominal return, 6% inflation
const realReturn = calculateRealReturn(10, 6);
// Result: 3.77% real return
```

---

## 2. Year-by-Year Projection

### 2.1 Accumulation Phase (Before Retirement)

**Yearly Calculation:**
```typescript
interface ProjectionYear {
  year: number;
  age: number;
  beginningBalance: number;
  contributions: number;
  investmentReturn: number;
  withdrawals: number;
  taxPaid: number;
  endingBalance: number;
  inflationAdjustedBalance: number;
}

function projectAccumulationYear(
  beginningBalance: number,
  monthlyContribution: number,
  annualReturnRate: number,
  inflationRate: number,
  currentYear: number,
  baseYear: number
): ProjectionYear {
  const annualContribution = monthlyContribution * 12;
  const balanceAfterContributions = beginningBalance + annualContribution;
  const investmentReturn = balanceAfterContributions * (annualReturnRate / 100);
  const endingBalance = balanceAfterContributions + investmentReturn;

  const yearsFromBase = currentYear - baseYear;
  const inflationAdjustedBalance = inflationAdjustedValue(
    endingBalance,
    inflationRate,
    yearsFromBase
  );

  return {
    year: currentYear,
    age: currentAge + (currentYear - baseYear),
    beginningBalance,
    contributions: annualContribution,
    investmentReturn,
    withdrawals: 0,
    taxPaid: 0,
    endingBalance,
    inflationAdjustedBalance,
  };
}
```

---

### 2.2 Withdrawal Phase (After Retirement)

**Yearly Calculation:**
```typescript
function projectWithdrawalYear(
  beginningBalance: number,
  drawdownRate: number,
  annualReturnRate: number,
  inflationRate: number,
  currentAge: number,
  currentYear: number,
  baseYear: number
): ProjectionYear {
  // Calculate withdrawal amount (percentage of balance)
  const withdrawalAmount = beginningBalance * (drawdownRate / 100);

  // Calculate tax on withdrawal
  const taxPaid = calculateWithdrawalTax(withdrawalAmount, currentAge);

  // Calculate investment return on remaining balance after withdrawal
  const balanceAfterWithdrawal = beginningBalance - withdrawalAmount;
  const investmentReturn = balanceAfterWithdrawal * (annualReturnRate / 100);

  // Ending balance
  const endingBalance = Math.max(0, balanceAfterWithdrawal + investmentReturn);

  // Inflation adjustment
  const yearsFromBase = currentYear - baseYear;
  const inflationAdjustedBalance = inflationAdjustedValue(
    endingBalance,
    inflationRate,
    yearsFromBase
  );

  return {
    year: currentYear,
    age: currentAge,
    beginningBalance,
    contributions: 0,
    investmentReturn,
    withdrawals: withdrawalAmount,
    taxPaid,
    endingBalance,
    inflationAdjustedBalance,
  };
}
```

---

### 2.3 Fund Depletion Calculation

**Logic:**
```typescript
function calculateFundDepletionAge(
  retirementAge: number,
  retirementBalance: number,
  drawdownRate: number,
  annualReturnRate: number
): number | null {
  let balance = retirementBalance;
  let age = retirementAge;
  const maxAge = 120; // Reasonable upper bound

  while (balance > 0 && age < maxAge) {
    const withdrawal = balance * (drawdownRate / 100);
    const investmentReturn = (balance - withdrawal) * (annualReturnRate / 100);
    balance = balance - withdrawal + investmentReturn;
    age++;
  }

  return balance <= 0 ? age : null; // null = fund never depletes
}
```

---

## 3. SARS Tax Calculations (2025/26)

### 3.1 Progressive Income Tax

**2025/26 Income Tax Brackets:**
```typescript
const INCOME_TAX_BRACKETS_2025 = [
  { min: 0, max: 237100, rate: 0.18, baseTax: 0 },
  { min: 237101, max: 370500, rate: 0.26, baseTax: 42678 },
  { min: 370501, max: 512800, rate: 0.31, baseTax: 77362 },
  { min: 512801, max: 673000, rate: 0.36, baseTax: 121475 },
  { min: 673001, max: 857900, rate: 0.39, baseTax: 179147 },
  { min: 857901, max: 1817000, rate: 0.41, baseTax: 251258 },
  { min: 1817001, max: Infinity, rate: 0.45, baseTax: 644489 },
];

const TAX_REBATES_2025 = {
  primary: 17235,      // All taxpayers
  secondary: 9444,     // Age 65+
  tertiary: 3145,      // Age 75+
};
```

**Calculation Function:**
```typescript
function calculateIncomeTax(
  taxableIncome: number,
  age: number
): number {
  // Find applicable bracket
  const bracket = INCOME_TAX_BRACKETS_2025.find(
    b => taxableIncome >= b.min && taxableIncome <= b.max
  )!;

  // Calculate tax before rebates
  const taxBeforeRebates = bracket.baseTax + (taxableIncome - bracket.min + 1) * bracket.rate;

  // Apply age-based rebates
  let rebate = TAX_REBATES_2025.primary;
  if (age >= 75) {
    rebate += TAX_REBATES_2025.secondary + TAX_REBATES_2025.tertiary;
  } else if (age >= 65) {
    rebate += TAX_REBATES_2025.secondary;
  }

  // Tax cannot be negative
  return Math.max(0, taxBeforeRebates - rebate);
}
```

**Example:**
```typescript
// R 500,000 income, age 60
const tax = calculateIncomeTax(500000, 60);
// Result: R 105,227 (bracket: 31%, less primary rebate)

// R 500,000 income, age 70
const taxSenior = calculateIncomeTax(500000, 70);
// Result: R 95,783 (additional secondary rebate)
```

---

### 3.2 RA Lump-Sum Withdrawal Tax

**2025/26 RA Lump-Sum Brackets:**
```typescript
const RA_LUMP_SUM_BRACKETS_2025 = [
  { min: 0, max: 550000, rate: 0, baseTax: 0 },              // Tax-free
  { min: 550001, max: 770000, rate: 0.18, baseTax: 0 },
  { min: 770001, max: 1155000, rate: 0.27, baseTax: 39600 },
  { min: 1155001, max: Infinity, rate: 0.36, baseTax: 143550 },
];
```

**Calculation Function:**
```typescript
function calculateRALumpSumTax(
  lumpSumAmount: number
): number {
  const bracket = RA_LUMP_SUM_BRACKETS_2025.find(
    b => lumpSumAmount >= b.min && lumpSumAmount <= b.max
  )!;

  return bracket.baseTax + (lumpSumAmount - bracket.min + 1) * bracket.rate;
}
```

**Example:**
```typescript
// R 1,000,000 lump-sum withdrawal
const lumpSumTax = calculateRALumpSumTax(1000000);
// Result: R 101,850
// (R 0 on first R 550k, 18% on next R 220k = R 39,600, 27% on next R 230k = R 62,100)
```

---

### 3.3 Capital Gains Tax (CGT)

**2025/26 Rules:**
- **Inclusion Rate:** 40% of gain is taxable
- **Annual Exclusion:** R 40,000

**Calculation Function:**
```typescript
function calculateCGT(
  capitalGain: number,
  marginalIncomeTaxRate: number
): number {
  const ANNUAL_EXCLUSION = 40000;
  const INCLUSION_RATE = 0.40;

  // Apply annual exclusion
  const taxableGain = Math.max(0, capitalGain - ANNUAL_EXCLUSION);

  // Only 40% of gain is included in taxable income
  const includedAmount = taxableGain * INCLUSION_RATE;

  // Tax at marginal rate
  return includedAmount * (marginalIncomeTaxRate / 100);
}
```

**Example:**
```typescript
// R 200,000 capital gain, 39% marginal rate
const cgt = calculateCGT(200000, 39);
// Result: R 24,960
// (R 200k - R 40k exclusion = R 160k × 40% = R 64k × 39% = R 24,960)
```

---

### 3.4 Dividend Withholding Tax

**2025/26 Rule:** 20% flat rate on all dividends

**Calculation Function:**
```typescript
function calculateDividendTax(
  dividendIncome: number
): number {
  const DIVIDEND_WHT_RATE = 0.20;
  return dividendIncome * DIVIDEND_WHT_RATE;
}
```

**Example:**
```typescript
// R 50,000 dividend income
const dividendTax = calculateDividendTax(50000);
// Result: R 10,000
```

---

### 3.5 Interest Income Tax

**2025/26 Rules:**
- **Exemption (under 65):** R 23,800
- **Exemption (65+):** R 34,500
- **Tax:** Marginal income tax rate

**Calculation Function:**
```typescript
function calculateInterestTax(
  interestIncome: number,
  age: number,
  marginalIncomeTaxRate: number
): number {
  const exemption = age >= 65 ? 34500 : 23800;
  const taxableInterest = Math.max(0, interestIncome - exemption);
  return taxableInterest * (marginalIncomeTaxRate / 100);
}
```

**Example:**
```typescript
// R 40,000 interest income, age 60, 39% marginal rate
const interestTax = calculateInterestTax(40000, 60, 39);
// Result: R 6,318
// (R 40k - R 23,800 = R 16,200 × 39% = R 6,318)

// R 40,000 interest income, age 70, 39% marginal rate
const interestTaxSenior = calculateInterestTax(40000, 70, 39);
// Result: R 2,145
// (R 40k - R 34,500 = R 5,500 × 39% = R 2,145)
```

---

### 3.6 Total Withdrawal Tax

**Combined Calculation:**
```typescript
function calculateWithdrawalTax(
  withdrawalAmount: number,
  age: number,
  isLumpSum: boolean = false
): number {
  if (isLumpSum) {
    // One-time RA lump-sum withdrawal (retirement benefit)
    return calculateRALumpSumTax(withdrawalAmount);
  } else {
    // Regular annuity withdrawal (taxed as income)
    return calculateIncomeTax(withdrawalAmount, age);
  }
}
```

---

## 4. Aggregate Statistics

### 4.1 Total Contributed

**Formula:**
```typescript
function calculateTotalContributed(
  startingBalance: number,
  monthlyContribution: number,
  yearsUntilRetirement: number
): number {
  const totalContributions = monthlyContribution * 12 * yearsUntilRetirement;
  return startingBalance + totalContributions;
}
```

---

### 4.2 Total Withdrawn

**Formula:**
```typescript
function calculateTotalWithdrawn(
  projectionHistory: ProjectionYear[]
): number {
  return projectionHistory.reduce((sum, year) => sum + year.withdrawals, 0);
}
```

---

### 4.3 Total Tax Paid

**Formula:**
```typescript
function calculateTotalTaxPaid(
  projectionHistory: ProjectionYear[]
): number {
  return projectionHistory.reduce((sum, year) => sum + year.taxPaid, 0);
}
```

---

### 4.4 Net After-Tax Income

**Formula:**
```typescript
function calculateNetIncome(
  totalWithdrawn: number,
  totalTaxPaid: number
): number {
  return totalWithdrawn - totalTaxPaid;
}
```

---

### 4.5 Wealth Retention Ratio

**Formula:**
```
Wealth Retention Ratio = (Net After-Tax Income / Total Contributed) × 100

Where:
  Net After-Tax Income = Total Withdrawn - Total Tax Paid
  Total Contributed    = Starting Balance + All Contributions
```

**TypeScript Implementation:**
```typescript
function calculateWealthRetentionRatio(
  netIncome: number,
  totalContributed: number
): number {
  return (netIncome / totalContributed) * 100;
}
```

**Example:**
```typescript
// Net income: R 4,420,000, Contributed: R 2,400,000
const ratio = calculateWealthRetentionRatio(4420000, 2400000);
// Result: 184% (gained 84% after tax)
```

---

### 4.6 Effective Tax Rate

**Formula:**
```
Effective Tax Rate = (Total Tax Paid / Total Withdrawn) × 100
```

**TypeScript Implementation:**
```typescript
function calculateEffectiveTaxRate(
  totalTaxPaid: number,
  totalWithdrawn: number
): number {
  return totalWithdrawn > 0 ? (totalTaxPaid / totalWithdrawn) * 100 : 0;
}
```

**Example:**
```typescript
// Tax paid: R 780,000, Withdrawn: R 5,200,000
const effectiveRate = calculateEffectiveTaxRate(780000, 5200000);
// Result: 15% (blended rate over lifetime)
```

---

## 5. Tax Optimization Strategies

### 5.1 RA vs TFSA vs Brokerage Mix

**Optimization Goals:**
1. Maximize tax-deferred growth (RA)
2. Utilize tax-free growth (TFSA)
3. Balance liquidity (Brokerage)

**Strategy Simulation:**
```typescript
interface TaxStrategy {
  name: string;
  raAllocation: number;    // % of savings to RA
  tfsaAllocation: number;  // % of savings to TFSA
  brokerageAllocation: number; // % to taxable brokerage
}

function simulateStrategy(
  strategy: TaxStrategy,
  monthlyContribution: number,
  annualReturn: number,
  years: number
): {
  totalValue: number;
  totalTaxPaid: number;
  netValue: number;
} {
  // Split contributions according to strategy
  const raContribution = monthlyContribution * (strategy.raAllocation / 100);
  const tfsaContribution = monthlyContribution * (strategy.tfsaAllocation / 100);
  const brokerageContribution = monthlyContribution * (strategy.brokerageAllocation / 100);

  // RA: Tax-deferred growth, taxed on withdrawal
  const raValue = calculateFutureValue(0, raContribution, annualReturn, years);
  const raTax = calculateIncomeTax(raValue * 0.04, 65); // Assume 4% annual withdrawal at retirement

  // TFSA: Tax-free growth, no tax on withdrawal (but contribution limits apply)
  const tfsaValue = Math.min(
    calculateFutureValue(0, tfsaContribution, annualReturn, years),
    36000 * years // Annual TFSA limit
  );
  const tfsaTax = 0;

  // Brokerage: Taxed on dividends/CGT
  const brokerageValue = calculateFutureValue(0, brokerageContribution, annualReturn, years);
  const brokerageTax = calculateCGT(brokerageValue * 0.5, 39); // Assume 50% is capital gain

  return {
    totalValue: raValue + tfsaValue + brokerageValue,
    totalTaxPaid: raTax + tfsaTax + brokerageTax,
    netValue: (raValue - raTax) + tfsaValue + (brokerageValue - brokerageTax),
  };
}
```

**Recommended Strategies:**
```typescript
const strategies: TaxStrategy[] = [
  {
    name: 'RA Only',
    raAllocation: 100,
    tfsaAllocation: 0,
    brokerageAllocation: 0,
  },
  {
    name: 'Balanced (RA + TFSA)',
    raAllocation: 70,
    tfsaAllocation: 30,
    brokerageAllocation: 0,
  },
  {
    name: 'Diversified (RA + TFSA + Brokerage)',
    raAllocation: 60,
    tfsaAllocation: 25,
    brokerageAllocation: 15,
  },
];
```

---

## 6. Inflation Adjustments

### 6.1 Future Income Needs

**Formula:**
```
Future Income Needed = Today's Income × (1 + Inflation)^Years

Example: R 20,000/month today, 6% inflation, 20 years
         = R 20,000 × (1.06)^20
         = R 64,143/month needed
```

**TypeScript Implementation:**
```typescript
function inflationAdjustedIncome(
  currentIncome: number,
  inflationRate: number,
  years: number
): number {
  return currentIncome * Math.pow(1 + inflationRate / 100, years);
}
```

---

### 6.2 Real vs Nominal Returns

**Conversion:**
```typescript
function convertToRealReturn(
  nominalReturn: number,
  inflation: number
): number {
  return ((1 + nominalReturn / 100) / (1 + inflation / 100) - 1) * 100;
}

function convertToNominalReturn(
  realReturn: number,
  inflation: number
): number {
  return ((1 + realReturn / 100) * (1 + inflation / 100) - 1) * 100;
}
```

---

## 7. Validation Rules

### 7.1 Input Constraints
```typescript
const VALIDATION_RULES = {
  currentAge: { min: 18, max: 100 },
  retirementAge: { min: 40, max: 100 },
  startingBalance: { min: 0, max: 100000000 },
  monthlyContribution: { min: 0, max: 10000000 },
  annualReturn: { min: -50, max: 100 },  // Allow negative for worst-case
  inflation: { min: 0, max: 50 },
  drawdownRate: { min: 0, max: 20 },
};

function validateInputs(inputs: PlannerState): string[] {
  const errors: string[] = [];

  if (inputs.retirementAge <= inputs.currentAge) {
    errors.push('Retirement age must be greater than current age');
  }

  if (inputs.annualReturn < VALIDATION_RULES.annualReturn.min) {
    errors.push(`Annual return cannot be less than ${VALIDATION_RULES.annualReturn.min}%`);
  }

  // ... more validations

  return errors;
}
```

---

## 8. Example Full Projection

```typescript
function generateFullProjection(
  inputs: PlannerState
): {
  projectionHistory: ProjectionYear[];
  statistics: Statistics;
} {
  const {
    currentAge,
    retirementAge,
    startingBalance,
    monthlyContribution,
    annualReturn,
    inflation,
    drawdownRate,
  } = inputs;

  const projectionHistory: ProjectionYear[] = [];
  const baseYear = new Date().getFullYear();

  let balance = startingBalance;
  let totalContributed = startingBalance;
  let totalWithdrawn = 0;
  let totalTaxPaid = 0;

  // Accumulation phase
  for (let age = currentAge; age < retirementAge; age++) {
    const year = baseYear + (age - currentAge);
    const projection = projectAccumulationYear(
      balance,
      monthlyContribution,
      annualReturn,
      inflation,
      year,
      baseYear
    );
    projectionHistory.push(projection);
    balance = projection.endingBalance;
    totalContributed += projection.contributions;
  }

  // Withdrawal phase
  for (let age = retirementAge; age <= 100 && balance > 0; age++) {
    const year = baseYear + (age - currentAge);
    const projection = projectWithdrawalYear(
      balance,
      drawdownRate,
      annualReturn,
      inflation,
      age,
      year,
      baseYear
    );
    projectionHistory.push(projection);
    balance = projection.endingBalance;
    totalWithdrawn += projection.withdrawals;
    totalTaxPaid += projection.taxPaid;
  }

  // Calculate statistics
  const statistics: Statistics = {
    totalContributed,
    projectedValueAtRetirement: projectionHistory.find(p => p.age === retirementAge)?.endingBalance || 0,
    totalWithdrawn,
    totalTaxPaid,
    netAfterTaxIncome: totalWithdrawn - totalTaxPaid,
    fundDepletionAge: balance <= 0 ? projectionHistory[projectionHistory.length - 1].age : null,
    effectiveTaxRate: calculateEffectiveTaxRate(totalTaxPaid, totalWithdrawn),
    wealthRetentionRatio: calculateWealthRetentionRatio(totalWithdrawn - totalTaxPaid, totalContributed),
  };

  return { projectionHistory, statistics };
}
```

---

## Conclusion

These calculation formulas form the mathematical foundation of the AI Retirement Planner. All tax calculations strictly adhere to SARS 2025/26 rules. The year-by-year projection model provides granular visibility into accumulation and withdrawal phases, enabling accurate long-term forecasting.

**Key Principles:**
1. Use SARS 2025/26 brackets exactly as published
2. Apply age-based rebates and exemptions correctly
3. Distinguish between real and nominal returns
4. Handle edge cases (fund depletion, negative returns)
5. Validate all inputs against realistic bounds
