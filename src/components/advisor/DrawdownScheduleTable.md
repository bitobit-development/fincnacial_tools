# DrawdownScheduleTable Component

A comprehensive, accessible table component that displays a year-by-year retirement withdrawal schedule with tax calculations, investment returns, and balance projections.

## Features

- **Detailed Year-by-Year Breakdown**: Shows complete financial picture for each retirement year
- **SARS Tax Integration**: Calculates South African income tax using 2025/26 tax brackets and age-based rebates
- **Inflation Adjustments**: Automatically compounds withdrawal amounts based on inflation rate
- **Investment Returns**: Models portfolio growth during retirement
- **Performance Optimized**: Handles 60+ rows efficiently with sticky headers and footers
- **Responsive Design**: Mobile-friendly with horizontal scroll on small screens
- **WCAG 2.1 AA Compliant**: Full accessibility support with ARIA labels and keyboard navigation
- **Visual Warnings**: Highlights low balance and depletion scenarios
- **Summary Statistics**: Displays comprehensive totals and calculations

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `retirementAge` | `number` | Yes | - | Age when retirement begins |
| `currentAge` | `number` | Yes | - | Current age of the user |
| `lifeExpectancy` | `number` | No | `85` | Expected age at end of life |
| `initialBalance` | `number` | Yes | - | Starting retirement balance (Rand) |
| `annualWithdrawal` | `number` | Yes | - | First year withdrawal amount (Rand) |
| `annualReturn` | `number` | Yes | - | Expected annual return (decimal, e.g., 0.07 for 7%) |
| `inflationRate` | `number` | Yes | - | Expected inflation rate (decimal, e.g., 0.06 for 6%) |
| `className` | `string` | No | - | Additional CSS classes for the container |

## Calculation Logic

### Annual Withdrawal Flow

For each year of retirement:

