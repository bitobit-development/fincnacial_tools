# API Documentation: PATCH /api/advisor/session

## Overview

The PATCH endpoint for `/api/advisor/session` enables users to save manual adjustments to their retirement plan parameters. These adjustments override AI-recommended values and persist across sessions.

## Endpoint Details

- **Method:** PATCH
- **Path:** `/api/advisor/session`
- **Purpose:** Save manual adjustments to retirement plan parameters
- **Authentication:** Session-based (sessionId required)
- **Content-Type:** application/json

## Request Format

### Request Body Schema

```typescript
{
  sessionId: string;      // Required: UUID format
  adjustments: {          // Required: At least one field must be present
    monthly_ra_contribution?: number;  // Optional: Range 0-500000
    investment_return?: number;        // Optional: Range 0-15 (percentage)
    inflation_rate?: number;           // Optional: Range 0-10 (percentage)
  };
}
```

### Request Example

```typescript
const response = await fetch('/api/advisor/session', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sessionId: '550e8400-e29b-41d4-a716-446655440000',
    adjustments: {
      monthly_ra_contribution: 25000,
      investment_return: 8.5,
      inflation_rate: 5.5,
    },
  }),
});

const result = await response.json();
```

### Request with Partial Adjustments

```typescript
// Only adjust one or two parameters
await fetch('/api/advisor/session', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: '550e8400-e29b-41d4-a716-446655440000',
    adjustments: {
      monthly_ra_contribution: 30000,
      // Other parameters remain unchanged
    },
  }),
});
```

## Response Format

### Success Response (200 OK)

```typescript
{
  success: true;
  data: {
    sessionId: string;
    message: string;
    adjustments: {
      monthly_ra_contribution?: number;
      investment_return?: number;
      inflation_rate?: number;
      adjusted_at: string;        // ISO 8601 timestamp
      adjusted_by: "user";        // Always "user" for manual adjustments
    };
  };
}
```

### Success Response Example

```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "message": "Session adjustments saved successfully",
    "adjustments": {
      "monthly_ra_contribution": 25000,
      "investment_return": 8.5,
      "inflation_rate": 5.5,
      "adjusted_at": "2025-10-14T10:27:00.000Z",
      "adjusted_by": "user"
    }
  }
}
```

### Error Response (400 Bad Request)

```typescript
{
  success: false;
  error: string;
  details?: Array<{
    code: string;
    expected?: string;
    received?: string;
    path: string[];
    message: string;
  }>;
}
```

### Validation Error Example

```json
{
  "success": false,
  "error": "Invalid request data",
  "details": [
    {
      "code": "too_big",
      "expected": "15",
      "received": "20",
      "path": ["adjustments", "investment_return"],
      "message": "Investment return must be between 0 and 15"
    }
  ]
}
```

### Error Response (404 Not Found)

```json
{
  "success": false,
  "error": "Session not found"
}
```

### Error Response (500 Internal Server Error)

```json
{
  "success": false,
  "error": "Failed to update session",
  "details": "Database connection error"
}
```

## Validation Rules

### Field-Level Validations

| Field | Type | Required | Min | Max | Notes |
|-------|------|----------|-----|-----|-------|
| sessionId | string (UUID) | Yes | - | - | Must be valid UUID format |
| adjustments | object | Yes | - | - | At least one field must be provided |
| monthly_ra_contribution | number | No | 0 | 500,000 | South African Rand (ZAR) |
| investment_return | number | No | 0 | 15 | Percentage (annual) |
| inflation_rate | number | No | 0 | 10 | Percentage (annual) |

### Request-Level Validations

1. **Session ID Format:**
   - Must be a valid UUID v4
   - Example: `550e8400-e29b-41d4-a716-446655440000`

2. **Adjustments Object:**
   - Cannot be empty
   - At least one adjustment field must be present
   - All provided fields must pass range validation

3. **Numeric Ranges:**
   - All numeric values must be within specified ranges
   - No negative values allowed
   - Decimal values are supported (e.g., 8.5 for investment_return)

## Error Codes

| HTTP Status | Error Type | Description | Resolution |
|-------------|-----------|-------------|------------|
| 400 | Validation Error | Request data failed Zod validation | Check error.details for specific field errors |
| 400 | Invalid UUID | sessionId is not a valid UUID | Provide a valid UUID format |
| 400 | Empty Adjustments | No adjustment fields provided | Include at least one adjustment field |
| 404 | Session Not Found | sessionId does not exist in database | Verify session exists and ID is correct |
| 500 | Database Error | Database query or update failed | Check server logs; retry request |
| 500 | Internal Error | Unexpected server error | Contact support with request details |

## Usage Examples

### Example 1: Adjust All Parameters

```typescript
const adjustAllParams = async () => {
  try {
    const response = await fetch('/api/advisor/session', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionId,
        adjustments: {
          monthly_ra_contribution: 35000,
          investment_return: 9.0,
          inflation_rate: 6.0,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Save failed:', error);
      return;
    }

    const result = await response.json();
    console.log('Saved:', result.data.adjustments);
  } catch (error) {
    console.error('Network error:', error);
  }
};
```

