# Quick Start - Form Infrastructure Integration

**For:** Tal (Frontend Design)
**Time to integrate:** ~30 minutes

---

## Step 1: Import Hooks (2 min)

```typescript
'use client';

import { FormProvider } from 'react-hook-form';
import {
  usePlannerForm,
  useFunds,
  useCalculations,
  useLocalStorage,
} from '@/hooks';
import { savePlan } from '@/app/actions/plans';
```

---

## Step 2: Initialize Form (5 min)

```typescript
export default function PlannerPage() {
  const form = usePlannerForm();
  const formData = form.watch();
  const { setValue, handleSubmit } = form;

  return (
    <FormProvider {...form}>
      {/* Your UI here */}
    </FormProvider>
  );
}
```

---

## Step 3: Connect Calculations (5 min)

```typescript
const { results, loading } = useCalculations(formData);

// Use in results panel
{results && (
  <PlannerResultsPanel
    statistics={results.statistics}
    projections={results.projections}
  />
)}

{loading && <LoadingSpinner />}
```

---

## Step 4: Connect Funds (5 min)

```typescript
const { funds, loading: fundsLoading } = useFunds();

<FundSelector
  funds={funds}
  loading={fundsLoading}
  value={formData.fundCode}
  onChange={(code) => setValue('fundCode', code)}
/>
```

---

## Step 5: Connect Sliders (5 min)

```typescript
<SliderCard
  label="Current Age"
  value={formData.currentAge}
  min={18}
  max={80}
  onChange={(value) => setValue('currentAge', value)}
/>

<SliderCard
  label="Annual Return"
  value={formData.annualReturn}
  min={-10}
  max={30}
  step={0.5}
  suffix="%"
  onChange={(value) => setValue('annualReturn', value)}
/>
```

---

## Step 6: Add Save Button (5 min)

```typescript
const onSubmit = async (data: PlannerFormData) => {
  const formDataObj = new FormData();
  formDataObj.append('userId', userId); // From auth
  formDataObj.append('planName', 'My Plan');

  Object.entries(data).forEach(([key, value]) => {
    if (value != null) formDataObj.append(key, value.toString());
  });

  const response = await savePlan(formDataObj);

  if (response.success) {
    toast.success('Plan saved!');
  } else {
    toast.error(response.error);
  }
};

<button onClick={handleSubmit(onSubmit)}>
  Save Plan
</button>
```

---

## Step 7: Auto-populate Fund (3 min)

```typescript
useEffect(() => {
  if (formData.fundCode && funds.length > 0) {
    const fund = funds.find(f => f.fundCode === formData.fundCode);
    if (fund?.cagr5y) {
      setValue('annualReturn', fund.cagr5y);
      toast.info(`Annual return updated to ${fund.cagr5y}%`);
    }
  }
}, [formData.fundCode, funds, setValue]);
```

---

## Complete Example

See: `/src/app/planner/example-integration.tsx`

---

## Need Help?

- **Full Guide:** `/INTEGRATION_GUIDE.md`
- **API Reference:** In INTEGRATION_GUIDE.md
- **Types:** All exported from `@/hooks`

---

## Ready to Go!

All backend is ready. Just connect your UI components. 🚀
