// =============================================================================
// TypeScript Type System - AI Retirement Planner
// =============================================================================

// -----------------------------------------------------------------------------
// Core Planner State
// -----------------------------------------------------------------------------
export interface PlannerState {
  // User Demographics
  currentAge: number; // 18-80
  retirementAge: number; // 40-100, must be > currentAge

  // Financial Inputs
  startingBalance: number; // Current RA balance (Rand)
  monthlyContribution: number; // Monthly contribution (Rand)
  annualReturn: number; // Expected annual return (%)
  inflation: number; // Expected inflation rate (%)
  drawdownRate: number; // Retirement drawdown rate (%)
}

// -----------------------------------------------------------------------------
// Statistics (Calculated Results)
// -----------------------------------------------------------------------------
export interface Statistics {
  // Accumulation Phase
  totalContributed: number; // Total amount contributed until retirement
  projectedValueAtRetirement: number; // Balance at retirement age

  // Withdrawal Phase
  totalWithdrawn: number; // Total amount withdrawn during retirement
  totalTaxPaid: number; // Total tax paid over lifetime
  netAfterTaxIncome: number; // Net income after all taxes

  // Key Metrics
  fundDepletionAge: number | null; // Age when funds run out (null if never)
  wealthRetentionRatio: number; // Net income / Total contributed
  effectiveTaxRate: number; // Total tax / Total withdrawn (%)
}

// -----------------------------------------------------------------------------
// Tax System Types
// -----------------------------------------------------------------------------
export interface TaxBracket {
  min: number; // Minimum taxable income for bracket
  max: number | null; // Maximum (null for highest bracket)
  rate: number; // Tax rate (%)
  baseTax: number; // Base tax amount before marginal rate
}

export interface TaxRates {
  taxYear: string; // e.g., "2025/26"

  // Income Tax
  incomeTaxBrackets: TaxBracket[];
  primaryRebate: number; // Under 65
  secondaryRebate: number; // 65+
  tertiaryRebate: number; // 75+

  // RA Lump Sum Tax
  raLumpSumBrackets: TaxBracket[];
  raLumpSumTaxFreeAmount: number; // R550,000 (2025/26)

  // Capital Gains Tax
  cgtInclusionRate: number; // 0.40 (40%)
  cgtAnnualExclusion: number; // R40,000 (2025/26)

  // Dividend Withholding Tax
  dividendWhtRate: number; // 0.20 (20%)

  // Interest Exemption
  interestExemptUnder65: number; // R23,800 (2025/26)
  interestExemptOver65: number; // R34,500 (2025/26)
}

// -----------------------------------------------------------------------------
// Discovery Funds
// -----------------------------------------------------------------------------
export interface DiscoveryFund {
  id: string;
  fundName: string; // e.g., "Discovery Equity Fund"
  fundCode: string; // e.g., "DI_EQ_001"
  fundType: "Equity" | "Balanced" | "Bond" | "Money Market" | "Specialist";

  // Performance Metrics
  cagr1y: number | null; // 1-year CAGR (%)
  cagr3y: number | null; // 3-year CAGR (%)
  cagr5y: number | null; // 5-year CAGR (%)
  cagr10y: number | null; // 10-year CAGR (%)
  volatility: number | null; // Annualized volatility (%)
  sharpeRatio: number | null; // Risk-adjusted return

  // Metadata
  inceptionDate: Date | null;
  lastUpdated: Date;
  isCached: boolean; // True if from cache, false if freshly scraped
}

// -----------------------------------------------------------------------------
// Inflation Data
// -----------------------------------------------------------------------------
export interface InflationData {
  year: number;
  month: number; // 1-12
  cpiValue: number; // CPI index value
  annualRate: number; // Year-on-year inflation (%)
  monthlyRate: number | null; // Month-on-month change (%)
  category: string; // "All items", "Food", etc.
  source: "stats_sa" | "sarb" | "fallback";
  lastUpdated: Date;
}

// -----------------------------------------------------------------------------
// Projection Year (Year-by-Year Breakdown)
// -----------------------------------------------------------------------------
export interface ProjectionYear {
  year: number; // Calendar year
  age: number; // User's age
  beginningBalance: number;
  contributions: number; // Annual contributions (0 after retirement)
  investmentReturn: number; // Growth from returns
  withdrawals: number; // Annual withdrawals (0 before retirement)
  taxPaid: number; // Tax paid this year
  endingBalance: number;
  inflationAdjustedBalance: number; // Real value in today's Rand
}

