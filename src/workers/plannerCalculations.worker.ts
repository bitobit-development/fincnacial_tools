/**
 * Planner Calculations Web Worker
 *
 * Performs retirement projection calculations in a background thread
 * to prevent blocking the main UI thread during intensive computations.
 *
 * Features:
 * - Year-by-year retirement projections
 * - SARS tax calculations on withdrawals
 * - Investment returns and inflation adjustments
 * - Drawdown schedule generation
 * - Impact summary (delta from AI recommendations)
 */

// ============================================================================
// Type Definitions
// ============================================================================

interface UserProfile {
  current_age: number;
  retirement_age: number;
  life_expectancy: number;
  gross_annual_income: number;
  current_retirement_savings: number;
}

interface Adjustments {
  monthly_ra_contribution: number;
  investment_return: number; // percentage (e.g., 9.0)
  inflation_rate: number; // percentage (e.g., 6.0)
}

interface WorkerInput {
  userProfile: UserProfile;
  adjustments: Adjustments;
  aiRecommendations: Adjustments;
}

interface DrawdownScheduleRow {
  age: number;
  year: number;
  beginningBalance: number;
  withdrawal: number;
  taxPaid: number;
  netIncome: number;
  endingBalance: number;
}

interface Projections {
  retirementNestEgg: number;
  monthlyDrawdown: number;
  drawdownSchedule: DrawdownScheduleRow[];
}

interface ImpactSummary {
  retirementNestEggDelta: number;
  monthlyDrawdownDelta: number;
}

interface WorkerOutput {
  impactSummary: ImpactSummary;
  projections: Projections;
}

// ============================================================================
// SARS Tax Calculation (2024/2025)
// ============================================================================

const TAX_BRACKETS = [
  { min: 0, max: 237100, rate: 0.18, base: 0 },
  { min: 237101, max: 370500, rate: 0.26, base: 42678 },
  { min: 370501, max: 512800, rate: 0.31, base: 77362 },
  { min: 512801, max: 673000, rate: 0.36, base: 121475 },
  { min: 673001, max: 857900, rate: 0.39, base: 179147 },
  { min: 857901, max: Infinity, rate: 0.41, base: 251258 },
] as const;

const SENIOR_REBATE = 26679; // Primary (R17,235) + Secondary (R9,444) for 65+
const PRIMARY_REBATE = 17235; // For under 65

/**
 * Calculate SARS income tax for retirement withdrawals
 */
const calculateSARSTax = (annualIncome: number, age: number): number => {
  if (annualIncome <= 0) return 0;

  // Find applicable bracket
  const bracket = TAX_BRACKETS.find(
    (b) => annualIncome >= b.min && annualIncome <= b.max
  );

  if (!bracket) return 0;

  // Calculate tax before rebates
  const taxBeforeRebates = bracket.base + (annualIncome - bracket.min) * bracket.rate;

  // Apply age-based rebate
  const rebate = age >= 65 ? SENIOR_REBATE : PRIMARY_REBATE;

  // Tax cannot be negative
  return Math.max(0, taxBeforeRebates - rebate);
};

// ============================================================================
// Accumulation Phase Calculation
// ============================================================================

/**
 * Calculate retirement nest egg at retirement age
 */
const calculateRetirementNestEgg = (
  currentAge: number,
  retirementAge: number,
  currentSavings: number,
  monthlyContribution: number,
  annualReturn: number // as percentage
): number => {
  const yearsToRetirement = retirementAge - currentAge;
  const monthlyRate = annualReturn / 100 / 12;
  const months = yearsToRetirement * 12;

  // Future value of current savings: PV * (1 + r)^n
  const futureValueOfSavings =
    currentSavings * Math.pow(1 + monthlyRate, months);

  // Future value of monthly contributions: PMT * [((1 + r)^n - 1) / r]
  const futureValueOfContributions =
    monthlyRate > 0
      ? monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
      : monthlyContribution * months;

  return futureValueOfSavings + futureValueOfContributions;
};

// ============================================================================
// Drawdown Phase Calculation
// ============================================================================

/**
 * Calculate sustainable monthly drawdown and generate schedule
 */
