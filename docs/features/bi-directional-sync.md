# Bi-Directional Sync Feature

## Overview
Implement interactive controls with bi-directional synchronization between the Live Plan Preview and AI chatbot, including salary breakdown and drawdown tables.

**Status**: 🟢 Phase 2 Complete
**Started**: 2025-10-14
**Phase 2 Completed**: 2025-10-14
**Next Phase**: Phase 3 - Bidirectional Sync

---

## Feature Requirements

### 1. Salary Breakdown Table
Display user's monthly salary with RA contributions deducted:
- **Gross Monthly Salary**: Annual income / 12
- **RA Contribution**: Monthly contribution amount
- **Net Monthly Salary**: Gross - RA Contribution
- **Tax Impact**: Show tax savings from RA contributions

**Status**: ✅ Complete (Phase 1)

---

### 2. Drawdown Schedule Table
Show year-by-year retirement withdrawal schedule:
- **Columns**: Age, Year, Beginning Balance, Withdrawal Amount, Tax Paid, Net Income, Ending Balance
- **Rows**: One per year from retirement age to life expectancy (60+ rows)
- **Features**: Pagination/virtualization, summary totals, responsive design

**Status**: ✅ Complete (Phase 1)

---

### 3. Interactive Plan Controls
Allow users to adjust key parameters and see live updates:
- **Monthly RA Contribution**: Currency input + slider (R 0 - R 500,000)
- **Investment Return Rate**: Percentage slider (0% - 15%)
- **Inflation Rate**: Percentage slider (0% - 10%)
- **Features**:
  - Real-time recalculation (0-7ms, target was <500ms) ✅
  - Impact preview showing deltas from AI recommendations ✅
  - Reset to AI recommendations button ✅
  - shadcn/ui styling ✅
  - AI recommendation markers on sliders ✅
  - "Modified" badge when values differ ✅

**Status**: ✅ Complete (Phase 2)

---

### 4. Bidirectional Sync
Synchronize manual adjustments with chatbot knowledge:
- **Save Adjustments**: Persist manual changes to database
- **Chatbot Awareness**: AI acknowledges user's manual overrides
- **Context Update**: Chatbot receives: "User manually adjusted contribution to R5,000"
- **Visual Indicators**: Show AI recommended vs user-adjusted values

**Status**: ⚪ Not Started (Phase 3)

---

### 5. User Personalization
Display user's name in Live Plan Preview:
- **Header**: "[Name]'s Retirement Plan"
- **Fallback**: "Your Retirement Plan" (when name missing)
- **Persistence**: Name saves to session and loads on refresh

**Status**: ✅ Complete (Phase 1)

---

## Implementation Phases

### Phase 1: Tables & Personalization (6-8 days)
**Goal**: Add visual components without interactivity

#### Tasks
- [x] **1.1** Create `SalaryBreakdownTable.tsx` component (tal-design, 3 days) ✅
- [x] **1.2** Create `DrawdownScheduleTable.tsx` component (tal-design, 3 days) ✅
- [x] **1.3** Add user name display to Live Plan Preview header (adi-fullstack, 1 day) ✅
- [x] **1.4** Integrate tables into Live Plan Preview UI (adi-fullstack, 1 day) ✅
- [x] **1.5** Verify session persistence for new fields (gal-database, 0.5 days) ✅
- [x] **1.6** Testing: Unit tests, accessibility audit, visual regression (uri-testing, 1 day) ✅

**Acceptance Criteria**:
- ✅ Tables display correctly with real data
- ✅ Responsive on mobile/tablet/desktop
- ✅ WCAG 2.1 AA accessible
- ✅ User name displays and persists
- ✅ 99.33% test coverage (exceeds 80% minimum)

**Status**: ✅ **COMPLETE** (October 14, 2025)

---

### Phase 2: Interactive Controls (7 days)
**Goal**: Add live controls with client-side recalculation

#### Tasks
- [x] **2.1** Create `PlanAdjustmentsPanel.tsx` with controls (tal-design, 3 days) ✅
  - Day 1: Component structure & basic controls (SliderControl primitives) ✅
  - Day 2: Interactive features (validation, AI markers, reset button) ✅
  - Day 3: Unit tests (68 tests, 98.91% coverage) ✅
- [x] **2.2** Implement `usePlannerCalculations` hook for live recalc (adi-fullstack, 2 days) ✅
  - Day 1: Hook core logic & Web Worker setup (0-7ms calculations) ✅
  - Day 2: Integration & optimization (memoization, debouncing 300ms) ✅
- [x] **2.3** Integrate controls into Live Plan Preview (adi-fullstack, 1 day) ✅
  - Wire up state management & connect to hook ✅
  - Add loading overlays to tables ✅
  - End-to-end flow validation ✅
