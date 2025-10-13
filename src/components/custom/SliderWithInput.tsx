'use client';

import * as React from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebouncedCallback } from 'use-debounce';

interface SliderWithInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  tooltip?: string;
  formatValue?: (value: number) => string;
  disabled?: boolean;
  id?: string;
}

/**
 * SliderWithInput Component
 *
 * Synchronized slider + numeric input with debounced updates.
 * Responsive: side-by-side (desktop), stacked (mobile).
 *
 * Example:
 * <SliderWithInput
 *   label="Annual Return"
 *   value={7.5}
 *   onChange={setValue}
 *   min={0}
 *   max={20}
 *   step={0.1}
 *   unit="%"
 *   tooltip="Expected yearly growth rate"
 * />
 */
export function SliderWithInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  tooltip,
  formatValue,
  disabled = false,
  id,
}: SliderWithInputProps) {
  const [localValue, setLocalValue] = React.useState(value);
  const inputId = id || React.useId();
  const sliderId = `${inputId}-slider`;

  // Sync local value with prop value
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced update to parent (250ms)
  const debouncedOnChange = useDebouncedCallback((newValue: number) => {
    onChange(newValue);
  }, 250);

  // Format display value
  const getDisplayValue = React.useCallback(
    (val: number): string => {
      if (formatValue) {
        return formatValue(val);
      }
      return unit ? `${val}${unit}` : val.toString();
    },
    [formatValue, unit]
  );

  // Handle slider change
  const handleSliderChange = (values: number[]) => {
    const newValue = values[0];
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/[^\d.-]/g, '');

    if (inputValue === '' || inputValue === '-') {
      setLocalValue(min);
      return;
    }

    const numValue = parseFloat(inputValue);

    if (isNaN(numValue)) {
      return;
    }

    // Clamp value between min and max
    const clampedValue = Math.min(Math.max(numValue, min), max);
    setLocalValue(clampedValue);
    debouncedOnChange(clampedValue);
  };

  // Handle input blur (commit changes)
  const handleInputBlur = () => {
    // Ensure value is within bounds
    const clampedValue = Math.min(Math.max(localValue, min), max);
    setLocalValue(clampedValue);
    onChange(clampedValue);
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }

    // Arrow up/down to increment/decrement
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newValue = Math.min(localValue + step, max);
      setLocalValue(newValue);
      onChange(newValue);
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newValue = Math.max(localValue - step, min);
      setLocalValue(newValue);
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-3">
      {/* Label with optional tooltip */}
      <div className="flex items-center justify-between">
        <Label
          htmlFor={inputId}
          className="text-sm font-medium leading-none"
        >
          {label}
        </Label>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  aria-label={`Help: ${label}`}
                >
                  <HelpCircle className="h-4 w-4" aria-hidden="true" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Slider and Input - Responsive layout */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        {/* Slider - takes most space on desktop */}
        <div className="flex-1">
          <Slider
            id={sliderId}
            min={min}
            max={max}
            step={step}
            value={[localValue]}
            onValueChange={handleSliderChange}
            disabled={disabled}
            aria-label={label}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={localValue}
            aria-valuetext={getDisplayValue(localValue)}
            className="w-full"
          />
        </div>

        {/* Input - fixed width on desktop */}
        <div className="relative">
          <Input
            id={inputId}
            type="text"
            inputMode="decimal"
            value={localValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            aria-label={`${label} value`}
            className={cn(
              'w-full font-mono text-base sm:w-28',
              unit && 'pr-8'
            )}
          />
          {unit && (
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
              aria-hidden="true"
            >
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{getDisplayValue(min)}</span>
        <span>{getDisplayValue(max)}</span>
      </div>
    </div>
  );
}
