'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  id?: string;
}

/**
 * CurrencyInput Component
 *
 * Formats South African Rand with thousands separators and two decimal places.
 * Handles paste, type, and backspace intelligently.
 *
 * Example: User types "123456" → displays "R 123,456.00"
 */
export function CurrencyInput({
  value,
  onChange,
  label,
  placeholder = 'R 0.00',
  disabled = false,
  error,
  id,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);
  const inputId = id || React.useId();

  // Format number to ZAR currency string
  const formatCurrency = React.useCallback((num: number): string => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  }, []);

  // Update display value when prop value changes
  React.useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatCurrency(value));
    }
  }, [value, formatCurrency, isFocused]);

  // Parse display string to number
  const parseValue = (str: string): number => {
    // Remove all non-digit characters except decimal point
    const cleaned = str.replace(/[^\d.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow only numbers, spaces, and currency symbols while typing
    const cleaned = inputValue.replace(/[^\d]/g, '');

    if (cleaned === '') {
      setDisplayValue('');
      onChange(0);
      return;
    }

    // Parse as cents, convert to rands
    const numValue = parseInt(cleaned, 10) / 100;
    setDisplayValue(formatCurrency(numValue));
    onChange(numValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Show raw number format when focused for easier editing
    if (value === 0) {
      setDisplayValue('');
    } else {
      setDisplayValue(formatCurrency(value));
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    setDisplayValue(formatCurrency(value));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, decimal point
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];

    if (allowedKeys.includes(e.key)) {
      return;
    }

    // Allow Ctrl/Cmd + A, C, V, X
    if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
      return;
    }

    // Prevent if not a number
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const numValue = parseValue(pastedText);
    setDisplayValue(formatCurrency(numValue));
    onChange(numValue);
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label
          htmlFor={inputId}
          className={cn(
            'text-sm font-medium leading-none',
            error && 'text-destructive'
          )}
        >
          {label}
        </Label>
      )}
      <Input
        id={inputId}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={label || 'Currency input'}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn(
          'font-mono text-base',
          error && 'border-destructive focus-visible:ring-destructive'
        )}
      />
      {error && (
        <p
          id={`${inputId}-error`}
          className="text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
