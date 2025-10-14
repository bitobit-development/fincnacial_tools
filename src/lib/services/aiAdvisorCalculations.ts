/**
 * AI Advisor Calculation Functions
 *
 * Implements the GPT-5 function calling tools for financial calculations.
 * Integrates with existing tax and projection engines.
 */

import type {
  UserProfile,
  MonthlyProjection,
  AnnualSummary,
  AdvisorRecommendation,
  OptimizeTaxResult,
  CalculateDrawdownStrategyResult,
  GenerateRecommendationsResult,
} from '@/types/aiAdvisor';
import {
  calculateIncomeTax,
  calculateCGT,
  calculateDividendTax,
  calculateInterestTax,
  getMarginalTaxRate,
  getTaxFreeThreshold,
} from '@/lib/calculations/tax';
import { generateFullProjection } from '@/lib/calculations/projections';
import type { PlannerState } from '@/types';

// ============================================================================
// Tax Optimization
// ============================================================================

/**
 * Optimize RA contribution for maximum tax savings within SARS limits
 */
export async function optimizeTax(params: {
  gross_annual_income: number;
  current_ra_contribution_annual: number;
  age: number;
  marital_status: string;
}): Promise<OptimizeTaxResult> {
  const { gross_annual_income, current_ra_contribution_annual, age } = params;

  // SARS RA Contribution Limits (2025/26)
  const percentageLimit = gross_annual_income * 0.275; // 27.5% of gross income
  const absoluteLimit = 350000; // R350,000
  const maxRAContribution = Math.min(percentageLimit, absoluteLimit);

  // Calculate current tax
  const currentTaxableIncome = gross_annual_income - current_ra_contribution_annual;
  const currentTax = calculateIncomeTax(currentTaxableIncome, age);
  const currentMarginalRate = getMarginalTaxRate(currentTaxableIncome, age);

  // Calculate optimized tax (at maximum RA contribution)
  const optimizedTaxableIncome = gross_annual_income - maxRAContribution;
  const optimizedTax = calculateIncomeTax(optimizedTaxableIncome, age);

  // Tax savings
  const taxSavings = currentTax - optimizedTax;

  // Additional RA contribution needed
  const additionalRAContribution = maxRAContribution - current_ra_contribution_annual;

  // Determine limit type
  const limitType: 'R350000_cap' | '27.5%_income_cap' =
    percentageLimit < absoluteLimit ? '27.5%_income_cap' : 'R350000_cap';

  // Generate reasoning
  const reasoning = generateTaxOptimizationReasoning({
    gross_annual_income,
    current_ra_contribution_annual,
    maxRAContribution,
    currentTax,
    optimizedTax,
    taxSavings,
    currentMarginalRate,
    additionalRAContribution,
    limitType,
    age,
  });

  return {
    current_tax: Math.round(currentTax),
    optimized_tax: Math.round(optimizedTax),
    tax_savings: Math.round(taxSavings),
    recommended_ra_contribution: Math.round(maxRAContribution),
    reasoning,
    regulatory_limits: {
      max_ra_contribution: Math.round(maxRAContribution),
      limit_type: limitType,
    },
  };
}

