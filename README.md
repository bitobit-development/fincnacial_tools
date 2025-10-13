# AI Retirement & Tax Optimization Planner

A comprehensive retirement planning tool designed for the South African market, featuring AI-powered insights, tax optimization strategies, and real-time data integration.

## Overview

This application helps South African users plan their retirement by:
- Projecting retirement savings growth with real fund performance data (Discovery)
- Calculating tax obligations using live SARS tax tables
- Adjusting for inflation using Stats SA CPI data
- Generating AI-powered retirement reports with personalized recommendations
- Comparing multiple scenarios and tax strategies

## Tech Stack

- **Framework:** Next.js 15.5.4 with App Router
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Database:** Vercel Postgres with Drizzle ORM
- **AI:** Claude API (Anthropic) + OpenAI ChatGPT
- **Data Scraping:** MCP Playwright (Discovery funds) + MCP Brightdata (SARS, Stats SA)

## Getting Started

### Prerequisites

- Node.js 20+ (LTS recommended)
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fincnacial_tools
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in required values:
- `POSTGRES_URL` - Vercel Postgres connection string
- `ANTHROPIC_API_KEY` - Claude API key for AI features
- `OPENAI_API_KEY` - OpenAI API key (optional)

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Development Commands

```bash
npm run dev      # Start development server (Turbopack)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with fonts
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles + Tailwind
│   └── showcase/          # Component showcase page
├── components/
│   └── ui/                # shadcn/ui components
├── lib/
│   └── utils.ts           # Utility functions (cn, etc.)
├── types/
│   └── index.ts           # TypeScript type definitions
docs/                      # Project documentation
├── AI-Retirement-Planner-PRD.md
├── DEVELOPMENT-TODOLIST.md
├── COMPONENT-LIBRARY.md
├── DATABASE-SCHEMA.md
├── MCP-SCRAPERS.md
└── CALCULATION-LOGIC.md
```

## Features

### Phase 1: Foundation (Week 1) - COMPLETED
- Project setup with Next.js 15.5.4 + TypeScript
- shadcn/ui component library integrated
- Dark mode support with CSS custom properties
- TypeScript type system (PlannerState, Statistics, TaxRates, etc.)

### Phase 2: Data Integration (Week 2-4)
- Discovery Funds scraper (Playwright MCP)
- SARS Tax Tables scraper (Brightdata MCP)
- Stats SA CPI scraper (Brightdata MCP)
- Vercel Postgres database with Drizzle ORM

### Phase 3: Calculation Engine (Week 4-5)
- Future Value (FV) and Present Value (PV) calculations
- Tax calculation engine (income, CGT, dividend, RA lump sum)
- Year-by-year projection generation
- Inflation-adjusted returns

### Phase 4: User Interface (Week 5-7)
- Responsive planner input form
- Interactive charts (Recharts)
- Statistics dashboard
- Scenario comparison tool

### Phase 5: AI Features (Week 7-10)
- Tax optimization advisor
- AI-generated retirement reports (Claude)
- Strategy comparison with explanations
- PDF export functionality

### Phase 6: User Management (Week 11-13)
- Authentication (NextAuth.js or Clerk)
- Saved plans and history
- User dashboard

### Phase 7: Polish & Deploy (Week 14-16)
- Performance optimization
- Security hardening
- Accessibility improvements (WCAG 2.1 AA)
- Vercel deployment

## Component Showcase

Visit [http://localhost:3000/showcase](http://localhost:3000/showcase) to see all installed shadcn/ui components in action. This page demonstrates:
- Buttons, inputs, labels, sliders
- Cards, tabs, selects, tables
- Badges, tooltips, dialogs, sheets
- Accordions, separators
- Dark mode compatibility

## shadcn/ui Components

Installed components:
- `button`, `card`, `input`, `label`, `slider`
- `tabs`, `select`, `table`, `badge`, `tooltip`
- `sheet`, `dialog`, `accordion`, `separator`

To add more components:
```bash
npx shadcn@latest add [component-name]
```

## TypeScript Types

All core types are defined in `src/types/index.ts`:
- `PlannerState` - User input state
- `Statistics` - Calculated results
- `TaxRates` - SARS tax brackets and rates
- `DiscoveryFund` - Fund performance data
- `InflationData` - CPI data from Stats SA
- `ProjectionYear` - Year-by-year breakdown
- `TaxStrategy` - Optimization strategies
- `ReportDocument` - AI-generated report

## Development Guidelines

### Code Style
- Use TypeScript strict mode (no `any` without justification)
- Follow Next.js App Router conventions (Server Components by default)
- Use shadcn/ui components instead of custom UI
- Prefix client components with `"use client"`

### File Naming
- Components: PascalCase (`RetirementPlanner.tsx`)
- Utilities: camelCase (`calculateTax.ts`)
- Types: camelCase with `.d.ts` suffix for declaration files

### Git Workflow
- Commit messages should be descriptive
- Use conventional commits (feat:, fix:, docs:, etc.)
- Never commit `.env.local` or API keys

## Testing

Testing framework setup (Vitest) coming in Week 1 Phase 2.

```bash
npm test           # Run all tests
npm test:watch     # Watch mode
npm test:coverage  # Coverage report
```

## Documentation

Comprehensive documentation available in `docs/`:
- **PRD:** Complete product requirements
- **TODO List:** Granular task breakdown (300+ tasks)
- **Component Library:** shadcn/ui component catalog
- **Database Schema:** Postgres schema with Drizzle ORM
- **MCP Scrapers:** Web scraping implementation
- **Calculation Logic:** Financial formulas and tax calculations

## Contributing

This project is under active development. For contribution guidelines, see the project documentation.

## License

[Add license information]

## Support

For issues, questions, or feature requests, please refer to the project documentation in the `docs/` folder.
