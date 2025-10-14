/**
 * NewClientButton Component
 *
 * Button to start a new client calculation/session
 */

'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface NewClientButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function NewClientButton({ onClick, disabled = false }: NewClientButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2"
    >
      <PlusCircle className="h-4 w-4" />
      <span>New Client</span>
    </Button>
  );
}
