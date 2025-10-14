# Phase 2 - Task 2.2: usePlannerCalculations Hook

**Agent:** adi-fullstack (Fullstack Engineer)
**Duration:** 2 days
**Start Date:** October 14, 2025
**Status:** IN PROGRESS

---

## Objective

Implement a React hook that performs real-time financial calculations in a Web Worker, recalculating salary breakdowns and drawdown schedules as users adjust planning parameters, with debouncing to prevent excessive recalculations.

---

## Architecture Overview

```
┌─────────────────────────┐
│  React Component        │
│  (PlanAdjustmentsPanel) │
└───────────┬─────────────┘
            │
            │ onChange (debounced)
            │
┌───────────▼─────────────┐
│  usePlannerCalculations │  ← Your Hook
│  Hook                   │
└───────────┬─────────────┘
            │
            │ postMessage()
            │
┌───────────▼─────────────┐
│  Web Worker             │
│  plannerCalculations    │
│  .worker.ts             │
└───────────┬─────────────┘
            │
            │ uses
            │
┌───────────▼─────────────┐
│  Calculation Utilities  │
│  /src/lib/calculations/ │
└─────────────────────────┘
```

---

## Day 1 Deliverables

### 1. Web Worker Implementation
**File:** `/src/workers/plannerCalculations.worker.ts`

**Purpose:**
Perform heavy financial calculations off the main thread to keep UI responsive.

**Input Message Interface:**
```typescript
interface CalculationRequest {
  type: 'CALCULATE';
  payload: {
    aiRecommendations: {
      monthlyContribution: number;
      investmentReturn: number;
      inflationRate: number;
    };
    currentAdjustments: {
      monthlyContribution: number;
      investmentReturn: number;
      inflationRate: number;
    };
    userProfile: {
      grossAnnualIncome: number;
      currentAge: number;
      retirementAge: number;
      startingBalance: number;
      drawdownRate: number;
    };
  };
}
```

**Output Message Interface:**
```typescript
interface CalculationResponse {
  type: 'CALCULATION_COMPLETE' | 'CALCULATION_ERROR';
  payload: {
    salaryBreakdown: SalaryBreakdownData[];
    drawdownSchedule: DrawdownScheduleData[];
    impactSummary: {
      retirementNestEggDelta: number;
      monthlyDrawdownDelta: number;
    };
  } | { error: string };
}
```

**Required Calculations:**

1. **Salary Breakdown (12 months)**
   - Calculate for each month:
     - Gross monthly income
     - RA contribution (adjusted)
     - Tax without RA contribution
     - Tax with RA contribution
     - Tax savings
     - Net monthly income

   Use existing utility: `/src/lib/calculations/tax.ts`

2. **Drawdown Schedule (60+ years)**
   - Project from retirement age to age 100 (or fund depletion)
   - For each year calculate:
     - Beginning balance
     - Withdrawal amount (based on drawdown rate)
     - Tax on withdrawal
     - Investment return on remaining balance
     - Ending balance
     - Inflation-adjusted balance

   Use existing utilities:
   - `/src/lib/calculations/projections.ts` - `projectWithdrawalYear()`
   - `/src/lib/calculations/tax.ts` - `calculateWithdrawalTax()`

3. **Impact Summary**
   - Compare AI baseline to adjusted values
   - Calculate:
     - `retirementNestEggDelta` = (adjusted retirement balance) - (AI baseline balance)
     - `monthlyDrawdownDelta` = (adjusted monthly drawdown) - (AI baseline drawdown)

**Performance Target:** Total calculation time <500ms

---

### 2. React Hook Implementation (Part 1)
**File:** `/src/hooks/usePlannerCalculations.ts`

**Hook Interface:**
```typescript
interface UsePlannerCalculationsParams {
  aiRecommendations: {
    monthlyContribution: number;
    investmentReturn: number;
    inflationRate: number;
  };
  currentAdjustments: {
    monthlyContribution: number;
    investmentReturn: number;
    inflationRate: number;
  };
  userProfile: {
    grossAnnualIncome: number;
    currentAge: number;
    retirementAge: number;
    startingBalance: number;
    drawdownRate: number;
  };
  sessionData: {
    baselineCalculations: {
      retirementBalance: number;
      monthlyDrawdown: number;
    };
  };
}

interface UsePlannerCalculationsReturn {
  salaryBreakdown: SalaryBreakdownData[] | null;
  drawdownSchedule: DrawdownScheduleData[] | null;
  impactSummary: {
    retirementNestEggDelta: number;
    monthlyDrawdownDelta: number;
  } | null;
  isCalculating: boolean;
  error: Error | null;
  reset: () => void;
}

function usePlannerCalculations(
  params: UsePlannerCalculationsParams
): UsePlannerCalculationsReturn;
```

**State Management:**
```typescript
const [salaryBreakdown, setSalaryBreakdown] = useState<SalaryBreakdownData[] | null>(null);
const [drawdownSchedule, setDrawdownSchedule] = useState<DrawdownScheduleData[] | null>(null);
const [impactSummary, setImpactSummary] = useState<ImpactSummary | null>(null);
const [isCalculating, setIsCalculating] = useState(false);
const [error, setError] = useState<Error | null>(null);
```

