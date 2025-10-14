# Phase 2 - Task 2.1: PlanAdjustmentsPanel Component

**Agent:** tal-design (UI/UX Specialist)
**Duration:** 3 days
**Start Date:** October 14, 2025
**Status:** IN PROGRESS

---

## Objective

Create a fully responsive, accessible PlanAdjustmentsPanel component that allows users to adjust three financial planning parameters via interactive sliders with real-time visual feedback showing AI recommendations.

---

## Component Structure

### Primary Component
- **File:** `/src/components/advisor/PlanAdjustmentsPanel.tsx`
- **Purpose:** Container component managing three parameter adjustment sliders

### Primitive Components (create these first)
1. **SliderControl.tsx** - Base slider component with label, tooltip, and number input
2. **CurrencySliderControl.tsx** - Specialized slider for currency values (extends SliderControl)
3. **PercentageSliderControl.tsx** - Specialized slider for percentage values (extends SliderControl)

---

## Day 1 Deliverables

### 1. SliderControl Component
**File:** `/src/components/advisor/SliderControl.tsx`

```typescript
interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  aiRecommendation?: number;
  tooltip?: string;
  formatValue?: (value: number) => string;
  className?: string;
}
```

**Features:**
- Shadcn/ui Slider component
- Number input (editable, synchronized with slider)
- Tooltip with info icon (Info from lucide-react)
- AI recommendation marker on slider track (visual dot/line)
- Highlight when value differs from AI recommendation
- Keyboard navigation (Tab, Arrow keys, Enter)
- ARIA labels and live regions

### 2. CurrencySliderControl Component
**File:** `/src/components/advisor/CurrencySliderControl.tsx`

```typescript
interface CurrencySliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  aiRecommendation?: number;
  tooltip?: string;
  className?: string;
}
```

**Features:**
- Wraps SliderControl
- Formats values as ZAR currency (R 12,345.00)
- Uses Intl.NumberFormat for locale-aware formatting

### 3. PercentageSliderControl Component
**File:** `/src/components/advisor/PercentageSliderControl.tsx`

```typescript
interface PercentageSliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  aiRecommendation?: number;
  tooltip?: string;
  decimalPlaces?: number;
  className?: string;
}
```

**Features:**
- Wraps SliderControl
- Formats values as percentages (8.5%)
- Configurable decimal places

---

## Day 2 Deliverables

### 4. PlanAdjustmentsPanel Component
**File:** `/src/components/advisor/PlanAdjustmentsPanel.tsx`

```typescript
interface PlanAdjustmentsPanelProps {
  aiRecommendations: {
    monthlyContribution: number;      // R amount
    investmentReturn: number;         // percentage
    inflationRate: number;            // percentage
  };
  currentAdjustments: {
    monthlyContribution: number;
    investmentReturn: number;
    inflationRate: number;
  };
  impactSummary: {
    retirementNestEggDelta: number;   // R amount (+ or -)
    monthlyDrawdownDelta: number;     // R amount (+ or -)
  } | null;
  isCalculating: boolean;
  onAdjustmentChange: (field: string, value: number) => void;
  onReset: () => void;
}
```

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  Adjust Your Retirement Plan                    │
│  Fine-tune AI recommendations to match your     │
│  personal preferences                           │
├─────────────────────────────────────────────────┤
│                                                 │
│  Monthly RA Contribution         [i]            │
│  ────●────────────────────────────────          │
│  [R 12,345] (AI: R 10,000)                     │
│                                                 │
│  Investment Return Rate          [i]            │
│  ──────────●──────────────────────────          │
│  [8.5%] (AI: 9.0%)                             │
│                                                 │
│  Inflation Rate                  [i]            │
│  ────────────●────────────────────────          │
│  [6.0%] (AI: 6.0%)                             │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ Impact Summary                          │   │
│  │ Retirement Nest Egg: +R 450,000        │   │
│  │ Monthly Drawdown: +R 3,500             │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [Reset to AI Recommendations]                 │
└─────────────────────────────────────────────────┘
```

**Components Used:**
- shadcn/ui Card, CardHeader, CardTitle, CardDescription, CardContent
- shadcn/ui Button (for reset)
- shadcn/ui Badge (for "Calculating..." state)
- CurrencySliderControl (for monthly contribution)
- PercentageSliderControl (for return rate and inflation)

**Responsive Breakpoints:**
- Mobile (<640px): Vertical stack, full width sliders
- Tablet (640px-1024px): Vertical stack, constrained width
- Desktop (>1024px): Horizontal layout possible for impact summary

---

## Day 3 Deliverables

### 5. Unit Tests
**File:** `/src/components/advisor/__tests__/PlanAdjustmentsPanel.test.tsx`

**Test Coverage:**
- Rendering with default props
- Slider value changes trigger onAdjustmentChange
- Number input changes update slider
- Reset button calls onReset
- AI recommendation markers render correctly
- Accessibility (ARIA labels, keyboard navigation)
- Impact summary displays correctly
- Loading state (isCalculating)
- Edge cases (null impactSummary, zero values)

**Target:** 95%+ coverage

---

## Technical Requirements

### Styling
- **Design System:** shadcn/ui components
- **CSS Framework:** Tailwind CSS v4
- **Theme Support:** Light/dark mode via CSS custom properties
- **Colors:**
  - AI recommendation marker: `hsl(var(--accent))`
  - Adjusted value (differs from AI): `hsl(var(--warning))`
  - Impact positive: `hsl(var(--success))`
  - Impact negative: `hsl(var(--destructive))`

### Accessibility (WCAG 2.1 AA)
- All controls keyboard accessible
- ARIA labels on all interactive elements
- Focus visible states
- Screen reader announcements for value changes
- Tooltip accessible via keyboard (Escape to close)
- Minimum touch target size: 44x44px (mobile)
- Color contrast ratio: 4.5:1

### Performance
- Debounced slider onChange (handled by parent hook)
- No unnecessary re-renders (use React.memo if needed)
- Smooth animations (CSS transitions)

### TypeScript
- Strict mode enabled
- No `any` types (use proper type inference)
- Props interfaces exported
- Component documented with JSDoc comments

---

## Integration Points

### Parent Component (AdvisorPage)
The PlanAdjustmentsPanel will be used in the advisor page:

```tsx
<PlanAdjustmentsPanel
  aiRecommendations={session.aiRecommendations}
  currentAdjustments={userAdjustments}
  impactSummary={calculations.impactSummary}
  isCalculating={calculations.isCalculating}
  onAdjustmentChange={handleAdjustmentChange}
  onReset={handleResetToAI}
