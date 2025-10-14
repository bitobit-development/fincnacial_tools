# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AI Retirement & Tax Optimization Planner** - A comprehensive retirement planning tool for the South African market featuring AI-powered financial advice, tax optimization, and real-time data integration.

Built with Next.js 15.5.4, React 19, TypeScript (strict mode), and Tailwind CSS v4. Uses Turbopack for faster builds.

## Development Commands

**Development:**
```bash
npm run dev                  # Start dev server (port 3000, Turbopack)
npm run build                # Production build (Turbopack)
npm start                    # Start production server
npm run lint                 # Run ESLint
```

**Testing:**
```bash
npm test                     # Run Vitest unit tests
npm run test:ui              # Vitest UI mode
npm run test:coverage        # Generate coverage report (80%+ thresholds)
npm run test:e2e             # Playwright E2E tests (auto-starts dev server)
npm run test:e2e:ui          # Playwright UI mode
npm run test:e2e:debug       # Playwright debug mode
npm run test:e2e:report      # Show Playwright HTML report
```

**Database (Drizzle ORM + Vercel Postgres):**
```bash
npm run db:generate          # Generate migrations from schema
npm run db:push              # Push schema changes to database
npm run db:studio            # Open Drizzle Studio (GUI)
npm run db:migrate           # Run migrations
```

**Port Management:**
If port 3000 is already in use: `npx kill-port 3000`

## Architecture

### Framework & Routing
- **Next.js 15.5.4** with App Router
- React Server Components by default (use `"use client"` directive for client components)
- File-based routing in `src/app/`
- API routes in `src/app/api/` using Route Handlers

### Key Pages
- `/` - Home page with retirement planner overview
- `/planner` - Interactive retirement calculator with charts
- `/advisor` - AI financial advisor chat interface (GPT-4o)
- `/showcase` - shadcn/ui component showcase

### Database & ORM
- **Vercel Postgres** (connection via `POSTGRES_URL` env var)
- **Drizzle ORM** for type-safe queries
- Schema: `src/lib/db/schema.ts` (11 tables)
- Connection: `src/lib/db/connection.ts`
- Queries: `src/lib/db/queries.ts`

**Key Tables:**
- `users` - User accounts
- `retirement_plans` - Saved retirement plans
- `scenarios` - Scenario comparisons
- `projection_history` - Year-by-year projections
- `discovery_funds_cache` - Discovery fund performance data
- `sars_tax_tables_cache` - SARS tax brackets and rates
- `cpi_data_cache` - Stats SA inflation data
- `ai_advisor_sessions` - AI advisor conversation sessions
- `ai_advisor_messages` - Chat message history
- `ai_advisor_recommendations` - Generated recommendations
- `ai_advisor_plan_overrides` - Financial advisor overrides

### Type System
All types defined in `src/types/index.ts`:
- `PlannerState` - User input for retirement calculation
- `Statistics` - Calculated results (balance, tax, depletion age)
- `TaxRates` - SARS tax brackets, rebates, CGT, dividend tax
- `DiscoveryFund` - Fund performance (CAGR, volatility, Sharpe ratio)
- `InflationData` - CPI data from Stats SA
- `ProjectionYear` - Year-by-year breakdown
- `TaxStrategy` - Optimization strategies (RA, TFSA, brokerage)
- `Scenario` - Scenario comparison (optimistic/pessimistic/conservative)
- `ReportDocument` - AI-generated retirement report

### Calculation Engine
Located in `src/lib/calculations/`:
- `core.ts` - Future Value (FV), Present Value (PV), CAGR, real return
- `tax.ts` - Income tax, CGT, dividend tax, RA lump sum tax (2025/26 SARS tables)
- `projections.ts` - Year-by-year retirement projections
- `statistics.ts` - Summary statistics (total contributed/withdrawn, depletion age)
- All calculations have Vitest tests in `__tests__/`

### AI Advisor (GPT-4o / OpenAI)
**Service:** `src/lib/services/openaiAdvisor.ts`
- Model: `gpt-4o` (configurable via `OPENAI_API_KEY`)
- Persona: "Thando Nkosi" - CFP® with 15 years SA retirement planning experience
- 45-question discovery framework (10 phases)
- Function calling for calculations: `calculate_retirement_projection`, `optimize_tax`, `calculate_drawdown_strategy`, `generate_recommendations`
- Conversational style (2-4 questions per turn)
- Full 2025/26 SARS tax law knowledge