function generateTaxOptimizationReasoning(data: {
  gross_annual_income: number;
  current_ra_contribution_annual: number;
  maxRAContribution: number;
  currentTax: number;
  optimizedTax: number;
  taxSavings: number;
  currentMarginalRate: number;
  additionalRAContribution: number;
  limitType: string;
  age: number;
}): string {
  const {
    gross_annual_income,
    current_ra_contribution_annual,
    maxRAContribution,
    taxSavings,
    currentMarginalRate,
    additionalRAContribution,
    limitType,
  } = data;

  const monthlyAdditional = Math.round(additionalRAContribution / 12);
  const monthlySavings = Math.round(taxSavings / 12);

  if (taxSavings < 1000) {
    return `You're already contributing close to the SARS maximum. Your current RA contribution of R${Math.round(current_ra_contribution_annual).toLocaleString()}/year is excellent and provides near-optimal tax efficiency.`;
  }

  return `Based on your gross income of R${Math.round(gross_annual_income).toLocaleString()}/year, SARS allows you to contribute up to R${Math.round(maxRAContribution).toLocaleString()}/year to your RA (the ${limitType === '27.5%_income_cap' ? '27.5% of income limit' : 'R350,000 annual cap'}).

You're currently contributing R${Math.round(current_ra_contribution_annual).toLocaleString()}/year. By increasing to the maximum, you would save R${Math.round(taxSavings).toLocaleString()}/year in tax (R${monthlySavings.toLocaleString()}/month).

This means for every additional R${monthlyAdditional.toLocaleString()}/month you contribute, you'll save approximately R${monthlySavings.toLocaleString()}/month in tax at your marginal rate of ${currentMarginalRate}%.

In effect, SARS is subsidizing ${currentMarginalRate}% of your retirement savings. This is one of the best tax optimization strategies available in South Africa.`;
}

// ============================================================================
// Retirement Projection
// ============================================================================

/**
 * Calculate detailed retirement projection with monthly/annual breakdowns
 */
