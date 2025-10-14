# GPT-5 AI Financial Advisor Feature Specification

**Version:** 1.0
**Date:** 2025-10-13
**Status:** In Development
**Owner:** rotem-strategy

---

## 🎯 Feature Overview

Create a **CFP®-equivalent AI financial advisor** powered by OpenAI's GPT-5 that conducts comprehensive retirement planning consultations through natural conversation. The AI advisor asks 45 professional-grade discovery questions, analyzes the user's unique situation, provides personalized recommendations, generates detailed monthly projections with tax breakdowns, and allows human advisors to override any parameters.

### Key Objectives

1. **Expert-Level Consultation**: Match the quality of a Certified Financial Planner
2. **Comprehensive Discovery**: Gather complete financial picture through 45 targeted questions
3. **SA Regulatory Expertise**: Deep knowledge of SARS tax law, two-pot system, RA limits
4. **Personalized Recommendations**: AI-generated, prioritized, impact-quantified advice
5. **Advisor Override**: Allow human advisors to adjust any parameter with reasoning
6. **Monthly Granularity**: Detailed month-by-month projections and tax analysis
7. **Seamless Integration**: Works alongside existing manual planner

---

## 💬 45-Question Discovery Framework

### **Phase 1: Personal Profile (7 questions)**

1. **Full Name**
   - Purpose: Personalization, official documentation

2. **Current Age**
   - Validation: 18-75 years
   - Impact: Determines years to retirement, tax brackets

3. **Planned Retirement Age**
   - Validation: Must be > current age, typically 55-70
   - Impact: Investment horizon, accumulation period
   - AI Response:
     - If < 60: "Early retirement requires significant savings."
     - If > 67: "Working longer reduces withdrawal period."

4. **Marital Status**
   - Options: Single / Married / Partnered
   - Follow-up: Partner's employment, retirement savings
   - Impact: Joint planning, income splitting

5. **Dependents**
   - Count and ages
   - Impact: Education costs, support obligations, tax rebates

6. **Life Expectancy Expectation**
   - Default: Plan to age 90
   - Education: "SA average is 74, but plan for 90+ to be safe"

7. **Health Status**
   - Options: Excellent / Good / Fair / Poor
   - Impact: Healthcare costs, potential early retirement

---

### **Phase 2: Income Analysis (5 questions)**

8. **Gross Annual Income**
   - Pre-tax salary
   - Calculation: Tax liability, net income, marginal rate

9. **Net Monthly Income**
   - After-tax, in-hand
   - Validation: Should align with gross
   - AI catches mismatches: "With R800k gross, you should net ~R600k/year"

10. **Additional Income**
    - Bonuses, 13th cheque, rental, dividends, side business
    - Impact: Total taxable income, RA limit calculation

11. **Employer Pension Contribution**
    - Monthly amount
    - Impact: Counts toward 27.5% RA limit
    - Example: "R5k/month (R60k/year) counts toward your R350k limit"

12. **Employment Stability**
    - Scale: Very secure / Moderately secure / At risk
    - Impact: Emergency fund sizing, risk tolerance

---

### **Phase 3: Expenses & Lifestyle (8 questions)**

13. **Current Monthly Expenses**
    - Total household spending
    - Breakdown: Housing, transport, food, insurance, debt, discretionary

14. **Debt - Home Loan**
    - Balance, monthly payment, years remaining
    - Impact: Debt-free target, reduced retirement needs

15. **Debt - Car Loan**
    - Balance, monthly payment, years remaining

16. **Debt - Other**
    - Credit cards, personal loans, interest rates

17. **Debt-Free Timeline**
    - When will all debt be paid off?
    - Guidance: "Retire debt-free if possible"

18. **Desired Retirement Income**
    - Method 1: Specific amount (R40k/month)
    - Method 2: Percentage (75% of current)
    - Validation: "That's R480k/year. With inflation, R1.2M/year in 25 years!"

19. **Retirement Lifestyle**
    - Modest (60-70%), Comfortable (70-80%), Luxurious (80-100%)
    - Education: "Most need 75% since no commute, kids, bond"

20. **Travel Plans**
    - Extensive travel in retirement?
    - Budget: R50-100k/year for travel

---

### **Phase 4: Existing Savings (4 questions)**

21. **Retirement Annuity (RA)**
    - Current balance, monthly contribution
    - Provider (Discovery, Allan Gray, 10X, Old Mutual)
    - Annual fees (TER%)

22. **Employer Pension/Provident Fund**
    - Current balance, monthly contribution (yours + employer)

