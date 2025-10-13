# Database Schema Documentation

**Project:** AI Retirement & Tax Optimization Planner
**Version:** 1.0
**Database:** Vercel Postgres (PostgreSQL)
**ORM:** Drizzle ORM
**Last Updated:** 2025-10-13

---

## Overview

This document defines the complete database schema for the AI Retirement Planner, including tables for user management, retirement plans, scenarios, and cached external data (Discovery funds, SARS tax tables, CPI data).

---

## Schema Diagram

```
users
  ├── retirement_plans (1:N)
  │     ├── scenarios (1:N)
  │     └── projection_history (1:N)
  │
  └── [Authentication managed by NextAuth/Clerk]

discovery_funds_cache (standalone)
sars_tax_tables_cache (standalone)
cpi_data_cache (standalone)
```

---

## 1. Users Table

### Purpose
Store user account information. Authentication handled by NextAuth.js or Clerk.

### Schema
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  auth_provider VARCHAR(50), -- 'google', 'github', etc.
  auth_provider_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,

  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth_provider ON users(auth_provider, auth_provider_id);
```

### Drizzle Schema
```typescript
import { pgTable, uuid, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  authProvider: varchar('auth_provider', { length: 50 }),
  authProviderId: varchar('auth_provider_id', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  isActive: boolean('is_active').default(true),
});
```

---

## 2. Retirement Plans Table

### Purpose
Store saved retirement plan configurations with all input parameters.

### Schema
```sql
CREATE TABLE retirement_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Input Parameters
  current_age INTEGER NOT NULL CHECK (current_age >= 18 AND current_age <= 100),
  retirement_age INTEGER NOT NULL CHECK (retirement_age >= 40 AND retirement_age <= 100),
  starting_balance DECIMAL(15, 2) NOT NULL CHECK (starting_balance >= 0),
  monthly_contribution DECIMAL(15, 2) NOT NULL CHECK (monthly_contribution >= 0),
  annual_return DECIMAL(5, 2) NOT NULL CHECK (annual_return >= -10 AND annual_return <= 50),
  inflation DECIMAL(5, 2) NOT NULL CHECK (inflation >= 0 AND inflation <= 20),
  drawdown_rate DECIMAL(5, 2) NOT NULL CHECK (drawdown_rate >= 0 AND drawdown_rate <= 20),
  target_monthly_today DECIMAL(15, 2) CHECK (target_monthly_today >= 0),
  fund_name VARCHAR(255),
  fund_code VARCHAR(50),

  -- Metadata
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT retirement_age_check CHECK (retirement_age > current_age)
);

