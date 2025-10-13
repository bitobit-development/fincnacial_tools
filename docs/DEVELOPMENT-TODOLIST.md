# Development TODO List - AI Retirement Planner

**Project:** AI Retirement & Tax Optimization Planner
**Version:** 1.0
**Last Updated:** 2025-10-13
**Status:** Planning Phase

---

## Overview

This document breaks down the 19-phase development plan into granular, actionable tasks with clear ownership, dependencies, and complexity estimates.

### Legend
- **Complexity:** Simple (S), Medium (M), Complex (C)
- **Agent Types:** tal-design, adi-fullstack, oren-backend, gal-database, uri-testing, maya-code-review, yael-technical-docs, amit-api-docs, noam-prompt-engineering
- **Status:** 🔴 Not Started | 🟡 In Progress | 🟢 Complete

---

## Phase 1: Foundation Setup (Week 1)

### 1.1 Project Infrastructure
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F1.1.1 | Initialize Git repository with proper .gitignore | adi-fullstack | S | None | 🟢 |
| F1.1.2 | Configure TypeScript with strict mode and path aliases | adi-fullstack | S | F1.1.1 | 🟢 |
| F1.1.3 | Set up Next.js 15.5.4 with App Router and Turbopack | adi-fullstack | S | F1.1.2 | 🟢 |
| F1.1.4 | Configure Tailwind CSS v4 with PostCSS | adi-fullstack | S | F1.1.3 | 🟢 |
| F1.1.5 | Set up ESLint with Next.js and TypeScript rules | adi-fullstack | S | F1.1.4 | 🟢 |
| F1.1.6 | Configure dark mode support via CSS custom properties | tal-design | M | F1.1.4 | 🔴 |
| F1.1.7 | Create project folder structure (src/app, src/components, src/lib, src/types) | adi-fullstack | S | F1.1.5 | 🔴 |

### 1.2 Development Environment
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F1.2.1 | Set up environment variables template (.env.example) | adi-fullstack | S | F1.1.7 | 🔴 |
| F1.2.2 | Configure development server on port 3000 | adi-fullstack | S | F1.2.1 | 🔴 |
| F1.2.3 | Create npm scripts for dev, build, start, lint | adi-fullstack | S | F1.2.2 | 🟢 |
| F1.2.4 | Document local development setup in README | yael-technical-docs | S | F1.2.3 | 🔴 |

**Quality Gate 1:** ✓ Project builds without errors ✓ ESLint passes ✓ Dev server runs on port 3000

---

## Phase 2: shadcn/ui Integration (Week 1-2)

### 2.1 shadcn/ui Setup
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F2.1.1 | Install shadcn/ui CLI and initialize configuration | adi-fullstack | M | F1.1.7 | 🔴 |
| F2.1.2 | Configure components.json with Tailwind CSS v4 compatibility | adi-fullstack | M | F2.1.1 | 🔴 |
| F2.1.3 | Set up cn() utility function for class merging | adi-fullstack | S | F2.1.2 | 🔴 |
| F2.1.4 | Create lib/utils.ts with helper functions | adi-fullstack | S | F2.1.3 | 🔴 |
| F2.1.5 | Configure theme colors in globals.css | tal-design | M | F2.1.4 | 🔴 |

### 2.2 Core Component Installation
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F2.2.1 | Install Button component | adi-fullstack | S | F2.1.5 | 🔴 |
| F2.2.2 | Install Card component | adi-fullstack | S | F2.1.5 | 🔴 |
| F2.2.3 | Install Input component | adi-fullstack | S | F2.1.5 | 🔴 |
| F2.2.4 | Install Slider component | adi-fullstack | S | F2.1.5 | 🔴 |
| F2.2.5 | Install Label component | adi-fullstack | S | F2.1.5 | 🔴 |
| F2.2.6 | Install Tabs component | adi-fullstack | S | F2.1.5 | 🔴 |
| F2.2.7 | Install Select component | adi-fullstack | S | F2.1.5 | 🔴 |
| F2.2.8 | Install Table component | adi-fullstack | S | F2.1.5 | 🔴 |
| F2.2.9 | Install Badge component | adi-fullstack | S | F2.1.5 | 🔴 |
| F2.2.10 | Install Tooltip component | adi-fullstack | S | F2.1.5 | 🔴 |

### 2.3 Layout Components
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F2.3.1 | Install Sheet component (for mobile navigation) | adi-fullstack | M | F2.2.1 | 🔴 |
| F2.3.2 | Install Dialog component | adi-fullstack | M | F2.2.1 | 🔴 |
| F2.3.3 | Install Accordion component | adi-fullstack | M | F2.2.1 | 🔴 |
| F2.3.4 | Install Separator component | adi-fullstack | S | F2.2.1 | 🔴 |

### 2.4 Component Testing
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F2.4.1 | Create component showcase page for testing | tal-design | M | F2.3.4 | 🔴 |
| F2.4.2 | Verify all components render correctly | uri-testing | M | F2.4.1 | 🔴 |
| F2.4.3 | Test dark mode compatibility for all components | uri-testing | M | F2.4.2 | 🔴 |
| F2.4.4 | Test accessibility (keyboard navigation, ARIA) | uri-testing | C | F2.4.3 | 🔴 |

**Quality Gate 2:** ✓ All shadcn components installed ✓ Components render in light/dark mode ✓ WCAG 2.1 AA compliance ✓ Component showcase page functional

---

## Phase 3: TypeScript Type System (Week 2)

### 3.1 Core Types Definition
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F3.1.1 | Define PlannerState interface (see DATABASE-SCHEMA.md) | adi-fullstack | M | F1.1.7 | 🔴 |
| F3.1.2 | Define Statistics interface | adi-fullstack | M | F3.1.1 | 🔴 |
| F3.1.3 | Define TaxBracket and TaxRates types | adi-fullstack | M | F3.1.1 | 🔴 |
| F3.1.4 | Define DiscoveryFund interface | adi-fullstack | M | F3.1.1 | 🔴 |
| F3.1.5 | Define InflationData interface | adi-fullstack | M | F3.1.1 | 🔴 |
| F3.1.6 | Define ReportDocument interface | adi-fullstack | C | F3.1.2 | 🔴 |

