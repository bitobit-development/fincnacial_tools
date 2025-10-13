# MCP Scrapers Specification

**Project:** AI Retirement & Tax Optimization Planner
**Version:** 1.0
**Last Updated:** 2025-10-13

---

## Overview

This document specifies the implementation of three critical web scrapers using MCP (Model Context Protocol) tools: Playwright for Discovery funds and Brightdata for SARS tax tables and Stats SA CPI data.

**Key Constraint:** No API keys available - all data must be scraped from public websites.

---

## 1. Discovery Funds Scraper (Playwright MCP)

### Purpose
Extract fund performance data (CAGR, volatility, Sharpe ratio) from Discovery fund fact sheets to populate the fund selection dropdown and auto-populate expected returns.

### Target Website
- **Base URL:** https://www.discovery.co.za/invest/products/retirement-annuity
- **Fund Fact Sheets:** Typically PDF or HTML pages under product documentation
- **Alternative:** Discovery Invest website fund pages

### Data to Extract

| Field | Type | Description | Priority |
|-------|------|-------------|----------|
| fund_name | string | Full fund name (e.g., "Discovery Balanced Fund") | HIGH |
| fund_code | string | Discovery fund code/ISIN | HIGH |
| cagr_1y | decimal | 1-year compound annual growth rate (%) | HIGH |
| cagr_3y | decimal | 3-year CAGR (%) | HIGH |
| cagr_5y | decimal | 5-year CAGR (%) | HIGH |
| cagr_10y | decimal | 10-year CAGR (%) | MEDIUM |
| volatility | decimal | Annualized volatility (standard deviation) | MEDIUM |
| sharpe_ratio | decimal | Risk-adjusted return metric | MEDIUM |
| fund_type | string | Category (Equity, Balanced, Bond, etc.) | LOW |
| inception_date | date | Fund launch date | LOW |
| last_updated | timestamp | When data was scraped | HIGH |

### Playwright Implementation Steps

#### Step 1: Navigate to Fund Page
```typescript
// Pseudocode for Playwright MCP
await browser.navigate('https://www.discovery.co.za/invest/products/retirement-annuity');
await browser.wait_for({ text: 'Fund Performance' });
```

#### Step 2: Identify Fund Links
- Look for links containing "fact sheet", "fund details", or "performance"
- Extract all fund links into an array
- Prioritize funds with "Retirement Annuity" in the name

#### Step 3: Extract Data from Each Fund Page
For each fund link:
1. Navigate to fund page
2. Use `browser_snapshot` to capture accessibility tree
3. Locate performance tables (usually contain "1 Year", "3 Years", "5 Years" headers)
4. Extract CAGR values using text patterns:
   - Pattern: `(\d+\.\d+)%` for percentages
   - Pattern: `(\d+,\d+\.\d+)%` for formatted numbers (handle commas)
5. Extract volatility and Sharpe ratio from risk metrics section
6. Handle PDF fact sheets:
   - Take screenshot of table region if HTML tables not available
   - Use OCR or manual parsing (fallback)

#### Step 4: Data Transformation
```typescript
interface DiscoveryFund {
  fund_name: string;
  fund_code: string;
  cagr_1y: number;
  cagr_3y: number;
  cagr_5y: number;
  cagr_10y: number | null;
  volatility: number | null;
  sharpe_ratio: number | null;
  fund_type: string;
  inception_date: string | null;
  last_updated: string;
}
```

#### Step 5: Error Handling
- **Timeout errors:** Retry up to 3 times with exponential backoff
- **Missing data:** Mark fields as `null`, don't fail entire scrape
- **Rate limiting:** Wait 2-5 seconds between fund page requests
- **Captcha detection:** Log error and skip fund, don't crash scraper

### Caching Strategy
- **Table:** `discovery_funds_cache`
- **TTL:** 24 hours (funds update daily)
- **Cache Key:** `fund_code`
- **Invalidation:** Delete records where `last_updated < NOW() - INTERVAL '24 hours'`

### API Endpoint
```typescript
// GET /api/funds/discovery
// Query Params: ?type=balanced|equity|bond (optional)
{
  "success": true,
  "data": [
    {
      "fund_name": "Discovery Balanced Fund",
      "fund_code": "DI_BAL_001",
      "cagr_3y": 8.45,
      "cagr_5y": 9.20,
      "volatility": 12.3,
      "sharpe_ratio": 0.68,
      "last_updated": "2025-10-13T10:30:00Z"
    }
  ],
  "cached": true,
  "cache_age_hours": 2.5
}
```

### Testing Requirements
- Scrape at least 5 different Discovery funds
- Validate CAGR values are between -50% and +100%
- Validate volatility values are between 0% and 100%
- Ensure scraper completes within 60 seconds for 10 funds
- Test with network failures (timeout simulation)