1. **Beginning Balance**: Starting balance for the year (= previous year's ending balance)
2. **Withdrawal Amount**: Adjusted for inflation using compound formula
   ```
   Withdrawal(year) = Withdrawal(year-1) × (1 + inflationRate)
   ```
3. **Tax Calculation**: SARS income tax applied to withdrawal amount
   - Uses progressive tax brackets (2025/26)
   - Applies age-based rebates (65+, 75+)
   - See `src/lib/calculations/tax.ts` for details
4. **Net Income**: After-tax income available to spend
   ```
   Net Income = Withdrawal - Tax
   ```
5. **Investment Return**: Growth on remaining balance after withdrawal
   ```
   Return = (Beginning Balance - Withdrawal) × annualReturn
   ```
6. **Ending Balance**: Balance carried forward to next year
   ```
   Ending Balance = Beginning Balance - Withdrawal + Investment Return
   ```

### Edge Cases Handled

- **Insufficient Funds**: Caps withdrawal at remaining balance
- **Balance Depletion**: Stops projections when balance reaches zero
- **Safety Limit**: Maximum 100 years to prevent infinite loops
- **Low Balance Warning**: Highlights years when balance < 2× annual withdrawal

## Visual Indicators

- **Red Background**: Year when funds are depleted (ending balance = 0)
- **Yellow Background**: Low balance warning (ending balance < 2× withdrawal)
- **Green Text**: Investment returns (positive growth)
- **Red Text**: Tax amounts and depleted balances
- **Sticky Headers**: Table headers remain visible during scroll
- **Sticky Footers**: Summary totals remain visible during scroll

## Summary Statistics

The component displays these calculated statistics:

- **Total Years**: Number of retirement years projected
- **Total Withdrawals**: Sum of all withdrawal amounts
- **Total Tax Paid**: Cumulative SARS tax across all years
- **Total Net Income**: Total after-tax income received
- **Total Investment Returns**: Cumulative portfolio growth
- **Final Balance**: Remaining balance at life expectancy
- **Effective Tax Rate**: Overall tax rate (Total Tax / Total Withdrawals)
- **Funds Depleted**: Year and age when balance reaches zero (if applicable)

## Accessibility Features

### Keyboard Navigation
- Table container is keyboard focusable (`tabIndex={0}`)
- Scrollable via keyboard arrow keys
- All interactive elements are keyboard accessible

### Screen Reader Support
- Semantic HTML table structure
- ARIA labels on container (`aria-label`)
- `role="alert"` on warning messages
- Proper table headers with scope

### Visual Accessibility
- High contrast text colors
- Clear visual hierarchy
- Sufficient touch targets (mobile)
- Color not used as only indicator (patterns + text)
- Readable font sizes (minimum 14px)

### WCAG 2.1 AA Compliance
- ✅ Color contrast ratios meet standards
- ✅ Keyboard accessible
- ✅ Screen reader compatible
- ✅ Text resizable up to 200%
- ✅ Focus indicators visible

## Usage Examples

### Basic Usage

```tsx
import { DrawdownScheduleTable } from "@/components/advisor/DrawdownScheduleTable"

export default function RetirementPlan() {
  return (
    <DrawdownScheduleTable
      retirementAge={65}
      currentAge={40}
      lifeExpectancy={85}
      initialBalance={2000000}
      annualWithdrawal={120000}
      annualReturn={0.07}
      inflationRate={0.06}
    />
  )
}
```

### Dynamic Props from Form

```tsx
const formData = {
  retirementAge: 65,
  currentAge: 45,
  currentSavings: 1500000,
  desiredMonthlyIncome: 10000,
  expectedReturn: 7, // percent
  expectedInflation: 6, // percent
}

return (
  <DrawdownScheduleTable
    retirementAge={formData.retirementAge}
    currentAge={formData.currentAge}
    initialBalance={formData.currentSavings}
    annualWithdrawal={formData.desiredMonthlyIncome * 12}
    annualReturn={formData.expectedReturn / 100}
    inflationRate={formData.expectedInflation / 100}
  />
)
```

### With Custom Styling

```tsx
<DrawdownScheduleTable
  retirementAge={65}
  currentAge={40}
  initialBalance={2000000}
  annualWithdrawal={120000}
  annualReturn={0.07}
  inflationRate={0.06}
  className="my-8 shadow-lg"
/>
```

## Component Structure

```
DrawdownScheduleTable
├── Card (Container)
│   ├── CardHeader
│   │   ├── CardTitle
│   │   └── CardDescription (with warning alert)
│   └── CardContent
│       ├── Scrollable Table Container
│       │   └── Table
│       │       ├── TableHeader (sticky)
│       │       │   └── TableRow with 8 columns
│       │       ├── TableBody
│       │       │   └── TableRow[] (one per year)
│       │       └── TableFooter (sticky)
│       │           └── TableRow with totals
│       └── Summary Statistics Panel
│           └── Grid of statistics (dl/dt/dd)
```

## Performance Considerations

- **Memoization**: Calculations memoized with `React.useMemo`
- **Efficient Rendering**: No virtual scrolling needed (native scroll)
- **CSS Optimization**: Sticky positioning for headers/footers
- **Max Height**: Table limited to 600px to maintain performance
- **Conditional Rendering**: Only renders calculated rows (no placeholders)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari 14+
- Chrome Android 90+

## Dependencies

- `react` - Core library
- `@/components/ui/table` - shadcn/ui Table components
- `@/components/ui/card` - shadcn/ui Card components
- `@/lib/calculations/tax` - SARS tax calculation utilities
- `@/lib/utils` - cn() class name utility

## Related Components

- `StatCard` - Display summary statistics
- `ProjectionChart` - Visualize balance over time
- `TaxBreakdownChart` - Visualize tax distribution

## Future Enhancements

Potential improvements for future iterations:

- Export to CSV/Excel functionality
- Print-friendly styling
- Customizable column visibility
- Multiple withdrawal strategies (fixed vs. percentage)
- Scenario comparison mode (side-by-side)
- Interactive row selection
- Monte Carlo simulation integration
- Historical inflation data
- Healthcare cost modeling