CREATE INDEX idx_retirement_plans_user_id ON retirement_plans(user_id);
CREATE INDEX idx_retirement_plans_created_at ON retirement_plans(created_at DESC);
CREATE INDEX idx_retirement_plans_user_default ON retirement_plans(user_id, is_default);
```

### Drizzle Schema
```typescript
import { pgTable, uuid, varchar, text, integer, decimal, boolean, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const retirementPlans = pgTable('retirement_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  planName: varchar('plan_name', { length: 255 }).notNull(),
  description: text('description'),

  currentAge: integer('current_age').notNull(),
  retirementAge: integer('retirement_age').notNull(),
  startingBalance: decimal('starting_balance', { precision: 15, scale: 2 }).notNull(),
  monthlyContribution: decimal('monthly_contribution', { precision: 15, scale: 2 }).notNull(),
  annualReturn: decimal('annual_return', { precision: 5, scale: 2 }).notNull(),
  inflation: decimal('inflation', { precision: 5, scale: 2 }).notNull(),
  drawdownRate: decimal('drawdown_rate', { precision: 5, scale: 2 }).notNull(),
  targetMonthlyToday: decimal('target_monthly_today', { precision: 15, scale: 2 }),
  fundName: varchar('fund_name', { length: 255 }),
  fundCode: varchar('fund_code', { length: 50 }),

  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
```

---

## 3. Scenarios Table

### Purpose
Store alternative "what-if" scenarios for comparison against the main plan.

### Schema
```sql
CREATE TABLE scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES retirement_plans(id) ON DELETE CASCADE,
  scenario_name VARCHAR(255) NOT NULL,
  scenario_type VARCHAR(50), -- 'optimistic', 'pessimistic', 'conservative', 'custom'

  -- Input Parameters (same as retirement_plans)
  current_age INTEGER NOT NULL,
  retirement_age INTEGER NOT NULL,
  starting_balance DECIMAL(15, 2) NOT NULL,
  monthly_contribution DECIMAL(15, 2) NOT NULL,
  annual_return DECIMAL(5, 2) NOT NULL,
  inflation DECIMAL(5, 2) NOT NULL,
  drawdown_rate DECIMAL(5, 2) NOT NULL,
  target_monthly_today DECIMAL(15, 2),
  fund_name VARCHAR(255),
  fund_code VARCHAR(50),

  -- Calculated Results (cached for comparison)
  projected_value_at_retirement DECIMAL(15, 2),
  total_contributed DECIMAL(15, 2),
  total_withdrawn DECIMAL(15, 2),
  total_tax_paid DECIMAL(15, 2),
  net_after_tax_income DECIMAL(15, 2),
  fund_depletion_age INTEGER,
  wealth_retention_ratio DECIMAL(5, 4),
  effective_tax_rate DECIMAL(5, 2),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_scenarios_plan_id ON scenarios(plan_id);
CREATE INDEX idx_scenarios_type ON scenarios(scenario_type);
```

### Drizzle Schema
```typescript
import { pgTable, uuid, varchar, integer, decimal, timestamp } from 'drizzle-orm/pg-core';
import { retirementPlans } from './retirementPlans';

export const scenarios = pgTable('scenarios', {
  id: uuid('id').primaryKey().defaultRandom(),
  planId: uuid('plan_id').notNull().references(() => retirementPlans.id, { onDelete: 'cascade' }),
  scenarioName: varchar('scenario_name', { length: 255 }).notNull(),
  scenarioType: varchar('scenario_type', { length: 50 }),

  currentAge: integer('current_age').notNull(),
  retirementAge: integer('retirement_age').notNull(),
  startingBalance: decimal('starting_balance', { precision: 15, scale: 2 }).notNull(),
  monthlyContribution: decimal('monthly_contribution', { precision: 15, scale: 2 }).notNull(),
  annualReturn: decimal('annual_return', { precision: 5, scale: 2 }).notNull(),
  inflation: decimal('inflation', { precision: 5, scale: 2 }).notNull(),
  drawdownRate: decimal('drawdown_rate', { precision: 5, scale: 2 }).notNull(),
  targetMonthlyToday: decimal('target_monthly_today', { precision: 15, scale: 2 }),
  fundName: varchar('fund_name', { length: 255 }),
  fundCode: varchar('fund_code', { length: 50 }),

  projectedValueAtRetirement: decimal('projected_value_at_retirement', { precision: 15, scale: 2 }),
  totalContributed: decimal('total_contributed', { precision: 15, scale: 2 }),
  totalWithdrawn: decimal('total_withdrawn', { precision: 15, scale: 2 }),
  totalTaxPaid: decimal('total_tax_paid', { precision: 15, scale: 2 }),
  netAfterTaxIncome: decimal('net_after_tax_income', { precision: 15, scale: 2 }),
  fundDepletionAge: integer('fund_depletion_age'),
  wealthRetentionRatio: decimal('wealth_retention_ratio', { precision: 5, scale: 4 }),
  effectiveTaxRate: decimal('effective_tax_rate', { precision: 5, scale: 2 }),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
```

---

## 4. Projection History Table

### Purpose
Store year-by-year projection details for visualization and analysis.

### Schema
```sql
CREATE TABLE projection_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES retirement_plans(id) ON DELETE CASCADE,
  scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,

  year INTEGER NOT NULL,
  age INTEGER NOT NULL,
  beginning_balance DECIMAL(15, 2) NOT NULL,
  contributions DECIMAL(15, 2) NOT NULL,
  investment_return DECIMAL(15, 2) NOT NULL,
  withdrawals DECIMAL(15, 2) NOT NULL,
  tax_paid DECIMAL(15, 2) NOT NULL,
  ending_balance DECIMAL(15, 2) NOT NULL,
  inflation_adjusted_balance DECIMAL(15, 2),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_plan_year UNIQUE (plan_id, scenario_id, year)
);

CREATE INDEX idx_projection_plan_id ON projection_history(plan_id);
CREATE INDEX idx_projection_scenario_id ON projection_history(scenario_id);
CREATE INDEX idx_projection_year ON projection_history(year);
```

### Drizzle Schema
```typescript
import { pgTable, uuid, integer, decimal, timestamp, unique } from 'drizzle-orm/pg-core';
import { retirementPlans } from './retirementPlans';
import { scenarios } from './scenarios';

export const projectionHistory = pgTable('projection_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  planId: uuid('plan_id').notNull().references(() => retirementPlans.id, { onDelete: 'cascade' }),
  scenarioId: uuid('scenario_id').references(() => scenarios.id, { onDelete: 'cascade' }),

  year: integer('year').notNull(),
  age: integer('age').notNull(),
  beginningBalance: decimal('beginning_balance', { precision: 15, scale: 2 }).notNull(),
  contributions: decimal('contributions', { precision: 15, scale: 2 }).notNull(),
  investmentReturn: decimal('investment_return', { precision: 15, scale: 2 }).notNull(),
  withdrawals: decimal('withdrawals', { precision: 15, scale: 2 }).notNull(),
  taxPaid: decimal('tax_paid', { precision: 15, scale: 2 }).notNull(),
  endingBalance: decimal('ending_balance', { precision: 15, scale: 2 }).notNull(),
  inflationAdjustedBalance: decimal('inflation_adjusted_balance', { precision: 15, scale: 2 }),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  uniquePlanYear: unique('unique_plan_year').on(table.planId, table.scenarioId, table.year),
}));
```

---

## 5. Discovery Funds Cache Table

### Purpose
Cache scraped Discovery fund performance data to minimize scraping frequency.

### Schema
```sql
CREATE TABLE discovery_funds_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_name VARCHAR(255) NOT NULL,
  fund_code VARCHAR(50) UNIQUE NOT NULL,
  fund_type VARCHAR(50), -- 'Equity', 'Balanced', 'Bond', etc.

  cagr_1y DECIMAL(5, 2),
  cagr_3y DECIMAL(5, 2),
  cagr_5y DECIMAL(5, 2),
  cagr_10y DECIMAL(5, 2),
  volatility DECIMAL(5, 2),
  sharpe_ratio DECIMAL(5, 3),

  inception_date DATE,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT cagr_range CHECK (cagr_5y >= -50 AND cagr_5y <= 100)
);