---

## 2. SARS Tax Tables Scraper (Brightdata MCP)

### Purpose
Extract 2025/26 tax year brackets and rates from SARS website to ensure accurate tax calculations.

### Target Website
- **Base URL:** https://www.sars.gov.za/tax-rates/income-tax/rates-of-tax-for-individuals/
- **Fallback:** SARS Budget documents (usually PDF)

### Data to Extract

#### 2.1 Income Tax Brackets

| Field | Type | Description | Priority |
|-------|------|-------------|----------|
| tax_year | string | "2025/26" | HIGH |
| bracket_min | decimal | Lower bound of bracket (R) | HIGH |
| bracket_max | decimal | Upper bound of bracket (R, null for highest) | HIGH |
| rate | decimal | Tax rate (%) | HIGH |
| base_tax | decimal | Cumulative tax at bracket start (R) | HIGH |

**Expected 2025/26 Brackets (validate against scrape):**
| Bracket | Rate |
|---------|------|
| R0 - R237,100 | 18% |
| R237,101 - R370,500 | 26% |
| R370,501 - R512,800 | 31% |
| R512,801 - R673,000 | 36% |
| R673,001 - R857,900 | 39% |
| R857,901 - R1,817,000 | 41% |
| R1,817,001+ | 45% |

#### 2.2 Tax Rebates

| Field | Type | Description | Priority |
|-------|------|-------------|----------|
| primary_rebate | decimal | Basic rebate for all taxpayers | HIGH |
| secondary_rebate | decimal | Additional for 65+ | HIGH |
| tertiary_rebate | decimal | Additional for 75+ | HIGH |

**Expected 2025/26 Rebates:**
- Primary: R17,235
- Secondary (65+): R9,444
- Tertiary (75+): R3,145

#### 2.3 RA Lump-Sum Tax Table

| Field | Type | Description | Priority |
|-------|------|-------------|----------|
| lump_sum_min | decimal | Lower bound (R) | HIGH |
| lump_sum_max | decimal | Upper bound (R) | HIGH |
| rate | decimal | Tax rate (%) | HIGH |
| base_tax | decimal | Cumulative tax at bracket start (R) | HIGH |

**Expected 2025/26 RA Lump-Sum Brackets:**
| Bracket | Rate |
|---------|------|
| R0 - R550,000 | 0% (tax-free) |
| R550,001 - R770,000 | 18% |
| R770,001 - R1,155,000 | 27% |
| R1,155,001+ | 36% |

#### 2.4 CGT Inclusion Rates

| Field | Type | Description | Priority |
|-------|------|-------------|----------|
| individual_inclusion | decimal | % of gain included (40%) | HIGH |
| annual_exclusion | decimal | R40,000 (2025/26) | HIGH |

#### 2.5 Dividend Withholding Tax

| Field | Type | Description | Priority |
|-------|------|-------------|----------|
| dividend_wht_rate | decimal | 20% | HIGH |

#### 2.6 Interest Exemption

| Field | Type | Description | Priority |
|-------|------|-------------|----------|
| interest_exempt_under65 | decimal | R23,800 (2025/26) | HIGH |
| interest_exempt_over65 | decimal | R34,500 (2025/26) | HIGH |

### Brightdata Scraper Implementation

#### Step 1: Configure Brightdata Scraper
```typescript
// Use mcp__Brightdata__scrape_as_markdown tool
const url = 'https://www.sars.gov.za/tax-rates/income-tax/rates-of-tax-for-individuals/';
const markdown = await scrape_as_markdown({ url });
```

#### Step 2: Parse Markdown Tables
- Identify table structures using `|---|---|` markdown syntax
- Extract income tax brackets from first table
- Extract rebates from "Tax Rebates" section
- Extract RA lump-sum table (may be on separate page)

#### Step 3: Structured JSON Conversion
```typescript
interface SARSTaxTables {
  tax_year: string; // "2025/26"
  income_tax_brackets: {
    bracket_min: number;
    bracket_max: number | null;
    rate: number;
    base_tax: number;
  }[];
  tax_rebates: {
    primary: number;
    secondary: number;
    tertiary: number;
  };
  ra_lump_sum_brackets: {
    bracket_min: number;
    bracket_max: number | null;
    rate: number;
    base_tax: number;
  }[];
  cgt: {
    inclusion_rate: number; // 0.40
    annual_exclusion: number; // 40000
  };
  dividend_wht: {
    rate: number; // 0.20
  };
  interest_exemption: {
    under_65: number; // 23800
    over_65: number; // 34500
  };
  scraped_at: string; // ISO timestamp
}
```