23. **Other Investments**
    - TFSA balance
    - Unit trusts balance
    - Shares/stocks value
    - Investment property value (excluding primary residence)
    - Note: "These don't get RA tax benefits but add cushion"

24. **Two-Pot System Awareness**
    - Vested pot: Pre-Sept 2024 savings
    - Savings pot: 1/3 new contributions (accessible)
    - Retirement pot: 2/3 new contributions (locked)
    - Question: "Have you made emergency withdrawals?"
    - Impact: Reduces retirement capital

---

### **Phase 5: Investment Philosophy (4 questions)**

25. **Investment Strategy**
    - Conservative (5-7% return, mostly bonds/cash)
    - Balanced (8-9% return, 60/40 equity/bonds)
    - Growth/Aggressive (10-12% return, 80%+ equity)
    - Context: "JSE historically ~10% long-term with volatility"

26. **Risk Tolerance**
    - How react to 20% loss in a year?
    - Options: Panic & sell / Uncomfortable but hold / Buying opportunity
    - Impact: Asset allocation

27. **Other Retirement Income**
    - Rental property income
    - Part-time work plans
    - Government old-age pension (R2,350/month if qualified)
    - Impact: Can afford more aggressive drawdown

28. **Investment Fees**
    - Current RA/fund fees (TER%)
    - Education: "Typical 0.5-1.5%. 10X cheapest at 0.5-0.9%"
    - Impact: R100k saved per 0.5% reduction over 30 years!

---

### **Phase 6: Tax Optimization (4 questions)**

29. **RA Tax Deduction Status**
    - Calculate: Current vs limit
    - Example: "You earn R800k. Limit: min(R350k, R220k) = R220k"
    - "You contribute R60k → R160k untapped → R44k tax lost!"

30. **Tax-Free Savings Account (TFSA)**
    - Have one? Balance?
    - Limit: R36,000/year, R500,000 lifetime
    - Benefit: "Grows tax-free forever! Supplement to RA"

31. **Income Splitting with Spouse**
    - Lower-earning spouse invests more for lower tax bracket

32. **R500k Tax-Free Lump Sum Awareness**
    - First R500k withdrawal from RA at retirement is tax-free
    - Strategy: Take R500k cash, use rest for living annuity

---

### **Phase 7: Retirement Income Strategy (3 questions)**

33. **Annuity Preference**
    - A) Living Annuity (flexible, market-linked, 2.5-17.5%)
    - B) Guaranteed Annuity (fixed income for life, no market risk)
    - C) Combination (balance security + growth)
    - Explain pros/cons

34. **Inheritance Goal**
    - Want to leave money for heirs?
    - If yes: Living annuity allows this
    - If no: Guaranteed maximizes your income

35. **Drawdown Rate**
    - "4% is traditional safe withdrawal rate"
    - "SA: 3.5-4.5% recommended due to inflation"
    - Higher = more income now, but depletion risk

---

### **Phase 8: Risk Management (4 questions)**

36. **Life Insurance**
    - Coverage amount, beneficiaries
    - "If you die before retirement, will family be okay?"

37. **Disability Insurance**
    - Have coverage?
    - Impact: Forced early retirement

38. **Medical Aid**
    - Have health insurance?
    - Estimate: R3,500-6,000/month for couple in retirement
    - "Healthcare = biggest retirement expense!"

39. **Beneficiary Nominations**
    - Up to date?
    - CRITICAL: "Nominations not binding (Section 37C)!"
    - "Trustees decide based on financial dependency"

---

### **Phase 9: Estate Planning (3 questions)**

40. **Will**
    - Have a valid will?
    - If no: "URGENT! Intestate succession applies without one"

41. **Estate Duty Knowledge**
    - "First R3.5M exempt, then 20% to R30M, 25% above"
    - "Good news: Retirement funds bypass estate duty!"

42. **Estate Plan**
    - Executor nominated?
    - Assets documented?
    - Liquidity for estate duty?

---

### **Phase 10: Special Circumstances (3 questions)**

43. **Emigration Plans**
    - Retire abroad?
    - Impact: Tax implications, currency risk, RA access

44. **Business Ownership**
    - Own a business?
    - Succession planning? Business value as retirement asset?

45. **Expected Inheritance**
    - Amount? When?
    - Advice: "Don't rely on it, but can be bonus"

---

## 🧠 AI SYSTEM PROMPT

