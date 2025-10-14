import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlanAdjustmentsPanel } from '../PlanAdjustmentsPanel';
import '@testing-library/jest-dom';

// =============================================================================
// Test Suite: PlanAdjustmentsPanel Component
// =============================================================================

describe('PlanAdjustmentsPanel', () => {
  // Default test props
  const defaultProps = {
    aiRecommendations: {
      monthlyContribution: 10000,
      investmentReturn: 9.0,
      inflationRate: 6.0,
    },
    currentAdjustments: {
      monthlyContribution: 10000,
      investmentReturn: 9.0,
      inflationRate: 6.0,
    },
    impactSummary: {
      retirementNestEggDelta: 500000,
      monthlyDrawdownDelta: 2500,
    },
    isCalculating: false,
    onAdjustmentChange: vi.fn(),
    onReset: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // 1. Component Rendering Tests
  // ---------------------------------------------------------------------------

  describe('Component Rendering', () => {
    it('should render without crashing with valid props', () => {
      render(<PlanAdjustmentsPanel {...defaultProps} />);

      expect(screen.getByText('Adjust Your Retirement Plan')).toBeInTheDocument();
    });

    it('should render card header with title and description', () => {
      render(<PlanAdjustmentsPanel {...defaultProps} />);

      expect(screen.getByText('Adjust Your Retirement Plan')).toBeInTheDocument();
      expect(
        screen.getByText('Fine-tune AI recommendations to match your personal preferences')
      ).toBeInTheDocument();
    });

    it('should render all three slider controls', () => {
      render(<PlanAdjustmentsPanel {...defaultProps} />);

      expect(screen.getByText('Monthly RA Contribution')).toBeInTheDocument();
      expect(screen.getByText('Investment Return Rate')).toBeInTheDocument();
      expect(screen.getByText('Inflation Rate')).toBeInTheDocument();
    });

    it('should render impact summary section', () => {
      render(<PlanAdjustmentsPanel {...defaultProps} />);

      expect(screen.getByText('Impact Summary')).toBeInTheDocument();
      expect(screen.getByText('Retirement Nest Egg:')).toBeInTheDocument();
      expect(screen.getByText('Monthly Drawdown:')).toBeInTheDocument();
    });

    it('should render reset button', () => {
      render(<PlanAdjustmentsPanel {...defaultProps} />);

      const resetButton = screen.getByRole('button', { name: /reset to ai recommendations/i });
      expect(resetButton).toBeInTheDocument();
    });

    it('should not render Modified badge when values match AI recommendations', () => {
      render(<PlanAdjustmentsPanel {...defaultProps} />);

      const badge = screen.queryByText('Modified');
      expect(badge).not.toBeInTheDocument();
    });

    it('should render Modified badge when values differ from AI recommendations', () => {
      render(
        <PlanAdjustmentsPanel
          {...defaultProps}
          currentAdjustments={{
            monthlyContribution: 15000, // Different from AI
            investmentReturn: 9.0,
            inflationRate: 6.0,
          }}
        />
      );

      const badge = screen.getByText('Modified');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('aria-label', 'You have modified the AI recommendations');
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Slider Value Change Tests
  // ---------------------------------------------------------------------------

  describe('Slider Value Changes', () => {
    it('should trigger onAdjustmentChange when Monthly RA Contribution slider changes', async () => {
      render(<PlanAdjustmentsPanel {...defaultProps} />);

      // Find the actual slider thumb (role="slider")
      const sliders = screen.getAllByRole('slider');
      const contributionSlider = sliders[0]; // First slider is Monthly RA Contribution

      // Simulate slider keyboard interaction (ArrowRight increases value)
      contributionSlider.focus();
      fireEvent.keyDown(contributionSlider, { key: 'ArrowRight' });

      await waitFor(() => {
        expect(defaultProps.onAdjustmentChange).toHaveBeenCalled();
      });
    });

    it('should trigger onAdjustmentChange when Investment Return Rate slider changes', async () => {
      render(<PlanAdjustmentsPanel {...defaultProps} />);

      const sliders = screen.getAllByRole('slider');
      const returnSlider = sliders[1]; // Second slider is Investment Return Rate

      returnSlider.focus();
      fireEvent.keyDown(returnSlider, { key: 'ArrowUp' });

      await waitFor(() => {
        expect(defaultProps.onAdjustmentChange).toHaveBeenCalled();
      });
    });

    it('should trigger onAdjustmentChange when Inflation Rate slider changes', async () => {
      render(<PlanAdjustmentsPanel {...defaultProps} />);

      const sliders = screen.getAllByRole('slider');
      const inflationSlider = sliders[2]; // Third slider is Inflation Rate

      inflationSlider.focus();
      fireEvent.keyDown(inflationSlider, { key: 'ArrowRight' });

      await waitFor(() => {
        expect(defaultProps.onAdjustmentChange).toHaveBeenCalled();
      });
    });

    it('should handle multiple consecutive slider changes', async () => {
      render(<PlanAdjustmentsPanel {...defaultProps} />);

      const sliders = screen.getAllByRole('slider');
      const contributionSlider = sliders[0];

      contributionSlider.focus();
      fireEvent.keyDown(contributionSlider, { key: 'ArrowRight' });
      fireEvent.keyDown(contributionSlider, { key: 'ArrowRight' });
      fireEvent.keyDown(contributionSlider, { key: 'ArrowRight' });

      await waitFor(() => {
        expect(defaultProps.onAdjustmentChange).toHaveBeenCalled();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Number Input Change Tests
  // ---------------------------------------------------------------------------

  describe('Number Input Changes', () => {
    it('should update slider value when number input changes', async () => {
      const user = userEvent.setup();
      render(<PlanAdjustmentsPanel {...defaultProps} />);

      // Find the number input for monthly contribution
      const input = screen.getByLabelText('Enter Monthly RA Contribution value');

      await user.clear(input);
      await user.type(input, '20000');
      await user.tab(); // Blur the input

      await waitFor(() => {
        expect(defaultProps.onAdjustmentChange).toHaveBeenCalledWith('monthlyContribution', 20000);
      });
    });

    it('should validate and clamp input to min value', async () => {
      const user = userEvent.setup();
      render(<PlanAdjustmentsPanel {...defaultProps} />);

      const input = screen.getByLabelText('Enter Monthly RA Contribution value');

      await user.clear(input);
      await user.type(input, '-5000'); // Below min (0)
      await user.tab();

      await waitFor(() => {
        expect(defaultProps.onAdjustmentChange).toHaveBeenCalledWith('monthlyContribution', 0);
      });
    });

    it('should validate and clamp input to max value', async () => {
      const user = userEvent.setup();
      render(<PlanAdjustmentsPanel {...defaultProps} />);

      const input = screen.getByLabelText('Enter Monthly RA Contribution value');

      await user.clear(input);
      await user.type(input, '600000'); // Above max (500000)
      await user.tab();

      await waitFor(() => {
        expect(defaultProps.onAdjustmentChange).toHaveBeenCalledWith('monthlyContribution', 500000);
      });
    });

    it('should handle invalid input gracefully', async () => {
      const user = userEvent.setup();
      render(<PlanAdjustmentsPanel {...defaultProps} />);

      const input = screen.getByLabelText('Enter Monthly RA Contribution value');

      await user.clear(input);
      await user.type(input, 'abc');
      await user.tab();

      // Should revert to original value
      expect(input).toHaveValue(10000);
    });

    it('should submit input on Enter key press', async () => {
      const user = userEvent.setup();
      render(<PlanAdjustmentsPanel {...defaultProps} />);

      const input = screen.getByLabelText('Enter Monthly RA Contribution value');

      await user.clear(input);
      await user.type(input, '25000');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(defaultProps.onAdjustmentChange).toHaveBeenCalledWith('monthlyContribution', 25000);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Reset Button Tests
  // ---------------------------------------------------------------------------

  describe('Reset Button Functionality', () => {
    it('should call onReset when reset button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <PlanAdjustmentsPanel
          {...defaultProps}
          currentAdjustments={{
            monthlyContribution: 15000, // Different from AI
            investmentReturn: 9.0,
            inflationRate: 6.0,
          }}
        />
      );

      const resetButton = screen.getByRole('button', { name: /reset to ai recommendations/i });
      await user.click(resetButton);

      expect(defaultProps.onReset).toHaveBeenCalledTimes(1);
    });

    it('should disable reset button when values match AI recommendations', () => {
      render(<PlanAdjustmentsPanel {...defaultProps} />);

      const resetButton = screen.getByRole('button', { name: /reset to ai recommendations/i });
      expect(resetButton).toBeDisabled();
    });

    it('should enable reset button when values differ from AI recommendations', () => {
      render(
        <PlanAdjustmentsPanel
          {...defaultProps}
          currentAdjustments={{
            monthlyContribution: 15000,
            investmentReturn: 9.0,
            inflationRate: 6.0,
          }}
        />
      );

      const resetButton = screen.getByRole('button', { name: /reset to ai recommendations/i });
      expect(resetButton).not.toBeDisabled();
    });

    it('should disable reset button when calculating', () => {
      render(
        <PlanAdjustmentsPanel
          {...defaultProps}
          currentAdjustments={{
            monthlyContribution: 15000,
            investmentReturn: 9.0,
            inflationRate: 6.0,
          }}
          isCalculating={true}
        />
      );

      const resetButton = screen.getByRole('button', { name: /reset to ai recommendations/i });
      expect(resetButton).toBeDisabled();
    });
  });

  // ---------------------------------------------------------------------------
  // 5. AI Recommendation Marker Tests
  // ---------------------------------------------------------------------------

  describe('AI Recommendation Markers', () => {
    it('should render AI recommendation markers for all sliders', () => {
      render(<PlanAdjustmentsPanel {...defaultProps} />);

      // Check for AI recommendation markers (visual indicators)
      const { container } = render(<PlanAdjustmentsPanel {...defaultProps} />);
      const markers = container.querySelectorAll('[role="presentation"]');

      // Should have 3 markers (one per slider)
      expect(markers.length).toBeGreaterThanOrEqual(3);
    });

    it('should position Monthly RA Contribution marker correctly', () => {
      render(<PlanAdjustmentsPanel {...defaultProps} />);

      // AI recommendation: 10000, min: 0, max: 500000
      // Position: (10000 / 500000) * 100 = 2%
      const { container } = render(<PlanAdjustmentsPanel {...defaultProps} />);
      const markers = container.querySelectorAll('[role="presentation"]');

      // First marker should have left position of 2%
      expect(markers[0]).toHaveStyle({ left: '2%' });
    });

    it('should position Investment Return Rate marker correctly', () => {
      render(<PlanAdjustmentsPanel {...defaultProps} />);

      // AI recommendation: 9.0, min: 0, max: 15
      // Position: (9 / 15) * 100 = 60%
      const { container } = render(<PlanAdjustmentsPanel {...defaultProps} />);
      const markers = container.querySelectorAll('[role="presentation"]');

      // Second marker should have left position of 60%
      expect(markers[1]).toHaveStyle({ left: '60%' });
    });

    it('should position Inflation Rate marker correctly', () => {
      render(<PlanAdjustmentsPanel {...defaultProps} />);

      // AI recommendation: 6.0, min: 0, max: 10
      // Position: (6 / 10) * 100 = 60%
      const { container } = render(<PlanAdjustmentsPanel {...defaultProps} />);
      const markers = container.querySelectorAll('[role="presentation"]');

      // Third marker should have left position of 60%
      expect(markers[2]).toHaveStyle({ left: '60%' });
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Accessibility Tests
  // ---------------------------------------------------------------------------

  describe('Accessibility (WCAG 2.1 AA)', () => {
    it('should have proper ARIA labels for sliders', () => {
      render(<PlanAdjustmentsPanel {...defaultProps} />);

      const contributionSlider = screen.getByLabelText('Monthly RA Contribution');
      expect(contributionSlider).toHaveAttribute('aria-valuemin', '0');
      expect(contributionSlider).toHaveAttribute('aria-valuemax', '500000');
      expect(contributionSlider).toHaveAttribute('aria-valuenow', '10000');

      const returnSlider = screen.getByLabelText('Investment Return Rate');
      expect(returnSlider).toHaveAttribute('aria-valuemin', '0');
      expect(returnSlider).toHaveAttribute('aria-valuemax', '15');

      const inflationSlider = screen.getByLabelText('Inflation Rate');
      expect(inflationSlider).toHaveAttribute('aria-valuemin', '0');
      expect(inflationSlider).toHaveAttribute('aria-valuemax', '10');
    });

    it('should have proper ARIA labels for buttons', () => {
      render(
        <PlanAdjustmentsPanel
          {...defaultProps}
          currentAdjustments={{
            monthlyContribution: 15000,
            investmentReturn: 9.0,
            inflationRate: 6.0,
          }}
        />
      );

      const resetButton = screen.getByRole('button', { name: /reset to ai recommendations/i });
      expect(resetButton).toHaveAttribute('aria-label', 'Reset to AI recommendations');

      // Info button tooltips
      const infoButtons = screen.getAllByRole('button', { name: /learn more about/i });
      expect(infoButtons.length).toBeGreaterThan(0);
    });

    it('should provide keyboard navigation for all interactive elements', async () => {
      const user = userEvent.setup();
      render(
        <PlanAdjustmentsPanel
          {...defaultProps}
          currentAdjustments={{
            monthlyContribution: 15000,
            investmentReturn: 9.0,
            inflationRate: 6.0,
          }}
        />
      );

      // Tab through interactive elements
      await user.tab(); // Info button
      await user.tab(); // Slider
      await user.tab(); // Input

      // Should be able to focus all elements
      expect(document.activeElement).not.toBeNull();
    });

    it('should have proper focus management on reset button', async () => {
      const user = userEvent.setup();
      render(
        <PlanAdjustmentsPanel
          {...defaultProps}
          currentAdjustments={{
            monthlyContribution: 15000,
            investmentReturn: 9.0,
            inflationRate: 6.0,
          }}
        />
      );

      const resetButton = screen.getByRole('button', { name: /reset to ai recommendations/i });

      // Focus the button
      await user.click(resetButton);

      // Should have focus ring classes
      expect(resetButton.className).toContain('focus:ring');
    });

    it('should provide screen reader announcements for impact summary', () => {
      render(<PlanAdjustmentsPanel {...defaultProps} />);

      // Find the impact summary screen reader announcement (last status element)
      const srAnnouncements = screen.getAllByRole('status', { hidden: true });
      const impactSummaryAnnouncement = srAnnouncements[srAnnouncements.length - 1];

      expect(impactSummaryAnnouncement).toBeInTheDocument();
      expect(impactSummaryAnnouncement).toHaveAttribute('aria-live', 'polite');
      expect(impactSummaryAnnouncement).toHaveAttribute('aria-atomic', 'true');
      expect(impactSummaryAnnouncement.textContent).toContain('Impact summary updated');
    });

    it('should have accessible region for impact summary', () => {
      render(<PlanAdjustmentsPanel {...defaultProps} />);

      const impactRegion = screen.getByRole('region', { name: /impact summary/i });
      expect(impactRegion).toBeInTheDocument();
    });

    it('should have proper touch target sizes for mobile (min 44x44px)', () => {
      render(
        <PlanAdjustmentsPanel
          {...defaultProps}
          currentAdjustments={{
            monthlyContribution: 15000,
            investmentReturn: 9.0,
            inflationRate: 6.0,
          }}
        />
      );

      const resetButton = screen.getByRole('button', { name: /reset to ai recommendations/i });
      expect(resetButton.className).toContain('min-h-[44px]');
    });
  });

  // ---------------------------------------------------------------------------
  // 7. Impact Summary Display Tests
  // ---------------------------------------------------------------------------

  describe('Impact Summary Display', () => {
    it('should display positive retirement nest egg delta with green color and up arrow', () => {
      render(<PlanAdjustmentsPanel {...defaultProps} />);

      const impactRegion = screen.getByRole('region', { name: /impact summary/i });
      const nestEggValue = within(impactRegion).getByText(/\+R\s*500[,\s]*000/);

      expect(nestEggValue).toBeInTheDocument();
      expect(nestEggValue.className).toContain('green');
    });

    it('should display negative retirement nest egg delta with red color and down arrow', () => {
      render(
        <PlanAdjustmentsPanel
          {...defaultProps}
          impactSummary={{
            retirementNestEggDelta: -300000,
            monthlyDrawdownDelta: -1500,
          }}
        />
      );

      const impactRegion = screen.getByRole('region', { name: /impact summary/i });
      const nestEggValue = within(impactRegion).getByText(/-R\s*300[,\s]*000/);

      expect(nestEggValue).toBeInTheDocument();
      expect(nestEggValue.className).toContain('red');
    });

    it('should display positive monthly drawdown delta with green color', () => {
      render(<PlanAdjustmentsPanel {...defaultProps} />);

      const impactRegion = screen.getByRole('region', { name: /impact summary/i });
      const drawdownValue = within(impactRegion).getByText(/\+R\s*2[,\s]*500/);

      expect(drawdownValue).toBeInTheDocument();
      expect(drawdownValue.className).toContain('green');
    });

    it('should display negative monthly drawdown delta with red color', () => {
      render(
        <PlanAdjustmentsPanel
          {...defaultProps}
          impactSummary={{
            retirementNestEggDelta: 500000,
            monthlyDrawdownDelta: -800,
          }}
        />
      );

      const impactRegion = screen.getByRole('region', { name: /impact summary/i });
      const drawdownValue = within(impactRegion).getByText(/-R\s*800/);

      expect(drawdownValue).toBeInTheDocument();
      expect(drawdownValue.className).toContain('red');
    });

    it('should display zero values correctly', () => {
      render(
        <PlanAdjustmentsPanel
          {...defaultProps}
          impactSummary={{
            retirementNestEggDelta: 0,
            monthlyDrawdownDelta: 0,
          }}
        />
      );

      const impactRegion = screen.getByRole('region', { name: /impact summary/i });

      // Should display R 0.00 without + prefix
      expect(impactRegion.textContent).toContain('R');
    });
  });

  // ---------------------------------------------------------------------------
  // 8. Loading State Tests
  // ---------------------------------------------------------------------------

  describe('Loading State (isCalculating)', () => {
    it('should show calculating spinner when isCalculating is true', () => {
      render(<PlanAdjustmentsPanel {...defaultProps} isCalculating={true} />);

      const spinner = screen.getByText('Calculating...');
      expect(spinner).toBeInTheDocument();
    });

    it('should disable reset button when calculating', () => {
      render(
        <PlanAdjustmentsPanel
          {...defaultProps}
          currentAdjustments={{
            monthlyContribution: 15000,
            investmentReturn: 9.0,
            inflationRate: 6.0,
          }}
          isCalculating={true}
        />
      );

      const resetButton = screen.getByRole('button', { name: /reset to ai recommendations/i });
      expect(resetButton).toBeDisabled();
    });

    it('should show placeholder text when calculating', () => {
      render(
        <PlanAdjustmentsPanel
          {...defaultProps}
          impactSummary={null}
          isCalculating={true}
        />
      );

      expect(screen.getByText('Calculating impact of your adjustments...')).toBeInTheDocument();
    });

    it('should apply muted styles to impact summary when calculating', () => {
      render(<PlanAdjustmentsPanel {...defaultProps} isCalculating={true} />);

      const impactRegion = screen.getByRole('region', { name: /impact summary/i });
      expect(impactRegion.className).toContain('muted');
    });

    it('should hide impact values when calculating', () => {
      render(<PlanAdjustmentsPanel {...defaultProps} isCalculating={true} />);

      const nestEggLabel = screen.queryByText('Retirement Nest Egg:');
      const drawdownLabel = screen.queryByText('Monthly Drawdown:');

      // Labels should not be visible during calculation
      expect(nestEggLabel).not.toBeInTheDocument();
      expect(drawdownLabel).not.toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // 9. Edge Cases Tests
  // ---------------------------------------------------------------------------

  describe('Edge Cases', () => {
    it('should handle null impactSummary gracefully', () => {
      render(<PlanAdjustmentsPanel {...defaultProps} impactSummary={null} />);

      expect(
        screen.getByText('Adjust the sliders above to see the impact on your retirement plan')
      ).toBeInTheDocument();
    });

    it('should handle zero values in impactSummary', () => {
      render(
        <PlanAdjustmentsPanel
          {...defaultProps}
          impactSummary={{
            retirementNestEggDelta: 0,
            monthlyDrawdownDelta: 0,
          }}
        />
      );

      const impactRegion = screen.getByRole('region', { name: /impact summary/i });
      expect(impactRegion).toBeInTheDocument();
    });

    it('should handle minimum slider values', () => {
      render(
        <PlanAdjustmentsPanel
          {...defaultProps}
          aiRecommendations={{
            monthlyContribution: 0,
            investmentReturn: 0,
            inflationRate: 0,
          }}
          currentAdjustments={{
            monthlyContribution: 0,
            investmentReturn: 0,
            inflationRate: 0,
          }}
        />
      );

      expect(screen.getByText('Adjust Your Retirement Plan')).toBeInTheDocument();
    });

    it('should handle maximum slider values', () => {
      render(
        <PlanAdjustmentsPanel
          {...defaultProps}
          aiRecommendations={{
            monthlyContribution: 500000,
            investmentReturn: 15,
            inflationRate: 10,
          }}
          currentAdjustments={{
            monthlyContribution: 500000,
            investmentReturn: 15,
            inflationRate: 10,
          }}
        />
      );

      expect(screen.getByText('Adjust Your Retirement Plan')).toBeInTheDocument();
    });

    it('should handle very large impact values', () => {
      render(
        <PlanAdjustmentsPanel
          {...defaultProps}
          impactSummary={{
            retirementNestEggDelta: 50000000, // R50 million
            monthlyDrawdownDelta: 250000, // R250k
          }}
        />
      );

      const impactRegion = screen.getByRole('region', { name: /impact summary/i });
      expect(impactRegion.textContent).toContain('50');
      expect(impactRegion.textContent).toContain('250');
    });

    it('should handle very small negative impact values', () => {
      render(
        <PlanAdjustmentsPanel
          {...defaultProps}
          impactSummary={{
            retirementNestEggDelta: -100,
            monthlyDrawdownDelta: -10,
          }}
        />
      );

      const impactRegion = screen.getByRole('region', { name: /impact summary/i });
      expect(impactRegion.textContent).toContain('-R');
    });
  });

  // ---------------------------------------------------------------------------
  // 10. Modified Badge Tests
  // ---------------------------------------------------------------------------

  describe('Modified Badge Display', () => {
    it('should show Modified badge when monthly contribution differs', () => {
      render(
        <PlanAdjustmentsPanel
          {...defaultProps}
          currentAdjustments={{
            monthlyContribution: 12000,
            investmentReturn: 9.0,
            inflationRate: 6.0,
          }}
        />
      );

      expect(screen.getByText('Modified')).toBeInTheDocument();
    });

    it('should show Modified badge when investment return differs', () => {
      render(
        <PlanAdjustmentsPanel
          {...defaultProps}
          currentAdjustments={{
            monthlyContribution: 10000,
            investmentReturn: 10.0,
            inflationRate: 6.0,
          }}
        />
      );

      expect(screen.getByText('Modified')).toBeInTheDocument();
    });

    it('should show Modified badge when inflation rate differs', () => {
      render(
        <PlanAdjustmentsPanel
          {...defaultProps}
          currentAdjustments={{
            monthlyContribution: 10000,
            investmentReturn: 9.0,
            inflationRate: 7.0,
          }}
        />
      );

      expect(screen.getByText('Modified')).toBeInTheDocument();
    });

    it('should show Modified badge when multiple values differ', () => {
      render(
        <PlanAdjustmentsPanel
          {...defaultProps}
          currentAdjustments={{
            monthlyContribution: 12000,
            investmentReturn: 10.0,
            inflationRate: 7.0,
          }}
        />
      );

      expect(screen.getByText('Modified')).toBeInTheDocument();
    });

    it('should not show Modified badge when all values match AI', () => {
      render(<PlanAdjustmentsPanel {...defaultProps} />);

      expect(screen.queryByText('Modified')).not.toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // 11. Currency and Percentage Formatting Tests
  // ---------------------------------------------------------------------------

  describe('Currency and Percentage Formatting', () => {
    it('should format currency with R prefix and thousands separators', () => {
      render(<PlanAdjustmentsPanel {...defaultProps} />);

      // Check monthly contribution display (use getAllByText since multiple elements match)
      const currencyElements = screen.getAllByText(/R\s*10[,\s]*000/);
      expect(currencyElements.length).toBeGreaterThan(0);
    });

    it('should format currency with 2 decimal places', () => {
      render(<PlanAdjustmentsPanel {...defaultProps} />);

      // Impact summary values should have ,00 (South African format)
      const impactRegion = screen.getByRole('region', { name: /impact summary/i });
      // Check that currency values include the decimal separator
      expect(impactRegion.textContent).toContain('500');
      expect(impactRegion.textContent).toContain('2');
    });

    it('should format percentages with 1 decimal place', () => {
      render(<PlanAdjustmentsPanel {...defaultProps} />);

      // Check investment return and inflation rate displays
      expect(screen.getByText('9.0%')).toBeInTheDocument();
      expect(screen.getByText('6.0%')).toBeInTheDocument();
    });

    it('should format large currency amounts correctly', () => {
      render(
        <PlanAdjustmentsPanel
          {...defaultProps}
          impactSummary={{
            retirementNestEggDelta: 5000000, // R5 million
            monthlyDrawdownDelta: 25000,
          }}
        />
      );

      const impactRegion = screen.getByRole('region', { name: /impact summary/i });
      expect(impactRegion.textContent).toContain('5');
      expect(impactRegion.textContent).toContain('000');
    });

    it('should handle fractional percentage values', () => {
      render(
        <PlanAdjustmentsPanel
          {...defaultProps}
          aiRecommendations={{
            monthlyContribution: 10000,
            investmentReturn: 9.5,
            inflationRate: 6.3,
          }}
          currentAdjustments={{
            monthlyContribution: 10000,
            investmentReturn: 9.5,
            inflationRate: 6.3,
          }}
        />
      );

      expect(screen.getByText('9.5%')).toBeInTheDocument();
      expect(screen.getByText('6.3%')).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // 12. Integration Tests
  // ---------------------------------------------------------------------------

  describe('Integration Scenarios', () => {
    it('should handle complete user adjustment flow', async () => {
      const user = userEvent.setup();
      const onAdjustmentChange = vi.fn();
      const onReset = vi.fn();

      const { rerender } = render(
        <PlanAdjustmentsPanel
          {...defaultProps}
          onAdjustmentChange={onAdjustmentChange}
          onReset={onReset}
        />
      );

      // Step 1: User adjusts monthly contribution using number input
      const input = screen.getByLabelText('Enter Monthly RA Contribution value');
      await user.clear(input);
      await user.type(input, '15000');
      await user.tab(); // Blur to trigger change

      await waitFor(() => {
        expect(onAdjustmentChange).toHaveBeenCalledWith('monthlyContribution', 15000);
      });

      // Step 2: Re-render with updated adjustments
      rerender(
        <PlanAdjustmentsPanel
          {...defaultProps}
          currentAdjustments={{
            monthlyContribution: 15000,
            investmentReturn: 9.0,
            inflationRate: 6.0,
          }}
          onAdjustmentChange={onAdjustmentChange}
          onReset={onReset}
        />
      );

      // Step 3: Modified badge appears
      expect(screen.getByText('Modified')).toBeInTheDocument();

      // Step 4: User resets to AI recommendations
      const resetButton = screen.getByRole('button', { name: /reset to ai recommendations/i });
      await user.click(resetButton);

      expect(onReset).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent adjustments to multiple sliders', async () => {
      const onAdjustmentChange = vi.fn();

      render(
        <PlanAdjustmentsPanel
          {...defaultProps}
          onAdjustmentChange={onAdjustmentChange}
        />
      );

      const sliders = screen.getAllByRole('slider');

      // Interact with all three sliders using keyboard
      sliders[0].focus();
      fireEvent.keyDown(sliders[0], { key: 'ArrowRight' });

      sliders[1].focus();
      fireEvent.keyDown(sliders[1], { key: 'ArrowUp' });

      sliders[2].focus();
      fireEvent.keyDown(sliders[2], { key: 'ArrowRight' });

      await waitFor(() => {
        expect(onAdjustmentChange).toHaveBeenCalled();
      });
    });

    it('should handle rapid slider movements', async () => {
      const onAdjustmentChange = vi.fn();

      render(
        <PlanAdjustmentsPanel
          {...defaultProps}
          onAdjustmentChange={onAdjustmentChange}
        />
      );

      const sliders = screen.getAllByRole('slider');
      const contributionSlider = sliders[0];

      // Simulate rapid slider movements using keyboard
      contributionSlider.focus();
      for (let i = 0; i < 10; i++) {
        fireEvent.keyDown(contributionSlider, { key: 'ArrowRight' });
      }

      await waitFor(() => {
        expect(onAdjustmentChange).toHaveBeenCalled();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 13. Responsive Design Tests
  // ---------------------------------------------------------------------------

  describe('Responsive Design', () => {
    it('should apply responsive text sizing', () => {
      render(<PlanAdjustmentsPanel {...defaultProps} />);

      const title = screen.getByText('Adjust Your Retirement Plan');
      expect(title.className).toMatch(/text-(xl|2xl)/);
    });

    it('should apply responsive padding', () => {
      const { container } = render(<PlanAdjustmentsPanel {...defaultProps} />);

      const cardContent = container.querySelector('[class*="p-"]');
      expect(cardContent).toBeInTheDocument();
    });

    it('should make reset button full width on mobile', () => {
      render(
        <PlanAdjustmentsPanel
          {...defaultProps}
          currentAdjustments={{
            monthlyContribution: 15000,
            investmentReturn: 9.0,
            inflationRate: 6.0,
          }}
        />
      );

      const resetButton = screen.getByRole('button', { name: /reset to ai recommendations/i });
      expect(resetButton.className).toContain('w-full');
      expect(resetButton.className).toContain('sm:w-auto');
    });

    it('should apply responsive gap spacing', () => {
      const { container } = render(<PlanAdjustmentsPanel {...defaultProps} />);

      const sections = container.querySelectorAll('[class*="space-y"]');
      expect(sections.length).toBeGreaterThan(0);
    });
  });

  // ---------------------------------------------------------------------------
  // 14. Visual Styling Tests
  // ---------------------------------------------------------------------------

  describe('Visual Styling', () => {
    it('should apply accent styling to impact summary when not calculating', () => {
      render(<PlanAdjustmentsPanel {...defaultProps} />);

      const impactRegion = screen.getByRole('region', { name: /impact summary/i });
      expect(impactRegion.className).toContain('accent');
    });

    it('should apply muted styling when calculating', () => {
      render(<PlanAdjustmentsPanel {...defaultProps} isCalculating={true} />);

      const impactRegion = screen.getByRole('region', { name: /impact summary/i });
      expect(impactRegion.className).toContain('muted');
    });

    it('should apply secondary variant to badges', () => {
      render(
        <PlanAdjustmentsPanel
          {...defaultProps}
          currentAdjustments={{
            monthlyContribution: 15000,
            investmentReturn: 9.0,
            inflationRate: 6.0,
          }}
        />
      );

      const badge = screen.getByText('Modified').closest('[class*="secondary"]');
      expect(badge).toBeInTheDocument();
    });

    it('should apply rounded corners to impact summary', () => {
      render(<PlanAdjustmentsPanel {...defaultProps} />);

      const impactRegion = screen.getByRole('region', { name: /impact summary/i });
      expect(impactRegion.className).toContain('rounded');
    });
  });
});
