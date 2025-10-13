# Component Library Documentation

**Project:** AI Retirement & Tax Optimization Planner
**Version:** 1.0
**UI Framework:** shadcn/ui + Tailwind CSS v4
**Last Updated:** 2025-10-13

---

## Overview

This document catalogs all shadcn/ui components required for the AI Retirement Planner, along with custom components, usage specifications, and accessibility requirements.

---

## 1. shadcn/ui Components Inventory

### 1.1 Form & Input Components

#### Button
- **Install:** `npx shadcn@latest add button`
- **Usage:** Primary actions (Calculate, Save Plan, Generate Report, Export PDF)
- **Variants:** default, destructive, outline, secondary, ghost, link
- **Sizes:** default, sm, lg, icon
- **Examples:**
  ```tsx
  <Button variant="default" size="lg">Calculate Projection</Button>
  <Button variant="outline">Save Plan</Button>
  <Button variant="destructive" size="sm">Delete</Button>
  ```

#### Input
- **Install:** `npx shadcn@latest add input`
- **Usage:** Text inputs for currency values, plan names
- **Props:** type, placeholder, value, onChange, disabled
- **Examples:**
  ```tsx
  <Input type="text" placeholder="R 100,000" value={balance} />
  <Input type="email" placeholder="Email" />
  ```

#### Label
- **Install:** `npx shadcn@latest add label`
- **Usage:** Accessible labels for all form controls
- **Props:** htmlFor (associates with input id)
- **Examples:**
  ```tsx
  <Label htmlFor="starting-balance">Starting RA Balance</Label>
  <Input id="starting-balance" />
  ```

#### Slider
- **Install:** `npx shadcn@latest add slider`
- **Usage:** Age sliders, percentage inputs (return, inflation, drawdown)
- **Props:** min, max, step, value, onValueChange
- **Examples:**
  ```tsx
  <Slider
    min={18}
    max={80}
    step={1}
    value={[currentAge]}
    onValueChange={(v) => setCurrentAge(v[0])}
  />
  ```

#### Select
- **Install:** `npx shadcn@latest add select`
- **Usage:** Discovery fund selection, scenario type selection
- **Components:** Select, SelectTrigger, SelectContent, SelectItem, SelectValue
- **Examples:**
  ```tsx
  <Select onValueChange={setFundCode}>
    <SelectTrigger>
      <SelectValue placeholder="Select fund" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="DI_BAL_001">Discovery Balanced Fund</SelectItem>
      <SelectItem value="DI_EQ_001">Discovery Equity Fund</SelectItem>
    </SelectContent>
  </Select>
  ```

#### Checkbox
- **Install:** `npx shadcn@latest add checkbox`
- **Usage:** Toggle options (e.g., "Include TFSA", "Show inflation-adjusted values")
- **Props:** checked, onCheckedChange, disabled
- **Examples:**
  ```tsx
  <Checkbox checked={showRealValues} onCheckedChange={setShowRealValues} />
  <Label>Show inflation-adjusted values</Label>
  ```

#### Textarea
- **Install:** `npx shadcn@latest add textarea`
- **Usage:** Plan descriptions, notes
- **Props:** placeholder, value, onChange, rows
- **Examples:**
  ```tsx
  <Textarea
    placeholder="Add notes about this plan..."
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    rows={4}
  />
  ```

---

### 1.2 Layout Components

#### Card
- **Install:** `npx shadcn@latest add card`
- **Usage:** Container for form sections, statistics, charts
- **Components:** Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- **Examples:**
  ```tsx
  <Card>
    <CardHeader>
      <CardTitle>Retirement Projection</CardTitle>
      <CardDescription>Estimate your retirement savings</CardDescription>
    </CardHeader>
    <CardContent>
      {/* Form inputs */}
    </CardContent>
    <CardFooter>
      <Button>Calculate</Button>
    </CardFooter>
  </Card>
  ```

#### Tabs
- **Install:** `npx shadcn@latest add tabs`
- **Usage:** Switch between Input, Results, Scenarios, Report views
- **Components:** Tabs, TabsList, TabsTrigger, TabsContent
- **Examples:**
  ```tsx
  <Tabs defaultValue="input">
    <TabsList>
      <TabsTrigger value="input">Input</TabsTrigger>
      <TabsTrigger value="results">Results</TabsTrigger>
      <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
    </TabsList>
    <TabsContent value="input">{/* Input form */}</TabsContent>
    <TabsContent value="results">{/* Charts & stats */}</TabsContent>
  </Tabs>
  ```

#### Separator
- **Install:** `npx shadcn@latest add separator`
- **Usage:** Visual dividers between sections
- **Props:** orientation (horizontal, vertical)
- **Examples:**
  ```tsx
  <Separator className="my-4" />
  <Separator orientation="vertical" className="h-20" />
  ```

