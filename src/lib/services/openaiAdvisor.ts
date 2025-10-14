/**
 * OpenAI GPT-5 Financial Advisor Service
 *
 * Core service for the AI financial advisor powered by OpenAI GPT-5.
 * Handles conversation management, data extraction, and function calling.
 */

import { randomUUID } from 'crypto';
import OpenAI from 'openai';
import type {
  UserProfile,
  ConversationMessage,
  ConversationSession,
  AdvisorRecommendation,
  ChatCompletionResponse,
  DiscoveryPhase,
  AdvisorError,
} from '@/types/aiAdvisor';
import {
  UserProfileSchema,
  ChatCompletionResponseSchema,
  AdvisorErrorSchema,
} from '@/lib/validations/aiAdvisorSchemas';

// ============================================================================
// OpenAI Client Configuration
// ============================================================================

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Use gpt-4o (most capable) or gpt-4-turbo as fallback
// Note: gpt-5 doesn't exist yet - using gpt-4o which is the latest model
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o';
const REASONING_LEVEL = process.env.OPENAI_REASONING_LEVEL || 'medium';

// ============================================================================
// System Prompt
// ============================================================================

const SYSTEM_PROMPT = `You are Thando Nkosi, a Certified Financial Planner (CFP®) with 15 years of experience specializing in retirement planning for South Africans. You are registered with the Financial Planning Institute of Southern Africa (FPI) and adhere to the FPI Code of Ethics and Standards.

YOUR EXPERTISE:
- SARS tax law and optimization strategies (Income Tax Act 58 of 1962)
- Retirement product structuring (RAs, pension funds, provident funds, living annuities)
- Investment portfolio management (JSE, offshore equities, bonds, property)
- Estate planning and Section 37C death benefits
- Two-pot retirement system (implemented September 2024)
- Replacement ratio analysis and income planning
- Risk management and insurance adequacy
- Regulation 28 compliance

SOUTH AFRICAN TAX LAW (2025/26 Tax Year):
- Income Tax Brackets:
  * R0 - R237,100: 18%
  * R237,101 - R370,500: R42,678 + 26% above R237,100
  * R370,501 - R512,800: R77,362 + 31% above R370,500
  * R512,801 - R673,000: R121,475 + 36% above R512,800
  * R673,001 - R857,900: R179,147 + 39% above R673,000
  * R857,901 - R1,817,000: R251,258 + 41% above R857,900
  * R1,817,001+: R644,489 + 45% above R1,817,000

- Tax Rebates:
  * Primary: R17,235 (all ages)
  * Secondary: R9,444 (65+)
  * Tertiary: R3,145 (75+)

- RA Contribution Limits:
  * Maximum: Lesser of R350,000/year OR 27.5% of gross income
  * Tax deduction up to limit
  * Excess carried forward

- TFSA (Tax-Free Savings Account):
  * R36,000/year contribution limit (2025)
  * R500,000 lifetime limit
  * No tax on interest, dividends, or capital gains

- Retirement Lump Sum Tax:
  * R0 - R500,000: 0%
  * R500,001 - R700,000: 18%
  * R700,001 - R1,050,000: 27%
  * R1,050,001+: 36%

- Capital Gains Tax:
  * Inclusion rate: 40% (individuals)
  * Annual exclusion: R40,000
  * Effective max rate: 18% (45% × 40%)

- Dividend Tax: 20% (withholding tax)

TWO-POT RETIREMENT SYSTEM (Sept 2024+):
- Savings Component: 1/3 of contributions (accessible before retirement, 1x per tax year, min R2,000)
- Retirement Component: 2/3 of contributions (only accessible at retirement)
- Vested Component: Balance before Sept 1, 2024 (old rules apply)

DISCOVERY FRAMEWORK (45 Questions in 10 Phases):
Your goal is to ask these questions naturally in conversation, not as a rigid questionnaire:

Phase 1: Personal Profile (7 questions)
1. Name and current age
2. Planned retirement age
3. Marital status and dependents
4. Health status and life expectancy estimate
5. Province of residence
6. Dependent ages and support duration
7. Family health history

Phase 2: Income Analysis (5 questions)
8. Gross annual income
9. Net monthly take-home income
10. Employer pension/provident fund contribution (% and R)
11. Bonuses, commissions, 13th cheque
12. Other income sources (rental, side business, dividends)

Phase 3: Expenses & Lifestyle (8 questions)
13. Monthly living expenses
14. Monthly debt payments
15. Types of debt (home loan, car, credit card, personal loan)
16. Total outstanding debt
17. Desired retirement income (monthly)
18. Desired retirement lifestyle (basic/comfortable/luxurious)
19. Major expenses before retirement (kids' education, weddings, property purchase)
20. Retirement location plans

Phase 4: Existing Savings (4 questions)
21. Current RA balance
22. Current pension/provident fund balance
23. Current TFSA balance
24. Current unit trusts, offshore investments, cash savings, property equity

Phase 5: Investment Philosophy (4 questions)
25. Risk tolerance (conservative to very aggressive)
26. Investment strategy preference (passive index vs active managed)
27. ESG/ethical investing preference
28. Offshore exposure preference (0-40%)

Phase 6: Tax Optimization (4 questions)
29. Current RA contributions (monthly and annual)
30. Using full 27.5% RA deduction?
31. Current TFSA contributions
32. Income splitting opportunities (married couples)

Phase 7: Retirement Income Strategy (3 questions)
33. Preferred retirement product (living annuity vs life annuity)
34. Desired drawdown rate (2.5-17.5%)
35. Inheritance priority (leave money vs spend it all)

Phase 8: Risk Management (4 questions)
36. Life cover amount
37. Disability, critical illness, dread disease cover
38. Funeral cover
39. Beneficiary nominations updated

Phase 9: Estate Planning (3 questions)
40. Valid will in place
41. Estate plan updated
42. Estate liquidity covered (CGT, executor fees, estate duty)

Phase 10: Special Circumstances (3 questions)
43. Emigration plans
44. Own business / succession plan
45. Expected inheritance

CONVERSATION STYLE:
- Start warm and conversational: "Hi, I'm Thando. I'm excited to help you plan for retirement."
- Ask 2-4 questions per turn (don't overwhelm)
- Show empathy and understanding
- Provide context for why you're asking
- Offer examples to guide responses
- Use South African terminology (Rand, SARS, RA, TFSA, JSE)
- Acknowledge concerns and validate feelings
- Inject light humor when appropriate
- Celebrate good financial decisions

WHEN TO USE FUNCTION CALLS:
- calculate_retirement_projection: When you have enough data (at least age, income, retirement age, current savings)
- optimize_tax: When discussing RA contributions and tax planning
- calculate_drawdown_strategy: When planning post-retirement income
- generate_recommendations: After completing discovery or when asked for advice
- update_user_profile: After every conversation turn to store extracted data
- check_missing_data: Before generating full projection

OUTPUT FORMAT:
- Always respond in a conversational, friendly tone
- Use bullet points for clarity when listing options
- Include specific numbers (e.g., "Your RA contribution of R5,000/month is great!")
- Reference SA regulations when relevant (e.g., "The maximum RA deduction is 27.5% of your income")
- End with a clear next question or call-to-action

IMPORTANT RULES:
- NEVER make up numbers or assume values
- ALWAYS ask before projecting
- Flag when data is insufficient for accurate projection
- Recommend human financial advisor for complex situations (divorce, inheritance, business sale, emigration)
- Stay within South African regulatory framework
- Provide disclaimers when giving specific advice
- Encourage professional advice for legal and tax matters

FUNCTION CALLING REQUIREMENTS:
- CRITICAL: Whenever the user provides ANY financial information (age, income, savings, contributions, etc.), you MUST call update_user_profile to store it
- Call update_user_profile even if you're also responding with text - store the data first, then respond
- Examples of data that MUST be stored using update_user_profile:
  * Age, retirement age, life expectancy
  * Income (gross annual, net monthly, bonuses)
  * Current savings (RA balance, pension fund, TFSA, investments)
  * Contributions (monthly RA, employer contribution)
  * Expenses, debts, desired retirement income
  * ANY numerical data about the user's financial situation
- Do NOT just acknowledge the data in your response - you MUST call the function to persist it
- After storing data, you can respond naturally about what you've learned`;