export async function calculateRetirementProjection(params: {
  user_profile: UserProfile;
  include_monthly_breakdown?: boolean;
  manual_adjustments?: {
    monthly_ra_contribution?: number;
    investment_return?: number;
    inflation_rate?: number;
  };
}): Promise<{
  monthly_projections: MonthlyProjection[];
  annual_summaries: AnnualSummary[];
}> {
  const { user_profile, include_monthly_breakdown = false, manual_adjustments } = params;

  // Extract required fields with defaults
  const currentAge = user_profile.current_age || 30;
  const retirementAge = user_profile.retirement_age || 65;
  const currentRABalance = user_profile.current_ra_balance || 0;
  const employerContribution = user_profile.employer_contribution_rand || 0;

  // Prioritize manual adjustments over profile values
  const manualAdj = manual_adjustments || user_profile.manual_adjustments;
  const monthlyRAContribution = manualAdj?.monthly_ra_contribution ?? user_profile.monthly_ra_contribution ?? 0;
  const investmentReturn = manualAdj?.investment_return ?? 10; // Default 10% p.a.
  const inflation = manualAdj?.inflation_rate ?? 5; // Default 5% p.a.
  const drawdownRate = user_profile.desired_drawdown_rate || 5;

  console.log('[Calculations] Using values:', {
    monthlyRAContribution,
    investmentReturn,
    inflation,
    hasManualAdjustments: !!manualAdj,
  });

  // Build planner state for existing projection engine
  const plannerState: PlannerState = {
    currentAge,
    retirementAge,
    startingBalance: currentRABalance,
    monthlyContribution: monthlyRAContribution + employerContribution,
    annualReturn: investmentReturn,
    inflation,
    drawdownRate,
  };

  // Generate year-by-year projection using existing engine
  const yearlyProjections = generateFullProjection(plannerState);

  // Convert to AnnualSummary format
  const annualSummaries: AnnualSummary[] = yearlyProjections.map((proj, index) => {
    const isRetired = proj.age >= retirementAge;
    const grossAnnualIncome = user_profile.gross_annual_income || 0;
    const taxableIncome = isRetired ? proj.withdrawals : grossAnnualIncome - proj.contributions;
    const totalTaxPaid = proj.taxPaid;
    const taxSavedViaRA = isRetired ? 0 : proj.contributions * 0.275; // Approximate
    const effectiveTaxRate = taxableIncome > 0 ? (totalTaxPaid / taxableIncome) * 100 : 0;

    return {
      year: proj.year,
      age: proj.age,
      total_contributed: proj.contributions,
      employer_contributed: employerContribution * 12,
      total_tax_paid: totalTaxPaid,
      tax_saved_via_ra: taxSavedViaRA,
      effective_tax_rate: effectiveTaxRate,
      investment_return: proj.investmentReturn,
      inflation_rate: inflation,
      real_return: investmentReturn - inflation,
      ending_balance: proj.endingBalance,
      inflation_adjusted_balance: proj.inflationAdjustedBalance,
      monthly_income: isRetired ? proj.withdrawals / 12 : undefined,
      replacement_ratio: isRetired && grossAnnualIncome > 0
        ? (proj.withdrawals / grossAnnualIncome) * 100
        : undefined,
      drawdown_rate: isRetired ? drawdownRate : undefined,
      years_remaining: isRetired ? 90 - proj.age : undefined,
    };
  });

  // Generate monthly projections if requested
  const monthlyProjections: MonthlyProjection[] = [];
  if (include_monthly_breakdown) {
    for (const annual of annualSummaries) {
      for (let month = 1; month <= 12; month++) {
        const isRetired = annual.age >= retirementAge;
        const marginalRate = getMarginalTaxRate(
          user_profile.gross_annual_income || 0,
          annual.age
        );

        monthlyProjections.push({
          year: annual.year,
          month,
          age: annual.age,
          gross_income: isRetired ? 0 : (user_profile.gross_annual_income || 0) / 12,
          net_income_after_tax: isRetired
            ? (annual.monthly_income || 0) - (annual.total_tax_paid / 12)
            : (user_profile.net_monthly_income || 0),
          pension_income: isRetired ? annual.monthly_income : undefined,
          other_income: undefined,
          ra_contribution: monthlyRAContribution,
          tfsa_contribution: user_profile.monthly_tfsa_contribution || 0,
          unit_trust_contribution: user_profile.monthly_unit_trust_contribution || 0,
          employer_contribution: employerContribution,
          income_tax: annual.total_tax_paid / 12,
          capital_gains_tax: 0, // TODO: Calculate from investment mix
          dividend_tax: 0, // TODO: Calculate from investment mix
          interest_tax: 0, // TODO: Calculate from investment mix
          total_tax: annual.total_tax_paid / 12,
          effective_tax_rate: annual.effective_tax_rate,
          investment_return: annual.investment_return / 12,
          inflation_adjusted_return: (annual.investment_return * (1 - inflation / 100)) / 12,
          ra_balance: annual.ending_balance,
          pension_balance: 0,
          tfsa_balance: 0,
          unit_trust_balance: 0,
          total_balance: annual.ending_balance,
          inflation_adjusted_balance: annual.inflation_adjusted_balance,
          drawdown_amount: isRetired ? annual.monthly_income : undefined,
          drawdown_rate: annual.drawdown_rate,
          years_remaining: annual.years_remaining,
          runway_years: annual.years_remaining,
        });
      }
    }
  }

  return {
    monthly_projections: monthlyProjections,
    annual_summaries: annualSummaries,
  };
}

// ============================================================================
// Drawdown Strategy
// ============================================================================

/**
 * Calculate sustainable drawdown strategy for retirement
 */
