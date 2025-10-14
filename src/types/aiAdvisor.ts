/**
 * AI Financial Advisor Type Definitions
 *
 * Comprehensive type system for the GPT-5 powered AI financial advisor.
 * Covers all 45 discovery questions across 10 phases of financial planning.
 */

// ============================================================================
// Discovery Phase Tracking
// ============================================================================

export enum DiscoveryPhase {
  PERSONAL_PROFILE = 'personal_profile',
  INCOME_ANALYSIS = 'income_analysis',
  EXPENSES_LIFESTYLE = 'expenses_lifestyle',
  EXISTING_SAVINGS = 'existing_savings',
  INVESTMENT_PHILOSOPHY = 'investment_philosophy',
  TAX_OPTIMIZATION = 'tax_optimization',
  RETIREMENT_INCOME_STRATEGY = 'retirement_income_strategy',
  RISK_MANAGEMENT = 'risk_management',
  ESTATE_PLANNING = 'estate_planning',
  SPECIAL_CIRCUMSTANCES = 'special_circumstances',
  COMPLETED = 'completed',
}

// ============================================================================
// User Profile (60+ fields covering all 45 questions)
// ============================================================================

export interface UserProfile {
  // Phase 1: Personal Profile (7 questions)
  name?: string;
  current_age?: number;
  retirement_age?: number;
  marital_status?: 'single' | 'married' | 'partnered' | 'divorced' | 'widowed';
  dependents?: number;
  dependent_ages?: number[];
  life_expectancy?: number; // default 90
  health_status?: 'excellent' | 'good' | 'fair' | 'poor';
  province?: 'GP' | 'WC' | 'KZN' | 'EC' | 'FS' | 'MP' | 'LP' | 'NW' | 'NC';

  // Phase 2: Income Analysis (5 questions)
  gross_annual_income?: number;
  net_monthly_income?: number;
  employer_pension_contribution?: number; // % of salary
  employer_contribution_rand?: number; // R amount
  bonuses_commissions_annual?: number;
  other_income_sources?: string[]; // ['rental', 'side_business', 'dividends']
  other_income_annual?: number;

  // Phase 3: Expenses & Lifestyle (8 questions)
  monthly_expenses?: number;
  monthly_debt_payments?: number;
  debt_types?: string[]; // ['home_loan', 'car_loan', 'credit_card', 'personal_loan']
  total_outstanding_debt?: number;
  desired_retirement_income_monthly?: number;
  desired_retirement_lifestyle?: 'basic' | 'comfortable' | 'luxurious';
  major_expenses_before_retirement?: Array<{
    description: string;
    amount: number;
    year: number;
  }>;
  retirement_location?: 'same_city' | 'smaller_city' | 'coast' | 'rural' | 'abroad';

  // Phase 4: Existing Savings (4 questions)
  current_ra_balance?: number;
  current_pension_balance?: number;
  current_tfsa_balance?: number;
  current_unit_trusts_balance?: number;
  current_offshore_investments?: number;
  current_cash_savings?: number;
  current_property_equity?: number;
  monthly_ra_contribution?: number;
  monthly_tfsa_contribution?: number;
  monthly_unit_trust_contribution?: number;

  // Phase 5: Investment Philosophy (4 questions)
  risk_tolerance?: 'conservative' | 'moderate' | 'balanced' | 'aggressive' | 'very_aggressive';
  investment_strategy_preference?: 'passive_index' | 'active_managed' | 'hybrid' | 'unsure';
  esg_preference?: boolean; // Environmental, Social, Governance investing
  offshore_exposure_preference?: number; // 0-40%
  current_portfolio_fees?: number; // Total Investment Cost (TIC) %

  // Phase 6: Tax Optimization (4 questions)
  current_ra_contributions_annual?: number;
  using_full_ra_deduction?: boolean;
  current_tfsa_contributions_annual?: number;
  income_splitting_opportunities?: boolean; // Married couples
  tax_free_lump_sum_used?: number; // R500k lifetime limit

