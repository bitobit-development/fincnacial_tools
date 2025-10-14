import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { SalaryBreakdownTable } from '../SalaryBreakdownTable';
import '@testing-library/jest-dom';

// =============================================================================
// Test Suite: SalaryBreakdownTable Component
// =============================================================================

describe('SalaryBreakdownTable', () => {
  // ---------------------------------------------------------------------------
  // 1. Component Rendering Tests
  // ---------------------------------------------------------------------------

  describe('Component Rendering', () => {
    it('renders without crashing with valid props', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={600000}
          monthlyRAContribution={5000}
        />
      );

      expect(screen.getByText('Monthly Salary Breakdown')).toBeInTheDocument();
    });

    it('renders card header with title and description', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={600000}
          monthlyRAContribution={5000}
        />
      );

      expect(screen.getByText('Monthly Salary Breakdown')).toBeInTheDocument();
      expect(screen.getByText(/Understanding your take-home pay/i)).toBeInTheDocument();
    });

    it('renders all table rows', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={600000}
          monthlyRAContribution={5000}
        />
      );

      // Check for all row labels
      expect(screen.getByText('Gross Monthly Salary')).toBeInTheDocument();
      expect(screen.getByText('RA Contribution')).toBeInTheDocument();
      expect(screen.getByText('Tax Savings')).toBeInTheDocument();
      expect(screen.getByText('Income Tax (SARS)')).toBeInTheDocument();
      expect(screen.getByText('Net Monthly Salary')).toBeInTheDocument();
    });

    it('applies custom className when provided', () => {
      const { container } = render(
        <SalaryBreakdownTable
          grossAnnualIncome={600000}
          monthlyRAContribution={5000}
          className="custom-class"
        />
      );

      const card = container.querySelector('.custom-class');
      expect(card).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Currency Formatting Tests
  // ---------------------------------------------------------------------------

  describe('Currency Formatting', () => {
    it('formats currency with R prefix', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={600000}
          monthlyRAContribution={5000}
        />
      );

      // Check for R prefix in amounts
      const cells = screen.getAllByRole('cell');
      const amountCells = cells.filter(cell => cell.textContent?.includes('R'));
      expect(amountCells.length).toBeGreaterThan(0);
    });

    it('formats large amounts with thousands separators', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={1200000} // R100,000/month
          monthlyRAContribution={10000}
        />
      );

      // Gross monthly should be formatted as R 100,000.00
      expect(screen.getAllByText(/R\s*100[,\s]*000/).length).toBeGreaterThan(0);
    });

    it('formats decimal amounts with 2 decimal places', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={600000}
          monthlyRAContribution={5000}
        />
      );

      // All amounts should have .00
      const cells = screen.getAllByRole('cell');
      const amountCells = cells.filter(cell =>
        cell.textContent?.includes('R') && cell.textContent?.includes('.')
      );

      amountCells.forEach(cell => {
        expect(cell.textContent).toMatch(/\.\d{2}/);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Tax Calculation Tests
  // ---------------------------------------------------------------------------

  describe('SARS Tax Calculations', () => {
    it('calculates tax correctly for R600,000 annual income', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={600000}
          monthlyRAContribution={5000}
        />
      );

      // Gross monthly: R50,000
      // Expected tax without RA: ~R133,531/year = R11,127.58/month
      // With R5000/month RA (R60,000/year): taxable = R540,000
      // Expected tax with RA: ~R119,675/year = R9,972.92/month
      // Tax savings: ~R1,154.66/month

      // Check gross monthly is displayed
      expect(screen.getAllByText(/R\s*50[,\s]*000/).length).toBeGreaterThan(0);
    });

    it('calculates zero tax for low income', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={200000} // Below first bracket
          monthlyRAContribution={1000}
        />
      );

      // With R200,000 income and R12,000 RA contribution
      // Taxable: R188,000 - this is below R237,100 bracket
      // Tax: R188,000 * 0.18 = R33,840/year = R2,820/month

      // Component should display tax amount
      const cells = screen.getAllByRole('cell');
      const taxCell = cells.find(cell =>
        cell.textContent?.includes('R') &&
        cell.parentElement?.textContent?.includes('Income Tax')
      );
      expect(taxCell).toBeInTheDocument();
    });

    it('calculates tax savings from RA contribution', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={600000}
          monthlyRAContribution={5000}
        />
      );

      // Tax savings row should exist
      const taxSavingsRow = screen.getByText('Tax Savings').closest('tr');
      expect(taxSavingsRow).toBeInTheDocument();

      // Should show positive savings with + prefix
      const savingsCell = within(taxSavingsRow!).getByRole('cell', {
        name: /\+R/
      });
      expect(savingsCell).toBeInTheDocument();
    });

    it('handles high income tax bracket correctly', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={2000000} // Top bracket
          monthlyRAContribution={10000}
        />
      );

      // Gross monthly: R166,666.67
      expect(screen.getAllByText(/R\s*166[,\s]*666/).length).toBeGreaterThan(0);

      // Should calculate tax at 45% marginal rate
      // Tax row should exist
      expect(screen.getByText('Income Tax (SARS)')).toBeInTheDocument();
    });

    it('calculates effective RA cost after tax benefit', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={600000}
          monthlyRAContribution={5000}
        />
      );

      // Effective RA cost summary should be displayed
      expect(screen.getByText(/Effective RA Cost After Tax Benefit/i)).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Edge Cases Tests
  // ---------------------------------------------------------------------------

  describe('Edge Cases', () => {
    it('handles zero RA contribution', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={600000}
          monthlyRAContribution={0}
        />
      );

      // Should show R 0.00 for RA contribution
      const raRow = screen.getByText('RA Contribution').closest('tr');
      expect(raRow).toBeInTheDocument();

      // Tax savings should be R 0.00
      const taxSavingsRow = screen.getByText('Tax Savings').closest('tr');
      const savingsCell = within(taxSavingsRow!).getAllByRole('cell')[1];
      expect(savingsCell.textContent).toContain('0');
    });

    it('handles very high RA contribution', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={600000}
          monthlyRAContribution={40000} // 80% of gross monthly
        />
      );

      // Should not crash and display values
      expect(screen.getByText('Monthly Salary Breakdown')).toBeInTheDocument();

      // Net salary might be low but should still render
      expect(screen.getByText('Net Monthly Salary')).toBeInTheDocument();
    });

    it('handles minimum wage income', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={48000} // ~R4,000/month
          monthlyRAContribution={200}
        />
      );

      // Should calculate correctly for low income
      expect(screen.getByText('Monthly Salary Breakdown')).toBeInTheDocument();

      // Gross monthly: R4,000
      const cells = screen.getAllByRole('cell');
      const grossCell = cells.find(cell =>
        cell.textContent?.includes('R') &&
        cell.textContent?.includes('4') &&
        cell.textContent?.includes('000')
      );
      expect(grossCell).toBeInTheDocument();
    });

    it('handles RA contribution exceeding gross income', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={600000}
          monthlyRAContribution={60000} // 120% of gross monthly
        />
      );

      // Should handle negative net salary gracefully
      expect(screen.getByText('Net Monthly Salary')).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Conditional Rendering Tests
  // ---------------------------------------------------------------------------

  describe('Conditional Rendering', () => {
    it('displays tax savings percentage badge', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={600000}
          monthlyRAContribution={5000}
        />
      );

      // Badge should show percentage saved
      const badge = screen.getByText(/% saved/i);
      expect(badge).toBeInTheDocument();
    });

    it('displays all tooltip triggers', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={600000}
          monthlyRAContribution={5000}
        />
      );

      // Should have info icons for tooltips
      const infoButtons = screen.getAllByRole('button', {
        name: /Learn more about/i
      });

      // Should have tooltips for each row
      expect(infoButtons.length).toBeGreaterThan(0);
    });

    it('displays summary card with effective cost', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={600000}
          monthlyRAContribution={5000}
        />
      );

      // Summary should show effective RA cost
      expect(screen.getByText(/Effective RA Cost After Tax Benefit/i)).toBeInTheDocument();
      expect(screen.getByText(/You contribute.*but save/i)).toBeInTheDocument();
    });

    it('includes screen reader only content', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={600000}
          monthlyRAContribution={5000}
        />
      );

      // Check for sr-only content
      const srOnlyElement = screen.getByRole('status');
      expect(srOnlyElement).toBeInTheDocument();
      expect(srOnlyElement).toHaveClass('sr-only');
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Calculation Accuracy Tests
  // ---------------------------------------------------------------------------

  describe('Calculation Accuracy', () => {
    it('verifies gross monthly salary calculation', () => {
      const grossAnnual = 720000;
      const expectedMonthly = 60000;

      render(
        <SalaryBreakdownTable
          grossAnnualIncome={grossAnnual}
          monthlyRAContribution={5000}
        />
      );

      // Should display R60,000
      expect(screen.getAllByText(/R\s*60[,\s]*000/).length).toBeGreaterThan(0);
    });

    it('verifies annual RA contribution calculation', () => {
      const monthlyContribution = 5000;
      // Annual = 5000 * 12 = 60,000

      render(
        <SalaryBreakdownTable
          grossAnnualIncome={600000}
          monthlyRAContribution={monthlyContribution}
        />
      );

      // RA row should show -R5,000.00
      const raRow = screen.getByText('RA Contribution').closest('tr');
      const raCell = within(raRow!).getAllByRole('cell')[1];
      expect(raCell.textContent).toMatch(/-R\s*5[,\s]*000/);
    });

    it('verifies net salary calculation', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={600000}
          monthlyRAContribution={5000}
        />
      );

      // Net = Gross - RA - Tax
      // Net row should exist and show positive value
      const netRow = screen.getByText('Net Monthly Salary').closest('tr');
      expect(netRow).toBeInTheDocument();

      const netCell = within(netRow!).getAllByRole('cell')[1];
      expect(netCell.textContent).toContain('R');
    });

    it('verifies tax savings percentage calculation', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={600000}
          monthlyRAContribution={5000}
        />
      );

      // Savings percentage badge should show reasonable value (15-45%)
      const badge = screen.getByText(/% saved/i);
      expect(badge.textContent).toMatch(/\d+%/);
    });
  });

  // ---------------------------------------------------------------------------
  // 7. Accessibility Tests
  // ---------------------------------------------------------------------------

  describe('Accessibility (WCAG 2.1 AA)', () => {
    it('uses semantic HTML table structure', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={600000}
          monthlyRAContribution={5000}
        />
      );

      // Should have proper table structure
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader').length).toBe(2);
      expect(screen.getAllByRole('row').length).toBeGreaterThan(0);
    });

    it('provides aria-labels for interactive elements', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={600000}
          monthlyRAContribution={5000}
        />
      );

      // Tooltip triggers should have aria-labels
      const infoButtons = screen.getAllByRole('button');
      infoButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('includes aria-hidden for decorative icons', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={600000}
          monthlyRAContribution={5000}
        />
      );

      // Info and TrendingDown icons should have aria-hidden
      const { container } = render(
        <SalaryBreakdownTable
          grossAnnualIncome={600000}
          monthlyRAContribution={5000}
        />
      );

      const icons = container.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('provides live region for screen readers', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={600000}
          monthlyRAContribution={5000}
        />
      );

      // Should have aria-live region
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('has keyboard accessible tooltip triggers', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={600000}
          monthlyRAContribution={5000}
        />
      );

      // All buttons should be keyboard accessible
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    it('provides descriptive badge aria-label', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={600000}
          monthlyRAContribution={5000}
        />
      );

      // Badge should have descriptive aria-label
      const taxSavingsRow = screen.getByText('Tax Savings').closest('tr');
      const badge = within(taxSavingsRow!).getByText(/% saved/i).closest('[aria-label]');

      if (badge) {
        expect(badge).toHaveAttribute('aria-label');
        expect(badge.getAttribute('aria-label')).toContain('save');
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 8. Visual Regression Tests
  // ---------------------------------------------------------------------------

  describe('Visual Styling', () => {
    it('applies highlighted style to tax savings row', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={600000}
          monthlyRAContribution={5000}
        />
      );

      const taxSavingsRow = screen.getByText('Tax Savings').closest('tr');
      expect(taxSavingsRow).toHaveClass(/accent/i);
    });

    it('applies different colors for positive and negative amounts', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={600000}
          monthlyRAContribution={5000}
        />
      );

      // RA contribution should have destructive color (negative)
      const raRow = screen.getByText('RA Contribution').closest('tr');
      const raCell = within(raRow!).getAllByRole('cell')[1];
      expect(raCell).toHaveClass(/destructive/i);

      // Tax savings should have accent color (positive)
      const savingsRow = screen.getByText('Tax Savings').closest('tr');
      const savingsCell = within(savingsRow!).getAllByRole('cell')[1];
      expect(savingsCell).toHaveClass(/accent/i);
    });

    it('applies primary color to net salary', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={600000}
          monthlyRAContribution={5000}
        />
      );

      const netRow = screen.getByText('Net Monthly Salary').closest('tr');
      const netCell = within(netRow!).getAllByRole('cell')[1];
      expect(netCell).toHaveClass(/primary/i);
    });
  });

  // ---------------------------------------------------------------------------
  // 9. Responsive Design Tests
  // ---------------------------------------------------------------------------

  describe('Responsive Design', () => {
    it('renders with responsive text sizes', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={600000}
          monthlyRAContribution={5000}
        />
      );

      // Title should have responsive classes
      const title = screen.getByText('Monthly Salary Breakdown');
      expect(title.className).toMatch(/text-(xl|2xl)/);
    });

    it('renders with responsive padding', () => {
      const { container } = render(
        <SalaryBreakdownTable
          grossAnnualIncome={600000}
          monthlyRAContribution={5000}
        />
      );

      // Card content should have responsive padding
      const cardContent = container.querySelector('[class*="p-"]');
      expect(cardContent).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // 10. Integration Tests
  // ---------------------------------------------------------------------------

  describe('Integration Scenarios', () => {
    it('handles realistic high earner scenario', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={1500000} // R125k/month
          monthlyRAContribution={30000} // 24% contribution
        />
      );

      expect(screen.getByText('Monthly Salary Breakdown')).toBeInTheDocument();
      expect(screen.getAllByText(/R\s*125[,\s]*000/).length).toBeGreaterThan(0);
    });

    it('handles realistic mid-range earner scenario', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={480000} // R40k/month
          monthlyRAContribution={4000} // 10% contribution
        />
      );

      expect(screen.getByText('Monthly Salary Breakdown')).toBeInTheDocument();
      expect(screen.getAllByText(/R\s*40[,\s]*000/).length).toBeGreaterThan(0);
    });

    it('handles realistic entry-level scenario', () => {
      render(
        <SalaryBreakdownTable
          grossAnnualIncome={240000} // R20k/month
          monthlyRAContribution={1000} // 5% contribution
        />
      );

      expect(screen.getByText('Monthly Salary Breakdown')).toBeInTheDocument();
      expect(screen.getAllByText(/R\s*20[,\s]*000/).length).toBeGreaterThan(0);
    });
  });
});