const calculateDrawdownProjections = (
  retirementAge: number,
  lifeExpectancy: number,
  retirementNestEgg: number,
  annualReturn: number,
  inflationRate: number
): { monthlyDrawdown: number; drawdownSchedule: DrawdownScheduleRow[] } => {
  // Use 4% rule as a starting point for sustainable drawdown
  const SAFE_DRAWDOWN_RATE = 0.04;
  const annualDrawdown = retirementNestEgg * SAFE_DRAWDOWN_RATE;
  const monthlyDrawdown = annualDrawdown / 12;

  // Generate year-by-year drawdown schedule
  const drawdownSchedule: DrawdownScheduleRow[] = [];
  let balance = retirementNestEgg;
  const baseYear = new Date().getFullYear() + (retirementAge - 30); // Approximate

  for (let age = retirementAge; age <= lifeExpectancy && balance > 0; age++) {
    const year = baseYear + (age - retirementAge);

    // Inflation-adjusted withdrawal
    const yearsIntoRetirement = age - retirementAge;
    const inflationAdjustedWithdrawal =
      annualDrawdown * Math.pow(1 + inflationRate / 100, yearsIntoRetirement);

    // Calculate tax on withdrawal
    const taxPaid = calculateSARSTax(inflationAdjustedWithdrawal, age);

    // Net income after tax
    const netIncome = inflationAdjustedWithdrawal - taxPaid;

    // Update balance
    const balanceAfterWithdrawal = Math.max(0, balance - inflationAdjustedWithdrawal);

    // Apply investment returns
    const investmentReturn = balanceAfterWithdrawal * (annualReturn / 100);
    const endingBalance = Math.max(0, balanceAfterWithdrawal + investmentReturn);

    drawdownSchedule.push({
      age,
      year,
      beginningBalance: Math.round(balance),
      withdrawal: Math.round(inflationAdjustedWithdrawal),
      taxPaid: Math.round(taxPaid),
      netIncome: Math.round(netIncome),
      endingBalance: Math.round(endingBalance),
    });

    balance = endingBalance;

    // Stop if balance is effectively zero
    if (balance < 1000) break;
  }

  return {
    monthlyDrawdown: Math.round(monthlyDrawdown),
    drawdownSchedule,
  };
};

// ============================================================================
// Main Calculation Function
// ============================================================================

const calculateProjections = (input: WorkerInput): WorkerOutput => {
  const { userProfile, adjustments, aiRecommendations } = input;

  // Calculate projections with AI recommendations (baseline)
  const baselineNestEgg = calculateRetirementNestEgg(
    userProfile.current_age,
    userProfile.retirement_age,
    userProfile.current_retirement_savings,
    aiRecommendations.monthly_ra_contribution,
    aiRecommendations.investment_return
  );

  const baselineDrawdown = calculateDrawdownProjections(
    userProfile.retirement_age,
    userProfile.life_expectancy,
    baselineNestEgg,
    aiRecommendations.investment_return,
    aiRecommendations.inflation_rate
  );

  // Calculate projections with user adjustments
  const adjustedNestEgg = calculateRetirementNestEgg(
    userProfile.current_age,
    userProfile.retirement_age,
    userProfile.current_retirement_savings,
    adjustments.monthly_ra_contribution,
    adjustments.investment_return
  );

  const adjustedDrawdown = calculateDrawdownProjections(
    userProfile.retirement_age,
    userProfile.life_expectancy,
    adjustedNestEgg,
    adjustments.investment_return,
    adjustments.inflation_rate
  );

  // Calculate deltas (adjusted - baseline)
  const impactSummary: ImpactSummary = {
    retirementNestEggDelta: Math.round(adjustedNestEgg - baselineNestEgg),
    monthlyDrawdownDelta: Math.round(
      adjustedDrawdown.monthlyDrawdown - baselineDrawdown.monthlyDrawdown
    ),
  };

  const projections: Projections = {
    retirementNestEgg: Math.round(adjustedNestEgg),
    monthlyDrawdown: adjustedDrawdown.monthlyDrawdown,
    drawdownSchedule: adjustedDrawdown.drawdownSchedule,
  };

  return {
    impactSummary,
    projections,
  };
};

// ============================================================================
// Worker Message Handler
// ============================================================================

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;

  if (type === 'CALCULATE') {
    try {
      const startTime = performance.now();

      const result = calculateProjections(payload as WorkerInput);

      const endTime = performance.now();
      const calculationTime = Math.round(endTime - startTime);

      self.postMessage({
        type: 'SUCCESS',
        payload: result,
        calculationTime,
      });
    } catch (error) {
      self.postMessage({
        type: 'ERROR',
        payload: error instanceof Error ? error.message : 'Unknown calculation error',
      });
    }
  }
};

// Type assertion for TypeScript
export {};