```
You are Thando Nkosi, a Certified Financial Planner (CFP®) with 15 years of experience
specializing in retirement planning for South Africans. You are registered with the
Financial Planning Institute of Southern Africa (FPI) and adhere to the FPI Code of Ethics.

YOUR EXPERTISE:
- SARS tax law and optimization strategies
- Retirement product structuring (RAs, pension funds, living annuities)
- Investment portfolio management (JSE, global equities, bonds)
- Estate planning and Section 37C death benefits
- Two-pot retirement system (implemented Sept 2024)
- Replacement ratio analysis and income planning
- Risk management and insurance adequacy

===== SA REGULATORY ENVIRONMENT (2025/26) =====

TAX RATES:
- R0 - R237,100: 18%
- R237,101 - R370,500: 26% (base R42,678)
- R370,501 - R512,800: 31% (base R77,362)
- R512,801 - R673,000: 36% (base R121,475)
- R673,001 - R857,900: 39% (base R179,147)
- R857,901 - R1,817,000: 41% (base R251,258)
- R1,817,001+: 45% (base R644,489)

TAX REBATES:
- Primary (all taxpayers): R17,235
- Secondary (age 65+): R9,444
- Tertiary (age 75+): R3,145

RA CONTRIBUTION LIMITS:
- Annual max: R350,000 OR 27.5% of taxable income (LOWER)
- Employer pension/provident contributions count toward limit

TWO-POT SYSTEM (Sept 2024+):
- Vested: All savings before 1 Sept 2024 (old rules)
- Savings: 1/3 new contributions + seed capital (10% vested, max R30k)
  → Accessible: Min R2k, once per tax year, taxed at marginal rate
- Retirement: 2/3 new contributions (locked until retirement)

RETIREMENT LUMP SUM TAX:
- R0 - R500,000: 0% (tax-free!)
- R500,001 - R700,000: 18%
- R700,001 - R1,050,000: 27%
- R1,050,001+: 36%

LIVING ANNUITY DRAWDOWN: 2.5% - 17.5% per year

INFLATION: SARB target 3-6% (midpoint 4.5%), Current ~5.2%

INVESTMENT RETURNS (Long-term):
- JSE All Share: 9-10%
- SA Bonds: 7-8%
- Cash: 6-7%
- Global Equities: 10-12% (USD)

LIFE EXPECTANCY: SA avg 74, plan for 90+

REPLACEMENT RATIO: Target 70-80%, SA reality 31% (crisis!)

===== CONSULTATION APPROACH =====

1. DISCOVERY: Ask thoughtful, open-ended questions. Validate and educate.
2. ANALYSIS: Calculate tax, determine headroom, project capital needed, identify gaps.
3. RECOMMENDATIONS: Provide 3-5 specific, actionable, quantified recommendations.
4. PLAN ADJUSTMENT: Present proposal, explain rationale, allow overrides.

COMMUNICATION STYLE:
- Professional yet conversational
- Specific numbers and examples
- No jargon, explain simply
- Empathetic to financial stress
- Ask "Does this make sense?" after complex points
- Use SA context (Rand, JSE, SARS, SARB)

ETHICAL GUARDRAILS:
- Never guarantee returns
- Always disclose risks
- Present multiple scenarios
- Emphasize projections, not promises
- Recommend CFP® for complex situations
- Disclose: "I'm an AI advisor. For personalized advice, consult a CFP®"

TOOLS AVAILABLE:
- calculate_projection(): Run retirement projection
- adjust_plan(): Update parameters
- calculate_tax(): SARS tax liability
- optimize_contributions(): Find optimal RA contribution
- compare_scenarios(): Side-by-side comparison
- generate_monthly_breakdown(): Month-by-month detail
```

---

## 📊 USER PROFILE DATA STRUCTURE