CREATE INDEX idx_discovery_funds_code ON discovery_funds_cache(fund_code);
CREATE INDEX idx_discovery_funds_type ON discovery_funds_cache(fund_type);
CREATE INDEX idx_discovery_funds_updated ON discovery_funds_cache(last_updated DESC);
```

### Drizzle Schema
```typescript
import { pgTable, uuid, varchar, decimal, date, timestamp } from 'drizzle-orm/pg-core';

export const discoveryFundsCache = pgTable('discovery_funds_cache', {
  id: uuid('id').primaryKey().defaultRandom(),
  fundName: varchar('fund_name', { length: 255 }).notNull(),
  fundCode: varchar('fund_code', { length: 50 }).unique().notNull(),
  fundType: varchar('fund_type', { length: 50 }),

  cagr1y: decimal('cagr_1y', { precision: 5, scale: 2 }),
  cagr3y: decimal('cagr_3y', { precision: 5, scale: 2 }),
  cagr5y: decimal('cagr_5y', { precision: 5, scale: 2 }),
  cagr10y: decimal('cagr_10y', { precision: 5, scale: 2 }),
  volatility: decimal('volatility', { precision: 5, scale: 2 }),
  sharpeRatio: decimal('sharpe_ratio', { precision: 5, scale: 3 }),

  inceptionDate: date('inception_date'),
  scrapedAt: timestamp('scraped_at', { withTimezone: true }).defaultNow(),
  lastUpdated: timestamp('last_updated', { withTimezone: true }).defaultNow(),
});
```

---

## 6. SARS Tax Tables Cache Table

### Purpose
Cache SARS tax brackets and rates for accurate tax calculations.

### Schema
```sql
CREATE TABLE sars_tax_tables_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_year VARCHAR(10) UNIQUE NOT NULL, -- '2025/26'

  -- Income Tax Brackets (JSON array)
  income_tax_brackets JSONB NOT NULL,
  -- Example: [{"min": 0, "max": 237100, "rate": 18, "base_tax": 0}, ...]

  -- Tax Rebates
  primary_rebate DECIMAL(10, 2) NOT NULL,
  secondary_rebate DECIMAL(10, 2) NOT NULL, -- 65+
  tertiary_rebate DECIMAL(10, 2) NOT NULL, -- 75+

  -- RA Lump-Sum Tax Brackets (JSON array)
  ra_lump_sum_brackets JSONB NOT NULL,

  -- CGT
  cgt_inclusion_rate DECIMAL(5, 4) NOT NULL, -- 0.40
  cgt_annual_exclusion DECIMAL(10, 2) NOT NULL,

  -- Dividend Withholding Tax
  dividend_wht_rate DECIMAL(5, 4) NOT NULL, -- 0.20

  -- Interest Exemption
  interest_exempt_under65 DECIMAL(10, 2) NOT NULL,
  interest_exempt_over65 DECIMAL(10, 2) NOT NULL,

  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source VARCHAR(50) -- 'sars_website', 'fallback_hardcoded'
);