**Calculation Support:** `src/lib/services/aiAdvisorCalculations.ts`

### Data Scrapers
Located in `src/lib/scrapers/`:
- `discoveryFunds.ts` - Discovery fund performance (Playwright MCP)
- `sarsTaxTables.ts` - SARS tax tables (Brightdata MCP)
- `statsSaCpi.ts` - Stats SA CPI data (Brightdata MCP)
- All scrapers cache data in Postgres

### UI Components

**shadcn/ui (Radix UI):** `src/components/ui/`
- Installed: button, card, input, label, slider, tabs, select, table, badge, tooltip, sheet, dialog, accordion, separator
- Add more: `npx shadcn@latest add [component-name]`

**Custom Components:** `src/components/custom/`
- `CurrencyInput` - Rand input with formatting
- `SliderWithInput` - Combined slider + numeric input
- `AgeSlider` - Age range selector
- `FundSelector` - Discovery fund dropdown
- `StatisticsGrid` - Results dashboard
- `StatCard` - Individual stat display
- `ProjectionChart` - Recharts line chart (balance over time)
- `TaxBreakdownChart` - Recharts bar chart (tax breakdown)

**Planner Components:** `src/components/planner/`
- `PlannerInputPanel` - Left sidebar with inputs
- `PlannerResultsPanel` - Right panel with charts and stats

**Advisor Components:** `src/components/advisor/`
- `ChatMessage` - Chat bubble (user/assistant)
- `ChatInput` - Message input with send button

### Styling & Theming
- **Tailwind CSS v4** (PostCSS plugin: `@tailwindcss/postcss`)
- Global styles: `src/app/globals.css`
- CSS custom properties for theming (light/dark mode)
- Dark mode: `prefers-color-scheme` media query
- Utility: `src/lib/utils.ts` (`cn()` function from `clsx` + `tailwind-merge`)

### Testing

**Unit/Integration (Vitest):**
- Config: `vitest.config.ts`
- Environment: jsdom
- Setup: `src/test/setup.ts`
- Coverage thresholds: 80% lines/functions/statements, 75% branches
- Run tests: `npm test`

**E2E (Playwright):**
- Config: `playwright.config.ts`
- Tests: `tests/e2e/`
- Auto-starts dev server on `http://localhost:3000`
- Projects: Chromium, Mobile Chrome, Mobile Safari, Tablet (iPad Pro)
- Run tests: `npm run test:e2e`

## Key Configuration Files

- `next.config.ts` - Next.js config (TypeScript)
- `tsconfig.json` - TypeScript compiler (strict mode, `@/*` alias)
- `eslint.config.mjs` - ESLint flat config (Next.js recommended)
- `postcss.config.mjs` - PostCSS for Tailwind CSS v4
- `drizzle.config.ts` - Drizzle ORM config
- `vitest.config.ts` - Vitest test runner config
- `playwright.config.ts` - Playwright E2E config

## Environment Variables

Required in `.env.local`:
- `POSTGRES_URL` - Vercel Postgres connection string
- `OPENAI_API_KEY` - OpenAI API key (GPT-4o)
- Optional: `ANTHROPIC_API_KEY` (Claude), `OPENAI_MODEL` (default: gpt-4o)

## South African Financial Context

**SARS Tax Year 2025/26:**
- Income tax brackets: 18%-45% (7 brackets)
- Tax rebates: Primary R17,235, Secondary R9,444, Tertiary R3,145
- RA contribution limit: Lesser of R350,000/year OR 27.5% of gross income
- TFSA: R36,000/year, R500,000 lifetime
- Retirement lump sum tax: 0%-36% (R500k tax-free)
- CGT: 40% inclusion rate, R40k annual exclusion
- Dividend tax: 20% withholding

**Two-Pot System (Sept 2024):**
- Savings pot: 1/3 of contributions (accessible before retirement, 1x/year, min R2k)
- Retirement pot: 2/3 of contributions (only at retirement)
- Vested pot: Balance before Sept 1, 2024 (old rules)

## Important Notes

- All monetary values in South African Rand (R)
- Turbopack enabled for dev/build (`--turbopack` flag)
- React 19 has breaking changes from React 18
- Path alias `@/*` maps to `./src/*`
- Server Components by default (mark with `"use client"` for interactivity)
- Database migrations required after schema changes (`npm run db:generate && npm run db:push`)
- Scrapers cache data for 24 hours to avoid rate limits
