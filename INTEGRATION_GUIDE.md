# Form Infrastructure Integration Guide

**Created by:** Adi (Fullstack Engineer)
**Date:** 2025-10-13
**Status:** Ready for Integration

This guide provides complete documentation for integrating the form infrastructure into the AI Retirement Planner.

---

## Table of Contents

1. [Overview](#overview)
2. [Files Created](#files-created)
3. [Integration Steps](#integration-steps)
4. [API Reference](#api-reference)
5. [Examples](#examples)
6. [Testing Checklist](#testing-checklist)

---

## Overview

The form infrastructure provides:

- **Zod Validation Schema** - Type-safe form validation
- **React Hook Form Integration** - Form state management
- **Real-time Calculations** - Debounced calculation engine
- **Data Fetching** - Discovery funds with SWR caching
- **Local Storage** - Auto-save form state
- **Server Actions** - Database operations (save/load plans)

### Architecture Diagram

```
┌─────────────────┐
│   Planner UI    │ (Tal's Components)
│  (page.tsx)     │
└────────┬────────┘
         │
         ├──► usePlannerForm()      → Form state + validation
         ├──► useFunds()            → Discovery funds API
         ├──► useCalculations()     → Real-time projections
         ├──► useLocalStorage()     → Auto-save drafts
         └──► Server Actions        → Save/Load from DB
                 ├─ savePlan()
                 ├─ loadPlans()
                 └─ deletePlan()
```

---

## Files Created

### 1. Schemas

| File | Path | Purpose |
|------|------|---------|
| `plannerSchema.ts` | `/src/lib/schemas/plannerSchema.ts` | Zod validation schema |
| `index.ts` | `/src/lib/schemas/index.ts` | Barrel export |

### 2. Hooks

| File | Path | Purpose |
|------|------|---------|
| `usePlannerForm.ts` | `/src/hooks/usePlannerForm.ts` | Form state management |
| `useLocalStorage.ts` | `/src/hooks/useLocalStorage.ts` | Local storage persistence |
| `useFunds.ts` | `/src/hooks/useFunds.ts` | Funds data fetching (SWR) |
| `useCalculations.ts` | `/src/hooks/useCalculations.ts` | Real-time calculations |
| `index.ts` | `/src/hooks/index.ts` | Barrel export |

### 3. Server Actions

| File | Path | Purpose |
|------|------|---------|
| `plans.ts` | `/src/app/actions/plans.ts` | Database operations |

### 4. Examples

| File | Path | Purpose |
|------|------|---------|
| `example-integration.tsx` | `/src/app/planner/example-integration.tsx` | Full integration example |

---

## Integration Steps

### Step 1: Import Required Dependencies

```tsx
'use client';

import { FormProvider } from 'react-hook-form';
import {
  usePlannerForm,
  useFunds,
  useCalculations,
  useLocalStorage,
} from '@/hooks';
import {
  savePlan,
  loadDefaultPlan,
  planToFormData,
} from '@/app/actions/plans';
```

### Step 2: Initialize Form

```tsx
export default function PlannerPage() {
  // Initialize form with default values
  const form = usePlannerForm();
  const { watch, setValue, handleSubmit } = form;

  // Watch form data for calculations
  const formData = watch();

  return (
    <FormProvider {...form}>
      {/* Your form UI */}
    </FormProvider>
  );
}
```

### Step 3: Fetch Discovery Funds

```tsx
const { funds, loading, error } = useFunds();

// Use in FundSelector component
<FundSelector
  funds={funds}
  loading={loading}
  error={error}
  value={formData.fundCode}
  onChange={(fundCode) => setValue('fundCode', fundCode)}
/>
```

### Step 4: Run Real-time Calculations

```tsx
const { results, loading: calcLoading, error: calcError } = useCalculations(formData);

// Use in results panel
{results && (
  <PlannerResultsPanel
    statistics={results.statistics}
    projections={results.projections}
    loading={calcLoading}
  />
)}
```

### Step 5: Auto-save to Local Storage

```tsx
const [, saveToLocalStorage] = useLocalStorage('planner-form-draft', formData);

useEffect(() => {
  const timer = setTimeout(() => {
    saveToLocalStorage(formData);
  }, 500); // Debounce 500ms

  return () => clearTimeout(timer);
}, [formData, saveToLocalStorage]);
```

### Step 6: Save to Database

```tsx
const onSubmit = async (data: PlannerFormData) => {
  const formDataObj = new FormData();
  formDataObj.append('userId', userId); // From auth context
  formDataObj.append('planName', 'My Retirement Plan');

  // Append all form fields
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formDataObj.append(key, value.toString());
    }
  });

  const response = await savePlan(formDataObj);

  if (response.success) {
    // Show success toast
  } else {
    // Show error toast
  }
};
```

### Step 7: Auto-populate Fund Data

```tsx
useEffect(() => {
  if (formData.fundCode && funds.length > 0) {
    const selectedFund = funds.find((f) => f.fundCode === formData.fundCode);

    if (selectedFund && selectedFund.cagr5y) {
      setValue('annualReturn', selectedFund.cagr5y);
      setValue('fundName', selectedFund.fundName);
      // Show toast: "Annual return updated from fund data"
    }
  }
}, [formData.fundCode, funds, setValue]);
```

---

## API Reference

### Hooks

#### `usePlannerForm(defaultValues?)`

**Returns:** `UseFormReturn<PlannerFormData>`

```tsx
const form = usePlannerForm({
  currentAge: 40,
  retirementAge: 67,
});
```

**Methods:**
- `watch()` - Watch form values
- `setValue(field, value)` - Update field value
- `handleSubmit(onSubmit)` - Form submission handler
- `reset()` - Reset form to defaults
- `formState.errors` - Validation errors

---

#### `useFunds(fundType?)`

**Returns:** `{ funds, loading, error, isStale, cacheAge, mutate }`

```tsx
const { funds, loading, error } = useFunds();
const { funds: equityFunds } = useFunds('Equity');
```

**Response:**
- `funds: DiscoveryFund[]` - Array of funds
- `loading: boolean` - Loading state
- `error: Error | null` - Error state
- `isStale: boolean` - Cache is > 24 hours old
- `cacheAge: number` - Cache age in hours
- `mutate: () => void` - Manually revalidate

---

#### `useCalculations(formData, options?)`

**Returns:** `{ results, loading, error }`

```tsx
const { results, loading, error } = useCalculations(formData, {
  debounceMs: 250, // Default: 250ms
  enabled: true,   // Default: true
});
```

**Response:**
- `results.projections: ProjectionYear[]` - Year-by-year breakdown
- `results.statistics: Statistics` - Aggregate statistics
- `loading: boolean` - Calculation in progress
- `error: Error | null` - Calculation error

---

#### `useLocalStorage<T>(key, initialValue)`

**Returns:** `[storedValue, setValue, removeValue]`

```tsx
const [draft, saveDraft, clearDraft] = useLocalStorage<PlannerFormData>(
  'planner-draft',
  defaultPlannerValues
);
```

**Features:**
- SSR-safe
- Automatic JSON serialization
- Cross-tab synchronization
- Error handling (quota exceeded)

---

### Server Actions

#### `savePlan(formData)`

**Signature:** `(formData: FormData) => Promise<ActionResponse>`

```tsx
const response = await savePlan(formData);

if (response.success) {
  console.log('Saved plan:', response.data);
} else {
  console.error('Error:', response.error);
}
```

**FormData Fields:**
- `id` (optional) - Plan ID for updates
- `userId` (required) - User ID
- `planName` (required) - Plan name
- `description` (optional) - Plan description
- All `PlannerFormData` fields

---

#### `loadPlans(userId)`

**Signature:** `(userId: string) => Promise<ActionResponse>`

```tsx
const response = await loadPlans(userId);

if (response.success) {
  const plans = response.data; // Array of plans
}
```

---

#### `loadDefaultPlan(userId)`

**Signature:** `(userId: string) => Promise<ActionResponse>`

```tsx
const response = await loadDefaultPlan(userId);

if (response.success && response.data) {
  const formValues = planToFormData(response.data);
  // Load into form
}
```

---

#### `deletePlan(planId)`

**Signature:** `(planId: string) => Promise<ActionResponse>`

```tsx
const response = await deletePlan(planId);

if (response.success) {
  // Plan deleted, revalidates /planner automatically
}
```

---

### Types

#### `PlannerFormData`

```typescript
type PlannerFormData = {
  currentAge: number;           // 18-80
  retirementAge: number;        // 40-100
  startingBalance: number;      // >= 0
  monthlyContribution: number;  // >= 0
  annualReturn: number;         // -10 to 30 (%)
  inflation: number;            // 0 to 20 (%)
  drawdownRate: number;         // 0 to 20 (%)
  fundCode?: string;
  fundName?: string;
  targetMonthlyToday?: number;
};
```

#### `Statistics`

```typescript
type Statistics = {
  totalContributed: number;
  projectedValueAtRetirement: number;
  totalWithdrawn: number;
  totalTaxPaid: number;
  netAfterTaxIncome: number;
  fundDepletionAge: number | null;
  wealthRetentionRatio: number;
  effectiveTaxRate: number;
};
```

#### `ProjectionYear`

```typescript
type ProjectionYear = {
  year: number;
  age: number;
  beginningBalance: number;
  contributions: number;
  investmentReturn: number;
  withdrawals: number;
  taxPaid: number;
  endingBalance: number;
  inflationAdjustedBalance: number;
};
```

---

## Examples

### Example 1: Basic Integration

```tsx
'use client';

import { FormProvider } from 'react-hook-form';
import { usePlannerForm, useCalculations } from '@/hooks';

export default function SimplePlanner() {
  const form = usePlannerForm();
  const formData = form.watch();
  const { results, loading } = useCalculations(formData);

  return (
    <FormProvider {...form}>
      <div>
        <h1>Retirement Planner</h1>
        {loading ? <div>Calculating...</div> : null}
        {results && (
          <div>
            Projected Value: R{results.statistics.projectedValueAtRetirement.toLocaleString()}
          </div>
        )}
      </div>
    </FormProvider>
  );
}
```

### Example 2: With Fund Selector

```tsx
const { funds, loading: fundsLoading } = useFunds();

<select
  value={formData.fundCode || ''}
  onChange={(e) => form.setValue('fundCode', e.target.value)}
>
  <option value="">Select a fund</option>
  {funds.map(fund => (
    <option key={fund.fundCode} value={fund.fundCode}>
      {fund.fundName} (CAGR 5Y: {fund.cagr5y}%)
    </option>
  ))}
</select>
```

### Example 3: Save Plan

```tsx
const handleSave = async () => {
  const data = form.getValues();
  const formDataObj = new FormData();

  formDataObj.append('userId', 'user-123');
  formDataObj.append('planName', 'My Plan');

  Object.entries(data).forEach(([key, value]) => {
    if (value != null) formDataObj.append(key, value.toString());
  });

  const response = await savePlan(formDataObj);

  if (response.success) {
    alert('Plan saved!');
  }
};
```

---

## Testing Checklist

### Form Validation
- [ ] Age inputs validate correctly (18-80, 40-100)
- [ ] Retirement age > current age enforced
- [ ] At least 5 years until retirement enforced
- [ ] Negative values rejected for financial inputs
- [ ] Percentage ranges enforced (-10 to 30%, 0 to 20%, etc.)
- [ ] Error messages display correctly

### Data Fetching
- [ ] Discovery funds load on page mount
- [ ] Loading state displays while fetching
- [ ] Error state displays on fetch failure
- [ ] Funds cached for 1 hour (no duplicate requests)
- [ ] Fund selector shows all funds

### Calculations
- [ ] Calculations run on form change
- [ ] Debouncing works (no lag with sliders)
- [ ] Statistics calculate correctly
- [ ] Projections generate year-by-year data
- [ ] Loading state shows during calculation
- [ ] Error handling works for invalid inputs

### Auto-populate
- [ ] Selecting fund updates annual return
- [ ] Fund name updates when fund selected
- [ ] Notification displays when auto-populated
- [ ] Original value preserved if fund has no CAGR

### Local Storage
- [ ] Form state saves to localStorage
- [ ] Draft restores on page reload
- [ ] Auto-save works with 500ms debounce
- [ ] Clear button removes draft
- [ ] SSR doesn't break (no hydration errors)

### Server Actions
- [ ] Save plan works (create)
- [ ] Save plan works (update)
- [ ] Load plans returns all user plans
- [ ] Load default plan works
- [ ] Delete plan works
- [ ] Validation errors return to client
- [ ] Page revalidates after save/delete

### Integration
- [ ] FormProvider wraps entire form
- [ ] All sliders update form state
- [ ] Results panel shows live data
- [ ] Chart updates in real-time
- [ ] Save button submits correctly
- [ ] Reset button clears form

---

## Performance Notes

1. **Debouncing:** Calculations debounce at 250ms for smooth slider interactions
2. **SWR Caching:** Funds cache for 1 hour, reducing API calls
3. **Memoization:** Calculations memoize to prevent unnecessary recalculations
4. **Local Storage:** Auto-save debounces at 500ms to avoid excessive writes

---

## Error Handling

All hooks return consistent error states:

```tsx
const { data, loading, error } = useHook();

if (loading) return <Spinner />;
if (error) return <ErrorMessage message={error.message} />;
return <Content data={data} />;
```

Server Actions return:

```tsx
type ActionResponse = {
  success: boolean;
  data?: any;
  error?: string;
};
```

---

## Next Steps

1. **Tal (Frontend Design):** Integrate hooks into UI components
2. **Oren (Backend Services):** No action needed, all backend ready
3. **Gal (Database):** Verify schema supports all plan fields
4. **Uri (Testing):** Write integration tests using this guide

---

## Support

For questions or issues:
- Check `/src/app/planner/example-integration.tsx` for full example
- Review individual hook files for detailed documentation
- All functions have TypeScript types for IntelliSense support

---

**Status:** ✅ Ready for Production Integration
