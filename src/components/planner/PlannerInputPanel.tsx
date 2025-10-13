'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AgeSlider } from '@/components/custom/AgeSlider';
import { CurrencyInput } from '@/components/custom/CurrencyInput';
import { SliderWithInput } from '@/components/custom/SliderWithInput';
import type { PlannerState } from '@/types';
import { RotateCcw, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlannerInputPanelProps {
  plannerState: PlannerState;
  onPlannerStateChange: (state: Partial<PlannerState>) => void;
  onCalculate: () => void;
  onReset: () => void;
  isCalculating?: boolean;
  className?: string;
}

/**
 * PlannerInputPanel Component
 *
 * Card wrapper containing all input controls for retirement planner.
 * Sections: Age Inputs, Financial Inputs.
 *
 * Example:
 * <PlannerInputPanel
 *   plannerState={state}
 *   onPlannerStateChange={handleChange}
 *   onCalculate={handleCalculate}
 *   onReset={handleReset}
 * />
 */
export function PlannerInputPanel({
  plannerState,
  onPlannerStateChange,
  onCalculate,
  onReset,
  isCalculating = false,
  className,
}: PlannerInputPanelProps) {
  // Handle field changes
  const handleChange = <K extends keyof PlannerState>(
    field: K,
    value: PlannerState[K]
  ) => {
    onPlannerStateChange({ [field]: value });
  };

  return (
    <Card className={cn('overflow-hidden shadow-lg', className)}>
      <div className="bg-gradient-to-r from-primary via-primary/90 to-secondary p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <Calculator className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Retirement Parameters</h2>
            <p className="mt-1 text-sm text-white/90">
              Enter your financial details to calculate your retirement projection
            </p>
          </div>
        </div>
      </div>

      <CardContent className="space-y-6 pt-6">
        {/* Age Section */}
        <section aria-labelledby="age-section">
          <h3 id="age-section" className="mb-4 text-sm font-semibold">
            Age Parameters
          </h3>
          <AgeSlider
            currentAge={plannerState.currentAge}
            retirementAge={plannerState.retirementAge}
            onCurrentAgeChange={(age) => handleChange('currentAge', age)}
            onRetirementAgeChange={(age) => handleChange('retirementAge', age)}
          />
        </section>

        <Separator />

        {/* Financial Inputs Section */}
        <section aria-labelledby="financial-section" className="space-y-4">
          <h3 id="financial-section" className="mb-4 text-sm font-semibold">
            Financial Inputs
          </h3>

          <CurrencyInput
            label="Starting RA Balance"
            value={plannerState.startingBalance}
            onChange={(value) => handleChange('startingBalance', value)}
            placeholder="R 0.00"
          />

          <CurrencyInput
            label="Monthly Contribution"
            value={plannerState.monthlyContribution}
            onChange={(value) => handleChange('monthlyContribution', value)}
            placeholder="R 0.00"
          />

          <SliderWithInput
            label="Expected Annual Return"
            value={plannerState.annualReturn}
            onChange={(value) => handleChange('annualReturn', value)}
            min={-10}
            max={50}
            step={0.1}
            unit="%"
            tooltip="Expected yearly investment growth rate. Historical equity returns average 12-15% for SA."
          />

          <SliderWithInput
            label="Expected Inflation Rate"
            value={plannerState.inflation}
            onChange={(value) => handleChange('inflation', value)}
            min={0}
            max={20}
            step={0.1}
            unit="%"
            tooltip="Expected yearly inflation rate. SARB targets 3-6% inflation."
          />

          <SliderWithInput
            label="Retirement Drawdown Rate"
            value={plannerState.drawdownRate}
            onChange={(value) => handleChange('drawdownRate', value)}
            min={0}
            max={20}
            step={0.1}
            unit="%"
            tooltip="Percentage of balance withdrawn annually during retirement. 4% is a common sustainable rate."
          />
        </section>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 border-t bg-muted/30 px-6 py-4 sm:flex-row sm:justify-between items-center">
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          disabled={isCalculating}
          className="w-full sm:w-auto"
        >
          <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
          Reset
        </Button>
        <Button
          type="button"
          onClick={onCalculate}
          disabled={isCalculating}
          className="w-full bg-gradient-to-r from-primary via-primary/95 to-secondary font-semibold text-primary-foreground shadow-lg transition-all hover:from-primary/90 hover:via-primary/85 hover:to-secondary/90 hover:shadow-xl sm:w-auto"
        >
          <Calculator className="mr-2 h-4 w-4" aria-hidden="true" />
          {isCalculating ? 'Calculating...' : 'Calculate Projection'}
        </Button>
      </CardFooter>
    </Card>
  );
}