/>
```

### Hook Integration (Phase 2, Task 2.2)
The `usePlannerCalculations` hook (built by adi-fullstack) will provide:
- `impactSummary` - Calculated impact of adjustments
- `isCalculating` - Loading state during calculations

---

## Design Guidelines

### AI Recommendation Marker
Show AI recommendation as a **small dot** or **vertical line** on the slider track:
- Position: Based on `aiRecommendation` value
- Color: Accent color with 50% opacity
- Size: 8px diameter (dot) or 2px width (line)
- Tooltip on hover: "AI Recommended: [value]"

### Value Comparison
When user adjusts value away from AI recommendation:
- Highlight slider thumb with warning color
- Show badge: "Modified from AI" (optional)
- Display difference: "(AI: [value])"

### Impact Summary Styling
- Positive delta: Green text with "+" prefix
- Negative delta: Red text with "-" prefix
- Zero delta: Neutral text
- Loading state: Skeleton loader or spinner

---

## Example Usage

```tsx
import { PlanAdjustmentsPanel } from '@/components/advisor/PlanAdjustmentsPanel';

export default function AdvisorPage() {
  const [adjustments, setAdjustments] = useState({
    monthlyContribution: 10000,
    investmentReturn: 9.0,
    inflationRate: 6.0,
  });

  const calculations = usePlannerCalculations({
    aiRecommendations: { /* ... */ },
    currentAdjustments: adjustments,
    userProfile: { /* ... */ },
    sessionData: { /* ... */ },
  });

  const handleAdjustmentChange = (field: string, value: number) => {
    setAdjustments((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setAdjustments(aiRecommendations);
  };

  return (
    <PlanAdjustmentsPanel
      aiRecommendations={aiRecommendations}
      currentAdjustments={adjustments}
      impactSummary={calculations.impactSummary}
      isCalculating={calculations.isCalculating}
      onAdjustmentChange={handleAdjustmentChange}
      onReset={handleReset}
    />
  );
}
```

---

## Success Criteria

- [ ] All components render without errors
- [ ] Sliders update correctly on value change
- [ ] Number inputs are synchronized with sliders
- [ ] AI recommendation markers are visible
- [ ] Reset button restores AI recommendations
- [ ] Responsive on mobile/tablet/desktop
- [ ] WCAG 2.1 AA compliant
- [ ] Unit tests pass with 95%+ coverage
- [ ] No TypeScript errors
- [ ] No console warnings

---

## Reference Components

Study these existing components for patterns:
- `/src/components/advisor/SalaryBreakdownTable.tsx` - Accessibility patterns
- `/src/components/advisor/DrawdownScheduleTable.tsx` - Responsive tables
- `/src/components/ui/slider.tsx` - shadcn/ui Slider component

---

## Questions or Blockers?

If you need clarification:
1. Check existing Phase 1 components for patterns
2. Review shadcn/ui documentation for component APIs
3. Ask Rotem (project manager) for architectural decisions

**Start with Day 1 deliverables and report progress at end of each day.**