export async function calculateDrawdownStrategy(params: {
  retirement_balance: number;
  desired_monthly_income: number;
  years_to_plan: number;
  inflation_rate: number;
  expected_return: number;
}): Promise<CalculateDrawdownStrategyResult> {
  const {
    retirement_balance,
    desired_monthly_income,
    years_to_plan,
    inflation_rate,
    expected_return,
  } = params;

  const desiredAnnualIncome = desired_monthly_income * 12;
  const initialDrawdownRate = (desiredAnnualIncome / retirement_balance) * 100;

  // Simulate to see how long money lasts
  let balance = retirement_balance;
  let age = 65; // Assume retirement at 65
  let yearCounter = 0;
  let sustainable = true;
  const warnings: string[] = [];

  while (balance > 0 && yearCounter < years_to_plan) {
    // Inflation-adjusted withdrawal
    const inflationAdjustedWithdrawal =
      desiredAnnualIncome * Math.pow(1 + inflation_rate / 100, yearCounter);

    // Tax on withdrawal
    const tax = calculateIncomeTax(inflationAdjustedWithdrawal, age + yearCounter);

    // After withdrawal
    balance -= inflationAdjustedWithdrawal;

    // Investment return
    balance += balance * (expected_return / 100);

    yearCounter++;

    if (balance <= 0) {
      sustainable = false;
      warnings.push(`Funds will be depleted after ${yearCounter} years at this drawdown rate.`);
      break;
    }
  }

  const yearsMoneyLasts = yearCounter;
  const endBalance = Math.max(0, balance);
  const inflationAdjustedIncomeAt90 =
    desiredAnnualIncome * Math.pow(1 + inflation_rate / 100, years_to_plan);

  // Check if drawdown rate is within SARS limits (2.5% - 17.5%)
  if (initialDrawdownRate < 2.5) {
    warnings.push(
      `Drawdown rate of ${initialDrawdownRate.toFixed(1)}% is below SARS minimum of 2.5% for living annuities.`
    );
  } else if (initialDrawdownRate > 17.5) {
    warnings.push(
      `Drawdown rate of ${initialDrawdownRate.toFixed(1)}% exceeds SARS maximum of 17.5% for living annuities.`
    );
  }

  // Generate alternative strategies if current one is not sustainable
  const alternativeStrategies: Array<{
    drawdown_rate: number;
    years_lasts: number;
    description: string;
  }> = [];

  if (!sustainable) {
    // Try 4% rule
    const safeDrawdownRate = 4;
    const safeAnnualIncome = retirement_balance * (safeDrawdownRate / 100);
    const safeMonthlyIncome = safeAnnualIncome / 12;

    alternativeStrategies.push({
      drawdown_rate: safeDrawdownRate,
      years_lasts: 30,
      description: `The "4% Rule": Withdraw R${Math.round(safeMonthlyIncome).toLocaleString()}/month (R${Math.round(safeAnnualIncome).toLocaleString()}/year) with high confidence it will last 30+ years.`,
    });

    // Try 5% (balanced)
    const balancedRate = 5;
    const balancedAnnualIncome = retirement_balance * (balancedRate / 100);
    const balancedMonthlyIncome = balancedAnnualIncome / 12;

    alternativeStrategies.push({
      drawdown_rate: balancedRate,
      years_lasts: 25,
      description: `Balanced approach: Withdraw R${Math.round(balancedMonthlyIncome).toLocaleString()}/month (R${Math.round(balancedAnnualIncome).toLocaleString()}/year) with good sustainability for 25+ years.`,
    });
  }

  return {
    recommended_initial_drawdown_rate: Math.max(2.5, Math.min(17.5, initialDrawdownRate)),
    sustainable,
    years_money_lasts: yearsMoneyLasts,
    end_balance: Math.round(endBalance),
    inflation_adjusted_income_at_90: Math.round(inflationAdjustedIncomeAt90),
    warnings,
    alternative_strategies: alternativeStrategies.length > 0 ? alternativeStrategies : undefined,
  };
}

// ============================================================================
// Generate Recommendations
// ============================================================================

/**
 * Generate personalized financial recommendations
 */