#### Step 4: Validation Rules
- **Income tax brackets:** Must have 7 brackets, rates between 18% and 45%
- **Rebates:** Primary rebate should be ~R17,000
- **RA lump-sum:** First bracket should be 0% up to ~R550,000
- **CGT:** Inclusion rate should be 40%
- **Dividend WHT:** Should be 20%
- **Interest exemption:** Under 65 should be ~R23,800

#### Step 5: Fallback Strategies
1. If main page fails, try SARS budget announcement PDF
2. If PDF, use Brightdata's PDF text extraction
3. If all fails, use hardcoded 2025/26 values with warning flag

### Caching Strategy
- **Table:** `sars_tax_tables_cache`
- **TTL:** 1 year (tax tables change annually)
- **Cache Key:** `tax_year` (e.g., "2025/26")
- **Invalidation:** Manual (when new tax year announced)

### API Endpoint
```typescript
// GET /api/tax/sars-tables
// Query Params: ?year=2025/26 (optional, defaults to current)
{
  "success": true,
  "data": {
    "tax_year": "2025/26",
    "income_tax_brackets": [...],
    "tax_rebates": {...},
    "ra_lump_sum_brackets": [...],
    "cgt": {...},
    "dividend_wht": {...},
    "interest_exemption": {...}
  },
  "cached": true,
  "source": "sars_website" | "fallback_hardcoded"
}
```

### Testing Requirements
- Validate all 7 income tax brackets are present
- Verify top rate is 45%
- Verify R550,000 RA lump-sum tax-free threshold
- Test with hardcoded fallback when scraper fails
- Ensure scraper completes within 30 seconds

---

## 3. Stats SA CPI Scraper (Brightdata MCP)

### Purpose
Extract Consumer Price Index (CPI) data from Statistics South Africa to calculate inflation-adjusted returns.

### Target Website
- **Base URL:** http://www.statssa.gov.za/?page_id=1854&PPN=P0141
- **Alternative:** SARB (South African Reserve Bank) inflation page

### Data to Extract

| Field | Type | Description | Priority |
|-------|------|-------------|----------|
| year | integer | Year (e.g., 2025) | HIGH |
| month | integer | Month (1-12) | HIGH |
| cpi_value | decimal | CPI index value | HIGH |
| annual_rate | decimal | Year-on-year inflation rate (%) | HIGH |
| monthly_rate | decimal | Month-on-month rate (%) | MEDIUM |
| category | string | "All items" (headline CPI) | HIGH |
| last_updated | timestamp | When data was scraped | HIGH |

### Brightdata Scraper Implementation

#### Step 1: Navigate to CPI Page
```typescript
// Use mcp__Brightdata__scrape_as_markdown tool
const url = 'http://www.statssa.gov.za/?page_id=1854&PPN=P0141';
const markdown = await scrape_as_markdown({ url });
```

#### Step 2: Locate CPI Table
- Look for tables with headers: "Year", "Month", "CPI", "Annual %"
- Stats SA typically publishes monthly CPI releases
- Extract last 12 months of data for rolling average

#### Step 3: Parse CPI Data
```typescript
interface CPIData {
  year: number;
  month: number;
  cpi_value: number;
  annual_rate: number; // Year-on-year %
  monthly_rate: number | null; // Month-on-month %
  category: string; // "All items"
  last_updated: string;
}
```

#### Step 4: Calculate Rolling Average
```typescript
// Calculate 12-month rolling average inflation
function calculateRollingAverage(data: CPIData[]): number {
  const last12Months = data.slice(-12);
  const sum = last12Months.reduce((acc, d) => acc + d.annual_rate, 0);
  return sum / last12Months.length;
}
```

#### Step 5: Validation Rules
- **CPI value:** Should be between 100 and 200 (base year dependent)
- **Annual rate:** Should be between -2% and 20% (realistic bounds)
- **Data completeness:** At least last 12 months should be available
- **Recency:** Latest data point should be <60 days old

#### Step 6: Fallback Strategy
1. If Stats SA fails, try SARB inflation page
2. If both fail, use last known CPI value with warning
3. Default to 6% inflation if no data available (SA long-term average)

### Caching Strategy
- **Table:** `cpi_data_cache`
- **TTL:** 30 days (CPI published monthly)
- **Cache Key:** `year_month` (e.g., "2025_10")
- **Invalidation:** Delete records where `last_updated < NOW() - INTERVAL '30 days'`

