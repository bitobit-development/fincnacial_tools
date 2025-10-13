'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlannerInputPanel } from '@/components/planner/PlannerInputPanel';
import { PlannerResultsPanel } from '@/components/planner/PlannerResultsPanel';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';
import type { PlannerState, Statistics, ProjectionYear } from '@/types';
import { Calculator } from 'lucide-react';

/**
 * Retirement Planner Page
 *
 * Main planner interface with responsive layout:
 * - Desktop: Two-column layout (inputs | results)
 * - Mobile/Tablet: Tabs layout (Inputs tab | Results tab)
 *
 * Features:
 * - Real-time input validation
 * - Debounced updates
 * - Loading states
 * - Error handling
 * - Accessible keyboard navigation
 */
export default function PlannerPage() {
  // Planner state
  const [plannerState, setPlannerState] = React.useState<PlannerState>({
    currentAge: 35,
    retirementAge: 65,
    startingBalance: 100000,
    monthlyContribution: 5000,
    annualReturn: 10,
    inflation: 6,
    drawdownRate: 4,
  });

  // Results state
  const [statistics, setStatistics] = React.useState<Statistics | undefined>(
    undefined
  );
  const [projections, setProjections] = React.useState<
    ProjectionYear[] | undefined
  >(undefined);

  // UI state
  const [isCalculating, setIsCalculating] = React.useState(false);
  const [calculationError, setCalculationError] = React.useState<
    string | undefined
  >(undefined);
  const [activeTab, setActiveTab] = React.useState<'inputs' | 'results'>(
    'inputs'
  );

  // Handle planner state changes
  const handlePlannerStateChange = React.useCallback(
    (updates: Partial<PlannerState>) => {
      setPlannerState((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  /**
   * Calculate SARS progressive tax based on 2025/26 tax brackets
   * @param annualIncome - Annual income in Rands
   * @param age - Taxpayer age for rebate calculation
   * @returns Tax amount in Rands
   */
  const calculateSARSTax = React.useCallback((annualIncome: number, age: number): number => {
    // SARS 2025/26 Tax Brackets
    const brackets = [
      { min: 0, max: 237100, rate: 0.18, base: 0 },
      { min: 237101, max: 370500, rate: 0.26, base: 42678 },
      { min: 370501, max: 512800, rate: 0.31, base: 77362 },
      { min: 512801, max: 673000, rate: 0.36, base: 121475 },
      { min: 673001, max: 857900, rate: 0.39, base: 179147 },
      { min: 857901, max: 1817000, rate: 0.41, base: 251258 },
      { min: 1817001, max: Infinity, rate: 0.45, base: 644489 },
    ];

    // Age-based rebates
    const primaryRebate = 17235;
    const secondaryRebate = age >= 65 ? 9444 : 0;
    const tertiaryRebate = age >= 75 ? 3145 : 0;

    // Find applicable bracket
    const bracket = brackets.find(
      (b) => annualIncome >= b.min && annualIncome <= b.max
    );

    if (!bracket) return 0;

    // Calculate tax
    const grossTax = bracket.base + (annualIncome - bracket.min) * bracket.rate;
    const totalRebates = primaryRebate + secondaryRebate + tertiaryRebate;

    return Math.max(0, grossTax - totalRebates);
  }, []);

  // Calculate projection (mock implementation - would call API)
  const handleCalculate = React.useCallback(async () => {
    setIsCalculating(true);
    setCalculationError(undefined);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const yearsUntilRetirement = plannerState.retirementAge - plannerState.currentAge;
      const monthsUntilRetirement = yearsUntilRetirement * 12;
      const totalContributed =
        plannerState.startingBalance +
        plannerState.monthlyContribution * monthsUntilRetirement;

      // Calculate future value with monthly compounding (formula is correct)
      const monthlyRate = plannerState.annualReturn / 100 / 12;
      const futureValue =
        plannerState.startingBalance *
          Math.pow(1 + monthlyRate, monthsUntilRetirement) +
        plannerState.monthlyContribution *
          ((Math.pow(1 + monthlyRate, monthsUntilRetirement) - 1) / monthlyRate);

      // Year-by-year projections with monthly compounding
      const projectionData: ProjectionYear[] = [];
      let balance = plannerState.startingBalance;

      for (let i = 0; i <= 40; i++) {
        const age = plannerState.currentAge + i;
        const year = new Date().getFullYear() + i;
        const isRetired = age >= plannerState.retirementAge;
        const yearsFromStart = i;
        const yearsFromRetirement = isRetired ? i - yearsUntilRetirement : 0;

        // BUG #2 FIX: Track beginning balance BEFORE transactions
        const beginningBalance = balance;

        let yearlyContributions = 0;
        let yearlyInvestmentReturn = 0;
        let yearlyWithdrawals = 0;
        let yearlyTaxPaid = 0;

        // BUG #1 FIX: Apply monthly compounding instead of annual
        for (let month = 0; month < 12; month++) {
          // Apply monthly return
          const monthlyReturn = balance * monthlyRate;
          balance += monthlyReturn;
          yearlyInvestmentReturn += monthlyReturn;

          if (!isRetired) {
            // BUG #6 FIX: Apply inflation to contributions
            const inflationFactor = Math.pow(1 + plannerState.inflation / 100, yearsFromStart);
            const inflatedMonthlyContribution = plannerState.monthlyContribution * inflationFactor;

            balance += inflatedMonthlyContribution;
            yearlyContributions += inflatedMonthlyContribution;
          } else {
            // BUG #4 FIX: Monthly drawdown, not annual
            // BUG #6 FIX: Apply inflation to drawdown
            const inflationFactor = Math.pow(1 + plannerState.inflation / 100, yearsFromRetirement);
            const annualDrawdownAmount = beginningBalance * (plannerState.drawdownRate / 100) * inflationFactor;
            const monthlyWithdrawal = annualDrawdownAmount / 12;

            balance -= monthlyWithdrawal;
            yearlyWithdrawals += monthlyWithdrawal;
          }
        }

        // BUG #5 FIX: Calculate tax using SARS progressive brackets
        if (isRetired && yearlyWithdrawals > 0) {
          yearlyTaxPaid = calculateSARSTax(yearlyWithdrawals, age);
          balance -= yearlyTaxPaid;
        }

        // BUG #2 FIX: Track ending balance AFTER all transactions
        const endingBalance = balance;

        // Inflation adjustment for real value
        const inflationAdjustment = Math.pow(1 + plannerState.inflation / 100, i);

        projectionData.push({
          year,
          age,
          beginningBalance,
          contributions: yearlyContributions,
          investmentReturn: yearlyInvestmentReturn,
          withdrawals: yearlyWithdrawals,
          taxPaid: yearlyTaxPaid,
          endingBalance,
          inflationAdjustedBalance: endingBalance / inflationAdjustment,
        });

        // Stop if balance depleted
        if (balance <= 0) break;
      }

      // BUG #3 FIX: Calculate statistics from actual projection data
      const totalWithdrawn = projectionData.reduce((sum, p) => sum + p.withdrawals, 0);
      const totalTaxPaid = projectionData.reduce((sum, p) => sum + p.taxPaid, 0);
      const netAfterTaxIncome = totalWithdrawn - totalTaxPaid;
      const fundDepletionAge =
        projectionData.find((p) => p.endingBalance <= 0)?.age || 100;
      const effectiveTaxRate = totalWithdrawn > 0 ? (totalTaxPaid / totalWithdrawn) * 100 : 0;

      const calculatedStats: Statistics = {
        totalContributed,
        projectedValueAtRetirement: futureValue,
        totalWithdrawn,
        totalTaxPaid,
        netAfterTaxIncome,
        fundDepletionAge,
        wealthRetentionRatio: totalContributed > 0 ? netAfterTaxIncome / totalContributed : 0,
        effectiveTaxRate,
      };

      setStatistics(calculatedStats);
      setProjections(projectionData);

      // Switch to results tab on mobile
      setActiveTab('results');
    } catch (error) {
      setCalculationError(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    } finally {
      setIsCalculating(false);
    }
  }, [plannerState, calculateSARSTax]);

  // Reset to default values
  const handleReset = React.useCallback(() => {
    setPlannerState({
      currentAge: 35,
      retirementAge: 65,
      startingBalance: 100000,
      monthlyContribution: 5000,
      annualReturn: 10,
      inflation: 6,
      drawdownRate: 4,
    });
    setStatistics(undefined);
    setProjections(undefined);
    setCalculationError(undefined);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-gradient-to-r from-primary via-primary/90 to-secondary shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 shadow-lg backdrop-blur-sm">
                <Calculator
                  className="h-7 w-7 text-white"
                  aria-hidden="true"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  AI Retirement & Tax Planner
                </h1>
                <p className="text-sm text-white/90 sm:text-base">
                  Plan your financial future with confidence and smart tax optimization
                </p>
              </div>
            </div>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Desktop: Two-column layout */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8">
          <div className="space-y-6">
            <PlannerInputPanel
              plannerState={plannerState}
              onPlannerStateChange={handlePlannerStateChange}
              onCalculate={handleCalculate}
              onReset={handleReset}
              isCalculating={isCalculating}
            />
          </div>
          <div className="space-y-6">
            <PlannerResultsPanel
              statistics={statistics}
              projections={projections}
              loading={isCalculating}
              error={calculationError}
            />
          </div>
        </div>

        {/* Mobile/Tablet: Tabs layout */}
        <div className="lg:hidden">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'inputs' | 'results')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="inputs">Inputs</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>
            <TabsContent value="inputs" className="mt-6">
              <PlannerInputPanel
                plannerState={plannerState}
                onPlannerStateChange={handlePlannerStateChange}
                onCalculate={handleCalculate}
                onReset={handleReset}
                isCalculating={isCalculating}
              />
            </TabsContent>
            <TabsContent value="results" className="mt-6">
              <PlannerResultsPanel
                statistics={statistics}
                projections={projections}
                loading={isCalculating}
                error={calculationError}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            AI Retirement & Tax Optimization Planner - Built with Next.js, React, and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}