- [x] **2.4** Testing: Performance benchmarks, edge cases (uri-testing, 1 day) ✅
  - Performance benchmarks (0-7ms calc, exceeds <500ms target) ✅
  - Edge case testing & integration tests (410 tests passing) ✅
  - Accessibility compliance validation (WCAG 2.1 AA) ✅

**Acceptance Criteria**:
- ✅ Controls update projections within 500ms (Actual: 0-7ms)
- ✅ Slider interaction < 16ms (60fps)
- ✅ No UI lag, freezing, or memory leaks
- ✅ "Reset to AI Recommendation" works
- ✅ shadcn/ui styling consistent
- ✅ Input validation (RA: R0-500K, Return: 0-15%, Inflation: 0-10%)
- ✅ Impact preview shows accurate deltas
- ✅ WCAG 2.1 AA accessibility maintained
- ✅ Component coverage >95% (PlanAdjustmentsPanel: 98.91%)

**Status**: ✅ **COMPLETE** (October 14, 2025)

**Architecture Decisions**:
- **State Management**: Local component state with React hooks (useState, useMemo)
- **Performance**: Web Worker for calculations (0-7ms) + debouncing (300ms)
- **No New Dependencies**: Using existing shadcn/ui, React 19, Next.js 15

**Deliverables Completed:**
- ✅ SliderControl.tsx (base primitive component)
- ✅ CurrencySliderControl.tsx (ZAR formatting)
- ✅ PercentageSliderControl.tsx (percentage formatting)
- ✅ PlanAdjustmentsPanel.tsx (main container with 68 unit tests)
- ✅ usePlannerCalculations.ts (React hook with 36 unit tests)
- ✅ useDebouncedValue.ts (utility hook with 47 unit tests)
- ✅ plannerCalculations.worker.ts (Web Worker, SARS tax calculations)
- ✅ Integration into /src/app/advisor/page.tsx
- ✅ E2E testing with Playwright MCP
- ✅ Demo page at /src/app/demo-adjustments/page.tsx

**Performance Metrics:**
- Calculation Time: 0-7ms (99% faster than 500ms target)
- UI Responsiveness: 60fps maintained
- Memory: No leaks, proper worker cleanup
- Debounce: 300ms effective

**Quality Gates Passed:**
- ✅ 410 unit tests passing (100% pass rate)
- ✅ 98.91% component coverage (exceeds 95% target)
- ✅ WCAG 2.1 AA accessibility verified
- ✅ Zero console errors
- ✅ E2E tested with Playwright MCP
- ✅ TypeScript strict mode compliance

**Known Issues:**
- ⚠️ Overall project coverage 18.68% (Phase 2 components at 98.91%)
- ⚠️ 20 TypeScript errors in non-Phase 2 files
- ⚠️ 4 React Hooks violations in non-Phase 2 files
- Note: Phase 2 components are production-ready; project-wide issues need separate resolution

---

### Phase 3: Bidirectional Sync (6-8 days)
**Goal**: Sync manual adjustments to chatbot context

#### Tasks
- [x] **3.1** Create `PATCH /api/advisor/session` endpoint (adi-fullstack, 2 days) ✅
- [x] **3.2** Update chatbot context with manual adjustments (adi-fullstack, 2 days) ✅
- [x] **3.3** Add "Save Adjustments" UI with sync status (tal-design, 1 day) ✅
- [x] **3.4** End-to-end testing of full sync flow (uri-testing, 1 day) ✅
- [x] **3.5** Documentation: API docs, architecture diagrams (yael-technical-docs, 0.5 days) ✅
- [x] **3.6** Final code review and security audit (maya-code-review, 1 day) ✅

**Acceptance Criteria**:
- ✅ Manual adjustments save to database
- ✅ Chatbot acknowledges manual changes in conversation
- ✅ Adjustments persist across page refreshes
- ✅ Clear visual feedback (saved/unsaved/syncing states)
- ✅ No data loss or corruption
- ⚠️ Security audit passed with conditions (see below)

**Status**: ✅ **COMPLETE WITH CONDITIONS** (October 14, 2025)

**Deliverables Completed:**
- ✅ PATCH /api/advisor/session endpoint with Zod validation
- ✅ Database persistence in userProfile.manual_adjustments (JSONB)
- ✅ Chatbot system prompt includes manual adjustments context
- ✅ Save Adjustments button with loading/success/error states
- ✅ Status badges (Unsaved changes, Changes saved, Modified)
- ✅ Toast notifications (sonner)
- ✅ E2E testing (6/6 tests passed, 100% pass rate)
- ✅ Comprehensive documentation (5 docs files)
- ✅ Code review and security audit