```typescript
interface UserProfile {
  // Personal (Phase 1)
  name: string;
  current_age: number;
  retirement_age: number;
  marital_status: 'single' | 'married' | 'partnered';
  partner_employed: boolean;
  partner_has_ra: boolean;
  dependents: number;
  dependent_ages: number[];
  life_expectancy: number; // default 90
  health_status: 'excellent' | 'good' | 'fair' | 'poor';

  // Income (Phase 2)
  gross_annual_income: number;
  net_monthly_income: number;
  has_bonus: boolean;
  bonus_amount: number;
  rental_income: number;
  dividend_income: number;
  side_business_income: number;
  employer_pension_contribution: number;
  employment_stability: 'very_secure' | 'moderately_secure' | 'at_risk';

  // Expenses (Phase 3)
  monthly_expenses: number;
  home_loan_balance: number;
  home_loan_monthly: number;
  home_loan_years_remaining: number;
  car_loan_balance: number;
  car_loan_monthly: number;
  other_debt: number;
  debt_free_age: number;
  desired_monthly_income: number;
  retirement_lifestyle: 'modest' | 'comfortable' | 'luxurious';
  travel_budget: number;
  will_relocate: boolean;

  // Savings (Phase 4)
  ra_current_balance: number;
  ra_monthly_contribution: number;
  ra_provider: string;
  ra_ter: number; // Total Expense Ratio
  pension_fund_balance: number;
  pension_monthly_contribution: number;
  tfsa_balance: number;
  unit_trusts_balance: number;
  shares_value: number;
  property_value: number;
  two_pot_withdrawals_made: boolean;
  two_pot_withdrawal_amount: number;

  // Investment (Phase 5)
  risk_tolerance: 'conservative' | 'balanced' | 'aggressive';
  expected_return: number;
  investment_fees: number;
  has_other_retirement_income: boolean;
  other_income_sources: string[];

  // Tax (Phase 6)
  maxing_ra_contributions: boolean;
  has_tfsa: boolean;
  aware_of_lump_sum_benefit: boolean;

  // Retirement Strategy (Phase 7)
  annuity_preference: 'living' | 'guaranteed' | 'combination';
  drawdown_rate: number;
  inheritance_goal: boolean;

  // Protection (Phase 8)
  life_insurance_coverage: number;
  has_disability_insurance: boolean;
  has_medical_aid: boolean;
  medical_aid_cost: number;
  beneficiaries_nominated: boolean;

  // Estate (Phase 9)
  has_will: boolean;
  has_estate_plan: boolean;
  estate_liquidity_planned: boolean;

  // Special (Phase 10)
  emigration_plans: boolean;
  emigration_country: string;
  owns_business: boolean;
  business_value: number;
  expects_inheritance: boolean;
  expected_inheritance_amount: number;
  expected_inheritance_year: number;

  // Meta
  questions_answered: number[];
  completion_percentage: number;
  last_updated: Date;
}
```

---

## 🔧 GPT-5 FUNCTION CALLING TOOLS

```typescript
const tools = [
  {
    type: 'function',
    function: {
      name: 'calculate_retirement_projection',
      description: 'Calculate detailed retirement projection with SA tax rules',
      parameters: {
        type: 'object',
        properties: {
          current_age: { type: 'number' },
          retirement_age: { type: 'number' },
          gross_annual_income: { type: 'number' },
          current_ra_balance: { type: 'number' },
          monthly_ra_contribution: { type: 'number' },
          employer_contribution: { type: 'number' },
          expected_return: { type: 'number' },
          inflation_rate: { type: 'number' },
          desired_retirement_income: { type: 'number' },
          drawdown_rate: { type: 'number' },
        },
        required: ['current_age', 'retirement_age', 'gross_annual_income'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate_sars_tax',
      description: 'Calculate SARS tax, rebates, and net income',
      parameters: {
        type: 'object',
        properties: {
          taxable_income: { type: 'number' },
          age: { type: 'number' },
          ra_contribution: { type: 'number' },
        },
        required: ['taxable_income', 'age'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'optimize_ra_contributions',
      description: 'Find optimal RA contribution for tax efficiency',
      parameters: {
        type: 'object',
        properties: {
          gross_income: { type: 'number' },
          current_contribution: { type: 'number' },
          employer_contribution: { type: 'number' },
          available_cashflow: { type: 'number' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_recommendations',
      description: 'Generate prioritized financial planning recommendations',
      parameters: {
        type: 'object',
        properties: {
          user_profile: { type: 'object' },
          current_plan: { type: 'object' },
          gaps_identified: { type: 'array' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_monthly_breakdown',
      description: 'Generate month-by-month projections for retirement years',
      parameters: {
        type: 'object',
        properties: {
          retirement_capital: { type: 'number' },
          monthly_withdrawal: { type: 'number' },
          expected_return: { type: 'number' },
          years_in_retirement: { type: 'number' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'adjust_plan',
      description: 'Update retirement plan parameters',
      parameters: {
        type: 'object',
        properties: {
          field: {
            type: 'string',
            enum: ['monthly_contribution', 'retirement_age', 'drawdown_rate', 'expected_return', 'inflation_rate']
          },
          value: { type: 'number' },
          reason: { type: 'string' },
        },
        required: ['field', 'value', 'reason'],
      },
    },
  },
];
```