  // Phase 7: Retirement Income Strategy (3 questions)
  preferred_retirement_product?: 'living_annuity' | 'life_annuity' | 'combination' | 'unsure';
  desired_drawdown_rate?: number; // 2.5-17.5%
  inheritance_priority?: 'high' | 'medium' | 'low'; // Leave money vs spend it all

  // Phase 8: Risk Management (4 questions)
  life_cover_amount?: number;
  disability_cover?: boolean;
  critical_illness_cover?: boolean;
  funeral_cover?: boolean;
  beneficiaries_updated?: boolean;
  dread_disease_cover?: boolean;

  // Phase 9: Estate Planning (3 questions)
  has_valid_will?: boolean;
  estate_plan_updated?: boolean;
  estate_liquidity_covered?: boolean; // CGT, executor fees, estate duty

  // Phase 10: Special Circumstances (3 questions)
  emigration_plans?: boolean;
  emigration_country?: string;
  own_business?: boolean;
  business_succession_plan?: boolean;
  expected_inheritance?: number;
  expected_inheritance_year?: number;

  // Metadata
  profile_completeness?: number; // 0-100%
  last_updated?: Date;
  current_discovery_phase?: DiscoveryPhase;
}

// ============================================================================
// Conversation Management
// ============================================================================

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  phase?: DiscoveryPhase;
  extracted_data?: Partial<UserProfile>; // Data extracted from this message
  function_calls?: FunctionCall[]; // GPT-5 tool calls made
}

export interface FunctionCall {
  name: string;
  arguments: Record<string, any>;
  result?: any;
  timestamp: Date;
}

export interface ConversationSession {
  id: string;
  user_id: string;
  started_at: Date;
  last_activity: Date;
  current_phase: DiscoveryPhase;
  messages: ConversationMessage[];
  user_profile: UserProfile;
  advisor_state: AdvisorState;
  plan_overrides: PlanOverride[];
}

export interface AdvisorState {
  total_questions_asked: number;
  questions_answered: number;
  current_phase: DiscoveryPhase;
  phases_completed: DiscoveryPhase[];
  confidence_score: number; // 0-100 based on data completeness
  needs_clarification: string[]; // Fields that need more info
  ready_for_projection: boolean;
}

// ============================================================================
// AI Recommendations & Projections
// ============================================================================

export interface AdvisorRecommendation {
  id: string;
  timestamp: Date;
  category:
    | 'contribution_increase'
    | 'tax_optimization'
    | 'investment_strategy'
    | 'drawdown_strategy'
    | 'risk_management'
    | 'estate_planning'
    | 'debt_management'
    | 'retirement_timing';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  summary: string; // 1-2 sentences
  detailed_explanation: string; // Full reasoning
  action_steps: string[]; // Specific actions to take
  estimated_impact: {
    additional_retirement_income_monthly?: number;
    tax_savings_annual?: number;
    additional_wealth_at_retirement?: number;
    risk_reduction?: string;
  };
  regulatory_reference?: string; // e.g., "Section 10C SARS", "Regulation 28"
  overridden: boolean;
  override_reason?: string;
  override_by?: string; // Financial advisor name/ID
  override_at?: Date;
}

export interface PlanOverride {
  id: string;
  timestamp: Date;
  overridden_by: string; // Financial advisor name/ID
  field: keyof UserProfile;
  ai_recommended_value: any;
  advisor_override_value: any;
  reason: string;
  client_approved: boolean;
  client_approved_at?: Date;
}

// ============================================================================
// Monthly & Annual Projections
// ============================================================================

export interface MonthlyProjection {
  year: number;
  month: number; // 1-12
  age: number;

  // Income
  gross_income: number;
  net_income_after_tax: number;
  pension_income?: number;
  other_income?: number;

  // Contributions
  ra_contribution: number;
  tfsa_contribution: number;
  unit_trust_contribution: number;
  employer_contribution: number;

