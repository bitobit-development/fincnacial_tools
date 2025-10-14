'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CurrencySliderControl } from './CurrencySliderControl';
import { PercentageSliderControl } from './PercentageSliderControl';
import { RotateCcw, TrendingUp, TrendingDown, Loader2, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';

interface Adjustments {
  monthly_ra_contribution: number;
  investment_return: number;
  inflation_rate: number;
}

interface PlanAdjustmentsPanelProps {
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
  impactSummary: {
    retirementNestEggDelta: number;
    monthlyDrawdownDelta: number;
  } | null;
  isCalculating: boolean;
  onAdjustmentChange: (field: string, value: number) => void;
  onReset: () => void;
  sessionId?: string;
  onSave?: (adjustments: Adjustments) => Promise<void>;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  saveError?: string | null;
}

/**
 * Format currency in South African Rand (ZAR)
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * PlanAdjustmentsPanel Component
 *
 * Main container component for adjusting retirement plan parameters.
 * Allows users to fine-tune AI recommendations for:
 * - Monthly RA Contribution (R0 - R500,000)
 * - Investment Return Rate (0% - 15%)
 * - Inflation Rate (0% - 10%)
 *
 * Features:
 * - Interactive sliders with AI recommendation markers
 * - Real-time impact summary showing projected changes
 * - Reset button to restore AI recommendations
 * - Fully responsive (mobile-first design)
 * - WCAG 2.1 AA compliant
 *
 * @example
 * ```tsx
 * <PlanAdjustmentsPanel
 *   aiRecommendations={{
 *     monthlyContribution: 10000,
 *     investmentReturn: 9.0,
 *     inflationRate: 6.0,
 *   }}
 *   currentAdjustments={userAdjustments}
 *   impactSummary={calculations.impactSummary}
 *   isCalculating={calculations.isCalculating}
 *   onAdjustmentChange={handleAdjustmentChange}
 *   onReset={handleResetToAI}
 * />
 * ```
 */
export function PlanAdjustmentsPanel({
  aiRecommendations,
  currentAdjustments,
  impactSummary,
  isCalculating,
  onAdjustmentChange,
  onReset,
  sessionId,
  onSave,
  isSaving = false,
  hasUnsavedChanges = false,
  saveError = null,
}: PlanAdjustmentsPanelProps) {
  // Check if any values differ from AI recommendations
  const hasModifications =
    currentAdjustments.monthlyContribution !== aiRecommendations.monthlyContribution ||
    currentAdjustments.investmentReturn !== aiRecommendations.investmentReturn ||
    currentAdjustments.inflationRate !== aiRecommendations.inflationRate;

  // Handle save button click
  const handleSave = async () => {
    if (!onSave) return;

    try {
      await onSave({
        monthly_ra_contribution: currentAdjustments.monthlyContribution,
        investment_return: currentAdjustments.investmentReturn,
        inflation_rate: currentAdjustments.inflationRate,
      });

      toast.success('Adjustments saved successfully', {
        description: 'Your retirement plan has been updated.',
      });
    } catch (error) {
      toast.error('Failed to save adjustments', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-2 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl sm:text-2xl">
              Adjust Your Retirement Plan
            </CardTitle>
            <CardDescription className="text-sm">
              Fine-tune AI recommendations to match your personal preferences
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            {/* Unsaved Changes Badge */}
            {hasUnsavedChanges && !isSaving && (
              <Badge
                variant="secondary"
                className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                aria-label="You have unsaved changes"
              >
                <AlertCircle className="mr-1 h-3 w-3" aria-hidden="true" />
                Unsaved changes
              </Badge>
            )}
            {/* Changes Saved Badge */}
            {!hasUnsavedChanges && !isSaving && hasModifications && (
              <Badge
                variant="secondary"
                className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                aria-label="Changes saved successfully"
              >
                <CheckCircle className="mr-1 h-3 w-3" aria-hidden="true" />
                Changes saved
              </Badge>
            )}
            {/* Modified Badge (existing) */}
            {hasModifications && (
              <Badge
                variant="secondary"
                className="text-xs"
                aria-label="You have modified the AI recommendations"
              >
                Modified
              </Badge>
            )}
          </div>
        </div>
        {/* Error Alert */}
        {saveError && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent className="space-y-8 p-4 sm:p-6">
        {/* Slider Controls */}
        <div className="space-y-6">
          {/* Monthly RA Contribution */}
          <CurrencySliderControl
            label="Monthly RA Contribution"
            value={currentAdjustments.monthlyContribution}
            min={0}
            max={500000}
            step={500}
            onChange={(value) => onAdjustmentChange('monthlyContribution', value)}
            aiRecommendation={aiRecommendations.monthlyContribution}
            tooltip="Your monthly retirement annuity contribution. Higher contributions lead to a larger retirement nest egg."
          />

          {/* Investment Return Rate */}
          <PercentageSliderControl
            label="Investment Return Rate"
            value={currentAdjustments.investmentReturn}
            min={0}
            max={15}
            step={0.1}
            onChange={(value) => onAdjustmentChange('investmentReturn', value)}
            aiRecommendation={aiRecommendations.investmentReturn}
            tooltip="Expected annual investment return rate. Historical average for balanced portfolios is 8-10%."
            decimalPlaces={1}
          />

          {/* Inflation Rate */}
          <PercentageSliderControl
            label="Inflation Rate"
            value={currentAdjustments.inflationRate}
            min={0}
            max={10}
            step={0.1}
            onChange={(value) => onAdjustmentChange('inflationRate', value)}
            aiRecommendation={aiRecommendations.inflationRate}
            tooltip="Expected annual inflation rate. South African inflation typically ranges between 4-6%."
            decimalPlaces={1}
          />
        </div>

        {/* Impact Summary */}
        <div
          className={cn(
            'rounded-lg border p-4 sm:p-5 space-y-3 transition-colors',
            isCalculating ? 'bg-muted/30 border-muted' : 'bg-accent/5 border-accent/20'
          )}
          role="region"
          aria-label="Impact Summary"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              Impact Summary
            </h3>
            {isCalculating && (
              <Badge
                variant="secondary"
                className="text-xs gap-1.5"
                aria-label="Calculating impact"
              >
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                Calculating...
              </Badge>
            )}
          </div>

          {/* Impact Values */}
          {impactSummary && !isCalculating ? (
            <div className="space-y-3">
              {/* Retirement Nest Egg Delta */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  {impactSummary.retirementNestEggDelta >= 0 ? (
                    <TrendingUp
                      className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-500 shrink-0"
                      aria-hidden="true"
                    />
                  ) : (
                    <TrendingDown
                      className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-500 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  <span className="text-sm text-muted-foreground">
                    Retirement Nest Egg:
                  </span>
                </div>
                <span
                  className={cn(
                    'text-base sm:text-lg font-bold',
                    impactSummary.retirementNestEggDelta >= 0
                      ? 'text-green-600 dark:text-green-500'
                      : 'text-red-600 dark:text-red-500'
                  )}
                  aria-label={`Retirement nest egg change: ${
                    impactSummary.retirementNestEggDelta >= 0 ? 'increase' : 'decrease'
                  } of ${formatCurrency(Math.abs(impactSummary.retirementNestEggDelta))}`}
                >
                  {impactSummary.retirementNestEggDelta >= 0 ? '+' : ''}
                  {formatCurrency(impactSummary.retirementNestEggDelta)}
                </span>
              </div>

              {/* Monthly Drawdown Delta */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  {impactSummary.monthlyDrawdownDelta >= 0 ? (
                    <TrendingUp
                      className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-500 shrink-0"
                      aria-hidden="true"
                    />
                  ) : (
                    <TrendingDown
                      className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-500 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  <span className="text-sm text-muted-foreground">
                    Monthly Drawdown:
                  </span>
                </div>
                <span
                  className={cn(
                    'text-base sm:text-lg font-bold',
                    impactSummary.monthlyDrawdownDelta >= 0
                      ? 'text-green-600 dark:text-green-500'
                      : 'text-red-600 dark:text-red-500'
                  )}
                  aria-label={`Monthly drawdown change: ${
                    impactSummary.monthlyDrawdownDelta >= 0 ? 'increase' : 'decrease'
                  } of ${formatCurrency(Math.abs(impactSummary.monthlyDrawdownDelta))}`}
                >
                  {impactSummary.monthlyDrawdownDelta >= 0 ? '+' : ''}
                  {formatCurrency(impactSummary.monthlyDrawdownDelta)}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isCalculating
                  ? 'Calculating impact of your adjustments...'
                  : 'Adjust the sliders above to see the impact on your retirement plan'}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {/* Save Button */}
          <Button
            type="button"
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving || isCalculating}
            aria-label="Save retirement plan adjustments"
            aria-busy={isSaving}
            className={cn(
              'w-full sm:flex-1 gap-2 min-h-[44px]',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
            )}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" aria-hidden="true" />
                Save Adjustments
              </>
            )}
          </Button>

          {/* Reset Button */}
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            disabled={!hasModifications || isCalculating || isSaving}
            aria-label="Reset to AI recommendations"
            className={cn(
              'w-full sm:flex-1 gap-2 min-h-[44px]',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
            )}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset to AI
          </Button>
        </div>

        {/* Screen Reader Announcement for Impact Summary */}
        {impactSummary && !isCalculating && (
          <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            Impact summary updated. Retirement nest egg change:{' '}
            {impactSummary.retirementNestEggDelta >= 0 ? 'increase' : 'decrease'} of{' '}
            {formatCurrency(Math.abs(impactSummary.retirementNestEggDelta))}.
            Monthly drawdown change:{' '}
            {impactSummary.monthlyDrawdownDelta >= 0 ? 'increase' : 'decrease'} of{' '}
            {formatCurrency(Math.abs(impactSummary.monthlyDrawdownDelta))}.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