#### Accordion
- **Install:** `npx shadcn@latest add accordion`
- **Usage:** Collapsible sections (e.g., Advanced Options, Help Text)
- **Components:** Accordion, AccordionItem, AccordionTrigger, AccordionContent
- **Examples:**
  ```tsx
  <Accordion type="single" collapsible>
    <AccordionItem value="advanced">
      <AccordionTrigger>Advanced Options</AccordionTrigger>
      <AccordionContent>
        {/* Additional inputs */}
      </AccordionContent>
    </AccordionItem>
  </Accordion>
  ```

---

### 1.3 Feedback Components

#### Badge
- **Install:** `npx shadcn@latest add badge`
- **Usage:** Status indicators (Recommended, High Risk, Cached Data)
- **Variants:** default, secondary, destructive, outline
- **Examples:**
  ```tsx
  <Badge variant="default">Recommended</Badge>
  <Badge variant="destructive">High Risk</Badge>
  <Badge variant="outline">Cached</Badge>
  ```

#### Tooltip
- **Install:** `npx shadcn@latest add tooltip`
- **Usage:** Explain complex terms, show help text
- **Components:** TooltipProvider, Tooltip, TooltipTrigger, TooltipContent
- **Examples:**
  ```tsx
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>
        <span className="underline">CAGR</span>
      </TooltipTrigger>
      <TooltipContent>
        Compound Annual Growth Rate - average yearly return
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
  ```

#### Alert
- **Install:** `npx shadcn@latest add alert`
- **Usage:** Important notices (fund depletion warning, data freshness)
- **Components:** Alert, AlertTitle, AlertDescription
- **Variants:** default, destructive
- **Examples:**
  ```tsx
  <Alert variant="destructive">
    <AlertTitle>Fund Depletion Warning</AlertTitle>
    <AlertDescription>
      Your fund will be depleted at age 78. Consider reducing drawdown rate.
    </AlertDescription>
  </Alert>
  ```

#### Progress
- **Install:** `npx shadcn@latest add progress`
- **Usage:** Show calculation progress, report generation status
- **Props:** value (0-100)
- **Examples:**
  ```tsx
  <Progress value={generationProgress} />
  <span>Generating report: {generationProgress}%</span>
  ```

#### Skeleton
- **Install:** `npx shadcn@latest add skeleton`
- **Usage:** Loading placeholders for async data (fund list, charts)
- **Examples:**
  ```tsx
  <Skeleton className="h-12 w-full" />
  <Skeleton className="h-64 w-full" /> {/* Chart loading */}
  ```

---

### 1.4 Overlay Components

#### Dialog
- **Install:** `npx shadcn@latest add dialog`
- **Usage:** Save plan modal, delete confirmation, settings
- **Components:** Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
- **Examples:**
  ```tsx
  <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Save Plan</DialogTitle>
        <DialogDescription>Give your plan a name</DialogDescription>
      </DialogHeader>
      <Input placeholder="My Retirement Plan" />
      <DialogFooter>
        <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  ```

#### Sheet
- **Install:** `npx shadcn@latest add sheet`
- **Usage:** Mobile navigation, side panel for saved plans
- **Components:** Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription
- **Examples:**
  ```tsx
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="outline">Saved Plans</Button>
    </SheetTrigger>
    <SheetContent side="right">
      <SheetHeader>
        <SheetTitle>Your Saved Plans</SheetTitle>
      </SheetHeader>
      {/* List of plans */}
    </SheetContent>
  </Sheet>
  ```

#### Popover
- **Install:** `npx shadcn@latest add popover`
- **Usage:** Quick actions menu, inline help
- **Components:** Popover, PopoverTrigger, PopoverContent
- **Examples:**
  ```tsx
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="ghost" size="icon">⋮</Button>
    </PopoverTrigger>
    <PopoverContent>
      <Button variant="ghost" size="sm">Edit</Button>
      <Button variant="ghost" size="sm">Duplicate</Button>
      <Button variant="destructive" size="sm">Delete</Button>
    </PopoverContent>
  </Popover>
  ```

#### DropdownMenu
- **Install:** `npx shadcn@latest add dropdown-menu`
- **Usage:** User menu, export options
- **Components:** DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator
- **Examples:**
  ```tsx
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost">Export</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem onClick={exportPDF}>Export as PDF</DropdownMenuItem>
      <DropdownMenuItem onClick={exportCSV}>Export as CSV</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={print}>Print</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
  ```

---

### 1.5 Data Display Components