---

## 💰 COST ANALYSIS

### **Per Consultation**
- Average conversation: 60-80 messages (30-40 exchanges)
- Tokens per message: ~1,000 input + ~2,000 output
- Total per consultation: ~100,000 input + ~80,000 output tokens
- **Cost:** ~$0.92 per full consultation (GPT-5)

### **Monthly Estimates**
- 1,000 consultations/month: ~$920/month
- With optimization (caching, GPT-5-mini for simple Q&A): ~$300-400/month

### **Optimization Strategies**
1. Use GPT-5-mini for yes/no questions: 75% cost reduction
2. Implement prompt caching: 50% input token reduction
3. Compress conversation history after 20 messages
4. Cache system prompt (reused across sessions)

---

## 🎯 SUCCESS METRICS

1. **Consultation Completion Rate**: >70% complete all 45 questions
2. **Recommendation Acceptance**: >60% users accept ≥1 recommendation
3. **Accuracy**: AI recommendations align with CFP® standards (verified by maya-code-review)
4. **Response Time**: <5 seconds per AI message
5. **User Satisfaction**: >4.5/5 stars
6. **Cost Efficiency**: <$1 per consultation
7. **Engagement**: Average 12+ messages per session

---

## 🔐 SECURITY & COMPLIANCE

### **Data Privacy**
- Conversations encrypted at rest
- PII (Personally Identifiable Information) anonymized in logs
- GDPR/POPIA compliant data handling
- User can delete conversation history

### **Financial Regulations**
- Clear disclaimer: "AI advisor, not regulated financial advice"
- Recommend human CFP® for complex situations
- Disclose limitations and assumptions
- No investment product sales

### **AI Safety**
- Content moderation filters
- No hallucination on tax/regulatory facts (grounded in knowledge base)
- Override system allows human correction
- Audit trail for all recommendations

---

## 📱 UI/UX MOCKUPS

### **Split-Screen Layout (Desktop)**
```
┌────────────────────────────────────────────────────────────────┐
│  🤖 Chat with Thando  (Progress: 18/45)  |  📊 Your Plan      │
├────────────────────────────────────────────────────────────────┤
│                                           |                     │
│  Thando: Hi! I'm Thando, your CFP®       |  Current Age: 35    │
│  retirement advisor. What's your name?   |  Retirement Age: -- │
│                                           |  RA Balance: R 0    │
│  You: John                                |                     │
│                                           |  🎯 Completion: 40% │
│  Thando: Great! How old are you?         |                     │
│                                           |  [Calculating...]   │
│  You: 35                                  |                     │
│                                           |  💰 Projected Value │
│  Thando: Perfect! When do you want       |  R 0 → R 4.2M       │
│  to retire?                               |                     │
│                                           |  📈 [Live Chart]    │
│  [Type your message...]    [Send]        |                     │
│                                           |                     │
└────────────────────────────────────────────────────────────────┘
```

### **Mobile Layout**
```
┌────────────────────────────┐
│  🤖 Chat with Thando      │
│  Progress: ●●●●●○○○ 60%   │
├────────────────────────────┤
│                            │
│  Thando: What's your      │
│  current RA balance?       │
│                            │
│  You: R150,000            │
│                            │
│  Thando: Excellent start! │
│  Monthly contribution?     │
│                            │
│  📊 [Tap to see plan] →   │
│                            │
│  [Type message...]  [Send] │
└────────────────────────────┘
```

---

## 🚀 INTEGRATION POINTS

### **With Existing Planner**
1. **Entry Point**: "Chat with AI Advisor" button on planner page
2. **Data Sync**: AI suggestions auto-populate planner inputs
3. **Mode Toggle**: "AI Guided" vs "Manual" planning modes
4. **Seamless Transition**: User can switch modes mid-planning

### **With Database**
- Store conversations in `ai_conversations` table
- Store profiles in `user_profiles` table
- Link to `retirement_plans` table for persistence

### **With Reports**
- AI-generated insights in PDF exports
- Recommendations section in reports
- Advisor override notes in documentation

---

## 📚 REFERENCES

- SARS Tax Rates 2025/26: https://www.sars.gov.za/tax-rates/
- Two-Pot System: https://www.treasury.gov.za/comm_media/press/2024/
- FPI Code of Ethics: https://fpi.co.za/
- Replacement Ratio Research: Discovery, Allan Gray, 10X reports

---

**Next Steps**: Proceed to Phase 20.1 (Documentation) as per implementation plan.
