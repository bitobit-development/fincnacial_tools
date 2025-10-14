# Troubleshooting Guide: Phase 3 Bidirectional Sync

## Overview

This guide helps diagnose and resolve common issues with the Plan Adjustments feature (Phase 3). It covers UI problems, API errors, database issues, and chatbot integration problems.

## Table of Contents

1. [UI Issues](#ui-issues)
2. [Save Operation Problems](#save-operation-problems)
3. [Data Persistence Issues](#data-persistence-issues)
4. [Chatbot Integration Problems](#chatbot-integration-problems)
5. [Validation Errors](#validation-errors)
6. [Performance Issues](#performance-issues)
7. [Database Problems](#database-problems)
8. [Network Issues](#network-issues)
9. [Browser Compatibility](#browser-compatibility)
10. [Debugging Tools](#debugging-tools)

---

## UI Issues

### Issue 1: Save Button Always Disabled

**Symptoms:**
- "Save Adjustments" button is grayed out
- Cannot click the button
- No changes detected even after moving sliders

**Possible Causes:**
1. No unsaved changes detected
2. Current values match saved values exactly
3. State comparison logic failing

**Solutions:**

1. **Verify you've made changes:**
   - Move at least one slider away from its current position
   - Check that the value actually changed (some sliders snap to steps)

2. **Check for state sync issues:**
   ```typescript
   // Open browser console and type:
   console.log('Current:', currentAdjustments);
   console.log('Saved:', savedAdjustments);
   console.log('Has changes:', hasUnsavedChanges);
   ```

3. **Force a change:**
   - Move a slider significantly (e.g., monthly contribution from 20k to 30k)
   - Check if button enables

4. **Refresh the page:**
   - Sometimes state gets out of sync
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

**Prevention:**
- Ensure state comparison uses deep equality (not reference equality)
- Add debug logging in development mode

---

### Issue 2: Sliders Not Moving Smoothly

**Symptoms:**
- Sliders are choppy or laggy
- Values jump instead of smooth movement
- Browser feels slow

**Possible Causes:**
1. Heavy calculations running on every slider change
2. Too many re-renders
3. Browser performance issues

**Solutions:**

1. **Check for calculation performance:**
   - Open browser DevTools → Performance tab
   - Record while moving slider
   - Look for long tasks (> 50ms)

2. **Verify debouncing is working:**
   ```typescript
   // Should see debounce in effect
   console.time('calculation');
   const result = calculateImpact(adjustments);
   console.timeEnd('calculation'); // Should be < 10ms
   ```

3. **Reduce calculation frequency:**
   - Increase debounce delay from 300ms to 500ms
   - Throttle slider updates instead of debouncing

4. **Check browser extensions:**
   - Disable extensions temporarily
   - Test in incognito mode

**Prevention:**
- Use `React.memo` for expensive components
- Memoize calculations with `useMemo`
- Throttle or debounce slider onChange handlers

---

### Issue 3: AI Markers Not Showing

**Symptoms:**
- No AI recommendation markers visible on sliders
- Can't see what the AI recommended

**Possible Causes:**
1. AI recommendations not loaded from session
2. Session data missing analysis_results
3. Rendering logic issue

**Solutions:**

1. **Check if AI recommendations exist:**
   ```typescript
   // In browser console:
   console.log('Session:', session);
   console.log('AI Recommendations:', session.analysisResults?.recommendations);
   ```

2. **Verify session has analysis_results:**
   - Go to Overview tab first (triggers AI analysis)
   - Wait for analysis to complete
   - Then go to Recommendations tab

3. **Check rendering condition:**
   ```typescript
   // In PlanAdjustmentsPanel.tsx
   {aiRecommendations.monthly_ra_contribution && (
     <span>AI: R {aiRecommendations.monthly_ra_contribution}</span>
   )}
   ```

4. **Refresh analysis:**
   - Start a new chat session
   - Let AI analyze your profile again

**Prevention:**
- Always run AI analysis before showing adjustments
- Add loading state while fetching AI recommendations
- Show placeholder if AI recommendations not available

---

### Issue 4: Impact Summary Shows "N/A" or Errors

**Symptoms:**
- Impact summary displays "N/A" instead of numbers
- Shows error messages
- Nest Egg or Drawdown deltas missing

**Possible Causes:**
1. Calculation function error
2. Missing required data
3. Invalid number format

**Solutions:**

1. **Check calculation function:**
   ```typescript
   // Test calculation manually
   import { calculateImpactDelta } from '@/lib/services/aiAdvisorCalculations';

   const result = calculateImpactDelta(
     currentAdjustments,
     aiRecommendations,
     userProfile
   );
   console.log('Impact:', result);
   ```

2. **Verify all required data:**
   - Ensure `currentAdjustments` has valid numbers
   - Check `aiRecommendations` is not empty
   - Confirm `userProfile` has retirement_age, current_age, etc.

3. **Check for NaN or Infinity:**
   ```typescript
   // Add validation in calculation
   if (isNaN(result) || !isFinite(result)) {
     console.error('Invalid calculation result:', result);
     return 0; // Default to 0
   }
   ```

4. **Add error boundaries:**
   ```typescript
   <ErrorBoundary fallback={<div>Calculation error</div>}>
     <ImpactSummary />
   </ErrorBoundary>
   ```

**Prevention:**
- Add input validation before calculations
- Use default values for missing data
- Implement error boundaries around calculation displays

---

## Save Operation Problems

### Issue 5: "Save Adjustments" Fails with No Error Message

**Symptoms:**
- Click "Save Adjustments"
- Nothing happens
- No success or error toast

**Possible Causes:**
1. Network request failing silently
2. Error handler not showing toast
3. JavaScript error breaking execution

**Solutions:**

1. **Check browser console for errors:**
   - Open DevTools → Console tab
   - Look for red error messages
   - Check for network errors (failed fetch)

2. **Verify API endpoint:**
   ```bash
   # Test endpoint directly
   curl -X PATCH http://localhost:3000/api/advisor/session \
     -H "Content-Type: application/json" \
     -d '{"sessionId":"your-session-id","adjustments":{"monthly_ra_contribution":25000}}'
   ```

3. **Add debug logging:**
   ```typescript
   const handleSave = async () => {
     console.log('Save started');
     try {
       console.log('Sending:', { sessionId, adjustments: currentAdjustments });
       const response = await patchSession(sessionId, currentAdjustments);
       console.log('Response:', response);
       toast.success('Saved!');
     } catch (error) {
       console.error('Save error:', error);
       toast.error('Failed to save');
     }
   };
   ```

4. **Check session ID:**
   - Ensure `sessionId` is valid UUID
   - Verify session exists in database

**Prevention:**
- Always wrap async operations in try-catch
- Log all errors to console
- Show user-friendly error messages

---

### Issue 6: Save Succeeds But Changes Lost After Refresh

**Symptoms:**
- "Save Adjustments" shows success toast
- Refresh page
- Sliders return to old values or AI recommendations

**Possible Causes:**
1. Database update not actually persisting
2. Database transaction rolled back
3. Cache serving old data
4. Reading from wrong field

**Solutions:**

1. **Verify database update:**
   ```sql
   -- Check if manual_adjustments exists
   SELECT
     id,
     user_profile->'manual_adjustments' AS adjustments,
     updated_at
   FROM ai_advisor_sessions
   WHERE id = 'your-session-id';
   ```

2. **Check API response:**
   ```typescript
   // In browser console after save:
   // The response should include your adjustments
   {
     "success": true,
     "data": {
       "adjustments": {
         "monthly_ra_contribution": 25000,
         // ... your saved values
       }
     }
   }
   ```

3. **Clear browser cache:**
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
   - Clear site data: DevTools → Application → Clear storage

4. **Check for JSONB merge issues:**
   ```typescript
   // In API route.ts
   const updatedProfile = {
     ...existingProfile,
     manual_adjustments: {
       ...existingProfile.manual_adjustments, // Merge, don't replace
       ...validatedData.adjustments,
       adjusted_at: new Date(),
       adjusted_by: 'user',
     },
   };
   ```

**Prevention:**
- Add database constraints to ensure updates persist
- Log database operations in API endpoint
- Add tests for persistence

---

### Issue 7: Concurrent Saves Corrupting Data

**Symptoms:**
- Multiple browser tabs open
- Saving in one tab affects the other
- Data seems inconsistent

**Possible Causes:**
1. No locking mechanism for concurrent updates
2. Race condition between tabs
3. Stale data in one tab

**Solutions:**

1. **Implement optimistic locking:**
   ```typescript
   // Add version field to session
   const updatedSession = await db
     .update(aiAdvisorSessions)
     .set({
       userProfile: updatedProfile,
       version: session.version + 1, // Increment version
       updatedAt: new Date(),
     })
     .where(
       and(
         eq(aiAdvisorSessions.id, sessionId),
         eq(aiAdvisorSessions.version, session.version) // Check version
       )
     );

   if (updatedSession.rowCount === 0) {
     throw new Error('Session was modified by another request');
   }
   ```

2. **Add last-write-wins warning:**
   - Show toast: "This session was updated in another tab"
   - Prompt user to reload page

3. **Use WebSockets for real-time sync:**
   - Subscribe to session updates
   - Automatically refresh when changes detected

**Prevention:**
- Implement version-based optimistic locking
- Add warnings for concurrent edits
- Consider using WebSockets for real-time sync

---

## Data Persistence Issues

### Issue 8: Manual Adjustments Not Loading on Page Load

**Symptoms:**
- Refresh page
- Sliders show AI recommendations instead of saved values
- Badge shows "Changes saved" but sliders don't reflect that

**Possible Causes:**
1. Session not loading manual_adjustments from database
2. Initial state not set correctly
3. React useEffect not running

**Solutions:**

1. **Check session data on load:**
   ```typescript
   // In PlanAdjustmentsPanel component
   useEffect(() => {
     console.log('Session loaded:', session);
     console.log('Manual adjustments:', session.userProfile.manual_adjustments);
   }, [session]);
   ```

2. **Verify initial state:**
   ```typescript
   // Should initialize with saved adjustments
   const [currentAdjustments, setCurrentAdjustments] = useState(
     session.userProfile.manual_adjustments || {}
   );
   ```

3. **Check for async loading:**
   ```typescript
   // If session loads asynchronously
   useEffect(() => {
     if (session?.userProfile?.manual_adjustments) {
       setCurrentAdjustments(session.userProfile.manual_adjustments);
       setSavedAdjustments(session.userProfile.manual_adjustments);
     }
   }, [session]);
   ```

4. **Inspect database:**
   ```sql
   SELECT user_profile FROM ai_advisor_sessions WHERE id = 'session-id';
   ```

**Prevention:**
- Load session data on page mount
- Set initial state after data loads
- Add loading state while fetching

---

### Issue 9: Old Adjustments Not Being Replaced

**Symptoms:**
- Save new adjustments
- Database still shows old values
- OR both old and new values present

**Possible Causes:**
1. JSONB merge not replacing fields
2. API not overwriting correctly
3. Multiple manual_adjustments objects

**Solutions:**

1. **Check merge logic:**
   ```typescript
   // Should merge correctly
   const updatedAdjustments = {
     ...existingAdjustments, // Old values
     ...newAdjustments,      // New values (override old)
     adjusted_at: new Date(),
   };
   ```

2. **Verify API request:**
   ```typescript
   // Send only the fields you want to change
   await patchSession(sessionId, {
     monthly_ra_contribution: 30000, // New value
     // Other fields not sent will keep old values
   });
   ```

3. **Full replacement if needed:**
   ```typescript
   // To completely replace adjustments:
   const updatedProfile = {
     ...existingProfile,
     manual_adjustments: {
       ...newAdjustments, // Only new adjustments
       adjusted_at: new Date(),
       adjusted_by: 'user',
     },
   };
   ```

**Prevention:**
- Test JSONB merge behavior
- Log before/after update values
- Add tests for partial updates

---

## Chatbot Integration Problems

### Issue 10: Chatbot Not Using Manual Adjustments

**Symptoms:**
- Save adjustments
- Ask chatbot a question
- AI response uses original values, not adjusted ones

**Possible Causes:**
1. System prompt not including manual_adjustments
2. Session not loading adjustments
3. Prompt building logic skipping adjustments

**Solutions:**

1. **Verify system prompt includes adjustments:**
   ```typescript
   // In openaiAdvisor.ts
   const systemPrompt = buildSystemPrompt(session);
   console.log('System prompt:', systemPrompt);
   // Should contain: "User has manually adjusted..."
   ```

2. **Check prompt building function:**
   ```typescript
   export function buildSystemPrompt(session: AIAdvisorSession): string {
     const adj = session.userProfile.manual_adjustments;

     if (!adj) {
       console.warn('No manual adjustments found');
       return basePrompt;
     }

     console.log('Including adjustments:', adj);
     // ... build prompt with adjustments
   }
   ```

3. **Test chatbot endpoint:**
   ```bash
   curl -X POST http://localhost:3000/api/advisor/chat \
     -H "Content-Type: application/json" \
     -d '{"sessionId":"your-id","message":"What is my monthly contribution?"}'
   ```

4. **Reload session in chat:**
   - Session might be cached
   - Force reload before building prompt
   ```typescript
   const session = await db
     .select()
     .from(aiAdvisorSessions)
     .where(eq(aiAdvisorSessions.id, sessionId))
     .limit(1);
   ```

**Prevention:**
- Always load fresh session data for each chat message
- Log system prompt in development mode
- Add tests for prompt building with adjustments

---

### Issue 11: Chatbot Responses Don't Acknowledge Custom Values

**Symptoms:**
- Chatbot uses adjusted values in calculations
- But doesn't mention they're custom/adjusted
- Confusing for user

**Possible Causes:**
1. System prompt doesn't emphasize adjustments
2. GPT-4o not following instructions
3. Prompt too long (adjustments buried)

**Solutions:**

1. **Strengthen prompt instructions:**
   ```typescript
   if (adj) {
     systemPrompt += `\n\n🚨 CRITICAL INSTRUCTION 🚨\n`;
     systemPrompt += `The user has MANUALLY ADJUSTED these parameters:\n`;
     systemPrompt += `- Monthly RA: R ${adj.monthly_ra_contribution}\n`;
     systemPrompt += `\nYOU MUST:\n`;
     systemPrompt += `1. Use these adjusted values in ALL calculations\n`;
     systemPrompt += `2. Acknowledge they are user-adjusted in your response\n`;
     systemPrompt += `3. Example: "Based on your adjusted contribution of R ${adj.monthly_ra_contribution}..."\n`;
   }
   ```

2. **Move adjustments to top of prompt:**
   - System prompt structure:
     1. Role definition
     2. **USER ADJUSTMENTS** (highlighted)
     3. User profile
     4. Guidelines

3. **Add to user message:**
   ```typescript
   const userMessage = `${message}\n\n(Note: I have adjusted some parameters)`;
   ```

**Prevention:**
- Place critical instructions early in prompt
- Use emphasis markers (🚨, bold, etc.)
- Test with various queries to ensure acknowledgment

---

## Validation Errors

### Issue 12: "Invalid request data" Error with Correct Values

**Symptoms:**
- Values are within valid ranges
- Still get 400 validation error
- Error details unclear

**Possible Causes:**
1. Type mismatch (string instead of number)
2. Extra fields not in schema
3. UUID format invalid

**Solutions:**

1. **Check data types:**
   ```typescript
   // Ensure numbers, not strings
   const adjustments = {
     monthly_ra_contribution: Number(value), // Not String(value)
   };
   ```

2. **Inspect validation error details:**
   ```typescript
   try {
     await patchSession(sessionId, adjustments);
   } catch (error) {
     if (error.status === 400 && error.details) {
       error.details.forEach((err) => {
         console.log('Field:', err.path.join('.'));
         console.log('Error:', err.message);
         console.log('Expected:', err.expected);
         console.log('Received:', err.received);
       });
     }
   }
   ```

3. **Test schema directly:**
   ```typescript
   import { PatchSessionRequestSchema } from '@/lib/validations/aiAdvisorValidation';

   const result = PatchSessionRequestSchema.safeParse({
     sessionId: 'your-session-id',
     adjustments: {
       monthly_ra_contribution: 25000,
     },
   });

   if (!result.success) {
     console.error('Validation errors:', result.error.issues);
   }
   ```

4. **Check UUID format:**
   ```typescript
   // Valid UUID v4 format
   const validUUID = '550e8400-e29b-41d4-a716-446655440000';

   // Invalid
   const invalidUUID = 'abc-123'; // Too short, wrong format
   ```

**Prevention:**
- Use TypeScript to catch type errors
- Validate on client-side before sending
- Log validation errors with details

---

### Issue 13: Range Validation Rejecting Valid Values

**Symptoms:**
- Value is 8.0 (valid)
- Error says "must be between 0 and 15"
- Seems like validation is wrong

**Possible Causes:**
1. Floating point precision issues
2. Validation comparing strings
3. Min/max logic inverted

**Solutions:**

1. **Check value type:**
   ```typescript
   console.log('Value:', value, 'Type:', typeof value);
   // Should be: Value: 8.5 Type: number
   // Not: Value: "8.5" Type: string
   ```

2. **Round to prevent floating point issues:**
   ```typescript
   const roundedValue = Math.round(value * 100) / 100; // 2 decimal places
   ```

3. **Test validation schema:**
   ```typescript
   const schema = z.number().min(0).max(15);

   console.log(schema.safeParse(8.5));  // Should pass
   console.log(schema.safeParse('8.5')); // Should fail (string)
   console.log(schema.safeParse(20));   // Should fail (> 15)
   ```

**Prevention:**
- Always parse strings to numbers: `Number(value)`
- Use client-side validation to catch issues early
- Add range indicators on sliders

---

## Performance Issues

### Issue 14: Slow Save Operations (> 1 second)

**Symptoms:**
- Click "Save Adjustments"
- Long wait before success toast
- Button stays disabled for > 1 second

**Possible Causes:**
1. Slow database query
2. Network latency
3. Large payload
4. Database not indexed

**Solutions:**

1. **Measure API response time:**
   ```typescript
   console.time('save');
   await patchSession(sessionId, adjustments);
   console.timeEnd('save'); // Should be < 500ms
   ```

2. **Check database query performance:**
   ```sql
   EXPLAIN ANALYZE
   UPDATE ai_advisor_sessions
   SET user_profile = jsonb_set(user_profile, '{manual_adjustments}', '{}')
   WHERE id = 'session-id';
   ```

3. **Add database indexes:**
   ```sql
   CREATE INDEX IF NOT EXISTS idx_sessions_id ON ai_advisor_sessions(id);
   CREATE INDEX IF NOT EXISTS idx_sessions_user_profile ON ai_advisor_sessions USING GIN (user_profile);
   ```

4. **Optimize payload:**
   - Only send changed fields
   - Don't send entire session
   ```typescript
   // Good: Only send adjustments
   { sessionId, adjustments: { monthly_ra_contribution: 25000 } }

   // Bad: Send entire session
   { session: { ...allFields } }
   ```

**Prevention:**
- Monitor API response times
- Optimize database queries
- Add proper indexes
- Use connection pooling

---

### Issue 15: High Memory Usage in Browser

**Symptoms:**
- Browser tab uses excessive RAM
- Page becomes unresponsive
- Sliders lag significantly

**Possible Causes:**
1. Memory leak in React component
2. Too many re-renders
3. Large objects in state
4. Event listeners not cleaned up

**Solutions:**

1. **Check for memory leaks:**
   - Open DevTools → Memory tab
   - Take heap snapshot
   - Move sliders extensively
   - Take another snapshot
   - Compare: should not grow significantly

2. **Clean up event listeners:**
   ```typescript
   useEffect(() => {
     const handleBeforeUnload = () => {
       // Save draft
     };

     window.addEventListener('beforeunload', handleBeforeUnload);

     return () => {
       window.removeEventListener('beforeunload', handleBeforeUnload);
     };
   }, []);
   ```

3. **Memoize expensive objects:**
   ```typescript
   const memoizedAdjustments = useMemo(
     () => currentAdjustments,
     [currentAdjustments]
   );
   ```

4. **Reduce state size:**
   - Don't store entire session in component state
   - Only store necessary fields

**Prevention:**
- Profile memory usage during development
- Clean up effects properly
- Avoid storing large objects in state
- Use React DevTools Profiler

---

## Database Problems

### Issue 16: "Session not found" Error

**Symptoms:**
- API returns 404 error
- Message: "Session not found"
- Session ID looks correct

**Possible Causes:**
1. Session deleted or expired
2. Wrong session ID
3. Database connection issue
4. Session in different database (dev vs prod)

**Solutions:**

1. **Verify session exists:**
   ```sql
   SELECT id, created_at FROM ai_advisor_sessions WHERE id = 'your-session-id';
   ```

2. **Check session ID format:**
   - Must be valid UUID v4
   - No extra whitespace
   - Correct case (UUID is case-insensitive but check anyway)

3. **Check database connection:**
   ```typescript
   // In API route
   try {
     await db.select().from(aiAdvisorSessions).limit(1);
     console.log('Database connected');
   } catch (error) {
     console.error('Database error:', error);
   }
   ```

4. **Verify environment:**
   - Development: Using local database?
   - Production: Using correct POSTGRES_URL?

**Prevention:**
- Add session expiry handling
- Validate session existence before operations
- Show user-friendly message when session not found

---

### Issue 17: JSONB Update Not Working

**Symptoms:**
- API returns success
- But database shows old values
- OR manual_adjustments field is null

**Possible Causes:**
1. JSONB merge not working correctly
2. Transaction rolled back
3. Wrong column being updated
4. PostgreSQL version compatibility

**Solutions:**

1. **Test JSONB update directly:**
   ```sql
   UPDATE ai_advisor_sessions
   SET user_profile = jsonb_set(
     user_profile,
     '{manual_adjustments}',
     '{"monthly_ra_contribution": 25000}'::jsonb
   )
   WHERE id = 'session-id'
   RETURNING user_profile;
   ```

2. **Check Drizzle ORM update:**
   ```typescript
   const result = await db
     .update(aiAdvisorSessions)
     .set({
       userProfile: {
         ...existingProfile,
         manual_adjustments: updatedAdjustments,
       },
       updatedAt: new Date(),
     })
     .where(eq(aiAdvisorSessions.id, sessionId))
     .returning();

   console.log('Update result:', result);
   ```

3. **Verify PostgreSQL version:**
   ```sql
   SELECT version();
   -- Should be PostgreSQL 12+
   ```

**Prevention:**
- Test JSONB operations in isolation
- Log update results
- Add database tests

---

## Network Issues

### Issue 18: "Failed to fetch" Error

**Symptoms:**
- Network error in console
- "Failed to fetch" message
- Request doesn't reach server

**Possible Causes:**
1. Server not running
2. Wrong API endpoint URL
3. CORS issue
4. Network firewall/proxy

**Solutions:**

1. **Check server is running:**
   ```bash
   # Should see:
   # > next dev
   # ✓ Ready on http://localhost:3000
   npm run dev
   ```

2. **Verify API endpoint:**
   ```typescript
   // Should be relative URL
   const url = '/api/advisor/session'; // ✓ Correct

   // Not absolute (unless different domain)
   const url = 'http://localhost:3000/api/advisor/session'; // Only if needed
   ```

3. **Test endpoint directly:**
   ```bash
   curl http://localhost:3000/api/advisor/session
   # Should get response (even if error, not connection refused)
   ```

4. **Check browser network tab:**
   - Open DevTools → Network tab
   - Look for request
   - Check status code, response

**Prevention:**
- Use environment variables for API URLs
- Add network error handling
- Show offline indicator

---

## Browser Compatibility

### Issue 19: Feature Not Working in Safari

**Symptoms:**
- Works fine in Chrome
- Broken in Safari
- Specific errors or silent failures

**Possible Causes:**
1. ES6+ feature not supported
2. CSS not compatible
3. Fetch API differences
4. Date handling differences

**Solutions:**

1. **Check browser console in Safari:**
   - Safari → Develop → Show Web Inspector
   - Check for JavaScript errors

2. **Test specific features:**
   - `fetch()` API: Should work in modern Safari
   - `Intl.NumberFormat`: Should work
   - `Date` parsing: May differ

3. **Add polyfills if needed:**
   ```bash
   npm install core-js
   ```

   ```typescript
   // In _app.tsx or layout.tsx
   import 'core-js/stable';
   import 'regenerator-runtime/runtime';
   ```

4. **Check CSS compatibility:**
   - Use autoprefixer
   - Test CSS Grid, Flexbox
   - Avoid cutting-edge CSS features

**Prevention:**
- Test in multiple browsers during development
- Use Next.js (handles transpiling automatically)
- Add browser compatibility testing to CI

---

## Debugging Tools

### Tool 1: Browser DevTools

**Console:**
```javascript
// Check current state
window.sessionData = session;
console.log(window.sessionData);

// Test API call
fetch('/api/advisor/session', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 'your-id',
    adjustments: { monthly_ra_contribution: 25000 }
  })
}).then(r => r.json()).then(console.log);
```

**Network Tab:**
- Filter by "Fetch/XHR"
- Look for PATCH requests to `/api/advisor/session`
- Check request payload and response
- Verify status code (200 = success, 400 = validation, 404 = not found, 500 = server error)

**React DevTools:**
- Install React DevTools extension
- Inspect component state
- Check props passed to PlanAdjustmentsPanel
- Verify state updates

### Tool 2: Database Queries

```sql
-- Check session exists
SELECT id, created_at, updated_at
FROM ai_advisor_sessions
WHERE id = 'session-id';

-- Check manual_adjustments
SELECT
  id,
  user_profile->'manual_adjustments' AS adjustments,
  user_profile->'manual_adjustments'->>'adjusted_at' AS adjusted_at
FROM ai_advisor_sessions
WHERE id = 'session-id';

-- Find all sessions with adjustments
SELECT COUNT(*)
FROM ai_advisor_sessions
WHERE user_profile->'manual_adjustments' IS NOT NULL;

-- Check for recently updated sessions
SELECT id, updated_at
FROM ai_advisor_sessions
ORDER BY updated_at DESC
LIMIT 10;
```

### Tool 3: API Testing with cURL

```bash
# Test PATCH endpoint
curl -X PATCH http://localhost:3000/api/advisor/session \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "adjustments": {
      "monthly_ra_contribution": 25000,
      "investment_return": 8.5,
      "inflation_rate": 5.5
    }
  }' | jq .

# Test with invalid data (should get 400)
curl -X PATCH http://localhost:3000/api/advisor/session \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "invalid-uuid",
    "adjustments": {
      "investment_return": 100
    }
  }' | jq .
```

### Tool 4: Logging Strategy

```typescript
// Add comprehensive logging

// In component
useEffect(() => {
  console.group('PlanAdjustmentsPanel State');
  console.log('Current Adjustments:', currentAdjustments);
  console.log('Saved Adjustments:', savedAdjustments);
  console.log('AI Recommendations:', aiRecommendations);
  console.log('Has Unsaved Changes:', hasUnsavedChanges);
  console.groupEnd();
}, [currentAdjustments, savedAdjustments, aiRecommendations, hasUnsavedChanges]);

// In API route
export async function PATCH(request: Request) {
  console.time('PATCH /api/advisor/session');

  try {
    const body = await request.json();
    console.log('Request body:', body);

    // ... validation, database operations

    console.timeEnd('PATCH /api/advisor/session');
    return NextResponse.json(result);
  } catch (error) {
    console.error('PATCH error:', error);
    console.timeEnd('PATCH /api/advisor/session');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

## Quick Diagnostic Checklist

When troubleshooting, work through this checklist:

- [ ] **Browser Console:** Any errors? (Red messages)
- [ ] **Network Tab:** Is request reaching server? Status code?
- [ ] **Session Exists:** Can you find session in database?
- [ ] **Manual Adjustments:** Is field populated in database?
- [ ] **API Response:** What does `/api/advisor/session` return?
- [ ] **State Sync:** Do current and saved adjustments match expectations?
- [ ] **Validation:** Are values within allowed ranges?
- [ ] **Chatbot Prompt:** Does system prompt include adjustments?
- [ ] **Server Running:** Is `npm run dev` active?
- [ ] **Database Connected:** Can you query the database?

## Getting Help

If you've tried everything and still can't resolve the issue:

1. **Gather Information:**
   - Browser and version
   - Error messages (console)
   - Network request/response
   - Database query results
   - Steps to reproduce

2. **Check Documentation:**
   - [API Reference](/docs/API-ADVISOR-SESSION.md)
   - [Developer Guide](/docs/DEVELOPER-GUIDE-PHASE-3.md)
   - [Architecture Diagram](/docs/PHASE-3-ARCHITECTURE.md)

3. **Search Existing Issues:**
   - GitHub issues
   - Internal documentation
   - Team chat history

4. **Create a Minimal Reproduction:**
   - Simplify to smallest possible case
   - Remove unrelated code
   - Share code snippet

5. **Contact Support:**
   - Open GitHub issue with details
   - Contact development team
   - Provide all gathered information

---

**Last Updated:** 2025-10-14
**Version:** 1.0
**Phase:** Phase 3 - Bidirectional Sync