CREATE INDEX idx_sars_tax_year ON sars_tax_tables_cache(tax_year);
```

### Drizzle Schema
```typescript
import { pgTable, uuid, varchar, decimal, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const sarsTaxTablesCache = pgTable('sars_tax_tables_cache', {
  id: uuid('id').primaryKey().defaultRandom(),
  taxYear: varchar('tax_year', { length: 10 }).unique().notNull(),

  incomeTaxBrackets: jsonb('income_tax_brackets').notNull(),

  primaryRebate: decimal('primary_rebate', { precision: 10, scale: 2 }).notNull(),
  secondaryRebate: decimal('secondary_rebate', { precision: 10, scale: 2 }).notNull(),
  tertiaryRebate: decimal('tertiary_rebate', { precision: 10, scale: 2 }).notNull(),

  raLumpSumBrackets: jsonb('ra_lump_sum_brackets').notNull(),

  cgtInclusionRate: decimal('cgt_inclusion_rate', { precision: 5, scale: 4 }).notNull(),
  cgtAnnualExclusion: decimal('cgt_annual_exclusion', { precision: 10, scale: 2 }).notNull(),

  dividendWhtRate: decimal('dividend_wht_rate', { precision: 5, scale: 4 }).notNull(),

  interestExemptUnder65: decimal('interest_exempt_under65', { precision: 10, scale: 2 }).notNull(),
  interestExemptOver65: decimal('interest_exempt_over65', { precision: 10, scale: 2 }).notNull(),

  scrapedAt: timestamp('scraped_at', { withTimezone: true }).defaultNow(),
  lastUpdated: timestamp('last_updated', { withTimezone: true }).defaultNow(),
  source: varchar('source', { length: 50 }),
});
```

---

## 7. CPI Data Cache Table

### Purpose
Cache Stats SA CPI (Consumer Price Index) data for inflation calculations.

### Schema
```sql
CREATE TABLE cpi_data_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  cpi_value DECIMAL(6, 2) NOT NULL,
  annual_rate DECIMAL(5, 2) NOT NULL, -- Year-on-year %
  monthly_rate DECIMAL(5, 2), -- Month-on-month %
  category VARCHAR(100) DEFAULT 'All items', -- Headline CPI

  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source VARCHAR(50), -- 'stats_sa', 'sarb', 'fallback'

  CONSTRAINT unique_year_month UNIQUE (year, month, category)
);

CREATE INDEX idx_cpi_year_month ON cpi_data_cache(year DESC, month DESC);
CREATE INDEX idx_cpi_updated ON cpi_data_cache(last_updated DESC);
```

### Drizzle Schema
```typescript
import { pgTable, uuid, integer, decimal, varchar, timestamp, unique } from 'drizzle-orm/pg-core';

export const cpiDataCache = pgTable('cpi_data_cache', {
  id: uuid('id').primaryKey().defaultRandom(),
  year: integer('year').notNull(),
  month: integer('month').notNull(),
  cpiValue: decimal('cpi_value', { precision: 6, scale: 2 }).notNull(),
  annualRate: decimal('annual_rate', { precision: 5, scale: 2 }).notNull(),
  monthlyRate: decimal('monthly_rate', { precision: 5, scale: 2 }),
  category: varchar('category', { length: 100 }).default('All items'),

  scrapedAt: timestamp('scraped_at', { withTimezone: true }).defaultNow(),
  lastUpdated: timestamp('last_updated', { withTimezone: true }).defaultNow(),
  source: varchar('source', { length: 50 }),
}, (table) => ({
  uniqueYearMonth: unique('unique_year_month').on(table.year, table.month, table.category),
}));
```

---

## 8. Common Queries

### 8.1 Get User's Plans
```sql
SELECT * FROM retirement_plans
WHERE user_id = $1
ORDER BY created_at DESC;
```

### 8.2 Get Plan with Scenarios
```sql
SELECT
  p.*,
  json_agg(s.*) as scenarios
FROM retirement_plans p
LEFT JOIN scenarios s ON s.plan_id = p.id
WHERE p.id = $1
GROUP BY p.id;
```

### 8.3 Get Projection History for Chart
```sql
SELECT
  year,
  age,
  ending_balance,
  inflation_adjusted_balance,
  tax_paid
FROM projection_history
WHERE plan_id = $1
ORDER BY year ASC;
```

### 8.4 Get Fresh Discovery Fund Data
```sql
SELECT * FROM discovery_funds_cache
WHERE last_updated > NOW() - INTERVAL '24 hours'
  AND fund_type = $1