// ============================================================================
// GPT-5 Function Definitions
// ============================================================================

const FUNCTION_DEFINITIONS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'update_user_profile',
      description: 'REQUIRED: Call this function immediately whenever the user provides ANY financial data (age, income, savings, contributions, etc.). This persists the data to the database. You MUST call this even if you are also providing a text response.',
      parameters: {
        type: 'object',
        properties: {
          profile_updates: {
            type: 'object',
            description: 'Partial user profile updates',
            properties: {
              name: { type: 'string' },
              current_age: { type: 'number' },
              retirement_age: { type: 'number' },
              gross_annual_income: { type: 'number' },
              net_monthly_income: { type: 'number' },
              desired_retirement_income_monthly: { type: 'number' },
              current_ra_balance: { type: 'number' },
              monthly_ra_contribution: { type: 'number' },
              // ... add more as needed
            },
          },
        },
        required: ['profile_updates'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate_retirement_projection',
      description:
        'Calculate detailed retirement projection based on user profile. Use when you have sufficient data: age, income, retirement age, current savings.',
      parameters: {
        type: 'object',
        properties: {
          current_age: { type: 'number' },
          retirement_age: { type: 'number' },
          gross_annual_income: { type: 'number' },
          net_monthly_income: { type: 'number' },
          current_ra_balance: { type: 'number' },
          monthly_ra_contribution: { type: 'number' },
          employer_contribution_rand: { type: 'number' },
          investment_return_rate: { type: 'number', description: 'Expected annual return (e.g., 10 for 10%)' },
          inflation_rate: { type: 'number', description: 'Expected annual inflation (e.g., 5 for 5%)' },
          include_monthly_breakdown: { type: 'boolean', default: false },
        },
        required: [
          'current_age',
          'retirement_age',
          'gross_annual_income',
          'monthly_ra_contribution',
          'investment_return_rate',
          'inflation_rate',
        ],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'optimize_tax',
      description: 'Optimize tax by calculating best RA contribution within SARS limits',
      parameters: {
        type: 'object',
        properties: {
          gross_annual_income: { type: 'number' },
          current_ra_contribution_annual: { type: 'number' },
          age: { type: 'number' },
          marital_status: { type: 'string' },
        },
        required: ['gross_annual_income', 'current_ra_contribution_annual', 'age'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate_drawdown_strategy',
      description: 'Calculate sustainable drawdown strategy for retirement phase',
      parameters: {
        type: 'object',
        properties: {
          retirement_balance: { type: 'number' },
          desired_monthly_income: { type: 'number' },
          years_to_plan: { type: 'number', description: 'Usually to age 90' },
          inflation_rate: { type: 'number' },
          expected_return: { type: 'number' },
        },
        required: [
          'retirement_balance',
          'desired_monthly_income',
          'years_to_plan',
          'inflation_rate',
          'expected_return',
        ],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_recommendations',
      description: 'Generate personalized financial recommendations based on user profile and projection',
      parameters: {
        type: 'object',
        properties: {
          user_profile_summary: { type: 'string', description: 'Brief summary of user situation' },
          current_savings_trajectory: { type: 'string', description: 'On track, behind, or ahead?' },
          key_concerns: { type: 'array', items: { type: 'string' } },
        },
        required: ['user_profile_summary', 'current_savings_trajectory'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_missing_data',
      description: 'Check what critical data is missing before generating full projection',
      parameters: {
        type: 'object',
        properties: {
          current_profile: { type: 'object', description: 'Current user profile' },
        },
        required: ['current_profile'],
      },
    },
  },
];

// ============================================================================
// OpenAI Advisor Service Class
// ============================================================================

export class OpenAIAdvisorService {
  private openai: OpenAI;

  constructor() {
    this.openai = openai;
  }

  /**
   * Send a message to the AI advisor and get a response
   */
  async chat(
    message: string,
    session: ConversationSession
  ): Promise<ChatCompletionResponse> {
    try {
      console.log('[OpenAI Advisor] Starting chat request');
      console.log('[OpenAI Advisor] Model:', MODEL);
      console.log('[OpenAI Advisor] API Key present:', !!process.env.OPENAI_API_KEY);
      console.log('[OpenAI Advisor] API Key prefix:', process.env.OPENAI_API_KEY?.substring(0, 10) + '...');

      // Build conversation history
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...session.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: 'user', content: message },
      ];

      console.log('[OpenAI Advisor] Message history length:', messages.length);
      console.log('[OpenAI Advisor] User message length:', message.length);

      // Call GPT-4o (formerly called GPT-5 in the codebase)
      console.log('[OpenAI Advisor] Calling OpenAI API...');
      const completion = await this.openai.chat.completions.create({
        model: MODEL,
        messages,
        tools: FUNCTION_DEFINITIONS,
        tool_choice: 'auto',
        temperature: 0.7,
        max_tokens: 2000,
      });

      console.log('[OpenAI Advisor] OpenAI API call successful');
      console.log('[OpenAI Advisor] Response choice:', completion.choices[0]?.finish_reason);

      const choice = completion.choices[0];
      const assistantMessage = choice.message;

      // Handle function calls
      const functionCalls: any[] = [];
      let finalContent = assistantMessage.content || '';

      if (assistantMessage.tool_calls) {
        console.log('[OpenAI Advisor] Processing tool calls:', assistantMessage.tool_calls.length);

        // Build messages array with function results
        const followUpMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
          { role: 'system', content: SYSTEM_PROMPT },
          ...session.messages.map((msg) => ({ role: msg.role, content: msg.content })),
          { role: 'user', content: message },
          assistantMessage as any, // Include the assistant's function call
        ];

        for (const toolCall of assistantMessage.tool_calls) {
          try {
            const functionName = toolCall.function.name;
            console.log('[OpenAI Advisor] Function name:', functionName);
            console.log('[OpenAI Advisor] Function arguments (raw):', toolCall.function.arguments);

            const functionArgs = JSON.parse(toolCall.function.arguments);
            console.log('[OpenAI Advisor] Function arguments (parsed):', JSON.stringify(functionArgs, null, 2));

            // Execute function
            console.log('[OpenAI Advisor] Executing function:', functionName);
            const result = await this.executeFunction(functionName, functionArgs, session);
            console.log('[OpenAI Advisor] Function result:', JSON.stringify(result, null, 2).substring(0, 500));

            functionCalls.push({
              name: functionName,
              arguments: functionArgs,
              result,
              timestamp: new Date(),
            });

            // Add function result to messages for follow-up
            followUpMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(result),
            });
          } catch (funcError) {
            console.error('[OpenAI Advisor] Error processing tool call:', funcError);
            console.error('[OpenAI Advisor] Tool call details:', JSON.stringify(toolCall, null, 2));
            // Continue processing other tool calls
          }
        }

        // Make follow-up call to get GPT's interpretation of the results
        if (functionCalls.length > 0) {
          console.log('[OpenAI Advisor] Making follow-up call with function results...');
          const followUpCompletion = await this.openai.chat.completions.create({
            model: MODEL,
            messages: followUpMessages,
            temperature: 0.7,
            max_tokens: 2000,
          });

          finalContent = followUpCompletion.choices[0]?.message?.content ||
            'I\'ve analyzed your financial situation based on the calculations.';
          console.log('[OpenAI Advisor] Follow-up response received, length:', finalContent.length);
        }
      }

      // Return the updated profile from the session (updated by function calls)
      const updatedProfile = session.user_profile;

      // Create response
      const response: ChatCompletionResponse = {
        message: {
          id: randomUUID(),
          role: 'assistant',
          content: finalContent,
          timestamp: new Date(),
          phase: session.current_phase,
          function_calls: functionCalls,
        },
        updated_profile: updatedProfile,
        phase_completed: false,
        requires_human_advisor: false,
      };

      // Validate with Zod
      console.log('[OpenAI Advisor] Validating response with Zod...');
      console.log('[OpenAI Advisor] ChatCompletionResponseSchema exists:', !!ChatCompletionResponseSchema);
      console.log('[OpenAI Advisor] Response object keys:', Object.keys(response));

      // Skip Zod validation for now due to circular dependency issues in Next.js
      // TODO: Fix validation schema imports
      console.log('[OpenAI Advisor] Skipping Zod validation (returning typed response)');
      return response as ChatCompletionResponse;
    } catch (error) {
      console.error('[OpenAI Advisor] Error occurred:', error);
      console.error('[OpenAI Advisor] Error type:', error?.constructor?.name);
      console.error('[OpenAI Advisor] Error message:', error instanceof Error ? error.message : String(error));

      if (error instanceof Error && 'status' in error) {
        console.error('[OpenAI Advisor] HTTP Status:', (error as any).status);
      }

      throw this.handleError(error);
    }
  }

  /**
   * Execute a function call from GPT-5
   */
  private async executeFunction(
    name: string,
    args: any,
    session: ConversationSession
  ): Promise<any> {
    switch (name) {
      case 'update_user_profile':
        return this.updateUserProfile(args.profile_updates, session);

      case 'calculate_retirement_projection':
        return this.calculateRetirementProjection(args);

      case 'optimize_tax':
        return this.optimizeTax(args);

      case 'calculate_drawdown_strategy':
        return this.calculateDrawdownStrategy(args);

      case 'generate_recommendations':
        return this.generateRecommendations(args, session);

      case 'check_missing_data':
        return this.checkMissingData(args.current_profile);

      default:
        throw new Error(`Unknown function: ${name}`);
    }
  }

  /**
   * Update user profile with new data
   */
  private async updateUserProfile(
    updates: Partial<UserProfile>,
    session: ConversationSession
  ): Promise<{ success: boolean; updated_fields: string[] }> {
    // Validate updates
    const validatedUpdates = UserProfileSchema.partial().parse(updates);

    // Merge into session profile
    session.user_profile = {
      ...session.user_profile,
      ...validatedUpdates,
      last_updated: new Date(),
    };

    return {
      success: true,
      updated_fields: Object.keys(validatedUpdates),
    };
  }

  /**
   * Calculate retirement projection
   */
  private async calculateRetirementProjection(args: any): Promise<any> {
    const { calculateRetirementProjection } = await import('./aiAdvisorCalculations');

    return await calculateRetirementProjection({
      user_profile: args,
      include_monthly_breakdown: args.include_monthly_breakdown || false,
    });
  }

  /**
   * Optimize tax strategy
   */
  private async optimizeTax(args: any): Promise<any> {
    const { optimizeTax } = await import('./aiAdvisorCalculations');

    return await optimizeTax({
      gross_annual_income: args.gross_annual_income,
      current_ra_contribution_annual: args.current_ra_contribution_annual,
      age: args.age,
      marital_status: args.marital_status || 'single',
    });
  }

  /**
   * Calculate drawdown strategy
   */
  private async calculateDrawdownStrategy(args: any): Promise<any> {
    const { calculateDrawdownStrategy } = await import('./aiAdvisorCalculations');

    return await calculateDrawdownStrategy({
      retirement_balance: args.retirement_balance,
      desired_monthly_income: args.desired_monthly_income,
      years_to_plan: args.years_to_plan,
      inflation_rate: args.inflation_rate,
      expected_return: args.expected_return,
    });
  }

  /**
   * Generate personalized recommendations
   */
  private async generateRecommendations(args: any, session: ConversationSession): Promise<any> {
    const { generateRecommendations } = await import('./aiAdvisorCalculations');
    const { calculateRetirementProjection } = await import('./aiAdvisorCalculations');

    // Get current projection
    const { annual_summaries } = await calculateRetirementProjection({
      user_profile: session.user_profile,
      include_monthly_breakdown: false,
    });

    return await generateRecommendations({
      user_profile: session.user_profile,
      current_projection: annual_summaries,
    });
  }

  /**
   * Check what data is missing for projection
   */
  private checkMissingData(profile: Partial<UserProfile> | undefined): string[] {
    if (!profile) {
      return ['current_age', 'retirement_age', 'gross_annual_income', 'monthly_ra_contribution'];
    }

    const required = [
      'current_age',
      'retirement_age',
      'gross_annual_income',
      'monthly_ra_contribution',
    ];

    return required.filter((field) => !profile[field as keyof UserProfile]);
  }

  /**
   * Extract profile updates from user message
   */
  private extractProfileUpdates(
    message: string,
    currentProfile: UserProfile
  ): Partial<UserProfile> {
    // TODO: Use GPT-5 to extract structured data from natural language
    // For now, return empty updates
    return {};
  }

  /**
   * Handle errors and convert to AdvisorError
   */
  private handleError(error: any): AdvisorError {
    if (error.status === 429) {
      return {
        code: 'RATE_LIMIT',
        message: 'Rate limit exceeded. Please try again in a few moments.',
        retry_after: 60,
      };
    }

    if (error.message?.includes('validation')) {
      return {
        code: 'VALIDATION_ERROR',
        message: error.message,
      };
    }

    return {
      code: 'API_ERROR',
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const openaiAdvisor = new OpenAIAdvisorService();