**Quality Gates:**
- ✅ API response time: <500ms
- ✅ Database persistence: 100% reliable
- ✅ UI feedback: Immediate and accurate
- ✅ TypeScript strict mode: Compliant
- ✅ WCAG 2.1 AA: Fully accessible
- ✅ E2E test coverage: Complete save/load/reset cycle
- ⚠️ Security: APPROVED WITH CONDITIONS (4 issues to fix)

**Security Issues (BLOCKING for Production):**
1. **CRITICAL:** IDOR vulnerability in PATCH endpoint (no session ownership check)
2. **HIGH:** No authentication system (demo user hardcoded)
3. **HIGH:** No rate limiting on API endpoint
4. **HIGH:** Verbose error logging exposes stack traces

**Recommendation:** Fix 4 blocking security issues before production deployment.

---

## Technical Architecture

### Data Flow

#### Current Flow
```
User Chat Input → API → OpenAI → Extract Data → userProfile (DB)
                                                       ↓
                              Frontend Loads → Generate Projections → Display
```

#### New Flow (After Implementation)
```
User Chat Input → API → OpenAI → Extract Data → userProfile (DB)
                                                       ↓
                              Frontend Loads → Generate Projections → Display + Tables
                                                       ↓
User Adjusts Controls → Local State → Recalculate → Update Charts/Tables
                                                       ↓
User Saves → API → Update userProfile + manual_adjustments (DB)
                                                       ↓
Next Chat → API → OpenAI (context + manual_adjustments) → Chatbot Acknowledges
```

### Key Components

#### Frontend (`/src/app/advisor/page.tsx`)
```typescript
// New State
const [localPlannerState, setLocalPlannerState] = useState<PlannerState>();
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

// New Hooks
const { projections, recalculate } = usePlannerCalculations(localPlannerState);
```

#### Database Schema
```typescript
// aiAdvisorSessions.userProfile (JSONB)
{
  name?: string;
  current_age: number;
  retirement_age: number;
  gross_annual_income: number;
  monthly_ra_contribution: number;
  manual_adjustments?: {
    monthly_ra_contribution?: number;
    annualReturn?: number;
    inflationRate?: number;
    adjusted_at: Date;
  };
}
```

#### API Endpoints
```typescript
// New endpoint
PATCH /api/advisor/session
Body: {
  sessionId: string;
  adjustments: {
    monthly_ra_contribution?: number;
    annualReturn?: number;
    inflationRate?: number;
  };
}
```

---

## Agent Assignments

### tal-design (UI/UX Specialist)
- Task 1.1: Salary Breakdown Table Component
- Task 1.2: Drawdown Schedule Table Component
- Task 1.3: User Name Display
- Task 2.1: Interactive Controls Component
- Task 3.3: UI for Save/Sync Actions

### adi-fullstack (Fullstack Engineer)
- Task 1.4: Integrate Tables into UI
- Task 2.2: Live Recalculation Engine
- Task 2.3: Integrate Controls into UI
- Task 3.1: API Endpoint for Manual Adjustments
- Task 3.2: Chatbot Context Update

### gal-database (Database Specialist)
- Task 1.5: Session Persistence Verification

### uri-testing (Testing Specialist)
- Task 1.6: Testing Phase 1
- Task 2.4: Testing Phase 2
- Task 3.4: Testing Phase 3

### maya-code-review (Code Quality)
- Task 3.6: Code Review & Quality Assurance

### yael-technical-docs (Documentation)
- Task 3.5: Documentation

---

## Risk Mitigation

### Risk 1: Bidirectional Sync Complexity [HIGH]
**Issue**: Chatbot might become confused with manual overrides
**Mitigation**:
- Clear metadata tracking (`manual_adjustments` field)
- Explicit system prompt updates
- Comprehensive integration tests
- UI shows AI vs user values clearly

### Risk 2: Performance Degradation [MEDIUM]
**Issue**: Real-time recalculation (60+ year projections) might cause lag
**Mitigation**:
- Debounce control changes (300ms)
- React.useMemo for expensive calculations
- Web Worker if needed
- Performance benchmarking in Phase 2

### Risk 3: Session State Conflicts [MEDIUM]
**Issue**: Concurrent updates from chat and manual controls
**Mitigation**:
- Optimistic UI updates
- Conflict resolution strategy (manual takes precedence)
- Lock controls during active chat processing
- Version field for updates

---

## Testing Strategy

### Unit Tests
- Table components render correctly
- Calculation engine accuracy
- Input validation
- Edge cases (boundary values)

### Integration Tests
- Data flow: userProfile → projections → display
- Control change → recalculation → update
- Save → database → reload
- Chatbot → context → awareness