export async function generateRecommendations(params: {
  user_profile: UserProfile;
  current_projection: AnnualSummary[];
}): Promise<GenerateRecommendationsResult> {
  const { user_profile, current_projection } = params;

  const recommendations: AdvisorRecommendation[] = [];
  const criticalGaps: string[] = [];
  const strengths: string[] = [];

  // Analyze RA contribution rate
  const grossIncome = user_profile.gross_annual_income || 0;
  const monthlyRAContrib = user_profile.monthly_ra_contribution || 0;
  const annualRAContrib = monthlyRAContrib * 12;
  const contributionRate = grossIncome > 0 ? (annualRAContrib / grossIncome) * 100 : 0;

  if (contributionRate < 10) {
    recommendations.push({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      category: 'contribution_increase',
      priority: 'critical',
      title: 'Increase Retirement Contributions',
      summary: `You're only contributing ${contributionRate.toFixed(1)}% of your income. Industry standard is 15-20%.`,
      detailed_explanation: `Your current RA contribution of R${Math.round(monthlyRAContrib).toLocaleString()}/month represents only ${contributionRate.toFixed(1)}% of your gross income. Financial planners typically recommend contributing 15-20% of your income to maintain your lifestyle in retirement (the "replacement ratio" principle).

At your current savings rate, you may face a significant income shortfall in retirement. Consider increasing your RA contribution gradually each year, especially when you receive salary increases or bonuses.`,
      action_steps: [
        `Increase RA contribution by R${Math.round(grossIncome * 0.15 / 12 - monthlyRAContrib).toLocaleString()}/month to reach 15%`,
        'Set up automatic annual increases to match inflation',
        'Review and adjust after each salary increase',
      ],
      estimated_impact: {
        additional_retirement_income_monthly: 5000, // Estimate
        tax_savings_annual: annualRAContrib * 0.275,
      },
      regulatory_reference: 'SARS Income Tax Act 58 of 1962, Section 11F',
      overridden: false,
    });
    criticalGaps.push('Retirement contribution rate below 10%');
  } else if (contributionRate >= 15) {
    strengths.push(`Excellent contribution rate of ${contributionRate.toFixed(1)}%`);
  }

  // Check TFSA usage
  if (!user_profile.current_tfsa_balance || user_profile.current_tfsa_balance === 0) {
    recommendations.push({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      category: 'tax_optimization',
      priority: 'high',
      title: 'Start Using Tax-Free Savings Account (TFSA)',
      summary: "You're not using a TFSA. This is tax-free growth on up to R36,000/year.",
      detailed_explanation: `South Africa's TFSA allows you to invest R36,000/year (R3,000/month) with ZERO tax on interest, dividends, or capital gains. Over 30+ years, this tax saving compounds significantly.

Unlike RAs, TFSA funds are accessible anytime without penalties, making it perfect for medium-term goals (emergency fund, house deposit, car) or additional retirement savings.

Lifetime limit is R500,000, so the sooner you start, the more time your investments have to grow tax-free.`,
      action_steps: [
        'Open a TFSA with a low-cost provider (e.g., Satrix, 10X, Easy Equities)',
        'Set up R3,000/month debit order (or start with R1,000 if budget is tight)',
        'Invest in a diversified index fund (e.g., Satrix Top 40 or MSCI World)',
      ],
      estimated_impact: {
        additional_wealth_at_retirement: 500000,
        tax_savings_annual: 5000,
      },
      regulatory_reference: 'SARS Tax Exemption Act',
      overridden: false,
    });
    criticalGaps.push('Not using TFSA');
  }

  // Calculate overall health score (0-100)
  let healthScore = 50; // Base score

  // Positive factors
  if (contributionRate >= 15) healthScore += 20;
  if (user_profile.current_tfsa_balance && user_profile.current_tfsa_balance > 0) healthScore += 10;
  if (user_profile.has_valid_will) healthScore += 5;
  if (user_profile.life_cover_amount && user_profile.life_cover_amount > 0) healthScore += 10;
  if (user_profile.using_full_ra_deduction) healthScore += 5;

  // Negative factors
  if (contributionRate < 10) healthScore -= 20;
  if (!user_profile.has_valid_will) healthScore -= 10;
  if (!user_profile.disability_cover) healthScore -= 5;

  healthScore = Math.max(0, Math.min(100, healthScore));

  return {
    recommendations,
    overall_health_score: healthScore,
    critical_gaps: criticalGaps,
    strengths,
  };
}