### 3.2 Calculation Types
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F3.2.1 | Define ProjectionYear type (yearly breakdown) | adi-fullstack | M | F3.1.2 | 🔴 |
| F3.2.2 | Define TaxStrategy type (RA/TFSA/Brokerage mix) | adi-fullstack | M | F3.1.3 | 🔴 |
| F3.2.3 | Define WithdrawalPlan type | adi-fullstack | M | F3.2.1 | 🔴 |
| F3.2.4 | Define ScenarioComparison type | adi-fullstack | M | F3.2.2 | 🔴 |

### 3.3 API Response Types
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F3.3.1 | Define ScraperResponse generic type | adi-fullstack | M | F3.1.4 | 🔴 |
| F3.3.2 | Define APIError type with status codes | adi-fullstack | S | F3.3.1 | 🔴 |
| F3.3.3 | Create Zod schemas for runtime validation | adi-fullstack | C | F3.3.2 | 🔴 |

**Quality Gate 3:** ✓ All types compile without errors ✓ No `any` types (justified exceptions only) ✓ Zod schemas validate sample data

---

## Phase 4: Database Schema & Setup (Week 2-3)

### 4.1 Vercel Postgres Setup
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F4.1.1 | Install @vercel/postgres and drizzle-orm | gal-database | M | F1.1.7 | 🔴 |
| F4.1.2 | Create drizzle.config.ts | gal-database | M | F4.1.1 | 🔴 |
| F4.1.3 | Set up database connection pooling | gal-database | M | F4.1.2 | 🔴 |
| F4.1.4 | Configure environment variables for database URL | gal-database | S | F4.1.3 | 🔴 |

### 4.2 Schema Implementation
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F4.2.1 | Create users table schema | gal-database | M | F4.1.4 | 🔴 |
| F4.2.2 | Create retirement_plans table schema | gal-database | M | F4.1.4 | 🔴 |
| F4.2.3 | Create scenarios table schema | gal-database | M | F4.1.4 | 🔴 |
| F4.2.4 | Create discovery_funds_cache table | gal-database | M | F4.1.4 | 🔴 |
| F4.2.5 | Create sars_tax_tables_cache table | gal-database | M | F4.1.4 | 🔴 |
| F4.2.6 | Create cpi_data_cache table | gal-database | M | F4.1.4 | 🔴 |
| F4.2.7 | Create projection_history table | gal-database | M | F4.1.4 | 🔴 |

### 4.3 Migrations & Indexes
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F4.3.1 | Create initial migration files | gal-database | M | F4.2.7 | 🔴 |
| F4.3.2 | Add indexes for user_id and created_at | gal-database | M | F4.3.1 | 🔴 |
| F4.3.3 | Add composite indexes for common queries | gal-database | M | F4.3.2 | 🔴 |
| F4.3.4 | Create database seeding script for dev environment | gal-database | M | F4.3.3 | 🔴 |

### 4.4 Database Testing
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F4.4.1 | Test connection pooling under load | uri-testing | C | F4.3.4 | 🔴 |
| F4.4.2 | Verify foreign key constraints | uri-testing | M | F4.4.1 | 🔴 |
| F4.4.3 | Test migration rollback scenarios | uri-testing | M | F4.4.2 | 🔴 |
| F4.4.4 | Benchmark query performance on seeded data | uri-testing | M | F4.4.3 | 🔴 |

**Quality Gate 4:** ✓ All migrations run successfully ✓ Indexes improve query performance by >50% ✓ No N+1 query issues ✓ Connection pooling handles 100+ concurrent requests

---

## Phase 5: MCP Scraper Implementation (Week 3-4)

### 5.1 Discovery Funds Scraper (Playwright MCP)
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F5.1.1 | Research Discovery fund fact sheet page structure | oren-backend | M | None | 🔴 |
| F5.1.2 | Create Playwright navigation script to fund pages | oren-backend | C | F5.1.1 | 🔴 |
| F5.1.3 | Extract CAGR data from fact sheets | oren-backend | C | F5.1.2 | 🔴 |
| F5.1.4 | Extract volatility and Sharpe ratio metrics | oren-backend | C | F5.1.2 | 🔴 |
| F5.1.5 | Extract fund name, ISIN, and metadata | oren-backend | M | F5.1.2 | 🔴 |
| F5.1.6 | Handle pagination for multiple funds | oren-backend | M | F5.1.5 | 🔴 |
| F5.1.7 | Implement error handling and retry logic | oren-backend | M | F5.1.6 | 🔴 |
| F5.1.8 | Cache scraped data in discovery_funds_cache table | oren-backend | M | F5.1.7, F4.2.4 | 🔴 |
| F5.1.9 | Implement TTL-based cache invalidation (24h) | oren-backend | M | F5.1.8 | 🔴 |
| F5.1.10 | Create API route /api/funds/discovery | adi-fullstack | M | F5.1.9 | 🔴 |

### 5.2 SARS Tax Tables Scraper (Brightdata MCP)
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F5.2.1 | Research SARS 2025/26 tax table page structure | oren-backend | M | None | 🔴 |
| F5.2.2 | Create Brightdata scraper config for SARS website | oren-backend | C | F5.2.1 | 🔴 |
| F5.2.3 | Extract income tax brackets (18% - 45%) | oren-backend | C | F5.2.2 | 🔴 |
| F5.2.4 | Extract RA lump-sum tax brackets | oren-backend | C | F5.2.2 | 🔴 |
| F5.2.5 | Extract CGT inclusion rates and rebates | oren-backend | M | F5.2.2 | 🔴 |
| F5.2.6 | Extract dividend withholding tax (20%) | oren-backend | M | F5.2.2 | 🔴 |
| F5.2.7 | Extract interest exemption thresholds | oren-backend | M | F5.2.2 | 🔴 |
| F5.2.8 | Parse tables into structured JSON | oren-backend | M | F5.2.7 | 🔴 |
| F5.2.9 | Cache scraped data in sars_tax_tables_cache table | oren-backend | M | F5.2.8, F4.2.5 | 🔴 |
| F5.2.10 | Create API route /api/tax/sars-tables | adi-fullstack | M | F5.2.9 | 🔴 |