**Web Worker Lifecycle:**
```typescript
useEffect(() => {
  // Create worker
  const worker = new Worker(
    new URL('../workers/plannerCalculations.worker.ts', import.meta.url),
    { type: 'module' }
  );

  // Handle messages from worker
  worker.onmessage = (event: MessageEvent<CalculationResponse>) => {
    if (event.data.type === 'CALCULATION_COMPLETE') {
      setSalaryBreakdown(event.data.payload.salaryBreakdown);
      setDrawdownSchedule(event.data.payload.drawdownSchedule);
      setImpactSummary(event.data.payload.impactSummary);
      setIsCalculating(false);
    } else if (event.data.type === 'CALCULATION_ERROR') {
      setError(new Error(event.data.payload.error));
      setIsCalculating(false);
    }
  };

  // Handle worker errors
  worker.onerror = (error) => {
    setError(error);
    setIsCalculating(false);
  };

  // Cleanup on unmount
  return () => {
    worker.terminate();
  };
}, []);
```

---

## Day 2 Deliverables

### 3. Debouncing Implementation
**File:** `/src/hooks/usePlannerCalculations.ts` (continued)

**Strategy:**
Use `useMemo` and `useEffect` with debouncing to prevent excessive recalculations.

```typescript
// Debounce adjustment changes (300ms delay)
const debouncedAdjustments = useDebounce(currentAdjustments, 300);

useEffect(() => {
  if (!worker) return;

  setIsCalculating(true);
  setError(null);

  // Send calculation request to worker
  worker.postMessage({
    type: 'CALCULATE',
    payload: {
      aiRecommendations,
      currentAdjustments: debouncedAdjustments,
      userProfile,
    },
  });
}, [debouncedAdjustments, aiRecommendations, userProfile, worker]);
```

**Debounce Utility:**
Create a custom hook or use lodash.debounce:

```typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### 4. Memoization for Performance
Use `useMemo` to prevent recalculating expensive operations:

```typescript
const baselineBalance = useMemo(
  () => sessionData.baselineCalculations.retirementBalance,
  [sessionData]
);

const baselineDrawdown = useMemo(
  () => sessionData.baselineCalculations.monthlyDrawdown,
  [sessionData]
);
```

### 5. Reset Function
```typescript
const reset = useCallback(() => {
  setSalaryBreakdown(null);
  setDrawdownSchedule(null);
  setImpactSummary(null);
  setError(null);
  setIsCalculating(false);
}, []);
```

---

## Data Types

### SalaryBreakdownData
```typescript
interface SalaryBreakdownData {
  month: number;                    // 1-12
  grossIncome: number;              // R amount
  raContribution: number;           // R amount
  taxWithoutRA: number;             // R amount
  taxWithRA: number;                // R amount
  taxSavings: number;               // R amount
  netIncome: number;                // R amount
  effectiveRAContribution: number;  // R amount (after tax benefit)
}
```

### DrawdownScheduleData
```typescript
interface DrawdownScheduleData {
  year: number;                     // Calendar year
  age: number;                      // User's age
  beginningBalance: number;         // R amount
  withdrawalAmount: number;         // R amount
  withdrawalTax: number;            // R amount
  investmentReturn: number;         // R amount
  endingBalance: number;            // R amount
  inflationAdjustedBalance: number; // R amount (real value)
}
```

---

## Calculation Logic

### Salary Breakdown Algorithm
```typescript
function calculateSalaryBreakdown(
  grossAnnualIncome: number,
  monthlyRAContribution: number
): SalaryBreakdownData[] {
  const grossMonthly = grossAnnualIncome / 12;
  const annualRAContribution = monthlyRAContribution * 12;

  // Calculate taxes
  const taxWithoutRA = calculateIncomeTax(grossAnnualIncome, age);
  const taxableIncomeWithRA = grossAnnualIncome - annualRAContribution;
  const taxWithRA = calculateIncomeTax(taxableIncomeWithRA, age);

  const taxSavings = taxWithoutRA - taxWithRA;
  const monthlySavings = taxSavings / 12;

  // Generate 12 months
  return Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    grossIncome: grossMonthly,
    raContribution: monthlyRAContribution,
    taxWithoutRA: taxWithoutRA / 12,
    taxWithRA: taxWithRA / 12,
    taxSavings: monthlySavings,
    netIncome: grossMonthly - monthlyRAContribution - (taxWithRA / 12),
    effectiveRAContribution: monthlyRAContribution - monthlySavings,
  }));
}
```

### Drawdown Schedule Algorithm
```typescript
function calculateDrawdownSchedule(
  retirementBalance: number,
  drawdownRate: number,
  investmentReturn: number,
  inflationRate: number,
  retirementAge: number
): DrawdownScheduleData[] {
  const schedule: DrawdownScheduleData[] = [];
  let balance = retirementBalance;
  let age = retirementAge;
  const currentYear = new Date().getFullYear();
  const baseYear = currentYear;

  while (age <= 100 && balance > 0) {
    const year = currentYear + (age - retirementAge);

    const projection = projectWithdrawalYear(
      balance,
      drawdownRate,
      investmentReturn,
      inflationRate,
      age,
      year,
      baseYear
    );

    schedule.push({
      year,
      age,
      beginningBalance: projection.beginningBalance,
      withdrawalAmount: projection.withdrawals,
      withdrawalTax: projection.taxPaid,
      investmentReturn: projection.investmentReturn,
      endingBalance: projection.endingBalance,
      inflationAdjustedBalance: projection.inflationAdjustedBalance,
    });

    balance = projection.endingBalance;
    age++;
  }

  return schedule;
}
```

### Impact Summary Algorithm
```typescript
function calculateImpactSummary(
  aiBaseline: { retirementBalance: number; monthlyDrawdown: number },
  adjusted: { retirementBalance: number; monthlyDrawdown: number }
): ImpactSummary {
  return {
    retirementNestEggDelta: adjusted.retirementBalance - aiBaseline.retirementBalance,
    monthlyDrawdownDelta: adjusted.monthlyDrawdown - aiBaseline.monthlyDrawdown,
  };
}
```

---

## Testing

### Unit Tests
**File:** `/src/hooks/__tests__/usePlannerCalculations.test.ts`

**Test Cases:**
1. Hook initializes with null values
2. Hook triggers calculation on mount
3. Debouncing prevents excessive calls (300ms delay)
4. Worker calculations complete successfully
5. State updates correctly on worker message
6. Error handling for worker errors
7. Worker cleanup on unmount (no memory leaks)
8. Reset function clears all state
9. Memoization prevents unnecessary recalculations

**Testing Approach:**
- Use `@testing-library/react-hooks` for hook testing
- Mock Web Worker using `jest.mock()`
- Test debouncing with `jest.useFakeTimers()`
- Verify no memory leaks with cleanup verification

**Target:** 90%+ coverage

---

## Performance Requirements

- **Total calculation time:** <500ms (including worker overhead)
- **Debounce delay:** 300ms (configurable)
- **Memory:** No leaks (worker terminated on unmount)
- **Responsiveness:** UI remains interactive during calculations

---

## Integration Points

### Used By (Phase 2, Task 2.3)
The hook will be consumed by the advisor page:

```tsx
import { usePlannerCalculations } from '@/hooks/usePlannerCalculations';

