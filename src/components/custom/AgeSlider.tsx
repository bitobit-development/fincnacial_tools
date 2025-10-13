'use client';

import * as React from 'react';
import { SliderWithInput } from './SliderWithInput';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgeSliderProps {
  currentAge: number;
  retirementAge: number;
  onCurrentAgeChange: (age: number) => void;
  onRetirementAgeChange: (age: number) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * AgeSlider Component
 *
 * Dual sliders for current age (18-80) and retirement age (40-100).
 * Validates that retirement age > current age.
 * Displays "Years until retirement" calculation.
 *
 * Example:
 * <AgeSlider
 *   currentAge={35}
 *   retirementAge={65}
 *   onCurrentAgeChange={setCurrentAge}
 *   onRetirementAgeChange={setRetirementAge}
 * />
 */
export function AgeSlider({
  currentAge,
  retirementAge,
  onCurrentAgeChange,
  onRetirementAgeChange,
  disabled = false,
  className,
}: AgeSliderProps) {
  const [error, setError] = React.useState<string | null>(null);

  // Calculate years until retirement
  const yearsUntilRetirement = React.useMemo(() => {
    return Math.max(0, retirementAge - currentAge);
  }, [currentAge, retirementAge]);

  // Validate retirement age when current age changes
  const handleCurrentAgeChange = React.useCallback(
    (newAge: number) => {
      onCurrentAgeChange(newAge);

      // If retirement age is now invalid, adjust it
      if (retirementAge <= newAge) {
        const suggestedRetirementAge = Math.min(newAge + 5, 100);
        onRetirementAgeChange(suggestedRetirementAge);
        setError('Retirement age adjusted to be after current age');

        // Clear error after 3 seconds
        setTimeout(() => setError(null), 3000);
      } else {
        setError(null);
      }
    },
    [retirementAge, onCurrentAgeChange, onRetirementAgeChange]
  );

  // Validate retirement age when retirement age changes
  const handleRetirementAgeChange = React.useCallback(
    (newAge: number) => {
      if (newAge <= currentAge) {
        setError('Retirement age must be greater than current age');
        // Don't update if invalid
        return;
      }

      onRetirementAgeChange(newAge);
      setError(null);
    },
    [currentAge, onRetirementAgeChange]
  );

  return (
    <Card className={cn('', className)}>
      <CardContent className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Age Parameters</h3>
              <p className="text-sm text-muted-foreground">
                Set your current and retirement ages
              </p>
            </div>
          </div>

          {/* Years until retirement badge */}
          <Badge
            variant={yearsUntilRetirement === 0 ? 'destructive' : 'default'}
            className="text-base font-semibold"
          >
            {yearsUntilRetirement} years
          </Badge>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Current Age Slider */}
        <SliderWithInput
          label="Current Age"
          value={currentAge}
          onChange={handleCurrentAgeChange}
          min={18}
          max={80}
          step={1}
          unit=" yrs"
          tooltip="Your current age. Must be between 18 and 80 years."
          disabled={disabled}
        />

        {/* Retirement Age Slider */}
        <SliderWithInput
          label="Retirement Age"
          value={retirementAge}
          onChange={handleRetirementAgeChange}
          min={40}
          max={100}
          step={1}
          unit=" yrs"
          tooltip="Age you plan to retire. Must be greater than current age and between 40 and 100 years."
          disabled={disabled}
        />

        {/* Summary */}
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Current Age</p>
              <p className="text-xl font-bold">{currentAge}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Retirement Age</p>
              <p className="text-xl font-bold">{retirementAge}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-sm text-muted-foreground">Years to Save</p>
              <p className="text-xl font-bold text-primary">
                {yearsUntilRetirement}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