### 5.3 Stats SA CPI Scraper (Brightdata MCP)
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F5.3.1 | Research Stats SA CPI data page structure | oren-backend | M | None | 🔴 |
| F5.3.2 | Create Brightdata scraper config for Stats SA | oren-backend | C | F5.3.1 | 🔴 |
| F5.3.3 | Extract latest CPI percentage | oren-backend | M | F5.3.2 | 🔴 |
| F5.3.4 | Extract historical CPI data (last 12 months) | oren-backend | M | F5.3.3 | 🔴 |
| F5.3.5 | Calculate rolling average inflation rate | oren-backend | M | F5.3.4 | 🔴 |
| F5.3.6 | Cache scraped data in cpi_data_cache table | oren-backend | M | F5.3.5, F4.2.6 | 🔴 |
| F5.3.7 | Create API route /api/inflation/cpi | adi-fullstack | M | F5.3.6 | 🔴 |

### 5.4 Scraper Testing & Monitoring
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F5.4.1 | Test Discovery scraper with 5+ different funds | uri-testing | M | F5.1.10 | 🔴 |
| F5.4.2 | Test SARS scraper with 2025/26 tax year data | uri-testing | M | F5.2.10 | 🔴 |
| F5.4.3 | Test CPI scraper with historical data validation | uri-testing | M | F5.3.7 | 🔴 |
| F5.4.4 | Implement logging for scraper failures | oren-backend | M | F5.4.3 | 🔴 |
| F5.4.5 | Create scraper health check endpoint | oren-backend | M | F5.4.4 | 🔴 |
| F5.4.6 | Document scraper usage in API docs | amit-api-docs | M | F5.4.5 | 🔴 |

**Quality Gate 5:** ✓ All scrapers successfully extract data ✓ Cache hit rate >80% ✓ Error handling covers network failures ✓ Data validation catches malformed responses ✓ API routes return correct schemas

---

## Phase 6: Financial Calculation Engine (Week 4-5)

### 6.1 Core Projection Logic
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F6.1.1 | Implement Future Value (FV) calculation | oren-backend | M | F3.1.1 | 🔴 |
| F6.1.2 | Implement Present Value (PV) calculation | oren-backend | M | F6.1.1 | 🔴 |
| F6.1.3 | Implement compound annual growth rate (CAGR) | oren-backend | M | F6.1.2 | 🔴 |
| F6.1.4 | Create year-by-year projection function | oren-backend | C | F6.1.3 | 🔴 |
| F6.1.5 | Implement inflation-adjusted returns (real vs nominal) | oren-backend | C | F6.1.4 | 🔴 |

### 6.2 Tax Calculation Engine
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F6.2.1 | Implement progressive income tax calculation | oren-backend | C | F5.2.10 | 🔴 |
| F6.2.2 | Implement RA lump-sum tax calculation (R550k tax-free) | oren-backend | C | F6.2.1 | 🔴 |
| F6.2.3 | Implement CGT calculation (40% inclusion) | oren-backend | M | F6.2.1 | 🔴 |
| F6.2.4 | Implement dividend withholding tax (20%) | oren-backend | M | F6.2.1 | 🔴 |
| F6.2.5 | Implement interest exemption logic (age-based) | oren-backend | M | F6.2.1 | 🔴 |
| F6.2.6 | Create unified tax calculator combining all types | oren-backend | C | F6.2.5 | 🔴 |

### 6.3 Withdrawal & Depletion Logic
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F6.3.1 | Implement withdrawal schedule calculator | oren-backend | M | F6.1.4 | 🔴 |
| F6.3.2 | Calculate fund depletion age | oren-backend | M | F6.3.1 | 🔴 |
| F6.3.3 | Calculate wealth retention ratio | oren-backend | M | F6.3.2 | 🔴 |
| F6.3.4 | Calculate effective tax rate over lifetime | oren-backend | M | F6.3.3, F6.2.6 | 🔴 |

### 6.4 Statistics Aggregation
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F6.4.1 | Aggregate total contributed amount | oren-backend | S | F6.1.4 | 🔴 |
| F6.4.2 | Calculate projected value at retirement | oren-backend | M | F6.1.4 | 🔴 |
| F6.4.3 | Aggregate total withdrawn amount | oren-backend | M | F6.3.1 | 🔴 |
| F6.4.4 | Aggregate total tax paid | oren-backend | M | F6.2.6 | 🔴 |
| F6.4.5 | Calculate net after-tax income | oren-backend | M | F6.4.3, F6.4.4 | 🔴 |
| F6.4.6 | Create Statistics object assembler | oren-backend | M | F6.4.5 | 🔴 |

### 6.5 Calculation Testing
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F6.5.1 | Write unit tests for FV/PV/CAGR functions | uri-testing | M | F6.1.5 | 🔴 |
| F6.5.2 | Write unit tests for tax calculations | uri-testing | C | F6.2.6 | 🔴 |
| F6.5.3 | Write integration tests for full projection | uri-testing | C | F6.4.6 | 🔴 |
| F6.5.4 | Validate against known retirement scenarios | uri-testing | C | F6.5.3 | 🔴 |
| F6.5.5 | Performance test for 60-year projections | uri-testing | M | F6.5.4 | 🔴 |

**Quality Gate 6:** ✓ All calculation tests pass ✓ Tax calculations match SARS examples ✓ Projections handle edge cases (zero balance, high inflation) ✓ Performance <100ms for 60-year projection

---

## Phase 7: Planner UI - Input Form (Week 5-6)

### 7.1 Layout & Structure
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F7.1.1 | Design responsive layout (mobile-first) | tal-design | M | F2.4.4 | 🔴 |
| F7.1.2 | Create main planner page component | tal-design | M | F7.1.1 | 🔴 |
| F7.1.3 | Design card-based section layout | tal-design | M | F7.1.2 | 🔴 |
| F7.1.4 | Implement sticky header with app branding | tal-design | M | F7.1.3 | 🔴 |

### 7.2 Age Input Controls
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F7.2.1 | Create current age slider (18-80) | tal-design | M | F7.1.4 | 🔴 |
| F7.2.2 | Create retirement age slider (40-100) | tal-design | M | F7.2.1 | 🔴 |
| F7.2.3 | Add validation: retirement age > current age | adi-fullstack | M | F7.2.2 | 🔴 |
| F7.2.4 | Display years until retirement | tal-design | S | F7.2.3 | 🔴 |