export default function AdvisorPage() {
  const calculations = usePlannerCalculations({
    aiRecommendations,
    currentAdjustments,
    userProfile,
    sessionData,
  });

  return (
    <>
      <PlanAdjustmentsPanel
        impactSummary={calculations.impactSummary}
        isCalculating={calculations.isCalculating}
        // ...
      />
      <SalaryBreakdownTable data={calculations.salaryBreakdown} />
      <DrawdownScheduleTable data={calculations.drawdownSchedule} />
    </>
  );
}
```

---

## Dependencies

### Existing Utilities (DO NOT REWRITE)
- `/src/lib/calculations/tax.ts` - `calculateIncomeTax()`, `calculateWithdrawalTax()`
- `/src/lib/calculations/projections.ts` - `projectWithdrawalYear()`, `projectAccumulationYear()`
- `/src/lib/calculations/core.ts` - `calculateFutureValue()`, `calculatePresentValue()`

### New Dependencies (if needed)
- `lodash.debounce` (optional, can implement custom)

---

## Success Criteria

- [ ] Web Worker performs calculations correctly
- [ ] Calculations complete in <500ms
- [ ] Hook returns all required data
- [ ] Debouncing prevents excessive calls
- [ ] No memory leaks (worker cleanup verified)
- [ ] Error handling works correctly
- [ ] Unit tests pass with 90%+ coverage
- [ ] No TypeScript errors
- [ ] Integration with PlanAdjustmentsPanel successful

---

## Reference Code

Study these files for patterns:
- `/src/lib/calculations/tax.ts` - Tax calculation logic
- `/src/lib/calculations/projections.ts` - Projection algorithms
- `/src/components/advisor/SalaryBreakdownTable.tsx` - Tax calculation usage example

---

## Web Worker Best Practices

1. **Import utilities correctly:**
   ```typescript
   import { calculateIncomeTax } from '../lib/calculations/tax';
   ```

2. **Handle errors gracefully:**
   ```typescript
   try {
     const result = calculate(params);
     self.postMessage({ type: 'COMPLETE', payload: result });
   } catch (error) {
     self.postMessage({ type: 'ERROR', payload: { error: error.message } });
   }
   ```

3. **Use TypeScript for type safety:**
   ```typescript
   /// <reference lib="webworker" />
   declare const self: DedicatedWorkerGlobalScope;
   export {};
   ```

---

## Questions or Blockers?

If you need clarification:
1. Check existing calculation utilities before implementing
2. Review Web Worker documentation for Next.js
3. Ask Rotem (project manager) for architectural decisions

**Start with Day 1 deliverables (Web Worker) and report progress daily.**
