'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  className?: string;
}

/**
 * ChatMessage Component
 *
 * Displays a single message in the AI advisor chat.
 * Different styling for user vs assistant messages.
 */
export function ChatMessage({ role, content, timestamp, className }: ChatMessageProps) {
  const isUser = role === 'user';
  const isSystem = role === 'system';

  if (isSystem) {
    return (
      <div className={cn('flex justify-center my-4', className)}>
        <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex gap-3 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500',
        isUser ? 'flex-row-reverse' : 'flex-row',
        className
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message Content */}
      <div className={cn('flex flex-col gap-1 max-w-[80%]', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'rounded-lg px-4 py-3 text-sm',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground border border-border'
          )}
        >
          <div className="whitespace-pre-wrap break-words">{content}</div>
        </div>

        {/* Timestamp */}
        <div className="text-xs text-muted-foreground px-1">
          {timestamp.toLocaleTimeString('en-ZA', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}