### 7.3 Financial Input Controls
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F7.3.1 | Create starting RA balance input (currency formatted) | tal-design | M | F7.2.4 | 🔴 |
| F7.3.2 | Create monthly contribution input | tal-design | M | F7.3.1 | 🔴 |
| F7.3.3 | Create annual return slider (0-20%) | tal-design | M | F7.3.2 | 🔴 |
| F7.3.4 | Create inflation slider (0-15%) | tal-design | M | F7.3.3 | 🔴 |
| F7.3.5 | Create drawdown rate slider (2-10%) | tal-design | M | F7.3.4 | 🔴 |
| F7.3.6 | Create target monthly income input (today's Rand) | tal-design | M | F7.3.5 | 🔴 |

### 7.4 Discovery Fund Selection
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F7.4.1 | Create fund selection dropdown | tal-design | M | F7.3.6 | 🔴 |
| F7.4.2 | Integrate with /api/funds/discovery endpoint | adi-fullstack | M | F7.4.1, F5.1.10 | 🔴 |
| F7.4.3 | Display fund CAGR, volatility, Sharpe ratio | tal-design | M | F7.4.2 | 🔴 |
| F7.4.4 | Auto-populate annual return slider based on fund CAGR | adi-fullstack | M | F7.4.3 | 🔴 |

### 7.5 Form State Management
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F7.5.1 | Create PlannerState React context | adi-fullstack | M | F3.1.1 | 🔴 |
| F7.5.2 | Implement debounced input updates (<250ms) | adi-fullstack | M | F7.5.1 | 🔴 |
| F7.5.3 | Add form validation with error messages | adi-fullstack | M | F7.5.2 | 🔴 |
| F7.5.4 | Implement local storage persistence | adi-fullstack | M | F7.5.3 | 🔴 |
| F7.5.5 | Add "Reset to Defaults" button | tal-design | S | F7.5.4 | 🔴 |

### 7.6 UI Testing
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F7.6.1 | Test responsive behavior (mobile, tablet, desktop) | uri-testing | M | F7.5.5 | 🔴 |
| F7.6.2 | Test slider interactions and value updates | uri-testing | M | F7.6.1 | 🔴 |
| F7.6.3 | Test form validation error states | uri-testing | M | F7.6.2 | 🔴 |
| F7.6.4 | Test keyboard navigation and accessibility | uri-testing | M | F7.6.3 | 🔴 |
| F7.6.5 | Test local storage persistence | uri-testing | M | F7.6.4 | 🔴 |

**Quality Gate 7:** ✓ All inputs render correctly on all screen sizes ✓ Slider updates trigger recalculation <250ms ✓ Form validation prevents invalid submissions ✓ WCAG 2.1 AA compliance ✓ Local storage saves/restores state

---

## Phase 8: Planner UI - Results Display (Week 6-7)

### 8.1 Statistics Cards
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F8.1.1 | Design statistics card layout | tal-design | M | F7.6.5 | 🔴 |
| F8.1.2 | Create "Total Contributed" card | tal-design | M | F8.1.1 | 🔴 |
| F8.1.3 | Create "Projected Value at Retirement" card | tal-design | M | F8.1.1 | 🔴 |
| F8.1.4 | Create "Total Withdrawn" card | tal-design | M | F8.1.1 | 🔴 |
| F8.1.5 | Create "Total Tax Paid" card | tal-design | M | F8.1.1 | 🔴 |
| F8.1.6 | Create "Net After-Tax Income" card | tal-design | M | F8.1.1 | 🔴 |
| F8.1.7 | Create "Fund Depletion Age" card with warning states | tal-design | M | F8.1.1 | 🔴 |
| F8.1.8 | Create "Wealth Retention Ratio" card with progress bar | tal-design | M | F8.1.1 | 🔴 |
| F8.1.9 | Create "Effective Tax Rate" card | tal-design | M | F8.1.1 | 🔴 |

### 8.2 Chart Components
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F8.2.1 | Install Recharts library | adi-fullstack | S | F8.1.9 | 🔴 |
| F8.2.2 | Create projection line chart (balance over time) | tal-design | C | F8.2.1 | 🔴 |
| F8.2.3 | Create contributions vs withdrawals area chart | tal-design | C | F8.2.2 | 🔴 |
| F8.2.4 | Create tax breakdown stacked bar chart | tal-design | C | F8.2.2 | 🔴 |
| F8.2.5 | Add chart legends and tooltips | tal-design | M | F8.2.4 | 🔴 |
| F8.2.6 | Implement responsive chart sizing | tal-design | M | F8.2.5 | 🔴 |

### 8.3 Results Integration
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F8.3.1 | Connect statistics cards to calculation engine | adi-fullstack | M | F8.1.9, F6.4.6 | 🔴 |
| F8.3.2 | Connect charts to projection data | adi-fullstack | M | F8.2.6, F6.1.4 | 🔴 |
| F8.3.3 | Add loading states during calculation | tal-design | M | F8.3.2 | 🔴 |
| F8.3.4 | Add error states for calculation failures | tal-design | M | F8.3.3 | 🔴 |
| F8.3.5 | Format currency values with commas and 2 decimals | adi-fullstack | S | F8.3.4 | 🔴 |

### 8.4 Results Testing
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F8.4.1 | Test statistics card updates on input change | uri-testing | M | F8.3.5 | 🔴 |
| F8.4.2 | Test chart rendering with various data ranges | uri-testing | M | F8.4.1 | 🔴 |
| F8.4.3 | Test responsive chart behavior | uri-testing | M | F8.4.2 | 🔴 |
| F8.4.4 | Test loading and error states | uri-testing | M | F8.4.3 | 🔴 |

**Quality Gate 8:** ✓ Statistics cards update in <250ms ✓ Charts render correctly with 60+ data points ✓ Responsive behavior on all screen sizes ✓ Loading/error states work correctly

---

## Phase 9: Tax Optimization Advisor (Week 7-8)

### 9.1 Strategy Generation Engine
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F9.1.1 | Define TaxStrategy optimization algorithm | oren-backend | C | F6.2.6 | 🔴 |
| F9.1.2 | Generate RA-only strategy (baseline) | oren-backend | M | F9.1.1 | 🔴 |
| F9.1.3 | Generate RA + TFSA strategy | oren-backend | C | F9.1.2 | 🔴 |
| F9.1.4 | Generate RA + TFSA + Brokerage strategy | oren-backend | C | F9.1.3 | 🔴 |
| F9.1.5 | Calculate tax savings for each strategy | oren-backend | M | F9.1.4 | 🔴 |
| F9.1.6 | Rank strategies by wealth retention ratio | oren-backend | M | F9.1.5 | 🔴 |
| F9.1.7 | Create API route /api/optimize/strategies | adi-fullstack | M | F9.1.6 | 🔴 |

### 9.2 Strategy Comparison UI
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F9.2.1 | Design strategy comparison table layout | tal-design | M | F9.1.7 | 🔴 |
| F9.2.2 | Create strategy comparison cards (side-by-side) | tal-design | M | F9.2.1 | 🔴 |
| F9.2.3 | Display RA, TFSA, Brokerage allocation percentages | tal-design | M | F9.2.2 | 🔴 |
| F9.2.4 | Highlight recommended strategy with badge | tal-design | M | F9.2.3 | 🔴 |
| F9.2.5 | Show tax savings delta vs baseline | tal-design | M | F9.2.4 | 🔴 |

### 9.3 AI Explanation Integration
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F9.3.1 | Design AI prompt template for strategy explanation | noam-prompt-engineering | M | F9.2.5 | 🔴 |
| F9.3.2 | Create API route /api/ai/explain-strategy | adi-fullstack | M | F9.3.1 | 🔴 |
| F9.3.3 | Integrate Claude API for generating explanations | adi-fullstack | C | F9.3.2 | 🔴 |
| F9.3.4 | Display AI explanation in expandable section | tal-design | M | F9.3.3 | 🔴 |
| F9.3.5 | Add streaming response for real-time feedback | adi-fullstack | C | F9.3.4 | 🔴 |

### 9.4 Optimization Testing
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F9.4.1 | Test strategy generation with various inputs | uri-testing | M | F9.3.5 | 🔴 |
| F9.4.2 | Validate tax savings calculations | uri-testing | M | F9.4.1 | 🔴 |
| F9.4.3 | Test AI explanation generation | uri-testing | M | F9.4.2 | 🔴 |
| F9.4.4 | Test UI responsiveness with 3+ strategies | uri-testing | M | F9.4.3 | 🔴 |

**Quality Gate 9:** ✓ Generates ≥3 unique strategies ✓ Tax savings calculations are accurate ✓ AI explanations are relevant and clear ✓ Strategy comparison UI is responsive

---

## Phase 10: Scenario Comparison (Week 8-9)

### 10.1 Scenario Management
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F10.1.1 | Create scenario save functionality | adi-fullstack | M | F4.2.3 | 🔴 |
| F10.1.2 | Create scenario load functionality | adi-fullstack | M | F10.1.1 | 🔴 |
| F10.1.3 | Create scenario delete functionality | adi-fullstack | M | F10.1.2 | 🔴 |
| F10.1.4 | Create scenario rename functionality | adi-fullstack | M | F10.1.3 | 🔴 |
| F10.1.5 | Create API routes for scenario CRUD operations | adi-fullstack | M | F10.1.4 | 🔴 |

### 10.2 Comparison UI
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F10.2.1 | Design scenario comparison page layout | tal-design | M | F10.1.5 | 🔴 |
| F10.2.2 | Create scenario selector dropdown | tal-design | M | F10.2.1 | 🔴 |
| F10.2.3 | Create side-by-side comparison table | tal-design | C | F10.2.2 | 🔴 |
| F10.2.4 | Add visual indicators for better/worse metrics | tal-design | M | F10.2.3 | 🔴 |
| F10.2.5 | Create overlay chart comparing projections | tal-design | C | F10.2.4 | 🔴 |

### 10.3 Scenario Testing
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F10.3.1 | Test scenario save/load/delete operations | uri-testing | M | F10.2.5 | 🔴 |
| F10.3.2 | Test comparison table with 2-5 scenarios | uri-testing | M | F10.3.1 | 🔴 |
| F10.3.3 | Test overlay chart rendering | uri-testing | M | F10.3.2 | 🔴 |

**Quality Gate 10:** ✓ Scenarios persist correctly ✓ Comparison table highlights differences ✓ Overlay chart renders up to 5 scenarios ✓ CRUD operations are stable

---

## Phase 11: AI Report Generation (Week 9-10)

### 11.1 Report Data Assembly
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F11.1.1 | Define ReportDocument schema | adi-fullstack | M | F3.1.6 | 🔴 |
| F11.1.2 | Create report data aggregation function | oren-backend | M | F11.1.1 | 🔴 |
| F11.1.3 | Include all statistics, projections, and charts | oren-backend | M | F11.1.2 | 🔴 |
| F11.1.4 | Add scenario comparison data to report | oren-backend | M | F11.1.3 | 🔴 |

### 11.2 Claude Report Generation
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F11.2.1 | Design Claude prompt for report assembly | noam-prompt-engineering | C | F11.1.4 | 🔴 |
| F11.2.2 | Create API route /api/ai/generate-report | adi-fullstack | M | F11.2.1 | 🔴 |
| F11.2.3 | Implement Claude API integration | adi-fullstack | C | F11.2.2 | �004 |
| F11.2.4 | Parse Claude response into structured sections | adi-fullstack | M | F11.2.3 | 🔴 |
| F11.2.5 | Add executive summary generation | adi-fullstack | M | F11.2.4 | 🔴 |
| F11.2.6 | Add tax optimization recommendations | adi-fullstack | M | F11.2.5 | 🔴 |
| F11.2.7 | Add risk assessment section | adi-fullstack | M | F11.2.6 | 🔴 |

### 11.3 Report UI
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F11.3.1 | Design report preview layout | tal-design | M | F11.2.7 | 🔴 |
| F11.3.2 | Create report sections (Executive Summary, Projections, Tax, Recommendations) | tal-design | M | F11.3.1 | 🔴 |
| F11.3.3 | Add "Generate Report" button with loading state | tal-design | M | F11.3.2 | 🔴 |
| F11.3.4 | Display generated report with formatted text | tal-design | M | F11.3.3 | 🔴 |

### 11.4 Report Testing
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F11.4.1 | Test report generation with various inputs | uri-testing | M | F11.3.4 | 🔴 |
| F11.4.2 | Validate report completeness (all sections present) | uri-testing | M | F11.4.1 | 🔴 |
| F11.4.3 | Test generation performance (<20s target) | uri-testing | M | F11.4.2 | 🔴 |

**Quality Gate 11:** ✓ Report generates in <20s ✓ All sections are complete ✓ Recommendations are relevant ✓ Report UI is readable

---

## Phase 12: PDF Export (Week 10-11)

### 12.1 PDF Generation Setup
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F12.1.1 | Evaluate PDF libraries (@react-pdf/renderer vs react-to-print) | adi-fullstack | M | F11.4.3 | 🔴 |
| F12.1.2 | Install chosen PDF library | adi-fullstack | S | F12.1.1 | 🔴 |
| F12.1.3 | Create PDF template components | tal-design | C | F12.1.2 | 🔴 |

### 12.2 PDF Content Formatting
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F12.2.1 | Design PDF cover page with branding | tal-design | M | F12.1.3 | 🔴 |
| F12.2.2 | Format statistics section for PDF | tal-design | M | F12.2.1 | 🔴 |
| F12.2.3 | Format charts for PDF export | tal-design | C | F12.2.2 | 🔴 |
| F12.2.4 | Format AI report text with proper typography | tal-design | M | F12.2.3 | 🔴 |
| F12.2.5 | Add page headers and footers | tal-design | M | F12.2.4 | 🔴 |
| F12.2.6 | Add page numbers and table of contents | tal-design | M | F12.2.5 | 🔴 |

### 12.3 PDF Export Implementation
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F12.3.1 | Create "Export PDF" button | tal-design | S | F12.2.6 | 🔴 |
| F12.3.2 | Implement PDF generation function | adi-fullstack | C | F12.3.1 | 🔴 |
| F12.3.3 | Add PDF download trigger | adi-fullstack | M | F12.3.2 | 🔴 |
| F12.3.4 | Optimize PDF file size | adi-fullstack | M | F12.3.3 | 🔴 |

### 12.4 PDF Testing
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F12.4.1 | Test PDF generation on different browsers | uri-testing | M | F12.3.4 | 🔴 |
| F12.4.2 | Validate PDF content completeness | uri-testing | M | F12.4.1 | 🔴 |
| F12.4.3 | Test PDF generation performance (<20s) | uri-testing | M | F12.4.2 | 🔴 |
| F12.4.4 | Test PDF print quality | uri-testing | M | F12.4.3 | 🔴 |

**Quality Gate 12:** ✓ PDF generates in <20s ✓ All content renders correctly ✓ File size <5MB ✓ Print quality is high ✓ Works on Chrome, Safari, Firefox

---

## Phase 13: Authentication & User Management (Week 11-12)

### 13.1 Auth Setup
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F13.1.1 | Evaluate auth solutions (NextAuth.js vs Clerk) | adi-fullstack | M | None | 🔴 |
| F13.1.2 | Install and configure chosen auth provider | adi-fullstack | M | F13.1.1 | 🔴 |
| F13.1.3 | Set up session management | adi-fullstack | M | F13.1.2 | 🔴 |
| F13.1.4 | Configure OAuth providers (Google, GitHub) | adi-fullstack | M | F13.1.3 | 🔴 |

### 13.2 Protected Routes
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F13.2.1 | Create authentication middleware | adi-fullstack | M | F13.1.4 | 🔴 |
| F13.2.2 | Protect planner routes | adi-fullstack | M | F13.2.1 | 🔴 |
| F13.2.3 | Protect API routes | adi-fullstack | M | F13.2.2 | 🔴 |
| F13.2.4 | Add redirect logic for unauthenticated users | adi-fullstack | M | F13.2.3 | 🔴 |

### 13.3 User UI
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F13.3.1 | Create login page | tal-design | M | F13.2.4 | 🔴 |
| F13.3.2 | Create signup page | tal-design | M | F13.3.1 | 🔴 |
| F13.3.3 | Create user profile page | tal-design | M | F13.3.2 | 🔴 |
| F13.3.4 | Add user menu in header | tal-design | M | F13.3.3 | 🔴 |
| F13.3.5 | Add logout functionality | adi-fullstack | S | F13.3.4 | 🔴 |

### 13.4 Auth Testing
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F13.4.1 | Test login/logout flows | uri-testing | M | F13.3.5 | 🔴 |
| F13.4.2 | Test protected route access | uri-testing | M | F13.4.1 | 🔴 |
| F13.4.3 | Test session persistence | uri-testing | M | F13.4.2 | 🔴 |
| F13.4.4 | Test OAuth provider integration | uri-testing | M | F13.4.3 | 🔴 |

**Quality Gate 13:** ✓ Auth flows work correctly ✓ Protected routes are secure ✓ Session persists correctly ✓ OAuth providers work

---

## Phase 14: Saved Plans & History (Week 12-13)

### 14.1 Plan Persistence
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F14.1.1 | Create API route /api/plans/save | adi-fullstack | M | F4.2.2 | 🔴 |
| F14.1.2 | Create API route /api/plans/list | adi-fullstack | M | F14.1.1 | 🔴 |
| F14.1.3 | Create API route /api/plans/load/:id | adi-fullstack | M | F14.1.2 | 🔴 |
| F14.1.4 | Create API route /api/plans/delete/:id | adi-fullstack | M | F14.1.3 | 🔴 |
| F14.1.5 | Link saved plans to authenticated users | adi-fullstack | M | F14.1.4, F13.2.3 | 🔴 |

### 14.2 Plan History UI
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F14.2.1 | Create saved plans page | tal-design | M | F14.1.5 | 🔴 |
| F14.2.2 | Display plan list with metadata (name, date, preview) | tal-design | M | F14.2.1 | 🔴 |
| F14.2.3 | Add search and filter functionality | tal-design | M | F14.2.2 | 🔴 |
| F14.2.4 | Add "Load Plan" button | tal-design | S | F14.2.3 | 🔴 |
| F14.2.5 | Add "Delete Plan" button with confirmation | tal-design | M | F14.2.4 | 🔴 |
| F14.2.6 | Add "Save Current Plan" button in planner | tal-design | M | F14.2.5 | 🔴 |

### 14.3 History Testing
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F14.3.1 | Test plan save/load/delete operations | uri-testing | M | F14.2.6 | 🔴 |
| F14.3.2 | Test search and filter functionality | uri-testing | M | F14.3.1 | 🔴 |
| F14.3.3 | Test plan isolation per user | uri-testing | M | F14.3.2 | 🔴 |

**Quality Gate 14:** ✓ Plans persist correctly ✓ List displays all user plans ✓ Load/delete operations work ✓ Plans are user-isolated

---

## Phase 15: Performance Optimization (Week 13-14)

### 15.1 Frontend Optimization
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F15.1.1 | Implement React.memo for expensive components | adi-fullstack | M | All UI phases | 🔴 |
| F15.1.2 | Add useMemo for calculation results | adi-fullstack | M | F15.1.1 | 🔴 |
| F15.1.3 | Optimize chart re-rendering | adi-fullstack | M | F15.1.2 | 🔴 |
| F15.1.4 | Implement code splitting for routes | adi-fullstack | M | F15.1.3 | 🔴 |
| F15.1.5 | Add lazy loading for heavy components | adi-fullstack | M | F15.1.4 | 🔴 |

### 15.2 Backend Optimization
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F15.2.1 | Add database query optimization | gal-database | M | F4.3.3 | 🔴 |
| F15.2.2 | Implement API response caching | oren-backend | M | F15.2.1 | 🔴 |
| F15.2.3 | Optimize calculation algorithms | oren-backend | M | F15.2.2 | 🔴 |
| F15.2.4 | Add request rate limiting | oren-backend | M | F15.2.3 | 🔴 |

### 15.3 Performance Testing
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F15.3.1 | Run Lighthouse performance audit | uri-testing | M | F15.2.4 | 🔴 |
| F15.3.2 | Test calculation performance (<100ms target) | uri-testing | M | F15.3.1 | 🔴 |
| F15.3.3 | Test API response times (<500ms target) | uri-testing | M | F15.3.2 | 🔴 |
| F15.3.4 | Load test with 100+ concurrent users | uri-testing | C | F15.3.3 | 🔴 |

**Quality Gate 15:** ✓ Lighthouse score >90 ✓ Calculations <100ms ✓ API responses <500ms ✓ Handles 100+ concurrent users

---

## Phase 16: Security Hardening (Week 14)

### 16.1 Input Validation
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F16.1.1 | Add Zod schema validation for all API inputs | adi-fullstack | M | F3.3.3 | 🔴 |
| F16.1.2 | Sanitize user inputs to prevent XSS | adi-fullstack | M | F16.1.1 | 🔴 |
| F16.1.3 | Add CSRF protection | adi-fullstack | M | F16.1.2 | 🔴 |

### 16.2 Data Security
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F16.2.1 | Implement SQL injection prevention | gal-database | M | F4.3.4 | 🔴 |
| F16.2.2 | Add encryption for sensitive data at rest | gal-database | M | F16.2.1 | 🔴 |
| F16.2.3 | Implement secure session management | adi-fullstack | M | F13.1.3 | 🔴 |

### 16.3 API Security
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F16.3.1 | Add API rate limiting per user | oren-backend | M | F15.2.4 | 🔴 |
| F16.3.2 | Implement request size limits | oren-backend | M | F16.3.1 | 🔴 |
| F16.3.3 | Add security headers (CSP, HSTS, etc.) | oren-backend | M | F16.3.2 | 🔴 |

### 16.4 Security Testing
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F16.4.1 | Run security audit with npm audit | uri-testing | S | F16.3.3 | 🔴 |
| F16.4.2 | Test for common vulnerabilities (OWASP Top 10) | uri-testing | C | F16.4.1 | 🔴 |
| F16.4.3 | Test authentication bypass attempts | uri-testing | M | F16.4.2 | 🔴 |
| F16.4.4 | Review code for security issues | maya-code-review | C | F16.4.3 | 🔴 |

**Quality Gate 16:** ✓ No critical security vulnerabilities ✓ All inputs validated ✓ OWASP Top 10 addressed ✓ Code review passes

---

## Phase 17: Accessibility Improvements (Week 15)

### 17.1 WCAG 2.1 AA Compliance
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F17.1.1 | Audit all components for accessibility | uri-testing | M | All UI phases | 🔴 |
| F17.1.2 | Fix color contrast issues | tal-design | M | F17.1.1 | 🔴 |
| F17.1.3 | Add proper heading hierarchy | tal-design | M | F17.1.2 | 🔴 |
| F17.1.4 | Add ARIA labels to interactive elements | tal-design | M | F17.1.3 | 🔴 |
| F17.1.5 | Ensure keyboard navigation works everywhere | tal-design | M | F17.1.4 | 🔴 |

### 17.2 Screen Reader Support
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F17.2.1 | Test with NVDA screen reader | uri-testing | M | F17.1.5 | 🔴 |
| F17.2.2 | Test with VoiceOver screen reader | uri-testing | M | F17.2.1 | 🔴 |
| F17.2.3 | Add skip-to-content links | tal-design | M | F17.2.2 | 🔴 |
| F17.2.4 | Add descriptive text for charts | tal-design | M | F17.2.3 | 🔴 |

### 17.3 Accessibility Testing
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F17.3.1 | Run axe DevTools audit | uri-testing | M | F17.2.4 | 🔴 |
| F17.3.2 | Test with keyboard only (no mouse) | uri-testing | M | F17.3.1 | 🔴 |
| F17.3.3 | Verify WCAG 2.1 AA compliance | uri-testing | M | F17.3.2 | 🔴 |

**Quality Gate 17:** ✓ WCAG 2.1 AA compliant ✓ axe audit passes ✓ Keyboard navigation works ✓ Screen readers work correctly

---

## Phase 18: Documentation (Week 15-16)

### 18.1 Technical Documentation
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F18.1.1 | Document project architecture | yael-technical-docs | M | All phases | 🔴 |
| F18.1.2 | Document database schema and relationships | yael-technical-docs | M | F4.3.4 | 🔴 |
| F18.1.3 | Document calculation formulas | yael-technical-docs | M | F6.4.6 | 🔴 |
| F18.1.4 | Document MCP scraper implementations | yael-technical-docs | M | F5.4.6 | 🔴 |
| F18.1.5 | Create developer setup guide | yael-technical-docs | M | F18.1.4 | 🔴 |

### 18.2 API Documentation
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F18.2.1 | Document all API endpoints with OpenAPI spec | amit-api-docs | C | All API routes | 🔴 |
| F18.2.2 | Add request/response examples | amit-api-docs | M | F18.2.1 | 🔴 |
| F18.2.3 | Document authentication flows | amit-api-docs | M | F18.2.2 | 🔴 |
| F18.2.4 | Document error codes and handling | amit-api-docs | M | F18.2.3 | 🔴 |

### 18.3 User Documentation
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F18.3.1 | Create user guide with screenshots | yael-technical-docs | M | All UI phases | 🔴 |
| F18.3.2 | Create FAQ document | yael-technical-docs | M | F18.3.1 | 🔴 |
| F18.3.3 | Document SARS compliance details | yael-technical-docs | M | F6.2.6 | 🔴 |

**Quality Gate 18:** ✓ All documentation complete ✓ API spec validates ✓ Setup guide works for new developers ✓ User guide is clear

---

## Phase 19: Deployment & Monitoring (Week 16)

### 19.1 Vercel Deployment
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F19.1.1 | Configure Vercel project | adi-fullstack | M | All phases | 🔴 |
| F19.1.2 | Set up environment variables in Vercel | adi-fullstack | M | F19.1.1 | 🔴 |
| F19.1.3 | Configure Vercel Postgres connection | gal-database | M | F19.1.2 | 🔴 |
| F19.1.4 | Set up preview deployments for PRs | adi-fullstack | M | F19.1.3 | 🔴 |
| F19.1.5 | Configure custom domain (if applicable) | adi-fullstack | M | F19.1.4 | 🔴 |

### 19.2 Production Testing
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F19.2.1 | Test production deployment | uri-testing | M | F19.1.5 | 🔴 |
| F19.2.2 | Verify database connections in production | uri-testing | M | F19.2.1 | 🔴 |
| F19.2.3 | Test all features in production environment | uri-testing | C | F19.2.2 | 🔴 |
| F19.2.4 | Run performance tests on production | uri-testing | M | F19.2.3 | 🔴 |

### 19.3 Monitoring Setup
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F19.3.1 | Set up Vercel Analytics | adi-fullstack | S | F19.2.4 | 🔴 |
| F19.3.2 | Configure error tracking (Sentry or similar) | adi-fullstack | M | F19.3.1 | 🔴 |
| F19.3.3 | Set up uptime monitoring | adi-fullstack | M | F19.3.2 | 🔴 |
| F19.3.4 | Create alerting for critical errors | adi-fullstack | M | F19.3.3 | 🔴 |

### 19.4 Launch Checklist
| Task ID | Task | Agent | Complexity | Dependencies | Status |
|---------|------|-------|------------|--------------|--------|
| F19.4.1 | Review all quality gates | rotem | M | All phases | 🔴 |
| F19.4.2 | Perform final security review | maya-code-review | M | F19.4.1 | 🔴 |
| F19.4.3 | Verify SARS compliance | maya-code-review | M | F19.4.2 | 🔴 |
| F19.4.4 | Create launch announcement | yael-technical-docs | M | F19.4.3 | 🔴 |

**Quality Gate 19:** ✓ Production deployment successful ✓ All features work in production ✓ Monitoring active ✓ Performance meets targets ✓ All quality gates passed

---

## Critical Path

The following tasks are on the critical path and should be prioritized:

1. **Foundation Setup** (Phase 1) - Blocks all subsequent work
2. **shadcn/ui Integration** (Phase 2) - Blocks all UI development
3. **TypeScript Types** (Phase 3) - Blocks type-safe development
4. **Database Schema** (Phase 4) - Blocks data persistence
5. **MCP Scrapers** (Phase 5) - Blocks data integration
6. **Calculation Engine** (Phase 6) - Blocks core functionality
7. **Planner UI** (Phases 7-8) - Blocks user interaction
8. **AI Report Generation** (Phase 11) - Blocks report feature
9. **PDF Export** (Phase 12) - Blocks deliverable
10. **Deployment** (Phase 19) - Final milestone

---

## Risk Management

### High-Risk Areas
| Risk | Impact | Mitigation | Owner |
|------|--------|------------|-------|
| MCP scraper failures due to website changes | HIGH | Implement robust error handling, cache data, monitor scraper health | oren-backend |
| SARS tax calculation errors | HIGH | Validate against official examples, extensive testing | uri-testing |
| AI generation latency >20s | MEDIUM | Optimize prompts, implement streaming, show progress | noam-prompt-engineering |
| Database query performance issues | MEDIUM | Proper indexing, query optimization, connection pooling | gal-database |
| Accessibility compliance failures | MEDIUM | Regular testing, design system adherence | tal-design, uri-testing |

---

## Dependencies Summary

### External Dependencies
- **Playwright MCP**: Discovery fund scraping
- **Brightdata MCP**: SARS tax tables, Stats SA CPI scraping
- **Claude API**: AI report generation, strategy explanations
- **Vercel Postgres**: Database hosting
- **shadcn/ui**: Component library
- **Recharts**: Chart visualizations
- **@react-pdf/renderer** or **react-to-print**: PDF generation

### Internal Dependencies
- Phase 5 (Scrapers) depends on Phase 4 (Database)
- Phase 6 (Calculations) depends on Phase 5 (Data sources)
- Phase 7-8 (UI) depends on Phases 2-3 (Foundation)
- Phase 9 (Optimization) depends on Phase 6 (Calculations)
- Phase 11 (Reports) depends on Phases 6, 8 (Data + UI)
- Phase 12 (PDF) depends on Phase 11 (Reports)
- Phase 13 (Auth) is independent but blocks Phase 14 (Saved Plans)

---

## Agent Assignment Summary

| Agent | Total Tasks | Key Responsibilities |
|-------|-------------|---------------------|
| **adi-fullstack** | ~80 | Integration, API routes, state management, auth |
| **tal-design** | ~60 | UI/UX design, shadcn components, responsive layouts |
| **oren-backend** | ~40 | Calculations, scrapers, optimization |
| **gal-database** | ~20 | Schema design, migrations, query optimization |
| **uri-testing** | ~50 | Testing, coverage, validation, performance |
| **maya-code-review** | ~5 | Security review, code quality |
| **yael-technical-docs** | ~10 | Technical documentation, user guides |
| **amit-api-docs** | ~5 | API documentation, OpenAPI spec |
| **noam-prompt-engineering** | ~5 | AI prompts, Claude integration |
| **rotem** (PM) | ~5 | Orchestration, quality gates, launch coordination |

---

## Estimated Completion

**Total Development Time**: 16 weeks
**Total Tasks**: ~300
**Critical Path Length**: ~12 weeks
**Parallel Work Opportunities**: High (UI + Backend + Scrapers can run concurrently)

---

## Notes

- Tasks marked with 🟢 indicate Phase 1 foundation is already complete
- All tasks have clear dependencies and cannot proceed until prerequisites are met
- Quality gates MUST pass before proceeding to next phase
- Complexity estimates: S (1-2 hours), M (3-8 hours), C (1-3 days)
- Testing should be performed continuously, not just at phase end
- Code reviews should happen after each major feature, not just at project end
