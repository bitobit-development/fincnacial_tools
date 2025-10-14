'use client';

import * as React from 'react';
import { SliderControl } from './SliderControl';

interface CurrencySliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  aiRecommendation?: number;
  tooltip?: string;
  className?: string;
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
 * CurrencySliderControl Component
 *
 * Specialized slider control for currency values (South African Rand).
 * Wraps SliderControl with ZAR formatting.
 *
 * Formats values as: "R 12,345.00"
 *
 * @example
 * ```tsx
 * <CurrencySliderControl
 *   label="Monthly RA Contribution"
 *   value={10000}
 *   min={0}
 *   max={500000}
 *   step={500}
 *   onChange={(val) => setContribution(val)}
 *   aiRecommendation={12000}
 *   tooltip="Your monthly retirement annuity contribution"
 * />
 * ```
 */
export function CurrencySliderControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  aiRecommendation,
  tooltip,
  className,
}: CurrencySliderControlProps) {
  return (
    <SliderControl
      label={label}
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={onChange}
      aiRecommendation={aiRecommendation}
      tooltip={tooltip}
      formatValue={formatCurrency}
      className={className}
    />
  );
}