### API Endpoint
```typescript
// GET /api/inflation/cpi
// Query Params: ?months=12 (number of months to return)
{
  "success": true,
  "data": {
    "latest": {
      "year": 2025,
      "month": 9,
      "cpi_value": 142.3,
      "annual_rate": 5.8,
      "monthly_rate": 0.4
    },
    "rolling_average_12m": 5.5,
    "historical": [
      { "year": 2024, "month": 10, "annual_rate": 5.9 },
      { "year": 2024, "month": 11, "annual_rate": 5.6 },
      // ... last 12 months
    ]
  },
  "cached": true,
  "source": "stats_sa" | "sarb" | "fallback"
}
```

### Testing Requirements
- Extract last 12 months of CPI data
- Validate annual rate is between -2% and 20%
- Calculate rolling average correctly
- Test fallback to SARB source
- Ensure scraper completes within 20 seconds

---

## 4. Scraper Health Monitoring

### Health Check Endpoint
```typescript
// GET /api/scrapers/health
{
  "discovery_funds": {
    "status": "healthy" | "degraded" | "down",
    "last_successful_scrape": "2025-10-13T10:30:00Z",
    "cache_hit_rate": 0.85,
    "error_count_24h": 2
  },
  "sars_tax_tables": {
    "status": "healthy",
    "last_successful_scrape": "2025-10-01T08:00:00Z",
    "cache_hit_rate": 0.95,
    "error_count_24h": 0
  },
  "stats_sa_cpi": {
    "status": "healthy",
    "last_successful_scrape": "2025-10-05T14:00:00Z",
    "cache_hit_rate": 0.90,
    "error_count_24h": 1
  }
}
```

### Error Logging
All scraper errors should be logged with:
- **Timestamp**
- **Scraper name**
- **Error type** (timeout, parsing, validation, network)
- **URL attempted**
- **Retry count**
- **Fallback used** (yes/no)

### Performance Monitoring
Track metrics:
- **Scrape duration** (p50, p95, p99)
- **Cache hit rate** (target: >80%)
- **Error rate** (target: <5%)
- **Data freshness** (age of cached data)

---

## 5. Implementation Checklist

### Discovery Funds Scraper
- [ ] Research Discovery website structure
- [ ] Implement Playwright navigation
- [ ] Extract CAGR from tables
- [ ] Extract volatility and Sharpe ratio
- [ ] Handle pagination
- [ ] Implement caching
- [ ] Add error handling
- [ ] Create API endpoint
- [ ] Write tests (5+ funds)
- [ ] Document in API docs

### SARS Tax Tables Scraper
- [ ] Research SARS website structure
- [ ] Configure Brightdata scraper
- [ ] Parse income tax brackets
- [ ] Parse RA lump-sum brackets
- [ ] Parse rebates and exemptions
- [ ] Validate against known 2025/26 values
- [ ] Implement fallback to hardcoded values
- [ ] Implement caching
- [ ] Create API endpoint
- [ ] Write tests
- [ ] Document in API docs

### Stats SA CPI Scraper
- [ ] Research Stats SA website structure
- [ ] Configure Brightdata scraper
- [ ] Parse CPI tables
- [ ] Extract last 12 months
- [ ] Calculate rolling average
- [ ] Implement SARB fallback
- [ ] Implement caching
- [ ] Create API endpoint
- [ ] Write tests
- [ ] Document in API docs

### Monitoring & Health
- [ ] Create health check endpoint
- [ ] Implement error logging
- [ ] Set up performance monitoring
- [ ] Create alerting for failures
- [ ] Document scraper status in admin UI

---

## 6. Security & Compliance

### Rate Limiting
- Discovery: Max 1 request per 3 seconds
- SARS: Max 1 request per 5 seconds (government site)
- Stats SA: Max 1 request per 5 seconds

### User Agent
Use descriptive user agent:
```
User-Agent: AI-Retirement-Planner/1.0 (Educational Tool; +https://yoursite.com/about)
```

### Robots.txt Compliance
- Check robots.txt before scraping
- Respect `Crawl-delay` directives
- Don't scrape pages marked `Disallow`

### Legal Considerations
- Discovery data: Public fact sheets, educational use
- SARS data: Public information, tax compliance purpose
- Stats SA data: Public statistics, open data policy

---

## 7. Future Enhancements

### Potential Improvements
1. **Real-time scraping:** Trigger scrapes on user request if cache stale
2. **Multiple fund providers:** Expand beyond Discovery (Allan Gray, Coronation, etc.)
3. **Historical CPI database:** Store 10+ years of inflation data
4. **PDF parsing:** Better extraction from SARS budget PDFs
5. **Alert system:** Notify admin when new tax year tables published
6. **Scraper dashboard:** Admin UI to monitor scraper health and trigger manual scrapes

---

## Conclusion

These MCP scrapers form the data foundation of the AI Retirement Planner, enabling accurate financial projections without relying on external APIs. Robust error handling, caching, and fallback strategies ensure the application remains functional even when source websites are temporarily unavailable.
