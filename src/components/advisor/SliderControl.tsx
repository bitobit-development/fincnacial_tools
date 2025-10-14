'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

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

/**
 * SliderControl Component
 *
 * A comprehensive slider control with:
 * - Synchronized slider and number input
 * - AI recommendation marker on slider track
 * - Visual highlight when value differs from AI recommendation
 * - Tooltip with additional information
 * - Full keyboard navigation support
 * - WCAG 2.1 AA compliance
 *
 * @example
 * ```tsx
 * <SliderControl
 *   label="Monthly Contribution"
 *   value={10000}
 *   min={0}
 *   max={50000}
 *   step={500}
 *   onChange={(val) => setContribution(val)}
 *   aiRecommendation={12000}
 *   tooltip="AI-recommended contribution based on your income and goals"
 *   formatValue={(val) => `R ${val.toLocaleString()}`}
 * />
 * ```
 */
export function SliderControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  aiRecommendation,
  tooltip,
  formatValue,
  className,
}: SliderControlProps) {
  const [inputValue, setInputValue] = React.useState(value.toString());
  const [isFocused, setIsFocused] = React.useState(false);

  // Update input when value prop changes
  React.useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  // Check if current value differs from AI recommendation
  const isDifferentFromAI = aiRecommendation !== undefined && value !== aiRecommendation;

  // Calculate AI recommendation position as percentage
  const aiRecommendationPosition = aiRecommendation
    ? ((aiRecommendation - min) / (max - min)) * 100
    : 0;

  // Format display value
  const displayValue = formatValue ? formatValue(value) : value.toString();
  const aiDisplayValue = aiRecommendation && formatValue
    ? formatValue(aiRecommendation)
    : aiRecommendation?.toString();

  // Handle slider change
  const handleSliderChange = (values: number[]) => {
    const newValue = values[0];
    onChange(newValue);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    setInputValue(inputVal);
  };

  // Handle input blur - validate and update
  const handleInputBlur = () => {
    setIsFocused(false);
    const numValue = parseFloat(inputValue);

    if (!isNaN(numValue)) {
      // Clamp value to min/max range
      const clampedValue = Math.max(min, Math.min(max, numValue));
      // Round to nearest step
      const steppedValue = Math.round(clampedValue / step) * step;
      onChange(steppedValue);
      setInputValue(steppedValue.toString());
    } else {
      // Reset to current value if invalid
      setInputValue(value.toString());
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsFocused(true);
  };

  // Handle input key down (Enter to submit)
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <TooltipProvider>
      <div className={cn('space-y-3', className)}>
        {/* Label Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <label
              htmlFor={`slider-${label}`}
              className="text-sm sm:text-base font-medium text-foreground"
            >
              {label}
            </label>
            {tooltip && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={`Learn more about ${label}`}
                    className="inline-flex items-center justify-center rounded-full p-1 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
                  >
                    <Info className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[280px]">
                  <p className="text-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Value Display */}
          <div className="text-sm sm:text-base font-semibold text-foreground">
            {displayValue}
          </div>
        </div>

        {/* Slider Container with AI Marker */}
        <div className="relative w-full pt-2 pb-1">
          <Slider
            id={`slider-${label}`}
            value={[value]}
            min={min}
            max={max}
            step={step}
            onValueChange={handleSliderChange}
            className={cn(
              'w-full',
              isDifferentFromAI && 'slider-modified'
            )}
            aria-label={label}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-valuetext={displayValue}
          />

          {/* AI Recommendation Marker */}
          {aiRecommendation !== undefined && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="absolute top-0 h-8 w-0.5 bg-accent/50 rounded-full pointer-events-auto cursor-help"
                  style={{
                    left: `${aiRecommendationPosition}%`,
                    transform: 'translateX(-50%)',
                  }}
                  role="presentation"
                  aria-hidden="true"
                >
                  {/* Visual dot at top of marker */}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-accent border border-accent-foreground/20" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px]">
                <p className="text-xs font-semibold">AI Recommended: {aiDisplayValue}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Bottom Row: Input and AI Comparison */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Number Input */}
          <div className="flex-1 min-w-[120px] max-w-[180px]">
            <Input
              type="number"
              value={isFocused ? inputValue : value}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onFocus={handleInputFocus}
              onKeyDown={handleInputKeyDown}
              min={min}
              max={max}
              step={step}
              aria-label={`Enter ${label} value`}
              className="h-9 text-sm"
            />
          </div>

          {/* AI Recommendation Comparison */}
          {isDifferentFromAI && aiDisplayValue && (
            <div className="text-xs text-muted-foreground">
              <span className="hidden sm:inline">AI Recommended: </span>
              <span className="sm:hidden">AI: </span>
              <span className="font-medium text-accent">{aiDisplayValue}</span>
            </div>
          )}
        </div>

        {/* Screen Reader Announcement */}
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {label}: {displayValue}
          {isDifferentFromAI && aiDisplayValue && `. AI recommends ${aiDisplayValue}`}
        </div>
      </div>
    </TooltipProvider>
  );
}