#### Table
- **Install:** `npx shadcn@latest add table`
- **Usage:** Display scenarios comparison, projection breakdown
- **Components:** Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption
- **Examples:**
  ```tsx
  <Table>
    <TableCaption>Scenario Comparison</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead>Scenario</TableHead>
        <TableHead>Projected Value</TableHead>
        <TableHead>Tax Paid</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>Optimistic</TableCell>
        <TableCell>R 5,200,000</TableCell>
        <TableCell>R 780,000</TableCell>
      </TableRow>
    </TableBody>
  </Table>
  ```

---

## 2. Custom Components

### 2.1 StatCard Component

**Purpose:** Display key statistics with icon, title, value, and optional change indicator.

**Props:**
```typescript
interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: {
    value: number;
    direction: 'up' | 'down';
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
}
```

**Usage:**
```tsx
<StatCard
  title="Total Contributed"
  value="R 2,400,000"
  icon={<TrendingUpIcon />}
  variant="default"
/>

<StatCard
  title="Fund Depletion Age"
  value="78"
  variant="warning"
  change={{ value: -3, direction: 'down' }}
/>
```

---

### 2.2 CurrencyInput Component

**Purpose:** Formatted input for South African Rand with proper thousands separators.

**Props:**
```typescript
interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
}
```

**Usage:**
```tsx
<CurrencyInput
  value={startingBalance}
  onChange={setStartingBalance}
  placeholder="R 0"
/>
// Displays: R 100,000.00
```

---

### 2.3 SliderWithInput Component

**Purpose:** Slider with synchronized numeric input for precise control.

**Props:**
```typescript
interface SliderWithInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string; // '%', 'years', 'R'
  tooltip?: string;
}
```

**Usage:**
```tsx
<SliderWithInput
  label="Annual Return"
  value={annualReturn}
  onChange={setAnnualReturn}
  min={0}
  max={20}
  step={0.1}
  unit="%"
  tooltip="Expected yearly growth rate"
/>
```

---

### 2.4 ProjectionChart Component

**Purpose:** Line chart showing balance projection over time (uses Recharts).

**Props:**
```typescript
interface ProjectionChartProps {
  data: {
    year: number;
    age: number;
    balance: number;
    inflationAdjustedBalance?: number;
  }[];
  showInflationAdjusted: boolean;
  height?: number;
}
```

**Usage:**
```tsx
<ProjectionChart
  data={projectionData}
  showInflationAdjusted={true}
  height={400}
/>
```

---

### 2.5 TaxBreakdownChart Component

**Purpose:** Stacked bar chart showing tax breakdown by type (income, CGT, dividend, etc.).

**Props:**
```typescript
interface TaxBreakdownChartProps {
  data: {
    year: number;
    incomeTax: number;
    cgt: number;
    dividendTax: number;
    totalTax: number;
  }[];
  height?: number;
}
```

**Usage:**
```tsx
<TaxBreakdownChart data={taxData} height={300} />
```

---

### 2.6 ScenarioComparisonCard Component

**Purpose:** Side-by-side scenario comparison with visual indicators.

**Props:**
```typescript
interface ScenarioComparisonCardProps {
  scenarios: Scenario[];
  highlightBest?: boolean;
}
```

**Usage:**
```tsx
<ScenarioComparisonCard
  scenarios={[baselineScenario, optimisticScenario, pessimisticScenario]}
  highlightBest={true}
/>
```

---

### 2.7 FundSelector Component

**Purpose:** Enhanced Select component with fund metadata (CAGR, volatility, Sharpe ratio).

**Props:**
```typescript
interface FundSelectorProps {
  value: string;
  onChange: (fundCode: string) => void;
  funds: DiscoveryFund[];
  loading?: boolean;
}
```

**Usage:**
```tsx
<FundSelector
  value={selectedFundCode}
  onChange={setSelectedFundCode}
  funds={discoveryFunds}
  loading={loadingFunds}
/>
```

---

### 2.8 AIReportPreview Component

**Purpose:** Formatted display of AI-generated report with sections.

**Props:**
```typescript
interface AIReportPreviewProps {
  report: {
    executiveSummary: string;
    projectionAnalysis: string;
    taxOptimization: string;
    riskAssessment: string;
    recommendations: string[];
  };
  loading?: boolean;
}
```

**Usage:**
```tsx
<AIReportPreview report={aiReport} loading={generatingReport} />
```

---

## 3. Layout Structure

### 3.1 Page Layout
```tsx
<div className="min-h-screen bg-background">
  {/* Header */}
  <header className="border-b sticky top-0 z-50 bg-background">
    <div className="container mx-auto px-4 py-4">
      <nav>{/* Logo, User Menu */}</nav>
    </div>
  </header>

  {/* Main Content */}
  <main className="container mx-auto px-4 py-8">
    {/* Page content */}
  </main>

  {/* Footer */}
  <footer className="border-t mt-16">
    <div className="container mx-auto px-4 py-6">
      {/* Footer content */}
    </div>
  </footer>
</div>
```