  // Tax Breakdown
  income_tax: number;
  capital_gains_tax: number;
  dividend_tax: number;
  interest_tax: number;
  total_tax: number;
  effective_tax_rate: number;

  // Investment Growth
  investment_return: number;
  inflation_adjusted_return: number;

  // Balances
  ra_balance: number;
  pension_balance: number;
  tfsa_balance: number;
  unit_trust_balance: number;
  total_balance: number;
  inflation_adjusted_balance: number;

  // Retirement Phase (post-retirement)
  drawdown_amount?: number;
  drawdown_rate?: number;
  years_remaining?: number;
  runway_years?: number; // How many years money will last
}

export interface AnnualSummary {
  year: number;
  age: number;

  // Contributions
  total_contributed: number;
  employer_contributed: number;

  // Tax
  total_tax_paid: number;
  tax_saved_via_ra: number;
  effective_tax_rate: number;

  // Growth
  investment_return: number;
  inflation_rate: number;
  real_return: number;

  // Balances
  ending_balance: number;
  inflation_adjusted_balance: number;

  // Retirement metrics (post-retirement)
  monthly_income?: number;
  replacement_ratio?: number; // % of pre-retirement income
  drawdown_rate?: number;
  years_remaining?: number;
}

// ============================================================================
// GPT-5 Function Calling Tools
// ============================================================================

export interface CalculateRetirementProjectionParams {
  user_profile: UserProfile;
  include_monthly_breakdown?: boolean;
}

export interface OptimizeTaxParams {
  gross_income: number;
  current_ra_contribution: number;
  age: number;
  marital_status: string;
  other_deductions?: number;
}

export interface OptimizeTaxResult {
  current_tax: number;
  optimized_tax: number;
  tax_savings: number;
  recommended_ra_contribution: number;
  reasoning: string;
  regulatory_limits: {
    max_ra_contribution: number;
    limit_type: 'R350000_cap' | '27.5%_income_cap';
  };
}

export interface CalculateDrawdownStrategyParams {
  retirement_balance: number;
  desired_monthly_income: number;
  years_to_plan: number;
  inflation_rate: number;
  expected_return: number;
}

export interface CalculateDrawdownStrategyResult {
  recommended_initial_drawdown_rate: number;
  sustainable: boolean;
  years_money_lasts: number;
  end_balance: number;
  inflation_adjusted_income_at_90: number;
  warnings: string[];
  alternative_strategies?: Array<{
    drawdown_rate: number;
    years_lasts: number;
    description: string;
  }>;
}

export interface GenerateRecommendationsParams {
  user_profile: UserProfile;
  current_projection: AnnualSummary[];
}

export interface GenerateRecommendationsResult {
  recommendations: AdvisorRecommendation[];
  overall_health_score: number; // 0-100
  critical_gaps: string[];
  strengths: string[];
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ChatCompletionResponse {
  message: ConversationMessage;
  updated_profile: Partial<UserProfile>;
  next_question?: string;
  phase_completed?: boolean;
  new_phase?: DiscoveryPhase;
  recommendations?: AdvisorRecommendation[];
  requires_human_advisor?: boolean; // Complex situations
}

export interface ProjectionResponse {
  monthly_projections: MonthlyProjection[];
  annual_summaries: AnnualSummary[];
  recommendations: AdvisorRecommendation[];
  key_metrics: {
    total_contributions: number;
    total_tax_paid: number;
    total_tax_saved: number;
    ending_balance: number;
    inflation_adjusted_balance: number;
    replacement_ratio: number;
    wealth_retention_ratio: number;
    years_money_lasts: number;
  };
  warnings: string[];
  confidence_score: number;
}

// ============================================================================
// Error Types
// ============================================================================

export interface AdvisorError {
  code: 'INSUFFICIENT_DATA' | 'API_ERROR' | 'VALIDATION_ERROR' | 'RATE_LIMIT' | 'UNKNOWN';
  message: string;
  missing_fields?: string[];
  retry_after?: number;
}
