# AI Retirement & Tax Optimization Planner (PRD)

## Metadata
- **Version:** v5.1
- **Author:** Haim Derazon / Bitobit (Pty) Ltd
- **Date:** 2025-10-09
- **Status:** In Progress

---

## 🧭 Overview
A dynamic, AI-driven **Retirement Annuity (RA) and Tax Optimization Planner** built for the South African market. The platform calculates personalized **retirement growth, withdrawals, tax liabilities, and long-term wealth retention** using **Claude + ChatGPT orchestration**, **Discovery Fund fact-sheet data**, and **SARS 2025/26-compliant rules**.

---

## 🎯 Objectives
| Goal | Metric |
|------|--------|
| Flexible age-based projection | User-defined current + retirement age |
| Discovery fund integration | Pull CAGR / risk metrics |
| SARS tax compliance | Exact 2025/26 bracket adherence |
| Tax-saving strategy engine | ≥3 optimized mixes (RA/TFSA/Brokerage) |
| Interactive UI | <250 ms slider update |
| Full PDF report | <20 s generation |
| Secure local compute | No PII persistence |

---

## 🏗 System Architecture
User (Next.js + shadcn/ui) → Claude Controller → ChatGPT Analyst → Data APIs (Discovery, SARS, Stats SA)

---

## ⚙️ Core Features
1. **Dynamic Planner Inputs**
   - Current & Retirement Age sliders  
   - RA Balance, Contribution, Growth %, Inflation %, Drawdown %
2. **Discovery Fund Integration**
   - Fetch & parse fund fact sheets (CAGR, volatility, Sharpe ratio)
3. **Inflation Model**
   - Real vs nominal returns using CPI feed
4. **SARS-Compliant Tax Engine**
   - Income, CGT, Dividend, Interest, RA Lump-sum brackets
5. **Tax Optimization Advisor**
   - Simulates RA / TFSA / Brokerage blends
6. **Withdrawal Statistics**
   - Computes total invested, total withdrawn, total tax paid, net retained wealth, fund depletion age
7. **AI Report Generation**
   - Claude assembles `reportDoc` → React UI → PDF

---

## 💾 Data Contracts
### PlannerState
| Field | Type | Description |
|--------|------|-------------|
| currentAge | number | Current age |
| retirementAge | number | Desired retirement age |
| startingBalance | number | Initial RA value |
| monthlyContribution | number | R/month |
| annualReturn | number | Expected fund CAGR |
| inflation | number | CPI rate |
| drawdownRate | number | % withdrawal after retirement |
| targetMonthlyToday | number | Desired income (today’s R) |
| fundName | string | Discovery fund ID |

### Statistics
| Field | Description |
|--------|-------------|
| totalContributed | Sum of all contributions + initial |
| projectedValueAtRetirement | FV @ retirement |
| totalWithdrawn | Sum of withdrawals |
| totalTaxPaid | SARS-calculated tax |
| netAfterTaxIncome | Spendable total |
| fundDepletionYear | Year balance → 0 |
| effectiveTaxRate | Tax ÷ Gross income |
| wealthRetentionRatio | Net ÷ Contributions |

---

## 💸 Tax Compliance Logic (SARS 2025/26)
| Type | Rule |
|------|------|
| Income | 18 – 45 % progressive |
| RA Lump-Sum | First R 550 000 tax-free |
| CGT | 40 % inclusion × marginal rate |
| Dividends | 20 % withholding |
| Interest | Exemption R 23 800 (< 65) / R 34 500 (≥ 65) |

---

## 📊 Withdrawal & Wealth Statistics
| Metric | Description |
|---------|-------------|
| Total Contributed | Sum of all deposits |
| Fund @ Retirement | Nominal FV |
| Total Withdrawn | Gross lifetime income |
| Total Tax Paid | Sum of all tax components |
| Net Income (Real) | Inflation-adjusted spendable cash |
| Fund Depletion Age | Age when balance ≈ 0 |
| Wealth Retention Ratio | Net / Invested |
| Effective Tax Rate | Blended over lifetime |

---

## 🧩 MCP / API Integrations
### Suggested MCP Tools
| Tool | Purpose |
|------|----------|
| finance-model-mcp | Performs FV, PV, CAGR, tax & inflation computations |
| sars-compliance-mcp | Fetches / updates SARS brackets via JSON API |
| discovery-fund-mcp | Scrapes or queries Discovery Fund fact sheets |
| stats-sa-inflation-mcp | Gets latest CPI data |
| report-builder-mcp | Converts `reportDoc` → Markdown → PDF |
| tax-strategy-mcp | Simulates RA/TFSA/brokerage optimization scenarios |
| chart-gen-mcp | Generates chart data for Recharts components |

### External APIs
| API | Endpoint | Data |
|------|-----------|------|
| Discovery Funds | https://api.discovery.co.za/funds?name= | Fund returns, risk |
| Stats SA CPI | https://api.statssa.gov.za/cpi/latest | Inflation % |
| SARS Tax Tables | https://sars.gov.za/api/tax-tables/2025 | Brackets, rebates |

---

## 🧱 Tech Stack
| Layer | Tech |
|-------|------|
| Frontend | Next.js 15 + shadcn/ui + TailwindCSS |
| Charts | Recharts |
| PDF Export | react-to-print / @react-pdf/renderer |
| AI Orchestration | Claude + ChatGPT via MCP |
| Backend | FastAPI / Vercel Serverless |
| Database | SQLite / Supabase for saved plans |

---

## 🚀 Deliverables & Timeline
| Phase | Deliverable | ETA |
|--------|--------------|------|
| P1 | Dynamic Planner UI | Week 2 |
| P2 | Discovery Fund Integration | Week 4 |
| P3 | SARS Tax Engine & Inflation API | Week 6 |
| P4 | Tax Strategy Advisor & Statistics | Week 8 |
| P5 | Claude–ChatGPT Report Generator | Week 10 |
| P6 | PDF Export & Branding | Week 12 |

---

## ✅ Summary
A compliant, intelligent, and visually rich retirement planning system that merges **AI financial modeling**, **Discovery Fund data**, **SARS rules**, and **interactive visualization** to deliver real-time, tax-smart, inflation-adjusted forecasts with exportable reports.