---

### 3.2 Responsive Grid for Statistics
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <StatCard title="Total Contributed" value="R 2,400,000" />
  <StatCard title="Projected Value" value="R 5,200,000" />
  <StatCard title="Total Tax Paid" value="R 780,000" />
  <StatCard title="Net Income" value="R 4,420,000" />
  <StatCard title="Fund Depletion Age" value="78" variant="warning" />
  <StatCard title="Wealth Retention" value="184%" variant="success" />
</div>
```

---

### 3.3 Two-Column Layout (Input | Results)
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  {/* Input Column */}
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Planner Inputs</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Form inputs */}
      </CardContent>
    </Card>
  </div>

  {/* Results Column */}
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Projection Results</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Charts and statistics */}
      </CardContent>
    </Card>
  </div>
</div>
```

---

## 4. Accessibility Requirements

### 4.1 WCAG 2.1 AA Checklist
- [ ] All interactive elements keyboard accessible (Tab, Enter, Space)
- [ ] Focus indicators visible (outline, ring)
- [ ] Color contrast ratio ≥ 4.5:1 for text
- [ ] Form inputs have associated labels
- [ ] ARIA labels on icon-only buttons
- [ ] Screen reader announcements for dynamic content
- [ ] Skip-to-content link for keyboard users

### 4.2 Component-Specific Accessibility

#### Sliders
```tsx
<Slider
  min={18}
  max={80}
  value={[currentAge]}
  onValueChange={handleChange}
  aria-label="Current age"
  aria-valuemin={18}
  aria-valuemax={80}
  aria-valuenow={currentAge}
/>
```

#### Charts
- Add descriptive captions
- Provide data table alternative
- Use patterns in addition to colors

```tsx
<ProjectionChart
  data={data}
  aria-label="Retirement projection chart showing balance growth over time"
/>
<Table aria-label="Projection data table">
  {/* Tabular data */}
</Table>
```

#### Modals
- Trap focus within dialog
- Return focus to trigger on close
- Close on Escape key

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent aria-describedby="dialog-description">
    <DialogHeader>
      <DialogTitle>Save Plan</DialogTitle>
      <DialogDescription id="dialog-description">
        Enter a name for your retirement plan
      </DialogDescription>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

---

## 5. Dark Mode Support

### 5.1 Theme Toggle
```tsx
'use client';

import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </Button>
  );
}
```

### 5.2 Chart Colors
Use CSS custom properties that adapt to theme:
```css
:root {
  --chart-primary: 220 70% 50%;
  --chart-secondary: 160 60% 45%;
  --chart-danger: 0 70% 50%;
  --chart-success: 140 60% 45%;
}

.dark {
  --chart-primary: 220 70% 60%;
  --chart-secondary: 160 60% 55%;
  --chart-danger: 0 70% 60%;
  --chart-success: 140 60% 55%;
}
```

---

## 6. Component Testing Checklist

### Per Component
- [ ] Renders correctly in light mode
- [ ] Renders correctly in dark mode
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Responsive on mobile (320px+)
- [ ] Responsive on tablet (768px+)
- [ ] Responsive on desktop (1024px+)
- [ ] Loading states render
- [ ] Error states render
- [ ] Disabled states render

### Integration Tests
- [ ] Form submission triggers calculation
- [ ] Slider changes update results in <250ms
- [ ] Charts update when data changes
- [ ] Modals trap focus
- [ ] Tooltips appear on hover/focus

---

## 7. Component Installation Order

```bash
# Core form components (Phase 2)
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add slider
npx shadcn@latest add select
npx shadcn@latest add card
npx shadcn@latest add tabs

# Feedback components (Phase 7)
npx shadcn@latest add badge
npx shadcn@latest add tooltip
npx shadcn@latest add alert
npx shadcn@latest add progress
npx shadcn@latest add skeleton

# Layout components (Phase 7)
npx shadcn@latest add separator
npx shadcn@latest add accordion

# Overlay components (Phase 9)
npx shadcn@latest add dialog
npx shadcn@latest add sheet
npx shadcn@latest add popover
npx shadcn@latest add dropdown-menu

# Data components (Phase 10)
npx shadcn@latest add table
npx shadcn@latest add checkbox
npx shadcn@latest add textarea
```

---

## Conclusion

This component library provides all UI building blocks needed for the AI Retirement Planner. All shadcn/ui components are pre-styled, accessible, and work seamlessly with Tailwind CSS v4. Custom components extend the library with domain-specific functionality (currency formatting, charts, AI report display).