// -----------------------------------------------------------------------------
// Tax Strategy (Optimization)
// -----------------------------------------------------------------------------
export interface TaxStrategy {
  strategyName: string; // "RA Only", "RA + TFSA", "RA + TFSA + Brokerage"
  strategyType: "ra_only" | "ra_tfsa" | "ra_tfsa_brokerage";

  // Allocation
  raAllocation: number; // % allocated to RA
  tfsaAllocation: number; // % allocated to TFSA
  brokerageAllocation: number; // % allocated to taxable brokerage

  // Results
  projectedValueAtRetirement: number;
  totalTaxPaid: number;
  taxSavingsVsBaseline: number; // Tax saved vs RA-only strategy
  wealthRetentionRatio: number;

  // Recommendation
  isRecommended: boolean;
  recommendationReason?: string;
}

// -----------------------------------------------------------------------------
// Scenario Comparison
// -----------------------------------------------------------------------------
export interface Scenario {
  id: string;
  scenarioName: string; // "Optimistic", "Pessimistic", "Conservative"
  scenarioType: "optimistic" | "pessimistic" | "conservative" | "custom";

  // Modified Inputs (based on base PlannerState)
  plannerState: PlannerState;

  // Results
  statistics: Statistics;
  projections: ProjectionYear[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface ScenarioComparison {
  baseScenario: Scenario;
  comparisonScenarios: Scenario[];
  comparisonMetrics: {
    scenarioId: string;
    scenarioName: string;
    projectedValueDelta: number; // Difference from base
    taxPaidDelta: number;
    fundDepletionAgeDelta: number | null;
  }[];
}

// -----------------------------------------------------------------------------
// Withdrawal Plan
// -----------------------------------------------------------------------------
export interface WithdrawalPlan {
  strategy: "fixed_amount" | "percentage_of_balance" | "inflation_adjusted";
  monthlyAmount: number; // Calculated monthly withdrawal
  annualAmount: number;
  firstWithdrawalAge: number;
  estimatedDepletionAge: number | null;
}

// -----------------------------------------------------------------------------
// Report Document (AI-Generated)
// -----------------------------------------------------------------------------
export interface ReportDocument {
  id: string;
  userId: string;
  planId: string;

  // Report Content (AI-generated)
  executiveSummary: string; // High-level overview
  projectionAnalysis: string; // Detailed projection breakdown
  taxOptimizationRecommendations: string; // Tax strategies
  riskAssessment: string; // Risk factors and mitigation
  actionableRecommendations: string[]; // Bulleted action items

  // Supporting Data
  statistics: Statistics;
  projections: ProjectionYear[];
  scenarios?: ScenarioComparison;

  // Metadata
  generatedAt: Date;
  format: "markdown" | "pdf" | "html";
  version: string; // Report version for tracking
}

// -----------------------------------------------------------------------------
// API Response Types
// -----------------------------------------------------------------------------
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: Date;
    requestId: string;
  };
}

// Scraper-specific response
export interface ScraperResponse<T> extends APIResponse<T> {
  cached: boolean; // True if from cache
  cacheAge?: number; // Seconds since last scrape
  source: "scraper" | "cache" | "fallback";
}

// -----------------------------------------------------------------------------
// Database Models (for Drizzle ORM)
// -----------------------------------------------------------------------------
export interface UserModel {
  id: string;
  email: string;
  name: string | null;
  authProvider: string | null;
  authProviderId: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
  isActive: boolean;
}

export interface RetirementPlanModel {
  id: string;
  userId: string;
  planName: string;
  description: string | null;

  // PlannerState fields
  currentAge: number;
  retirementAge: number;
  startingBalance: number;
  monthlyContribution: number;
  annualReturn: number;
  inflation: number;
  drawdownRate: number;
  targetMonthlyToday: number | null;
  fundName: string | null;
  fundCode: string | null;

  // Metadata
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// -----------------------------------------------------------------------------
// Form Validation Types (Zod schemas will use these)
// -----------------------------------------------------------------------------
export interface PlannerStateValidation {
  currentAge: { min: 18; max: 80 };
  retirementAge: { min: 40; max: 100 };
  startingBalance: { min: 0 };
  monthlyContribution: { min: 0 };
  annualReturn: { min: -10; max: 50 };
  inflation: { min: 0; max: 20 };
  drawdownRate: { min: 0; max: 20 };
}

// -----------------------------------------------------------------------------
// Utility Types
// -----------------------------------------------------------------------------
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];