ORDER BY cagr_5y DESC;
```

### 8.5 Get Current SARS Tax Brackets
```sql
SELECT
  income_tax_brackets,
  primary_rebate,
  secondary_rebate
FROM sars_tax_tables_cache
WHERE tax_year = $1;
```

### 8.6 Get Latest CPI (Last 12 Months)
```sql
SELECT * FROM cpi_data_cache
WHERE category = 'All items'
ORDER BY year DESC, month DESC
LIMIT 12;
```

### 8.7 Calculate Rolling Average Inflation
```sql
SELECT AVG(annual_rate) as rolling_average_12m
FROM (
  SELECT annual_rate
  FROM cpi_data_cache
  WHERE category = 'All items'
  ORDER BY year DESC, month DESC
  LIMIT 12
) recent;
```

---

## 9. Indexes Summary

| Table | Index | Purpose |
|-------|-------|---------|
| users | email | Fast user lookup by email |
| users | auth_provider + auth_provider_id | OAuth provider lookup |
| retirement_plans | user_id | Get all plans for user |
| retirement_plans | created_at DESC | Recent plans first |
| retirement_plans | user_id + is_default | Find default plan |
| scenarios | plan_id | Get scenarios for plan |
| projection_history | plan_id | Get projections for plan |
| projection_history | year | Time-based filtering |
| discovery_funds_cache | fund_code | Fast fund lookup |
| discovery_funds_cache | last_updated DESC | Cache freshness check |
| sars_tax_tables_cache | tax_year | Get tax brackets for year |
| cpi_data_cache | year DESC + month DESC | Latest CPI data |

---

## 10. Migration Strategy

### Initial Migration
```sql
-- Run in order:
1. Create users table
2. Create retirement_plans table
3. Create scenarios table
4. Create projection_history table
5. Create discovery_funds_cache table
6. Create sars_tax_tables_cache table
7. Create cpi_data_cache table
8. Create all indexes
```

### Drizzle Migrations
```bash
# Generate migration
npx drizzle-kit generate:pg

# Push to database
npx drizzle-kit push:pg

# Run migration
npx drizzle-kit migrate
```

---

## 11. Data Retention Policy

| Table | Retention | Rationale |
|-------|-----------|-----------|
| users | Indefinite | Until account deletion |
| retirement_plans | Indefinite | User's saved plans |
| scenarios | Indefinite | Part of plan history |
| projection_history | 90 days | Can regenerate from plan |
| discovery_funds_cache | 30 days | Stale data removed |
| sars_tax_tables_cache | 5 years | Historical tax data |
| cpi_data_cache | 10 years | Historical inflation data |

### Cleanup Queries
```sql
-- Delete old projection history
DELETE FROM projection_history
WHERE created_at < NOW() - INTERVAL '90 days';

-- Delete stale Discovery fund data
DELETE FROM discovery_funds_cache
WHERE last_updated < NOW() - INTERVAL '30 days';

-- Keep last 10 years of CPI data
DELETE FROM cpi_data_cache
WHERE year < EXTRACT(YEAR FROM NOW()) - 10;
```

---

## 12. Security Considerations

### Row-Level Security (RLS)
```sql
-- Enable RLS on retirement_plans
ALTER TABLE retirement_plans ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own plans
CREATE POLICY user_plans_policy ON retirement_plans
  FOR ALL
  USING (user_id = current_user_id());

-- Similar policies for scenarios and projection_history
```

### Sensitive Data
- **No PII stored:** Email is only identifier
- **Financial data:** Encrypted at rest (Vercel Postgres default)
- **Session data:** Handled by auth provider (NextAuth/Clerk)

### Access Control
- All queries must include user_id filter
- API routes must validate user authentication
- No direct database access from client

---

## 13. Performance Optimization

### Connection Pooling
```typescript
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

neonConfig.fetchConnectionCache = true;

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);
```

### Query Optimization Tips
1. **Use indexes:** All foreign keys and date columns indexed
2. **Limit results:** Always use LIMIT for lists
3. **Avoid N+1:** Use JOIN or aggregate queries
4. **Cache aggressively:** 24h for funds, 30 days for CPI
5. **Batch operations:** Use transactions for multi-row inserts

---

## Conclusion

This schema provides a solid foundation for the AI Retirement Planner, balancing normalization with performance. The caching tables (discovery_funds_cache, sars_tax_tables_cache, cpi_data_cache) minimize external scraping while ensuring data freshness. All tables use UUIDs for primary keys to support distributed systems and enhance security.