### Example 2: Adjust Single Parameter

```typescript
const adjustContributionOnly = async () => {
  const response = await fetch('/api/advisor/session', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: sessionId,
      adjustments: {
        monthly_ra_contribution: 40000,
        // Other parameters unchanged
      },
    }),
  });

  return response.json();
};
```

### Example 3: Reset to AI Recommendations

```typescript
const resetToAI = async (aiRecommendations: any) => {
  const response = await fetch('/api/advisor/session', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: sessionId,
      adjustments: {
        monthly_ra_contribution: aiRecommendations.monthly_ra_contribution,
        investment_return: aiRecommendations.investment_return,
        inflation_rate: aiRecommendations.inflation_rate,
      },
    }),
  });

  return response.json();
};
```

### Example 4: Error Handling

```typescript
const saveWithErrorHandling = async (adjustments: any) => {
  try {
    const response = await fetch('/api/advisor/session', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionId,
        adjustments,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      switch (response.status) {
        case 400:
          if (result.details) {
            // Validation errors
            result.details.forEach((err: any) => {
              console.error(`Field ${err.path.join('.')}: ${err.message}`);
            });
          } else {
            console.error('Bad request:', result.error);
          }
          break;
        case 404:
          console.error('Session not found');
          break;
        case 500:
          console.error('Server error:', result.error);
          break;
      }
      return null;
    }

    return result.data;
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
};
```

## Database Schema

The adjustments are stored in the `ai_advisor_sessions` table within the `userProfile` JSONB column:

```sql
-- ai_advisor_sessions table structure (relevant fields)
CREATE TABLE ai_advisor_sessions (
  id UUID PRIMARY KEY,
  user_profile JSONB NOT NULL,
  -- other fields...
);

-- userProfile.manual_adjustments structure
{
  "current_age": 35,
  "retirement_age": 65,
  "current_income": 50000,
  -- ... other profile fields
  "manual_adjustments": {
    "monthly_ra_contribution": 25000,
    "investment_return": 8.5,
    "inflation_rate": 5.5,
    "adjusted_at": "2025-10-14T10:27:00.000Z",
    "adjusted_by": "user"
  }
}
```

## Integration with Chatbot

Manual adjustments are automatically included in the chatbot's system prompt:

```typescript
// System prompt includes:
if (session.userProfile.manual_adjustments) {
  systemPrompt += `
User has manually adjusted the following values:
- Monthly RA Contribution: R ${adj.monthly_ra_contribution}
- Investment Return: ${adj.investment_return}%
- Inflation Rate: ${adj.inflation_rate}%

YOU MUST use these adjusted values in all calculations and recommendations.
These values override any AI-recommended values.
`;
}
```

## Performance Characteristics

- **Response Time:** < 500ms (typical: 200-300ms)
- **Database Operations:** 1 SELECT + 1 UPDATE
- **Payload Size:** ~500 bytes request, ~300 bytes response
- **Concurrency:** Thread-safe; supports multiple concurrent requests per session

## Security Considerations

1. **Session Validation:** Always verify session exists before update
2. **Input Sanitization:** Zod validation prevents injection attacks
3. **Range Limits:** Enforced at API level to prevent unrealistic values
4. **No Authentication Required:** Session ID acts as authorization token
5. **Audit Trail:** adjusted_at timestamp tracks when changes were made

## Rate Limiting

No specific rate limiting is enforced, but consider implementing:
- Max 10 requests per minute per session
- Debounce UI updates to prevent excessive API calls

## Backwards Compatibility

- Missing manual_adjustments field is treated as "no adjustments"
- Partial adjustments only update specified fields
- Older sessions without manual_adjustments continue to work
- Adding new adjustment fields will not break existing integrations

## Testing

### Unit Test Example

```typescript
describe('PATCH /api/advisor/session', () => {
  it('should save valid adjustments', async () => {
    const response = await fetch('/api/advisor/session', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: validSessionId,
        adjustments: {
          monthly_ra_contribution: 25000,
          investment_return: 8.5,
          inflation_rate: 5.5,
        },
      }),
    });

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.data.adjustments.monthly_ra_contribution).toBe(25000);
  });

  it('should reject out-of-range values', async () => {
    const response = await fetch('/api/advisor/session', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: validSessionId,
        adjustments: {
          investment_return: 20, // Exceeds max of 15
        },
      }),
    });

    expect(response.status).toBe(400);
    const result = await response.json();
    expect(result.success).toBe(false);
    expect(result.details).toBeDefined();
  });
});
```

## Related Endpoints

- **POST /api/advisor/session** - Create new advisor session
- **GET /api/advisor/session/[id]** - Retrieve session details
- **POST /api/advisor/chat** - Send chat message (uses manual_adjustments)

## Changelog

- **2025-10-14:** Initial implementation of manual adjustments feature
- **Phase 3:** Added bidirectional sync between UI and database