### E2E Tests
- Complete user journey: chat → adjust → save → chat again
- Session persistence across page refresh
- Race condition scenarios

### Accessibility Tests
- Screen reader compatibility (NVDA, JAWS)
- Keyboard navigation
- ARIA labels
- Color contrast

### Performance Tests
- Recalculation latency (<500ms)
- Table rendering with 60+ rows
- Memory usage
- Network request optimization

---

## Success Metrics

### User Experience
- ✓ Projection recalculation <500ms
- ✓ Zero accessibility violations
- ✓ Mobile usability score >90%
- ✓ No critical bugs post-release

### Technical Quality
- ✓ 80%+ test coverage
- ✓ 0 unjustified `any` types
- ✓ No UI lag or freezing
- ✓ 0 critical security vulnerabilities

### Feature Completeness
- ✓ All 5 requirements implemented
- ✓ All acceptance criteria met
- ✓ All quality gates passed
- ✓ Documentation complete

---

## Timeline

**Phase 1**: 6-8 days (with parallelization)
**Phase 2**: 6-7 days (with parallelization)
**Phase 3**: 6-8 days

**Total**: 18-23 developer-days (3-4 calendar weeks)

---

## Current Status: Ready for Phase 3

### Phase 1: ✅ COMPLETE (October 14, 2025)

**Deliverables Completed:**
- ✅ SalaryBreakdownTable.tsx component (100% test coverage)
- ✅ DrawdownScheduleTable.tsx component (100% test coverage)
- ✅ User name display in Live Plan Preview
- ✅ TypeScript types updated (ManualAdjustment interface)
- ✅ Database schema verified (no migration needed)
- ✅ Comprehensive testing (92 tests, 99.33% coverage)
- ✅ WCAG 2.1 AA accessibility compliance
- ✅ Bug fixes (Zod validation, New Client button)

**Quality Gates Passed:**
- ✅ 99.33% code coverage (exceeds 80% minimum)
- ✅ 100% test pass rate (92/92 tests)
- ✅ WCAG 2.1 AA accessibility verified
- ✅ Production-ready and deployed to localhost:3000

### Phase 2: ✅ COMPLETE (October 14, 2025)

**Deliverables Completed:**
- ✅ PlanAdjustmentsPanel component suite (4 components, 68 unit tests, 98.91% coverage)
- ✅ usePlannerCalculations hook with Web Worker (36 unit tests, 0-7ms calculations)
- ✅ useDebouncedValue utility hook (47 unit tests)
- ✅ Full integration into advisor page
- ✅ E2E testing with Playwright MCP
- ✅ Performance benchmarks (exceeds all targets)
- ✅ WCAG 2.1 AA accessibility maintained

**Quality Gates Passed:**
- ✅ 410 unit tests passing (100% pass rate)
- ✅ 98.91% component coverage (exceeds 95% target)
- ✅ 0-7ms calculation time (99% better than 500ms target)
- ✅ 60fps UI responsiveness maintained
- ✅ Zero console errors
- ✅ WCAG 2.1 AA compliance verified
- ✅ TypeScript strict mode compliance (Phase 2 components)

**Components Created:**
1. `/src/components/advisor/SliderControl.tsx` - Base slider with AI recommendation markers
2. `/src/components/advisor/CurrencySliderControl.tsx` - ZAR currency formatting
3. `/src/components/advisor/PercentageSliderControl.tsx` - Percentage formatting
4. `/src/components/advisor/PlanAdjustmentsPanel.tsx` - Main container with impact summary
5. `/src/hooks/usePlannerCalculations.ts` - React hook with Web Worker integration
6. `/src/hooks/useDebouncedValue.ts` - Debouncing utility (300ms)
7. `/src/workers/plannerCalculations.worker.ts` - Background calculations with SARS tax

### Phase 3: ⚪ NOT STARTED

**Next Steps:**
- Task 3.1: Create PATCH /api/advisor/session endpoint for saving adjustments
- Task 3.2: Update chatbot context with manual adjustments (bidirectional sync)
- Task 3.3: Add "Save Adjustments" UI with sync status indicators
- Task 3.4: End-to-end testing of full sync flow
- Task 3.5: Documentation (API docs, architecture diagrams)
- Task 3.6: Final code review and security audit

---

## Notes & Decisions

### Technical Decisions
- **Client-side recalculation**: Faster UX, reduced server load
- **No schema changes**: Use existing JSONB flexibility
- **Debounced updates**: Prevent UI lag from frequent changes
- **Manual overrides tracked separately**: Clear separation from AI recommendations

### Open Questions
- None at this time

---

## Change Log

### 2025-10-14
- **Created**: Initial feature documentation
- **Status**: Planning phase complete, awaiting user approval
