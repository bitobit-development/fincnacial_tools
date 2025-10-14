'use client';

import * as React from 'react';
import { PlanAdjustmentsPanel } from '@/components/advisor/PlanAdjustmentsPanel';
import { usePlannerCalculations } from '@/hooks/usePlannerCalculations';

/**
 * Demo page for testing PlanAdjustmentsPanel component with real calculations
 */
export default function DemoAdjustmentsPage() {
  // AI Recommendations
  const aiRecommendations = {
    monthlyContribution: 10000,
    investmentReturn: 9.0,
    inflationRate: 6.0,
  };

  // User adjustments (starts matching AI recommendations)
  const [currentAdjustments, setCurrentAdjustments] = React.useState({
    monthlyContribution: 10000,
    investmentReturn: 9.0,
    inflationRate: 6.0,
  });

  // Sample user profile
  const userProfile = {
    current_age: 35,
    retirement_age: 65,
    life_expectancy: 90,
    gross_annual_income: 600000,
    current_retirement_savings: 500000,
  };

  // Use real planner calculations hook
  const { impactSummary, projections, isCalculating, error } = usePlannerCalculations({
    aiRecommendations,
    currentAdjustments,
    userProfile,
  });

  const handleAdjustmentChange = (field: string, value: number) => {
    setCurrentAdjustments((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReset = () => {
    setCurrentAdjustments(aiRecommendations);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Plan Adjustments Demo
          </h1>
          <p className="text-muted-foreground">
            Test the PlanAdjustmentsPanel component with real Web Worker calculations
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
            <h3 className="text-sm font-semibold text-red-900 dark:text-red-100">
              Calculation Error
            </h3>
            <p className="mt-1 text-sm text-red-800 dark:text-red-200">
              {error.message}
            </p>
          </div>
        )}

        <PlanAdjustmentsPanel
          aiRecommendations={aiRecommendations}
          currentAdjustments={currentAdjustments}
          impactSummary={impactSummary}
          isCalculating={isCalculating}
          onAdjustmentChange={handleAdjustmentChange}
          onReset={handleReset}
        />

        {/* Projections Display */}
        {projections && !isCalculating && (
          <div className="rounded-lg border border-border p-4 bg-muted/30 space-y-4">
            <h2 className="text-sm font-semibold">Projected Retirement Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Retirement Nest Egg</p>
                <p className="text-lg font-bold">
                  {new Intl.NumberFormat('en-ZA', {
                    style: 'currency',
                    currency: 'ZAR',
                    minimumFractionDigits: 0,
                  }).format(projections.retirementNestEgg)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Monthly Drawdown</p>
                <p className="text-lg font-bold">
                  {new Intl.NumberFormat('en-ZA', {
                    style: 'currency',
                    currency: 'ZAR',
                    minimumFractionDigits: 0,
                  }).format(projections.monthlyDrawdown)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Drawdown Schedule (First 5 Years)
              </p>
              <div className="overflow-x-auto">
                <table className="text-xs w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-1 px-2">Age</th>
                      <th className="text-right py-1 px-2">Beginning</th>
                      <th className="text-right py-1 px-2">Withdrawal</th>
                      <th className="text-right py-1 px-2">Tax</th>
                      <th className="text-right py-1 px-2">Net Income</th>
                      <th className="text-right py-1 px-2">Ending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projections.drawdownSchedule.slice(0, 5).map((row) => (
                      <tr key={row.age} className="border-b">
                        <td className="py-1 px-2">{row.age}</td>
                        <td className="text-right py-1 px-2">
                          R{Math.round(row.beginningBalance / 1000)}k
                        </td>
                        <td className="text-right py-1 px-2">
                          R{Math.round(row.withdrawal / 1000)}k
                        </td>
                        <td className="text-right py-1 px-2">
                          R{Math.round(row.taxPaid / 1000)}k
                        </td>
                        <td className="text-right py-1 px-2">
                          R{Math.round(row.netIncome / 1000)}k
                        </td>
                        <td className="text-right py-1 px-2">
                          R{Math.round(row.endingBalance / 1000)}k
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Debug Info */}
        <div className="rounded-lg border border-border p-4 bg-muted/30">
          <h2 className="text-sm font-semibold mb-2">Debug Info</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(
              {
                userProfile,
                currentAdjustments,
                impactSummary,
                isCalculating,
                hasError: !!error,
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
