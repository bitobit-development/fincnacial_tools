# Developer Guide: Phase 3 Bidirectional Sync

## Overview

This guide helps developers understand, extend, and maintain the Phase 3 Bidirectional Sync feature. It covers architecture patterns, code organization, and how to add new adjustable parameters.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Code Organization](#code-organization)
3. [Adding New Adjustable Parameters](#adding-new-adjustable-parameters)
4. [State Management](#state-management)
5. [API Integration](#api-integration)
6. [Database Schema](#database-schema)
7. [Chatbot Integration](#chatbot-integration)
8. [Testing](#testing)
9. [Performance Optimization](#performance-optimization)
10. [Common Patterns](#common-patterns)

## Architecture Overview

### Core Components

Phase 3 implements a unidirectional data flow with bidirectional sync:

```
UI (React) → API (Next.js) → Database (Postgres) → Chatbot (OpenAI)
     ↑                                    ↓
     └────────────────────────────────────┘
              (Load on refresh)
```

### Key Design Decisions

1. **Single Source of Truth:** Database stores authoritative state
2. **Optimistic UI Updates:** Immediate feedback, async persistence
3. **JSONB Storage:** Flexible schema for manual_adjustments
4. **Zod Validation:** Type-safe validation at API boundary
5. **Real-time Calculations:** Impact computed client-side for responsiveness

## Code Organization

### Directory Structure

```
src/
├── app/
│   ├── advisor/
│   │   └── page.tsx                    # Main advisor page
│   └── api/
│       └── advisor/
│           ├── session/
│           │   └── route.ts            # PATCH endpoint for adjustments
│           └── chat/
│               └── route.ts            # Chatbot endpoint
├── components/
│   ├── advisor/
│   │   └── PlanAdjustmentsPanel.tsx   # Main adjustments UI
│   └── planner/
│       └── PlannerResultsPanel.tsx     # Results display (tabs)
├── lib/
│   ├── db/
│   │   └── schema.ts                   # Database schema (Drizzle)
│   ├── services/
│   │   ├── openaiAdvisor.ts           # Chatbot integration
│   │   └── aiAdvisorCalculations.ts   # Calculation utilities
│   ├── validations/
│   │   └── aiAdvisorValidation.ts     # Zod schemas
│   └── types/
│       └── aiAdvisor.ts                # TypeScript types
└── types/
    └── aiAdvisor.ts                    # Shared types
```

### File Responsibilities

| File | Purpose | Key Exports |
|------|---------|-------------|
| `PlanAdjustmentsPanel.tsx` | UI for adjusting parameters | PlanAdjustmentsPanel component |
| `route.ts` (session) | API endpoint for saving | PATCH handler |
| `openaiAdvisor.ts` | Chatbot prompt building | buildSystemPrompt() |
| `aiAdvisorCalculations.ts` | Financial calculations | calculateImpact() |
| `aiAdvisorValidation.ts` | Validation schemas | PatchSessionRequestSchema |
| `schema.ts` | Database schema | aiAdvisorSessions table |

## Adding New Adjustable Parameters

Follow these steps to add a new parameter (e.g., "target_retirement_monthly_income"):

### Step 1: Update Type Definitions

**File:** `/src/types/aiAdvisor.ts`

```typescript
export interface ManualAdjustments {
  monthly_ra_contribution?: number;
  investment_return?: number;
  inflation_rate?: number;
  target_retirement_monthly_income?: number; // NEW
  adjusted_at?: Date;
  adjusted_by?: string;
}
```

### Step 2: Update Validation Schema

**File:** `/src/lib/validations/aiAdvisorValidation.ts`

```typescript
export const ManualAdjustmentsSchema = z.object({
  monthly_ra_contribution: z.number().min(0).max(500000).optional(),
  investment_return: z.number().min(0).max(15).optional(),
  inflation_rate: z.number().min(0).max(10).optional(),
  target_retirement_monthly_income: z.number().min(0).max(1000000).optional(), // NEW
  adjusted_at: z.date().optional(),
  adjusted_by: z.string().optional(),
});

export const PatchSessionRequestSchema = z.object({
  sessionId: z.string().uuid(),
  adjustments: ManualAdjustmentsSchema.refine(
    (data) => {
      // Ensure at least one field is provided
      const fields = [
        'monthly_ra_contribution',
        'investment_return',
        'inflation_rate',
        'target_retirement_monthly_income', // NEW
      ];
      return fields.some((key) => data[key] !== undefined);
    },
    {
      message: 'At least one adjustment field must be provided',
    }
  ),
});
```

### Step 3: Update API Endpoint

**File:** `/src/app/api/advisor/session/route.ts`

No changes needed! The PATCH handler automatically handles any fields in the ManualAdjustmentsSchema.

```typescript
// The existing code already works:
const existingAdjustments = session.userProfile.manual_adjustments || {};
const updatedAdjustments = {
  ...existingAdjustments,
  ...validatedData.adjustments, // Includes new field
  adjusted_at: new Date(),
  adjusted_by: 'user',
};
```

### Step 4: Update UI Component

**File:** `/src/components/advisor/PlanAdjustmentsPanel.tsx`

Add the new slider control:

```typescript
const PlanAdjustmentsPanel: React.FC<Props> = ({ session }) => {
  // Existing state...
  const [currentAdjustments, setCurrentAdjustments] = useState({
    monthly_ra_contribution: 0,
    investment_return: 0,
    inflation_rate: 0,
    target_retirement_monthly_income: 0, // NEW
  });

  const handleAdjustmentChange = (field: string, value: number) => {
    setCurrentAdjustments((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Existing sliders... */}

      {/* NEW SLIDER */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Target Monthly Income in Retirement
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0}
            max={1000000}
            step={1000}
            value={currentAdjustments.target_retirement_monthly_income}
            onChange={(e) =>
              handleAdjustmentChange(
                'target_retirement_monthly_income',
                Number(e.target.value)
              )
            }
            className="flex-1"
          />
          <input
            type="number"
            value={currentAdjustments.target_retirement_monthly_income}
            onChange={(e) =>
              handleAdjustmentChange(
                'target_retirement_monthly_income',
                Number(e.target.value)
              )
            }
            min={0}
            max={1000000}
            className="w-32 px-3 py-2 border rounded"
          />
          {aiRecommendations.target_retirement_monthly_income && (
            <span className="text-sm text-muted-foreground">
              AI: R{' '}
              {aiRecommendations.target_retirement_monthly_income.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Existing buttons and impact summary... */}
    </div>
  );
};
```

### Step 5: Update Calculation Functions

**File:** `/src/lib/services/aiAdvisorCalculations.ts`

Ensure calculations use the adjusted value:

```typescript
export function calculateRetirementProjections(
  profile: UserProfile,
  manualAdjustments?: ManualAdjustments
): RetirementProjection {
  // Use manual adjustment if provided, otherwise use profile value
  const targetIncome =
    manualAdjustments?.target_retirement_monthly_income ??
    profile.retirement_goal_monthly;

  // Rest of calculation logic using targetIncome...
}
```

### Step 6: Update Chatbot Prompt

**File:** `/src/lib/services/openaiAdvisor.ts`

Include the new field in the system prompt:

```typescript
export function buildSystemPrompt(session: AIAdvisorSession): string {
  let systemPrompt = `You are a financial advisor...`;

  const adj = session.userProfile.manual_adjustments;
  if (adj) {
    systemPrompt += `\n\nIMPORTANT: User Manual Adjustments\n`;
    systemPrompt += `The user has manually adjusted the following values:\n`;

    if (adj.monthly_ra_contribution !== undefined) {
      systemPrompt += `- Monthly RA Contribution: R ${adj.monthly_ra_contribution.toLocaleString()}\n`;
    }
    if (adj.investment_return !== undefined) {
      systemPrompt += `- Investment Return: ${adj.investment_return}%\n`;
    }
    if (adj.inflation_rate !== undefined) {
      systemPrompt += `- Inflation Rate: ${adj.inflation_rate}%\n`;
    }
    // NEW
    if (adj.target_retirement_monthly_income !== undefined) {
      systemPrompt += `- Target Monthly Income in Retirement: R ${adj.target_retirement_monthly_income.toLocaleString()}\n`;
    }

    systemPrompt += `\nYOU MUST use these adjusted values in all calculations and recommendations.\n`;
  }

  return systemPrompt;
}
```

### Step 7: Update Tests

**File:** `/tests/e2e/advisor-adjustments.spec.ts`

Add tests for the new field:

```typescript
test('should save target_retirement_monthly_income adjustment', async () => {
  // Adjust the new slider
  await page.fill('input[name="target_retirement_monthly_income"]', '45000');

  // Save
  await page.click('button:has-text("Save Adjustments")');

  // Verify
  await expect(page.locator('text=Changes saved')).toBeVisible();

  // Reload and verify persistence
  await page.reload();
  const inputValue = await page.inputValue(
    'input[name="target_retirement_monthly_income"]'
  );
  expect(inputValue).toBe('45000');
});

test('chatbot uses target_retirement_monthly_income adjustment', async () => {
  // Save adjustment
  await saveAdjustment('target_retirement_monthly_income', 45000);

  // Send chat message
  await page.click('button:has-text("Chat")');
  await page.fill('textarea[name="message"]', 'What is my retirement goal?');
  await page.click('button:has-text("Send")');

  // Verify AI response mentions custom value
  await expect(
    page.locator(
      'text=/your target monthly income of R 45,000|adjusted goal of R 45,000/i'
    )
  ).toBeVisible();
});
```

### Step 8: Testing Checklist

Before deploying the new parameter:

- [ ] TypeScript types updated (no compilation errors)
- [ ] Zod schema validates correctly (min/max ranges)
- [ ] UI slider renders and accepts input
- [ ] Value persists after save operation
- [ ] Database stores value in manual_adjustments JSONB
- [ ] Page refresh loads saved value correctly
- [ ] Chatbot prompt includes new field
- [ ] Calculations use adjusted value
- [ ] Unit tests added for validation
- [ ] Integration tests added for API endpoint
- [ ] E2E tests added for UI workflow
- [ ] Documentation updated

## State Management

### React State Pattern

```typescript
// Initial state from session
const [savedAdjustments, setSavedAdjustments] = useState<ManualAdjustments>(
  session.userProfile.manual_adjustments || {}
);

// Current UI state (may differ from saved)
const [currentAdjustments, setCurrentAdjustments] =
  useState<ManualAdjustments>(savedAdjustments);

// Computed: has unsaved changes?
const hasUnsavedChanges = useMemo(() => {
  return !isEqual(currentAdjustments, savedAdjustments);
}, [currentAdjustments, savedAdjustments]);

// Save handler
const handleSave = async () => {
  const response = await fetch('/api/advisor/session', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: session.id,
      adjustments: currentAdjustments,
    }),
  });

  if (response.ok) {
    setSavedAdjustments(currentAdjustments);
    toast.success('Adjustments saved successfully');
  }
};
```

### State Synchronization

```
┌─────────────────────────────────────────────────┐
│           State Synchronization Flow             │
└─────────────────────────────────────────────────┘

Database (Source of Truth)
    ↓
savedAdjustments (React state)
    ↓
currentAdjustments (React state)
    ↓
UI Sliders (Controlled inputs)

User Interaction:
    Slider onChange → Update currentAdjustments
    Click Save → POST to API → Update database → Update savedAdjustments

Page Refresh:
    Fetch from database → savedAdjustments → currentAdjustments → Sliders
```

## API Integration

### Request/Response Pattern

```typescript
// Request
interface PatchSessionRequest {
  sessionId: string;
  adjustments: ManualAdjustments;
}

// Response (Success)
interface PatchSessionResponse {
  success: true;
  data: {
    sessionId: string;
    message: string;
    adjustments: ManualAdjustments;
  };
}

// Response (Error)
interface PatchSessionError {
  success: false;
  error: string;
  details?: ZodError[];
}
```

### Error Handling Pattern

```typescript
async function saveAdjustments(
  sessionId: string,
  adjustments: ManualAdjustments
) {
  try {
    const response = await fetch('/api/advisor/session', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, adjustments }),
    });

    const result = await response.json();

    if (!response.ok) {
      if (response.status === 400 && result.details) {
        // Validation errors
        const errorMessages = result.details.map(
          (err: any) => `${err.path.join('.')}: ${err.message}`
        );
        throw new Error(errorMessages.join(', '));
      } else if (response.status === 404) {
        throw new Error('Session not found. Please start a new session.');
      } else {
        throw new Error(result.error || 'Failed to save adjustments');
      }
    }

    return result.data;
  } catch (error) {
    console.error('Save adjustments error:', error);
    throw error;
  }
}
```

## Database Schema

### Drizzle Schema Definition

**File:** `/src/lib/db/schema.ts`

```typescript
import { pgTable, uuid, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const aiAdvisorSessions = pgTable('ai_advisor_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userProfile: jsonb('user_profile').notNull().$type<{
    current_age: number;
    retirement_age: number;
    current_income: number;
    current_ra_contributions: number;
    current_savings: number;
    expected_expenses: number;
    retirement_goal_monthly: number;
    debt_obligations: number;
    investment_horizon: number;
    risk_tolerance: string;
    manual_adjustments?: {
      monthly_ra_contribution?: number;
      investment_return?: number;
      inflation_rate?: number;
      adjusted_at?: Date;
      adjusted_by?: string;
    };
  }>(),
  conversationHistory: jsonb('conversation_history').notNull().default([]),
  analysisResults: jsonb('analysis_results'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### Querying Manual Adjustments

```typescript
import { db } from '@/lib/db';
import { aiAdvisorSessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Fetch session with manual adjustments
const session = await db
  .select()
  .from(aiAdvisorSessions)
  .where(eq(aiAdvisorSessions.id, sessionId))
  .limit(1);

// Access manual adjustments
const adjustments = session[0]?.userProfile.manual_adjustments;

// Update manual adjustments
await db
  .update(aiAdvisorSessions)
  .set({
    userProfile: {
      ...existingProfile,
      manual_adjustments: {
        ...existingProfile.manual_adjustments,
        monthly_ra_contribution: 25000,
        adjusted_at: new Date(),
        adjusted_by: 'user',
      },
    },
    updatedAt: new Date(),
  })
  .where(eq(aiAdvisorSessions.id, sessionId));
```

### JSONB Advantages

- **Flexible Schema:** Add new fields without migrations
- **Efficient Queries:** GIN indexing for fast lookups
- **Nested Updates:** Merge adjustments without overwriting entire object
- **Type Safety:** Drizzle ORM provides TypeScript types

## Chatbot Integration

### System Prompt Builder

```typescript
export function buildSystemPrompt(session: AIAdvisorSession): string {
  const profile = session.userProfile;
  const adj = profile.manual_adjustments;

  let prompt = `You are an expert South African financial advisor...`;

  // Add user profile context
  prompt += `\n\nUser Profile:\n`;
  prompt += `- Current Age: ${profile.current_age}\n`;
  prompt += `- Retirement Age: ${profile.retirement_age}\n`;
  // ... more profile fields

  // Add manual adjustments if present
  if (adj) {
    prompt += `\n\n🔴 IMPORTANT: User Manual Adjustments 🔴\n`;
    prompt += `The user has manually adjusted these parameters:\n\n`;

    if (adj.monthly_ra_contribution !== undefined) {
      prompt += `- Monthly RA Contribution: R ${adj.monthly_ra_contribution.toLocaleString()}\n`;
      prompt += `  (Original: R ${profile.current_ra_contributions.toLocaleString()})\n\n`;
    }

    if (adj.investment_return !== undefined) {
      prompt += `- Expected Investment Return: ${adj.investment_return}%\n`;
      prompt += `  (This overrides default assumptions)\n\n`;
    }

    if (adj.inflation_rate !== undefined) {
      prompt += `- Expected Inflation Rate: ${adj.inflation_rate}%\n`;
      prompt += `  (This overrides default assumptions)\n\n`;
    }

    prompt += `\n🚨 CRITICAL INSTRUCTION 🚨\n`;
    prompt += `YOU MUST use these adjusted values in ALL calculations.\n`;
    prompt += `When discussing these parameters, acknowledge they are user-adjusted.\n`;
    prompt += `Example: "Based on your adjusted contribution of R ${adj.monthly_ra_contribution?.toLocaleString()}..."\n`;
  }

  return prompt;
}
```

### Context Window Management

- **System Prompt:** ~2,000 tokens (including adjustments)
- **Conversation History:** Last 10 messages (~5,000 tokens)
- **User Message:** Up to 1,000 tokens
- **Total Context:** ~8,000 tokens (well within GPT-4o's 128K limit)

## Testing

### Unit Tests

**File:** `/tests/unit/validation.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { PatchSessionRequestSchema } from '@/lib/validations/aiAdvisorValidation';

describe('PatchSessionRequestSchema', () => {
  it('validates correct adjustments', () => {
    const data = {
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      adjustments: {
        monthly_ra_contribution: 25000,
        investment_return: 8.5,
        inflation_rate: 5.5,
      },
    };

    const result = PatchSessionRequestSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('rejects out-of-range investment_return', () => {
    const data = {
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      adjustments: {
        investment_return: 20, // Exceeds max of 15
      },
    };

    const result = PatchSessionRequestSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('investment_return');
  });

  it('rejects empty adjustments', () => {
    const data = {
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      adjustments: {},
    };

    const result = PatchSessionRequestSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
```

### Integration Tests

**File:** `/tests/integration/api.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createSession, patchSession } from '@/lib/api/advisor';

describe('PATCH /api/advisor/session', () => {
  let sessionId: string;

  beforeEach(async () => {
    // Create test session
    const session = await createSession({ current_age: 35, /* ... */ });
    sessionId = session.id;
  });

  it('saves valid adjustments', async () => {
    const response = await patchSession(sessionId, {
      monthly_ra_contribution: 25000,
      investment_return: 8.5,
    });

    expect(response.success).toBe(true);
    expect(response.data.adjustments.monthly_ra_contribution).toBe(25000);
  });

  it('returns 404 for non-existent session', async () => {
    await expect(
      patchSession('550e8400-0000-0000-0000-000000000000', {
        monthly_ra_contribution: 25000,
      })
    ).rejects.toThrow('Session not found');
  });
});
```

### E2E Tests

**File:** `/tests/e2e/adjustments.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('complete adjustment flow', async ({ page }) => {
  // Navigate to advisor page
  await page.goto('/advisor');

  // Click Recommendations tab
  await page.click('button:has-text("Recommendations")');

  // Adjust slider
  await page.fill('input[name="monthly_ra_contribution"]', '25000');

  // Verify unsaved badge
  await expect(page.locator('text=Unsaved changes')).toBeVisible();

  // Save
  await page.click('button:has-text("Save Adjustments")');

  // Verify success
  await expect(page.locator('text=Changes saved')).toBeVisible();

  // Refresh page
  await page.reload();

  // Verify persistence
  const value = await page.inputValue('input[name="monthly_ra_contribution"]');
  expect(value).toBe('25000');
});
```

## Performance Optimization

### Client-Side Optimizations

1. **Debounce Slider Updates:**
```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedCalculate = useDebouncedCallback((adjustments) => {
  setImpactSummary(calculateImpact(adjustments));
}, 300); // 300ms delay

const handleSliderChange = (field: string, value: number) => {
  setCurrentAdjustments((prev) => ({ ...prev, [field]: value }));
  debouncedCalculate({ ...currentAdjustments, [field]: value });
};
```

2. **Memoize Expensive Calculations:**
```typescript
const impactSummary = useMemo(() => {
  return calculateImpact(currentAdjustments, aiRecommendations);
}, [currentAdjustments, aiRecommendations]);
```

3. **Optimize Re-renders:**
```typescript
const SliderControl = React.memo(({ label, value, onChange, aiValue }) => {
  return (
    <div>
      <label>{label}</label>
      <input type="range" value={value} onChange={onChange} />
      <span>AI: {aiValue}</span>
    </div>
  );
});
```

### Server-Side Optimizations

1. **Database Indexing:**
```sql
CREATE INDEX idx_sessions_id ON ai_advisor_sessions(id);
CREATE INDEX idx_sessions_created_at ON ai_advisor_sessions(created_at);
CREATE INDEX idx_sessions_user_profile ON ai_advisor_sessions USING GIN (user_profile);
```

2. **Connection Pooling:**
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

3. **Caching (Future Enhancement):**
```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache session for 30 minutes
await redis.setex(`session:${sessionId}`, 1800, JSON.stringify(session));

// Retrieve from cache
const cached = await redis.get(`session:${sessionId}`);
if (cached) {
  return JSON.parse(cached);
}
```

## Common Patterns

### Pattern 1: Conditional Field Rendering

```typescript
const renderSlider = (
  field: keyof ManualAdjustments,
  label: string,
  min: number,
  max: number,
  step: number
) => {
  const value = currentAdjustments[field] ?? 0;
  const aiValue = aiRecommendations[field];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => handleAdjustmentChange(field, Number(e.target.value))}
        />
        {aiValue !== undefined && (
          <span className="text-sm text-muted-foreground">
            AI: {aiValue}
          </span>
        )}
      </div>
    </div>
  );
};
```

### Pattern 2: Optimistic UI Updates

```typescript
const handleSave = async () => {
  // Optimistic update
  setSavedAdjustments(currentAdjustments);
  toast.success('Saving...');

  try {
    const response = await patchSession(sessionId, currentAdjustments);
    toast.success('Adjustments saved successfully');
  } catch (error) {
    // Rollback on error
    setSavedAdjustments(previousSavedAdjustments);
    toast.error('Failed to save adjustments');
  }
};
```

### Pattern 3: Field-Level Validation

```typescript
const validateField = (field: keyof ManualAdjustments, value: number): string | null => {
  const rules = {
    monthly_ra_contribution: { min: 0, max: 500000 },
    investment_return: { min: 0, max: 15 },
    inflation_rate: { min: 0, max: 10 },
  };

  const rule = rules[field];
  if (!rule) return null;

  if (value < rule.min) {
    return `${field} must be at least ${rule.min}`;
  }
  if (value > rule.max) {
    return `${field} must be at most ${rule.max}`;
  }
  return null;
};
```

## Best Practices

### Do's

✅ Always validate input on both client and server
✅ Use TypeScript for type safety
✅ Memoize expensive calculations
✅ Provide immediate UI feedback
✅ Handle all error cases gracefully
✅ Test edge cases (min/max values, empty inputs)
✅ Document complex logic with comments
✅ Use semantic HTML and ARIA labels for accessibility

### Don'ts

❌ Don't trust client-side validation alone
❌ Don't mutate state directly (use immutable updates)
❌ Don't skip error handling
❌ Don't hard-code values (use constants or config)
❌ Don't forget to update tests when adding fields
❌ Don't expose sensitive data in API responses
❌ Don't perform heavy calculations in render functions

## Debugging Tips

### Enable Debug Logging

```typescript
// Add to component
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Current Adjustments:', currentAdjustments);
    console.log('Saved Adjustments:', savedAdjustments);
    console.log('Has Unsaved Changes:', hasUnsavedChanges);
  }
}, [currentAdjustments, savedAdjustments, hasUnsavedChanges]);
```

### Inspect Database State

```sql
-- Check manual_adjustments for a session
SELECT
  id,
  user_profile->'manual_adjustments' AS adjustments,
  updated_at
FROM ai_advisor_sessions
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Find sessions with adjustments
SELECT COUNT(*)
FROM ai_advisor_sessions
WHERE user_profile->'manual_adjustments' IS NOT NULL;
```

### Test API Endpoint Directly

```bash
# Using curl
curl -X PATCH http://localhost:3000/api/advisor/session \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "adjustments": {
      "monthly_ra_contribution": 25000,
      "investment_return": 8.5
    }
  }'
```

## Migration Guide

### Migrating Existing Sessions

If you have existing sessions without manual_adjustments:

```typescript
// Migration script
import { db } from '@/lib/db';
import { aiAdvisorSessions } from '@/lib/db/schema';

async function migrateExistingSessions() {
  const sessions = await db.select().from(aiAdvisorSessions);

  for (const session of sessions) {
    if (!session.userProfile.manual_adjustments) {
      await db
        .update(aiAdvisorSessions)
        .set({
          userProfile: {
            ...session.userProfile,
            manual_adjustments: {}, // Initialize empty
          },
        })
        .where(eq(aiAdvisorSessions.id, session.id));
    }
  }

  console.log(`Migrated ${sessions.length} sessions`);
}
```

## Future Enhancements

### Planned Features

1. **Auto-save:** Save adjustments automatically after 2 seconds of inactivity
2. **Undo/Redo:** Implement history stack for adjustments
3. **Presets:** Save and load adjustment presets (Conservative, Moderate, Aggressive)
4. **Comparison View:** Compare multiple adjustment scenarios side-by-side
5. **Export:** Export adjustment history as CSV or PDF
6. **Notifications:** Email notifications when adjustments significantly impact projections

### Code Examples for Auto-save

```typescript
const debouncedSave = useDebouncedCallback(async (adjustments) => {
  try {
    await patchSession(sessionId, adjustments);
    setSavedAdjustments(adjustments);
    toast.success('Auto-saved');
  } catch (error) {
    console.error('Auto-save failed:', error);
  }
}, 2000); // 2 second delay

useEffect(() => {
  if (hasUnsavedChanges) {
    debouncedSave(currentAdjustments);
  }
}, [currentAdjustments, hasUnsavedChanges]);
```

## Resources

### Internal Documentation

- [API Reference: PATCH /api/advisor/session](/docs/API-ADVISOR-SESSION.md)
- [Architecture Diagram](/docs/PHASE-3-ARCHITECTURE.md)
- [User Guide](/docs/USER-GUIDE-PLAN-ADJUSTMENTS.md)
- [Troubleshooting Guide](/docs/TROUBLESHOOTING-PHASE-3.md)

### External Resources

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Zod Validation](https://zod.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [React State Management](https://react.dev/learn/managing-state)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)

## Support

For questions or issues:
- Open an issue on GitHub
- Check existing documentation
- Review test cases for usage examples
- Contact the development team

---

**Last Updated:** 2025-10-14
**Version:** 1.0
**Phase:** Phase 3 - Bidirectional Sync
